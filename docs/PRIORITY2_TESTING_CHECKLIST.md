# ✅ Priority 2 Testing Checklist

## 🎯 Testing Overview

**Features to Test**: Priority 2 enhancements
- Unit Selector
- Inventory Selector
- Stock Warnings
- Auto-fill functionality

---

## 1️⃣ Unit Selector Testing

### Test Case 1.1: Dropdown Display
- [ ] Open ingredient form
- [ ] Click on "Satuan" field
- [ ] Verify dropdown opens
- [ ] Verify all 11 units are visible
- [ ] Verify units have descriptions (gram (g), kilogram (kg), etc.)

**Expected Result**: ✅ All 11 units displayed with descriptions

### Test Case 1.2: Unit Selection
- [ ] Click on a unit (e.g., "kilogram (kg)")
- [ ] Verify unit field shows selected value
- [ ] Verify form validation accepts the unit
- [ ] Submit form
- [ ] Verify ingredient saved with correct unit

**Expected Result**: ✅ Selected unit saved correctly

### Test Case 1.3: Search Functionality
- [ ] Open unit dropdown
- [ ] Type "kg" in search
- [ ] Verify "kilogram (kg)" appears
- [ ] Verify other units are filtered out
- [ ] Clear search
- [ ] Verify all units visible again

**Expected Result**: ✅ Search filters units correctly

### Test Case 1.4: Form Validation
- [ ] Leave unit field empty
- [ ] Try to submit form
- [ ] Verify validation error appears
- [ ] Select a unit
- [ ] Verify error disappears

**Expected Result**: ✅ Required validation works

---

## 2️⃣ Inventory Selector Testing

### Test Case 2.1: Selector Visibility

#### CREATE Mode
- [ ] Open ingredient form in CREATE mode
- [ ] Verify "📦 Pilih dari Inventory" badge is visible
- [ ] Verify inventory dropdown is visible
- [ ] Verify separator line below selector

**Expected Result**: ✅ Selector visible in CREATE mode

#### EDIT Mode
- [ ] Click "Edit" on an existing ingredient
- [ ] Verify form opens in EDIT mode
- [ ] Verify "🖊️ Mode Edit" badge appears
- [ ] Verify inventory selector is HIDDEN

**Expected Result**: ✅ Selector hidden in EDIT mode

### Test Case 2.2: Inventory Items Display
- [ ] Open inventory dropdown
- [ ] Verify inventory items are listed
- [ ] Verify each item shows:
  - [ ] Item name
  - [ ] Stock level
  - [ ] Unit
- [ ] Verify items are sorted alphabetically

**Expected Result**: ✅ All inventory items displayed correctly

### Test Case 2.3: Low Stock Warnings
- [ ] Find an item with stock < minStock
- [ ] Verify "⚠️ Low" warning appears
- [ ] Verify warning text is red (text-destructive)
- [ ] Find an item with stock >= minStock
- [ ] Verify NO warning appears

**Expected Result**: ✅ Low stock warnings accurate

### Test Case 2.4: Auto-fill Functionality

#### Single Field Auto-fill
- [ ] Select an inventory item
- [ ] Verify "Nama Bahan" auto-fills with item name
- [ ] Verify "Satuan" auto-fills with item unit
- [ ] Verify "Harga per Unit" auto-fills with item price
- [ ] Verify quantity field remains empty (not auto-filled)

**Expected Result**: ✅ 3 fields auto-fill, quantity stays manual

#### Multiple Selections
- [ ] Select "Beras Merah"
- [ ] Verify fields populated
- [ ] Change selection to "Daging Ayam"
- [ ] Verify fields update to new item's data
- [ ] Select "Telur Ayam"
- [ ] Verify fields update again

**Expected Result**: ✅ Fields update on each selection

### Test Case 2.5: Manual Override
- [ ] Select an inventory item (auto-fills fields)
- [ ] Manually change the ingredient name
- [ ] Manually change the unit
- [ ] Manually change the price
- [ ] Submit form
- [ ] Verify manually entered values are saved

**Expected Result**: ✅ Manual changes override auto-fill

### Test Case 2.6: Optional Selection
- [ ] Open form WITHOUT selecting inventory
- [ ] Enter all fields manually
- [ ] Submit form
- [ ] Verify ingredient saved correctly

**Expected Result**: ✅ Form works without inventory selection

---

## 3️⃣ Stock Validation Testing

### Test Case 3.1: Visual Stock Warnings
- [ ] Open inventory dropdown
- [ ] Find item with currentStock < minStock
- [ ] Verify "⚠️ Low" appears next to stock
- [ ] Verify text is red
- [ ] Find item with currentStock >= minStock
- [ ] Verify NO warning

