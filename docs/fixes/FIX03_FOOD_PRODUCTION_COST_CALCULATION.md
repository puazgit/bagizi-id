# FIX #3: FoodProduction Cost Calculation - Remove Stored Costs

**Priority**: 🔥🔥 CRITICAL  
**Estimate**: 12 hours (1.5 days)  
**Status**: ⏳ PENDING  
**Dependencies**: Fix #1 (MenuIngredient costs must be fixed first)  
**Phase**: 1 - Week 1-2

---

## 📋 Problem Statement

### Current Broken State

```prisma
model FoodProduction {
  id                String      @id @default(cuid())
  programId         String
  menuId            String
  productionDate    DateTime
  targetPortions    Int
  actualPortions    Int?
  
  // ❌ CRITICAL: Stored costs that get outdated
  estimatedCost     Float       // Calculated once, never updated
  actualCost        Float?      // Manually entered, prone to errors
  costPerPortion    Float       // Derived from outdated costs
  
  // ❌ HIGH: Duplicate batch number tracking
  batchNumber       String
  productionStatus  String
  
  // Relations
  program           NutritionProgram @relation(...)
  menu              NutritionMenu @relation(...)
  distributions     FoodDistribution[]
  qualityControls   QualityControl[]
}
```

### Issues Identified

1. **❌ CRITICAL - Stored Costs Get Outdated**
   - `estimatedCost` calculated at production creation time
   - Menu ingredient prices change → costs become wrong
   - Reports show incorrect cost per portion
   - Financial analysis unreliable
   
2. **❌ HIGH - Manual actualCost Entry**
   - Staff must manually enter actual costs after production
   - Often forgotten or entered incorrectly
   - No validation against expected costs
   - Creates discrepancy in financial reports
   
3. **❌ MEDIUM - Missing Cost Variance Tracking**
   - Can't track estimated vs actual cost variance
   - No alerts for cost overruns
   - Poor cost control

4. **❌ MEDIUM - Incomplete Production Waste Tracking**
   - actualPortions < targetPortions indicates waste
   - But no way to track waste cost impact
   - No waste reason tracking

---

## 💥 Business Impact

### Broken Scenario #1: Outdated Cost Reports

**Current Broken Flow:**
```typescript
// January: Create production with ingredient prices
const production = await db.foodProduction.create({
  data: {
    menuId: "nasi-gudeg-id",
    productionDate: new Date("2025-01-15"),
    targetPortions: 1000,
    estimatedCost: 8500000,  // ❌ Calculated: 1000 portions × Rp 8,500
    costPerPortion: 8500      // ❌ Fixed at creation
  }
})

// March: Ingredient prices increase 15%
// - Chicken: 45k → 52k (+15%)
// - Rice: 12k → 14k (+16%)
// - Vegetables: 8k → 9k (+12%)

// User generates cost report for March
const report = await db.foodProduction.findMany({
  where: {
    productionDate: {
      gte: new Date("2025-03-01"),
      lte: new Date("2025-03-31")
    }
  }
})

// ❌ PROBLEM: Reports still show old costs!
// Report shows: Rp 8,500/portion
// Actual cost: Rp 9,775/portion (+15%)
// Difference: Rp 1,275/portion × 22,000 portions = Rp 28,050,000 LOSS!

// Financial team makes budget decisions based on WRONG data
// SPPG loses money without knowing why
```

**Expected Fixed Flow:**
```typescript
// January: Create production (no stored costs)
const production = await db.foodProduction.create({
  data: {
    menuId: "nasi-gudeg-id",
    productionDate: new Date("2025-01-15"),
    targetPortions: 1000
    // ✅ No estimatedCost, calculated dynamically
  }
})

// March: Generate cost report with CURRENT prices
const productionService = new FoodProductionService()
const report = await productionService.generateCostReport({
  startDate: new Date("2025-03-01"),
  endDate: new Date("2025-03-31")
})

// ✅ FIXED: Uses current ingredient prices
// Correctly shows: Rp 9,775/portion
// Shows cost trend: +15% from January
// Alerts: "Cost increased 15%, review budget"
```

