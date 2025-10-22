# Cost Calculation PlannedPortions Bug Fix - Complete Documentation

**Date**: October 21, 2025  
**Issue**: Cost per portion showing same value as total cost  
**Root Cause**: `plannedPortions` defaulting to 1 instead of using `menu.batchSize`  
**Status**: ✅ FIXED

---

## 🐛 Bug Description

### Symptoms
When viewing cost calculation on menu detail page:
- **Total Biaya Produksi**: Rp 6,917 (for 100 portions)
- **Per Porsi**: Rp 6,917 (WRONG - should be Rp 69.17)

Both values were identical, indicating per-portion calculation was incorrect.

### User Report
```
User tested: http://localhost:3000/menu/cmh0d2v2n003rsv7flmd5ms0w
Tab: Biaya (Cost)
Question: "Total Biaya Produksi Rp 6.917" = "Per Porsi Rp 6.917" 
          same values, is this correct?
```

---

## 🔍 Root Cause Analysis

### Database Evidence
```sql
SELECT 
  menuName, 
  servingSize, 
  batchSize, 
  grandTotalCost, 
  plannedPortions, 
  costPerPortion 
FROM nutrition_menus m 
JOIN menu_cost_calculations c ON m.id = c.menuId
WHERE m.id = 'cmh0d2v2n003rsv7flmd5ms0w';

-- BEFORE FIX (Bug):
menuName: Nasi Sayur Asem Iga Ayam
servingSize: 350
batchSize: 100 ✅ (correct)
grandTotalCost: 6917.25 ✅ (correct for 100 portions)
plannedPortions: 1 ❌ (WRONG - should be 100!)
costPerPortion: 6917.25 ❌ (WRONG - should be 69.17)
```

### Code Analysis
**File**: `src/app/api/sppg/menu/[id]/calculate-cost/route.ts`  
**Line**: 134

```typescript
// BEFORE FIX (Bug):
const plannedPortions = body.plannedPortions || 1  // ❌ Defaults to 1!
const costPerPortion = grandTotalCost.div(plannedPortions)

// Result:
// grandTotalCost: 6917.25
// plannedPortions: 1 (default because body.plannedPortions not provided)
// costPerPortion: 6917.25 / 1 = 6917.25 ❌ WRONG!
```

**Problem**: When `body.plannedPortions` not provided in request, it defaults to 1 instead of using the menu's `batchSize` (100).

---

## ✅ Solution Implemented

### Code Changes

**File**: `src/app/api/sppg/menu/[id]/calculate-cost/route.ts`  
**Lines**: 131-134

```typescript
// AFTER FIX (Correct):
// Per portion calculation
// Use batchSize as default if plannedPortions not provided in request
const plannedPortions = body.plannedPortions || menu.batchSize || 1
const costPerPortion = grandTotalCost.div(plannedPortions)

// Result:
// grandTotalCost: 76466.5
// plannedPortions: 100 (from menu.batchSize)
// costPerPortion: 76466.5 / 100 = 764.67 ✅ CORRECT!
```

### Logic Flow
1. **First try**: Use `body.plannedPortions` if provided in request
2. **Fallback**: Use `menu.batchSize` (typically 100) if not provided
3. **Final fallback**: Use 1 if both are null (edge case)

### Why This Fix Works
- **menu.batchSize** represents the standard production batch (e.g., 100 portions)
- Most menus are calculated for their standard batch size
- This matches user expectation: total cost for batch ÷ batch size = per portion cost
- `menu` object is already available in scope from earlier query (lines 40-70)

---

## 🧪 Testing

### Test Script Created
**File**: `scripts/test-cost-calculation.ts`

Shows detailed calculation breakdown including:
- Ingredient costs with quantity and unit prices
- Labor costs (preparation + cooking hours × rate)
- Utility costs (gas + electric + water)
- Operational costs (packaging + equipment + cleaning)
- Overhead (percentage of direct costs)
- **Before/After comparison** of plannedPortions bug

### Test Execution
```bash
npx tsx scripts/test-cost-calculation.ts
```

### Test Output
```
💰 Testing Cost Calculation with PlannedPortions Fix

📋 Menu: Nasi Sayur Asem Iga Ayam
   Batch Size: 100 portions

💰 Cost Summary:
   Direct Costs: Rp 69,515
   Overhead (10%): Rp 6,951.50
   ─────────────────────────────────
   Grand Total: Rp 76,466.50

🍽️ Per-Portion Cost Calculation:

❌ BEFORE FIX (Bug):
   plannedPortions = 1 (hardcoded default)
   costPerPortion = 76,466.50 / 1
   costPerPortion = Rp 76,466.50 ❌ WRONG!

✅ AFTER FIX (Correct):
   plannedPortions = 100 (from menu.batchSize)
   costPerPortion = 76,466.50 / 100
   costPerPortion = Rp 764.67 ✅ CORRECT!
```

### Database Verification
```sql
-- AFTER FIX (Correct):
menuName: Nasi Sayur Asem Iga Ayam
batchSize: 100 ✅
grandTotalCost: 76466.5 ✅
plannedPortions: 100 ✅ (FIXED!)
costPerPortion: 764.665 ✅ (FIXED!)
```

---

## 📊 Impact Analysis

### Before Fix
- ❌ Cost per portion = total cost (meaningless)
- ❌ Users couldn't see actual per-portion cost
- ❌ Budget planning impossible
- ❌ Pricing decisions based on wrong data

