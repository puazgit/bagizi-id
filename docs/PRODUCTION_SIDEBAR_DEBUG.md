# Production Sidebar Redirect - Troubleshooting Session

## 🔍 Issue Description

**Problem**: Clicking "Production" in sidebar redirects to dashboard  
**Expected**: Should navigate to `/production` page  
**Date**: October 17, 2025  
**Status**: 🔄 INVESTIGATING

## 🛠️ Changes Made

### 1. Fixed Permission Mismatch
✅ Updated `src/hooks/use-auth.ts` line 212 to include 6 roles instead of 4

### 2. Added Debug Logging
✅ Added console.log statements in `canAccess` function to track permission checks

## 🧪 Debugging Steps

### Step 1: Clear Browser Cache
**CRITICAL**: Old session might be cached

```bash
# In browser:
1. Open DevTools (F12)
2. Right-click Refresh → "Empty Cache and Hard Reload"
3. Or: Application tab → "Clear site data"
```

### Step 2: Check Console Logs
Open browser console and look for these logs:

```javascript
// Expected logs when sidebar renders:
[canAccess] Access check: { 
  resource: 'production', 
  userRole: 'SPPG_PRODUKSI_MANAGER', 
  hasAccess: true 
}

// If hasAccess is false, that's the problem
```

### Step 3: Verify Session
Run in browser console:

```javascript
fetch('/api/auth/session')
  .then(r => r.json())
  .then(data => {
    console.log('Session:', data)
    console.log('User Role:', data.user?.userRole)
    console.log('SPPG ID:', data.user?.sppgId)
  })
```

**Expected output:**
```json
{
  "user": {
    "email": "produksi@sppg-purwakarta.com",
    "userRole": "SPPG_PRODUKSI_MANAGER",
    "sppgId": "clxxx..." // NOT null
  }
}
```

### Step 4: Restart Development Server
Sometimes Next.js needs a full restart:

```bash
# Kill all Next.js processes
pkill -f 'next dev'

# Clean build cache
rm -rf .next

# Restart
npm run dev
```

### Step 5: Test with Known Good Account

```bash
# Logout completely
# Clear browser cache
# Login with:

Email: produksi@sppg-purwakarta.com
Password: password123
Role: SPPG_PRODUKSI_MANAGER
```

### Step 6: Direct URL Test

Navigate directly to: `http://localhost:3000/production`

**If this works:**
→ Problem is client-side (sidebar/canAccess)

**If this also redirects:**
→ Problem is server-side (middleware)

## 📊 Diagnosis Matrix

| Symptom | Cause | Solution |
|---------|-------|----------|
| Link not visible | `canAccess()` returns false | Check console logs, verify role |
| Link visible but redirects | Middleware blocking | Check user has sppgId |
| Console shows wrong role | Cached session | Logout, clear cache, login |
| sppgId is null | User not in SPPG | Check database assignment |
| hasAccess shows false | Role not in list | Verify use-auth.ts line 212 |

## 🔬 Debug Console Output

### What to Look For

#### Good Output ✅
```
[canAccess] Access check: { 
  resource: 'production', 
  userRole: 'SPPG_PRODUKSI_MANAGER', 
  hasAccess: true 
}
```

#### Bad Output ❌
```
[canAccess] Access check: { 
  resource: 'production', 
  userRole: 'SPPG_AKUNTAN',  // Not in allowed list
  hasAccess: false 
}
```

#### Critical Issue ❌
```
[canAccess] No user, denying access to: production
```
→ User not logged in or session expired

## 🎯 Quick Fix Checklist

- [ ] Cleared browser cache and cookies
- [ ] Restarted dev server (`npm run dev`)
- [ ] Logged out and logged in again
- [ ] Verified role in console: `fetch('/api/auth/session').then(r => r.json()).then(console.log)`
- [ ] Checked console logs for `[canAccess]` messages
- [ ] Tried direct URL: `http://localhost:3000/production`
- [ ] Verified sppgId is not null
- [ ] Confirmed role is one of 6 allowed roles

## 💡 Most Common Issues

### Issue #1: Cached Session
**Symptom**: Link not visible even after code changes  
**Fix**: Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

### Issue #2: Wrong Account
**Symptom**: Link not visible for current user  
**Fix**: Login with `produksi@sppg-purwakarta.com`

### Issue #3: Dev Server Not Restarted
**Symptom**: Changes not taking effect  
**Fix**: Kill and restart `npm run dev`

### Issue #4: Build Cache
**Symptom**: Old code still running  
**Fix**: `rm -rf .next && npm run dev`

## 📝 Information to Provide if Still Broken

Please provide these details:

1. **Browser Console Output**
   ```javascript
   // Run this in console:
   fetch('/api/auth/session').then(r => r.json()).then(console.log)
   ```

2. **Console Logs**
   - Look for `[canAccess]` messages
   - Screenshot or copy the output

3. **Current User**
   - Email you're logged in with
   - Expected role

4. **Sidebar Behavior**
   - Is "Production" link visible? (Yes/No)
   - If visible, what happens when clicked?
   - If not visible, what links do you see?

5. **Direct URL Test**
   - What happens when you go to `http://localhost:3000/production`?

6. **Database Check**
   ```bash
   npx prisma studio
   # Check User table for your email
   # Verify: userRole, sppgId, isActive
   ```

## 🔧 Emergency Reset Procedure

If nothing works, try this complete reset:

```bash
# 1. Stop everything
pkill -f 'next dev'
pkill -f 'prisma studio'

# 2. Clean all cache
rm -rf .next
rm -rf node_modules/.cache

# 3. Restart dev server
npm run dev

# 4. In browser:
# - Open incognito/private window
# - Go to http://localhost:3000
# - Login with: produksi@sppg-purwakarta.com / password123
# - Check sidebar for Production link
# - Open console, look for [canAccess] logs
```

## 📞 Next Steps

1. Try all Quick Fix Checklist items
2. Check console for `[canAccess]` debug logs
3. Provide console output if still not working
4. We'll analyze the logs and find the exact issue

---

**Debug Logging Active**: Yes ✅  
**Expected Console Output**: `[canAccess]` messages should appear  
**Files Modified**: `src/hooks/use-auth.ts` (added logging)
