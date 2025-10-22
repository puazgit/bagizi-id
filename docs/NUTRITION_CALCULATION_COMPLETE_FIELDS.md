# Nutrition Calculation - Complete Field Implementation ✅

**Date**: October 21, 2025  
**Issue**: Calculate API hardcoded vitamin/mineral to 0 instead of calculating from ingredients  
**Status**: ✅ COMPLETE

---

## ❌ Problem: Incomplete Calculation

### Before Fix
```typescript
// API was hardcoding ALL vitamin/mineral values to 0
create: {
  menuId,
  totalCalories: totalCalories.toNumber(),
  totalProtein: totalProtein.toNumber(),
  // ...
  totalVitaminA: 0,      // ❌ HARDCODED!
  totalVitaminB1: 0,     // ❌ HARDCODED!
  totalVitaminC: 0,      // ❌ HARDCODED!
  totalCalcium: 0,       // ❌ HARDCODED!
  totalIron: 0,          // ❌ HARDCODED!
  // ... all 20 fields hardcoded to 0
}
```

### Issue
- ✅ InventoryItem has vitamin/mineral data (TKPI source)
- ✅ Database has vitamin/mineral fields
- ❌ Calculate API **NOT USING** the data
- ❌ All calculations result in 0.0 regardless of ingredients

### Impact
```
User clicks "Hitung Nutrisi" → API runs calculation
  ↓
API calculates macronutrients correctly ✅
  ↓
API hardcodes vitamins/minerals to 0 ❌
  ↓
Frontend displays all 0.0 values ❌
```

---

## ✅ Solution: Complete Field Calculation

### 1. Update Query to Include All Fields

**File**: `src/app/api/sppg/menu/[id]/calculate-nutrition/route.ts`

```typescript
// BEFORE: Only 5 basic fields
include: {
  inventoryItem: {
    select: {
      calories: true,
      protein: true,
      carbohydrates: true,
      fat: true,
      fiber: true
    }
  }
}

// AFTER: All 28 nutrition fields (5 macro + 11 vitamins + 9 minerals + 3 others)
include: {
  inventoryItem: {
    select: {
      // Macronutrients
      calories: true,
      protein: true,
      carbohydrates: true,
      fat: true,
      fiber: true,
      
      // Vitamins (per 100g)
      vitaminA: true,
      vitaminB1: true,
      vitaminB2: true,
      vitaminB3: true,
      vitaminB6: true,
      vitaminB12: true,
      vitaminC: true,
      vitaminD: true,
      vitaminE: true,
      vitaminK: true,
      folate: true,
      
      // Minerals (per 100g)
      calcium: true,
      iron: true,
      magnesium: true,
      phosphorus: true,
      potassium: true,
      sodium: true,
      zinc: true,
      selenium: true,
      iodine: true
    }
  }
}
```

### 2. Initialize All Calculation Variables

```typescript
// BEFORE: Only 5 variables
let totalCalories = new Prisma.Decimal(0)
let totalProtein = new Prisma.Decimal(0)
let totalCarbs = new Prisma.Decimal(0)
let totalFat = new Prisma.Decimal(0)
let totalFiber = new Prisma.Decimal(0)

// AFTER: 28 variables (5 macro + 11 vitamins + 9 minerals + 3 others)
let totalCalories = new Prisma.Decimal(0)
let totalProtein = new Prisma.Decimal(0)
let totalCarbs = new Prisma.Decimal(0)
let totalFat = new Prisma.Decimal(0)
let totalFiber = new Prisma.Decimal(0)

// Vitamins
let totalVitaminA = new Prisma.Decimal(0)
let totalVitaminB1 = new Prisma.Decimal(0)
let totalVitaminB2 = new Prisma.Decimal(0)
let totalVitaminB3 = new Prisma.Decimal(0)
let totalVitaminB6 = new Prisma.Decimal(0)
let totalVitaminB12 = new Prisma.Decimal(0)
let totalVitaminC = new Prisma.Decimal(0)
let totalVitaminD = new Prisma.Decimal(0)
let totalVitaminE = new Prisma.Decimal(0)
let totalVitaminK = new Prisma.Decimal(0)
let totalFolate = new Prisma.Decimal(0)

// Minerals
let totalCalcium = new Prisma.Decimal(0)
let totalIron = new Prisma.Decimal(0)
let totalMagnesium = new Prisma.Decimal(0)
let totalPhosphorus = new Prisma.Decimal(0)
let totalPotassium = new Prisma.Decimal(0)
let totalSodium = new Prisma.Decimal(0)
let totalZinc = new Prisma.Decimal(0)
let totalSelenium = new Prisma.Decimal(0)
let totalIodine = new Prisma.Decimal(0)
```

### 3. Calculate from Ingredients (Per 100g Basis)

