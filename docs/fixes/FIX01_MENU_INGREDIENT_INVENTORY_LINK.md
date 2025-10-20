# 🔥 FIX #1: MenuIngredient → InventoryItem Required Link

**Priority**: 🔥🔥🔥 **CRITICAL - HIGHEST**  
**Impact**: Restores entire inventory management system  
**Estimate**: **16 hours**  
**Status**: 📋 Ready to implement  
**Week**: Week 1 (Days 1-2)

---

## 🎯 Problem Statement

### Current State (BROKEN ❌)

```prisma
model MenuIngredient {
  id               String         @id @default(cuid())
  menuId           String
  inventoryItemId  String?        // ❌ OPTIONAL - Can be NULL
  ingredientName   String         // ❌ FREE TEXT - Duplicate data
  quantity         Float
  unit             String
  costPerUnit      Float          // ❌ STORED - Gets outdated
  totalCost        Float          // ❌ STORED - Gets outdated
  
  menu             NutritionMenu    @relation(...)
  inventoryItem    InventoryItem? @relation(...) // ❌ Optional
}
```

### Issues
1. ❌ Can create menu ingredients **without inventory link**
2. ❌ Free-text `ingredientName` **duplicates** `inventoryItem.itemName`
3. ❌ Stored `costPerUnit` **gets outdated** when inventory prices change
4. ❌ **BREAKS stock deduction** - Can't deduct stock when production happens
5. ❌ **BREAKS procurement planning** - Can't calculate ingredient needs
6. ❌ **BREAKS cost tracking** - Manual costs unreliable

---

## 💥 Business Impact

### Broken Workflows

#### ❌ **Scenario 1: Menu Creation with Wrong Costs**
```typescript
// Chef creates menu manually
const menu = await createMenu({
  menuName: "Nasi Gudeg Ayam",
  ingredients: [
    {
      ingredientName: "Ayam", // ❌ Free text, no inventory link
      quantity: 0.2,
      unit: "kg",
      costPerUnit: 45000, // ❌ Manual entry
      totalCost: 9000
    }
  ]
})

// PROBLEM: Next week, chicken price increases to 52,000/kg
// Menu still shows 45,000/kg ❌ OUTDATED!
```

#### ❌ **Scenario 2: Production Without Stock Deduction**
```typescript
// Kitchen produces 100 portions
await createProduction({
  menuId: menu.id,
  portions: 100
})

// PROBLEM: Inventory stock NOT deducted!
// Still shows 500kg chicken, should be 480kg
// Stock tracking BROKEN ❌
```

#### ❌ **Scenario 3: Procurement Planning Impossible**
```typescript
// Try to calculate procurement needs
const needs = await calculateProcurementNeeds({
  startDate: '2025-10-21',
  endDate: '2025-10-31'
})

// PROBLEM: Returns empty!
// Can't link menu ingredients to inventory items
// Procurement planning BROKEN ❌
```

---

## ✅ Target State (FIXED)

### Fixed Schema

```prisma
model MenuIngredient {
  id              String         @id @default(cuid())
  menuId          String
  inventoryItemId String         // ✅ REQUIRED - Cannot be NULL
  quantity        Float
  unit            String
  notes           String?        // ✅ NEW: Optional notes
  
  // ✅ REMOVED: ingredientName, costPerUnit, totalCost
  // ✅ CALCULATE: Costs from inventoryItem.pricePerUnit at runtime
  
  menu            NutritionMenu    @relation(...)
  inventoryItem   InventoryItem    @relation(...) // ✅ Required
  
  @@index([menuId])
  @@index([inventoryItemId])
  @@map("menu_ingredients")
}
```

### Benefits
- ✅ **Referential integrity** - All ingredients MUST exist in inventory
- ✅ **No duplicate data** - Single source of truth
- ✅ **Real-time costs** - Always calculate from current inventory prices
- ✅ **Stock deduction** - Automatic when production happens
- ✅ **Procurement planning** - Can calculate needs accurately
- ✅ **Reporting** - Reliable cost tracking

