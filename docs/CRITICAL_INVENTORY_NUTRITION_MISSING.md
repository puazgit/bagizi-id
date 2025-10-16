# 🚨 CRITICAL ISSUE: Inventory Items Missing Nutrition Data

**Date**: October 15, 2025, 17:45 WIB  
**Status**: 🔴 **CRITICAL BUG DISCOVERED**  
**Priority**: **P0 - BLOCKER**  
**Impact**: "Hitung Ulang" button sets all macronutrients to 0

---

## 🔍 Problem Discovery

### User Report
After clicking "Hitung Ulang" (Recalculate) button on nutrition tab:
- ❌ **Macronutrients**: All show 0 (Calories, Protein, Carbs, Fat, Fiber)
- ✅ **Vitamins**: Show correct values (Vitamin A: 85, Vitamin C: 12, etc.)
- ✅ **Minerals**: Show correct values (Calcium: 125, Iron: 1.8, etc.)
- ❌ **Ingredient Table**: All contributions show 0

### Investigation Results

#### Test 1: Check Database MenuNutritionCalculation
```bash
# After "Hitung Ulang" clicked:
totalCalories: 0      ← WRONG! Should be 365
totalProtein: 0       ← WRONG! Should be 9.5
totalCarbs: 0         ← WRONG! Should be 52
totalFat: 0           ← WRONG! Should be 14
totalFiber: 0         ← WRONG! Should be 5.8

# But vitamins/minerals still correct (from manual seed):
totalVitaminA: 85     ← CORRECT (from Phase 2D seed)
totalVitaminC: 12     ← CORRECT (from Phase 2D seed)
totalCalcium: 125     ← CORRECT (from Phase 2D seed)
```

#### Test 2: Check InventoryItem Nutrition Data
```bash
# Query: Check if Roti Gandum, Pisang Ambon, etc. have nutrition data
Result:
{
  "itemName": "Roti Gandum",
  "calories": null,        ← ❌ MISSING!
  "protein": null,         ← ❌ MISSING!
  "carbohydrates": null,   ← ❌ MISSING!
  "fat": null,             ← ❌ MISSING!
  "fiber": null            ← ❌ MISSING!
}

# Same for ALL ingredients: Pisang Ambon, Selai Cokelat, Mentega
```

---

## 🎯 Root Cause Analysis

### Data Flow Architecture

```
┌─────────────────────────────────────────────────────────┐
│ Phase 2A: INVENTORY SEED (Current State)                │
├─────────────────────────────────────────────────────────┤
│ InventoryItem created with:                             │
│   ✅ itemName: "Roti Gandum"                            │
│   ✅ itemCode: "RTG-001"                                │
│   ✅ category: "BAHAN_POKOK"                            │
│   ✅ unit: "gram"                                       │
│   ✅ costPerUnit: 15                                    │
│   ❌ calories: null        ← MISSING!                  │
│   ❌ protein: null         ← MISSING!                  │
│   ❌ carbohydrates: null   ← MISSING!                  │
│   ❌ fat: null             ← MISSING!                  │
│   ❌ fiber: null           ← MISSING!                  │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│ Phase 2D: NUTRITION CALCULATION SEED (Manual Values)    │
├─────────────────────────────────────────────────────────┤
│ MenuNutritionCalculation created with:                  │
│   ✅ totalCalories: 365      ← HARDCODED in seed       │
│   ✅ totalProtein: 9.5       ← HARDCODED in seed       │
│   ✅ totalVitaminA: 85       ← HARDCODED in seed       │
│                                                          │
│ This works for initial display!                         │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│ USER CLICKS "Hitung Ulang" Button                       │
├─────────────────────────────────────────────────────────┤
│ API: POST /api/sppg/menu/[id]/calculate-nutrition       │
│                                                          │
│ Logic:                                                   │
│   1. Fetch menu.ingredients                             │
│   2. For each ingredient:                               │
│      - Get inventoryItem.calories                       │
│      - Get inventoryItem.protein                        │
│      - Calculate: (value || 0) * (quantity/100)         │
│                                                          │
│   Result:                                               │
│      totalCalories = (null || 0) * factor = 0   ❌      │
│      totalProtein = (null || 0) * factor = 0    ❌      │
│                                                          │
│   3. Save MenuNutritionCalculation with calculated 0s   │
│      ↓ OVERWRITES manual seed values!                   │
│      totalCalories: 365 → 0                             │
│      totalProtein: 9.5 → 0                              │
│                                                          │
│   4. Vitamins/minerals NOT recalculated (left as-is)    │
│      ↓ Still have manual seed values                    │
│      totalVitaminA: 85  (unchanged)                     │
│      totalCalcium: 125  (unchanged)                     │
└─────────────────────────────────────────────────────────┘
```

### Why This Happens

