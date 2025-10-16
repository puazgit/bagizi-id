# 🧪 Menu Planning - Integration Testing Guide

**Domain**: Menu Planning  
**Status**: Ready for Testing  
**Date**: October 15, 2025

---

## 🎯 Testing Objectives

Verify that the complete Menu Planning module works correctly with:
- ✅ All CRUD operations functional
- ✅ Status workflow transitions smooth
- ✅ Multi-tenant isolation secure
- ✅ Permission-based access correct
- ✅ UI/UX intuitive and responsive
- ✅ Analytics calculations accurate
- ✅ Calendar visualization clear

---

## 🚀 Pre-Testing Setup

### **1. Start Development Server**

```bash
# Terminal 1: Start database (if not running)
make docker-up

# Terminal 2: Start Next.js dev server
npm run dev
```

**Expected**: Server running at http://localhost:3000

### **2. Login Credentials**

Use test accounts from seed data:

```typescript
// SPPG Kepala (Full Access)
Email: kepala@sppg-jakarta.test
Password: password123

// SPPG Admin (Full Access)
Email: admin@sppg-jakarta.test
Password: password123

// SPPG Ahli Gizi (Create/Edit Access)
Email: ahli.gizi@sppg-jakarta.test
Password: password123

// SPPG Staff (Read-Only)
Email: staff@sppg-jakarta.test
Password: password123
```

### **3. Database State**

Ensure you have:
- ✅ Active SPPG account
- ✅ At least 1 Nutrition Program
- ✅ At least 5-10 Menu items
- ✅ User accounts with different roles

**Reset Database** (if needed):
```bash
make db-reset
```

---

## 📋 Test Scenarios

### **Test 1: Navigation & Access** ⭐ CRITICAL

**Steps**:
1. Login as `kepala@sppg-jakarta.test`
2. Look for "Menu Planning" in sidebar (Operations section)
3. Click "Menu Planning"

**Expected Results**:
- ✅ Menu item visible in sidebar with Calendar icon
- ✅ Navigates to `/menu-planning`
- ✅ Page loads without errors
- ✅ Breadcrumb shows: Dashboard > Menu Planning

**Test Different Roles**:
| Role | Should See Menu? | Access Level |
|------|------------------|--------------|
| SPPG_KEPALA | ✅ Yes | Full Access |
| SPPG_ADMIN | ✅ Yes | Full Access |
| SPPG_AHLI_GIZI | ✅ Yes | Create/Edit |
| SPPG_STAFF | ❌ No | None |
| SPPG_USER | ❌ No | None |

---

### **Test 2: View Menu Plan List** ⭐ IMPORTANT

**Steps**:
1. Navigate to `/menu-planning`
2. Observe the list page

**Expected Results**:
- ✅ Summary statistics cards appear (4 cards)
  - Total Plans
  - Active Plans
  - Plans by Status
  - Avg Beneficiaries
- ✅ Filter section visible (Status, Date Range, Search)
- ✅ "Create New Plan" button visible
- ✅ Empty state shown if no plans exist
- ✅ Loading skeletons appear briefly

**Visual Checks**:
- ✅ Dark mode works (toggle theme)
- ✅ Responsive layout (resize browser)
- ✅ No console errors

---

### **Test 3: Create New Menu Plan** ⭐ CRITICAL

**Steps**:
1. Click "Create New Plan" button
2. Fill out the form:
   - Plan Name: "Rencana Menu Oktober 2025"
   - Start Date: October 16, 2025
   - End Date: October 31, 2025
   - Select Program: (choose from dropdown)
   - Target Beneficiaries: 150
   - Description: "Menu untuk periode Oktober"
3. Click "Create Menu Plan"

**Expected Results**:
- ✅ Form validation works (try submitting empty)
- ✅ Date picker shows Indonesian locale
- ✅ Program dropdown loads options
- ✅ Loading spinner appears on submit
- ✅ Success toast notification shown
- ✅ Redirects to detail page `/menu-planning/[id]`
- ✅ New plan appears in list with DRAFT status

**Validation Tests**:
- ❌ Empty plan name → Error message
- ❌ End date before start date → Error message
- ❌ Negative beneficiaries → Error message
- ❌ Missing program → Error message

---