---

## 🛠️ Implementation Plan

### Step 1: Data Analysis & Preparation (2 hours)

#### 1.1 Analyze Current Data
```sql
-- Count menu ingredients without inventory link
SELECT COUNT(*) as orphaned_ingredients
FROM menu_ingredients
WHERE inventory_item_id IS NULL;

-- List unique ingredient names without link
SELECT DISTINCT ingredient_name, COUNT(*) as usage_count
FROM menu_ingredients
WHERE inventory_item_id IS NULL
GROUP BY ingredient_name
ORDER BY usage_count DESC;

-- Sample problematic records
SELECT mi.id, mi.ingredient_name, mi.unit, m.menu_name
FROM menu_ingredients mi
JOIN nutrition_menus m ON mi.menu_id = m.id
WHERE mi.inventory_item_id IS NULL
LIMIT 20;
```

#### 1.2 Create Mapping Strategy
```typescript
// docs/fixes/data/menu-ingredient-mapping.ts

interface IngredientMapping {
  ingredientName: string
  unit: string
  inventoryItemId: string
  confidence: 'high' | 'medium' | 'low'
  note?: string
}

// Automatic mapping rules
const autoMappingRules: IngredientMapping[] = [
  {
    ingredientName: 'Ayam',
    unit: 'kg',
    inventoryItemId: 'chicken-breast-id',
    confidence: 'high'
  },
  {
    ingredientName: 'Beras',
    unit: 'kg',
    inventoryItemId: 'rice-white-id',
    confidence: 'high'
  },
  // ... more mappings
]

// Manual review needed
const manualReviewNeeded: string[] = [
  'Bumbu A', // Ambiguous
  'Sayur Mix', // Ambiguous
  // ... more
]
```

---

### Step 2: Create Missing Inventory Items (3 hours)

#### 2.1 Generate Script to Create Items
```typescript
// scripts/create-missing-inventory-items.ts

import { PrismaClient } from '@prisma/client'
import { ingredientMappings } from '../docs/fixes/data/menu-ingredient-mapping'

const prisma = new PrismaClient()

async function createMissingInventoryItems() {
  console.log('🔍 Analyzing menu ingredients...')
  
  // Get all unique ingredients without inventory link
  const orphanedIngredients = await prisma.$queryRaw`
    SELECT DISTINCT ingredient_name, unit, 
           AVG(cost_per_unit) as avg_cost,
           COUNT(*) as usage_count
    FROM menu_ingredients
    WHERE inventory_item_id IS NULL
    GROUP BY ingredient_name, unit
    ORDER BY usage_count DESC
  `
  
  console.log(`📊 Found ${orphanedIngredients.length} unique ingredients`)
  
  for (const ingredient of orphanedIngredients) {
    // Check if we have a mapping
    const mapping = ingredientMappings.find(
      m => m.ingredientName === ingredient.ingredient_name &&
           m.unit === ingredient.unit
    )
    
    if (mapping) {
      console.log(`✅ Mapped: ${ingredient.ingredient_name} → ${mapping.inventoryItemId}`)
      continue
    }
    
    // Create new inventory item
    console.log(`📦 Creating new inventory item: ${ingredient.ingredient_name}`)
    
    const newItem = await prisma.inventoryItem.create({
      data: {
        itemName: ingredient.ingredient_name,
        itemCode: generateItemCode(ingredient.ingredient_name),
        category: guessCategory(ingredient.ingredient_name),
        unit: ingredient.unit,
        pricePerUnit: ingredient.avg_cost,
        currentStock: 0, // Initialize with 0
        minimumStock: 10, // Default
        status: 'ACTIVE',
        sppgId: 'default-sppg-id', // Use actual SPPG ID
        createdBy: 'system-migration',
        // ... other required fields
      }
    })
    
    // Add to mapping
    ingredientMappings.push({
      ingredientName: ingredient.ingredient_name,
      unit: ingredient.unit,
      inventoryItemId: newItem.id,
      confidence: 'medium',
      note: 'Auto-created from menu ingredient'
    })
  }
  
  console.log('✅ All inventory items created')
  
  // Save mapping to file
  await saveMapping(ingredientMappings)
}

// Helper functions
function generateItemCode(name: string): string {
  return name.toUpperCase()
    .replace(/\s+/g, '-')
    .substring(0, 20) + '-' + Date.now().toString(36)
}

function guessCategory(name: string): InventoryCategory {
  const nameUpper = name.toUpperCase()
  
  if (nameUpper.includes('AYAM') || nameUpper.includes('DAGING')) {
    return 'PROTEIN_HEWANI'
  }
  if (nameUpper.includes('TEMPE') || nameUpper.includes('TAHU')) {
    return 'PROTEIN_NABATI'
  }
  if (nameUpper.includes('BERAS') || nameUpper.includes('NASI')) {
    return 'KARBOHIDRAT'
  }
  if (nameUpper.includes('SAYUR')) {
    return 'SAYURAN'
  }
  if (nameUpper.includes('BUAH')) {
    return 'BUAH_BUAHAN'
  }
  
  return 'LAINNYA'
}

createMissingInventoryItems()
  .then(() => console.log('✅ Script completed'))
  .catch(err => console.error('❌ Error:', err))
  .finally(() => prisma.$disconnect())
```

