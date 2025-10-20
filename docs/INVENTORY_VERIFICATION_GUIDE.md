# 🧪 Inventory Feature - Verification Guide

**Date**: October 20, 2025  
**Status**: Ready for Testing  
**Purpose**: Step-by-step guide to verify inventory feature works correctly

---

## ✅ Pre-Verification Checklist

Before starting tests, confirm:
- [x] All TypeScript errors resolved (0 errors)
- [x] All ESLint warnings cleared
- [x] Development server running (`npm run dev`)
- [x] Database seeded with test data
- [x] Logged in as SPPG_ADMIN user
- [x] Bugfix complete (type/schema alignment)

---

## 🎯 Phase 1: Critical Path - Page Load

### Test 1.1: Inventory Page Loads ⚡ PRIORITY
**URL**: `http://localhost:3000/inventory`

**Expected Results**:
- ✅ Page loads without error
- ✅ Shows "Inventory Management" heading
- ✅ Shows low stock alerts (if any)
- ✅ Shows inventory list with data
- ✅ Shows filter controls (category, status, search)
- ✅ Shows pagination controls
- ✅ Shows "Create New Item" button

**Console Logs to Check**:
```bash
# Should see these in order:
🔐 [Inventory API] Auth Check: { hasSession: true, userRole: 'SPPG_ADMIN', ... }
🔑 [Inventory API] Permission Check: { hasInventoryPermission: true }
✅ [Inventory API] All checks passed, fetching data...
📋 [Inventory API] Filters to validate: { "stockStatus": "ALL", "isActive": true, "page": 1, "pageSize": 10 }
✅ [Inventory API] Validation passed: { ... }

# Final network log:
GET /api/sppg/inventory?stockStatus=ALL&isActive=true&page=1&pageSize=10 200 in ~150ms
```

**If This Fails**:
- Check console for validation errors
- Copy full error message
- Share console logs with developer
- Do NOT proceed to other tests

**If This Passes**: ✅ Proceed to Test 1.2

---

### Test 1.2: Navigation Active State
**Action**: Click "Inventory" in sidebar

**Expected Results**:
- ✅ "Inventory" menu item highlighted
- ✅ URL shows `/inventory`
- ✅ Page content updates correctly

---

### Test 1.3: Low Stock Alerts Display
**Action**: Check top of inventory page

**Expected Results**:
- ✅ Shows alert banner if items below minStock
- ✅ Alert shows item names
- ✅ Alert shows current vs minimum stock
- ✅ "Dismiss" button works
- ✅ Dismissed state persists in localStorage

---

## 🎯 Phase 2: List & Filter Features

### Test 2.1: Category Filter
**Action**: Select different categories from dropdown

**Test Cases**:
1. Select "Protein" → Shows only protein items
2. Select "Karbohidrat" → Shows only carbohydrate items
3. Select "All Categories" → Shows all items

**Expected**: ✅ List updates immediately, pagination resets to page 1

---

### Test 2.2: Stock Status Filter
**Action**: Change stock status filter

**Test Cases**:
1. "All" → Shows all items
2. "In Stock" → Shows items with stock > minStock
3. "Low Stock" → Shows items with 0 < stock <= minStock
4. "Out of Stock" → Shows items with stock = 0

**Expected**: ✅ List filters correctly, count updates

---

### Test 2.3: Search Filter
**Action**: Type in search box

**Test Cases**:
1. Type "Beras" → Shows items with "Beras" in name
2. Type "PRO-" → Shows items with codes starting "PRO-"
3. Clear search → Shows all items again

**Expected**: ✅ Search is case-insensitive, debounced

---

### Test 2.4: Pagination
**Action**: Navigate through pages

**Test Cases**:
1. If >10 items, "Next" button visible
2. Click "Next" → Shows next 10 items
3. Click "Previous" → Returns to previous page
4. Current page number highlighted
5. Can jump to specific page number

**Expected**: ✅ Smooth pagination, data updates correctly

---

## 🎯 Phase 3: Create Flow