### **Test 4: View Plan Detail** ⭐ CRITICAL

**Steps**:
1. Click on a created plan card
2. Navigate through all tabs

**Expected Results**:

**Overview Tab**:
- ✅ Plan information displayed correctly
- ✅ Status badge shows DRAFT
- ✅ Metrics cards show:
  - Total Days
  - Assigned Days
  - Coverage %
  - Avg Cost
- ✅ Action toolbar visible with:
  - Edit button
  - Delete button
  - Submit for Review button

**Assignments Tab**:
- ✅ Empty state shown (no assignments yet)
- ✅ "Add Assignment" button visible
- ✅ Table headers correct (Date, Meal Type, Menu, Actions)

**Calendar Tab**:
- ✅ Calendar grid displays current month
- ✅ Date range highlighted
- ✅ Navigation buttons work (prev/next month)
- ✅ Today indicator visible
- ✅ Empty days show "No assignments"

**Analytics Tab**:
- ✅ "No data available" message shown
- ✅ Key metrics cards visible (grayed out)
- ✅ Export dropdown visible (disabled)

---

### **Test 5: Add Daily Menu Assignment** ⭐ CRITICAL

**Steps**:
1. Go to Assignments tab
2. Click "Add Assignment" button
3. Fill assignment form:
   - Date: October 16, 2025
   - Meal Type: SARAPAN
   - Select Menu: (choose from dropdown)
   - Servings: 150
4. Click "Save Assignment"

**Expected Results**:
- ✅ Modal/dialog opens for form
- ✅ Date picker defaults to plan date range
- ✅ Meal type dropdown has 5 options:
  - SARAPAN (Breakfast)
  - SNACK_PAGI (Morning Snack)
  - MAKAN_SIANG (Lunch)
  - SNACK_SORE (Afternoon Snack)
  - MAKAN_MALAM (Dinner)
- ✅ Menu dropdown loads available menus
- ✅ Servings pre-filled with target beneficiaries
- ✅ Success toast notification
- ✅ Table updates with new assignment
- ✅ Calendar shows colored indicator

**Add Multiple Assignments**:
- Add MAKAN_SIANG for same date
- Add assignments for different dates
- Verify all appear in table and calendar

---

### **Test 6: Calendar Visualization** ⭐ IMPORTANT

**Steps**:
1. Go to Calendar tab
2. Add assignments for multiple dates and meal types
3. Interact with calendar

**Expected Results**:
- ✅ Assignments appear as colored cards on dates
- ✅ Color coding matches meal types:
  - SARAPAN: Cyan
  - SNACK_PAGI: Amber
  - MAKAN_SIANG: Emerald
  - SNACK_SORE: Blue
  - MAKAN_MALAM: Violet
- ✅ Multiple assignments stack vertically
- ✅ Hover shows menu name
- ✅ Click assignment opens edit form
- ✅ Statistics update correctly:
  - Coverage percentage increases
  - Assigned days count
  - Total assignments count

**Test Filters**:
- Filter by SARAPAN only → Only cyan cards visible
- Filter by MAKAN_SIANG → Only green cards visible
- Filter "All" → All assignments visible

**Test Navigation**:
- Click "Previous Month" → Calendar shows October 2024
- Click "Next Month" → Back to October 2025
- Click "Today" → Current month displayed

---

### **Test 7: Edit & Delete Assignment** ⭐ IMPORTANT

**Steps**:
1. In Assignments tab, click Edit on an assignment
2. Change meal type to MAKAN_SIANG
3. Save changes
4. Delete an assignment

**Expected Results**:
- ✅ Edit form pre-fills with existing data
- ✅ Can modify any field
- ✅ Save updates both table and calendar
- ✅ Delete confirmation dialog appears
- ✅ Delete removes from table and calendar
- ✅ Statistics recalculate

---

### **Test 8: Status Workflow** ⭐ CRITICAL

**Steps**:
1. In Overview tab, click "Submit for Review"
2. Confirm submission

**Expected Results**:
- ✅ Status changes to PENDING_REVIEW
- ✅ Status badge updates color
- ✅ "Submit for Review" button disappears
- ✅ "Approve" and "Reject" buttons appear (if KEPALA/ADMIN)
- ✅ Toast notification shown
- ✅ Workflow timeline updates