**Phase 2A Seed (inventory-seed.ts):**
```typescript
// Current seed only includes basic fields:
await prisma.inventoryItem.create({
  data: {
    itemName: 'Roti Gandum',
    itemCode: 'RTG-001',
    category: 'BAHAN_POKOK',
    unit: 'gram',
    costPerUnit: 15,
    // ❌ MISSING: calories, protein, carbohydrates, fat, fiber
  }
})
```

**Phase 2D Seed (menu-seed.ts):**
```typescript
// Manual nutrition values that work initially:
await prisma.menuNutritionCalculation.create({
  data: {
    menuId: menu1.id,
    totalCalories: 365,      // ✅ Hardcoded
    totalProtein: 9.5,       // ✅ Hardcoded
    totalCarbs: 52,          // ✅ Hardcoded
    // ...
  }
})
```

**Calculate API (calculate-nutrition/route.ts):**
```typescript
// Tries to calculate from InventoryItem (which has null values):
for (const ingredient of menu.ingredients) {
  const item = ingredient.inventoryItem
  const factor = ingredient.quantity / 100

  // ❌ item.calories is null → uses 0
  totalCalories = totalCalories.add(new Prisma.Decimal(item.calories || 0).mul(factor))
  
  // Result: totalCalories stays 0!
}

// Then saves the 0 values, overwriting manual seed:
await db.menuNutritionCalculation.upsert({
  update: {
    totalCalories: 0,    // ❌ Overwrites 365
    totalProtein: 0,     // ❌ Overwrites 9.5
    // ...
  }
})
```

---

## 🔧 Solution: Add Nutrition Data to Inventory Seed

### Required Changes

#### Option 1: Update Existing inventory-seed.ts ✅ **RECOMMENDED**
Add nutrition data per 100g for each inventory item:

```typescript
// prisma/seeds/inventory-seed.ts

// Roti Gandum (Whole Wheat Bread) - per 100g
{
  itemName: 'Roti Gandum',
  itemCode: 'RTG-001',
  category: 'BAHAN_POKOK',
  unit: 'gram',
  costPerUnit: 15,
  // ✅ ADD NUTRITION DATA (per 100g):
  calories: 247,           // kcal per 100g
  protein: 13,             // grams per 100g
  carbohydrates: 41,       // grams per 100g
  fat: 3.4,                // grams per 100g
  fiber: 7,                // grams per 100g
}

// Pisang Ambon (Ambon Banana) - per 100g
{
  itemName: 'Pisang Ambon',
  itemCode: 'PSG-001',
  category: 'BUAH',
  unit: 'gram',
  costPerUnit: 12,
  // ✅ ADD NUTRITION DATA (per 100g):
  calories: 89,
  protein: 1.1,
  carbohydrates: 23,
  fat: 0.3,
  fiber: 2.6,
}

// Selai Cokelat (Chocolate Spread) - per 100g
{
  itemName: 'Selai Cokelat',
  itemCode: 'SLC-001',
  category: 'BUMBU',
  unit: 'gram',
  costPerUnit: 45,
  // ✅ ADD NUTRITION DATA (per 100g):
  calories: 539,
  protein: 6,
  carbohydrates: 57,
  fat: 31,
  fiber: 5,
}

// Mentega (Butter) - per 100g
{
  itemName: 'Mentega',
  itemCode: 'MTG-001',
  category: 'BUMBU',
  unit: 'gram',
  costPerUnit: 50,
  // ✅ ADD NUTRITION DATA (per 100g):
  calories: 717,
  protein: 0.9,
  carbohydrates: 0.1,
  fat: 81,
  fiber: 0,
}
```

#### Option 2: Create Separate Nutrition Update Script
Create a migration script to update existing inventory items:

```typescript
// prisma/seeds/update-inventory-nutrition.ts

const nutritionData = {
  'RTG-001': { calories: 247, protein: 13, carbohydrates: 41, fat: 3.4, fiber: 7 },
  'PSG-001': { calories: 89, protein: 1.1, carbohydrates: 23, fat: 0.3, fiber: 2.6 },
  'SLC-001': { calories: 539, protein: 6, carbohydrates: 57, fat: 31, fiber: 5 },
  'MTG-001': { calories: 717, protein: 0.9, carbohydrates: 0.1, fat: 81, fiber: 0 },
  // ... add all 64 items
}

for (const [itemCode, nutrition] of Object.entries(nutritionData)) {
  await prisma.inventoryItem.update({
    where: { itemCode },
    data: nutrition
  })
}
```

---

## 📋 Implementation Plan

### Phase 1: Immediate Fix (Quick Workaround) ⚠️ TEMPORARY
**Disable "Hitung Ulang" button** until inventory nutrition data is complete:

```typescript
// src/features/sppg/menu/components/NutritionPreview.tsx
<Button 
  onClick={handleCalculate} 
  disabled={true}  // ← Temporarily disable
  variant="outline"
>
  <Calculator className="h-4 w-4 mr-2" />
  Hitung Ulang (Coming Soon)
</Button>
```

