# 🚀 Supplier Module - Quick Start Testing Guide

**Date**: October 20, 2025  
**Status**: Ready for Manual Testing  
**Development Server**: Running at http://localhost:3000

---

## ⚡ Quick Start (5 Minutes)

### Step 1: Access Supplier Module
```
1. Open browser: http://localhost:3000
2. Login with test credentials
3. Look for "Suppliers" in sidebar (Operations group)
4. Click "Suppliers" → Should go to /suppliers
```

**✅ Success**: URL is `/suppliers` (NOT `/procurement/suppliers`)

---

### Step 2: Test Supplier List
```
1. Verify table displays with columns
2. Try search box: Type any supplier name
3. Try filters: Type, Category, City, Status
4. Try sorting: Click column headers
5. Try pagination: Next/Previous buttons
```

**✅ Success**: All interactions work smoothly, no errors

---

### Step 3: Create Supplier
```
1. Click "Add Supplier" button
2. Fill form with test data:
   - Name: "Test Supplier"
   - Code: "SUP-TEST-001"
   - Type: "Bahan Baku"
   - Category: "Protein Hewani"
   - Contact: "John Doe"
   - Phone: "08123456789"
   - Email: "test@supplier.com"
3. Click Submit
```

**✅ Success**: Redirects to list, new supplier appears

---

### Step 4: View & Edit
```
1. Click on the new supplier row
2. Verify detail page shows all data
3. Click "Edit" button
4. Change name to "Test Supplier Updated"
5. Click Save
```

**✅ Success**: Changes saved, detail page updates

---

### Step 5: Delete
```
1. From list, click Actions → Delete
2. Confirm deletion
3. Verify supplier removed from list
```

**✅ Success**: Supplier deleted, toast notification shown

---

## 🎯 Critical Tests (Priority)

### Test A: URL Independence ⚠️ CRITICAL
```bash
✅ Navigate to: /suppliers
❌ Should NOT be: /procurement/suppliers
```

**Why Critical**: User requested complete independence from procurement

---

### Test B: Component Migration ⚠️ CRITICAL
```bash
✅ SupplierList component works
✅ SupplierCard component works
✅ SupplierForm component works
```

**Why Critical**: All 3 components were migrated in Phase 2

---

### Test C: No Console Errors ⚠️ CRITICAL
```bash
1. Open DevTools (F12)
2. Navigate through all supplier pages
3. Check Console tab
✅ Expected: ZERO errors
```

**Why Critical**: Verifies all imports resolved correctly

---

### Test D: Multi-Tenancy ⚠️ CRITICAL
```bash
1. Create supplier as SPPG A
2. Login as SPPG B
3. Try to access SPPG A's supplier
✅ Expected: Access denied / Cannot see
```

**Why Critical**: Security requirement for SaaS platform

---

## 🔍 What to Look For

### ✅ Good Signs
- Page loads instantly
- No error messages in console
- All buttons work on first click
- Forms validate properly
- Data persists after page refresh
- Toast notifications appear on actions

### ❌ Warning Signs
- 404 errors in console
- Import errors about @/features/sppg/procurement
- Blank pages or missing components
- Actions that don't trigger anything
- Data that doesn't persist
- URL still contains /procurement/

---

## 🐛 Common Issues & Fixes

### Issue 1: Page Shows 404
**Symptom**: /suppliers shows "Not Found"  
**Fix**: Check `src/app/(sppg)/suppliers/page.tsx` exists  
**Command**: `ls -la src/app/(sppg)/suppliers/`

---

### Issue 2: Component Not Rendering
**Symptom**: Blank page, console shows import error  
**Fix**: Check import paths use absolute paths  
**Check**: Imports should be `@/features/sppg/suppliers/components`

---

### Issue 3: TypeScript Errors
**Symptom**: Red squiggly lines, type errors  
**Fix**: Run TypeScript check  
**Command**: `npx tsc --noEmit`

---

### Issue 4: API Errors
**Symptom**: Network errors, 500 responses  
**Fix**: Check API endpoint exists  
**Check**: `src/app/api/sppg/suppliers/route.ts` exists

---

## 📊 Testing Progress Tracker

### Phase 3 Progress
```
[ ] Navigation Tests (5 mins)
[ ] List Display Tests (10 mins)
[ ] CRUD Operations Tests (15 mins)
[ ] UI Component Tests (10 mins)
[ ] Error Handling Tests (10 mins)
[ ] Performance Tests (5 mins)
[ ] Integration Tests (10 mins)

Total Estimated Time: ~65 minutes
```

---

## 🎬 Testing Video Script

If recording testing session:

```
[00:00] Introduction
- Show project structure
- Explain supplier independence

[02:00] Navigation Test
- Open /suppliers URL
- Show sidebar navigation
- Verify URL is clean

[04:00] List Functionality
- Show data table
- Demo filters in action
- Test search and sort

[08:00] CRUD Operations
- Create new supplier
- View supplier details
- Edit supplier data
- Delete supplier

[15:00] Verification
- Show console (no errors)
- Show network tab (all 200s)
- Show TypeScript compilation

[18:00] Conclusion
- Summarize test results
- Show checklist completion
```

---

## 📞 Need Help?

### If Testing Fails
1. Check full checklist: `SUPPLIER_TESTING_CHECKLIST.md`
2. Review migration docs: `SUPPLIER_COMPONENT_MIGRATION_COMPLETE.md`
3. Check TypeScript: `npx tsc --noEmit`
4. Check dev server logs in terminal

### If Everything Passes
1. ✅ Mark tests complete in checklist
2. ✅ Update TODO list
3. 🎉 Celebrate! Supplier module is production-ready
4. 🚀 Move to next module: Inventory Management

---

## 🎯 Success Criteria

**Module is Production Ready when:**
```
✅ All 40 test scenarios pass
✅ TypeScript compilation: 0 errors
✅ Console errors: 0
✅ Network errors: 0
✅ Performance: < 3s load time
✅ Security: Multi-tenancy verified
✅ UI: Responsive on all devices
✅ Accessibility: All components usable
```

---

**Ready to Start?**  
👉 Open browser to http://localhost:3000/suppliers  
📋 Follow this guide step by step  
✅ Check off each test as you go  

**Good luck with testing! 🚀**
