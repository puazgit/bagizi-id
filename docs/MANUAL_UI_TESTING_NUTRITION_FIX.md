# 🧪 Manual UI Testing Guide - Nutrition Display Fix

## 📋 Test Overview

**Tujuan**: Verify bahwa vitamin dan mineral sekarang menampilkan **nilai nyata** (bukan 0.0) setelah seed data diupdate dengan TKPI data.

**Test Menu**: Nasi Gudeg Ayam Purwakarta
**Menu ID**: `cmh0d2v2m003csv7f1ilxfgow`

---

## ✅ Pre-Test Verification (DONE)

### Database Status: ✅ READY

**Inventory Items with Vitamin/Mineral Data** (17 items):
- ✅ Beras Putih: calcium=6, iron=0.5, zinc=0.6
- ✅ Ayam Fillet: vitaminA=21, calcium=11, iron=0.9, zinc=1.3
- ✅ Kacang Panjang: vitaminA=865, vitaminC=18, calcium=50, iron=0.7
- ✅ Tahu: calcium=350, iron=5.4
- ✅ Wortel: vitaminA=835, vitaminC=6
- ✅ Bayam: vitaminA=469, vitaminC=28, calcium=99, iron=2.7
- ✅ Tempe: calcium=155, iron=4
- + 10 more items dengan data lengkap

**Schema Status**:
- ✅ InventoryItem: 20 vitamin/mineral fields added
- ✅ MenuNutritionCalculation: 20 total fields ready
- ✅ NutritionStandard: 8 AKG standards available

**Migration Status**: ✅ Applied successfully

---

## 🧪 TEST STEPS

### Step 1: Open Menu Detail Page

```bash
# URL to test:
http://localhost:3000/menu/cmh0d2v2m003csv7f1ilxfgow
```

**Expected**:
- ✅ Menu "Nasi Gudeg Ayam Purwakarta" ditampilkan
- ✅ Ingredient list terlihat (7 ingredients)
- ✅ Button "Hitung Nutrisi" tersedia

---

### Step 2: Click "Hitung Nutrisi" Button

**Action**: Klik tombol **"Hitung Nutrisi"**

**Expected Behavior**:
1. Loading indicator muncul
2. API call ke `/api/sppg/menu/[id]/calculate-nutrition`
3. Calculation berjalan di backend
4. Data disimpan ke `menu_nutrition_calculations` table
5. Success message muncul
6. Halaman refresh/update dengan data baru

---

### Step 3: Verify Vitamin Section

**Location**: Card "Vitamin - Kandungan vitamin per porsi"

**BEFORE (Old Behavior - BROKEN)** ❌:
```
Vitamin A: 0.0 mcg
Vitamin C: 0.0 mg
Vitamin E: 0.0 mg
Vitamin K: 0.0 mcg
(All values = 0.0)
```

**AFTER (Expected New Behavior)** ✅:
```
Vitamin A: > 0 mcg (e.g., 21.0 mcg dari Ayam Fillet)
Vitamin C: > 0 mg
Vitamin B1: > 0 mg
Vitamin B2: > 0 mg
(Values calculated from ingredients)
```

**Check**:
- [ ] Vitamin A menampilkan nilai > 0
- [ ] Vitamin C menampilkan nilai > 0
- [ ] Vitamin B-complex menampilkan nilai > 0
- [ ] Folate menampilkan nilai > 0
- [ ] NO values showing 0.0 (kecuali memang ingredient tidak punya data)

---

### Step 4: Verify Mineral Section

**Location**: Card "Mineral - Kandungan mineral per porsi"

**BEFORE (Old Behavior - BROKEN)** ❌:
```
Calcium: 0.0 mg
Iron: 0.0 mg
Zinc: 0.0 mg
Magnesium: 0.0 mg
(All values = 0.0)
```

**AFTER (Expected New Behavior)** ✅:
```
Calcium: > 0 mg (e.g., from Beras Putih: 6mg + Ayam: 11mg = 17mg)
Iron: > 0 mg (e.g., from Beras: 0.5mg + Ayam: 0.9mg = 1.4mg)
Zinc: > 0 mg (e.g., from Beras: 0.6mg + Ayam: 1.3mg = 1.9mg)
(Values calculated from ingredients)
```

**Check**:
- [ ] Calcium menampilkan nilai > 0
- [ ] Iron menampilkan nilai > 0
- [ ] Zinc menampilkan nilai > 0
- [ ] Magnesium menampilkan nilai (could be 0 if no data)
- [ ] NO critical minerals showing 0.0 (Ca, Fe, Zn harus ada nilai)

---

### Step 5: Verify AKG Compliance Score

**Location**: Status AKG / Compliance Score section

**BEFORE (Old Behavior - BROKEN)** ❌:
```
Compliance Score: 0%
Status: "Perlu Penyesuaian"
```

**AFTER (Expected New Behavior)** ✅:
```
Compliance Score: > 0% (calculated from actual nutrition values)
Status: Reflects actual nutrition content
  - "Memenuhi AKG" if ≥ 80%
  - "Perlu Perbaikan" if < 80%
```