**Reason**: Prevent users from accidentally zeroing out nutrition data.

### Phase 2: Complete Solution (Proper Fix) ✅ PERMANENT
**Add nutrition data to all 64 inventory items:**

1. **Research nutrition values** (per 100g) for all 64 items
2. **Update inventory-seed.ts** with complete nutrition data
3. **Reset database** and reseed:
   ```bash
   npm run db:reset
   npm run db:seed
   ```
4. **Re-enable "Hitung Ulang"** button
5. **Test calculation** works correctly

---

## 🧪 Testing After Fix

### Test Scenario 1: Fresh Seed
```bash
# 1. Reset and reseed with nutrition data
npm run db:reset
npm run db:seed

# 2. Open menu page
http://localhost:3000/menu/cmgrr2te70048svcoj9lmsn5v

# 3. Check nutrition tab displays correct values
Expected:
  ✅ Calories: 365 kkal (from manual seed Phase 2D)
  ✅ Protein: 9.5g
  ✅ All vitamins/minerals correct
```

### Test Scenario 2: Calculate from Inventory
```bash
# 1. Click "Hitung Ulang" button

# 2. Verify calculation uses InventoryItem nutrition:
Expected calculation for Roti Gandum (70g):
  calories = 247 * (70/100) = 172.9 kcal
  protein = 13 * (70/100) = 9.1g

Expected calculation for Pisang Ambon (80g):
  calories = 89 * (80/100) = 71.2 kcal
  protein = 1.1 * (80/100) = 0.88g

Total expected:
  calories ≈ 365 kcal  ✅
  protein ≈ 12g        ✅
  
# 3. Check nutrition tab shows calculated values
```

---

## 📊 Affected Menus

**ALL 10 MENUS** are affected because none have inventory nutrition data:

1. ❌ Menu 1 (Gudeg) - 8 ingredients without nutrition
2. ❌ Menu 2 (Ayam Goreng) - 6 ingredients without nutrition  
3. ❌ Menu 3 (Telur Dadar) - 7 ingredients without nutrition
4. ❌ Menu 4 (Sayur Asem) - 7 ingredients without nutrition
5. ❌ Menu 5 (Empal) - 7 ingredients without nutrition
6. ❌ Menu 6 (Bubur Manado) - 8 ingredients without nutrition
7. ❌ Menu 7 (Nasi Balap) - 6 ingredients without nutrition
8. ❌ Menu 8 (Kolak) - 5 ingredients without nutrition
9. ❌ Menu 9 (Pisang Goreng) - 6 ingredients without nutrition
10. ❌ Menu 10 (Roti Pisang) - 4 ingredients without nutrition

**Total items needing nutrition data**: 64 unique inventory items

---

## ⚠️ Impact Assessment

### Severity: CRITICAL 🔴

**User Impact:**
- Users see correct nutrition initially (from manual seed)
- But if they click "Hitung Ulang", all macronutrients become 0
- Creates confusion and breaks trust in system accuracy

**Data Integrity:**
- Manual seed values get overwritten with calculated 0s
- Vitamins/minerals remain (not recalculated)
- Creates inconsistent nutrition profile

**Business Impact:**
- Nutrition reports become inaccurate
- AKG compliance checks fail (0 calories/protein)
- Cannot use dynamic calculation feature

---

## ✅ Next Steps

### Immediate (Today)
1. ✅ Document this issue (this file)
2. ⚠️ Decide: Disable "Hitung Ulang" button OR proceed with full fix
3. 📊 Determine nutrition data source (research required)

### Short-term (This Week)
1. 📝 Compile nutrition data for all 64 inventory items
2. 🔧 Update inventory-seed.ts with nutrition fields
3. 🧪 Test calculation accuracy
4. ✅ Verify all 10 menus calculate correctly

### Medium-term (Future Enhancement)
1. Add validation: Warn if InventoryItem missing nutrition data
2. Add UI indicator showing if nutrition is manual vs calculated
3. Add bulk edit UI for updating inventory nutrition
4. Consider integrating with nutrition database API

---

## 📚 References

- **Inventory Seed**: `prisma/seeds/inventory-seed.ts` (needs update)
- **Calculate API**: `src/app/api/sppg/menu/[id]/calculate-nutrition/route.ts` (logic correct, data missing)
- **Manual Seed**: `prisma/seeds/menu-seed.ts` (Phase 2D - working but gets overwritten)
- **Diagnostic Script**: `test-nutrition-api-response.ts`

---

**Document Version**: 1.0  
**Last Updated**: October 15, 2025, 17:45 WIB  
**Author**: GitHub Copilot (Bagizi-ID Development Team)  
**Status**: 🔴 **CRITICAL - REQUIRES IMMEDIATE ACTION**