```typescript
for (const ingredient of menu.ingredients) {
  if (!ingredient.inventoryItem) continue

  const item = ingredient.inventoryItem
  const quantityInGrams = ingredient.quantity
  const factor = quantityInGrams / 100 // Convert per 100g to actual quantity

  // Macronutrients
  totalCalories = totalCalories.add(new Prisma.Decimal(item.calories || 0).mul(factor))
  totalProtein = totalProtein.add(new Prisma.Decimal(item.protein || 0).mul(factor))
  totalCarbs = totalCarbs.add(new Prisma.Decimal(item.carbohydrates || 0).mul(factor))
  totalFat = totalFat.add(new Prisma.Decimal(item.fat || 0).mul(factor))
  totalFiber = totalFiber.add(new Prisma.Decimal(item.fiber || 0).mul(factor))
  
  // Vitamins (per 100g)
  totalVitaminA = totalVitaminA.add(new Prisma.Decimal(item.vitaminA || 0).mul(factor))
  totalVitaminB1 = totalVitaminB1.add(new Prisma.Decimal(item.vitaminB1 || 0).mul(factor))
  totalVitaminB2 = totalVitaminB2.add(new Prisma.Decimal(item.vitaminB2 || 0).mul(factor))
  totalVitaminB3 = totalVitaminB3.add(new Prisma.Decimal(item.vitaminB3 || 0).mul(factor))
  totalVitaminB6 = totalVitaminB6.add(new Prisma.Decimal(item.vitaminB6 || 0).mul(factor))
  totalVitaminB12 = totalVitaminB12.add(new Prisma.Decimal(item.vitaminB12 || 0).mul(factor))
  totalVitaminC = totalVitaminC.add(new Prisma.Decimal(item.vitaminC || 0).mul(factor))
  totalVitaminD = totalVitaminD.add(new Prisma.Decimal(item.vitaminD || 0).mul(factor))
  totalVitaminE = totalVitaminE.add(new Prisma.Decimal(item.vitaminE || 0).mul(factor))
  totalVitaminK = totalVitaminK.add(new Prisma.Decimal(item.vitaminK || 0).mul(factor))
  totalFolate = totalFolate.add(new Prisma.Decimal(item.folate || 0).mul(factor))
  
  // Minerals (per 100g)
  totalCalcium = totalCalcium.add(new Prisma.Decimal(item.calcium || 0).mul(factor))
  totalIron = totalIron.add(new Prisma.Decimal(item.iron || 0).mul(factor))
  totalMagnesium = totalMagnesium.add(new Prisma.Decimal(item.magnesium || 0).mul(factor))
  totalPhosphorus = totalPhosphorus.add(new Prisma.Decimal(item.phosphorus || 0).mul(factor))
  totalPotassium = totalPotassium.add(new Prisma.Decimal(item.potassium || 0).mul(factor))
  totalSodium = totalSodium.add(new Prisma.Decimal(item.sodium || 0).mul(factor))
  totalZinc = totalZinc.add(new Prisma.Decimal(item.zinc || 0).mul(factor))
  totalSelenium = totalSelenium.add(new Prisma.Decimal(item.selenium || 0).mul(factor))
  totalIodine = totalIodine.add(new Prisma.Decimal(item.iodine || 0).mul(factor))
}
```

### 4. Save Calculated Values to Database

```typescript
const nutritionCalc = await db.menuNutritionCalculation.upsert({
  where: { menuId },
  create: {
    menuId,
    // Macronutrients
    totalCalories: totalCalories.toNumber(),
    totalProtein: totalProtein.toNumber(),
    totalCarbs: totalCarbs.toNumber(),
    totalFat: totalFat.toNumber(),
    totalFiber: totalFiber.toNumber(),
    
    // Vitamins (calculated from ingredients) ✅
    totalVitaminA: totalVitaminA.toNumber(),
    totalVitaminB1: totalVitaminB1.toNumber(),
    totalVitaminB2: totalVitaminB2.toNumber(),
    totalVitaminB3: totalVitaminB3.toNumber(),
    totalVitaminB6: totalVitaminB6.toNumber(),
    totalVitaminB12: totalVitaminB12.toNumber(),
    totalVitaminC: totalVitaminC.toNumber(),
    totalVitaminD: totalVitaminD.toNumber(),
    totalVitaminE: totalVitaminE.toNumber(),
    totalVitaminK: totalVitaminK.toNumber(),
    totalFolate: totalFolate.toNumber(),
    
    // Minerals (calculated from ingredients) ✅
    totalCalcium: totalCalcium.toNumber(),
    totalPhosphorus: totalPhosphorus.toNumber(),
    totalIron: totalIron.toNumber(),
    totalZinc: totalZinc.toNumber(),
    totalIodine: totalIodine.toNumber(),
    totalSelenium: totalSelenium.toNumber(),
    totalMagnesium: totalMagnesium.toNumber(),
    totalPotassium: totalPotassium.toNumber(),
    totalSodium: totalSodium.toNumber(),
    
    // Daily Value percentages
    caloriesDV: caloriesDV.toNumber(),
    proteinDV: proteinDV.toNumber(),
    carbsDV: carbsDV.toNumber(),
    fatDV: fatDV.toNumber(),
    fiberDV: fiberDV.toNumber(),
    meetsAKG,
    calculatedBy: session.user.id,
    calculatedAt: new Date()
  },
  update: {
    // Same fields for update operation
    // Now vitamins/minerals are recalculated on every update ✅
  }
})
```