#### 2.2 Review & Run Script
```bash
# Dry run first
npm run migration:create-inventory-items -- --dry-run

# Review output
cat migration-report.json

# Run actual creation
npm run migration:create-inventory-items --confirm

# Verify
npm run migration:verify-inventory-items
```

---

### Step 3: Update MenuIngredients with Links (3 hours)

#### 3.1 Create Update Script
```typescript
// scripts/link-menu-ingredients-to-inventory.ts

import { PrismaClient } from '@prisma/client'
import { ingredientMappings } from '../docs/fixes/data/menu-ingredient-mapping'

const prisma = new PrismaClient()

async function linkMenuIngredientsToInventory() {
  console.log('🔗 Linking menu ingredients to inventory items...')
  
  let updated = 0
  let failed = 0
  const failedRecords: any[] = []
  
  // Get all menu ingredients without link
  const orphaned = await prisma.menuIngredient.findMany({
    where: {
      inventoryItemId: null
    },
    include: {
      menu: {
        select: {
          id: true,
          menuName: true
        }
      }
    }
  })
  
  console.log(`📊 Found ${orphaned.length} orphaned ingredients`)
  
  for (const ingredient of orphaned) {
    // Find mapping
    const mapping = ingredientMappings.find(
      m => m.ingredientName === ingredient.ingredientName &&
           m.unit === ingredient.unit
    )
    
    if (!mapping) {
      console.error(`❌ No mapping for: ${ingredient.ingredientName} (${ingredient.unit})`)
      failed++
      failedRecords.push({
        id: ingredient.id,
        ingredientName: ingredient.ingredientName,
        unit: ingredient.unit,
        menuName: ingredient.menu.menuName
      })
      continue
    }
    
    // Verify inventory item exists
    const inventoryItem = await prisma.inventoryItem.findUnique({
      where: { id: mapping.inventoryItemId }
    })
    
    if (!inventoryItem) {
      console.error(`❌ Inventory item not found: ${mapping.inventoryItemId}`)
      failed++
      failedRecords.push({
        id: ingredient.id,
        inventoryItemId: mapping.inventoryItemId,
        note: 'Inventory item not found'
      })
      continue
    }
    
    // Update menu ingredient
    await prisma.menuIngredient.update({
      where: { id: ingredient.id },
      data: {
        inventoryItemId: mapping.inventoryItemId,
        // Keep old cost data for historical reference (in notes)
        notes: `Migration: Original cost ${ingredient.costPerUnit}/unit`
      }
    })
    
    updated++
    
    if (updated % 100 === 0) {
      console.log(`✅ Updated ${updated}/${orphaned.length} ingredients`)
    }
  }
  
  console.log('\n📊 Summary:')
  console.log(`✅ Updated: ${updated}`)
  console.log(`❌ Failed: ${failed}`)
  
  if (failedRecords.length > 0) {
    console.log('\n❌ Failed records:')
    console.table(failedRecords)
    
    // Save to file for manual review
    await fs.writeFile(
      'migration-failed-ingredients.json',
      JSON.stringify(failedRecords, null, 2)
    )
  }
  
  return { updated, failed, failedRecords }
}

linkMenuIngredientsToInventory()
  .then(result => {
    if (result.failed === 0) {
      console.log('✅ All ingredients linked successfully!')
    } else {
      console.log(`⚠️ ${result.failed} ingredients need manual review`)
    }
  })
  .catch(err => console.error('❌ Error:', err))
  .finally(() => prisma.$disconnect())
```

