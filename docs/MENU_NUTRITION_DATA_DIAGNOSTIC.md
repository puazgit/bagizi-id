# 🐛 Menu Card Nutrition Data Issue - Diagnostic Report

**Date**: October 15, 2025  
**Issue**: Karbohidrat dan Lemak menampilkan **0** di card menu  
**Menu Example**: Nagasari Pisang (SNACK-003)  
**Status**: 🔍 **INVESTIGATING**

---

## 🔍 Problem Description

### User Report
Card menu "Nagasari Pisang" menampilkan:
```
Nagasari Pisang
SNACK-003
Snack Sore

Kalori: 769.7 kkal     ← Ada nilai (tapi tidak match seed)
Protein: 8.15 g        ← Ada nilai (tapi tidak match seed)
Karbohidrat: 0 g       ← SALAH! Seharusnya 52.0g
Lemak: 0 g             ← SALAH! Seharusnya 7.0g

Halal, Vegetarian
Biaya per porsi: Rp 6.000
```

---

## 📊 Data Flow Analysis

### 1. Seed Data (Source of Truth)
**File**: `prisma/seeds/menu-seed.ts` (Line 2520-2575)

```typescript
// Menu 8: Nagasari Pisang (SNACK-003)
await prisma.menuNutritionCalculation.create({
  data: {
    menuId: menu8.id,
    
    totalCalories: 295,    // ← Should be 295, not 769.7!
    totalProtein: 6.5,     // ← Should be 6.5, not 8.15!
    totalCarbs: 52.0,      // ← Should be 52.0, not 0!
    totalFat: 7.0,         // ← Should be 7.0, not 0!
    totalFiber: 3.8,
    
    // ... other nutrition data
  }
})
```

**Expected Values from Seed**:
- Kalori: **295** kkal
- Protein: **6.5** g
- Karbohidrat: **52.0** g
- Lemak: **7.0** g

**Actual Display in UI**:
- Kalori: **769.7** kkal ❌ (different!)
- Protein: **8.15** g ❌ (different!)
- Karbohidrat: **0** g ❌ (missing!)
- Lemak: **0** g ❌ (missing!)

---

## 🔧 Root Causes Found

### Issue 1: API Not Including Required Fields ✅ FIXED

**File**: `src/app/api/sppg/menu/route.ts` (Line 104-112)

**BEFORE (Missing Fields)**:
```typescript
nutritionCalc: {
  select: {
    meetsAKG: true,
    totalCalories: true,
    totalProtein: true,
    calculatedAt: true  // ← totalCarbs & totalFat NOT included!
  }
},
```

**AFTER (Fixed)**:
```typescript
nutritionCalc: {
  select: {
    meetsAKG: true,
    totalCalories: true,
    totalProtein: true,
    totalCarbs: true,    // ✅ ADDED
    totalFat: true,      // ✅ ADDED
    totalFiber: true,    // ✅ ADDED
    calculatedAt: true
  }
},
```

**Status**: ✅ **FIXED** - API now includes all nutrition fields

---

### Issue 2: Data Mismatch Between Seed and Database ⚠️ CRITICAL

**Problem**: Frontend menampilkan nilai yang **tidak sesuai** dengan seed data!

**Seed Data Says**:
```typescript
totalCalories: 295
totalProtein: 6.5
totalCarbs: 52.0
totalFat: 7.0
```

**Frontend Shows**:
```
Kalori: 769.7 kkal  ← 295 vs 769.7 (260% difference!)
Protein: 8.15 g     ← 6.5 vs 8.15 (125% difference!)
Karbohidrat: 0 g    ← 52.0 vs 0 (100% missing!)
Lemak: 0 g          ← 7.0 vs 0 (100% missing!)
```

**Possible Causes**:
1. ❌ Seed not run / Database empty
2. ❌ Data overwritten by auto-calculation
3. ❌ Wrong menu being displayed
4. ❌ Database corruption

---

## 🔍 Diagnostic Steps

### Step 1: Verify Seed Was Run
```bash
# Check if seed has been executed
npm run db:studio

# Navigate to MenuNutritionCalculation table
# Look for record where menuId matches SNACK-003
```

**What to Check**:
- Does `MenuNutritionCalculation` table have data?
- Does record for SNACK-003 menu exist?
- What are the actual values in database?

---

### Step 2: Check Database Query
```bash
# Test API endpoint directly
curl -H "Cookie: your-session-cookie" \
  http://localhost:3000/api/sppg/menu | jq '.data.menus[] | select(.menuCode == "SNACK-003") | .nutritionCalc'
```

**Expected Response**:
```json
{
  "meetsAKG": true,
  "totalCalories": 295,
  "totalProtein": 6.5,
  "totalCarbs": 52.0,
  "totalFat": 7.0,
  "totalFiber": 3.8,
  "calculatedAt": "2024-..."
}
```

