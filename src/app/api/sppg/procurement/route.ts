/**
 * @fileoverview Procurement Orders API endpoints - Main CRUD operations
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Enterprise Development Guidelines
 * 
 * RBAC Integration:
 * - GET: Protected by withSppgAuth
 * - POST: Protected by withSppgAuth
 * - Automatic audit logging
 * - Permission: PROCUREMENT_VIEW, PROCUREMENT_MANAGE
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { hasPermission } from '@/lib/permissions'
import { UserRole } from '@prisma/client'
import { 
  procurementCreateSchema, 
  procurementFiltersSchema
} from '@/features/sppg/procurement/schemas'

// ================================ GET /api/sppg/procurement ================================

/**
 * GET /api/sppg/procurement
 * @rbac Protected by withSppgAuth
 * @audit Automatic logging
 * @security Requires PROCUREMENT_VIEW permission
 * @query {ProcurementFilters} Pagination and filtering parameters
 * @returns {Promise<Response>} List of procurement orders
 */
export async function GET(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      // Permission Check
      if (!session.user.userRole || !hasPermission(session.user.userRole as UserRole, 'READ')) {
        return NextResponse.json({ 
          success: false, 
          error: 'Insufficient permissions' 
        }, { status: 403 })
      }

      // Parse and validate query parameters
      const url = new URL(request.url)
      const queryParams = Object.fromEntries(url.searchParams)
      
      // Convert string values to appropriate types
      const processedParams = {
        ...queryParams,
        page: queryParams.page ? parseInt(queryParams.page) : undefined,
        limit: queryParams.limit ? parseInt(queryParams.limit) : undefined,
        minAmount: queryParams.minAmount ? parseFloat(queryParams.minAmount) : undefined,
        maxAmount: queryParams.maxAmount ? parseFloat(queryParams.maxAmount) : undefined,
        dateFrom: queryParams.dateFrom ? new Date(queryParams.dateFrom) : undefined,
        dateTo: queryParams.dateTo ? new Date(queryParams.dateTo) : undefined,
        status: queryParams.status ? queryParams.status.split(',') : undefined,
        deliveryStatus: queryParams.deliveryStatus ? queryParams.deliveryStatus.split(',') : undefined,
        paymentStatus: queryParams.paymentStatus ? queryParams.paymentStatus.split(',') : undefined,
        purchaseMethod: queryParams.purchaseMethod ? queryParams.purchaseMethod.split(',') : undefined,
      }

      const filters = procurementFiltersSchema.parse(processedParams)

      // Build database query with multi-tenant filtering
      const where = {
        // Multi-tenant: Only get procurements from user's SPPG
      sppgId: session.user.sppgId!,
      
      // Apply filters
      ...(filters.search && {
        OR: [
          { procurementCode: { contains: filters.search, mode: 'insensitive' as const } },
          { receiptNumber: { contains: filters.search, mode: 'insensitive' as const } },
          { invoiceNumber: { contains: filters.search, mode: 'insensitive' as const } }
        ]
      }),
      ...(filters.status && { status: { in: filters.status } }),
      ...(filters.deliveryStatus && { deliveryStatus: { in: filters.deliveryStatus } }),
      ...(filters.paymentStatus && { paymentStatus: { in: filters.paymentStatus } }),
      ...(filters.supplierId && { supplierId: filters.supplierId }),
      ...(filters.planId && { planId: filters.planId }),
      ...(filters.dateFrom && {
        procurementDate: { gte: filters.dateFrom }
      }),
      ...(filters.dateTo && {
        procurementDate: { lte: filters.dateTo }
      }),
      ...(filters.minAmount && {
        totalAmount: { gte: filters.minAmount }
      }),
      ...(filters.maxAmount && {
        totalAmount: { lte: filters.maxAmount }
      }),
      ...(filters.purchaseMethod && { purchaseMethod: { in: filters.purchaseMethod } })
    } as const

    // 5. Execute queries with pagination
    const [procurements, total] = await Promise.all([
      db.procurement.findMany({
        where,
        include: {
          sppg: {
            select: {
              id: true,
              name: true
            }
          },
          plan: {
            select: {
              id: true,
              planName: true,
              planMonth: true
            }
          },
          supplier: {
            select: {
              id: true,
              supplierCode: true,
              supplierName: true,
              phone: true,
              overallRating: true
            }
          },
          items: {
            select: {
              id: true,
              itemName: true,
              orderedQuantity: true,
              receivedQuantity: true,
              unit: true,
              finalPrice: true,
              isAccepted: true
            }
          }
        },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        orderBy: {
          [filters.sortBy]: filters.sortOrder
        }
      }),
      db.procurement.count({ where })
    ])

    // 6. Transform response with computed fields
    const transformedProcurements = procurements.map(procurement => {
      const totalItems = procurement.items.length
      const totalQuantity = procurement.items.reduce((sum, item) => sum + item.orderedQuantity, 0)
      const averageItemPrice = totalItems > 0 ? procurement.subtotalAmount / totalItems : 0

      return {
        ...procurement,
        totalItems,
        totalQuantity,
        averageItemPrice: Math.round(averageItemPrice * 100) / 100
      }
    })

    // 7. Success response with pagination
    return NextResponse.json({
      success: true,
      data: transformedProcurements,
      pagination: {
        total,
        page: filters.page,
        pageSize: filters.limit,
        totalPages: Math.ceil(total / filters.limit)
      }
    })

    } catch (error) {
      // Validation error
      if (error instanceof Error && error.name === 'ZodError') {
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid query parameters',
          details: error 
        }, { status: 400 })
      }

      // Internal server error
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch procurements',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, { status: 500 })
    }
  })
}

