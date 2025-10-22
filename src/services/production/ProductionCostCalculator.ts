/**
 * @fileoverview Production Cost Calculator Service
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @description
 * Dynamically calculates production costs from ProductionStockUsage records
 * with proper unit conversions and frozen cost snapshots.
 * 
 * Replaces stored cost fields (estimatedCost, actualCost, costPerPortion)
 * from FoodProduction model with real-time calculations.
 * 
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * Stock usage input for recording production consumption
 */
export interface StockUsageInput {
  inventoryItemId: string
  quantityUsed: number
  unit: string
  unitCostAtUse: number
  recordedBy: string
  notes?: string
}

/**
 * Production cost calculation result
 */
export interface ProductionCostResult {
  productionId: string
  totalCost: number
  costPerPortion: number
  actualPortions: number
  usageRecordCount: number
  calculatedAt: Date
}

/**
 * Cost breakdown by ingredient/item
 */
export interface CostBreakdownItem {
  inventoryItemId: string
  itemName: string
  quantityUsed: number
  unit: string
  unitCostAtUse: number
  totalCost: number
  percentage: number // Percentage of total production cost
}

// ============================================================================
// Unit Conversion Utilities
// ============================================================================

/**
 * Convert quantity to base unit (kg for weight, liter for volume)
 * 
 * @param quantity - Original quantity value
 * @param unit - Unit of measurement (gram, kg, ml, liter, etc.)
 * @returns Quantity in base unit (kg or liter)
 * 
 * @example
 * convertToBaseUnit(500, 'gram') // Returns 0.5 (kg)
 * convertToBaseUnit(250, 'ml') // Returns 0.25 (liter)
 */
function convertToBaseUnit(quantity: number, unit: string): number {
  const normalizedUnit = unit.toLowerCase().trim()
  
  // Weight conversions to kg
  if (normalizedUnit === 'gram' || normalizedUnit === 'g') {
    return quantity / 1000
  }
  if (normalizedUnit === 'kg' || normalizedUnit === 'kilogram') {
    return quantity
  }
  
  // Volume conversions to liter
  if (normalizedUnit === 'ml' || normalizedUnit === 'milliliter') {
    return quantity / 1000
  }
  if (normalizedUnit === 'liter' || normalizedUnit === 'l' || normalizedUnit === 'litre') {
    return quantity
  }
  
  // For other units (pieces, etc.), assume already in base unit
  return quantity
}

/**
 * Get display unit for base unit (for reporting)
 * Helper function for future reporting features
 * 
 * @param unit - Original unit
 * @returns Base unit for display
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getBaseUnit(unit: string): string {
  const normalizedUnit = unit.toLowerCase().trim()
  
  if (normalizedUnit === 'gram' || normalizedUnit === 'g' || 
      normalizedUnit === 'kg' || normalizedUnit === 'kilogram') {
    return 'kg'
  }
  
  if (normalizedUnit === 'ml' || normalizedUnit === 'milliliter' || 
      normalizedUnit === 'liter' || normalizedUnit === 'l' || normalizedUnit === 'litre') {
    return 'liter'
  }
  
  return unit
}

// ============================================================================
// Production Cost Calculator Service
// ============================================================================

/**
 * Service for calculating production costs dynamically from stock usage records
 */
export class ProductionCostCalculator {
  /**
   * Record stock usage when production starts or completes
   * Creates ProductionStockUsage records with frozen cost snapshots
   * 
   * @param productionId - ID of the food production
   * @param usageRecords - Array of stock usage records
   * @returns Promise<void>
   * 
   * @example
   * ```typescript
   * await calculator.recordStockUsage('prod123', [
   *   {
   *     inventoryItemId: 'inv456',
   *     quantityUsed: 8, // 8 kg
   *     unit: 'kg',
   *     unitCostAtUse: 12000, // Rp 12,000 per kg
   *     recordedBy: 'user789',
   *     notes: 'Used for Nasi Gudeg production'
   *   }
   * ])
   * ```
   */
  async recordStockUsage(
    productionId: string, 
    usageRecords: StockUsageInput[]
  ): Promise<void> {
    // Verify production exists
    const production = await prisma.foodProduction.findUnique({
      where: { id: productionId },
      select: { id: true, batchNumber: true }
    })
    
    if (!production) {
      throw new Error(`Production not found: ${productionId}`)
    }
    
    // Create usage records with calculated totalCost
    await prisma.productionStockUsage.createMany({
      data: usageRecords.map(record => ({
        productionId,
        inventoryItemId: record.inventoryItemId,
        quantityUsed: record.quantityUsed,
        unit: record.unit,
        unitCostAtUse: record.unitCostAtUse,
        totalCost: record.quantityUsed * record.unitCostAtUse,
        recordedBy: record.recordedBy,
        notes: record.notes,
      }))
    })
  }
  