### Broken Scenario #2: Production Waste Not Tracked

**Problem:**
```typescript
// Production planned for 1000 portions
const production = await db.foodProduction.create({
  data: {
    targetPortions: 1000,
    estimatedCost: 8500000  // ❌ Rp 8,500 × 1000
  }
})

// Update after production: only 920 portions usable
await db.foodProduction.update({
  where: { id: production.id },
  data: {
    actualPortions: 920,
    actualCost: 8500000,    // ❌ Still charged full cost
    productionStatus: 'COMPLETED'
  }
})

// ❌ PROBLEM: 80 portions wasted
// Waste cost: 80 × Rp 8,500 = Rp 680,000
// But no tracking of:
// - Why wasted? (burnt, spoiled, quality fail)
// - Which ingredient caused waste?
// - Waste cost impact on budget
// - Trend analysis (recurring waste?)
```

### Broken Scenario #3: FIFO Cost Mismatch

**Problem:**
```typescript
// Production uses ingredients from different procurement batches
// Chicken:
// - Batch 1: 30kg @ Rp 45,000/kg (Jan purchase)
// - Batch 2: 20kg @ Rp 52,000/kg (Feb purchase)
// Production uses 50kg total

// ❌ WRONG: Uses average price
// Average: (30×45k + 20×52k) / 50 = Rp 47,800/kg
// Total: 50kg × Rp 47,800 = Rp 2,390,000

// ✅ CORRECT: FIFO calculation
// Use Batch 1 first: 30kg × Rp 45,000 = Rp 1,350,000
// Then Batch 2: 20kg × Rp 52,000 = Rp 1,040,000
// Total: Rp 2,390,000 (same) BUT proper accounting

// Problem: Stored cost doesn't track which batches used
// Can't do proper FIFO accounting for financial reports
```

---

## 🎯 Target State

### Fixed Schema

```prisma
model FoodProduction {
  id                String      @id @default(cuid())
  programId         String
  menuId            String
  productionDate    DateTime
  targetPortions    Int
  actualPortions    Int?
  
  // ✅ REMOVED: No stored costs, calculated dynamically
  // estimatedCost     Float  ❌ REMOVED
  // actualCost        Float? ❌ REMOVED
  // costPerPortion    Float  ❌ REMOVED
  
  // Production tracking
  batchNumber       String      @unique
  productionStatus  ProductionStatus  // PLANNED, IN_PROGRESS, COMPLETED, CANCELLED
  
  // ✅ NEW: Production waste tracking
  wasteQuantity     Float?      // Portions wasted
  wasteReason       String?     // Why wasted
  wasteCostImpact   Float?      // Calculated waste cost
  
  // ✅ NEW: Production staff tracking
  preparedBy        String?     // User ID
  supervisedBy      String?     // User ID
  
  // Timestamps
  startTime         DateTime?
  completionTime    DateTime?
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  // Relations
  program           NutritionProgram @relation(...)
  menu              NutritionMenu @relation(...)
  distributions     FoodDistribution[]
  qualityControls   QualityControl[]
  stockUsages       ProductionStockUsage[]  // ✅ NEW: Track ingredient usage
  
  @@index([programId])
  @@index([menuId])
  @@index([productionDate])
}

// ✅ NEW: Track which ingredients/batches used
model ProductionStockUsage {
  id                String      @id @default(cuid())
  productionId      String
  inventoryItemId   String
  quantityUsed      Float
  
  // FIFO batch tracking
  procurementItemId String?     // Which procurement batch
  unitCost          Float       // Cost at time of use (from FIFO)
  totalCost         Float       // quantityUsed × unitCost
  
  // Relations
  production        FoodProduction @relation(...)
  inventoryItem     InventoryItem @relation(...)
  procurementItem   ProcurementItem? @relation(...)
  
  createdAt         DateTime    @default(now())
  
  @@index([productionId])
  @@index([inventoryItemId])
}

enum ProductionStatus {
  PLANNED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}
```

### Benefits After Fix