#### 3.2 Run Update Script
```bash
# Dry run
npm run migration:link-ingredients -- --dry-run

# Review
cat migration-report.json

# Run actual update
npm run migration:link-ingredients --confirm

# Verify
SELECT COUNT(*) FROM menu_ingredients WHERE inventory_item_id IS NULL;
-- Should return 0
```

---

### Step 4: Schema Migration (2 hours)

#### 4.1 Create Prisma Migration
```prisma
// prisma/migrations/20251021_fix_menu_ingredient_required_link/migration.sql

-- Step 1: Verify all records have inventory_item_id
-- (Should pass if Step 3 completed successfully)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM menu_ingredients WHERE inventory_item_id IS NULL
  ) THEN
    RAISE EXCEPTION 'Cannot migrate: Found menu_ingredients without inventory_item_id';
  END IF;
END $$;

-- Step 2: Make inventoryItemId required
ALTER TABLE menu_ingredients
  ALTER COLUMN inventory_item_id SET NOT NULL;

-- Step 3: Add index for performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS 
  idx_menu_ingredients_inventory_item_id 
  ON menu_ingredients(inventory_item_id);

-- Step 4: Drop redundant columns (keep in notes for now)
-- ALTER TABLE menu_ingredients DROP COLUMN ingredient_name;
-- ALTER TABLE menu_ingredients DROP COLUMN cost_per_unit;
-- ALTER TABLE menu_ingredients DROP COLUMN total_cost;

-- Step 5: Add notes column if not exists
ALTER TABLE menu_ingredients 
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- Step 6: Migrate cost data to notes (for historical reference)
UPDATE menu_ingredients
SET notes = CONCAT(
  COALESCE(notes, ''),
  E'\nOriginal: ',
  ingredient_name,
  ' @ ',
  cost_per_unit,
  '/unit (total: ',
  total_cost,
  ')'
)
WHERE notes IS NULL OR notes = '';

COMMENT ON COLUMN menu_ingredients.notes IS 
  'Optional notes about ingredient. Contains historical cost data from migration.';
```

#### 4.2 Update Prisma Schema
```prisma
// prisma/schema.prisma

model MenuIngredient {
  id              String         @id @default(cuid())
  menuId          String
  inventoryItemId String         // ✅ Now required
  quantity        Float
  unit            String
  notes           String?        // ✅ New field
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  
  // ✅ REMOVED (commented out for migration):
  // ingredientName  String
  // costPerUnit     Float
  // totalCost       Float
  
  menu            NutritionMenu    @relation(fields: [menuId], references: [id], onDelete: Cascade)
  inventoryItem   InventoryItem    @relation(fields: [inventoryItemId], references: [id], onDelete: Restrict)
  
  @@index([menuId])
  @@index([inventoryItemId])
  @@map("menu_ingredients")
}
```

#### 4.3 Run Migration
```bash
# Generate migration
npx prisma migrate dev --name fix_menu_ingredient_required_link --create-only

# Review SQL
cat prisma/migrations/*/migration.sql

# Apply migration
npx prisma migrate deploy

# Verify
npx prisma validate
```

---

### Step 5: Update API & Services (3 hours)

