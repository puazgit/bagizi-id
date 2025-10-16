# 🎯 Comprehensive Menu Seed - Complete Implementation Plan

> **Date**: October 15, 2025, 05:35 WIB  
> **Objective**: Create COMPLETE realistic seed data for ALL menu domain models  
> **Status**: 🟡 **IN PROGRESS**

---

## 📋 Problem Analysis

### Current State (❌ Incomplete)

**What's Missing**:
1. ❌ **MenuIngredient** - Hardcoded `ingredientName`, not linked to `InventoryItem`
2. ❌ **RecipeStep** - Function exists but NOT CALLED (no recipe steps seeded)
3. ❌ **MenuNutritionCalculation** - Function exists but NOT CALLED (no nutrition calculations)
4. ❌ **MenuCostCalculation** - Function exists but NOT CALLED (no cost calculations)

**Impact**:
- User cannot see ingredient details (no stock, no supplier info)
- User cannot see recipe cooking steps
- Calculate Nutrition button doesn't have baseline data
- Calculate Cost button shows huge variance (no calculated baseline)
- Data NOT realistic for production use

---

## 🎯 Target State (✅ Complete & Realistic)

### All Models Must Be Seeded

```typescript
NutritionProgram (2 programs) ✅ Already seeded
  └── NutritionMenu (10 menus) ✅ Already seeded (updated costs)
        ├── MenuIngredient (60+ ingredients) 🟡 Needs completion
        │   └── InventoryItem (linked) ❌ Not linked yet
        ├── RecipeStep (80+ steps, 8 steps/menu) ❌ Not seeded
        ├── MenuNutritionCalculation (10 calculations) ❌ Not seeded
        └── MenuCostCalculation (10 calculations) ❌ Not seeded
```

---

## 📊 Implementation Checklist

### Phase 1: MenuIngredient Enhancement ✅→🟡

**Current Status**: Hardcoded ingredient names, some ingredients seeded

**Target**: Link ALL ingredients to InventoryItem

**Tasks**:
- [ ] Ensure all inventory items needed exist in inventory-seed.ts
- [ ] Update MenuIngredient to use `inventoryItemId` (not just `ingredientName`)
- [ ] Add realistic `preparationNotes` for each ingredient
- [ ] Add `substitutes` array for alternative ingredients
- [ ] Verify `quantity`, `unit`, `costPerUnit`, `totalCost` accuracy

**Example Target**:
```typescript
{
  menuId: menu1.id,
  inventoryItemId: inventoryItems['beras-putih'].id, // ✅ Linked
  ingredientName: 'Beras Putih Premium',
  quantity: 80,
  unit: 'gram',
  costPerUnit: 12, // Rp 12,000/kg = Rp 12/gram
  totalCost: 960,
  preparationNotes: 'Cuci beras hingga air jernih, rendam 15 menit, tiriskan',
  substitutes: ['Beras Merah', 'Beras Organik'],
  isOptional: false
}
```

---

### Phase 2: RecipeStep Creation ❌→✅

**Current Status**: Function exists but NOT called in seed

**Target**: 5-8 detailed steps per menu (80+ steps total)

**Requirements per Step**:
- ✅ `stepNumber` - Sequential (1, 2, 3...)
- ✅ `title` - Short descriptive title
- ✅ `instruction` - Detailed Bahasa Indonesia instructions
- ✅ `duration` - Minutes for this step
- ✅ `temperature` - Celsius (if cooking/baking)
- ✅ `equipment` - Array of tools needed
- ✅ `qualityCheck` - What to verify at this step

**Example Target** (Menu 1: Nasi Gudeg Ayam):
```typescript
[
  {
    stepNumber: 1,
    title: 'Persiapan Beras',
    instruction: 'Cuci beras putih premium 80 gram dengan air mengalir hingga air cucian jernih. Rendam dalam air bersih selama 15 menit untuk hasil nasi yang lebih pulen. Tiriskan dengan saringan hingga tidak ada air yang tersisa.',
    duration: 20,
    temperature: null,
    equipment: ['BASKOM', 'SARINGAN'],
    qualityCheck: 'Pastikan air cucian sudah jernih, tidak ada kotoran'
  },
  {
    stepNumber: 2,
    title: 'Memasak Nasi',
    instruction: 'Masukkan beras yang sudah ditiriskan ke dalam rice cooker. Tambahkan air dengan perbandingan 1:1.2 (96 ml air untuk 80 gram beras). Tekan tombol cook dan tunggu hingga matang sekitar 25 menit.',
    duration: 25,
    temperature: 100,
    equipment: ['RICE_COOKER'],
    qualityCheck: 'Nasi harus pulen, tidak keras atau lembek'
  },
  {
    stepNumber: 3,
    title: 'Persiapan Nangka Muda',
    instruction: 'Potong nangka muda 100 gram menjadi dadu kecil ukuran 2x2 cm. Rebus dalam air mendidih selama 15 menit hingga empuk. Tiriskan dan sisihkan.',
    duration: 20,
    temperature: 100,
    equipment: ['PISAU', 'TALENAN', 'PANCI'],
    qualityCheck: 'Nangka harus empuk saat ditusuk garpu'
  },
  // ... 5 more steps
]
```

