# Production Data Loading Error - Debug Guide

## Error Message
```
Gagal memuat data produksi
Terjadi kesalahan saat mengambil data. Silakan coba lagi.
```

## Current Status
- ✅ API routes created and compiled
- ✅ TypeScript 0 errors
- ✅ Dev server running at http://localhost:3000
- ❌ Frontend shows error when loading production list

## Debug Steps

### Step 1: Check Browser Console
1. Open browser to http://localhost:3000
2. Login with credentials:
   - Email: `admin@sppg-purwakarta.com`
   - Password: `password123`
3. Navigate to **Production** page (Produksi)
4. Open DevTools Console (F12 or Cmd+Option+I)
5. Look for console logs starting with `[useProductions]` or `[productionApi]`

**Expected Console Output:**
```
[productionApi.getAll] Fetching URL: /api/sppg/production?page=1&limit=12
[productionApi.getAll] Response status: 200 OK
[productionApi.getAll] Success response: { success: true, data: [...], pagination: {...} }
[useProductions] API Response: { success: true, data: [...], pagination: {...} }
[useProductions] Select response: { success: true, data: [...], pagination: {...} }
[useProductions] Extracted data: [...]
```

**If you see errors instead, note the exact error message!**

### Step 2: Check Network Tab
1. Open DevTools Network tab
2. Refresh the page
3. Find the request to `/api/sppg/production`
4. Check:
   - **Status Code**: Should be 200
   - **Response**: Should be JSON with `{ success: true, data: [...] }`
   - **Headers**: Check if session cookie is sent

**Possible Issues:**

#### Issue A: 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```
**Solution**: Session expired or not logged in properly
- Try logging out and logging in again
- Check if session cookie exists in DevTools > Application > Cookies

#### Issue B: 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```
**Solution**: User role doesn't have permission
- Verify user role in database
- Check if role is in allowed roles: `SPPG_KEPALA`, `SPPG_ADMIN`, `SPPG_PRODUKSI_MANAGER`, `SPPG_STAFF_DAPUR`, `SPPG_STAFF_QC`, `SPPG_AHLI_GIZI`

#### Issue C: 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "details": "..."
}
```
**Solution**: Server-side error
- Check terminal logs for Prisma errors
- Check if database is running: `docker ps`
- Check if migrations are up to date: `npx prisma db push`

#### Issue D: Network Error (No Response)
```
Failed to fetch
```
**Solution**: Connection issue
- Check if dev server is running
- Check if port 3000 is accessible
- Check firewall settings

#### Issue E: CORS Error
```
Access to fetch at 'http://localhost:3000/api/sppg/production' has been blocked by CORS policy
```
**Solution**: Should not happen in Next.js, but if it does:
- Check Next.js middleware configuration
- Verify API route is in correct folder

### Step 3: Check Database
If API returns 200 but no data:

```bash
# Connect to database
docker exec -it bagizi-postgres psql -U bagizi_user -d bagizi_db

# Check if production data exists
SELECT id, "batchNumber", status, "sppgId", "menuId" 
FROM food_productions 
LIMIT 5;

# Check user's SPPG
SELECT id, email, "sppgId", "userRole" 
FROM users 
WHERE email = 'admin@sppg-purwakarta.com';

# Check if SPPG exists
SELECT id, name, code, status 
FROM sppgs 
WHERE id = (SELECT "sppgId" FROM users WHERE email = 'admin@sppg-purwakarta.com');

# Exit
\q
```

### Step 4: Verify API Route
If browser console shows fetch errors, verify API route exists:

```bash
# Check if API route file exists
ls -la src/app/api/sppg/production/route.ts

# Check if it compiles without errors
npx tsc --noEmit src/app/api/sppg/production/route.ts
```

### Step 5: Test API Directly
Test API endpoint using curl:

```bash
# Get session cookie first (login via browser)
# Then test API

curl -v http://localhost:3000/api/sppg/production?page=1&limit=12 \
  -H "Cookie: authjs.session-token=YOUR_SESSION_TOKEN"
```

## Common Solutions

### Solution 1: Restart Dev Server
```bash
# Kill existing process
lsof -ti:3000 | xargs kill -9

# Start fresh
npm run dev
```

### Solution 2: Clear Next.js Cache
```bash
# Remove .next folder
rm -rf .next

# Restart dev server
npm run dev
```

### Solution 3: Rebuild Database
```bash
# Reset database and reseed
npm run db:reset

# Or just push schema
npx prisma db push
npx prisma db seed
```

### Solution 4: Clear Browser Cache
1. Open DevTools
2. Right-click reload button
3. Select "Empty Cache and Hard Reload"

## Report Format

When reporting the error, please provide:

1. **Console Output** (copy entire console logs)
2. **Network Tab** (screenshot of /api/sppg/production request)
3. **Response Data** (copy the JSON response)
4. **User Role** (from database query)
5. **SPPG ID** (from database query)
6. **Browser** (Chrome/Firefox/Safari version)

## Expected Behavior

When working correctly:
1. User navigates to /production page
2. API call to `/api/sppg/production?page=1&limit=12` returns 200
3. Response contains: `{ success: true, data: [...], pagination: {...} }`
4. Hook extracts data array
5. Component displays production cards
6. No error state shown

## Files Modified for Debugging

Added console.log statements to:
- `src/features/sppg/production/hooks/useProductions.ts` (lines 40-67)
- `src/features/sppg/production/api/productionApi.ts` (lines 140-179)

These logs will help identify exactly where the request fails.