#### 5.1 Update Zod Schema
```typescript
// src/features/sppg/menu/schemas/menuIngredientSchema.ts

import { z } from 'zod'

export const menuIngredientSchema = z.object({
  id: z.string().cuid().optional(),
  menuId: z.string().cuid(),
  inventoryItemId: z.string().cuid(), // ✅ Required (no .optional())
  quantity: z.number().min(0.001, 'Quantity must be greater than 0'),
  unit: z.string().min(1, 'Unit is required'),
  notes: z.string().optional(),
})

// ✅ REMOVED:
// ingredientName: z.string()
// costPerUnit: z.number()
// totalCost: z.number()

export type MenuIngredientInput = z.infer<typeof menuIngredientSchema>

// Virtual cost calculation type
export interface MenuIngredientWithCost extends MenuIngredientInput {
  costPerUnit: number // ✅ Calculated from inventoryItem
  totalCost: number   // ✅ Calculated: quantity * costPerUnit
  inventoryItem: {
    id: string
    itemName: string
    pricePerUnit: number
    unit: string
    currentStock: number
  }
}
```

#### 5.2 Create Cost Calculation Service
```typescript
// src/features/sppg/menu/lib/menuCostCalculator.ts

import { PrismaClient } from '@prisma/client'
import type { MenuIngredientWithCost } from '../schemas/menuIngredientSchema'

const prisma = new PrismaClient()

export class MenuCostCalculator {
  /**
   * Calculate costs for menu ingredients with real-time inventory prices
   */
  static async calculateIngredientCosts(
    menuId: string
  ): Promise<MenuIngredientWithCost[]> {
    const ingredients = await prisma.menuIngredient.findMany({
      where: { menuId },
      include: {
        inventoryItem: {
          select: {
            id: true,
            itemName: true,
            pricePerUnit: true,
            unit: true,
            currentStock: true
          }
        }
      }
    })
    
    return ingredients.map(ingredient => ({
      ...ingredient,
      // ✅ Calculate costs from current inventory prices
      costPerUnit: ingredient.inventoryItem.pricePerUnit,
      totalCost: ingredient.quantity * ingredient.inventoryItem.pricePerUnit
    }))
  }
  
  /**
   * Calculate total menu cost
   */
  static async calculateMenuCost(menuId: string): Promise<number> {
    const ingredients = await this.calculateIngredientCosts(menuId)
    return ingredients.reduce((sum, ing) => sum + ing.totalCost, 0)
  }
  
  /**
   * Calculate cost per serving
   */
  static async calculateCostPerServing(
    menuId: string,
    servingSize: number = 1
  ): Promise<number> {
    const totalCost = await this.calculateMenuCost(menuId)
    return totalCost / servingSize
  }
  
  /**
   * Check if sufficient stock available for production
   */
  static async checkStockAvailability(
    menuId: string,
    portions: number
  ): Promise<{
    available: boolean
    insufficientStock: Array<{
      ingredientName: string
      required: number
      available: number
      shortage: number
    }>
  }> {
    const ingredients = await prisma.menuIngredient.findMany({
      where: { menuId },
      include: {
        inventoryItem: {
          select: {
            itemName: true,
            currentStock: true
          }
        }
      }
    })
    
    const insufficientStock = ingredients
      .map(ing => {
        const required = ing.quantity * portions
        const available = ing.inventoryItem.currentStock
        const shortage = Math.max(0, required - available)
        
        return {
          ingredientName: ing.inventoryItem.itemName,
          required,
          available,
          shortage
        }
      })
      .filter(item => item.shortage > 0)
    
    return {
      available: insufficientStock.length === 0,
      insufficientStock
    }
  }
}
```

#### 5.3 Update API Endpoints
```typescript
// src/app/api/sppg/menu/[id]/cost/route.ts

import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { MenuCostCalculator } from '@/features/sppg/menu/lib/menuCostCalculator'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const menuId = params.id
    
    // Calculate real-time costs
    const ingredients = await MenuCostCalculator.calculateIngredientCosts(menuId)
    const totalCost = await MenuCostCalculator.calculateMenuCost(menuId)
    const costPerServing = await MenuCostCalculator.calculateCostPerServing(menuId)
    
    return Response.json({
      success: true,
      data: {
        ingredients,
        totalCost,
        costPerServing,
        calculatedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('GET /api/sppg/menu/[id]/cost error:', error)
    return Response.json(
      { error: 'Failed to calculate menu cost' },
      { status: 500 }
    )
  }
}
```