---

### Phase 3: MenuNutritionCalculation ❌→✅

**Current Status**: Function exists but NOT called

**Target**: Realistic nutrition calculations for all 10 menus

**Calculation Method**:
```typescript
// For each menu:
totalCalories = sum(ingredient.quantity * ingredient.caloriesPer100g / 100)
totalProtein = sum(ingredient.quantity * ingredient.proteinPer100g / 100)
// ... same for all nutrients

// Example for Menu 1 (Nasi Gudeg):
Beras 80g: 80 * 130kcal/100g = 104 kcal
Nangka 100g: 100 * 51kcal/100g = 51 kcal
Ayam 60g: 60 * 239kcal/100g = 143 kcal
Tahu 50g: 50 * 76kcal/100g = 38 kcal
Tempe 40g: 40 * 201kcal/100g = 80 kcal
Santan 100ml: 100 * 230kcal/100ml = 230 kcal
--------------------------------------------
Total: ~646 kcal

// Compare to AKG (Anak Usia 6-12 tahun):
AKG Kalori: 1800 kcal/hari
Meal Contribution: 646 kcal / 1800 kcal = 35.9% DV ✅
```

**Required Fields**:
- Total nutrients (calories, protein, carbs, fat, fiber, 21 vitamins/minerals)
- % Daily Value (DV) comparison to AKG
- `meetsAKG` boolean flags
- `excessNutrients` array (e.g., ['SODIUM'] if >100% DV)
- `deficientNutrients` array (e.g., ['VITAMIN_C'] if <70% DV)

---

### Phase 4: MenuCostCalculation ❌→✅

**Current Status**: Function exists but NOT called

**Target**: Detailed cost breakdown for all 10 menus

**Required Calculations**:
```typescript
// 1. Ingredient Costs
totalIngredientCost = sum(menuIngredient.totalCost)

// 2. Labor Costs
preparationHours = menu.preparationTime / 60
cookingHours = menu.cookingTime / 60
totalLaborCost = (preparationHours + cookingHours) * laborCostPerHour

// 3. Utility Costs
gasCost = cookingTime * gasRatePerMinute
electricityCost = cookingTime * electricityRatePerMinute
waterCost = (preparationTime + cookingTime) * waterRatePerMinute
totalUtilityCost = gasCost + electricityCost + waterCost

// 4. Operational Costs
packagingCost = 300 // Rp 300 per portion
equipmentCost = 100 // Depreciation
cleaningCost = 50

// 5. Overhead
directCosts = totalIngredientCost + totalLaborCost + totalUtilityCost
overheadCost = directCosts * 0.15 // 15%

// 6. Grand Total
grandTotalCost = directCosts + packagingCost + equipmentCost + cleaningCost + overheadCost

// 7. Per Portion
costPerPortion = grandTotalCost / menu.servingSize
```

**Example for Menu 1** (Nasi Gudeg):
```typescript
{
  totalIngredientCost: 6980, // Sum of all ingredients
  
  laborCostPerHour: 20000,
  preparationHours: 0.5, // 30 min
  cookingHours: 1.5, // 90 min
  totalLaborCost: 40000, // (0.5 + 1.5) * 20000
  
  gasCost: 900, // 90 min * 10/min
  electricityCost: 450, // 90 min * 5/min
  waterCost: 120, // 120 min * 1/min
  totalUtilityCost: 1470,
  
  packagingCost: 300,
  equipmentCost: 100,
  cleaningCost: 50,
  
  overheadPercentage: 15,
  overheadCost: 7260, // (6980 + 40000 + 1470) * 0.15
  
  totalDirectCost: 48450,
  totalIndirectCost: 7710,
  grandTotalCost: 56160,
  
  plannedPortions: 1,
  costPerPortion: 56160, // For 1 portion (350g)
  
  // But menu says costPerServing: 10800
  // This is TOTAL cost for 1 batch (e.g., 5-6 portions)
  // So costPerPortion = 56160 / 5 = 11232 per person ✅ Close!
}
```

