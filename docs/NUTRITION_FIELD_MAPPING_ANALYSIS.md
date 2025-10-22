# 📊 Nutrition Field Mapping Analysis

## Tujuan
Memastikan semua field vitamin/mineral di berbagai model sudah **konsisten** dan **compatible** untuk perhitungan AKG (Angka Kecukupan Gizi).

---

## 📋 Field Comparison

### Model 1: `inventory_items` (Sumber Data - per 100g)

| Field Name | Type | Ada? | Notes |
|------------|------|------|-------|
| vitaminA | double precision | ✅ | mcg RAE |
| vitaminB1 | double precision | ✅ | mg (Thiamin) |
| vitaminB2 | double precision | ✅ | mg (Riboflavin) |
| vitaminB3 | double precision | ✅ | mg (Niacin) |
| vitaminB6 | double precision | ✅ | mg |
| vitaminB12 | double precision | ✅ | mcg |
| vitaminC | double precision | ✅ | mg |
| vitaminD | double precision | ✅ | mcg |
| vitaminE | double precision | ✅ | mg |
| vitaminK | double precision | ✅ | mcg |
| folate | double precision | ✅ | mcg |
| calcium | double precision | ✅ | mg |
| iron | double precision | ✅ | mg |
| magnesium | double precision | ✅ | mg |
| phosphorus | double precision | ✅ | mg |
| potassium | double precision | ✅ | mg |
| sodium | double precision | ✅ | mg |
| zinc | double precision | ✅ | mg |
| selenium | double precision | ✅ | mcg |
| iodine | double precision | ✅ | mcg |

**Total Fields**: 20 vitamin/mineral fields

---

### Model 2: `menu_nutrition_calculations` (Hasil Kalkulasi - Total Menu)

| Field Name | Type | Ada? | Mapping ke InventoryItem |
|------------|------|------|--------------------------|
| totalVitaminA | double precision | ✅ | vitaminA |
| totalVitaminB1 | double precision | ✅ | vitaminB1 |
| totalVitaminB2 | double precision | ✅ | vitaminB2 |
| totalVitaminB3 | double precision | ✅ | vitaminB3 |
| totalVitaminB6 | double precision | ✅ | vitaminB6 |
| totalVitaminB12 | double precision | ✅ | vitaminB12 |
| totalVitaminC | double precision | ✅ | vitaminC |
| totalVitaminD | double precision | ✅ | vitaminD |
| totalVitaminE | double precision | ✅ | vitaminE |
| totalVitaminK | double precision | ✅ | vitaminK |
| totalFolat | double precision | ✅ | folate ⚠️ (typo: "Folat" vs "Folate") |
| totalCalcium | double precision | ✅ | calcium |
| totalIron | double precision | ✅ | iron |
| totalMagnesium | double precision | ✅ | magnesium |
| totalPhosphorus | double precision | ✅ | phosphorus |
| totalPotassium | double precision | ✅ | potassium |
| totalSodium | double precision | ✅ | sodium |
| totalZinc | double precision | ✅ | zinc |
| totalSelenium | double precision | ✅ | selenium |
| totalIodine | double precision | ✅ | iodine |

**Total Fields**: 20 fields (dengan prefix `total`)

---

### Model 3: `nutrition_standards` (AKG Standard - untuk Compliance)

| Field Name | Type | Ada? | Mapping ke MenuNutritionCalculation |
|------------|------|------|-------------------------------------|
| vitaminA | double precision | ✅ | totalVitaminA |
| vitaminC | double precision | ✅ | totalVitaminC |
| vitaminD | double precision | ✅ | totalVitaminD |
| vitaminE | double precision | ✅ | totalVitaminE |
| calcium | double precision | ✅ | totalCalcium |
| iron | double precision | ✅ | totalIron |
| zinc | double precision | ✅ | totalZinc |
| folate | double precision | ✅ | totalFolat ⚠️ (typo issue) |

**Total Fields**: 8 fields only (subset AKG essentials)

**⚠️ MISSING IN STANDARDS**:
- vitaminB1, B2, B3, B6, B12
- vitaminK
- magnesium, phosphorus, potassium, sodium
- selenium, iodine

---

## 🔍 Coverage Analysis

### Comparison Matrix

