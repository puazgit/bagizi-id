# Fix #1 Manual UI Testing Checklist
**Date**: October 21, 2025  
**Phase**: Testing Phase - Manual UI Verification  
**Server**: http://localhost:3000  

---

## 🔐 Test Credentials

**Login URL**: http://localhost:3000/login

**Test User** (Recommended):
- **Email**: `admin@sppg-purwakarta.com`
- **Password**: `password123`
- **Role**: SPPG Admin
- **SPPG**: Demo SPPG Purwakarta
- **Features**: Full access to menu management, complete data

**Alternative Users**:
- Kepala SPPG: `kepala@sppg-purwakarta.com` / `password123`
- Ahli Gizi: `gizi@sppg-purwakarta.com` / `password123`

---

## ✅ Testing Progress

### **Test Suite 1: Menu List Page** 
**URL**: `/menu` or `/sppg/menu`

- [ ] **TC-1.1**: Page loads without errors
  - Expected: Menu list displays
  - Verify: No console errors
  - Verify: No "Unknown field" errors
  
- [ ] **TC-1.2**: Menu cards show ingredient count
  - Expected: Each card shows "X bahan" (X ingredients)
  - Verify: Number matches actual ingredient count
  
- [ ] **TC-1.3**: Menu ingredients preview visible
  - Expected: Can see ingredient names in preview
  - Verify: Names come from inventoryItem.itemName
  - Verify: No undefined or null values

---

### **Test Suite 2: Menu Details Page**
**URL**: `/menu/[id]` 

- [ ] **TC-2.1**: Menu details page loads
  - Expected: Full menu information displays
  - Verify: Menu name, serving size, meal type visible
  
- [ ] **TC-2.2**: Ingredients list displays correctly
  - Expected: All ingredients visible in IngredientsList component
  - Verify: Each ingredient shows:
    - ✅ Name (from inventoryItem.itemName)
    - ✅ Quantity + Unit (from inventoryItem.unit)
    - ✅ Cost per unit (from inventoryItem.costPerUnit)
    - ✅ Total cost (calculated: quantity * costPerUnit)
    
- [ ] **TC-2.3**: Ingredient cards render properly
  - Expected: Each IngredientCard component displays
  - Verify: Card shows:
    - ✅ Ingredient name as card title
    - ✅ Quantity and unit in description
    - ✅ Cost per unit formatted as currency
    - ✅ Total cost calculated correctly
    - ✅ Edit and Delete buttons functional
    
- [ ] **TC-2.4**: Summary statistics correct
  - Expected: Ringkasan Bahan (Summary) card shows:
    - ✅ Total items count
    - ✅ Total cost sum
    - ✅ Average cost per ingredient
    - ✅ Most expensive ingredient name (from inventoryItem.itemName)
    - ✅ Most expensive cost (calculated correctly)

---

### **Test Suite 3: Cost Breakdown**
**URL**: `/menu/[id]` - Cost Breakdown section

- [ ] **TC-3.1**: Cost breakdown card loads
  - Expected: CostBreakdownCard component visible
  - Verify: No loading errors
  
- [ ] **TC-3.2**: Ingredient cost table displays
  - Expected: Table shows all ingredients with:
    - ✅ Column 1: Ingredient name (from API response)
    - ✅ Column 2: Quantity + Unit (from API response)
    - ✅ Column 3: Cost per unit (formatted as currency)
    - ✅ Column 4: Total cost (formatted as currency)
    
- [ ] **TC-3.3**: Cost calculations accurate
  - Expected: Total biaya bahan = sum of all ingredient costs
  - Verify: Manual calculation matches displayed total
  
- [ ] **TC-3.4**: Additional item info displays
  - Expected: Item code and supplier name visible (if available)
  - Verify: Data comes from inventoryItem relation

---

### **Test Suite 4: Nutrition Preview**
**URL**: `/menu/[id]` - Nutrition section

- [ ] **TC-4.1**: Nutrition preview card loads
  - Expected: NutritionPreview component visible
  - Verify: No loading errors
  
- [ ] **TC-4.2**: Ingredient nutrition table displays
  - Expected: Table shows all ingredients with:
    - ✅ Ingredient name (from API response)
    - ✅ Quantity + Unit (from API response)
    - ✅ Nutrition values (calories, protein, carbs, fat, fiber)
    
- [ ] **TC-4.3**: Nutrition data accurate
  - Expected: Values match inventory item nutrition data
  - Verify: No undefined or NaN values

---

### **Test Suite 5: Menu Creation/Edit Form**
**URL**: `/menu/create` or `/menu/[id]/edit`