1. **✅ Always Accurate Costs**
   - Costs calculated from current ingredient prices
   - Reports always show real-time data
   - No outdated cost issues

2. **✅ FIFO Accounting**
   - Track which procurement batches used
   - Proper cost of goods sold calculation
   - Audit trail for financial compliance

3. **✅ Waste Tracking & Analysis**
   - Track portions wasted with reasons
   - Calculate waste cost impact
   - Identify recurring waste patterns

4. **✅ Production Analytics**
   - Cost variance analysis (planned vs actual)
   - Efficiency metrics (waste %, yield %)
   - Staff performance tracking

---

## 📝 Implementation Plan

### Step 1: Create ProductionStockUsage Model (2 hours)

#### 1.1 Add New Model to Schema

```prisma
// prisma/schema.prisma

model ProductionStockUsage {
  id                String      @id @default(cuid())
  productionId      String
  inventoryItemId   String
  quantityUsed      Float
  
  // FIFO batch tracking
  procurementItemId String?
  unitCost          Float
  totalCost         Float
  
  // Metadata
  notes             String?
  createdAt         DateTime    @default(now())
  createdBy         String?
  
  // Relations
  production        FoodProduction @relation(fields: [productionId], references: [id], onDelete: Cascade)
  inventoryItem     InventoryItem @relation(fields: [inventoryItemId], references: [id])
  procurementItem   ProcurementItem? @relation(fields: [procurementItemId], references: [id])
  
  @@index([productionId])
  @@index([inventoryItemId])
  @@index([procurementItemId])
}
```

#### 1.2 Update FoodProduction Model

```prisma
model FoodProduction {
  // ... existing fields ...
  
  // Remove stored costs
  // estimatedCost     Float       ❌ REMOVED
  // actualCost        Float?      ❌ REMOVED
  // costPerPortion    Float       ❌ REMOVED
  
  // Add new fields
  wasteQuantity     Float?
  wasteReason       String?
  wasteCostImpact   Float?
  preparedBy        String?
  supervisedBy      String?
  startTime         DateTime?
  completionTime    DateTime?
  
  // Add relation
  stockUsages       ProductionStockUsage[]
}
```

---

### Step 2: Migrate Existing Data (2 hours)

#### 2.1 Preserve Historical Cost Data

```typescript
// prisma/scripts/migrate-production-costs.ts

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function migrateProductionCosts() {
  console.log('📊 Migrating FoodProduction cost data...')
  
  // Get all productions with stored costs
  const productions = await db.foodProduction.findMany({
    where: {
      OR: [
        { estimatedCost: { not: null } },
        { actualCost: { not: null } }
      ]
    },
    include: {
      menu: {
        include: {
          ingredients: {
            include: {
              inventoryItem: true
            }
          }
        }
      }
    }
  })
  
  console.log(`Found ${productions.length} productions with cost data`)
  
  let migrated = 0
  let skipped = 0
  
  for (const production of productions) {
    try {
      // Create audit record in notes
      const costHistory = {
        migratedAt: new Date().toISOString(),
        originalEstimatedCost: production.estimatedCost,
        originalActualCost: production.actualCost,
        originalCostPerPortion: production.costPerPortion,
        note: 'Historical cost data migrated from stored fields'
      }
      
      // Update production with notes
      await db.foodProduction.update({
        where: { id: production.id },
        data: {
          notes: JSON.stringify(costHistory, null, 2)
        }
      })
      
      // Create ProductionStockUsage records based on menu ingredients
      // (if we can deduce what was used)
      if (production.menu.ingredients.length > 0) {
        const stockUsages = production.menu.ingredients.map(ingredient => ({
          productionId: production.id,
          inventoryItemId: ingredient.inventoryItemId!,
          quantityUsed: ingredient.quantity * production.targetPortions,
          unitCost: ingredient.costPerUnit || 0,
          totalCost: (ingredient.costPerUnit || 0) * ingredient.quantity * production.targetPortions,
          notes: 'Estimated from menu recipe (migrated)',
          createdBy: 'MIGRATION_SCRIPT'
        }))
        
        await db.productionStockUsage.createMany({
          data: stockUsages
        })
      }
      
      migrated++
      console.log(`  ✅ Migrated production ${production.batchNumber}`)
      
    } catch (error) {
      console.error(`  ❌ Failed to migrate production ${production.batchNumber}:`, error)
      skipped++
    }
  }
  
  console.log(`\n📊 Migration Summary:`)
  console.log(`  ✅ Migrated: ${migrated}`)
  console.log(`  ❌ Skipped: ${skipped}`)
}

migrateProductionCosts()
  .catch(error => {
    console.error('Migration failed:', error)
    process.exit(1)
  })
  .finally(() => {
    db.$disconnect()
  })
```

