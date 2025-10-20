# 🔧 Troubleshooting: Inventory Permission Issues

**Status**: 🔍 **DEBUGGING**  
**Date**: October 20, 2025  
**Issue**: "Gagal Memuat Data" - Permission or authentication error  
**Location**: `/inventory` page

---

## 🐛 Problem Description

### Symptoms
```
❌ Error Message: "Gagal Memuat Data"
❌ API Response: 403 Forbidden atau 401 Unauthorized
❌ Page Status: Shows error, no inventory list
```

### Possible Causes
1. **No Authentication** - User not logged in
2. **Missing Permission** - User role doesn't have `INVENTORY_VIEW` permission
3. **No SPPG Assignment** - User doesn't have `sppgId`
4. **Wrong Role** - User has role without inventory access

---

## 🔍 Debugging Steps Added

### Added Console Logging

File: `src/app/api/sppg/inventory/route.ts`

```typescript
// 1. Authentication Check with Logging
console.log('🔐 [Inventory API] Auth Check:', {
  hasSession: !!session,
  hasUser: !!session?.user,
  userId: session?.user?.id,
  userRole: session?.user?.userRole,
  sppgId: session?.user?.sppgId,
})

// 2. Permission Check with Logging
console.log('🔑 [Inventory API] Permission Check:', {
  userRole: session.user.userRole,
  hasInventoryPermission
})

// 3. Success Logging
console.log('✅ [Inventory API] All checks passed, fetching data...')
```

---

## 📋 How to Debug

### Step 1: Check Server Console

Open terminal where Next.js is running and look for logs:

```bash
# You should see these logs when accessing /inventory:
🔐 [Inventory API] Auth Check: {
  hasSession: true,
  hasUser: true,
  userId: 'clxx...',
  userRole: 'SPPG_ADMIN',
  sppgId: 'clxx...'
}

🔑 [Inventory API] Permission Check: {
  userRole: 'SPPG_ADMIN',
  hasInventoryPermission: true
}

✅ [Inventory API] All checks passed, fetching data...
```

### Step 2: Check Browser Console

Open browser DevTools (F12) and check:

1. **Network Tab**
   ```
   GET /api/sppg/inventory
   Status: 200 OK  ✅ Good
   Status: 401     ❌ Not authenticated
   Status: 403     ❌ No permission or no SPPG
   Status: 400     ❌ Invalid filters (fixed earlier)
   ```

2. **Console Tab**
   ```
   Look for any client-side errors
   Check TanStack Query errors
   ```

---

## ✅ Permission Configuration

### Current Permission Setup

File: `src/lib/permissions.ts`

```typescript
// Roles with INVENTORY_VIEW permission:
SPPG_KEPALA: [
  'INVENTORY_VIEW',        // ✅ Can view
  'INVENTORY_MANAGE',      // ✅ Can create/edit
  'INVENTORY_APPROVE',     // ✅ Can approve movements
]

SPPG_ADMIN: [
  'INVENTORY_VIEW',        // ✅ Can view
  'INVENTORY_MANAGE',      // ✅ Can create/edit
]

SPPG_AHLI_GIZI: [
  'INVENTORY_VIEW',        // ✅ Can view only
]

SPPG_AKUNTAN: [
  'INVENTORY_VIEW',        // ✅ Can view
  'INVENTORY_MANAGE',      // ✅ Can manage (for procurement)
]

SPPG_PRODUKSI_MANAGER: [
  'INVENTORY_VIEW',        // ✅ Can view
  'INVENTORY_MANAGE',      // ✅ Can manage stock
]

SPPG_DISTRIBUSI_MANAGER: [
  'INVENTORY_VIEW',        // ✅ Can view only
]

// Roles WITHOUT inventory access:
SPPG_STAFF_DAPUR: []       // ❌ No access
SPPG_STAFF_DISTRIBUSI: []  // ❌ No access
SPPG_STAFF_ADMIN: []       // ❌ No access
SPPG_STAFF_QC: []          // ❌ No access
SPPG_VIEWER: ['READ']      // ❌ Only general read
DEMO_USER: ['READ']        // ❌ Only general read
```

---

## 🔧 Common Fixes

### Fix 1: User Not Assigned to SPPG

**Problem**: `session.user.sppgId` is `null`

**Solution**: Assign user to SPPG in database

```sql
-- Check user's SPPG assignment
SELECT id, email, "sppgId", "userRole" FROM "User" WHERE email = 'user@example.com';

-- Assign user to SPPG
UPDATE "User" 
SET "sppgId" = 'clxx-sppg-id-here'
WHERE email = 'user@example.com';
```

---

### Fix 2: User Has Wrong Role

**Problem**: User role doesn't have `INVENTORY_VIEW` permission

**Solution**: Update user role to appropriate role

```sql
-- Check current role
SELECT email, "userRole" FROM "User" WHERE email = 'user@example.com';

-- Update to role with inventory access
UPDATE "User" 
SET "userRole" = 'SPPG_ADMIN'  -- or 'SPPG_KEPALA', 'SPPG_PRODUKSI_MANAGER', etc.
WHERE email = 'user@example.com';
```

**Available Roles with Inventory Access**:
- `SPPG_KEPALA` - Full access
- `SPPG_ADMIN` - Manage access
- `SPPG_AHLI_GIZI` - View only
- `SPPG_AKUNTAN` - Manage access
- `SPPG_PRODUKSI_MANAGER` - Manage access
- `SPPG_DISTRIBUSI_MANAGER` - View only

---

### Fix 3: Session Not Refreshed

**Problem**: User updated but session still has old data