**Test Approval**:
1. Click "Approve" button
2. Add optional approval note
3. Confirm approval

**Expected**:
- ✅ Status → APPROVED
- ✅ "Publish" button appears
- ✅ approvedAt timestamp set
- ✅ approvedBy shows current user

**Test Publish**:
1. Click "Publish" button
2. Confirm

**Expected**:
- ✅ Status → PUBLISHED
- ✅ publishedAt timestamp set
- ✅ "Activate" button appears

**Test Activate**:
1. Click "Activate" button
2. Confirm

**Expected**:
- ✅ Status → ACTIVE
- ✅ isActive flag set to true
- ✅ Badge shows "Active" in green

**Test Rejection** (create new plan):
1. Create new plan, submit for review
2. Click "Reject" button
3. Enter rejection reason (required)
4. Confirm

**Expected**:
- ✅ Status → DRAFT (or REJECTED if you add that status)
- ✅ Rejection reason saved
- ✅ Can resubmit after fixing issues

---

### **Test 9: Analytics Dashboard** ⭐ IMPORTANT

**Prerequisites**: Plan must have multiple assignments across several days

**Steps**:
1. Go to Analytics tab
2. Review all 4 tabs

**Expected Results**:

**Key Metrics Cards**:
- ✅ Total Cost: Shows sum in IDR format
- ✅ Avg Daily Cost: Shows average per day
- ✅ Compliance Rate: Shows percentage (0-100%)
- ✅ Avg Calories: Shows average calories

**Nutrition Tab**:
- ✅ Bar chart displays nutrition by meal type
- ✅ 3 bars per meal type (Calories, Protein, Carbs)
- ✅ Line chart shows daily nutrition trend
- ✅ X-axis shows dates
- ✅ Y-axis shows values
- ✅ Hover tooltip shows exact values
- ✅ Legend shows line meanings
- ✅ Charts responsive to window resize

**Cost Tab**:
- ✅ Pie chart shows cost distribution
- ✅ Colors match meal types
- ✅ Percentages shown in legend
- ✅ Cost breakdown cards show:
  - Meal type with color indicator
  - Total cost
  - Meal count
  - Average per meal
- ✅ Line chart shows cost trend over days

**Variety Tab**:
- ✅ Unique Menus metric accurate
- ✅ Variety Score percentage shown
- ✅ Badge indicates quality (≥70% = Sangat Baik)
- ✅ Ingredient Diversity percentage
- ✅ Recommendations list displayed

**Compliance Tab**:
- ✅ Daily compliance cards show dates
- ✅ Pass/Fail badges correct
- ✅ Meal types covered count
- ✅ Protein sufficiency indicator

**Export Functionality**:
1. Click Export dropdown
2. Select PDF format
3. Observe loading state

**Expected**:
- ✅ Dropdown has 3 options (PDF, CSV, Excel)
- ✅ Button disabled during export
- ✅ Loading spinner appears
- ✅ (Implementation pending - shows toast for now)

---

### **Test 10: Edit Plan** ⭐ IMPORTANT

**Steps**:
1. From detail page, click "Edit Plan" button
2. Navigate to `/menu-planning/[id]/edit`
3. Modify plan name and description
4. Click "Update Plan"

**Expected Results**:
- ✅ Form pre-fills with existing data
- ✅ Can modify editable fields
- ✅ Cannot change start/end dates if plan is active
- ✅ Save updates plan
- ✅ Redirects back to detail page
- ✅ Changes reflected immediately

---

### **Test 11: Delete Plan** ⭐ IMPORTANT

**Steps**:
1. From detail page, click "Delete Plan" button
2. Confirm deletion in dialog

**Expected Results**:
- ✅ Confirmation dialog appears
- ✅ Warning message shown
- ✅ Delete button highlighted in red
- ✅ After confirm, redirects to list page
- ✅ Plan removed from list
- ✅ Success toast notification
- ✅ (Soft delete: record still in DB with deletedAt)

**Test Restrictions**:
- Try deleting ACTIVE plan → Should show warning or prevent
- Try deleting APPROVED plan → Should warn about consequences

---

### **Test 12: Filter & Search** ⭐ IMPORTANT

