/**
 * @fileoverview Procurement Receiving API endpoint - Quality control & acceptance
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Enterprise Development Guidelines
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { ProcurementStatus } from '@prisma/client'
import { z } from 'zod'

// Receiving schema for validation
const receivingSchema = z.object({
  items: z.array(z.object({
    itemId: z.string().cuid('Item ID harus valid'),
    receivedQuantity: z.number().min(0, 'Jumlah diterima tidak boleh negatif'),
    qualityReceived: z.string().max(200).optional(),
    gradeReceived: z.string().max(50).optional(),
    expiryDate: z.coerce.date().optional(),
    batchNumber: z.string().max(100).optional(),
    productionDate: z.coerce.date().optional(),
    isAccepted: z.boolean(),
    rejectionReason: z.string().min(10).max(500).optional(),
    returnedQuantity: z.number().min(0).default(0),
    notes: z.string().max(500).optional()
  })).min(1, 'Minimal 1 item harus direview'),
  
  actualDelivery: z.coerce.date().optional(),
  qualityGrade: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'REJECTED']).optional(),
  qualityNotes: z.string().max(500).optional(),
  receiptNumber: z.string().max(100).optional(),
  receiptPhoto: z.string().url().max(500).optional(),
  deliveryPhoto: z.string().url().max(500).optional(),
  acceptanceStatus: z.enum(['ACCEPTED', 'REJECTED', 'PARTIAL'])
}).refine((data) => {
  // If any item is rejected, rejection reason must be provided
  const hasRejectedItems = data.items.some(item => !item.isAccepted)
  if (hasRejectedItems) {
    return data.items.every(item => item.isAccepted || item.rejectionReason)
  }
  return true
}, {
  message: 'Alasan penolakan wajib diisi untuk item yang ditolak',
  path: ['items']
})

// ================================ PATCH /api/sppg/procurement/[id]/receive ================================

export async function PATCH(
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

    // 3. Role Check - Only certain roles can receive items
    const allowedRoles = [
      'SPPG_KEPALA',
      'SPPG_ADMIN',
      'SPPG_STAFF_QC',
      'SPPG_STAFF_ADMIN'
    ]
    
    if (!session.user.userRole || !allowedRoles.includes(session.user.userRole)) {
      return Response.json({ 
        success: false, 
        error: 'Insufficient permissions - Only authorized staff can receive items' 
      }, { status: 403 })
    }

    // 4. Verify procurement exists and belongs to SPPG
    const procurement = await db.procurement.findFirst({
      where: {
        id,
        sppgId: session.user.sppgId
      },
      include: {
        items: {
          include: {
            inventoryItem: {
              select: {
                id: true,
                itemName: true,
                currentStock: true,
                unit: true
              }
            }
          }
        },
        supplier: {
          select: {
            id: true,
            supplierName: true
          }
        }
      }
    })

    if (!procurement) {
      return Response.json({ 
        success: false, 
        error: 'Procurement not found or access denied' 
      }, { status: 404 })
    }

    // 5. Check if procurement can be received
    if (procurement.status === 'CANCELLED' || procurement.status === 'REJECTED') {
      return Response.json({ 
        success: false, 
        error: `Cannot receive ${procurement.status.toLowerCase()} procurement` 
      }, { status: 403 })
    }

    if (procurement.status === 'FULLY_RECEIVED' || procurement.status === 'COMPLETED') {
      return Response.json({ 
        success: false, 
        error: 'Procurement already fully received' 
      }, { status: 403 })
    }

    // 6. Parse and validate request body
    const body = await request.json()
    const validated = receivingSchema.parse(body)

    // 7. Verify all items belong to this procurement
    const itemIds = validated.items.map(item => item.itemId)
    const procurementItemIds = procurement.items.map(item => item.id)
    const invalidItems = itemIds.filter(id => !procurementItemIds.includes(id))
    
    if (invalidItems.length > 0) {
      return Response.json({ 
        success: false, 
        error: 'Some items do not belong to this procurement' 
      }, { status: 400 })
    }

    // 8. Process receiving in transaction
    const result = await db.$transaction(async (tx) => {
      // Update each procurement item
      for (const item of validated.items) {
        await tx.procurementItem.update({
          where: { id: item.itemId },
          data: {
            receivedQuantity: item.receivedQuantity,
            qualityReceived: item.qualityReceived,
            gradeReceived: item.gradeReceived,
            expiryDate: item.expiryDate,
            batchNumber: item.batchNumber,
            productionDate: item.productionDate,
            isAccepted: item.isAccepted,
            rejectionReason: item.rejectionReason,
            returnedQuantity: item.returnedQuantity,
            notes: item.notes
          }
        })

        // Update inventory if item is accepted and has inventoryItemId
        const procItem = procurement.items.find(i => i.id === item.itemId)
        if (item.isAccepted && procItem?.inventoryItemId && item.receivedQuantity > 0) {
          await tx.inventoryItem.update({
            where: { id: procItem.inventoryItemId },
            data: {
              currentStock: { increment: item.receivedQuantity }
            }
          })

          // Create stock movement record
          const currentStock = procItem.inventoryItem?.currentStock || 0
          await tx.stockMovement.create({
            data: {
              inventoryId: procItem.inventoryItemId,
              movementType: 'IN',
              quantity: item.receivedQuantity,
              unit: procItem.unit,
              stockBefore: currentStock,
              stockAfter: currentStock + item.receivedQuantity,
              referenceType: 'PROCUREMENT',
              referenceId: procurement.id,
              notes: `Received from ${procurement.supplier.supplierName}`,
              movedBy: session.user.id
            }
          })
        }
      }

      // Calculate overall status
      const allItemsReceived = validated.items.every(item => item.receivedQuantity > 0)
      const someItemsReceived = validated.items.some(item => item.receivedQuantity > 0)
      const allItemsAccepted = validated.items.every(item => item.isAccepted)
      
      let newStatus: string
      let deliveryStatus: string
      
      if (allItemsReceived) {
        newStatus = 'FULLY_RECEIVED'
        deliveryStatus = 'DELIVERED'
      } else if (someItemsReceived) {
        newStatus = 'PARTIALLY_RECEIVED'
        deliveryStatus = 'DELIVERED'
      } else {
        newStatus = procurement.status
        deliveryStatus = procurement.deliveryStatus
      }

      // Determine acceptance status
      let acceptanceStatus: string
      if (validated.acceptanceStatus) {
        acceptanceStatus = validated.acceptanceStatus
      } else if (allItemsAccepted) {
        acceptanceStatus = 'ACCEPTED'
      } else if (validated.items.some(item => item.isAccepted)) {
        acceptanceStatus = 'PARTIAL'
      } else {
        acceptanceStatus = 'REJECTED'
      }

      // Update procurement
      const updatedProcurement = await tx.procurement.update({
        where: { id },
        data: {
          status: newStatus as ProcurementStatus,
          deliveryStatus,
          actualDelivery: validated.actualDelivery || new Date(),
          qualityGrade: validated.qualityGrade,
          qualityNotes: validated.qualityNotes,
          receiptNumber: validated.receiptNumber,
          receiptPhoto: validated.receiptPhoto,
          deliveryPhoto: validated.deliveryPhoto,
          inspectedBy: session.user.id,
          inspectedAt: new Date(),
          acceptanceStatus
        },
        include: {
          sppg: {
            select: {
              id: true,
              name: true
            }
          },
          supplier: {
            select: {
              id: true,
              supplierCode: true,
              supplierName: true
            }
          },
          items: {
            include: {
              inventoryItem: {
                select: {
                  id: true,
                  itemName: true,
                  currentStock: true
                }
              }
            }
          }
        }
      })

      // Update supplier performance statistics
      const acceptedItemsCount = validated.items.filter(item => item.isAccepted).length
      const totalItemsCount = validated.items.length
      const deliveryOnTime = validated.actualDelivery && procurement.expectedDelivery
        ? validated.actualDelivery <= procurement.expectedDelivery
        : true

      await tx.supplier.update({
        where: { id: procurement.supplierId },
        data: {
          successfulDeliveries: deliveryOnTime ? { increment: 1 } : undefined,
          failedDeliveries: !deliveryOnTime ? { increment: 1 } : undefined,
          totalPurchaseValue: { increment: procurement.totalAmount },
          // Update ratings based on quality (simple weighted average)
          qualityRating: acceptedItemsCount === totalItemsCount ? { increment: 0.1 } : { decrement: 0.1 },
          deliveryRating: deliveryOnTime ? { increment: 0.1 } : { decrement: 0.1 }
        }
      })

      // If fully received and accepted, update plan used budget
      if (newStatus === 'FULLY_RECEIVED' && acceptanceStatus === 'ACCEPTED' && procurement.planId) {
        await tx.procurementPlan.update({
          where: { id: procurement.planId },
          data: {
            usedBudget: { increment: procurement.totalAmount },
            allocatedBudget: { decrement: procurement.totalAmount }
          }
        })
      }

      return updatedProcurement
    })

    // 9. Success response
    return Response.json({
      success: true,
      data: result,
      message: 'Items received and processed successfully'
    })

  } catch (error) {
    console.error('PATCH /api/sppg/procurement/[id]/receive error:', error)
    
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
      error: 'Failed to process receiving',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 })
  }
}