- [ ] **TC-5.1**: Menu form page loads
  - Expected: Form displays without errors
  - Verify: All form fields visible
  
- [ ] **TC-5.2**: Add Ingredient section visible
  - Expected: MenuIngredientForm component displays
  - Verify: Form shows inventory item selector
  
- [ ] **TC-5.3**: Inventory selector populated
  - Expected: Dropdown shows all available inventory items
  - Verify: Each item shows:
    - ✅ Item name
    - ✅ Current stock
    - ✅ Unit
    - ✅ Price
    
- [ ] **TC-5.4**: Inventory item selection works
  - Expected: When selecting an item:
    - ✅ Selected item info displays below dropdown
    - ✅ Shows: Name, Unit, Price, Current Stock
    - ✅ Quantity field enabled
    
- [ ] **TC-5.5**: Stock validation functional
  - Expected: When entering quantity > current stock:
    - ✅ Validation error message displays
    - ✅ Submit button disabled or warning shown
    
- [ ] **TC-5.6**: Duplicate detection works
  - Expected: When adding same inventory item twice:
    - ✅ Warning dialog appears
    - ✅ Shows: "Item already added to menu"
    - ✅ Option to proceed or cancel
    
- [ ] **TC-5.7**: Ingredient submission successful
  - Expected: After clicking "Tambah Bahan":
    - ✅ Ingredient added to list
    - ✅ Form resets to empty state
    - ✅ Success toast notification appears
    - ✅ Ingredient list refreshes automatically
    
- [ ] **TC-5.8**: Manual input fields removed
  - Expected: NO manual input for:
    - ❌ Ingredient name (removed)
    - ❌ Unit (removed)
    - ❌ Cost per unit (removed)
  - Verify: Only inventory selector + quantity input available

---

### **Test Suite 6: Edit Ingredient Flow**

- [ ] **TC-6.1**: Edit button functional
  - Expected: Clicking edit on ingredient card:
    - ✅ Opens edit form
    - ✅ Pre-fills with current values
    - ✅ Shows correct inventory item selected
    
- [ ] **TC-6.2**: Update ingredient successful
  - Expected: After updating quantity and saving:
    - ✅ Ingredient updates in list
    - ✅ Cost recalculates automatically
    - ✅ Success notification appears

---

### **Test Suite 7: Delete Ingredient Flow**

- [ ] **TC-7.1**: Delete button functional
  - Expected: Clicking delete on ingredient card:
    - ✅ Confirmation dialog appears
    - ✅ Shows ingredient name (from inventoryItem.itemName)
    - ✅ "Cancel" and "Delete" buttons visible
    
- [ ] **TC-7.2**: Delete confirmation works
  - Expected: After confirming delete:
    - ✅ Ingredient removed from list
    - ✅ Ingredient count decreases
    - ✅ Total cost recalculates
    - ✅ Success notification appears

---

### **Test Suite 8: Error Handling**

- [ ] **TC-8.1**: Missing inventory item handled
  - Expected: If ingredient has invalid inventoryItemId:
    - ✅ Graceful error message
    - ✅ No app crash
    
- [ ] **TC-8.2**: Null cost handling
  - Expected: If inventoryItem.costPerUnit is null:
    - ✅ Displays as Rp 0
    - ✅ No calculation errors
    - ✅ Total cost still calculates
    
- [ ] **TC-8.3**: API errors handled
  - Expected: If API returns error:
    - ✅ Error toast notification
    - ✅ User-friendly error message
    - ✅ No console stack traces visible to user

---

## 📊 Test Results Summary

**Total Test Cases**: 31  
**Passed**: ___  
**Failed**: ___  
**Blocked**: ___  

### **Critical Failures** (if any):
- None yet

### **Known Issues** (if any):
- None yet

### **Notes**:
- Testing performed on: [Date/Time]
- Browser: [Chrome/Firefox/Safari]
- Browser version: [Version]
- Screen resolution: [Resolution]

---

## ✅ Sign-off

- [ ] All critical test cases passed
- [ ] No major bugs found
- [ ] Ready to merge Fix #1 to main branch

**Tested by**: _______________  
**Date**: _______________  
**Sign-off**: _______________  

---

## 🚀 Next Actions After Testing

If all tests pass:
1. Create PR: `feature/sppg-phase1-fixes` → `main`
2. Request code review
3. Merge to main
4. Deploy to staging
5. Perform smoke tests on staging
6. Deploy to production (if staging OK)

If tests fail:
1. Document all failures in "Critical Failures" section
2. Create bug fix tasks
3. Fix issues
4. Re-run failed test cases
5. Repeat until all pass