  /**
   * Calculate total production cost from usage records
   * Returns cost breakdown and total cost
   * 
   * @param productionId - ID of the food production
   * @returns Promise<ProductionCostResult>
   * 
   * @throws Error if production not found
   * @throws Error if no usage records exist
   * 
   * @example
   * ```typescript
   * const result = await calculator.calculateProductionCost('prod123')
   * console.log(`Total Cost: Rp ${result.totalCost.toLocaleString()}`)
   * console.log(`Cost per Portion: Rp ${result.costPerPortion.toLocaleString()}`)
   * ```
   */
  async calculateProductionCost(productionId: string): Promise<ProductionCostResult> {
    // Load production with usage records
    const production = await prisma.foodProduction.findUnique({
      where: { id: productionId },
      include: {
        usageRecords: {
          include: {
            inventoryItem: {
              select: {
                itemName: true
              }
            }
          }
        }
      }
    })
    
    if (!production) {
      throw new Error(`Production not found: ${productionId}`)
    }
    
    if (production.usageRecords.length === 0) {
      throw new Error(`No usage records found for production: ${productionId}`)
    }
    
    // Calculate total cost from usage records
    const totalCost = production.usageRecords.reduce(
      (sum, record) => sum + record.totalCost,
      0
    )
    
    // Calculate cost per portion
    const portions = production.actualPortions || production.plannedPortions
    const costPerPortion = totalCost / portions
    
    return {
      productionId,
      totalCost,
      costPerPortion,
      actualPortions: portions,
      usageRecordCount: production.usageRecords.length,
      calculatedAt: new Date()
    }
  }
  
  /**
   * Get cost per portion for a production
   * Shorthand for calculateProductionCost().costPerPortion
   * 
   * @param productionId - ID of the food production
   * @returns Promise<number> Cost per portion in Rupiah
   * 
   * @example
   * ```typescript
   * const costPerPortion = await calculator.getCostPerPortion('prod123')
   * console.log(`Rp ${costPerPortion.toLocaleString()} per portion`)
   * ```
   */
  async getCostPerPortion(productionId: string): Promise<number> {
    const result = await this.calculateProductionCost(productionId)
    return result.costPerPortion
  }
  
  /**
   * Get detailed cost breakdown by ingredient
   * Shows which items contributed how much to total cost
   * 
   * @param productionId - ID of the food production
   * @returns Promise<CostBreakdownItem[]> Array of cost breakdown items
   * 
   * @example
   * ```typescript
   * const breakdown = await calculator.getCostBreakdown('prod123')
   * breakdown.forEach(item => {
   *   console.log(`${item.itemName}: Rp ${item.totalCost.toLocaleString()} (${item.percentage.toFixed(1)}%)`)
   * })
   * ```
   */
  async getCostBreakdown(productionId: string): Promise<CostBreakdownItem[]> {
    // Load production with usage records
    const production = await prisma.foodProduction.findUnique({
      where: { id: productionId },
      include: {
        usageRecords: {
          include: {
            inventoryItem: {
              select: {
                itemName: true
              }
            }
          }
        }
      }
    })
    
    if (!production) {
      throw new Error(`Production not found: ${productionId}`)
    }
    
    if (production.usageRecords.length === 0) {
      return []
    }
    
    // Calculate total cost
    const totalCost = production.usageRecords.reduce(
      (sum, record) => sum + record.totalCost,
      0
    )
    
    // Build breakdown items
    const breakdown: CostBreakdownItem[] = production.usageRecords.map(record => ({
      inventoryItemId: record.inventoryItemId,
      itemName: record.inventoryItem.itemName,
      quantityUsed: record.quantityUsed,
      unit: record.unit,
      unitCostAtUse: record.unitCostAtUse,
      totalCost: record.totalCost,
      percentage: (record.totalCost / totalCost) * 100
    }))
    
    // Sort by total cost descending (most expensive first)
    return breakdown.sort((a, b) => b.totalCost - a.totalCost)
  }
  
  /**
   * Calculate estimated cost from menu ingredients (for planning)
   * Uses current inventory prices and planned portions
   * 
   * @param menuId - ID of the nutrition menu
   * @param portions - Number of portions to produce
   * @returns Promise<number> Estimated total cost in Rupiah
   * 
   * @example
   * ```typescript
   * const estimatedCost = await calculator.calculateEstimatedCost('menu123', 100)
   * console.log(`Estimated for 100 portions: Rp ${estimatedCost.toLocaleString()}`)
   * ```
   */
  async calculateEstimatedCost(menuId: string, portions: number): Promise<number> {
    // Load menu with ingredients
    const menu = await prisma.nutritionMenu.findUnique({
      where: { id: menuId },
      include: {
        ingredients: {
          include: {
            inventoryItem: {
              select: {
                costPerUnit: true,
                unit: true
              }
            }
          }
        }
      }
    })
    
    if (!menu) {
      throw new Error(`Menu not found: ${menuId}`)
    }
    
    // Calculate cost from ingredients
    let totalCost = 0
    
    for (const ingredient of menu.ingredients) {
      // Skip if inventory item not linked
      if (!ingredient.inventoryItem) continue
      
      const currentCost = ingredient.inventoryItem.costPerUnit || 0
      
      // Convert ingredient quantity to base unit  
      const baseQuantity = convertToBaseUnit(
        ingredient.quantity,
        ingredient.inventoryItem.unit
      )
      
      // Calculate cost for all portions
      const ingredientCost = baseQuantity * portions * currentCost
      totalCost += ingredientCost
    }
    
    return totalCost
  }
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

/**
 * Singleton instance of ProductionCostCalculator
 * Use this for all cost calculations in the application
 * 
 * @example
 * ```typescript
 * import { productionCostCalculator } from '@/services/production/ProductionCostCalculator'
 * 
 * // Record usage
 * await productionCostCalculator.recordStockUsage(productionId, usageRecords)
 * 
 * // Calculate cost
 * const result = await productionCostCalculator.calculateProductionCost(productionId)
 * 
 * // Get breakdown
 * const breakdown = await productionCostCalculator.getCostBreakdown(productionId)
 * ```
 */
export const productionCostCalculator = new ProductionCostCalculator()
