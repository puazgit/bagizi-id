# Troubleshooting: Approval Error - "Failed to approve plan"

**Date**: October 16, 2025  
**Error**: "Gagal menyetujui rencana menu / Failed to approve plan"  
**Status**: 🔍 **INVESTIGATING**

---

## 🐛 Error Details

**Error Message**:
```
Gagal menyetujui rencana menu
Failed to approve plan
```

**When**: Clicking "Approve Plan" button in MenuPlanDetail

**User**: `kepala@sppg-purwakarta.com` (SPPG_KEPALA role)

---

## ✅ Verification Checklist

### 1. Database Schema ✅
- [x] Field `approvedBy` exists in MenuPlan model
- [x] Field `approvedAt` exists in MenuPlan model
- [x] Relation `approver` exists (MenuPlanApprover)
- [x] Migration status: **Up to date**

### 2. API Endpoint ✅
- [x] File exists: `/api/sppg/menu-planning/[id]/approve/route.ts`
- [x] RBAC check: Only SPPG_KEPALA and SPPG_ADMIN allowed
- [x] Status check: Only PENDING_REVIEW can be approved
- [x] Error handling: Added detailed logging

### 3. Frontend RBAC ✅
- [x] Status check fixed: `PENDING_REVIEW` (not `PENDING_APPROVAL`)
- [x] Role check: `canApproveReject` implemented
- [x] Button visibility: Only KEPALA/ADMIN see approve buttons

### 4. API Client ✅
- [x] Method exists: `approvePlan(planId, data)`
- [x] Error handling: Added console logging
- [x] Request format: JSON with `approvalNotes`

---

## 🔍 Debug Steps Added

### Backend Logging (API Endpoint)
**File**: `src/app/api/sppg/menu-planning/[id]/approve/route.ts`

```typescript
// Added detailed logging
console.log('Approve request - planId:', planId)
console.log('Approve request - body:', body)
console.log('Approve request - user:', session.user.id, session.user.userRole)

// Added error details in development
return Response.json({
  success: false,
  error: 'Failed to approve plan',
  details: process.env.NODE_ENV === 'development' && error instanceof Error 
    ? error.message 
    : undefined
}, { status: 500 })
```

### Frontend Logging (API Client)
**File**: `src/features/sppg/menu-planning/api/index.ts`

```typescript
if (!response.ok) {
  const error = await response.json()
  console.error('Approve plan API error:', error)
  throw new Error(error.details || error.error || 'Failed to approve menu plan')
}
```

---

## 🧪 Manual Testing Steps

### Step 1: Check Plan Status
```sql
-- Run in database client (psql, pgAdmin, etc.)
SELECT 
  id, 
  name, 
  status, 
  created_by, 
  approved_by, 
  submitted_by,
  submitted_at
FROM menu_plans 
WHERE sppg_id = (SELECT id FROM sppgs WHERE code = 'SPPG-PWK-001')
ORDER BY created_at DESC 
LIMIT 5;
```

**Expected**:
- Status should be `PENDING_REVIEW` (not DRAFT, not APPROVED)
- `submitted_by` should have user ID
- `submitted_at` should have timestamp
- `approved_by` should be NULL

### Step 2: Check User Session
```typescript
// Add to browser console on MenuPlanDetail page
fetch('/api/auth/session')
  .then(r => r.json())
  .then(session => console.log('Session:', session))
```

**Expected**:
```json
{
  "user": {
    "id": "user-id",
    "email": "kepala@sppg-purwakarta.com",
    "userRole": "SPPG_KEPALA",
    "sppgId": "sppg-id"
  }
}
```

### Step 3: Test API Directly
```typescript
// Run in browser console on MenuPlanDetail page
const planId = 'YOUR_PLAN_ID_HERE' // Get from URL or page

fetch(`/api/sppg/menu-planning/${planId}/approve`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    approvalNotes: 'Test approval'
  })
})
  .then(async r => {
    const data = await r.json()
    console.log('Response status:', r.status)
    console.log('Response data:', data)
    return data
  })
  .catch(err => console.error('Error:', err))
```

**Expected Success (200)**:
```json
{
  "success": true,
  "message": "Plan approved successfully",
  "data": {
    "id": "plan-id",
    "status": "APPROVED",
    "approvedBy": "user-id",
    "approvedAt": "2025-10-16T..."
  }
}
```