#### 2.2 Schema Migration SQL

```sql
-- prisma/migrations/YYYYMMDDHHMMSS_remove_production_stored_costs/migration.sql

-- Step 1: Create ProductionStockUsage table
CREATE TABLE "ProductionStockUsage" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "productionId" TEXT NOT NULL,
  "inventoryItemId" TEXT NOT NULL,
  "quantityUsed" DOUBLE PRECISION NOT NULL,
  "procurementItemId" TEXT,
  "unitCost" DOUBLE PRECISION NOT NULL,
  "totalCost" DOUBLE PRECISION NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  
  CONSTRAINT "ProductionStockUsage_productionId_fkey"
    FOREIGN KEY ("productionId") REFERENCES "FoodProduction"("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  
  CONSTRAINT "ProductionStockUsage_inventoryItemId_fkey"
    FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  
  CONSTRAINT "ProductionStockUsage_procurementItemId_fkey"
    FOREIGN KEY ("procurementItemId") REFERENCES "ProcurementItem"("id")
    ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "ProductionStockUsage_productionId_idx" ON "ProductionStockUsage"("productionId");
CREATE INDEX "ProductionStockUsage_inventoryItemId_idx" ON "ProductionStockUsage"("inventoryItemId");
CREATE INDEX "ProductionStockUsage_procurementItemId_idx" ON "ProductionStockUsage"("procurementItemId");

-- Step 2: Add new fields to FoodProduction
ALTER TABLE "FoodProduction"
  ADD COLUMN IF NOT EXISTS "wasteQuantity" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "wasteReason" TEXT,
  ADD COLUMN IF NOT EXISTS "wasteCostImpact" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "preparedBy" TEXT,
  ADD COLUMN IF NOT EXISTS "supervisedBy" TEXT,
  ADD COLUMN IF NOT EXISTS "startTime" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "completionTime" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "notes" TEXT;

-- Step 3: Migrate existing cost data to notes
UPDATE "FoodProduction"
SET "notes" = json_build_object(
  'migratedAt', NOW(),
  'originalEstimatedCost', "estimatedCost",
  'originalActualCost', "actualCost",
  'originalCostPerPortion', "costPerPortion",
  'note', 'Historical cost data preserved from stored fields'
)::text
WHERE ("estimatedCost" IS NOT NULL OR "actualCost" IS NOT NULL)
  AND ("notes" IS NULL OR "notes" = '');

-- Step 4: Remove stored cost columns
ALTER TABLE "FoodProduction"
  DROP COLUMN IF EXISTS "estimatedCost",
  DROP COLUMN IF EXISTS "actualCost",
  DROP COLUMN IF EXISTS "costPerPortion";

-- Step 5: Verify migration
DO $$
DECLARE
  production_count INTEGER;
  usage_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO production_count FROM "FoodProduction";
  SELECT COUNT(*) INTO usage_count FROM "ProductionStockUsage";
  
  RAISE NOTICE '✅ Migration complete: % productions, % stock usage records', production_count, usage_count;
END $$;
```

---

### Step 3: Create FoodProductionCostService (3 hours)