**Expected Result**: ✅ Visual warnings accurate

### Test Case 3.2: Console Warnings
- [ ] Open browser console
- [ ] Select item with low stock
- [ ] Verify console warning logged:
  ```
  Low stock: [Item Name]
  ```
- [ ] Select item with normal stock
- [ ] Verify NO console warning

**Expected Result**: ✅ Console warnings logged for low stock

### Test Case 3.3: Stock Display Accuracy
- [ ] Compare stock in dropdown with database
- [ ] Verify currentStock value matches
- [ ] Verify unit matches
- [ ] Update stock in database
- [ ] Refresh page
- [ ] Verify dropdown shows updated stock

**Expected Result**: ✅ Stock values accurate and real-time

---

## 4️⃣ Integration Testing

### Test Case 4.1: Complete Workflow (Inventory)
1. [ ] Open ingredient form
2. [ ] Select inventory item "Beras Merah"
3. [ ] Verify auto-fill: name, unit, price
4. [ ] Enter quantity: 50
5. [ ] Enter preparation notes (optional)
6. [ ] Submit form
7. [ ] Verify ingredient appears in list
8. [ ] Verify all data correct (name, quantity, unit, price)

**Expected Result**: ✅ Complete workflow successful

### Test Case 4.2: Complete Workflow (Manual)
1. [ ] Open ingredient form
2. [ ] Skip inventory selector
3. [ ] Enter name manually: "Garam Himalaya"
4. [ ] Enter quantity: 10
5. [ ] Select unit: "gram (g)"
6. [ ] Enter price: 5000
7. [ ] Submit form
8. [ ] Verify ingredient appears in list
9. [ ] Verify all data correct

**Expected Result**: ✅ Manual entry workflow successful

### Test Case 4.3: Edit After Auto-fill
1. [ ] Create ingredient via inventory selector
2. [ ] Verify ingredient saved
3. [ ] Click "Edit" on the ingredient
4. [ ] Verify form opens in EDIT mode
5. [ ] Verify all fields populated (read-only name, quantity, unit, price)
6. [ ] Change quantity
7. [ ] Submit form
8. [ ] Verify update successful

**Expected Result**: ✅ Edit after auto-fill works

---

## 5️⃣ Error Handling Testing

### Test Case 5.1: Empty Inventory
- [ ] Clear all inventory items (or test with new SPPG)
- [ ] Open ingredient form
- [ ] Verify inventory selector shows empty state
- [ ] Verify message: "No inventory items"
- [ ] Verify can still add ingredients manually

**Expected Result**: ✅ Graceful handling of empty inventory

### Test Case 5.2: API Error
- [ ] Simulate API error (disconnect network)
- [ ] Open ingredient form
- [ ] Verify error message appears
- [ ] Verify form still usable (manual entry)
- [ ] Restore network
- [ ] Refresh page
- [ ] Verify inventory loads

**Expected Result**: ✅ Graceful error handling

### Test Case 5.3: Invalid Selection
- [ ] Select inventory item
- [ ] Delete item from database (simulate race condition)
- [ ] Submit form
- [ ] Verify error handling
- [ ] Verify user notified

**Expected Result**: ✅ Invalid selection handled

---

## 6️⃣ Performance Testing

### Test Case 6.1: Load Time
- [ ] Clear browser cache
- [ ] Open ingredient form
- [ ] Measure time to load inventory
- [ ] Expected: < 500ms

**Expected Result**: ✅ Fast load time

### Test Case 6.2: Caching
- [ ] Open form (loads inventory)
- [ ] Close form
- [ ] Open form again
- [ ] Verify inventory loads from cache (instant)
- [ ] Wait 5 minutes
- [ ] Open form again
- [ ] Verify inventory refetches (stale time expired)

**Expected Result**: ✅ Caching works correctly (5 min stale time)

### Test Case 6.3: Large Dataset
- [ ] Add 100+ inventory items
- [ ] Open ingredient form
- [ ] Verify dropdown performance
- [ ] Verify search performance
- [ ] Verify scroll performance

**Expected Result**: ✅ No performance degradation

---

## 7️⃣ Security Testing

### Test Case 7.1: Multi-tenant Isolation
- [ ] Login as SPPG A user
- [ ] Open ingredient form
- [ ] Verify only SPPG A inventory items visible
- [ ] Login as SPPG B user
- [ ] Open ingredient form
- [ ] Verify only SPPG B inventory items visible
- [ ] Verify SPPG A items NOT visible

**Expected Result**: ✅ Multi-tenant isolation enforced

### Test Case 7.2: Authentication
- [ ] Logout
- [ ] Try to access `/api/sppg/inventory/items` directly
- [ ] Verify 401 Unauthorized response
- [ ] Login
- [ ] Try same API endpoint
- [ ] Verify 200 OK response

