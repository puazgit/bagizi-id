/**
 * Procurement Receive Service
 * 
 * Handles automatic stock movements when procurement items are received.
 * Implements FIFO (First In, First Out) batch tracking for cost accounting.
 * 
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @see /docs/SPPG_PHASE1_IMPLEMENTATION_PLAN.md - Fix #2
 */

import { PrismaClient, MovementType, ProcurementStatus } from '@prisma/client'

const prisma = new PrismaClient()

export interface ReceiveProcurementInput {
  procurementId: string
  receivedBy: string
  notes?: string
}

export interface StockMovementResult {
  inventoryItemId: string
  itemName: string
  quantityReceived: number
  unitPrice: number
  stockBefore: number
  stockAfter: number
  movementId: string
}

export class ProcurementReceiveService {
  /**
   * Process procurement receipt and create stock movements
   * 
   * When procurement status changes to PARTIALLY_RECEIVED or FULLY_RECEIVED:
   * 1. Validate all items have inventoryItemId (Fix #2 requirement)
   * 2. Create StockMovement records for each item
   * 3. Update InventoryItem.currentStock
   * 4. Track FIFO batches with pricing
   * 
   * @param input - Receipt details
   * @returns Array of stock movement results
   */
  async receiveProcurement(input: ReceiveProcurementInput): Promise<StockMovementResult[]> {
    const { procurementId, receivedBy, notes } = input

    // 1. Load procurement with items
    const procurement = await prisma.procurement.findUnique({
      where: { id: procurementId },
      include: {
        items: {
          include: {
            inventoryItem: true
          }
        }
      }
    })

    if (!procurement) {
      throw new Error(`Procurement ${procurementId} not found`)
    }

    // 2. Validate procurement status
    const validStatuses: ProcurementStatus[] = [
      'PARTIALLY_RECEIVED',
      'FULLY_RECEIVED',
      'COMPLETED'
    ]

    if (!validStatuses.includes(procurement.status)) {
      throw new Error(
        `Cannot process stock movements for procurement with status: ${procurement.status}. ` +
        `Expected one of: ${validStatuses.join(', ')}`
      )
    }

    // 3. Validate all items have inventoryItemId (Fix #2 critical requirement)
    const orphanedItems = procurement.items.filter(item => !item.inventoryItemId)
    
    if (orphanedItems.length > 0) {
      const orphanedNames = orphanedItems.map(item => item.itemName).join(', ')
      throw new Error(
        `Cannot process stock movements: ${orphanedItems.length} item(s) missing inventory link: ${orphanedNames}. ` +
        `Please run Fix #2 mapping scripts first.`
      )
    }

    // 4. Process each procurement item
    const results: StockMovementResult[] = []

    for (const item of procurement.items) {
      // Skip items with no received quantity
      if (!item.receivedQuantity || item.receivedQuantity <= 0) {
        continue
      }

      // Skip rejected items
      if (item.isAccepted === false) {
        continue
      }

      const inventoryItem = item.inventoryItem!

      // Check if stock movement already exists for this item
      const existingMovement = await prisma.stockMovement.findFirst({
        where: {
          referenceType: 'PROCUREMENT',
          referenceId: procurementId,
          inventoryId: item.inventoryItemId!
        }
      })

      if (existingMovement) {
        // Movement already created, skip to avoid duplicates
        console.log(`Stock movement already exists for ${item.itemName} in procurement ${procurementId}`)
        continue
      }

      // Get current stock before movement
      const stockBefore = inventoryItem.currentStock

      // Create stock movement (IN type)
      const movement = await prisma.stockMovement.create({
        data: {
          inventoryId: item.inventoryItemId!,
          movementType: 'IN' as MovementType,
          quantity: item.receivedQuantity,
          unit: item.unit,
          unitCost: item.pricePerUnit,
          totalCost: item.finalPrice || (item.receivedQuantity * item.pricePerUnit),
          stockBefore: stockBefore,
          stockAfter: stockBefore + item.receivedQuantity,
          referenceType: 'PROCUREMENT',
          referenceId: procurementId,
          notes: notes || `Received from ${procurement.supplierName || 'supplier'}`,
          movedBy: receivedBy,
          movedAt: procurement.actualDelivery || new Date()
        }
      })

      // Update inventory stock
      const updatedInventory = await prisma.inventoryItem.update({
        where: { id: item.inventoryItemId! },
        data: {
          currentStock: { increment: item.receivedQuantity },
          lastPrice: item.pricePerUnit,
          // Calculate weighted average price
          averagePrice: await this.calculateWeightedAveragePrice(
            item.inventoryItemId!,
            stockBefore,
            inventoryItem.averagePrice || inventoryItem.costPerUnit || 0,
            item.receivedQuantity,
            item.pricePerUnit
          )
        }
      })

      results.push({
        inventoryItemId: item.inventoryItemId!,
        itemName: item.itemName,
        quantityReceived: item.receivedQuantity,
        unitPrice: item.pricePerUnit,
        stockBefore: stockBefore,
        stockAfter: updatedInventory.currentStock,
        movementId: movement.id
      })
    }

    return results
  }