```typescript
// src/features/sppg/production/services/FoodProductionCostService.ts

import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

export class FoodProductionCostService {
  /**
   * Calculate estimated cost for production based on current ingredient prices
   */
  async calculateEstimatedCost(
    menuId: string,
    targetPortions: number
  ): Promise<{
    estimatedCost: number
    costPerPortion: number
    breakdown: Array<{
      ingredientName: string
      quantity: number
      unit: string
      unitCost: number
      totalCost: number
    }>
  }> {
    const menu = await db.nutritionMenu.findUnique({
      where: { id: menuId },
      include: {
        ingredients: {
          include: {
            inventoryItem: true
          }
        }
      }
    })
    
    if (!menu) {
      throw new Error('Menu not found')
    }
    
    let totalCost = 0
    const breakdown: Array<{
      ingredientName: string
      quantity: number
      unit: string
      unitCost: number
      totalCost: number
    }> = []
    
    for (const ingredient of menu.ingredients) {
      const quantityNeeded = ingredient.quantity * targetPortions
      const currentPrice = ingredient.inventoryItem.pricePerUnit
      const ingredientCost = quantityNeeded * currentPrice
      
      totalCost += ingredientCost
      
      breakdown.push({
        ingredientName: ingredient.inventoryItem.itemName,
        quantity: quantityNeeded,
        unit: ingredient.inventoryItem.unit,
        unitCost: currentPrice,
        totalCost: ingredientCost
      })
    }
    
    return {
      estimatedCost: totalCost,
      costPerPortion: totalCost / targetPortions,
      breakdown
    }
  }
  
  /**
   * Calculate actual cost based on stock usage records (FIFO)
   */
  async calculateActualCost(
    productionId: string
  ): Promise<{
    actualCost: number
    costPerPortion: number
    actualPortions: number
    breakdown: Array<{
      ingredientName: string
      quantityUsed: number
      unit: string
      unitCost: number
      totalCost: number
      procurementBatch?: string
    }>
  }> {
    const production = await db.foodProduction.findUnique({
      where: { id: productionId },
      include: {
        stockUsages: {
          include: {
            inventoryItem: true,
            procurementItem: {
              include: {
                procurement: true
              }
            }
          }
        }
      }
    })
    
    if (!production) {
      throw new Error('Production not found')
    }
    
    if (!production.stockUsages || production.stockUsages.length === 0) {
      throw new Error('No stock usage records found for this production')
    }
    
    let totalCost = 0
    const breakdown: Array<{
      ingredientName: string
      quantityUsed: number
      unit: string
      unitCost: number
      totalCost: number
      procurementBatch?: string
    }> = []
    
    for (const usage of production.stockUsages) {
      totalCost += usage.totalCost
      
      breakdown.push({
        ingredientName: usage.inventoryItem.itemName,
        quantityUsed: usage.quantityUsed,
        unit: usage.inventoryItem.unit,
        unitCost: usage.unitCost,
        totalCost: usage.totalCost,
        procurementBatch: usage.procurementItem?.procurement.orderNumber
      })
    }
    
    const actualPortions = production.actualPortions || production.targetPortions
    
    return {
      actualCost: totalCost,
      costPerPortion: totalCost / actualPortions,
      actualPortions,
      breakdown
    }
  }
  
  /**
   * Record ingredient usage and deduct stock (with FIFO)
   */
  async recordIngredientUsage(
    productionId: string,
    ingredientUsages: Array<{
      inventoryItemId: string
      quantityUsed: number
    }>
  ): Promise<void> {
    await db.$transaction(async (tx) => {
      for (const usage of ingredientUsages) {
        // Calculate FIFO cost
        const fifoCost = await this.calculateFIFOCost(
          usage.inventoryItemId,
          usage.quantityUsed,
          tx
        )
        
        // Create stock usage record
        await tx.productionStockUsage.create({
          data: {
            productionId,
            inventoryItemId: usage.inventoryItemId,
            quantityUsed: usage.quantityUsed,
            procurementItemId: fifoCost.batches[0]?.procurementItemId,
            unitCost: fifoCost.averageCost,
            totalCost: fifoCost.totalCost
          }
        })
        
        // Create stock movement (OUT)
        await tx.stockMovement.create({
          data: {
            inventoryItemId: usage.inventoryItemId,
            movementType: 'OUT',
            quantity: usage.quantityUsed,
            unitCost: fifoCost.averageCost,
            totalCost: fifoCost.totalCost,
            referenceType: 'PRODUCTION',
            referenceId: productionId,
            notes: `Used in production`,
            performedBy: 'PRODUCTION_SYSTEM'
          }
        })
        
        // Update inventory stock
        await tx.inventoryItem.update({
          where: { id: usage.inventoryItemId },
          data: {
            currentStock: {
              decrement: usage.quantityUsed
            }
          }
        })
      }
    })
  }
  
  /**
   * Calculate cost variance (estimated vs actual)
   */
  async calculateCostVariance(
    productionId: string,
    menuId: string,
    targetPortions: number
  ): Promise<{
    estimatedCost: number
    actualCost: number
    variance: number
    variancePercent: number
    status: 'UNDER_BUDGET' | 'ON_BUDGET' | 'OVER_BUDGET'
  }> {
    const estimated = await this.calculateEstimatedCost(menuId, targetPortions)
    const actual = await this.calculateActualCost(productionId)
    
    const variance = actual.actualCost - estimated.estimatedCost
    const variancePercent = (variance / estimated.estimatedCost) * 100
    
    let status: 'UNDER_BUDGET' | 'ON_BUDGET' | 'OVER_BUDGET'
    if (Math.abs(variancePercent) < 5) {
      status = 'ON_BUDGET'
    } else if (variance < 0) {
      status = 'UNDER_BUDGET'
    } else {
      status = 'OVER_BUDGET'
    }
    
    return {
      estimatedCost: estimated.estimatedCost,
      actualCost: actual.actualCost,
      variance,
      variancePercent,
      status
    }
  }
  
  /**
   * Calculate waste cost impact
   */
  calculateWasteCost(
    costPerPortion: number,
    wasteQuantity: number
  ): number {
    return costPerPortion * wasteQuantity
  }
  
  /**
   * Helper: Calculate FIFO cost
   */
  private async calculateFIFOCost(
    inventoryItemId: string,
    quantityNeeded: number,
    tx: Prisma.TransactionClient
  ): Promise<{
    totalCost: number
    averageCost: number
    batches: Array<{
      procurementItemId: string
      quantity: number
      unitCost: number
    }>
  }> {
    // Get stock movements (IN) ordered by date (FIFO)
    const stockIns = await tx.stockMovement.findMany({
      where: {
        inventoryItemId,
        movementType: 'IN',
        procurementItemId: { not: null }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })
    
    let remainingQuantity = quantityNeeded
    let totalCost = 0
    const batches: Array<{
      procurementItemId: string
      quantity: number
      unitCost: number
    }> = []
    
    for (const stockIn of stockIns) {
      if (remainingQuantity <= 0) break
      
      const quantityToUse = Math.min(remainingQuantity, stockIn.quantity)
      const unitCost = stockIn.unitCost || 0
      
      batches.push({
        procurementItemId: stockIn.procurementItemId!,
        quantity: quantityToUse,
        unitCost
      })
      
      totalCost += quantityToUse * unitCost
      remainingQuantity -= quantityToUse
    }
    
    // If not enough in batches, use current price
    if (remainingQuantity > 0) {
      const inventory = await tx.inventoryItem.findUnique({
        where: { id: inventoryItemId }
      })
      
      totalCost += remainingQuantity * (inventory?.pricePerUnit || 0)
    }
    
    return {
      totalCost,
      averageCost: totalCost / quantityNeeded,
      batches
    }
  }
}
```