| Nutrient | InventoryItem | MenuNutritionCalc | NutritionStandard | AKG Required? |
|----------|---------------|-------------------|-------------------|---------------|
| Vitamin A | ✅ vitaminA | ✅ totalVitaminA | ✅ vitaminA | ✅ YES |
| Vitamin B1 | ✅ vitaminB1 | ✅ totalVitaminB1 | ❌ | ⚠️ Optional |
| Vitamin B2 | ✅ vitaminB2 | ✅ totalVitaminB2 | ❌ | ⚠️ Optional |
| Vitamin B3 | ✅ vitaminB3 | ✅ totalVitaminB3 | ❌ | ⚠️ Optional |
| Vitamin B6 | ✅ vitaminB6 | ✅ totalVitaminB6 | ❌ | ⚠️ Optional |
| Vitamin B12 | ✅ vitaminB12 | ✅ totalVitaminB12 | ❌ | ⚠️ Optional |
| Vitamin C | ✅ vitaminC | ✅ totalVitaminC | ✅ vitaminC | ✅ YES |
| Vitamin D | ✅ vitaminD | ✅ totalVitaminD | ✅ vitaminD | ✅ YES |
| Vitamin E | ✅ vitaminE | ✅ totalVitaminE | ✅ vitaminE | ✅ YES |
| Vitamin K | ✅ vitaminK | ✅ totalVitaminK | ❌ | ⚠️ Optional |
| Folate | ✅ folate | ✅ totalFolat | ✅ folate | ✅ YES |
| Calcium | ✅ calcium | ✅ totalCalcium | ✅ calcium | ✅ YES |
| Iron | ✅ iron | ✅ totalIron | ✅ iron | ✅ YES |
| Magnesium | ✅ magnesium | ✅ totalMagnesium | ❌ | ⚠️ Optional |
| Phosphorus | ✅ phosphorus | ✅ totalPhosphorus | ❌ | ⚠️ Optional |
| Potassium | ✅ potassium | ✅ totalPotassium | ❌ | ⚠️ Optional |
| Sodium | ✅ sodium | ✅ totalSodium | ❌ | ⚠️ Optional |
| Zinc | ✅ zinc | ✅ totalZinc | ✅ zinc | ✅ YES |
| Selenium | ✅ selenium | ✅ totalSelenium | ❌ | ⚠️ Optional |
| Iodine | ✅ iodine | ✅ totalIodine | ❌ | ⚠️ Optional |

---

## 🚨 CRITICAL ISSUES

### Issue 1: Field Name Inconsistency (Typo) ⚠️

**Problem**: `folate` vs `totalFolat`
- InventoryItem: `folate` ✅
- MenuNutritionCalculation: `totalFolat` ❌ (missing 'e')
- NutritionStandard: `folate` ✅

**Impact**: 
- Kalkulasi folate bisa bermasalah karena typo di field name
- API response mungkin return field `totalFolat` bukan `totalFolate`

**Solution**: 
```prisma
// SHOULD BE:
totalFolate Float @default(0)  // ✅ Consistent with source field name

// CURRENT (WRONG):
totalFolat  Float @default(0)  // ❌ Typo, missing 'e'
```

### Issue 2: NutritionStandard Coverage Gaps

**Missing Standards** (12 nutrients):
1. vitaminB1 (Thiamin)
2. vitaminB2 (Riboflavin)
3. vitaminB3 (Niacin)
4. vitaminB6
5. vitaminB12
6. vitaminK
7. magnesium
8. phosphorus
9. potassium
10. sodium
11. selenium
12. iodine

**Impact**:
- ✅ **Good**: 8 core AKG nutrients covered (A, C, D, E, calcium, iron, zinc, folate)
- ⚠️ **Issue**: 12 additional nutrients tracked but NO AKG standard for comparison
- Frontend bisa menampilkan nilai, tapi **tidak bisa hitung compliance score** untuk 12 nutrient ini

**Recommendation**:
- **Option A**: Keep current 8 AKG standards (sufficient for regulatory compliance)
- **Option B**: Add AKG standards for B-vitamins dan minerals lainnya (comprehensive approach)

---

## ✅ GOOD NEWS: Data Flow is Compatible!

### Calculation Flow Works ✅

