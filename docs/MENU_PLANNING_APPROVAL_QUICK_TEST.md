# 🚀 Quick Testing Guide - Menu Planning Approval

## 🔐 Test Credentials

### Kepala SPPG (Full Permissions) ✅
```
Email: kepala@sppg-purwakarta.com
Password: password123
Can: Approve, Reject, Publish plans
```

### Admin SPPG (Full Permissions) ✅
```
Email: admin@sppg-purwakarta.com
Password: password123
Can: Approve, Reject, Publish plans
```

### Ahli Gizi (Limited Permissions) 🚫
```
Email: gizi@sppg-purwakarta.com
Password: password123
Can: View, Create, Submit plans
Cannot: Approve, Reject, Publish (buttons hidden)
```

---

## ✅ Testing Steps

### Test 1: Create & Submit Plan (Any User)
1. Login as: `gizi@sppg-purwakarta.com`
2. Go to: `/menu-planning`
3. Click: "Create New Plan"
4. Fill form and save
5. Open plan detail
6. Click "..." menu → "Submit for Review"
7. **Expected**: Status changes to "PENDING_REVIEW" ✅

### Test 2: Approve Plan (KEPALA Only) ✅
1. **Logout and login as**: `kepala@sppg-purwakarta.com`
2. Go to: `/menu-planning`
3. Open plan with "PENDING_REVIEW" status
4. Click "..." menu
5. **Expected**: See "Approve Plan" and "Reject Plan" options ✅
6. Click "Approve Plan"
7. Enter approval notes
8. Click "Approve"
9. **Expected**: Status changes to "APPROVED" ✅

### Test 3: Publish Plan (KEPALA Only) ✅
1. Still as: `kepala@sppg-purwakarta.com`
2. Open plan with "APPROVED" status
3. Click "..." menu
4. **Expected**: See "Publish Plan" option ✅
5. Click "Publish Plan"
6. Enter publish notes
7. Click "Publish"
8. **Expected**: Status changes to "ACTIVE" ✅

### Test 4: Verify RBAC (Ahli Gizi) 🚫
1. **Logout and login as**: `gizi@sppg-purwakarta.com`
2. Go to: `/menu-planning`
3. Open plan with "PENDING_REVIEW" status
4. Click "..." menu
5. **Expected**: Do NOT see "Approve Plan" or "Reject Plan" 🚫
6. **Expected**: Only see "Submit for Review" (for DRAFT plans) ✅

---

## 🐛 What Was Fixed?

### Before ❌
- Status check: `PENDING_APPROVAL` (wrong!)
- All users could see approve/reject buttons
- Clicking buttons resulted in 403 Forbidden error
- Confusing UX

### After ✅
- Status check: `PENDING_REVIEW` (correct!)
- Only KEPALA and ADMIN see approve/reject/publish buttons
- Other roles cannot see these buttons
- Clear role separation

---

## 📊 Status Flow

```
DRAFT (Create)
  ↓ Submit (Any User)
PENDING_REVIEW
  ↓ Approve (KEPALA/ADMIN Only) ✅
APPROVED
  ↓ Publish (KEPALA/ADMIN Only) ✅
ACTIVE
```

**Alternative**: Reject returns to DRAFT
```
PENDING_REVIEW
  ↓ Reject (KEPALA/ADMIN Only)
DRAFT (Back to creator for revision)
```

---

## ⚠️ Important Notes

1. **Must be logged in** as KEPALA or ADMIN to see approval buttons
2. **Refresh page** after login to see latest session data
3. **Status must be correct** for buttons to appear:
   - DRAFT → Show "Submit for Review"
   - PENDING_REVIEW → Show "Approve" & "Reject" (KEPALA/ADMIN only)
   - APPROVED → Show "Publish" (KEPALA/ADMIN only)
4. **Backend security** still enforces RBAC (403 if unauthorized)

---

## 🎯 Quick Verification

**Login as KEPALA** → See all workflow buttons ✅  
**Login as AHLI_GIZI** → Only see Submit button 🚫 (for DRAFT plans)  
**Status correct** → PENDING_REVIEW (not PENDING_APPROVAL) ✅  
**No TypeScript errors** → 0 errors ✅

---

**Fix Applied**: October 16, 2025  
**Status**: ✅ Production Ready  
**Documentation**: See `MENU_PLANNING_APPROVAL_FIX.md` for details