**Possible Errors**:

1. **401 Unauthorized**:
   ```json
   { "error": "Unauthorized" }
   ```
   → Not logged in. Refresh page and login again.

2. **403 Forbidden (Role)**:
   ```json
   { 
     "success": false,
     "error": "Insufficient permissions. Only SPPG Kepala or Admin can approve plans."
   }
   ```
   → User role is not KEPALA or ADMIN. Check session.

3. **403 Forbidden (SPPG)**:
   ```json
   { "error": "SPPG access required" }
   ```
   → User has no sppgId. Check user record in database.

4. **404 Not Found**:
   ```json
   { "success": false, "error": "Plan not found" }
   ```
   → Plan doesn't exist or belongs to different SPPG.

5. **400 Bad Request (Status)**:
   ```json
   { 
     "success": false,
     "error": "Cannot approve plan with status DRAFT. Only PENDING_REVIEW plans can be approved."
   }
   ```
   → Plan status is not PENDING_REVIEW. Submit plan first.

6. **500 Internal Server Error**:
   ```json
   { 
     "success": false, 
     "error": "Failed to approve plan",
     "details": "Detailed error message here"
   }
   ```
   → Server error. Check server logs for details.

---

## 📊 Server Logs to Check

After clicking "Approve Plan", check terminal/server logs for:

```
Approve request - planId: clxx...
Approve request - body: { approvalNotes: '...' }
Approve request - user: user-id SPPG_KEPALA
```

If error occurs, you should see:
```
Approve plan error: Error: ...
Error message: ...
Error stack: ...
```

---

## 🔧 Common Issues & Solutions

### Issue 1: Plan Status Not PENDING_REVIEW
**Symptom**: Error "Cannot approve plan with status DRAFT"

**Solution**:
1. Go to plan detail page
2. Click "..." menu
3. Click "Submit for Review" first
4. Then try approve again

### Issue 2: User Not Authorized
**Symptom**: Error "Insufficient permissions"

**Solution**:
1. Check user role: Must be SPPG_KEPALA or SPPG_ADMIN
2. If role is correct but still error:
   ```sql
   -- Check user role in database
   SELECT email, user_role, sppg_id FROM users 
   WHERE email = 'kepala@sppg-purwakarta.com';
   ```
3. Logout and login again to refresh session

### Issue 3: Database Field Missing
**Symptom**: Database error about missing column

**Solution**:
```bash
# Run migration
cd /Users/yasunstudio/Development/bagizi-id
npx prisma migrate dev

# Or reset database
npx prisma migrate reset --force
npm run db:seed
```

### Issue 4: Prisma Client Out of Sync
**Symptom**: TypeScript errors or "Unknown field" errors

**Solution**:
```bash
# Regenerate Prisma Client
npx prisma generate

# Restart dev server
# Press Ctrl+C in terminal, then:
npm run dev
```

### Issue 5: Session Expired
**Symptom**: 401 Unauthorized suddenly

**Solution**:
1. Refresh browser page
2. If still error, logout and login again
3. Clear browser cookies for localhost:3000

---

## 🔍 Next Steps

1. **Try to reproduce error** with manual test (Step 3 above)
2. **Check server logs** in terminal where `npm run dev` is running
3. **Check browser console** for client-side errors
4. **Verify plan status** is PENDING_REVIEW before approve
5. **Verify user session** has correct role and sppgId

---

## 📝 Report Format

When reporting error, please include:

1. **Plan ID**: (from URL or database)
2. **User Email**: kepala@sppg-purwakarta.com
3. **Plan Status**: (from database or UI)
4. **Browser Console Errors**: (screenshot or copy-paste)
5. **Server Logs**: (from terminal, look for "Approve request" or "Approve plan error")
6. **Response Status**: (from network tab, e.g., 500, 403, 400)
7. **Response Body**: (from network tab)

---

## 🎯 Quick Check Commands

```bash
# Check if server is running
curl http://localhost:3000/api/auth/session

# Check database connection
npx prisma db pull --print

# Check migration status
npx prisma migrate status

# View recent logs (if using PM2 or similar)
tail -f logs/app.log

# Check for TypeScript errors
npm run type-check
```

---

**Status**: Waiting for detailed error information from logs  
**Next Action**: Try manual API test (Step 3) and report back with:
- Response status code
- Response body
- Server logs
- Browser console errors
