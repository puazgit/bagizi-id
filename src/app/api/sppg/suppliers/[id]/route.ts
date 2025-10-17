/**
 * @fileoverview Individual Supplier API endpoints - GET, PUT, DELETE
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Enterprise Development Guidelines
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { supplierUpdateSchema } from '@/features/sppg/procurement/schemas'

// ================================ GET /api/sppg/suppliers/[id] ================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
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

    // 3. Fetch supplier with multi-tenant check
    const supplier = await db.supplier.findFirst({
      where: {
        id,
        sppgId: session.user.sppgId // CRITICAL: Ensure supplier belongs to user's SPPG
      },
      include: {
        sppg: {
          select: {
            id: true,
            name: true
          }
        },
        procurements: {
          select: {
            id: true,
            procurementCode: true,
            procurementDate: true,
            totalAmount: true,
            status: true,
            deliveryStatus: true,
            paymentStatus: true
          },
          orderBy: {
            procurementDate: 'desc'
          },
          take: 10 // Last 10 procurements
        },
        supplierEvaluations: {
          select: {
            id: true,
            evaluationType: true,
            evaluationPeriod: true,
            overallScore: true,
            evaluationDate: true
          },
          orderBy: {
            evaluationDate: 'desc'
          },
          take: 5
        },
        supplierContracts: {
          select: {
            id: true,
            contractNumber: true,
            contractType: true,
            contractStatus: true,
            startDate: true,
            endDate: true,
            contractValue: true
          },
          where: {
            contractStatus: { in: ['DRAFT', 'ACTIVE'] }
          },
          orderBy: {
            startDate: 'desc'
          }
        },
        supplierProducts: {
          select: {
            id: true,
            productCode: true,
            productName: true,
            category: true,
            pricePerUnit: true,
            isAvailable: true
          },
          where: {
            isAvailable: true
          },
          take: 20
        },
        _count: {
          select: {
            procurements: true,
            supplierEvaluations: true,
            supplierContracts: true,
            supplierProducts: true
          }
        }
      }
    })

    if (!supplier) {
      return Response.json({ 
        success: false, 
        error: 'Supplier not found or access denied' 
      }, { status: 404 })
    }

    // 4. Calculate statistics
    const totalActiveContracts = supplier.supplierContracts.length
    const averageOrderValue = supplier.totalOrders > 0 ? supplier.totalPurchaseValue / supplier.totalOrders : 0
    const lastOrderDate = supplier.procurements.length > 0 ? supplier.procurements[0].procurementDate : null
    
    // Performance score calculation
    const performanceScore = Math.round(
      (supplier.overallRating / 5 * 30) +
      (supplier.qualityRating / 5 * 25) +
      (supplier.deliveryRating / 5 * 25) +
      (supplier.serviceRating / 5 * 20)
    )

    // Recent performance trend
    const recentEvaluations = supplier.supplierEvaluations.slice(0, 3)
    const performanceTrend = recentEvaluations.length >= 2
      ? recentEvaluations[0].overallScore - recentEvaluations[recentEvaluations.length - 1].overallScore
      : 0

    // 5. Success response
    return Response.json({
      success: true,
      data: {
        ...supplier,
        totalActiveContracts,
        averageOrderValue: Math.round(averageOrderValue),
        lastOrderDate,
        performanceScore,
        performanceTrend: Math.round(performanceTrend * 100) / 100,
        // Remove sensitive data
        encryptedBankDetails: undefined,
        encryptedContracts: undefined
      }
    })

  } catch (error) {
    console.error('GET /api/sppg/suppliers/[id] error:', error)
    
    return Response.json({ 
      success: false, 
      error: 'Failed to fetch supplier',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 })
  }
}

// ================================ PUT /api/sppg/suppliers/[id] ================================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
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

    // 3. Verify supplier exists and belongs to SPPG
    const existingSupplier = await db.supplier.findFirst({
      where: {
        id,
        sppgId: session.user.sppgId
      }
    })

    if (!existingSupplier) {
      return Response.json({ 
        success: false, 
        error: 'Supplier not found or access denied' 
      }, { status: 404 })
    }

    // 4. Role Check - Only certain roles can edit
    const allowedRoles = [
      'SPPG_KEPALA',
      'SPPG_ADMIN',
      'SPPG_AKUNTAN'
    ]
    
    if (!session.user.userRole || !allowedRoles.includes(session.user.userRole)) {
      return Response.json({ 
        success: false, 
        error: 'Insufficient permissions' 
      }, { status: 403 })
    }

    // 5. Parse and validate request body
    const body = await request.json()
    const validated = supplierUpdateSchema.parse(body)

    // 6. Check for duplicate if name or phone changed
    if (validated.supplierName || validated.phone) {
      const duplicateSupplier = await db.supplier.findFirst({
        where: {
          sppgId: session.user.sppgId,
          id: { not: id },
          OR: [
            ...(validated.supplierName ? [{ supplierName: validated.supplierName }] : []),
            ...(validated.phone ? [{ phone: validated.phone }] : [])
          ]
        }
      })

      if (duplicateSupplier) {
        return Response.json({ 
          success: false, 
          error: 'Supplier with this name or phone already exists' 
        }, { status: 409 })
      }
    }

    // 7. Update supplier
    const updatedSupplier = await db.supplier.update({
      where: { id },
      data: validated,
      include: {
        sppg: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // 8. Success response
    return Response.json({
      success: true,
      data: {
        ...updatedSupplier,
        // Remove sensitive data
        encryptedBankDetails: undefined,
        encryptedContracts: undefined
      },
      message: 'Supplier updated successfully'
    })

  } catch (error) {
    console.error('PUT /api/sppg/suppliers/[id] error:', error)
    
    // Validation error
    if (error instanceof Error && error.name === 'ZodError') {
      return Response.json({ 
        success: false, 
        error: 'Validation failed',
        details: error 
      }, { status: 400 })
    }

    // Internal server error
    return Response.json({ 
      success: false, 
      error: 'Failed to update supplier',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 })
  }
}

// ================================ DELETE /api/sppg/suppliers/[id] ================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
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

    // 3. Role Check - Only admins can delete
    const allowedRoles = [
      'SPPG_KEPALA',
      'SPPG_ADMIN'
    ]
    
    if (!session.user.userRole || !allowedRoles.includes(session.user.userRole)) {
      return Response.json({ 
        success: false, 
        error: 'Insufficient permissions - Only admins can delete suppliers' 
      }, { status: 403 })
    }

    // 4. Verify supplier exists and belongs to SPPG
    const supplier = await db.supplier.findFirst({
      where: {
        id,
        sppgId: session.user.sppgId
      },
      include: {
        procurements: {
          select: {
            id: true,
            status: true
          }
        }
      }
    })

    if (!supplier) {
      return Response.json({ 
        success: false, 
        error: 'Supplier not found or access denied' 
      }, { status: 404 })
    }

    // 5. Check if supplier can be deleted (no completed procurements)
    const hasCompletedProcurements = supplier.procurements.some(
      p => p.status === 'COMPLETED' || p.status === 'FULLY_RECEIVED'
    )
    
    if (hasCompletedProcurements) {
      return Response.json({ 
        success: false, 
        error: 'Cannot delete supplier with completed procurements. Mark as inactive instead.' 
      }, { status: 403 })
    }

    // 6. Soft delete - mark as inactive and blacklisted instead of hard delete
    await db.supplier.update({
      where: { id },
      data: {
        isActive: false,
        isBlacklisted: true,
        blacklistReason: 'Supplier deleted by admin'
      }
    })

    // 7. Success response
    return Response.json({
      success: true,
      message: 'Supplier deactivated successfully'
    })

  } catch (error) {
    console.error('DELETE /api/sppg/suppliers/[id] error:', error)
    
    // Internal server error
    return Response.json({ 
      success: false, 
      error: 'Failed to delete supplier',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 })
  }
}