---

### Step 4: Update API Endpoints (2 hours)

```typescript
// src/app/api/sppg/production/[id]/costs/route.ts

import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { checkSppgAccess } from '@/lib/permissions'
import { FoodProductionCostService } from '@/features/sppg/production/services/FoodProductionCostService'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const sppg = await checkSppgAccess(session.user.sppgId)
    if (!sppg) {
      return Response.json({ error: 'SPPG access denied' }, { status: 403 })
    }
    
    const production = await db.foodProduction.findFirst({
      where: {
        id: params.id,
        program: { sppgId: sppg.id }
      },
      include: {
        menu: true
      }
    })
    
    if (!production) {
      return Response.json({ error: 'Production not found' }, { status: 404 })
    }
    
    const costService = new FoodProductionCostService()
    
    // Calculate costs
    const estimated = await costService.calculateEstimatedCost(
      production.menuId,
      production.targetPortions
    )
    
    let actual = null
    let variance = null
    
    if (production.productionStatus === 'COMPLETED') {
      actual = await costService.calculateActualCost(production.id)
      variance = await costService.calculateCostVariance(
        production.id,
        production.menuId,
        production.targetPortions
      )
    }
    
    return Response.json({
      success: true,
      data: {
        estimated,
        actual,
        variance
      }
    })
    
  } catch (error) {
    console.error('GET /api/sppg/production/[id]/costs error:', error)
    return Response.json({
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}
```