**Solution**: Logout and login again

```typescript
// In browser console or UI:
1. Click "Logout" button
2. Login again
3. Session will refresh with new role/sppgId
```

---

### Fix 4: Add Inventory Access to Existing Role

**Problem**: Need to give inventory access to role that doesn't have it

**Solution**: Update `src/lib/permissions.ts`

```typescript
// Before
SPPG_STAFF_ADMIN: ['READ', 'WRITE'],

// After (add inventory permissions)
SPPG_STAFF_ADMIN: [
  'READ', 
  'WRITE',
  'INVENTORY_VIEW',      // ✅ Added
  'INVENTORY_MANAGE',    // ✅ Added (optional)
],
```

---

## 🧪 Testing Checklist

### Manual Testing Steps

1. **Test Authentication**
   ```bash
   ✅ Access /inventory when NOT logged in
   Expected: Redirect to /login
   
   ✅ Login with valid credentials
   Expected: Can access dashboard
   ```

2. **Test with SPPG_ADMIN Role**
   ```bash
   ✅ Login as SPPG_ADMIN
   ✅ Navigate to /inventory
   Expected: Page loads, shows inventory list (or empty state)
   
   Server Console Should Show:
   🔐 Auth Check: { userRole: 'SPPG_ADMIN', sppgId: 'clxx...' }
   🔑 Permission Check: { hasInventoryPermission: true }
   ✅ All checks passed
   ```

3. **Test with Role WITHOUT Permission**
   ```bash
   ✅ Login as SPPG_VIEWER
   ✅ Navigate to /inventory
   Expected: "Insufficient permissions" error
   
   Server Console Should Show:
   🔐 Auth Check: { userRole: 'SPPG_VIEWER' }
   🔑 Permission Check: { hasInventoryPermission: false }
   ❌ Insufficient permissions
   ```

4. **Test with No SPPG Assignment**
   ```bash
   ✅ Login as user with sppgId = null
   ✅ Navigate to /inventory
   Expected: "SPPG access required" error
   
   Server Console Should Show:
   🔐 Auth Check: { sppgId: null }
   ❌ No SPPG ID
   ```

---

## 📊 Quick Diagnosis

### Check Your Current User Status

Add this to any page to see current session:

```typescript
'use client'

import { useAuth } from '@/hooks/use-auth'

export function DebugAuth() {
  const { user } = useAuth()
  
  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs max-w-sm">
      <h3 className="font-bold mb-2">🔍 Debug: Current User</h3>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  )
}
```

Expected Output:
```json
{
  "id": "clxx...",
  "email": "admin@sppg.id",
  "name": "Admin SPPG",
  "userRole": "SPPG_ADMIN",
  "userType": "SPPG_USER",
  "sppgId": "clxx-sppg-id",
  "sppgName": "SPPG Purwakarta"
}
```

---

## 🎯 Expected vs Actual

### Scenario 1: Successful Access ✅

**User Profile**:
- Role: `SPPG_ADMIN`
- sppgId: `clxx...` (not null)
- Permission: `INVENTORY_VIEW` ✅

**Expected Behavior**:
```
1. Auth Check: ✅ PASS (authenticated)
2. Permission Check: ✅ PASS (has INVENTORY_VIEW)
3. SPPG Check: ✅ PASS (has sppgId)
4. API Response: 200 OK
5. Page Display: Shows inventory list or empty state
```

---

### Scenario 2: No Permission ❌

**User Profile**:
- Role: `SPPG_VIEWER`
- sppgId: `clxx...`
- Permission: `READ` only (no `INVENTORY_VIEW`)

**Expected Behavior**:
```
1. Auth Check: ✅ PASS
2. Permission Check: ❌ FAIL
3. API Response: 403 Forbidden
4. Error Message: "Anda tidak memiliki akses untuk melihat inventori"
```

**Fix**: Change role to `SPPG_ADMIN` or higher

---

### Scenario 3: No SPPG Assignment ❌

**User Profile**:
- Role: `SPPG_ADMIN`
- sppgId: `null` ❌
- Permission: Has `INVENTORY_VIEW` but no SPPG

**Expected Behavior**:
```
1. Auth Check: ✅ PASS
2. Permission Check: ✅ PASS
3. SPPG Check: ❌ FAIL (sppgId is null)
4. API Response: 403 Forbidden
5. Error Message: "Akses SPPG diperlukan"
```

**Fix**: Assign user to SPPG in database

---

## 🚀 Next Steps

### For Users
1. Check browser console for client errors
2. Check network tab for API response
3. Copy error details and report to admin

### For Developers
1. Check server console for detailed logs
2. Verify user's role and sppgId in database
3. Update permissions if needed
4. Test with different roles

### For Admins
1. Verify SPPG exists and is active
2. Assign users to correct SPPG
3. Assign appropriate roles with inventory access
4. Test end-to-end flow

---

## 📝 Remove Debug Logs (Production)

After debugging, remove console.log statements:

```typescript
// Remove these lines before production:
console.log('🔐 [Inventory API] Auth Check:', ...)
console.log('🔑 [Inventory API] Permission Check:', ...)
console.log('✅ [Inventory API] All checks passed...')
console.error('❌ [Inventory API] ...')
```

Or use conditional logging:

```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('[Debug] ...', data)
}
```

---

**Status**: 🔍 **DEBUGGING IN PROGRESS**

**Instructions**: 
1. Access `/inventory` page
2. Check server console for logs
3. Check browser console/network for errors
4. Report findings with log output

**Expected**: Console logs will show exact failure point (auth, permission, or SPPG)