### Test 3.1: Navigate to Create Page
**Action**: Click "Create New Item" button

**Expected Results**:
- ✅ Navigates to `/inventory/create`
- ✅ Shows "Create New Inventory Item" heading
- ✅ Shows empty form
- ✅ All fields visible and enabled

---

### Test 3.2: Form Validation
**Action**: Try to submit empty form

**Test Cases**:
1. Click "Save" without filling → Shows validation errors
2. Fill only name → Shows other required field errors
3. Enter negative quantity → Shows validation error
4. Enter price < 0 → Shows validation error

**Expected**: ✅ Clear error messages, fields highlighted

---

### Test 3.3: Successful Creation
**Action**: Fill form completely and submit

**Test Data**:
```
Name: Beras Putih Premium
Code: KARB-001
Category: KARBOHIDRAT
Unit: kg
Current Stock: 500
Min Stock: 100
Max Stock: 1000
Unit Price: 12000
Storage: Gudang Utama
Supplier: (select from dropdown)
```

**Expected Results**:
- ✅ Form submits successfully
- ✅ Shows success toast: "Inventory item created successfully"
- ✅ Redirects to detail page: `/inventory/{id}`
- ✅ Detail page shows correct data

---

## 🎯 Phase 4: Detail & Edit Flow

### Test 4.1: View Item Detail
**Action**: Click any item in list

**Expected Results**:
- ✅ Navigates to `/inventory/{id}`
- ✅ Shows "Inventory Item Details" heading
- ✅ Shows all item information in cards
- ✅ Shows "Edit" and "Delete" buttons
- ✅ Shows "Record Stock Movement" button

---

### Test 4.2: Edit Item
**Action**: Click "Edit" button on detail page

**Expected Results**:
- ✅ Navigates to `/inventory/{id}/edit`
- ✅ Shows "Edit Inventory Item" heading
- ✅ Form pre-filled with current data
- ✅ Can modify any field
- ✅ Submit shows success toast
- ✅ Redirects back to detail page
- ✅ Changes reflected immediately

---

### Test 4.3: Delete Item
**Action**: Click "Delete" button on detail page

**Expected Results**:
- ✅ Shows confirmation dialog
- ✅ Confirms with item name
- ✅ "Cancel" closes dialog, no action
- ✅ "Delete" removes item
- ✅ Shows success toast
- ✅ Redirects to inventory list
- ✅ Item no longer in list

---

## 🎯 Phase 5: Stock Movement Flow

### Test 5.1: Record Stock Movement
**Action**: Click "Record Stock Movement" on detail page

**Expected Results**:
- ✅ Shows stock movement form dialog
- ✅ Shows current stock amount
- ✅ Movement type dropdown (IN/OUT/ADJUSTMENT/WASTE)
- ✅ Quantity input (positive number)
- ✅ Reference number field
- ✅ Notes textarea

---

### Test 5.2: Stock IN Movement
**Action**: Record stock receipt

**Test Data**:
```
Type: STOCK_IN
Quantity: 100
Reference: PO-2025-001
Notes: Received from Supplier ABC
```

**Expected Results**:
- ✅ Form submits successfully
- ✅ Shows success toast
- ✅ Current stock increases by 100
- ✅ Movement appears in history
- ✅ Status shows "PENDING" (awaiting approval)

---

### Test 5.3: Stock OUT Movement
**Action**: Record stock usage

**Test Data**:
```
Type: STOCK_OUT
Quantity: 50
Reference: PROD-2025-001
Notes: Used in production batch
```

**Expected Results**:
- ✅ Form submits successfully
- ✅ Current stock decreases by 50
- ✅ Movement in history
- ✅ Cannot set quantity > current stock

---

### Test 5.4: Stock Movement History
**Action**: Navigate to `/inventory/stock-movements`

**Expected Results**:
- ✅ Shows "Stock Movement History" heading
- ✅ Lists all movements (recent first)
- ✅ Shows movement type badges (IN/OUT/etc.)
- ✅ Shows status badges (PENDING/APPROVED/REJECTED)
- ✅ Shows item names and quantities
- ✅ Filterable by type, status, item
- ✅ Paginated if many movements