**Check**:
- [ ] Compliance Score menampilkan persentase > 0%
- [ ] Score dihitung berdasarkan 8 core nutrients (A, C, D, E, Ca, Fe, Zn, Folate)
- [ ] Status AKG mencerminkan actual score
- [ ] Progress bar/indicator menampilkan visualisasi yang benar

---

### Step 6: Verify Ingredient Table (Rincian Bahan)

**Location**: Tabel ingredient breakdown

**Check**:
- [ ] NO CUID strings displayed (e.g., "cmh06cjo9002vsvyn...")
- [ ] Only ingredient names shown (e.g., "Beras Putih", "Ayam Fillet")
- [ ] Clean professional display ✅
- [ ] Quantity displayed correctly

---

## 📊 Expected Calculation Example

Based on menu ingredients:

### Beras Putih (80g = 0.08kg in seed):
- Calcium: 6 mg/100g × 80g = 4.8 mg
- Iron: 0.5 mg/100g × 80g = 0.4 mg
- Zinc: 0.6 mg/100g × 80g = 0.48 mg

### Ayam Fillet (100g = 0.1kg in seed):
- Vitamin A: 21 mcg/100g × 100g = 21 mcg
- Calcium: 11 mg/100g × 100g = 11 mg
- Iron: 0.9 mg/100g × 100g = 0.9 mg
- Zinc: 1.3 mg/100g × 100g = 1.3 mg

### Total Expected (minimal):
- Vitamin A: ≥ 21 mcg ✅
- Calcium: ≥ 15.8 mg (4.8 + 11) ✅
- Iron: ≥ 1.3 mg (0.4 + 0.9) ✅
- Zinc: ≥ 1.78 mg (0.48 + 1.3) ✅

---

## ❌ Failure Scenarios

### Scenario 1: Values Still 0.0
**Cause**: Calculation not using new seed data
**Solution**: 
1. Check database: `SELECT * FROM inventory_items WHERE "itemName" = 'Ayam Fillet'`
2. Verify vitaminA, calcium, iron fields have values
3. Re-run calculation
4. Check calculation API logic

### Scenario 2: Calculation Error
**Cause**: API error during calculation
**Solution**:
1. Open browser console (F12)
2. Check Network tab for API errors
3. Check response from `/api/sppg/menu/[id]/calculate-nutrition`
4. Verify error message

### Scenario 3: Data Not Saved
**Cause**: MenuNutritionCalculation not created
**Solution**:
1. Check database: `SELECT * FROM menu_nutrition_calculations WHERE "menuId" = 'cmh0d2v2m003csv7f1ilxfgow'`
2. Verify record exists
3. Check API endpoint logic

---

## ✅ Success Criteria

**PASS** if:
- ✅ Vitamin A shows > 0 mcg
- ✅ Vitamin C shows > 0 mg
- ✅ Calcium shows > 0 mg
- ✅ Iron shows > 0 mg
- ✅ Zinc shows > 0 mg
- ✅ Compliance Score > 0%
- ✅ Status AKG calculated correctly
- ✅ No CUID strings in UI
- ✅ All displays are clean and professional

**FAIL** if:
- ❌ ANY vitamin showing 0.0 when ingredient has data
- ❌ ANY mineral showing 0.0 when ingredient has data
- ❌ Compliance Score = 0%
- ❌ CUID strings visible in UI

---

## 🐛 Debug Commands

### Check Inventory Data:
```sql
-- Via Docker:
docker exec bagizi-postgres psql -U bagizi_user -d bagizi_db -c "
SELECT \"itemName\", \"vitaminA\", \"vitaminC\", calcium, iron 
FROM inventory_items 
WHERE \"itemName\" IN ('Ayam Fillet', 'Beras Putih', 'Kacang Panjang');"
```

### Check Nutrition Calculation:
```sql
docker exec bagizi-postgres psql -U bagizi_user -d bagizi_db -c "
SELECT \"totalVitaminA\", \"totalVitaminC\", \"totalCalcium\", \"totalIron\" 
FROM menu_nutrition_calculations 
WHERE \"menuId\" = 'cmh0d2v2m003csv7f1ilxfgow';"
```

### Run Test Script:
```bash
npx tsx scripts/test-nutrition-calculation.ts
```

---

## 📝 Test Results Template

```
Date: _______________
Tester: _______________

[ ] Step 1: Menu opened successfully
[ ] Step 2: "Hitung Nutrisi" clicked successfully
[ ] Step 3: Vitamin values > 0 ✅
[ ] Step 4: Mineral values > 0 ✅
[ ] Step 5: Compliance Score > 0% ✅
[ ] Step 6: No CUID strings visible ✅

Issues Found:
- _______________________________
- _______________________________

Status: [ ] PASS  [ ] FAIL

Notes:
_______________________________
_______________________________
```

---

## 🎯 Next: Complete 31 Test Cases

After this fix is verified, continue with remaining test cases in:
`docs/FIX1_MANUAL_UI_TESTING_CHECKLIST.md`

---

**Ready to test!** Open browser and navigate to menu detail page! 🚀