---

### Step 3: Check Frontend Transformation
**File**: `src/app/(sppg)/menu/page.tsx` (Line 85-106)

```typescript
const menus: MenuWithNutrition[] = rawMenus.map(menu => {
  const menuWithCalc = menu as BaseMenu & {
    nutritionCalc?: {
      totalCalories: number
      totalProtein: number
      totalCarbs: number      // ← Does this exist in response?
      totalFat: number        // ← Does this exist in response?
      meetsAKG: boolean
    } | null
  }
  
  return {
    ...menu,
    calories: menuWithCalc.nutritionCalc?.totalCalories || 0,
    protein: menuWithCalc.nutritionCalc?.totalProtein || 0,
    carbohydrates: menuWithCalc.nutritionCalc?.totalCarbs || 0,  // ← Fallback to 0
    fat: menuWithCalc.nutritionCalc?.totalFat || 0,              // ← Fallback to 0
  }
})
```

**Issue**: If `totalCarbs` or `totalFat` is `undefined` in API response, it falls back to **0**!

---

## 🧪 Testing Checklist

### Test 1: Database Has Data
```sql
-- Check if MenuNutritionCalculation exists
SELECT 
  mnc.id,
  nm.menuCode,
  nm.menuName,
  mnc.totalCalories,
  mnc.totalProtein,
  mnc.totalCarbs,
  mnc.totalFat
FROM "MenuNutritionCalculation" mnc
JOIN "NutritionMenu" nm ON mnc.menuId = nm.id
WHERE nm.menuCode = 'SNACK-003';
```

**Expected Output**:
```
menuCode: SNACK-003
menuName: Nagasari Pisang
totalCalories: 295
totalProtein: 6.5
totalCarbs: 52.0
totalFat: 7.0
```

---

### Test 2: API Returns Correct Data
**After Fix Applied**:
1. Restart server: `npm run dev`
2. Login to application
3. Navigate to: http://localhost:3000/menu
4. Open browser console
5. Run:
```javascript
fetch('/api/sppg/menu')
  .then(r => r.json())
  .then(data => {
    const nagasari = data.data.menus.find(m => m.menuCode === 'SNACK-003')
    console.log('Nagasari Nutrition:', nagasari.nutritionCalc)
  })
```

**Expected Console Output**:
```javascript
{
  totalCalories: 295,
  totalProtein: 6.5,
  totalCarbs: 52.0,    // ← Should NOT be undefined!
  totalFat: 7.0,       // ← Should NOT be undefined!
  totalFiber: 3.8,
  meetsAKG: true,
  calculatedAt: "..."
}
```

---

### Test 3: Frontend Displays Correctly
**Visual Check**:
1. Navigate to: http://localhost:3000/menu
2. Find "Nagasari Pisang" card
3. Verify nutrition values:

**Expected Display**:
```
Nagasari Pisang
SNACK-003
Snack Sore

Kalori: 295 kkal      ✅ (should match seed)
Protein: 6.5 g        ✅ (should match seed)
Karbohidrat: 52 g     ✅ (should NOT be 0!)
Lemak: 7 g            ✅ (should NOT be 0!)

Halal, Vegetarian
Biaya per porsi: Rp 6.000
```

---

## 🚨 Critical Issues to Investigate

### Issue A: Why 769.7 kkal instead of 295 kkal?

**Hypothesis 1**: Auto-calculation override
```typescript
// Check if there's a trigger/function that recalculates nutrition
// after ingredients are added, potentially overwriting seed data
```

**Hypothesis 2**: Wrong menu displayed
```typescript
// Maybe frontend is showing wrong menu?
// Check if menuCode mapping is correct
```

**Hypothesis 3**: Ingredient-based calculation
```typescript
// Perhaps totalCalories is calculated from ingredients,
// not from MenuNutritionCalculation table?
```

---

### Issue B: Why Different Values?

**Seed Says**: 295 kkal, 6.5g protein  
**UI Shows**: 769.7 kkal, 8.15g protein

**Possible Explanations**:
1. **Multiple portions**: Maybe calculation is for multiple servings?
   - 769.7 / 295 = **2.6x multiplier** ❌ (not a clean multiple)
   
2. **Different menu**: Maybe wrong menu being shown?
   - Need to verify menuId in database matches frontend display
   
3. **Ingredient calculation**: Maybe using ingredient nutrition, not MenuNutritionCalculation?
   - Check if ingredients table has nutrition data
   - Check if there's auto-calculation happening

---

## 🔧 Fixes Applied

### Fix 1: API Endpoint Updated ✅
**File**: `src/app/api/sppg/menu/route.ts`

**Change**:
```diff
  nutritionCalc: {
    select: {
      meetsAKG: true,
      totalCalories: true,
      totalProtein: true,
+     totalCarbs: true,
+     totalFat: true,
+     totalFiber: true,
      calculatedAt: true
    }
  },
```

