# FIX #2: ProcurementItem-InventoryItem Inventory Link

**Priority**: 🔥🔥🔥 CRITICAL  
**Estimate**: 10 hours (1.5 days)  
**Status**: ⏳ PENDING  
**Dependencies**: None (can run parallel with Fix #1)  
**Phase**: 1 - Week 1

---

## 📋 Problem Statement

### Current Broken State

```prisma
model ProcurementItem {
  id              String      @id @default(cuid())
  procurementId   String
  
  // ❌ CRITICAL: Optional FK + free-text duplicate
  inventoryItemId String?     // Optional - BREAKS auto stock update
  itemName        String      // Free-text duplicate field
  itemCode        String      // Free-text duplicate field
  
  // ❌ Stored fields that should come from inventory
  category        String
  unit            String
  
  // Quantities & pricing
  quantityOrdered Float
  quantityReceived Float?
  unitPrice       Float
  totalPrice      Float
  
  // Relations
  procurement     Procurement @relation(fields: [procurementId], references: [id], onDelete: Cascade)
  inventoryItem   InventoryItem? @relation(fields: [inventoryItemId], references: [id])
}
```

### Issues Identified

1. **❌ CRITICAL - Optional InventoryItem Link**
   - `inventoryItemId` is optional → some items not linked to inventory
   - BREAKS auto stock update on procurement receive
   - BREAKS stock tracking and FIFO cost calculation
   
2. **❌ HIGH - Duplicate Free-Text Fields**
   - `itemName`, `itemCode`, `category`, `unit` duplicate InventoryItem fields
   - Creates data inconsistency
   - Makes reporting unreliable
   
3. **❌ MEDIUM - Manual Stock Update Required**
   - When procurement is received, staff must manually update inventory
   - Error-prone and time-consuming
   - No audit trail of stock source
   
4. **❌ MEDIUM - Incomplete Stock Movement Records**
   - Stock movements don't link to procurement items
   - Can't track which procurement batch stock came from
   - FIFO calculation impossible

---

## 💥 Business Impact

### Broken Workflow #1: Procurement → Stock Update

**Current Broken Flow:**
```typescript
// Step 1: Create procurement order
const procurement = await db.procurement.create({
  data: {
    items: {
      create: [
        {
          itemName: "Ayam Potong",        // ❌ Free text
          itemCode: "AYM-001",            // ❌ Free text
          category: "PROTEIN_HEWANI",     // ❌ Free text
          unit: "kg",                     // ❌ Free text
          quantityOrdered: 50,
          unitPrice: 45000,
          totalPrice: 2250000,
          inventoryItemId: undefined      // ❌ Not linked!
        }
      ]
    }
  }
})

// Step 2: Mark as received
await db.procurement.update({
  where: { id: procurement.id },
  data: { 
    status: 'RECEIVED',
    items: {
      update: {
        where: { id: item.id },
        data: { quantityReceived: 50 }
      }
    }
  }
})

// ❌ PROBLEM: Stock NOT automatically updated!
// Staff must manually:
// 1. Open inventory
// 2. Find "Ayam Potong" item
// 3. Create stock movement +50kg
// 4. Link to procurement (if they remember)

// Result: Often forgotten, incorrect quantities, missing audit trail
```

**Expected Fixed Flow:**
```typescript
// Step 1: Create procurement order with inventory link
const procurement = await db.procurement.create({
  data: {
    items: {
      create: [
        {
          inventoryItemId: "existing-ayam-potong-id",  // ✅ Required FK
          quantityOrdered: 50,
          unitPrice: 45000,
          totalPrice: 2250000
          // ✅ No duplicate fields - get from inventoryItem
        }
      ]
    }
  }
})

// Step 2: Mark as received - auto stock update
await markProcurementAsReceived(procurement.id)

// ✅ FIXED: Auto-creates stock movement
// ✅ Links to procurement item for audit trail
// ✅ Updates inventory currentStock
// ✅ Records FIFO batch for cost tracking
```

### Broken Workflow #2: Stock Reporting

**Problem:**
```typescript
// Try to generate stock report
const report = await db.inventoryItem.findMany({
  include: {
    procurementItems: true  // Get procurement history
  }
})

// ❌ PROBLEM: Many procurement items have inventoryItemId = null
// Can't calculate:
// - Total purchased quantity per item
// - Average purchase price
// - Supplier performance
// - Procurement frequency
// - Stock turnover rate
```

### Broken Workflow #3: FIFO Cost Calculation

**Problem:**
```typescript
// Try to calculate COGS using FIFO
const stockMovement = await db.stockMovement.create({
  data: {
    inventoryItemId: "ayam-potong-id",
    movementType: "OUT",
    quantity: 10,
    // ❌ PROBLEM: No link to procurement batch
    // Can't determine which batch to use for FIFO
    // Must use average cost instead (less accurate)
  }
})
```

---

## 🎯 Target State

### Fixed Schema

```prisma
model ProcurementItem {
  id              String      @id @default(cuid())
  procurementId   String
  
  // ✅ REQUIRED FK - every item must link to inventory
  inventoryItemId String
  
  // Quantities & pricing (keep these)
  quantityOrdered Float
  quantityReceived Float?
  unitPrice       Float
  totalPrice      Float
  
  // Timestamps
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  // Relations
  procurement     Procurement @relation(fields: [procurementId], references: [id], onDelete: Cascade)
  inventoryItem   InventoryItem @relation(fields: [inventoryItemId], references: [id])
  stockMovements  StockMovement[]  // ✅ Link to stock movements
  
  @@index([procurementId])
  @@index([inventoryItemId])
}

model StockMovement {
  // ... existing fields ...
  
  // ✅ NEW: Link to procurement item for FIFO
  procurementItemId String?
  procurementItem   ProcurementItem? @relation(fields: [procurementItemId], references: [id])
  
  @@index([procurementItemId])
}
```

### Benefits After Fix

1. **✅ Automatic Stock Updates**
   - Procurement receive → auto creates stock movement
   - No manual intervention required
   - Complete audit trail

2. **✅ FIFO Cost Tracking**
   - Each stock-in movement linked to procurement batch
   - Accurate COGS calculation
   - Better financial reporting

3. **✅ Accurate Reporting**
   - Procurement history per inventory item
   - Supplier performance analysis
   - Stock turnover metrics

4. **✅ Data Integrity**
   - No duplicate free-text fields
   - Single source of truth (InventoryItem)
   - Referential integrity enforced

---

## 📝 Implementation Plan

### Step 1: Data Analysis & Preparation (1.5 hours)

#### 1.1 Analyze Current Procurement Items

```sql
-- Count procurement items by link status
SELECT 
  CASE 
    WHEN "inventoryItemId" IS NOT NULL THEN 'Linked'
    ELSE 'Orphaned'
  END as status,
  COUNT(*) as count,
  COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () as percentage
FROM "ProcurementItem"
GROUP BY status;

-- Get orphaned items with details
SELECT 
  pi."id",
  pi."itemName",
  pi."itemCode",
  pi."category",
  pi."unit",
  pi."quantityOrdered",
  pi."quantityReceived",
  pi."unitPrice",
  p."sppgId",
  p."orderDate"
FROM "ProcurementItem" pi
JOIN "Procurement" p ON pi."procurementId" = p."id"
WHERE pi."inventoryItemId" IS NULL
ORDER BY p."orderDate" DESC;

-- Check for potential matches in inventory
SELECT 
  pi."itemName" as procurement_name,
  pi."itemCode" as procurement_code,
  ii."itemName" as inventory_name,
  ii."itemCode" as inventory_code,
  ii."id" as inventory_id,
  p."sppgId",
  SIMILARITY(pi."itemName", ii."itemName") as name_similarity
FROM "ProcurementItem" pi
JOIN "Procurement" p ON pi."procurementId" = p."id"
LEFT JOIN "InventoryItem" ii ON ii."sppgId" = p."sppgId"
WHERE pi."inventoryItemId" IS NULL
  AND SIMILARITY(pi."itemName", ii."itemName") > 0.6
ORDER BY p."sppgId", name_similarity DESC;
```

#### 1.2 Create Mapping Strategy

```typescript
// prisma/scripts/analyze-procurement-items.ts
interface ProcurementItemMapping {
  procurementItemId: string
  currentName: string
  currentCode: string
  
  // Matching strategy
  matchType: 'EXACT_CODE' | 'EXACT_NAME' | 'FUZZY_NAME' | 'CREATE_NEW'
  matchConfidence: number
  
  // Target inventory item
  inventoryItemId?: string
  inventoryItemName?: string
  
  // For creating new items
  shouldCreateNew: boolean
  suggestedData?: {
    itemName: string
    itemCode: string
    category: string
    unit: string
  }
}

async function analyzeProcurementItems(sppgId: string): Promise<ProcurementItemMapping[]> {
  const orphanedItems = await db.procurementItem.findMany({
    where: {
      inventoryItemId: null,
      procurement: { sppgId }
    },
    include: {
      procurement: true
    }
  })
  
  const inventoryItems = await db.inventoryItem.findMany({
    where: { sppgId }
  })
  
  const mappings: ProcurementItemMapping[] = []
  
  for (const item of orphanedItems) {
    // Try exact code match
    const exactCodeMatch = inventoryItems.find(
      ii => ii.itemCode === item.itemCode
    )
    
    if (exactCodeMatch) {
      mappings.push({
        procurementItemId: item.id,
        currentName: item.itemName,
        currentCode: item.itemCode,
        matchType: 'EXACT_CODE',
        matchConfidence: 1.0,
        inventoryItemId: exactCodeMatch.id,
        inventoryItemName: exactCodeMatch.itemName,
        shouldCreateNew: false
      })
      continue
    }
    
    // Try exact name match
    const exactNameMatch = inventoryItems.find(
      ii => ii.itemName.toLowerCase() === item.itemName.toLowerCase()
    )
    
    if (exactNameMatch) {
      mappings.push({
        procurementItemId: item.id,
        currentName: item.itemName,
        currentCode: item.itemCode,
        matchType: 'EXACT_NAME',
        matchConfidence: 0.95,
        inventoryItemId: exactNameMatch.id,
        inventoryItemName: exactNameMatch.itemName,
        shouldCreateNew: false
      })
      continue
    }
    
    // Try fuzzy name match (similarity > 0.8)
    const fuzzyMatches = inventoryItems
      .map(ii => ({
        item: ii,
        similarity: stringSimilarity(item.itemName, ii.itemName)
      }))
      .filter(m => m.similarity > 0.8)
      .sort((a, b) => b.similarity - a.similarity)
    
    if (fuzzyMatches.length > 0) {
      mappings.push({
        procurementItemId: item.id,
        currentName: item.itemName,
        currentCode: item.itemCode,
        matchType: 'FUZZY_NAME',
        matchConfidence: fuzzyMatches[0].similarity,
        inventoryItemId: fuzzyMatches[0].item.id,
        inventoryItemName: fuzzyMatches[0].item.itemName,
        shouldCreateNew: false
      })
      continue
    }
    
    // No match - create new inventory item
    mappings.push({
      procurementItemId: item.id,
      currentName: item.itemName,
      currentCode: item.itemCode,
      matchType: 'CREATE_NEW',
      matchConfidence: 0,
      shouldCreateNew: true,
      suggestedData: {
        itemName: item.itemName,
        itemCode: item.itemCode || `AUTO-${Date.now()}`,
        category: item.category,
        unit: item.unit
      }
    })
  }
  
  return mappings
}

// Helper function
function stringSimilarity(str1: string, str2: string): number {
  // Simple Levenshtein distance implementation
  const s1 = str1.toLowerCase()
  const s2 = str2.toLowerCase()
  
  const costs = []
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j
      } else if (j > 0) {
        let newValue = costs[j - 1]
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1
        }
        costs[j - 1] = lastValue
        lastValue = newValue
      }
    }
    if (i > 0) {
      costs[s2.length] = lastValue
    }
  }
  
  const maxLength = Math.max(s1.length, s2.length)
  return maxLength === 0 ? 1.0 : (maxLength - costs[s2.length]) / maxLength
}
```

---

### Step 2: Create Missing Inventory Items (2 hours)

```typescript
// prisma/scripts/create-missing-inventory-items.ts
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

interface CreatedItemResult {
  procurementItemId: string
  newInventoryItemId: string
  itemName: string
  itemCode: string
}

async function createMissingInventoryItems(): Promise<CreatedItemResult[]> {
  const results: CreatedItemResult[] = []
  
  // Get all SPPG
  const sppgs = await db.sppg.findMany({
    where: { status: 'ACTIVE' }
  })
  
  for (const sppg of sppgs) {
    console.log(`\n🏢 Processing SPPG: ${sppg.sppgName}`)
    
    // Get mappings for this SPPG
    const mappings = await analyzeProcurementItems(sppg.id)
    const toCreate = mappings.filter(m => m.shouldCreateNew)
    
    console.log(`  📊 Found ${toCreate.length} items to create`)
    
    for (const mapping of toCreate) {
      try {
        // Create new inventory item
        const newItem = await db.inventoryItem.create({
          data: {
            sppgId: sppg.id,
            itemName: mapping.suggestedData!.itemName,
            itemCode: mapping.suggestedData!.itemCode,
            category: mapping.suggestedData!.category,
            unit: mapping.suggestedData!.unit,
            
            // Default values
            status: 'ACTIVE',
            storageLocation: 'WAREHOUSE',
            currentStock: 0,
            minimumStock: 0,
            maximumStock: 1000,
            reorderPoint: 0,
            pricePerUnit: 0,
            
            // Metadata
            description: `Auto-created from procurement item: ${mapping.currentName}`,
            isPerishable: false,
            shelfLifeDays: null
          }
        })
        
        console.log(`  ✅ Created: ${newItem.itemName} (${newItem.itemCode})`)
        
        results.push({
          procurementItemId: mapping.procurementItemId,
          newInventoryItemId: newItem.id,
          itemName: newItem.itemName,
          itemCode: newItem.itemCode
        })
        
      } catch (error) {
        console.error(`  ❌ Failed to create item for ${mapping.currentName}:`, error)
      }
    }
  }
  
  return results
}

// Run script
createMissingInventoryItems()
  .then(results => {
    console.log(`\n✅ Created ${results.length} new inventory items`)
    console.log('Results:', JSON.stringify(results, null, 2))
  })
  .catch(error => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
  .finally(() => {
    db.$disconnect()
  })
```

---

### Step 3: Link Procurement Items to Inventory (2 hours)

```typescript
// prisma/scripts/link-procurement-items-to-inventory.ts
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

interface LinkResult {
  procurementItemId: string
  inventoryItemId: string
  matchType: string
  confidence: number
}

async function linkProcurementItemsToInventory(): Promise<LinkResult[]> {
  const results: LinkResult[] = []
  let totalUpdated = 0
  let totalFailed = 0
  
  // Get all SPPG
  const sppgs = await db.sppg.findMany({
    where: { status: 'ACTIVE' }
  })
  
  for (const sppg of sppgs) {
    console.log(`\n🏢 Processing SPPG: ${sppg.sppgName}`)
    
    // Get mappings (including newly created items)
    const mappings = await analyzeProcurementItems(sppg.id)
    
    console.log(`  📊 Found ${mappings.length} items to link`)
    
    for (const mapping of mappings) {
      // Skip if already linked
      const existing = await db.procurementItem.findUnique({
        where: { id: mapping.procurementItemId }
      })
      
      if (existing?.inventoryItemId) {
        console.log(`  ⏭️  Already linked: ${mapping.currentName}`)
        continue
      }
      
      try {
        // Update procurement item with inventory link
        await db.procurementItem.update({
          where: { id: mapping.procurementItemId },
          data: {
            inventoryItemId: mapping.inventoryItemId!
          }
        })
        
        console.log(`  ✅ Linked: ${mapping.currentName} → ${mapping.inventoryItemName} (${mapping.matchType}, ${(mapping.matchConfidence * 100).toFixed(0)}%)`)
        
        results.push({
          procurementItemId: mapping.procurementItemId,
          inventoryItemId: mapping.inventoryItemId!,
          matchType: mapping.matchType,
          confidence: mapping.matchConfidence
        })
        
        totalUpdated++
        
      } catch (error) {
        console.error(`  ❌ Failed to link ${mapping.currentName}:`, error)
        totalFailed++
      }
    }
  }
  
  console.log(`\n📊 Summary:`)
  console.log(`  ✅ Linked: ${totalUpdated}`)
  console.log(`  ❌ Failed: ${totalFailed}`)
  
  return results
}

// Run script
linkProcurementItemsToInventory()
  .then(results => {
    console.log(`\n✅ Linked ${results.length} procurement items`)
    
    // Group by match type
    const byType = results.reduce((acc, r) => {
      acc[r.matchType] = (acc[r.matchType] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    console.log('\n📊 By Match Type:')
    Object.entries(byType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`)
    })
  })
  .catch(error => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
  .finally(() => {
    db.$disconnect()
  })
```

---

### Step 4: Schema Migration (1.5 hours)

#### 4.1 Create Prisma Migration

```prisma
// prisma/migrations/YYYYMMDDHHMMSS_fix_procurement_item_inventory_link/migration.sql

-- Step 1: Verify all procurement items are linked
DO $$
DECLARE
  orphaned_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO orphaned_count
  FROM "ProcurementItem"
  WHERE "inventoryItemId" IS NULL;
  
  IF orphaned_count > 0 THEN
    RAISE EXCEPTION 'Found % procurement items without inventoryItemId. Run migration scripts first!', orphaned_count;
  END IF;
END $$;

-- Step 2: Make inventoryItemId required
ALTER TABLE "ProcurementItem"
  ALTER COLUMN "inventoryItemId" SET NOT NULL;

-- Step 3: Remove duplicate fields (migrate to notes if needed)
-- Preserve data in notes field for audit trail
ALTER TABLE "ProcurementItem"
  ADD COLUMN IF NOT EXISTS "notes" TEXT;

UPDATE "ProcurementItem"
SET "notes" = CONCAT(
  'Legacy data: ',
  'Name: ', "itemName", ', ',
  'Code: ', "itemCode", ', ',
  'Category: ', "category", ', ',
  'Unit: ', "unit"
)
WHERE "notes" IS NULL OR "notes" = '';

-- Drop duplicate columns
ALTER TABLE "ProcurementItem"
  DROP COLUMN IF EXISTS "itemName",
  DROP COLUMN IF EXISTS "itemCode",
  DROP COLUMN IF EXISTS "category",
  DROP COLUMN IF EXISTS "unit";

-- Step 4: Add index for performance
CREATE INDEX IF NOT EXISTS "ProcurementItem_inventoryItemId_idx"
  ON "ProcurementItem"("inventoryItemId");

-- Step 5: Add StockMovement.procurementItemId for FIFO tracking
ALTER TABLE "StockMovement"
  ADD COLUMN IF NOT EXISTS "procurementItemId" TEXT;

-- Add foreign key
ALTER TABLE "StockMovement"
  ADD CONSTRAINT "StockMovement_procurementItemId_fkey"
  FOREIGN KEY ("procurementItemId")
  REFERENCES "ProcurementItem"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;

-- Add index
CREATE INDEX IF NOT EXISTS "StockMovement_procurementItemId_idx"
  ON "StockMovement"("procurementItemId");

-- Step 6: Verify final state
DO $$
DECLARE
  total_count INTEGER;
  linked_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_count FROM "ProcurementItem";
  SELECT COUNT(*) INTO linked_count FROM "ProcurementItem" WHERE "inventoryItemId" IS NOT NULL;
  
  IF total_count != linked_count THEN
    RAISE EXCEPTION 'Verification failed: % total items, % linked', total_count, linked_count;
  END IF;
  
  RAISE NOTICE '✅ Migration successful: % procurement items with required inventory links', total_count;
END $$;
```

#### 4.2 Update Prisma Schema

```prisma
model ProcurementItem {
  id              String      @id @default(cuid())
  procurementId   String
  
  // ✅ REQUIRED FK
  inventoryItemId String
  
  // Quantities & pricing
  quantityOrdered Float
  quantityReceived Float?
  unitPrice       Float
  totalPrice      Float
  
  // Notes (preserved legacy data)
  notes           String?
  
  // Timestamps
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  // Relations
  procurement     Procurement @relation(fields: [procurementId], references: [id], onDelete: Cascade)
  inventoryItem   InventoryItem @relation(fields: [inventoryItemId], references: [id])
  stockMovements  StockMovement[]
  
  @@index([procurementId])
  @@index([inventoryItemId])
}

model StockMovement {
  // ... existing fields ...
  
  // ✅ NEW: Link to procurement item for FIFO
  procurementItemId String?
  procurementItem   ProcurementItem? @relation(fields: [procurementItemId], references: [id])
  
  @@index([procurementItemId])
}
```

---

### Step 5: Update API & Services (2 hours)

#### 5.1 Create ProcurementReceiveService

```typescript
// src/features/sppg/procurement/services/ProcurementReceiveService.ts

import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

export class ProcurementReceiveService {
  /**
   * Mark procurement as received and auto-update stock
   */
  async markAsReceived(
    procurementId: string,
    receivedItems: Array<{
      procurementItemId: string
      quantityReceived: number
    }>,
    sppgId: string
  ): Promise<void> {
    // Verify procurement belongs to SPPG
    const procurement = await db.procurement.findFirst({
      where: {
        id: procurementId,
        sppgId
      },
      include: {
        items: {
          include: {
            inventoryItem: true
          }
        }
      }
    })
    
    if (!procurement) {
      throw new Error('Procurement not found or access denied')
    }
    
    // Process in transaction
    await db.$transaction(async (tx) => {
      // Update procurement status
      await tx.procurement.update({
        where: { id: procurementId },
        data: {
          status: 'RECEIVED',
          receiveDate: new Date()
        }
      })
      
      // Process each item
      for (const receivedItem of receivedItems) {
        const procurementItem = procurement.items.find(
          item => item.id === receivedItem.procurementItemId
        )
        
        if (!procurementItem) {
          throw new Error(`Procurement item ${receivedItem.procurementItemId} not found`)
        }
        
        // Update procurement item with received quantity
        await tx.procurementItem.update({
          where: { id: receivedItem.procurementItemId },
          data: {
            quantityReceived: receivedItem.quantityReceived
          }
        })
        
        // Create stock movement (IN)
        const stockMovement = await tx.stockMovement.create({
          data: {
            inventoryItemId: procurementItem.inventoryItemId,
            movementType: 'IN',
            quantity: receivedItem.quantityReceived,
            
            // ✅ Link to procurement item for FIFO
            procurementItemId: procurementItem.id,
            
            // FIFO batch tracking
            batchNumber: `PROC-${procurement.orderNumber}`,
            unitCost: procurementItem.unitPrice,
            totalCost: procurementItem.unitPrice * receivedItem.quantityReceived,
            
            // Reference
            referenceType: 'PROCUREMENT',
            referenceId: procurementId,
            notes: `Received from procurement ${procurement.orderNumber}`,
            
            // User tracking
            performedBy: procurement.createdBy || 'SYSTEM'
          }
        })
        
        // Update inventory current stock
        await tx.inventoryItem.update({
          where: { id: procurementItem.inventoryItemId },
          data: {
            currentStock: {
              increment: receivedItem.quantityReceived
            },
            lastRestockDate: new Date(),
            pricePerUnit: procurementItem.unitPrice // Update with latest price
          }
        })
        
        console.log(`✅ Stock updated: ${procurementItem.inventoryItem.itemName} +${receivedItem.quantityReceived} ${procurementItem.inventoryItem.unit}`)
      }
    })
  }
  
  /**
   * Calculate FIFO cost for stock out
   */
  async calculateFIFOCost(
    inventoryItemId: string,
    quantityOut: number
  ): Promise<{
    totalCost: number
    averageCost: number
    batches: Array<{
      procurementItemId: string
      quantity: number
      unitCost: number
    }>
  }> {
    // Get stock movements (IN) with procurement links, ordered by date (FIFO)
    const stockIns = await db.stockMovement.findMany({
      where: {
        inventoryItemId,
        movementType: 'IN',
        procurementItemId: { not: null }
      },
      orderBy: {
        createdAt: 'asc' // FIFO
      },
      include: {
        procurementItem: true
      }
    })
    
    let remainingQuantity = quantityOut
    let totalCost = 0
    const batches: Array<{
      procurementItemId: string
      quantity: number
      unitCost: number
    }> = []
    
    for (const stockIn of stockIns) {
      if (remainingQuantity <= 0) break
      
      const availableQuantity = stockIn.quantity
      const quantityToUse = Math.min(remainingQuantity, availableQuantity)
      const unitCost = stockIn.unitCost || 0
      
      batches.push({
        procurementItemId: stockIn.procurementItemId!,
        quantity: quantityToUse,
        unitCost
      })
      
      totalCost += quantityToUse * unitCost
      remainingQuantity -= quantityToUse
    }
    
    if (remainingQuantity > 0) {
      // Not enough stock in tracked batches, use current price
      const inventory = await db.inventoryItem.findUnique({
        where: { id: inventoryItemId }
      })
      
      totalCost += remainingQuantity * (inventory?.pricePerUnit || 0)
    }
    
    return {
      totalCost,
      averageCost: totalCost / quantityOut,
      batches
    }
  }
}
```

#### 5.2 Update API Endpoint

```typescript
// src/app/api/sppg/procurement/[id]/receive/route.ts

import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { checkSppgAccess } from '@/lib/permissions'
import { z } from 'zod'
import { ProcurementReceiveService } from '@/features/sppg/procurement/services/ProcurementReceiveService'

const receiveSchema = z.object({
  items: z.array(
    z.object({
      procurementItemId: z.string().cuid(),
      quantityReceived: z.number().positive()
    })
  ).min(1)
})

export async function POST(
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
    
    const body = await request.json()
    const validated = receiveSchema.safeParse(body)
    
    if (!validated.success) {
      return Response.json({
        error: 'Validation failed',
        details: validated.error.errors
      }, { status: 400 })
    }
    
    const service = new ProcurementReceiveService()
    await service.markAsReceived(
      params.id,
      validated.data.items,
      sppg.id
    )
    
    return Response.json({
      success: true,
      message: 'Procurement marked as received, stock updated automatically'
    })
    
  } catch (error) {
    console.error('POST /api/sppg/procurement/[id]/receive error:', error)
    return Response.json({
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}
```

---

### Step 6: Update UI Components (1.5 hours)

#### 6.1 ProcurementItemForm Component

```typescript
// src/features/sppg/procurement/components/ProcurementItemForm.tsx

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { InventoryItemCombobox } from '@/features/sppg/inventory/components/InventoryItemCombobox'

const procurementItemSchema = z.object({
  inventoryItemId: z.string().cuid('Select an inventory item'),
  quantityOrdered: z.number().positive('Quantity must be positive'),
  unitPrice: z.number().positive('Price must be positive')
})

type ProcurementItemInput = z.infer<typeof procurementItemSchema>

interface ProcurementItemFormProps {
  onSubmit: (data: ProcurementItemInput) => void
  onCancel: () => void
}

export function ProcurementItemForm({ onSubmit, onCancel }: ProcurementItemFormProps) {
  const [selectedItem, setSelectedItem] = useState<any>(null)
  
  const form = useForm<ProcurementItemInput>({
    resolver: zodResolver(procurementItemSchema),
    defaultValues: {
      inventoryItemId: '',
      quantityOrdered: 0,
      unitPrice: 0
    }
  })
  
  const handleInventoryItemSelect = (item: any) => {
    setSelectedItem(item)
    form.setValue('inventoryItemId', item.id)
    
    // Auto-fill unit price from inventory
    if (item.pricePerUnit > 0) {
      form.setValue('unitPrice', item.pricePerUnit)
    }
  }
  
  const quantityOrdered = form.watch('quantityOrdered')
  const unitPrice = form.watch('unitPrice')
  const totalPrice = quantityOrdered * unitPrice
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Inventory Item Selection */}
        <FormField
          control={form.control}
          name="inventoryItemId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Inventory Item *</FormLabel>
              <FormControl>
                <InventoryItemCombobox
                  value={field.value}
                  onSelect={handleInventoryItemSelect}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Show selected item info */}
        {selectedItem && (
          <div className="rounded-lg border p-3 bg-muted/50">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Code:</span> {selectedItem.itemCode}
              </div>
              <div>
                <span className="text-muted-foreground">Unit:</span> {selectedItem.unit}
              </div>
              <div>
                <span className="text-muted-foreground">Current Stock:</span> {selectedItem.currentStock}
              </div>
              <div>
                <span className="text-muted-foreground">Last Price:</span> Rp {selectedItem.pricePerUnit.toLocaleString()}
              </div>
            </div>
          </div>
        )}
        
        {/* Quantity */}
        <FormField
          control={form.control}
          name="quantityOrdered"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity Ordered *</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0"
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
                  />
                  {selectedItem && (
                    <span className="flex items-center text-sm text-muted-foreground">
                      {selectedItem.unit}
                    </span>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Unit Price */}
        <FormField
          control={form.control}
          name="unitPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit Price *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0"
                  {...field}
                  onChange={e => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Total Price Display */}
        <div className="rounded-lg border p-3 bg-primary/5">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total Price:</span>
            <span className="text-lg font-bold">
              Rp {totalPrice.toLocaleString('id-ID')}
            </span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            Add Item
          </Button>
        </div>
      </form>
    </Form>
  )
}
```

---

### Step 7: Testing (1 hour)

#### 7.1 Unit Tests

```typescript
// src/features/sppg/procurement/services/__tests__/ProcurementReceiveService.test.ts

import { describe, it, expect, beforeEach } from '@jest/globals'
import { ProcurementReceiveService } from '../ProcurementReceiveService'
import { db } from '@/lib/db'

describe('ProcurementReceiveService', () => {
  let service: ProcurementReceiveService
  let testSppgId: string
  let testInventoryItemId: string
  let testProcurementId: string
  
  beforeEach(async () => {
    service = new ProcurementReceiveService()
    
    // Setup test data
    const sppg = await db.sppg.create({
      data: {
        sppgName: 'Test SPPG',
        sppgCode: 'TEST-001',
        // ... other required fields
      }
    })
    testSppgId = sppg.id
    
    const inventoryItem = await db.inventoryItem.create({
      data: {
        sppgId: testSppgId,
        itemName: 'Test Item',
        itemCode: 'TEST-ITEM-001',
        category: 'TEST',
        unit: 'kg',
        currentStock: 0,
        pricePerUnit: 10000
      }
    })
    testInventoryItemId = inventoryItem.id
    
    const procurement = await db.procurement.create({
      data: {
        sppgId: testSppgId,
        orderNumber: 'PO-TEST-001',
        orderDate: new Date(),
        status: 'PENDING',
        items: {
          create: [
            {
              inventoryItemId: testInventoryItemId,
              quantityOrdered: 50,
              unitPrice: 10000,
              totalPrice: 500000
            }
          ]
        }
      }
    })
    testProcurementId = procurement.id
  })
  
  it('should mark procurement as received and update stock', async () => {
    const procurementItem = await db.procurementItem.findFirst({
      where: { procurementId: testProcurementId }
    })
    
    await service.markAsReceived(
      testProcurementId,
      [{ procurementItemId: procurementItem!.id, quantityReceived: 50 }],
      testSppgId
    )
    
    // Verify procurement status
    const updatedProcurement = await db.procurement.findUnique({
      where: { id: testProcurementId }
    })
    expect(updatedProcurement?.status).toBe('RECEIVED')
    
    // Verify stock movement created
    const stockMovement = await db.stockMovement.findFirst({
      where: {
        inventoryItemId: testInventoryItemId,
        procurementItemId: procurementItem!.id
      }
    })
    expect(stockMovement).toBeDefined()
    expect(stockMovement?.quantity).toBe(50)
    expect(stockMovement?.movementType).toBe('IN')
    
    // Verify inventory updated
    const updatedInventory = await db.inventoryItem.findUnique({
      where: { id: testInventoryItemId }
    })
    expect(updatedInventory?.currentStock).toBe(50)
  })
  
  it('should calculate FIFO cost correctly', async () => {
    // Create multiple stock ins with different prices
    await db.stockMovement.createMany({
      data: [
        {
          inventoryItemId: testInventoryItemId,
          movementType: 'IN',
          quantity: 20,
          unitCost: 10000,
          performedBy: 'TEST'
        },
        {
          inventoryItemId: testInventoryItemId,
          movementType: 'IN',
          quantity: 30,
          unitCost: 12000,
          performedBy: 'TEST'
        }
      ]
    })
    
    // Calculate FIFO for 35 units
    const result = await service.calculateFIFOCost(testInventoryItemId, 35)
    
    // Should use 20 units @ 10000 + 15 units @ 12000
    expect(result.totalCost).toBe(20 * 10000 + 15 * 12000)
    expect(result.averageCost).toBe((20 * 10000 + 15 * 12000) / 35)
    expect(result.batches).toHaveLength(2)
  })
})
```

---

### Step 8: Verification & Documentation (0.5 hours)

#### 8.1 Post-Implementation Verification

```sql
-- 1. Verify all procurement items have inventory links
SELECT 
  COUNT(*) as total_items,
  COUNT(CASE WHEN "inventoryItemId" IS NOT NULL THEN 1 END) as linked_items,
  COUNT(CASE WHEN "inventoryItemId" IS NULL THEN 1 END) as orphaned_items
FROM "ProcurementItem";
-- Expected: orphaned_items = 0

-- 2. Verify stock movements link to procurement
SELECT 
  sm."id",
  sm."movementType",
  sm."quantity",
  sm."procurementItemId",
  pi."id" as proc_item_id,
  ii."itemName"
FROM "StockMovement" sm
LEFT JOIN "ProcurementItem" pi ON sm."procurementItemId" = pi."id"
LEFT JOIN "InventoryItem" ii ON sm."inventoryItemId" = ii."id"
WHERE sm."movementType" = 'IN'
  AND sm."referenceType" = 'PROCUREMENT'
ORDER BY sm."createdAt" DESC
LIMIT 10;

-- 3. Test FIFO calculation
SELECT 
  ii."itemName",
  sm."quantity",
  sm."unitCost",
  sm."createdAt",
  pi."id" as procurement_item_id
FROM "InventoryItem" ii
JOIN "StockMovement" sm ON ii."id" = sm."inventoryItemId"
LEFT JOIN "ProcurementItem" pi ON sm."procurementItemId" = pi."id"
WHERE sm."movementType" = 'IN'
  AND ii."id" = 'test-inventory-item-id'
ORDER BY sm."createdAt" ASC;

-- 4. Verify no duplicate fields remain
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'ProcurementItem'
  AND column_name IN ('itemName', 'itemCode', 'category', 'unit');
-- Expected: 0 rows

-- 5. Verify performance (should use index)
EXPLAIN ANALYZE
SELECT * FROM "ProcurementItem"
WHERE "inventoryItemId" = 'test-id';
-- Should show "Index Scan using ProcurementItem_inventoryItemId_idx"
```

#### 8.2 Post-Implementation Checklist

- [ ] **Data Migration**
  - [ ] All procurement items linked to inventory (0 orphans)
  - [ ] Missing inventory items created automatically
  - [ ] Legacy data preserved in notes field
  
- [ ] **Schema Updates**
  - [ ] inventoryItemId is NOT NULL
  - [ ] Duplicate fields removed (itemName, itemCode, category, unit)
  - [ ] StockMovement.procurementItemId added
  - [ ] Indexes created for performance
  
- [ ] **API & Services**
  - [ ] ProcurementReceiveService implemented
  - [ ] Auto stock update on receive
  - [ ] FIFO cost calculation working
  - [ ] API endpoint /receive created
  
- [ ] **UI Components**
  - [ ] ProcurementItemForm uses InventoryItemCombobox
  - [ ] No free-text item entry
  - [ ] Auto-fill unit price from inventory
  - [ ] Real-time total price calculation
  
- [ ] **Testing**
  - [ ] Unit tests pass (90%+ coverage)
  - [ ] Integration tests pass
  - [ ] Manual testing completed
  
- [ ] **Documentation**
  - [ ] API documentation updated
  - [ ] Migration guide created
  - [ ] User guide updated with new workflow

---

## 📊 Success Metrics

### Data Quality Metrics

```typescript
interface SuccessMetrics {
  dataIntegrity: {
    linkedProcurementItems: '100%'       // All items must have inventoryItemId
    orphanedItems: '0'                   // No items without inventory link
    duplicateFields: '0'                 // No free-text duplicates
  }
  
  automation: {
    autoStockUpdate: '100%'              // All receives auto-update stock
    manualStockEntryReduced: '100%'      // Eliminate manual entry
    stockMovementTracking: '100%'        // All movements linked to source
  }
  
  reporting: {
    procurementHistoryAccuracy: '100%'   // Can track all procurement per item
    fifoCostCalculation: 'Enabled'       // FIFO batch tracking works
    supplierPerformance: 'Trackable'     // Can analyze by supplier
  }
  
  performance: {
    procurementItemQuery: '<50ms'        // Indexed queries fast
    stockUpdateTransaction: '<200ms'     // Atomic updates quick
    fifoCostCalculation: '<100ms'        // Cost calculation efficient
  }
}
```

### Monitoring Setup

```typescript
// src/lib/monitoring/procurement-metrics.ts

export const procurementMetrics = {
  // Track orphaned items (should always be 0)
  async checkOrphanedItems(): Promise<number> {
    const count = await db.procurementItem.count({
      where: { inventoryItemId: null }
    })
    
    if (count > 0) {
      console.error(`🚨 ALERT: ${count} orphaned procurement items detected!`)
    }
    
    return count
  },
  
  // Track auto stock update success rate
  async trackAutoStockUpdate(procurementId: string): Promise<void> {
    const procurement = await db.procurement.findUnique({
      where: { id: procurementId },
      include: {
        items: {
          include: {
            stockMovements: true
          }
        }
      }
    })
    
    const totalItems = procurement?.items.length || 0
    const itemsWithStockMovement = procurement?.items.filter(
      item => item.stockMovements.length > 0
    ).length || 0
    
    const successRate = totalItems > 0 ? (itemsWithStockMovement / totalItems) * 100 : 0
    
    console.log(`📊 Auto stock update rate: ${successRate.toFixed(2)}%`)
    
    if (successRate < 100) {
      console.error(`🚨 ALERT: Some items not auto-updated for procurement ${procurementId}`)
    }
  }
}
```

---

## 🚀 Deployment Plan

### Phase 1: Staging Deployment (Day 1)

1. **Deploy to staging environment**
2. **Run migration scripts** with production-like data
3. **Test all workflows**:
   - Create procurement order
   - Mark as received
   - Verify stock updated
   - Check FIFO calculation
4. **Monitor metrics** for 24 hours

### Phase 2: Beta Testing (Day 2-3)

1. **Deploy to beta SPPG** (1-2 friendly users)
2. **Real-world testing**:
   - Create actual procurement orders
   - Receive orders
   - Generate reports
3. **Collect feedback** and fix issues

### Phase 3: Gradual Rollout (Day 4-5)

1. **Deploy to 10% of SPPG** (Day 4)
2. **Monitor for issues** (24 hours)
3. **Deploy to 50% of SPPG** (Day 5 morning)
4. **Monitor for issues** (12 hours)
5. **Deploy to 100%** (Day 5 evening)

### Phase 4: Post-Deployment Monitoring (Day 6-7)

1. **Monitor orphaned items metric** (should stay 0)
2. **Track auto stock update rate** (should be 100%)
3. **Review user feedback**
4. **Generate success report**

---

## ✅ Definition of Done

- [ ] All procurement items have required inventoryItemId
- [ ] No orphaned procurement items (0 count)
- [ ] Duplicate fields removed from schema
- [ ] StockMovement links to ProcurementItem for FIFO
- [ ] Auto stock update works on procurement receive
- [ ] FIFO cost calculation implemented and tested
- [ ] UI components updated (no free-text item entry)
- [ ] Unit tests pass with 90%+ coverage
- [ ] Integration tests pass
- [ ] API documentation updated
- [ ] Migration guide created
- [ ] Deployed to production
- [ ] Monitoring metrics in place
- [ ] User training completed
- [ ] Success metrics achieved

---

## 📚 Related Documents

- **Audit**: `SPPG_MODULE_ENTERPRISE_AUDIT.md` - Issue #2
- **Roadmap**: `PHASE1_CRITICAL_FIXES_ROADMAP.md` - Week 1
- **Related Fix**: `FIX01_MENU_INGREDIENT_INVENTORY_LINK.md` - Similar pattern
- **Schema**: `prisma/schema.prisma` - ProcurementItem, StockMovement models

---

**Status**: ✅ Implementation plan complete, ready for execution  
**Next Step**: Execute migration scripts and deploy  
**Estimated Completion**: 2025-10-23 (2 days from now)