  /**
   * Calculate weighted average price for FIFO accounting
   * 
   * Formula: ((oldStock * oldPrice) + (newStock * newPrice)) / totalStock
   * 
   * @param inventoryItemId - Inventory item ID
   * @param oldStock - Current stock quantity
   * @param oldPrice - Current average price
   * @param newStock - New quantity received
   * @param newPrice - New unit price
   * @returns Weighted average price
   */
  private async calculateWeightedAveragePrice(
    inventoryItemId: string,
    oldStock: number,
    oldPrice: number,
    newStock: number,
    newPrice: number
  ): Promise<number> {
    const totalStock = oldStock + newStock
    
    if (totalStock === 0) {
      return newPrice
    }

    const oldValue = oldStock * oldPrice
    const newValue = newStock * newPrice
    const totalValue = oldValue + newValue
    
    return totalValue / totalStock
  }

  /**
   * Get stock movements for a procurement
   * 
   * @param procurementId - Procurement ID
   * @returns Array of stock movements
   */
  async getStockMovements(procurementId: string) {
    return await prisma.stockMovement.findMany({
      where: {
        referenceType: 'PROCUREMENT',
        referenceId: procurementId
      },
      include: {
        inventory: {
          select: {
            itemName: true,
            itemCode: true,
            unit: true,
            category: true
          }
        }
      },
      orderBy: {
        movedAt: 'desc'
      }
    })
  }

  /**
   * Reverse stock movements (for procurement cancellation)
   * 
   * @param procurementId - Procurement ID
   * @param reversedBy - User ID performing the reversal
   * @param reason - Reversal reason
   */
  async reverseStockMovements(
    procurementId: string,
    reversedBy: string,
    reason: string
  ): Promise<void> {
    // Get all stock movements for this procurement
    const movements = await this.getStockMovements(procurementId)

    if (movements.length === 0) {
      console.log(`No stock movements to reverse for procurement ${procurementId}`)
      return
    }

    // Create reversal movements (OUT type)
    for (const movement of movements) {
      // Get current stock
      const currentStock = await prisma.inventoryItem.findUnique({
        where: { id: movement.inventoryId },
        select: { currentStock: true }
      })

      if (!currentStock) {
        throw new Error(`Inventory item ${movement.inventoryId} not found`)
      }

      // Check if enough stock to reverse
      if (currentStock.currentStock < movement.quantity) {
        throw new Error(
          `Cannot reverse: Inventory ${movement.inventory.itemName} has insufficient stock. ` +
          `Current: ${currentStock.currentStock}, Required: ${movement.quantity}`
        )
      }

      // Create reversal movement
      await prisma.stockMovement.create({
        data: {
          inventoryId: movement.inventoryId,
          movementType: 'OUT' as MovementType,
          quantity: movement.quantity,
          unit: movement.unit,
          unitCost: movement.unitCost,
          totalCost: -(movement.totalCost || 0),
          stockBefore: currentStock.currentStock,
          stockAfter: currentStock.currentStock - movement.quantity,
          referenceType: 'PROCUREMENT_REVERSAL',
          referenceId: procurementId,
          notes: `Reversal: ${reason}`,
          movedBy: reversedBy,
          movedAt: new Date()
        }
      })

      // Update inventory stock
      await prisma.inventoryItem.update({
        where: { id: movement.inventoryId },
        data: {
          currentStock: { decrement: movement.quantity }
        }
      })
    }
  }
}

// Export singleton instance
export const procurementReceiveService = new ProcurementReceiveService()