**Impact**: API now returns `totalCarbs` and `totalFat` fields

---

## 🎯 Required Actions

### Immediate Actions

#### Action 1: Verify Database State
```bash
npm run db:studio

# Check these tables:
# 1. NutritionMenu - Find SNACK-003
# 2. MenuNutritionCalculation - Check nutrition data
# 3. MenuIngredient - Check if ingredients exist
```

**Questions to Answer**:
- Does MenuNutritionCalculation have data for SNACK-003?
- What are the actual values in database?
- Do they match seed data (295 kkal, 6.5g protein)?

---

#### Action 2: Restart Server & Test
```bash
# 1. Stop server (Ctrl+C)
npm run dev

# 2. Navigate to http://localhost:3000/menu
# 3. Check Nagasari Pisang card
# 4. Verify Karbohidrat and Lemak are NOT 0
```

---

#### Action 3: If Still Shows 0, Re-seed Database
```bash
# Reset and re-seed database
npm run db:reset
npm run db:seed

# Verify seed completed successfully
npm run db:studio
```

---

### Investigation Actions

#### If Values Still Don't Match

**Investigate 1**: Check for auto-calculation logic
```bash
# Search for functions that calculate nutrition
grep -r "totalCalories" src/
grep -r "calculateNutrition" src/
grep -r "nutritionCalculation" src/
```

**Investigate 2**: Check Prisma schema for triggers
```prisma
// Check schema.prisma for:
// - @updatedAt hooks
// - Default values
// - Computed fields
```

**Investigate 3**: Check if ingredients override nutrition
```typescript
// Maybe nutrition is calculated from ingredients,
// not from MenuNutritionCalculation?
// Check menu detail API endpoint
```

---

## 📊 Data Comparison Table

| Field | Seed Value | UI Display | Status |
|-------|------------|------------|--------|
| **Kalori** | 295 kkal | 769.7 kkal | ❌ Mismatch |
| **Protein** | 6.5 g | 8.15 g | ❌ Mismatch |
| **Karbohidrat** | 52.0 g | 0 g | ❌ Missing |
| **Lemak** | 7.0 g | 0 g | ❌ Missing |
| **Serat** | 3.8 g | ? | ❓ Unknown |
| **Biaya** | Rp 6.000 | Rp 6.000 | ✅ Match |

---

## 🎯 Success Criteria

### After Fix, Expected Results:

**Card Display**:
```
Nagasari Pisang
SNACK-003
Snack Sore

Kalori: 295 kkal      ✅ Match seed
Protein: 6.5 g        ✅ Match seed
Karbohidrat: 52 g     ✅ NOT 0!
Lemak: 7 g            ✅ NOT 0!

Halal, Vegetarian
Biaya per porsi: Rp 6.000
```

**API Response**:
```json
{
  "nutritionCalc": {
    "totalCalories": 295,
    "totalProtein": 6.5,
    "totalCarbs": 52.0,
    "totalFat": 7.0,
    "totalFiber": 3.8,
    "meetsAKG": true
  }
}
```

---

## 📝 Summary

### Issues Found:
1. ✅ **FIXED**: API tidak include `totalCarbs` dan `totalFat` fields
2. ⚠️ **INVESTIGATING**: Data tidak match antara seed (295 kkal) dan UI (769.7 kkal)
3. ⚠️ **INVESTIGATING**: Karbohidrat dan Lemak menampilkan 0

### Fixes Applied:
1. ✅ Updated API endpoint to include `totalCarbs`, `totalFat`, `totalFiber`

### Next Steps:
1. ⏳ Restart server and verify fix
2. ⏳ Check database actual values via Prisma Studio
3. ⏳ Investigate why values don't match seed data
4. ⏳ Check for auto-calculation logic that might override

---

## 🔍 Debug Commands

### Check API Response
```bash
# Test API (requires login session)
curl -b cookies.txt http://localhost:3000/api/sppg/menu | \
  jq '.data.menus[] | select(.menuCode == "SNACK-003")'
```

### Check Database Direct
```bash
# Via Prisma Studio
npm run db:studio

# Or via psql (if using local PostgreSQL)
psql bagizi_db -c "
  SELECT nm.menuCode, nm.menuName, 
         mnc.totalCalories, mnc.totalProtein, 
         mnc.totalCarbs, mnc.totalFat
  FROM \"MenuNutritionCalculation\" mnc
  JOIN \"NutritionMenu\" nm ON mnc.menuId = nm.id
  WHERE nm.menuCode = 'SNACK-003';
"
```

---

**Status**: 🔍 **INVESTIGATION IN PROGRESS**

**Priority**: 🔴 **HIGH** - Affects user trust in nutrition data accuracy

**Next Update**: After server restart and verification