**Steps**:
1. Go to menu plans list page
2. Test each filter

**Status Filter**:
- Select "Draft" → Only DRAFT plans shown
- Select "Active" → Only ACTIVE plans shown
- Select "All" → All plans shown

**Date Range Filter**:
- Set date range Oct 1-15 → Only plans within range
- Clear filter → All plans shown

**Search**:
- Type plan name → Matching plans shown
- Type partial name → Fuzzy match works
- Clear search → All plans shown

**Combined Filters**:
- Status=Active + Date Range → Filtered correctly
- Status + Search → Both filters apply

---

### **Test 13: Multi-Tenant Isolation** ⭐⭐ CRITICAL SECURITY

**Steps**:
1. Login as user from SPPG Jakarta
2. Create a menu plan
3. Note the plan ID in URL
4. Logout
5. Login as user from different SPPG (if available in seed)
6. Try to access `/menu-planning/[jakarta-plan-id]`

**Expected Results**:
- ✅ User from different SPPG cannot see Jakarta's plan
- ✅ 404 Not Found or 403 Forbidden error
- ✅ Plan list shows only own SPPG's plans
- ✅ No data leakage in API responses

**Verify in Database** (optional):
```sql
SELECT id, name, "sppgId" FROM "MenuPlan";
```
- Each plan should have correct sppgId

---

### **Test 14: Permission-Based Access** ⭐⭐ CRITICAL SECURITY

**Test Matrix**:

| Action | KEPALA | ADMIN | AHLI_GIZI | STAFF |
|--------|--------|-------|-----------|-------|
| View Menu | ✅ | ✅ | ✅ | ❌ |
| View List | ✅ | ✅ | ✅ | ❌ |
| Create Plan | ✅ | ✅ | ✅ | ❌ |
| Edit Plan | ✅ | ✅ | ✅ | ❌ |
| Delete Plan | ✅ | ✅ | ❌ | ❌ |
| Submit | ✅ | ✅ | ✅ | ❌ |
| Approve | ✅ | ✅ | ❌ | ❌ |
| Publish | ✅ | ✅ | ❌ | ❌ |
| Activate | ✅ | ✅ | ❌ | ❌ |

**Steps**:
1. Test each role with each action
2. Verify buttons appear/disappear correctly
3. Try direct API calls (if possible)

---

### **Test 15: Responsive Design** ⭐ IMPORTANT

**Steps**:
1. Open menu planning in Chrome DevTools
2. Test different screen sizes

**Mobile (375px)**:
- ✅ Sidebar collapses to hamburger menu
- ✅ Cards stack vertically (1 column)
- ✅ Tables scroll horizontally
- ✅ Calendar shows fewer columns
- ✅ Filters collapse to accordion
- ✅ Touch targets large enough (44px min)
- ✅ Text readable without zoom

**Tablet (768px)**:
- ✅ 2-column card grid
- ✅ Sidebar visible
- ✅ Tables fit width
- ✅ Calendar shows all days

**Desktop (1024px+)**:
- ✅ 3-4 column card grid
- ✅ Full sidebar visible
- ✅ All features accessible
- ✅ Charts full width

---

### **Test 16: Dark Mode** ⭐ IMPORTANT

**Steps**:
1. Toggle theme switcher (sun/moon icon)
2. Navigate through all pages

**Expected Results**:
- ✅ All pages switch to dark theme
- ✅ Text remains readable
- ✅ Proper contrast maintained
- ✅ Charts adapt colors
- ✅ No white flashes
- ✅ Status badges use dark variants
- ✅ Forms and inputs styled correctly

---

### **Test 17: Error Handling** ⭐ IMPORTANT

**Test Scenarios**:

**1. Network Error**:
- Disconnect internet
- Try creating plan
- Expected: Error toast with retry option

**2. Validation Error**:
- Submit form with invalid data
- Expected: Field-level error messages

**3. Server Error**:
- Create plan with duplicate name (if unique constraint)
- Expected: Clear error message

**4. 404 Error**:
- Navigate to `/menu-planning/invalid-id`
- Expected: 404 page or redirect to list

**5. Permission Error**:
- Login as STAFF
- Try accessing `/menu-planning`
- Expected: 403 or redirect to dashboard

---

