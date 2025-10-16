# 🎯 Schema Cleanup - Testing Checklist

## ✅ Pre-Testing Verification

- [x] **Database Migration Applied**: `20251014161942_remove_selling_price`
- [x] **TypeScript Compilation**: Zero errors
- [x] **Production Build**: Successful
- [x] **Prisma Client**: Regenerated (v6.17.1)
- [x] **Code Changes**: All files updated
- [x] **Documentation**: Complete

---

## 🧪 Testing Scenarios

### 1. Menu Creation (HIGH PRIORITY)

#### Test Case 1.1: Create Basic Menu
- [ ] Navigate to `/menu/create`
- [ ] Fill in required fields (name, code, type, serving size)
- [ ] **Verify**: No "selling price" field visible
- [ ] **Verify**: Optional "budget allocation" field visible
- [ ] Save menu
- [ ] **Expected**: Menu created successfully without errors

#### Test Case 1.2: Create Menu with Budget Allocation
- [ ] Navigate to `/menu/create`
- [ ] Fill in all required fields
- [ ] Set budget allocation: Rp 950,000
- [ ] Save menu
- [ ] **Expected**: Budget allocation saved correctly
- [ ] View menu detail
- [ ] **Verify**: Budget allocation displayed instead of selling price

#### Test Case 1.3: Validation
- [ ] Try to create menu without required fields
- [ ] **Expected**: Proper validation errors (no selling price errors)

---

### 2. Cost Calculation (HIGH PRIORITY)

#### Test Case 2.1: Basic Cost Calculation
- [ ] Open existing menu
- [ ] Navigate to cost calculation
- [ ] Add ingredients with costs
- [ ] Calculate total cost
- [ ] **Verify**: No profit margin fields
- [ ] **Verify**: No recommended price calculated
- [ ] **Expected**: Cost per portion calculated correctly

#### Test Case 2.2: Cost Calculation with Budget Allocation
- [ ] Open menu with budget allocation
- [ ] Calculate costs
- [ ] **Verify**: Budget allocation used in calculations
- [ ] **Expected**: Cost calculation includes budget context

#### Test Case 2.3: Cost Calculation API
- [ ] Test API endpoint: `POST /api/sppg/menu/[id]/calculate-cost`
- [ ] Send payload without `targetProfitMargin`
- [ ] **Expected**: No errors, calculation succeeds
- [ ] **Verify**: Response includes `budgetAllocation` (if provided)
- [ ] **Verify**: Response does NOT include `recommendedPrice`

---

### 3. Cost Report Display (HIGH PRIORITY)

#### Test Case 3.1: View Cost Report without Budget
- [ ] Open menu without budget allocation
- [ ] View cost breakdown
- [ ] **Verify**: No "Pricing Strategy" section
- [ ] **Verify**: No "Budget Planning" section
- [ ] **Verify**: Cost breakdown shows correctly

#### Test Case 3.2: View Cost Report with Budget
- [ ] Open menu with budget allocation
- [ ] View cost breakdown
- [ ] **Verify**: "Budget Planning" section visible
- [ ] **Verify**: Shows:
  - Alokasi Anggaran (Budget Allocation)
  - Penggunaan Anggaran % (Budget Utilization %)
  - Sisa Anggaran (Budget Remaining)
- [ ] **Verify**: No "Pricing Strategy" section

#### Test Case 3.3: Cost Report API
- [ ] Test API endpoint: `GET /api/sppg/menu/[id]/cost-report`
- [ ] **Expected**: Response structure:
  ```json
  {
    "success": true,
    "data": {
      "costRatios": { ... },
      "budgetPlanning": {  // Only if allocated
        "budgetAllocation": 950000,
        "budgetUtilization": 71.5,
        "budgetRemaining": 270000
      },
      // No pricingStrategy field
    }
  }
  ```

---

### 4. Menu Detail Page (MEDIUM PRIORITY)

#### Test Case 4.1: View Menu without Budget
- [ ] Navigate to `/menu/[id]`
- [ ] **Verify**: "Biaya per Porsi" (Cost per Serving) displayed
- [ ] **Verify**: No "Harga Jual" (Selling Price) displayed
- [ ] **Verify**: No "Alokasi Anggaran" (Budget Allocation) displayed

#### Test Case 4.2: View Menu with Budget
- [ ] Navigate to menu with budget allocation
- [ ] **Verify**: "Biaya per Porsi" displayed
- [ ] **Verify**: "Alokasi Anggaran" displayed (if set)
- [ ] **Verify**: No "Harga Jual" displayed
- [ ] **Verify**: Currency formatting correct (Indonesian Rupiah)

---

### 5. Menu Editing (MEDIUM PRIORITY)

#### Test Case 5.1: Edit Existing Menu
- [ ] Navigate to `/menu/[id]/edit`
- [ ] **Verify**: No selling price field
- [ ] **Verify**: Budget allocation field available (optional)
- [ ] Update menu name
- [ ] Save changes
- [ ] **Expected**: No errors, changes saved

#### Test Case 5.2: Update Budget Allocation
- [ ] Edit menu
- [ ] Set/update budget allocation
- [ ] Save changes
- [ ] **Verify**: Budget allocation updated in database
- [ ] **Verify**: Cost report reflects new budget

---

### 6. Menu Duplication (MEDIUM PRIORITY)

#### Test Case 6.1: Duplicate Menu without Budget
- [ ] Open menu without budget allocation
- [ ] Click "Duplicate Menu"
- [ ] **Expected**: New menu created
- [ ] **Verify**: No selling price copied
- [ ] **Verify**: Cost per serving copied correctly