---

### Step 6: Update UI Components (2 hours)

#### 6.1 Update MenuIngredientForm
```typescript
// src/features/sppg/menu/components/MenuIngredientForm.tsx

'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { menuIngredientSchema, type MenuIngredientInput } from '../schemas'
import { InventoryItemCombobox } from '@/features/sppg/inventory/components/InventoryItemCombobox'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useInventoryItems } from '@/features/sppg/inventory/hooks'

interface MenuIngredientFormProps {
  menuId: string
  initialData?: MenuIngredientInput
  onSuccess?: () => void
}

export function MenuIngredientForm({ menuId, initialData, onSuccess }: MenuIngredientFormProps) {
  const form = useForm<MenuIngredientInput>({
    resolver: zodResolver(menuIngredientSchema),
    defaultValues: initialData || {
      menuId,
      inventoryItemId: '', // ✅ Required field
      quantity: 0,
      unit: '',
      notes: ''
    }
  })
  
  const { data: inventoryItems } = useInventoryItems()
  
  // ✅ Watch selected inventory item to auto-fill unit
  const selectedItemId = form.watch('inventoryItemId')
  const selectedItem = inventoryItems?.find(item => item.id === selectedItemId)
  
  // Auto-fill unit when inventory item selected
  useEffect(() => {
    if (selectedItem) {
      form.setValue('unit', selectedItem.unit)
    }
  }, [selectedItem, form])
  
  const onSubmit = async (data: MenuIngredientInput) => {
    // API call to create/update ingredient
    await createMenuIngredient(data)
    onSuccess?.()
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* ✅ NEW: Inventory Item Combobox (replaces free text) */}
        <FormField
          control={form.control}
          name="inventoryItemId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bahan Baku *</FormLabel>
              <FormControl>
                <InventoryItemCombobox
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Pilih bahan baku dari inventory..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* ✅ Show selected item info */}
        {selectedItem && (
          <div className="p-3 bg-muted rounded-md text-sm">
            <p><strong>Item:</strong> {selectedItem.itemName}</p>
            <p><strong>Stock:</strong> {selectedItem.currentStock} {selectedItem.unit}</p>
            <p><strong>Harga:</strong> Rp {selectedItem.pricePerUnit.toLocaleString()}/{selectedItem.unit}</p>
          </div>
        )}
        
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jumlah *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.001"
                  {...field}
                  onChange={e => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Satuan *</FormLabel>
              <FormControl>
                <Input {...field} disabled /> {/* Auto-filled from inventory */}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* ✅ Show calculated cost */}
        {selectedItem && form.watch('quantity') > 0 && (
          <div className="p-3 bg-primary/10 rounded-md">
            <p className="text-sm font-medium">
              Estimasi Biaya: 
              <span className="text-lg ml-2">
                Rp {(selectedItem.pricePerUnit * form.watch('quantity')).toLocaleString()}
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Harga akan selalu update otomatis dari inventory
            </p>
          </div>
        )}
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catatan</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Catatan opsional..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit">Simpan Bahan Baku</Button>
      </form>
    </Form>
  )
}
```