---

### Test 5.5: Movement Approval (if SPPG_ADMIN)
**Action**: Click "Approve" on pending movement

**Expected Results**:
- ✅ Shows approval confirmation
- ✅ Approve changes status to APPROVED
- ✅ Shows "Approved by" and timestamp
- ✅ Reject changes status to REJECTED
- ✅ Rejected movements don't affect stock

---

## 🎯 Phase 6: Export & Advanced Features

### Test 6.1: Export to CSV
**Action**: Click "Export CSV" button on list page

**Expected Results**:
- ✅ Downloads CSV file immediately
- ✅ Filename: `inventory-{date}.csv`
- ✅ Contains all filtered items
- ✅ Correct column headers
- ✅ Data matches screen display

**Verify CSV Contents**:
```csv
Item Name,Code,Category,Current Stock,Unit,Unit Price,Storage Location,Status
Beras Putih,KARB-001,KARBOHIDRAT,500,kg,12000,Gudang Utama,IN_STOCK
```

---

### Test 6.2: Low Stock Alert Dismiss
**Action**: Click "Dismiss" on low stock alert

**Expected Results**:
- ✅ Alert disappears immediately
- ✅ localStorage updated
- ✅ Alert stays hidden on page reload
- ✅ New low stock items still show alerts

---

## 🎯 Phase 7: Permission Testing

### Test 7.1: Different User Roles
**Test with different role logins**:

**SPPG_ADMIN / SPPG_KEPALA**:
- ✅ Can view inventory
- ✅ Can create items
- ✅ Can edit items
- ✅ Can delete items
- ✅ Can approve stock movements

**SPPG_PRODUKSI_MANAGER**:
- ✅ Can view inventory
- ✅ Can create items
- ✅ Can record stock movements
- ❌ Cannot delete items
- ❌ Cannot approve movements

**SPPG_VIEWER**:
- ✅ Can view inventory (read-only)
- ❌ Cannot create/edit/delete
- ❌ Cannot record movements
- ❌ No action buttons visible

---

## 🎯 Phase 8: Mobile Responsiveness

### Test 8.1: Mobile Layout (< 768px)
**Action**: Resize browser to mobile width

**Expected Results**:
- ✅ Sidebar collapses to hamburger menu
- ✅ Inventory list shows card layout
- ✅ Filters stack vertically
- ✅ Tables become scrollable
- ✅ Forms show single column
- ✅ Buttons full width
- ✅ Touch-friendly spacing

---

### Test 8.2: Tablet Layout (768px - 1024px)
**Action**: Resize to tablet width

**Expected Results**:
- ✅ Sidebar visible or collapsible
- ✅ List shows 2-column grid
- ✅ Forms show 2 columns
- ✅ Touch-friendly interactions

---

## 🎯 Phase 9: Performance Testing

### Test 9.1: Page Load Speed
**Action**: Reload `/inventory` page

**Measurements**:
- ✅ First Contentful Paint < 1.5s
- ✅ Largest Contentful Paint < 2.5s
- ✅ Time to Interactive < 3.0s
- ✅ No layout shifts (CLS < 0.1)

**Check**: Chrome DevTools → Lighthouse → Performance

---

### Test 9.2: API Response Times
**Action**: Open Network tab, perform operations

**Measurements**:
- ✅ GET /api/sppg/inventory < 200ms
- ✅ POST /api/sppg/inventory < 300ms
- ✅ PUT /api/sppg/inventory/[id] < 300ms
- ✅ GET /api/sppg/inventory/stock-movements < 200ms

---

### Test 9.3: Bundle Size
**Action**: Check Network tab → JS bundle size

**Expected**:
- ✅ Initial bundle < 500KB
- ✅ Route bundle < 150KB
- ✅ Images optimized (WebP/AVIF)
- ✅ Code splitting working

---

## 🎯 Phase 10: Error Handling

### Test 10.1: Network Error
**Action**: Disable network, try to load page