### After Fix
- ✅ Cost per portion correctly calculated
- ✅ Total cost and per-portion cost different (as expected)
- ✅ Accurate budget planning possible
- ✅ Correct pricing decisions

### Example Scenarios

**Scenario 1: Standard Batch (100 portions)**
```
Total Cost: Rp 76,466.50
Batch Size: 100
Per Portion: Rp 764.67 ✅
```

**Scenario 2: Custom Portions (200 portions)**
```
Total Cost: Rp 76,466.50
Requested Portions: 200 (via body.plannedPortions)
Per Portion: Rp 382.33 ✅
```

**Scenario 3: Small Batch (50 portions)**
```
Total Cost: Rp 76,466.50
Batch Size: 50
Per Portion: Rp 1,529.33 ✅
```

---

## 🎯 Cost Calculation Formula

### Complete Formula
```
INGREDIENT COSTS
= Sum of (quantity × costPerUnit) for all ingredients

LABOR COSTS
= (preparationHours + cookingHours) × laborCostPerHour

UTILITY COSTS
= gasCost + electricityCost + waterCost

OPERATIONAL COSTS
= packagingCost + equipmentCost + cleaningCost

DIRECT COSTS
= Ingredient + Labor + Utility + Operational

OVERHEAD
= Direct Costs × overheadPercentage / 100

GRAND TOTAL COST
= Direct Costs + Overhead

COST PER PORTION (FIXED!)
= Grand Total Cost / plannedPortions
  where plannedPortions = body.plannedPortions || menu.batchSize || 1
```

### Cost Ratios
```
Ingredient Ratio = (Ingredient Cost / Grand Total) × 100
Labor Ratio = (Labor Cost / Grand Total) × 100
Overhead Ratio = (Overhead Cost / Grand Total) × 100
```

---

## 🔄 Related Files Modified

### 1. API Route (FIXED)
- **File**: `src/app/api/sppg/menu/[id]/calculate-cost/route.ts`
- **Change**: Line 133 - Added `|| menu.batchSize` to default fallback
- **Status**: ✅ Fixed

### 2. Test Script (CREATED)
- **File**: `scripts/test-cost-calculation.ts`
- **Purpose**: Test and verify cost calculation with proper plannedPortions
- **Status**: ✅ Created and verified

### 3. Documentation (THIS FILE)
- **File**: `docs/COST_CALCULATION_PLANNEDPORTIONS_FIX.md`
- **Purpose**: Complete documentation of bug, fix, and testing
- **Status**: ✅ Complete

---

## 🧭 Manual UI Testing Steps

### Test 1: Cost Display Verification
1. **Navigate to**: http://localhost:3000/menu/cmh0d2v2n003rsv7flmd5ms0w
2. **Click Tab**: Biaya (Cost)
3. **Verify Values**:
   - ✅ Total Biaya Produksi: Rp 76,466.50
   - ✅ Per Porsi: Rp 764.67
   - ✅ **VALUES ARE DIFFERENT** (not the same anymore!)
4. **Expected**: Per-portion cost should be ~100x smaller than total

### Test 2: Different Menu Verification
1. **Navigate to**: http://localhost:3000/menu/cmh0d2v2m003csv7f1ilxfgow
2. **Click Tab**: Biaya (Cost)
3. **Verify**: Total and per-portion costs are different
4. **Check**: Per-portion = Total / batchSize

### Test 3: Cost Breakdown Display
1. **Check**: Ingredient costs breakdown
2. **Check**: Labor costs (hours × rate)
3. **Check**: Utility costs (gas + electric + water)
4. **Check**: Operational costs (packaging + equipment + cleaning)
5. **Check**: Overhead percentage and amount
6. **Verify**: All ratios add up correctly

---

## 📝 Key Learnings

### 1. Default Values Matter
- Never assume request body will have all values
- Always provide sensible defaults from available context
- Use business logic (batchSize) over arbitrary numbers (1)

### 2. Multi-tenant Context
- `menu` object already loaded with sppgId filtering
- Reuse available data instead of making new queries
- batchSize is standard production quantity per menu

### 3. Financial Calculations
- Use Prisma.Decimal for precision (not JavaScript numbers)
- Division by wrong denominator = completely wrong results
- Per-unit costs critical for pricing decisions

### 4. Testing Strategy
- Create test scripts for complex calculations
- Show before/after comparison in test output
- Verify database state after changes
- Include manual UI testing in checklist

---

## ✅ Completion Checklist

- [x] Bug identified and root cause analyzed
- [x] Code fix implemented (1 line change)
- [x] Test script created with detailed output
- [x] Test executed successfully (Rp 764.67 per portion)
- [x] Database verified (plannedPortions=100, costPerPortion=764.67)
- [x] Documentation created (this file)
- [x] Todo list updated
- [ ] Manual UI testing (pending user verification)

---

## 🎉 Summary

**What was broken**: Cost per portion = total cost (both Rp 6,917)  
**Why it was broken**: `plannedPortions` defaulted to 1 instead of using `menu.batchSize` (100)  
**How we fixed it**: Changed default from `body.plannedPortions || 1` to `body.plannedPortions || menu.batchSize || 1`  
**Verification**: Test shows correct calculation: Rp 76,466.50 / 100 = Rp 764.67 per portion ✅  

**Impact**: Users can now see accurate per-portion costs for budget planning and pricing decisions!

---

**Next Steps**: Manual UI testing to verify cost display in browser (Todo #5)
