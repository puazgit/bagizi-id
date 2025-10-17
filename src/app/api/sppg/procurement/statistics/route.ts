/**
 * @fileoverview Procurement Statistics & Analytics API endpoint
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Enterprise Development Guidelines
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { ProcurementStatus } from '@prisma/client'

// ================================ GET /api/sppg/procurement/statistics ================================

export async function GET(request: NextRequest) {
  try {
    // 1. Authentication Check
    const session = await auth()
    if (!session?.user) {
      return Response.json({ 
        success: false, 
        error: 'Unauthorized - Login required' 
      }, { status: 401 })
    }

    // 2. SPPG Access Check (Multi-tenancy - CRITICAL!)
    if (!session.user.sppgId) {
      return Response.json({ 
        success: false, 
        error: 'SPPG access required' 
      }, { status: 403 })
    }

    // 3. Parse query parameters for date filtering
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'current_year' // current_year, last_12_months, last_6_months, last_3_months, current_month

    // Calculate date range
    const now = new Date()
    let startDate: Date
    
    switch (period) {
      case 'current_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'last_3_months':
        startDate = new Date(now.setMonth(now.getMonth() - 3))
        break
      case 'last_6_months':
        startDate = new Date(now.setMonth(now.getMonth() - 6))
        break
      case 'last_12_months':
        startDate = new Date(now.setMonth(now.getMonth() - 12))
        break
      case 'current_year':
      default:
        startDate = new Date(now.getFullYear(), 0, 1)
        break
    }

    // 4. Fetch data for statistics (multi-tenant filtered)
    const [
      procurements,
      procurementPlans,
      suppliers,
      totalInventoryItems
    ] = await Promise.all([
      // Get all procurements
      db.procurement.findMany({
        where: {
          sppgId: session.user.sppgId,
          procurementDate: {
            gte: startDate
          }
        },
        include: {
          items: {
            select: {
              orderedQuantity: true,
              receivedQuantity: true,
              gradeReceived: true,
              pricePerUnit: true,
              category: true,
              inventoryItem: {
                select: {
                  itemName: true,
                  category: true
                }
              }
            }
          },
          supplier: {
            select: {
              id: true,
              supplierName: true,
              supplierType: true,
              overallRating: true
            }
          }
        }
      }),
      
      // Get procurement plans
      db.procurementPlan.findMany({
        where: {
          sppgId: session.user.sppgId,
          createdAt: {
            gte: startDate
          }
        }
      }),
      
      // Get all suppliers
      db.supplier.findMany({
        where: {
          sppgId: session.user.sppgId,
          isActive: true
        }
      }),
      
      // Get total inventory items count
      db.inventoryItem.count({
        where: {
          sppgId: session.user.sppgId
        }
      })
    ])

    // 5. Calculate Statistics

    // 5.1 Overview Statistics
    const overview = {
      totalProcurements: procurements.length,
      totalProcurementValue: procurements.reduce((sum, p) => sum + p.totalAmount, 0),
      totalProcurementPlans: procurementPlans.length,
      totalSuppliers: suppliers.length,
      totalInventoryItems,
      period
    }

    // 5.2 Status Breakdown
    const statusBreakdown = {
      draft: procurements.filter(p => p.status === ProcurementStatus.DRAFT).length,
      pendingApproval: procurements.filter(p => p.status === ProcurementStatus.PENDING_APPROVAL).length,
      approved: procurements.filter(p => p.status === ProcurementStatus.APPROVED).length,
      ordered: procurements.filter(p => p.status === ProcurementStatus.ORDERED).length,
      partiallyReceived: procurements.filter(p => p.status === ProcurementStatus.PARTIALLY_RECEIVED).length,
      fullyReceived: procurements.filter(p => p.status === ProcurementStatus.FULLY_RECEIVED).length,
      completed: procurements.filter(p => p.status === ProcurementStatus.COMPLETED).length,
      cancelled: procurements.filter(p => p.status === ProcurementStatus.CANCELLED).length
    }

    // 5.3 Delivery Status (string-based)
    const deliveryStats = {
      ordered: procurements.filter(p => p.deliveryStatus === 'ORDERED').length,
      confirmed: procurements.filter(p => p.deliveryStatus === 'CONFIRMED').length,
      shipped: procurements.filter(p => p.deliveryStatus === 'SHIPPED').length,
      delivered: procurements.filter(p => p.deliveryStatus === 'DELIVERED').length,
      cancelled: procurements.filter(p => p.deliveryStatus === 'CANCELLED').length,
      onTimeRate: procurements.length > 0 
        ? Math.round((procurements.filter(p => p.deliveryStatus === 'DELIVERED').length / procurements.length) * 100)
        : 0
    }

    // 5.4 Payment Status (string-based)
    const paymentStats = {
      unpaid: procurements.filter(p => p.paymentStatus === 'UNPAID').length,
      partial: procurements.filter(p => p.paymentStatus === 'PARTIAL').length,
      paid: procurements.filter(p => p.paymentStatus === 'PAID').length,
      overdue: procurements.filter(p => p.paymentStatus === 'OVERDUE').length,
      totalPaid: procurements.filter(p => p.paymentStatus === 'PAID').length
    }

    // 5.5 Category Breakdown
    const categoryMap = new Map<string, { count: number; totalValue: number }>()
    
    procurements.forEach(procurement => {
      procurement.items.forEach(item => {
        const category = item.inventoryItem?.category || item.category
        const current = categoryMap.get(category) || { count: 0, totalValue: 0 }
        categoryMap.set(category, {
          count: current.count + 1,
          totalValue: current.totalValue + (item.pricePerUnit * item.orderedQuantity)
        })
      })
    })

    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        itemCount: data.count,
        totalValue: Math.round(data.totalValue),
        percentage: overview.totalProcurementValue > 0 
          ? Math.round((data.totalValue / overview.totalProcurementValue) * 100)
          : 0
      }))
      .sort((a, b) => b.totalValue - a.totalValue)

    // 5.6 Top Suppliers
    const supplierMap = new Map<string, { 
      supplierId: string
      supplierName: string
      orderCount: number
      totalValue: number
      rating: number
    }>()

    procurements.forEach(procurement => {
      const current = supplierMap.get(procurement.supplierId) || {
        supplierId: procurement.supplierId,
        supplierName: procurement.supplier.supplierName,
        orderCount: 0,
        totalValue: 0,
        rating: procurement.supplier.overallRating
      }
      
      supplierMap.set(procurement.supplierId, {
        ...current,
        orderCount: current.orderCount + 1,
        totalValue: current.totalValue + procurement.totalAmount
      })
    })

    const topSuppliers = Array.from(supplierMap.values())
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 10)
      .map(s => ({
        ...s,
        totalValue: Math.round(s.totalValue),
        averageOrderValue: Math.round(s.totalValue / s.orderCount)
      }))

    // 5.7 Monthly Trend (last 12 months or within date range)
    const monthlyMap = new Map<string, { count: number; totalValue: number }>()
    
    procurements.forEach(procurement => {
      const monthKey = new Date(procurement.procurementDate).toISOString().slice(0, 7) // YYYY-MM
      const current = monthlyMap.get(monthKey) || { count: 0, totalValue: 0 }
      monthlyMap.set(monthKey, {
        count: current.count + 1,
        totalValue: current.totalValue + procurement.totalAmount
      })
    })

    const monthlyTrend = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month,
        procurementCount: data.count,
        totalValue: Math.round(data.totalValue)
      }))
      .sort((a, b) => a.month.localeCompare(b.month))

    // 5.8 Budget Utilization
    const totalBudget = procurementPlans.reduce((sum, plan) => sum + plan.totalBudget, 0)
    const totalSpent = overview.totalProcurementValue
    const budgetUtilization = {
      totalBudget: Math.round(totalBudget),
      totalSpent: Math.round(totalSpent),
      remaining: Math.round(totalBudget - totalSpent),
      utilizationRate: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0
    }

    // 5.9 Procurement Method Distribution
    const methodBreakdown = {
      direct: procurements.filter(p => p.purchaseMethod === 'DIRECT').length,
      tender: procurements.filter(p => p.purchaseMethod === 'TENDER').length,
      contract: procurements.filter(p => p.purchaseMethod === 'CONTRACT').length,
      emergency: procurements.filter(p => p.purchaseMethod === 'EMERGENCY').length,
      bulk: procurements.filter(p => p.purchaseMethod === 'BULK').length
    }

    // 5.10 Quality Metrics
    let totalItemsReceived = 0
    let goodQualityItems = 0
    let acceptableQualityItems = 0
    let poorQualityItems = 0
    let rejectedItems = 0

    procurements.forEach(procurement => {
      procurement.items.forEach(item => {
        totalItemsReceived += (item.receivedQuantity || 0)
        switch (item.gradeReceived) {
          case 'EXCELLENT':
          case 'GOOD':
            goodQualityItems += (item.receivedQuantity || 0)
            break
          case 'ACCEPTABLE':
            acceptableQualityItems += (item.receivedQuantity || 0)
            break
          case 'POOR':
            poorQualityItems += (item.receivedQuantity || 0)
            break
          case 'REJECTED':
            rejectedItems += (item.receivedQuantity || 0)
            break
        }
      })
    })

    const qualityMetrics = {
      totalItemsReceived,
      goodQualityItems,
      acceptableQualityItems,
      poorQualityItems,
      rejectedItems,
      acceptanceRate: totalItemsReceived > 0 
        ? Math.round(((goodQualityItems + acceptableQualityItems) / totalItemsReceived) * 100)
        : 0,
      rejectionRate: totalItemsReceived > 0 
        ? Math.round((rejectedItems / totalItemsReceived) * 100)
        : 0
    }

    // 5.11 Average Lead Time
    const completedProcurements = procurements.filter(p => 
      p.status === ProcurementStatus.COMPLETED || p.status === ProcurementStatus.FULLY_RECEIVED
    )
    
    const totalLeadTime = completedProcurements.reduce((sum, p) => {
      if (p.expectedDelivery && p.actualDelivery) {
        const leadTime = Math.ceil(
          (new Date(p.actualDelivery).getTime() - new Date(p.procurementDate).getTime()) / (1000 * 60 * 60 * 24)
        )
        return sum + leadTime
      }
      return sum
    }, 0)

    const averageLeadTime = completedProcurements.length > 0 
      ? Math.round(totalLeadTime / completedProcurements.length)
      : 0

    // 6. Success response
    return Response.json({
      success: true,
      data: {
        overview,
        statusBreakdown,
        deliveryStats,
        paymentStats,
        categoryBreakdown,
        topSuppliers,
        monthlyTrend,
        budgetUtilization,
        methodBreakdown,
        qualityMetrics,
        performanceMetrics: {
          averageLeadTime,
          completionRate: procurements.length > 0 
            ? Math.round((completedProcurements.length / procurements.length) * 100)
            : 0,
          onTimeDeliveryRate: deliveryStats.onTimeRate
        },
        generatedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('GET /api/sppg/procurement/statistics error:', error)
    
    return Response.json({ 
      success: false, 
      error: 'Failed to fetch procurement statistics',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 })
  }
}