**Expected Results**:
- ✅ Shows error message: "Failed to load inventory"
- ✅ Shows retry button
- ✅ Retry button works when network restored

---

### Test 10.2: Validation Error
**Action**: Submit invalid data

**Expected Results**:
- ✅ Shows field-specific error messages
- ✅ Highlights invalid fields
- ✅ Doesn't submit until valid

---

### Test 10.3: Permission Error
**Action**: Access as unauthorized role

**Expected Results**:
- ✅ Shows "Access Denied" message
- ✅ No action buttons visible
- ✅ Redirects to appropriate page

---

## 📊 Test Results Summary

### Quick Checklist
Copy this and fill in your test results:

```
[ ] Phase 1: Critical Path - Page Load
  [ ] 1.1 Inventory Page Loads
  [ ] 1.2 Navigation Active State
  [ ] 1.3 Low Stock Alerts Display

[ ] Phase 2: List & Filter Features
  [ ] 2.1 Category Filter
  [ ] 2.2 Stock Status Filter
  [ ] 2.3 Search Filter
  [ ] 2.4 Pagination

[ ] Phase 3: Create Flow
  [ ] 3.1 Navigate to Create Page
  [ ] 3.2 Form Validation
  [ ] 3.3 Successful Creation

[ ] Phase 4: Detail & Edit Flow
  [ ] 4.1 View Item Detail
  [ ] 4.2 Edit Item
  [ ] 4.3 Delete Item

[ ] Phase 5: Stock Movement Flow
  [ ] 5.1 Record Stock Movement
  [ ] 5.2 Stock IN Movement
  [ ] 5.3 Stock OUT Movement
  [ ] 5.4 Stock Movement History
  [ ] 5.5 Movement Approval

[ ] Phase 6: Export & Advanced Features
  [ ] 6.1 Export to CSV
  [ ] 6.2 Low Stock Alert Dismiss

[ ] Phase 7: Permission Testing
  [ ] 7.1 Different User Roles

[ ] Phase 8: Mobile Responsiveness
  [ ] 8.1 Mobile Layout
  [ ] 8.2 Tablet Layout

[ ] Phase 9: Performance Testing
  [ ] 9.1 Page Load Speed
  [ ] 9.2 API Response Times
  [ ] 9.3 Bundle Size

[ ] Phase 10: Error Handling
  [ ] 10.1 Network Error
  [ ] 10.2 Validation Error
  [ ] 10.3 Permission Error
```

---

## 🚨 Critical Issues to Report

If you encounter any of these, report immediately:

1. **Page doesn't load** (still 400 error)
   - Copy full console log
   - Copy network request/response
   - Take screenshot

2. **Data not displaying**
   - Check if API returns data
   - Check console for errors
   - Verify database has data

3. **Actions fail** (create/edit/delete)
   - Copy error message
   - Copy console log
   - Note which action failed

4. **Permission issues**
   - Note your user role
   - Note which action was blocked
   - Check if it should be allowed

---

## ✅ Success Criteria

Feature is ready for production when:

- ✅ All Phase 1 tests pass (critical path)
- ✅ At least 80% of all tests pass
- ✅ No critical bugs found
- ✅ Performance metrics met
- ✅ Mobile responsiveness confirmed
- ✅ Permission system working correctly

---

## 📝 Next Steps After Verification

### If All Tests Pass ✅
1. Mark Step 9 (Integration Testing) as complete
2. Proceed to Step 10 (Final Documentation)
3. Create comprehensive README
4. Document API endpoints
5. Add deployment checklist

### If Issues Found ❌
1. Report issues with details
2. Developer will fix bugs
3. Re-run failed tests
4. Continue when all pass

---

**Verification Date**: _____________  
**Tester Name**: _____________  
**Overall Result**: [ ] PASS  [ ] FAIL  
**Notes**: _____________________________________________

---

**Good luck with testing! 🎉**  
**Questions? Check the troubleshooting guide in INVENTORY_VALIDATION_ERROR_BUGFIX_COMPLETE.md**
