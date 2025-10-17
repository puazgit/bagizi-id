# Production Redirect Debug - Server Console Analysis

## 🎯 Current Situation

**User**: `admin@sppg-purwakarta.com`  
**Role**: `SPPG_ADMIN`  
**Issue**: Production link visible in sidebar, but redirects to dashboard when clicked  
**Status**: 🔄 DEBUG MODE ACTIVE

## 🔍 What We Know

1. ✅ Link IS visible in sidebar → `canAccess('production')` returns `true`
2. ✅ User role is `SPPG_ADMIN` (one of 6 allowed roles)
3. ❌ Clicking link redirects to `/dashboard` → Middleware is blocking

## 🛠️ Debug Changes Applied

### 1. Client-Side Debug (use-auth.ts)
Added console.log in `canAccess()` function

### 2. Server-Side Debug (middleware.ts)
Added console.log for:
- SPPG route check (sppgId, userRole, userType)
- isSppgUser check
- Production access check (pathname, userRole, hasAccess)

## 📊 Testing Steps

### Step 1: Restart Dev Server
**CRITICAL** - Old middleware won't have new logs

```bash
# Stop current server (Ctrl+C in terminal running npm run dev)
# Then restart:
npm run dev
```

### Step 2: Check Server Terminal
Look at the terminal running `npm run dev`. When you click Production link, you should see:

```javascript
// Expected logs:
[Middleware] SPPG route check: {
  pathname: '/production',
  sppgId: 'clxxx...',  // Should have value
  userRole: 'SPPG_ADMIN',  // Should be SPPG_ADMIN
  userType: 'SPPG_ADMIN',  // Should be SPPG_ADMIN
  email: 'admin@sppg-purwakarta.com'
}

[Middleware] SPPG user check: { isSppgUser: true }  // Should be true

[Middleware] Production access check: {
  pathname: '/production',
  userRole: 'SPPG_ADMIN',
  allowedRoles: [
    'SPPG_KEPALA',
    'SPPG_ADMIN',  // <-- Your role should be here
    'SPPG_PRODUKSI_MANAGER',
    'SPPG_STAFF_DAPUR',
    'SPPG_STAFF_QC',
    'SPPG_AHLI_GIZI'
  ],
  hasAccess: true,  // Should be true
  email: 'admin@sppg-purwakarta.com'
}

[Middleware] Production access granted
```

### Step 3: Look for Red Flags

#### ❌ BAD - sppgId is null:
```javascript
[Middleware] SPPG route check: {
  sppgId: null,  // RED FLAG!
  ...
}
[Middleware] No sppgId - redirecting to access-denied
```
**Fix**: Check database, user should have sppgId

#### ❌ BAD - userRole is undefined:
```javascript
[Middleware] SPPG route check: {
  userRole: undefined,  // RED FLAG!
  ...
}
```
**Fix**: Session not properly set, logout and login again

#### ❌ BAD - isSppgUser is false:
```javascript
[Middleware] SPPG user check: { isSppgUser: false }  // RED FLAG!
[Middleware] Not SPPG user - redirecting to admin
```
**Fix**: userRole doesn't start with 'SPPG_' or userType is wrong

#### ❌ BAD - hasAccess is false:
```javascript
[Middleware] Production access check: {
  userRole: 'SPPG_AKUNTAN',  // Not in allowed list
  hasAccess: false  // RED FLAG!
}
[Middleware] Redirecting to dashboard - access denied
```
**Fix**: User role not in production's allowed roles list

## 🧪 Complete Testing Procedure

1. **Restart dev server**
   ```bash
   npm run dev
   ```

2. **Clear browser cache**
   - Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

3. **Login**
   ```
   Email: admin@sppg-purwakarta.com
   Password: password123
   ```

4. **Open two windows side by side:**
   - Left: Browser with app
   - Right: Terminal running `npm run dev`

5. **Click "Production" in sidebar**

6. **Watch terminal output** - Copy all `[Middleware]` logs

7. **Check browser console** - Look for `[canAccess]` logs

## 📋 What to Report

Please provide these logs:

### Browser Console (F12):
```javascript
// Should see:
[canAccess] Production check: { ... }
[canAccess] Access check: { resource: 'production', userRole: 'SPPG_ADMIN', hasAccess: true }
```

### Server Terminal (npm run dev):
```javascript
// Should see when clicking production:
[Middleware] SPPG route check: { ... }
[Middleware] SPPG user check: { ... }
[Middleware] Production access check: { ... }
[Middleware] Production access granted  // or redirect message
```

### Session Check:
Run in browser console:
```javascript
fetch('/api/auth/session').then(r => r.json()).then(console.log)
```

## 🎯 Expected vs Actual

### ✅ Expected Behavior:
1. Click Production → Server logs show access granted
2. Page navigates to `/production`
3. Production list page loads

### ❌ Current Behavior:
1. Click Production → Server logs show ??? (need to check)
2. Page redirects to `/dashboard`
3. Production page never loads

## 🔧 Quick Fixes by Symptom

| Server Log Shows | Problem | Fix |
|-----------------|---------|-----|
| `sppgId: null` | User not in SPPG | Reseed database |
| `userRole: undefined` | Session broken | Logout + Login |
| `isSppgUser: false` | Role check failed | Verify userRole/userType |
| `hasAccess: false` | Role not allowed | Check userRole is SPPG_ADMIN |
| No logs appear | Server not restarted | Restart `npm run dev` |

## 🚨 Emergency Commands

If stuck, try this:

```bash
# 1. Kill all Node processes
pkill -f node

# 2. Clean everything
rm -rf .next
rm -rf node_modules/.cache

# 3. Fresh start
npm run dev

# 4. Browser: Incognito/Private window
# 5. Login: admin@sppg-purwakarta.com / password123
# 6. Check terminal logs while clicking Production
```

## 📞 Next Steps

1. **Restart dev server** (`npm run dev`)
2. **Login** with admin@sppg-purwakarta.com
3. **Click Production** in sidebar
4. **Copy all logs** from terminal
5. **Paste logs** here so we can analyze

The logs will tell us EXACTLY where the redirect happens! 🎯

---

**Debug Mode**: ✅ ACTIVE  
**Expected Output**: Detailed middleware logs in server terminal  
**Files Modified**: 
- `src/middleware.ts` (added debug logging)
- `src/hooks/use-auth.ts` (added debug logging)