#### 6.2 Create InventoryItemCombobox
```typescript
// src/features/sppg/inventory/components/InventoryItemCombobox.tsx

'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useInventoryItems } from '../hooks'

interface InventoryItemComboboxProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  category?: string // Optional filter by category
}

export function InventoryItemCombobox({
  value,
  onChange,
  placeholder = 'Pilih bahan baku...',
  category
}: InventoryItemComboboxProps) {
  const [open, setOpen] = useState(false)
  const { data: items, isLoading } = useInventoryItems({ category })
  
  const selectedItem = items?.find(item => item.id === value)
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedItem ? (
            <span className="flex items-center gap-2">
              <span className="font-medium">{selectedItem.itemName}</span>
              <span className="text-xs text-muted-foreground">
                ({selectedItem.currentStock} {selectedItem.unit})
              </span>
            </span>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Cari bahan baku..." />
          <CommandEmpty>Bahan baku tidak ditemukan</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {items?.map((item) => (
              <CommandItem
                key={item.id}
                value={item.id}
                onSelect={() => {
                  onChange(item.id)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    value === item.id ? 'opacity-100' : 'opacity-0'
                  )}
                />
                <div className="flex-1">
                  <p className="font-medium">{item.itemName}</p>
                  <p className="text-xs text-muted-foreground">
                    Stock: {item.currentStock} {item.unit} • 
                    Rp {item.pricePerUnit.toLocaleString()}/{item.unit}
                  </p>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
```

---

### Step 7: Testing (1 hour)

#### 7.1 Unit Tests
```typescript
// src/features/sppg/menu/lib/__tests__/menuCostCalculator.test.ts

import { MenuCostCalculator } from '../menuCostCalculator'
import { prisma } from '@/lib/prisma'

describe('MenuCostCalculator', () => {
  beforeEach(async () => {
    // Setup test data
    await prisma.inventoryItem.create({
      data: {
        id: 'chicken-test-id',
        itemName: 'Ayam Potong',
        pricePerUnit: 50000,
        unit: 'kg',
        currentStock: 100,
        // ... other fields
      }
    })
    
    await prisma.nutritionMenu.create({
      data: {
        id: 'menu-test-id',
        menuName: 'Nasi Ayam',
        // ... other fields
        ingredients: {
          create: [
            {
              inventoryItemId: 'chicken-test-id',
              quantity: 0.2,
              unit: 'kg'
            }
          ]
        }
      }
    })
  })
  
  afterEach(async () => {
    await prisma.menuIngredient.deleteMany()
    await prisma.nutritionMenu.deleteMany()
    await prisma.inventoryItem.deleteMany()
  })
  
  it('should calculate ingredient costs from inventory prices', async () => {
    const costs = await MenuCostCalculator.calculateIngredientCosts('menu-test-id')
    
    expect(costs).toHaveLength(1)
    expect(costs[0].costPerUnit).toBe(50000) // From inventory
    expect(costs[0].totalCost).toBe(10000) // 0.2 * 50000
  })
  
  it('should calculate total menu cost', async () => {
    const totalCost = await MenuCostCalculator.calculateMenuCost('menu-test-id')
    expect(totalCost).toBe(10000)
  })
  
  it('should detect insufficient stock', async () => {
    const result = await MenuCostCalculator.checkStockAvailability('menu-test-id', 1000)
    
    expect(result.available).toBe(false)
    expect(result.insufficientStock).toHaveLength(1)
    expect(result.insufficientStock[0]).toMatchObject({
      ingredientName: 'Ayam Potong',
      required: 200, // 0.2 * 1000
      available: 100,
      shortage: 100
    })
  })
})
```

---

## ✅ Validation & Verification

### Post-Implementation Checklist

- [ ] **Schema Migration**
  - [ ] All `menu_ingredients` have `inventory_item_id`
  - [ ] Column `inventory_item_id` is NOT NULL
  - [ ] Index created on `inventory_item_id`
  - [ ] Old cost columns migrated to notes

- [ ] **Data Quality**
  - [ ] Zero orphaned ingredients
  - [ ] All FK references valid
  - [ ] No duplicate ingredients

- [ ] **API Functionality**
  - [ ] Cannot create ingredient without inventory link
  - [ ] Cost calculation returns real-time prices
  - [ ] Stock availability check works

- [ ] **UI/UX**
  - [ ] InventoryItemCombobox working
  - [ ] Auto-fill unit from selected item
  - [ ] Show real-time cost calculation
  - [ ] Form validation working

- [ ] **Business Workflows**
  - [ ] Menu cost updates when inventory price changes
  - [ ] Production can check stock availability
  - [ ] Procurement planning can calculate needs

