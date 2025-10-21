# Quick Test Guide - Fix #1 Verification
**Updated**: October 21, 2025  
**Purpose**: Fast manual UI testing for Fix #1 implementation  

---

## 🚀 Quick Start

### **1. Login to System**
```
URL: http://localhost:3000/login
Email: admin@sppg-purwakarta.com
Password: password123
```

### **2. Navigate to Menu Management**
```
Dashboard → Menu Management
or direct: http://localhost:3000/menu
```

### **3. Test Critical Functionality**

#### ✅ **Test 1: View Menu List** (30 seconds)
- **Check**: Menu cards display with ingredient count
- **Expected**: "X bahan" badge on each card
- **Verify**: No errors in console

#### ✅ **Test 2: Open Menu Detail** (1 minute)
- **Action**: Click any menu card (e.g., "Nasi Ayam Goreng Lalapan")
- **Check**: Ingredients list displays correctly
- **Expected**: Each ingredient shows:
  - ✅ Name from inventory (e.g., "Beras Putih")
  - ✅ Quantity in kg (e.g., "0.08 kg")
  - ✅ Cost per kg (e.g., "Rp 12,000")
  - ✅ Total cost (e.g., "Rp 960")

#### ✅ **Test 3: Calculate Cost** (2 minutes)
- **Action**: Scroll to "Analisis Biaya" section
- **Click**: "Hitung Biaya Sekarang" button
- **Expected**:
  ```
  Total Bahan: Rp 8,095
  Biaya Tenaga Kerja: Rp 2,500
  Biaya Utilitas: Rp 1,500
  Overhead: Rp 1,200
  ─────────────────────────
  Grand Total: Rp 13,295
  Biaya per Porsi: Rp 13,295
  ```
- **Verify**: 
  - ✅ Costs are realistic (Rp 7K - 15K range)
  - ✅ NOT millions of Rupiah
  - ✅ Ingredient breakdown shows correct calculations

#### ✅ **Test 4: Calculate Nutrition** (1 minute)
- **Action**: Scroll to "Informasi Nutrisi" section
- **Click**: "Hitung Nutrisi Sekarang" button
- **Expected**:
  ```
  Kalori: ~400-500 kal
  Protein: ~15-20g
  Karbohidrat: ~50-60g
  Lemak: ~10-15g
  ```
- **Verify**: Values are realistic for 330g serving

---

## 🎯 Expected Results Summary

### **Menu: Nasi Ayam Goreng Lalapan (330g)**

**Ingredients (should show 10 items)**:
```
1. Beras Putih:    0.08 kg  × Rp 12,000 = Rp 960
2. Ayam Fillet:    0.1 kg   × Rp 45,000 = Rp 4,500
3. Tahu:           0.05 kg  × Rp 10,000 = Rp 500
4. Kol:            0.03 kg  × Rp 8,000  = Rp 240
5. Timun:          0.03 kg  × Rp 8,000  = Rp 240
6. Tomat:          0.02 kg  × Rp 9,000  = Rp 180
7. Cabe Rawit:     0.025 kg × Rp 45,000 = Rp 1,125
8. Kunyit:         0.005 kg × Rp 18,000 = Rp 90
9. Bawang Putih:   0.005 kg × Rp 38,000 = Rp 190
10. Ketumbar:      0.002 kg × Rp 35,000 = Rp 70
────────────────────────────────────────────────
Total Bahan: Rp 8,095 ✅
```

**Cost Calculation**:
- Total Ingredients: **Rp 8,095** ✅ (realistic)
- Labor Cost: **Rp 2,500** (example)
- Utility Cost: **Rp 1,500** (example)
- Overhead: **Rp 1,200** (example)
- **Grand Total**: **~Rp 13,295** ✅
- **Per Portion**: **~Rp 13,295** ✅

---

## ❌ Common Issues to Watch For

### **Issue 1: Costs in Millions**
- **Symptom**: "Rp 8,095,000" instead of "Rp 8,095"
- **Cause**: Unit mismatch not fixed
- **Fix**: Run `npm run db:reset` to reload corrected seed data

### **Issue 2: "Unknown field" errors**
- **Symptom**: Console errors about removed fields
- **Cause**: Old component code still using removed fields
- **Fix**: Check component is using inventoryItem relation

### **Issue 3: Missing ingredient data**
- **Symptom**: Blank ingredient names or undefined values
- **Cause**: inventoryItem relation not loaded
- **Fix**: Verify API includes `include: { inventoryItem: true }`

---

## 📋 Full Test Checklist

For comprehensive testing, see:
- `docs/FIX1_MANUAL_UI_TESTING_CHECKLIST.md` (31 test cases)

---

## 🐛 If Tests Fail

### **Step 1: Check Database**
```bash
# Verify database has correct data
npx tsx scripts/verify-fix1-data.ts

# Expected: "All checks PASSED!"
```

### **Step 2: Check Cost Calculations**
```bash
# Verify realistic costs
npx tsx scripts/verify-menu-cost.ts

# Expected: "Rp 8,095" (NOT "Rp 8,095,000")
```

### **Step 3: Reset Database**
```bash
# If data is corrupted, reset:
npm run db:reset

# This will reload correct seed data (quantities in kg)
```

### **Step 4: Check Console Errors**
- Open browser DevTools (F12)
- Look for TypeScript or API errors
- Report any "Unknown field" errors

---

## ✅ Success Criteria

**Fix #1 is working correctly if**:
- ✅ All ingredients show inventory item names
- ✅ Quantities displayed in kg (e.g., 0.08 kg)
- ✅ Costs are realistic (Rp 7K - 15K per serving)
- ✅ Cost calculation completes without errors
- ✅ Nutrition calculation completes without errors
- ✅ No console errors about removed fields
- ✅ Ingredient breakdown shows correct totals

---

**Testing Time**: ~5-10 minutes for quick verification  
**Full Testing**: ~30 minutes for all 31 test cases  