---

### Step 5: Update UI Components (2 hours)

```typescript
// src/features/sppg/production/components/ProductionCostCard.tsx

'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface ProductionCostCardProps {
  productionId: string
}

export function ProductionCostCard({ productionId }: ProductionCostCardProps) {
  const [costs, setCosts] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchCosts()
  }, [productionId])
  
  async function fetchCosts() {
    try {
      const response = await fetch(`/api/sppg/production/${productionId}/costs`)
      const data = await response.json()
      
      if (data.success) {
        setCosts(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch costs:', error)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) {
    return <div>Loading costs...</div>
  }
  
  if (!costs) {
    return <div>No cost data available</div>
  }
  
  const { estimated, actual, variance } = costs
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Production Costs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estimated Costs */}
        <div>
          <h4 className="font-semibold mb-2">Estimated Cost (Current Prices)</h4>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-bold">
                Rp {estimated.estimatedCost.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Per Portion:</span>
              <span className="font-bold">
                Rp {estimated.costPerPortion.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
          
          <Separator className="my-3" />
          
          {/* Breakdown */}
          <div className="space-y-2">
            <h5 className="text-sm font-medium">Ingredient Breakdown:</h5>
            {estimated.breakdown.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {item.ingredientName} ({item.quantity} {item.unit})
                </span>
                <span>
                  Rp {item.totalCost.toLocaleString('id-ID')}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Actual Costs (if completed) */}
        {actual && (
          <>
            <Separator />
            <div>
              <h4 className="font-semibold mb-2">Actual Cost (FIFO)</h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-bold">
                    Rp {actual.actualCost.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Per Portion:</span>
                  <span className="font-bold">
                    Rp {actual.costPerPortion.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* Cost Variance */}
        {variance && (
          <>
            <Separator />
            <div>
              <h4 className="font-semibold mb-2">Cost Variance</h4>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Difference:</span>
                <div className="flex items-center gap-2">
                  {variance.status === 'OVER_BUDGET' && (
                    <TrendingUp className="h-4 w-4 text-destructive" />
                  )}
                  {variance.status === 'UNDER_BUDGET' && (
                    <TrendingDown className="h-4 w-4 text-green-600" />
                  )}
                  {variance.status === 'ON_BUDGET' && (
                    <Minus className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className={
                    variance.status === 'OVER_BUDGET' ? 'text-destructive font-bold' :
                    variance.status === 'UNDER_BUDGET' ? 'text-green-600 font-bold' :
                    'font-bold'
                  }>
                    {variance.variance > 0 ? '+' : ''}
                    Rp {variance.variance.toLocaleString('id-ID')}
                  </span>
                  <Badge variant={
                    variance.status === 'OVER_BUDGET' ? 'destructive' :
                    variance.status === 'UNDER_BUDGET' ? 'success' :
                    'secondary'
                  }>
                    {variance.variancePercent > 0 ? '+' : ''}
                    {variance.variancePercent.toFixed(1)}%
                  </Badge>
                </div>
              </div>
              
              {variance.status === 'OVER_BUDGET' && (
                <Alert className="mt-3" variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Production cost exceeded budget by {variance.variancePercent.toFixed(1)}%.
                    Review ingredient usage and pricing.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
```