### Verification SQL Queries

```sql
-- 1. Verify no orphaned ingredients
SELECT COUNT(*) FROM menu_ingredients WHERE inventory_item_id IS NULL;
-- Expected: 0

-- 2. Verify all FKs valid
SELECT COUNT(*) FROM menu_ingredients mi
LEFT JOIN inventory_items ii ON mi.inventory_item_id = ii.id
WHERE ii.id IS NULL;
-- Expected: 0

-- 3. Check index exists
SELECT * FROM pg_indexes 
WHERE tablename = 'menu_ingredients' 
AND indexname LIKE '%inventory_item%';
-- Expected: 1 row

-- 4. Sample cost calculation
SELECT 
  m.menu_name,
  mi.quantity,
  mi.unit,
  ii.item_name,
  ii.price_per_unit as current_price,
  (mi.quantity * ii.price_per_unit) as calculated_cost
FROM menu_ingredients mi
JOIN nutrition_menus m ON mi.menu_id = m.id
JOIN inventory_items ii ON mi.inventory_item_id = ii.id
LIMIT 10;
-- Expected: All costs calculated correctly
```

---

## 📝 Documentation Updates

### Files to Update

1. **API Documentation**
   ```markdown
   # Menu Ingredient API
   
   ## POST /api/sppg/menu/[id]/ingredients
   
   ### Request Body
   ```json
   {
     "inventoryItemId": "inv-xxx", // ✅ REQUIRED
     "quantity": 0.2,
     "unit": "kg",
     "notes": "Optional notes"
   }
   ```
   
   ❌ REMOVED: ingredientName, costPerUnit, totalCost
   ✅ Costs calculated automatically from inventory
   ```

2. **Migration Guide**
   ```markdown
   # Menu Ingredient Migration Guide
   
   ## What Changed
   - `inventoryItemId` is now REQUIRED
   - `ingredientName`, `costPerUnit`, `totalCost` removed
   - Costs now calculated from inventory in real-time
   
   ## Benefits
   - Always accurate costs
   - Automatic stock deduction
   - Procurement planning enabled
   ```

3. **User Guide**
   ```markdown
   # Creating Menu with Ingredients
   
   ## New Workflow
   1. Select bahan baku from dropdown (linked to inventory)
   2. Enter quantity
   3. Unit auto-filled from inventory
   4. Cost calculated automatically
   5. Stock availability checked
   ```

---

## 🎯 Success Metrics

### Key Performance Indicators

- **Data Integrity**: 100% ingredients linked to inventory
- **Cost Accuracy**: 100% costs calculated from real-time prices
- **Stock Tracking**: 100% productions deduct stock automatically
- **User Adoption**: 95%+ staff use new ingredient selection
- **Error Rate**: <0.1% ingredient creation failures

### Monitoring

```typescript
// Add monitoring for:
- Orphaned ingredient attempts (should be 0)
- Cost calculation performance (<50ms)
- Stock deduction success rate (100%)
- Ingredient creation with combobox (track usage)
```

---

## 🚀 Deployment Plan

1. **Deploy to staging** (Day 1)
2. **Internal testing** (Day 2)
3. **Beta testing with 2 SPPGs** (Day 3-4)
4. **Gradual rollout** (Day 5-7)
5. **Monitor & optimize** (Week 2)

---

## ✅ Definition of Done

Fix #1 is complete when:

- [x] Schema migration successful
- [x] All ingredients linked to inventory
- [x] Cost calculation service working
- [x] UI components updated
- [x] API endpoints updated
- [x] Tests passing (90%+ coverage)
- [x] Documentation updated
- [x] Beta testing complete
- [x] Production deployment successful
- [x] Monitoring confirmed working

---

**Next**: [FIX #2: ProcurementItem → InventoryItem Link](./FIX02_PROCUREMENT_ITEM_INVENTORY_LINK.md)

**Time Estimate**: 16 hours  
**Dependencies**: None  
**Priority**: 🔥🔥🔥 CRITICAL
