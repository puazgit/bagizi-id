# 🔧 Menu Nutrition Data Issue - Quick Fix Guide

**Issue**: Karbohidrat dan Lemak menampilkan **0 g**  
**Status**: ✅ **API FIXED** - Needs Server Restart

---

## 🐛 Problem

Card menu menampilkan:
```
Nagasari Pisang (SNACK-003)
Kalori: 769.7 kkal    ← Has value
Protein: 8.15 g       ← Has value
Karbohidrat: 0 g      ← WRONG! Should be 52g
Lemak: 0 g            ← WRONG! Should be 7g
```

---

## ✅ Fix Applied

### API Endpoint Updated
**File**: `src/app/api/sppg/menu/route.ts` (Line 104-112)

```typescript
// BEFORE (Missing fields):
nutritionCalc: {
  select: {
    meetsAKG: true,
    totalCalories: true,
    totalProtein: true,
    calculatedAt: true  // ← No totalCarbs or totalFat!
  }
}

// AFTER (Fixed):
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
}
```

**What Changed**: API now includes `totalCarbs` and `totalFat` in response

---

## 🧪 Quick Test

### Step 1: Restart Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Step 2: Test in Browser
```
1. Navigate to: http://localhost:3000/menu
2. Find "Nagasari Pisang" card
3. Check nutrition values

Expected Result:
✅ Karbohidrat: Shows actual value (NOT 0!)
✅ Lemak: Shows actual value (NOT 0!)
```

### Step 3: If Still Shows 0

#### Check Database:
```bash
npm run db:studio

# Navigate to MenuNutritionCalculation table
# Find record for SNACK-003 menu
# Verify totalCarbs and totalFat have values
```

#### Re-seed if Needed:
```bash
npm run db:reset
npm run db:seed
```

---

## ⚠️ Additional Issue Found

### Data Mismatch

**Seed Data** (Expected):
```
Kalori: 295 kkal
Protein: 6.5 g
Karbohidrat: 52 g
Lemak: 7 g
```

**UI Shows** (Actual):
```
Kalori: 769.7 kkal  ← 260% more than expected!
Protein: 8.15 g     ← 125% more than expected!
Karbohidrat: 0 g    ← Missing
Lemak: 0 g          ← Missing
```

**Possible Causes**:
1. ❌ Database not seeded properly
2. ❌ Auto-calculation overwriting seed data
3. ❌ Wrong calculation logic

**Investigation Needed**: See `MENU_NUTRITION_DATA_DIAGNOSTIC.md` for details

---

## 📊 Expected Result After Fix

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

## 🎯 Action Items

### Immediate (Required):
- [ ] Restart development server
- [ ] Refresh browser (hard refresh: Cmd+Shift+R)
- [ ] Verify Karbohidrat and Lemak are NOT 0

### If Still Shows 0:
- [ ] Check Prisma Studio for actual database values
- [ ] Re-run seed: `npm run db:seed`
- [ ] Check for auto-calculation logic overriding data

### Investigation (Later):
- [ ] Why 769.7 kkal instead of 295 kkal?
- [ ] Why 8.15g protein instead of 6.5g?
- [ ] Check if ingredients calculation is overriding MenuNutritionCalculation

---

## 📝 Files Changed

**Modified**:
1. `src/app/api/sppg/menu/route.ts` - Added totalCarbs, totalFat, totalFiber to API response

**Verified (No changes)**:
- `src/app/(sppg)/menu/page.tsx` - Frontend code correct
- `prisma/seeds/menu-seed.ts` - Seed data correct

---

## ✅ Quick Verification

After restart, run in browser console:
```javascript
fetch('/api/sppg/menu')
  .then(r => r.json())
  .then(d => {
    const menu = d.data.menus.find(m => m.menuCode === 'SNACK-003')
    console.log('Nutrition:', menu.nutritionCalc)
  })
```

**Expected Output**:
```javascript
{
  totalCalories: 295,
  totalProtein: 6.5,
  totalCarbs: 52.0,    // ← Should exist!
  totalFat: 7.0,       // ← Should exist!
  totalFiber: 3.8,
  meetsAKG: true
}
```

---

**Status**: ✅ Fix applied, awaiting restart & verification

**Full Diagnostic**: See `MENU_NUTRITION_DATA_DIAGNOSTIC.md`