### **Test 18: Loading States** ⭐ NORMAL

**Steps**:
1. Observe loading states throughout app

**Expected**:
- ✅ Skeleton cards while fetching list
- ✅ Spinner on buttons during actions
- ✅ Loading overlay on form submit
- ✅ Skeleton charts while fetching analytics
- ✅ No flash of unstyled content (FOUC)

---

### **Test 19: Form Validation** ⭐ IMPORTANT

**Test Each Field**:

**Plan Name**:
- Empty → "Name is required"
- < 3 chars → "Minimum 3 characters"
- > 200 chars → "Maximum 200 characters"

**Dates**:
- End before start → "End date must be after start"
- Past date → "Start date cannot be in the past" (if enforced)

**Beneficiaries**:
- Negative → "Must be positive"
- Zero → "Must be at least 1"
- Non-numeric → Type error prevented

**Program**:
- Not selected → "Program is required"

---

### **Test 20: Browser Compatibility** ⭐ NORMAL

**Test in Multiple Browsers**:
- ✅ Chrome (Latest)
- ✅ Safari (Latest)
- ✅ Firefox (Latest)
- ✅ Edge (Latest)

**Check**:
- Layout consistent across browsers
- Charts render correctly
- Forms work properly
- No console errors

---

## 🐛 Bug Reporting Template

If you find issues during testing, document them:

```markdown
**Bug Title**: [Short description]

**Severity**: Critical / High / Medium / Low

**Steps to Reproduce**:
1. Navigate to...
2. Click on...
3. Observe...

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happens]

**Screenshots**:
[Attach if applicable]

**Environment**:
- Browser: Chrome 119
- OS: macOS 14
- Screen Size: 1920x1080

**Console Errors**:
```
[Paste any console errors]
```

**Additional Notes**:
[Any other relevant information]
```

---

## ✅ Testing Checklist Summary

### **Critical Tests** (Must Pass)
- [ ] Navigation & Access (Test 1)
- [ ] Create New Menu Plan (Test 3)
- [ ] View Plan Detail (Test 4)
- [ ] Add Daily Assignment (Test 5)
- [ ] Status Workflow (Test 8)
- [ ] Multi-Tenant Isolation (Test 13)
- [ ] Permission-Based Access (Test 14)

### **Important Tests** (Should Pass)
- [ ] View Menu Plan List (Test 2)
- [ ] Calendar Visualization (Test 6)
- [ ] Edit & Delete Assignment (Test 7)
- [ ] Analytics Dashboard (Test 9)
- [ ] Edit Plan (Test 10)
- [ ] Delete Plan (Test 11)
- [ ] Filter & Search (Test 12)
- [ ] Responsive Design (Test 15)
- [ ] Dark Mode (Test 16)
- [ ] Error Handling (Test 17)
- [ ] Form Validation (Test 19)

### **Normal Tests** (Nice to Have)
- [ ] Loading States (Test 18)
- [ ] Browser Compatibility (Test 20)

---

## 📊 Testing Progress Tracker

**Completed**: 0 / 20 tests  
**Pass Rate**: 0%  
**Critical Issues**: 0  
**High Priority Issues**: 0  
**Medium Priority Issues**: 0  
**Low Priority Issues**: 0

---

## 🚀 Next Steps After Testing

1. **Document Results**
   - Create test report with pass/fail for each scenario
   - List all bugs found with severity
   - Take screenshots of key features

2. **Fix Critical Bugs**
   - Address any security issues immediately
   - Fix data corruption risks
   - Resolve permission bypasses

3. **Implement Missing Features** (if needed)
   - Export functionality (PDF/CSV/Excel)
   - Additional validations
   - UI polish

4. **Performance Optimization** (if issues found)
   - Optimize slow queries
   - Add loading indicators
   - Implement pagination

5. **User Acceptance Testing**
   - Demo to stakeholders
   - Gather feedback
   - Iterate on UX improvements

---

## 📞 Support

**Questions or Issues?**
- Check documentation: `/docs/MENU_PLANNING_COMPLETE.md`
- Review code comments in components
- Check console for detailed error messages

**Happy Testing! 🎉**

---

**Last Updated**: October 15, 2025  
**Version**: 1.0  
**Status**: Ready for Integration Testing