#### Test Case 6.2: Duplicate Menu with Budget
- [ ] Open menu with budget allocation
- [ ] Duplicate with "Copy cost calculation" enabled
- [ ] **Expected**: New menu created
- [ ] **Verify**: Budget allocation copied
- [ ] **Verify**: No pricing strategy fields copied
- [ ] **Verify**: Cost calculation structure correct

---

### 7. API Endpoints (LOW PRIORITY)

#### Test Case 7.1: Menu List API
- [ ] Test: `GET /api/sppg/menu`
- [ ] **Verify**: No `sellingPrice` in response
- [ ] **Verify**: `costPerServing` present
- [ ] **Verify**: `budgetAllocation` present (if set)

#### Test Case 7.2: Menu Create API
- [ ] Test: `POST /api/sppg/menu`
- [ ] Send payload with `budgetAllocation` (no `sellingPrice`)
- [ ] **Expected**: Menu created successfully
- [ ] **Verify**: Budget allocation saved

#### Test Case 7.3: Menu Update API
- [ ] Test: `PUT /api/sppg/menu/[id]`
- [ ] Send payload without `sellingPrice`
- [ ] **Expected**: Update successful
- [ ] **Verify**: No validation errors for missing selling price

---

### 8. Seed Data (LOW PRIORITY)

#### Test Case 8.1: Re-seed Database
- [ ] Run: `npm run db:reset`
- [ ] Run: `npm run db:seed`
- [ ] **Expected**: Seeding completes without errors
- [ ] **Verify**: 10 menus created
- [ ] **Verify**: No selling price values in database
- [ ] **Verify**: Budget allocations set on cost calculations

#### Test Case 8.2: Check Seeded Data
- [ ] Query: `SELECT * FROM nutrition_menus`
- [ ] **Verify**: No `sellingPrice` column
- [ ] Query: `SELECT * FROM menu_cost_calculations`
- [ ] **Verify**: No pricing strategy columns
- [ ] **Verify**: `budgetAllocation` column exists

---

## 🔍 Database Verification

### Schema Verification
```sql
-- Check nutrition_menus table
\d nutrition_menus;
-- Should NOT have: sellingPrice

-- Check menu_cost_calculations table
\d menu_cost_calculations;
-- Should NOT have: targetProfitMargin, recommendedPrice, marketPrice, priceCompetitiveness
-- Should HAVE: budgetAllocation
```

### Data Verification
```sql
-- Check for any orphaned data
SELECT COUNT(*) FROM nutrition_menus WHERE costPerServing IS NULL;
-- Should be 0

SELECT COUNT(*) FROM menu_cost_calculations WHERE menuId IS NULL;
-- Should be 0

-- Check budget allocation usage
SELECT COUNT(*) FROM menu_cost_calculations WHERE budgetAllocation IS NOT NULL;
-- Should be 3 (from seed data)
```

---

## 🚨 Error Scenarios to Test

### Error Test 1: TypeScript Compilation
- [ ] Run: `npx tsc --noEmit`
- [ ] **Expected**: Zero errors
- [ ] **Verify**: No references to removed fields

### Error Test 2: Runtime Errors
- [ ] Start dev server: `npm run dev`
- [ ] Navigate through all menu pages
- [ ] **Expected**: No console errors
- [ ] **Verify**: No "undefined" errors for removed fields

### Error Test 3: API Error Handling
- [ ] Send invalid payload with `sellingPrice` to menu API
- [ ] **Expected**: Either ignored or validation error
- [ ] **Verify**: System doesn't crash

---

## ✅ Acceptance Criteria

### Must Pass (Critical)
- [ ] All menu CRUD operations work without errors
- [ ] Cost calculations complete successfully
- [ ] No TypeScript compilation errors
- [ ] Production build succeeds
- [ ] No console errors in browser
- [ ] Database schema matches Prisma schema

### Should Pass (Important)
- [ ] Budget allocation displays correctly
- [ ] Cost reports show budget planning (if allocated)
- [ ] No references to "selling price" in UI
- [ ] All API responses exclude removed fields
- [ ] Seed data loads without errors

### Nice to Have (Optional)
- [ ] Budget utilization calculations accurate
- [ ] Budget remaining displays correctly
- [ ] Cost optimization suggestions work

---

## 📊 Test Results Template

```markdown
## Test Results - [Date]

**Tester**: [Name]
**Environment**: [Development/Staging/Production]
**Database**: [Clean/Seeded]

### Summary
- Tests Passed: ___ / ___
- Tests Failed: ___ / ___
- Tests Skipped: ___ / ___

### Failed Tests
1. Test Case X.Y: [Description]
   - **Issue**: [What went wrong]
   - **Expected**: [What should happen]
   - **Actual**: [What actually happened]
   - **Priority**: [High/Medium/Low]

### Notes
[Any additional observations or concerns]
```

---

## 🎯 Test Completion

**Status**: [ ] Not Started / [ ] In Progress / [ ] Complete

**Sign-off**:
- **Developer**: ___________________
- **QA Tester**: ___________________
- **Date**: ___________________

---

## 📞 Support

If you encounter any issues during testing:

1. **Check Documentation**: `SCHEMA_SELLING_PRICE_CLEANUP_COMPLETE.md`
2. **Check Logs**: Browser console & server logs
3. **Verify Database**: Ensure migration applied correctly
4. **Check Types**: Run `npx tsc --noEmit` for type errors

**All tests should pass with zero errors for production deployment approval.** ✅