// ================================ POST /api/sppg/procurement ================================

/**
 * POST /api/sppg/procurement
 * @rbac Protected by withSppgAuth
 * @audit Automatic logging
 * @security Requires PROCUREMENT_MANAGE permission
 * @body {ProcurementCreateInput} Procurement order data
 * @returns {Promise<Response>} Created procurement order
 */
export async function POST(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      // Permission Check
      if (!session.user.userRole || !hasPermission(session.user.userRole as UserRole, 'PROCUREMENT_MANAGE')) {
        return NextResponse.json({ 
          success: false, 
          error: 'Insufficient permissions' 
        }, { status: 403 })
      }

      // Parse and validate request body
      const body = await request.json()
      const validated = procurementCreateSchema.parse(body)

      // Verify plan belongs to SPPG if planId provided
    if (validated.planId) {
      const plan = await db.procurementPlan.findFirst({
        where: {
          id: validated.planId,
          sppgId: session.user.sppgId!,
          approvalStatus: 'APPROVED' // Only approved plans
        }
      })

      if (!plan) {
        return NextResponse.json({ 
          success: false, 
          error: 'Procurement plan not found, not approved, or does not belong to your SPPG' 
        }, { status: 404 })
      }

      // Check if budget is available
      if (plan.remainingBudget < validated.totalAmount) {
        return NextResponse.json({ 
          success: false, 
          error: `Insufficient budget. Available: Rp ${plan.remainingBudget.toLocaleString()}, Required: Rp ${validated.totalAmount.toLocaleString()}` 
        }, { status: 400 })
      }
    }

    // Verify supplier belongs to SPPG and is active
    const supplier = await db.supplier.findFirst({
      where: {
        id: validated.supplierId,
        sppgId: session.user.sppgId!,
        isActive: true,
        isBlacklisted: false
      }
    })

    if (!supplier) {
      return NextResponse.json({ 
        success: false, 
        error: 'Supplier not found, inactive, or blacklisted' 
      }, { status: 404 })
    }

    // Generate unique procurement code
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    
    // Get count of procurements this month
    const count = await db.procurement.count({
      where: {
        sppgId: session.user.sppgId!,
        procurementDate: {
          gte: new Date(year, now.getMonth(), 1),
          lt: new Date(year, now.getMonth() + 1, 1)
        }
      }
    })

    const procurementCode = `PRO-${year}${month}-${String(count + 1).padStart(4, '0')}`

    // 8. Create procurement with items in a transaction
    const procurement = await db.$transaction(async (tx) => {
      // Create procurement
      const newProcurement = await tx.procurement.create({
        data: {
          sppgId: session.user.sppgId!, // Null check already done in step 2
          planId: validated.planId,
          procurementCode,
          procurementDate: validated.procurementDate,
          expectedDelivery: validated.expectedDelivery,
          supplierId: validated.supplierId,
          purchaseMethod: validated.purchaseMethod,
          paymentTerms: validated.paymentTerms,
          subtotalAmount: validated.subtotalAmount,
          taxAmount: validated.taxAmount || 0,
          discountAmount: validated.discountAmount || 0,
          shippingCost: validated.shippingCost || 0,
          totalAmount: validated.totalAmount,
          paymentDue: validated.paymentDue,
          deliveryMethod: validated.deliveryMethod,
          transportCost: validated.transportCost,
          packagingType: validated.packagingType,
          status: 'DRAFT',
          deliveryStatus: 'ORDERED',
          paymentStatus: 'UNPAID'
        }
      })

      // Create procurement items
      await tx.procurementItem.createMany({
        data: validated.items.map(item => ({
          procurementId: newProcurement.id,
          inventoryItemId: item.inventoryItemId,
          itemName: item.itemName,
          itemCode: item.itemCode,
          category: item.category,
          brand: item.brand,
          orderedQuantity: item.orderedQuantity,
          unit: item.unit,
          pricePerUnit: item.pricePerUnit,
          totalPrice: item.totalPrice,
          discountPercent: item.discountPercent || 0,
          discountAmount: item.discountAmount || 0,
          finalPrice: item.finalPrice,
          qualityStandard: item.qualityStandard,
          gradeRequested: item.gradeRequested,
          expiryDate: item.expiryDate,
          storageRequirement: item.storageRequirement,
          notes: item.notes,
          isAccepted: true,
          returnedQuantity: 0
        }))
      })

      // Update plan budget if linked
      if (validated.planId) {
        await tx.procurementPlan.update({
          where: { id: validated.planId },
          data: {
            allocatedBudget: { increment: validated.totalAmount },
            remainingBudget: { decrement: validated.totalAmount }
          }
        })
      }

      // Update supplier statistics
      await tx.supplier.update({
        where: { id: validated.supplierId },
        data: {
          totalOrders: { increment: 1 }
        }
      })

      return newProcurement
    })

    // 9. Fetch full procurement with relations
    const fullProcurement = await db.procurement.findUnique({
      where: { id: procurement.id },
      include: {
        sppg: {
          select: {
            id: true,
            name: true
          }
        },
        plan: {
          select: {
            id: true,
            planName: true
          }
        },
        supplier: {
          select: {
            id: true,
            supplierCode: true,
            supplierName: true,
            phone: true
          }
        },
        items: true
      }
    })

    // 10. Success response
    return NextResponse.json({
      success: true,
      data: fullProcurement,
      message: 'Procurement order created successfully'
    }, { status: 201 })

    } catch (error) {
      // Validation error
      if (error instanceof Error && error.name === 'ZodError') {
        return NextResponse.json({ 
          success: false, 
          error: 'Validation failed',
          details: error 
        }, { status: 400 })
      }

      // Prisma error
      if (error && typeof error === 'object' && 'code' in error) {
        if (error.code === 'P2002') {
          return NextResponse.json({ 
            success: false, 
            error: 'Procurement with this code already exists' 
          }, { status: 409 })
        }
      }

      // Internal server error
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create procurement',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, { status: 500 })
    }
  })
}