---

## 🔢 Detailed Implementation Data

### Menu 1: Nasi Gudeg Ayam Purwakarta

#### Ingredients (7 items) ✅
```typescript
1. Beras Putih Premium - 80g @ Rp 12/g = 960
2. Nangka Muda - 100g @ Rp 8/g = 800
3. Ayam Kampung Fillet - 60g @ Rp 50/g = 3000
4. Tahu Putih - 50g @ Rp 8/g = 400
5. Tempe Kedelai - 40g @ Rp 10/g = 400
6. Santan Kelapa - 100ml @ Rp 12/ml = 1200
7. Gula Merah - 30g @ Rp 8/g = 240
8. Bumbu Gudeg - 20g @ Rp 15/g = 300
-------------------------------------------
Total Ingredients: 7,300
```

#### Recipe Steps (8 steps) ❌→✅
```typescript
1. Persiapan Beras (20 min) - Cuci, rendam, tiriskan
2. Memasak Nasi (25 min) - Rice cooker hingga pulen
3. Persiapan Nangka (20 min) - Potong, rebus hingga empuk
4. Marinasi Ayam (15 min) - Lumuri bumbu, diamkan
5. Memasak Gudeg (45 min) - Rebus nangka dengan santan + gula merah
6. Memasak Ayam (20 min) - Goreng/rebus ayam bumbu
7. Persiapan Pelengkap (15 min) - Goreng tahu & tempe
8. Plating (10 min) - Susun nasi + gudeg + lauk
-------------------------------------------
Total Time: 30 min prep + 90 min cook = 120 min
```

#### Nutrition Calculation ❌→✅
```typescript
{
  totalCalories: 646,
  totalProtein: 28.5, // gram
  totalCarbs: 78.2,
  totalFat: 22.1,
  totalFiber: 8.5,
  
  // Vitamins
  totalVitaminA: 450, // mcg RE
  totalVitaminC: 25, // mg
  // ... (21 total nutrients)
  
  // % Daily Value (for age 6-12)
  caloriesDV: 35.9, // 646/1800*100
  proteinDV: 71.3, // 28.5/40*100
  carbsDV: 30.9, // 78.2/253*100
  fatDV: 40.2, // 22.1/55*100
  
  meetsCalorieAKG: true, // >30% per meal
  meetsProteinAKG: true, // >50%
  meetsAKG: true,
  
  excessNutrients: ['SODIUM'], // If santan high sodium
  deficientNutrients: ['VITAMIN_C'] // Need more vegetables
}
```

#### Cost Calculation ❌→✅
```typescript
{
  // Ingredients
  totalIngredientCost: 7300,
  ingredientBreakdown: {
    'Beras Putih': 960,
    'Nangka Muda': 800,
    'Ayam Kampung': 3000,
    'Tahu': 400,
    'Tempe': 400,
    'Santan': 1200,
    'Gula Merah': 240,
    'Bumbu': 300
  },
  
  // Labor
  laborCostPerHour: 20000,
  preparationHours: 0.5,
  cookingHours: 1.5,
  totalLaborCost: 40000,
  
  // Utilities
  gasCost: 900,
  electricityCost: 450,
  waterCost: 120,
  totalUtilityCost: 1470,
  
  // Operational
  packagingCost: 300,
  equipmentCost: 100,
  cleaningCost: 50,
  
  // Overhead
  overheadPercentage: 15,
  overheadCost: 7260,
  
  // Totals
  totalDirectCost: 48770,
  totalIndirectCost: 7710,
  grandTotalCost: 56480,
  
  plannedPortions: 5, // Batch makes 5 portions
  costPerPortion: 11296, // Rp 11,296 per person
  
  // Ratios
  ingredientCostRatio: 12.9, // 7300/56480*100
  laborCostRatio: 70.8,
  overheadCostRatio: 12.9,
  
  // Optimization
  costOptimizations: [
    'Gunakan ayam broiler untuk kurangi biaya Rp 1,200',
    'Batch lebih besar (10 porsi) untuk efisiensi labor'
  ],
  alternativeIngredients: [
    'Ayam Broiler (Rp 32/g) menggantikan Ayam Kampung (Rp 50/g)'
  ],
  
  calculatedAt: new Date(),
  calculatedBy: 'SYSTEM',
  calculationMethod: 'AUTO',
  isActive: true,
  isStale: false
}
```