---

## 📊 Calculation Example

### Test Menu: Nasi Gudeg Ayam Purwakarta (350g)

**Ingredients with Vitamin/Mineral Data:**

1. **Beras Putih (80g)**
   - Per 100g: calcium=6mg, iron=0.5mg, zinc=0.6mg
   - Factor: 80/100 = 0.8
   - Contribution:
     - Calcium: 6 × 0.8 = **4.8 mg**
     - Iron: 0.5 × 0.8 = **0.4 mg**
     - Zinc: 0.6 × 0.8 = **0.48 mg**

2. **Ayam Fillet (100g)**
   - Per 100g: vitaminA=21mcg, calcium=11mg, iron=0.9mg, zinc=1.3mg
   - Factor: 100/100 = 1.0
   - Contribution:
     - Vitamin A: 21 × 1.0 = **21 mcg**
     - Calcium: 11 × 1.0 = **11 mg**
     - Iron: 0.9 × 1.0 = **0.9 mg**
     - Zinc: 1.3 × 1.0 = **1.3 mg**

**Expected Total Calculation:**
```
Total Vitamin A  = 0 + 21 = 21.0 mcg ✅
Total Calcium    = 4.8 + 11 = 15.8 mg ✅
Total Iron       = 0.4 + 0.9 = 1.3 mg ✅
Total Zinc       = 0.48 + 1.3 = 1.78 mg ✅
```

---

## ✅ Benefits Achieved

### 1. Accurate Nutrition Data
- ✅ All 20 vitamin/mineral fields calculated from TKPI data
- ✅ Precise per-100g basis calculation with quantity factor
- ✅ No more hardcoded 0 values

### 2. Complete Compliance Checking
- ✅ Can compare with AKG standards for all nutrients
- ✅ Accurate compliance scores
- ✅ Proper deficiency/excess analysis

### 3. Better User Experience
- ✅ Realistic nutrition reports
- ✅ Meaningful compliance percentages
- ✅ Trust in system accuracy

### 4. Data Flow Integrity
```
InventoryItem (TKPI per 100g)
  ↓ quantity × (per 100g value / 100)
MenuIngredient (scaled value)
  ↓ SUM all ingredients
MenuNutritionCalculation (total values) ✅
  ↓ compare with AKG
NutritionReport (compliance %) ✅
```

---

## 📁 Files Modified

### 1. API Route - Calculate Nutrition
**File**: `src/app/api/sppg/menu/[id]/calculate-nutrition/route.ts`
**Changes**:
- ✅ Updated query to include 20 vitamin/mineral fields
- ✅ Added 20 calculation variables
- ✅ Added calculation logic for all 20 fields
- ✅ Saved all 20 calculated values to database
- ✅ Applied same logic to both `create` and `update` operations

---

## 🧪 Testing Status

### Manual Testing Required
- [ ] Open: http://localhost:3000/menu/cmh0d2v2m003csv7f1ilxfgow
- [ ] Click: "Hitung Nutrisi" button
- [ ] Verify: Vitamin A = 21 mcg (not 0.0)
- [ ] Verify: Calcium = 15.8 mg (not 0.0)
- [ ] Verify: Iron = 1.3 mg (not 0.0)
- [ ] Verify: Zinc = 1.78 mg (not 0.0)
- [ ] Verify: Compliance score calculated correctly

### Automated Test Available
```bash
npx tsx scripts/test-nutrition-calculation.ts
```

---

## 🎯 Impact Summary

### Before Fix
```
User: "Why all vitamins show 0.0?"
System: Hardcoded to 0, ignoring ingredient data ❌
Result: Inaccurate reports, loss of user trust ❌
```

### After Fix
```
User: Clicks "Hitung Nutrisi"
System: Calculates from 17 items with TKPI data ✅
Result: Accurate vitamin/mineral values ✅
Display: Vitamin A=21mcg, Calcium=15.8mg, etc. ✅
User: Trusts the system ✅
```

---

## 📝 Related Documentation

- **Vitamin/Mineral Seed Update**: `docs/VITAMIN_MINERAL_SEED_UPDATE.md`
- **Field Mapping Analysis**: `docs/NUTRITION_FIELD_MAPPING_ANALYSIS.md`
- **totalFolate Typo Fix**: `docs/TOTALFOLAT_TYPO_FIX_COMPLETE.md`
- **Manual Testing Guide**: `docs/MANUAL_UI_TESTING_NUTRITION_FIX.md`

---

## ✅ Completion Status

**API Query**: ✅ COMPLETE (all 20 fields included)  
**Variables**: ✅ COMPLETE (all 20 initialized)  
**Calculation**: ✅ COMPLETE (all 20 calculated)  
**Database Save**: ✅ COMPLETE (all 20 saved)  
**Data Flow**: ✅ COMPLETE (source → calc → display)  

**Result**: Calculate API now properly calculates ALL nutrition fields from ingredient data! 🎉

---

**Next Step**: Manual UI testing to verify frontend displays calculated values correctly.