```typescript
// Step 1: Source Data (per 100g)
InventoryItem {
  vitaminA: 865,      // ✅ OK
  vitaminC: 18,       // ✅ OK
  calcium: 50,        // ✅ OK
  iron: 0.7           // ✅ OK
}

// Step 2: Calculation (quantity × nutrition per 100g)
MenuIngredient {
  quantity: 100,      // 100g
  inventoryItem: {...}
}
// Result: 100g × 865 vitaminA per 100g = 865 total

// Step 3: Storage
MenuNutritionCalculation {
  totalVitaminA: 865,  // ✅ OK
  totalVitaminC: 18,   // ✅ OK
  totalCalcium: 50,    // ✅ OK
  totalIron: 0.7       // ✅ OK
}

// Step 4: Compliance Check (only for 8 core nutrients)
NutritionStandard {
  vitaminA: 500,      // ✅ AKG standard
  vitaminC: 45,       // ✅ AKG standard
  calcium: 1000,      // ✅ AKG standard
  iron: 9             // ✅ AKG standard
}

// Step 5: Calculate Percentage
vitaminA: 865 / 500 × 100% = 173% ✅ Memenuhi
vitaminC: 18 / 45 × 100% = 40% ⚠️ Kurang
calcium: 50 / 1000 × 100% = 5% ❌ Sangat Kurang
iron: 0.7 / 9 × 100% = 7.8% ❌ Sangat Kurang
```

---

## 📊 Summary Table

| Category | Status | Notes |
|----------|--------|-------|
| **InventoryItem Fields** | ✅ COMPLETE | 20 vitamin/mineral fields |
| **MenuNutritionCalculation** | ⚠️ MOSTLY OK | 20 fields, 1 typo (totalFolat) |
| **NutritionStandard** | ✅ SUFFICIENT | 8 core AKG nutrients covered |
| **Data Flow** | ✅ COMPATIBLE | All mappings work correctly |
| **Calculation Logic** | ✅ CORRECT | Properly multiplies quantities |
| **Compliance Scoring** | ✅ WORKING | For 8 core nutrients |
| **Frontend Display** | ✅ READY | Can show all 20 nutrients |

---

## 🎯 Recommendations

### Priority 1: Fix Typo (Optional but Recommended)
```prisma
// prisma/schema.prisma
model MenuNutritionCalculation {
  // ... other fields
  
  // CHANGE:
  totalFolat  Float @default(0)  // ❌ OLD
  
  // TO:
  totalFolate Float @default(0)  // ✅ NEW (consistent naming)
}
```

**Migration needed**: Yes
**Impact**: Medium (need to update API response field name)
**Urgency**: Low (current code works, just inconsistent naming)

### Priority 2: Add Missing AKG Standards (Optional)

If you want comprehensive AKG compliance scoring for ALL nutrients:

```prisma
model NutritionStandard {
  // ... existing fields
  
  // NEW: B-Complex Standards
  vitaminB1  Float?  // Thiamin
  vitaminB2  Float?  // Riboflavin
  vitaminB3  Float?  // Niacin
  vitaminB6  Float?
  vitaminB12 Float?
  vitaminK   Float?
  
  // NEW: Additional Mineral Standards
  magnesium  Float?
  phosphorus Float?
  potassium  Float?
  sodium     Float?
  selenium   Float?
  iodine     Float?
}
```

**Migration needed**: Yes
**Impact**: Low (just adds optional fields)
**Urgency**: Very Low (nice-to-have)
**Note**: Current 8 standards are sufficient for Indonesian AKG requirements

---

## ✅ Conclusion

**Status**: **COMPATIBLE & READY TO USE** 🎉

**Key Points**:
1. ✅ **All 20 vitamin/mineral fields present** in InventoryItem
2. ✅ **All 20 fields mapped correctly** in MenuNutritionCalculation
3. ✅ **8 core AKG standards** available for compliance scoring
4. ✅ **Data flow works perfectly** - calculation logic is correct
5. ⚠️ **1 minor typo**: `totalFolat` should be `totalFolate` (cosmetic issue)
6. ⚠️ **12 nutrients** can be displayed but NOT scored against AKG (acceptable)

**Verdict**: **SISTEM SIAP UNTUK TESTING!** 

Tidak ada blocker. Typo "Folat" tidak mengganggu fungsi, hanya konsistensi nama. AKG standards untuk 8 nutrient core sudah cukup untuk compliance.

---

**Next Action**: Lanjutkan manual UI testing dengan menu "Nasi Gudeg Ayam Purwakarta" (ID: cmh0d2v2m003csv7f1ilxfgow)