---

## 📐 Data Standards & Validation Rules

### MenuIngredient
- ✅ MUST have `inventoryItemId` (linked to real inventory)
- ✅ `totalCost` MUST equal `quantity * costPerUnit`
- ✅ `preparationNotes` MUST be clear Bahasa Indonesia
- ✅ `substitutes` MUST be realistic alternatives

### RecipeStep
- ✅ `stepNumber` sequential (1, 2, 3...)
- ✅ `instruction` minimum 50 characters (detailed)
- ✅ Sum of `duration` should match `menu.cookingTime + menu.preparationTime`
- ✅ `equipment` array not empty
- ✅ `qualityCheck` for critical steps (cooking meat, frying, etc.)

### MenuNutritionCalculation
- ✅ `totalCalories` > 0 (impossible to have 0 calorie meal)
- ✅ `caloriesDV` between 20-45% (reasonable for school lunch)
- ✅ `meetsAKG` flags accurate based on DV%
- ✅ `excessNutrients` and `deficientNutrients` analyzed

### MenuCostCalculation
- ✅ `grandTotalCost` > `totalIngredientCost` (must include operations)
- ✅ `costPerPortion` within 10% of `menu.costPerServing`
- ✅ `overheadPercentage` = 15% (standard)
- ✅ `isStale` = false on initial seed

---

## 🚀 Implementation Timeline

### Day 1 - Phase 1 (3 hours)
- [ ] Audit inventory-seed.ts for missing items
- [ ] Add missing inventory items if needed
- [ ] Update all MenuIngredient with inventoryItemId
- [ ] Add preparationNotes and substitutes
- [ ] Verify ingredient data accuracy

### Day 1 - Phase 2 (4 hours)
- [ ] Write detailed RecipeStep for Menu 1-5 (lunch)
- [ ] Write detailed RecipeStep for Menu 6-10 (snack)
- [ ] Verify total duration matches menu times
- [ ] Add quality checks for all steps

### Day 1 - Phase 3 (3 hours)
- [ ] Calculate nutrition for Menu 1-10
- [ ] Use ingredient composition + USDA data
- [ ] Compare to AKG standards
- [ ] Identify excess/deficient nutrients

### Day 1 - Phase 4 (2 hours)
- [ ] Calculate costs for Menu 1-10
- [ ] Verify variance <10% from costPerServing
- [ ] Add cost optimization suggestions
- [ ] Generate alternative ingredient recommendations

### Day 2 - Testing (2 hours)
- [ ] Run seed script
- [ ] Verify in Prisma Studio
- [ ] Test calculate-nutrition API
- [ ] Test calculate-cost API
- [ ] UI verification

---

## ✅ Success Criteria

### Data Completeness
- [ ] ALL 10 menus have MenuIngredient with inventoryItemId
- [ ] ALL 10 menus have 5-8 RecipeSteps
- [ ] ALL 10 menus have MenuNutritionCalculation
- [ ] ALL 10 menus have MenuCostCalculation

### Data Accuracy
- [ ] Ingredient quantities realistic for 1 portion
- [ ] Recipe steps total time = prep time + cook time
- [ ] Nutrition totals match ingredient composition
- [ ] Cost calculations within 10% of planning costs

### Data Realism
- [ ] Instructions in clear Bahasa Indonesia
- [ ] Equipment available in school kitchens
- [ ] Costs match Purwakarta 2025 market
- [ ] Portions suitable for school children (ages 6-12)

### System Integration
- [ ] Seed script runs without errors
- [ ] All relations properly linked
- [ ] APIs return correct data
- [ ] UI displays all information

---

## 📚 Next Actions

1. **NOW**: Start Phase 1 - Complete MenuIngredient linking
2. **NEXT**: Create RecipeStep seed function with 80+ steps
3. **THEN**: Create nutrition calculation seed
4. **FINALLY**: Create cost calculation seed
5. **TEST**: Run full seed and verify

---

**Status**: 🟡 **READY TO IMPLEMENT**  
**Estimated Time**: 14 hours (2 days)  
**Priority**: 🔴 **HIGH** (Data completeness critical for production)

---

*"Complete and realistic seed data is the foundation of user trust in the system."*