**Expected Result**: ✅ Authentication required

### Test Case 7.3: Authorization
- [ ] Login as DEMO_USER
- [ ] Open ingredient form
- [ ] Verify inventory selector works
- [ ] Verify only demo SPPG inventory visible
- [ ] Login as PLATFORM_SUPERADMIN
- [ ] Verify cannot access SPPG inventory endpoint directly

**Expected Result**: ✅ Authorization rules enforced

---

## 8️⃣ Accessibility Testing

### Test Case 8.1: Keyboard Navigation
- [ ] Open form with keyboard only (Tab key)
- [ ] Navigate to unit selector
- [ ] Open dropdown with Enter/Space
- [ ] Navigate options with Arrow keys
- [ ] Select with Enter
- [ ] Verify selection works

**Expected Result**: ✅ Full keyboard support

### Test Case 8.2: Screen Reader
- [ ] Enable screen reader
- [ ] Navigate to form
- [ ] Verify labels are read correctly
- [ ] Verify dropdown options are read
- [ ] Verify stock warnings are announced

**Expected Result**: ✅ Screen reader compatible

### Test Case 8.3: Focus Management
- [ ] Open dropdown
- [ ] Verify focus trapped in dropdown
- [ ] Press Escape
- [ ] Verify dropdown closes
- [ ] Verify focus returns to trigger button

**Expected Result**: ✅ Proper focus management

---

## 9️⃣ Cross-browser Testing

### Test Case 9.1: Chrome
- [ ] Test all above cases in Chrome
- [ ] Verify no console errors
- [ ] Verify visual consistency

**Expected Result**: ✅ Works in Chrome

### Test Case 9.2: Safari
- [ ] Test all above cases in Safari
- [ ] Verify no console errors
- [ ] Verify visual consistency

**Expected Result**: ✅ Works in Safari

### Test Case 9.3: Firefox
- [ ] Test all above cases in Firefox
- [ ] Verify no console errors
- [ ] Verify visual consistency

**Expected Result**: ✅ Works in Firefox

---

## 10️⃣ Mobile Testing

### Test Case 10.1: Mobile View
- [ ] Open form on mobile device
- [ ] Verify inventory selector responsive
- [ ] Verify dropdown opens properly
- [ ] Verify touch interactions work
- [ ] Verify text readable (no overflow)

**Expected Result**: ✅ Fully responsive

### Test Case 10.2: Tablet View
- [ ] Open form on tablet
- [ ] Verify layout adapts
- [ ] Verify all features work

**Expected Result**: ✅ Works on tablet

---

## 📊 Test Summary Report

### Manual Testing
```
┌─────────────────────────────────────────────────┐
│ Feature              │ Tests │ Pass │ Fail │ %  │
├─────────────────────────────────────────────────┤
│ Unit Selector        │   4   │  __  │  __  │ __ │
│ Inventory Selector   │   6   │  __  │  __  │ __ │
│ Stock Validation     │   3   │  __  │  __  │ __ │
│ Integration          │   3   │  __  │  __  │ __ │
│ Error Handling       │   3   │  __  │  __  │ __ │
│ Performance          │   3   │  __  │  __  │ __ │
│ Security             │   3   │  __  │  __  │ __ │
│ Accessibility        │   3   │  __  │  __  │ __ │
│ Cross-browser        │   3   │  __  │  __  │ __ │
│ Mobile               │   2   │  __  │  __  │ __ │
├─────────────────────────────────────────────────┤
│ TOTAL                │  33   │  __  │  __  │ __ │
└─────────────────────────────────────────────────┘
```

### Testing Instructions
1. Check each box [ ] when test passes
2. Record any failures in "Issues Found" section below
3. Retest failed cases after fixes
4. Update summary report with results

---

## 🐛 Issues Found

### Issue Template
```
**Issue #**: [Number]
**Test Case**: [Test Case ID]
**Severity**: [Critical/High/Medium/Low]
**Description**: [What went wrong]
**Steps to Reproduce**:
1. 
2. 
3. 
**Expected**: [What should happen]
**Actual**: [What actually happened]
**Screenshot**: [If applicable]
**Status**: [Open/Fixed/Wontfix]
```

---

## ✅ Sign-off

**Tester Name**: ___________________  
**Date**: ___________________  
**Environment**: ___________________  
**Browser**: ___________________  
**Status**: [ ] Passed [ ] Failed [ ] Needs Retest  

**Notes**:
_______________________________________
_______________________________________
_______________________________________

---

**Testing Version**: 1.0.0  
**Features Tested**: Priority 2 (Unit Selector, Inventory Selector)  
**Last Updated**: 14 Oktober 2025