---

### Step 6: Testing (1 hour)

```typescript
// src/features/sppg/production/services/__tests__/FoodProductionCostService.test.ts

import { describe, it, expect, beforeEach } from '@jest/globals'
import { FoodProductionCostService } from '../FoodProductionCostService'
import { db } from '@/lib/db'

describe('FoodProductionCostService', () => {
  let service: FoodProductionCostService
  
  beforeEach(() => {
    service = new FoodProductionCostService()
  })
  
  it('should calculate estimated cost from current prices', async () => {
    // Setup test menu with ingredients
    const menu = await db.nutritionMenu.create({
      data: {
        menuName: 'Test Menu',
        ingredients: {
          create: [
            {
              inventoryItemId: 'chicken-id',
              quantity: 0.2,  // 200g per portion
              // Current price: Rp 52,000/kg
            },
            {
              inventoryItemId: 'rice-id',
              quantity: 0.15, // 150g per portion
              // Current price: Rp 14,000/kg
            }
          ]
        }
      }
    })
    
    const result = await service.calculateEstimatedCost(menu.id, 100)
    
    // Expected cost per portion:
    // Chicken: 0.2kg × Rp 52,000 = Rp 10,400
    // Rice: 0.15kg × Rp 14,000 = Rp 2,100
    // Total: Rp 12,500 × 100 portions = Rp 1,250,000
    
    expect(result.estimatedCost).toBe(1250000)
    expect(result.costPerPortion).toBe(12500)
    expect(result.breakdown).toHaveLength(2)
  })
  
  it('should calculate actual cost from stock usage (FIFO)', async () => {
    // Create production with stock usage
    const production = await db.foodProduction.create({
      data: {
        menuId: 'test-menu-id',
        targetPortions: 100,
        actualPortions: 98,
        stockUsages: {
          create: [
            {
              inventoryItemId: 'chicken-id',
              quantityUsed: 20,  // 20kg
              unitCost: 50000,   // Old batch @ Rp 50,000
              totalCost: 1000000
            },
            {
              inventoryItemId: 'rice-id',
              quantityUsed: 15,  // 15kg
              unitCost: 13000,   // Old batch @ Rp 13,000
              totalCost: 195000
            }
          ]
        }
      }
    })
    
    const result = await service.calculateActualCost(production.id)
    
    // Total actual: Rp 1,195,000
    // Per portion: Rp 1,195,000 / 98 = Rp 12,194
    
    expect(result.actualCost).toBe(1195000)
    expect(result.costPerPortion).toBeCloseTo(12194, 0)
    expect(result.actualPortions).toBe(98)
  })
  
  it('should calculate cost variance correctly', async () => {
    // Estimated: Rp 1,250,000 (current prices)
    // Actual: Rp 1,195,000 (FIFO from old batches)
    // Variance: -Rp 55,000 (-4.4%) = UNDER_BUDGET
    
    const variance = await service.calculateCostVariance(
      'production-id',
      'menu-id',
      100
    )
    
    expect(variance.estimatedCost).toBe(1250000)
    expect(variance.actualCost).toBe(1195000)
    expect(variance.variance).toBe(-55000)
    expect(variance.variancePercent).toBeCloseTo(-4.4, 1)
    expect(variance.status).toBe('UNDER_BUDGET')
  })
})
```

---

## ✅ Definition of Done

- [ ] ProductionStockUsage model created
- [ ] Stored cost fields removed from FoodProduction
- [ ] Historical data migrated to notes + stock usage records
- [ ] FoodProductionCostService implemented
- [ ] FIFO cost calculation working
- [ ] Cost variance tracking implemented
- [ ] Waste cost calculation added
- [ ] API endpoints updated
- [ ] UI shows real-time costs
- [ ] Unit tests pass (90%+ coverage)
- [ ] Integration tests pass
- [ ] Documentation updated

---

**Status**: ✅ Implementation plan complete  
**Next Step**: Execute after Fix #1 completed  
**Estimated Completion**: 2025-10-24 (1.5 days)
