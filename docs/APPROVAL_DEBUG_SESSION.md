# 🔍 Approval Debug Session - Enhanced Logging

**Date**: October 16, 2025  
**Status**: 🔧 **DEBUGGING IN PROGRESS**

---

## 🐛 Current Error

**Browser Console**:
```
Approve plan API error: {}
```

**Issue**: Empty error object indicates:
1. API response is not JSON formatted
2. API crashes before returning proper error
3. Response body already consumed

---

## ✅ Fixes Applied

### 1. Enhanced Client Error Handling
**File**: `src/features/sppg/menu-planning/api/index.ts`

```typescript
if (!response.ok) {
  const responseClone = response.clone() // Clone to read multiple times
  let error
  
  try {
    error = await response.json()
    console.error('Approve plan API error - Status:', response.status)
    console.error('Approve plan API error - Body:', error)
    throw new Error(error.details || error.error || `Failed (${response.status})`)
  } catch {
    // Fallback to text if JSON parse fails
    try {
      const text = await responseClone.text()
      console.error('Approve plan API error - Status:', response.status)
      console.error('Approve plan API error - Response text:', text)
      throw new Error(`Failed (${response.status}): ${text || 'Unknown'}`)
    } catch {
      console.error('Approve plan API error - Status:', response.status)
      throw new Error(`Failed (${response.status})`)
    }
  }
}
```

**What Changed**:
- ✅ Clone response to read body multiple times
- ✅ Show HTTP status code in all error messages
- ✅ Fallback to text if JSON parsing fails
- ✅ Show detailed error path in console

### 2. Comprehensive API Logging
**File**: `src/app/api/sppg/menu-planning/[id]/approve/route.ts`

```typescript
export async function POST(request, { params }) {
  console.log('🔵 Approve API called')
  
  try {
    const session = await auth()
    console.log('🔵 Session:', session?.user?.id, session?.user?.userRole)
    
    if (!session?.user) {
      console.log('🔴 No session - returning 401')
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!session.user.sppgId) {
      console.log('🔴 No sppgId - returning 403')
      return Response.json({ error: 'SPPG access required' }, { status: 403 })
    }

    const allowedRoles = ['SPPG_KEPALA', 'SPPG_ADMIN']
    console.log('🔵 Checking role:', session.user.userRole)
    
    if (!allowedRoles.includes(session.user.userRole)) {
      console.log('🔴 Insufficient permissions - returning 403')
      return Response.json({ 
        success: false, 
        error: 'Insufficient permissions' 
      }, { status: 403 })
    }

    const { id: planId } = await params
    console.log('🔵 Plan ID:', planId)
    
    const body = await request.json()
    console.log('🔵 Request body:', body)
    
    console.log('🔵 Finding plan...')
    const plan = await db.menuPlan.findFirst({
      where: { id: planId, sppgId: session.user.sppgId }
    })
    
    console.log('🔵 Plan found:', plan ? `Yes (${plan.status})` : 'No')
    
    if (!plan) {
      console.log('🔴 Plan not found - returning 404')
      return Response.json({ success: false, error: 'Plan not found' }, { status: 404 })
    }
    
    if (plan.status !== 'PENDING_REVIEW') {
      console.log('🔴 Wrong status:', plan.status)
      return Response.json({ 
        success: false, 
        error: `Cannot approve ${plan.status}` 
      }, { status: 400 })
    }
    
    console.log('🔵 Updating plan to APPROVED...')
    const updatedPlan = await db.menuPlan.update({
      where: { id: planId },
      data: {
        status: 'APPROVED',
        approvedBy: session.user.id,
        approvedAt: new Date()
      }
    })
    
    console.log('🟢 Plan updated successfully')
    console.log('🔵 Creating audit log...')
    
    await db.auditLog.create({
      data: {
        action: 'APPROVE_PLAN',
        entityType: 'MenuPlan',
        entityId: planId,
        userId: session.user.id,
        sppgId: session.user.sppgId
      }
    })
    
    console.log('🟢 Audit log created')
    console.log('🟢 Returning success response')
    
    return Response.json({
      success: true,
      message: 'Plan approved successfully',
      data: updatedPlan
    }, { status: 200 })
    
  } catch (error) {
    console.error('🔴 Approve plan error:', error)
    console.error('🔴 Error message:', error.message)
    console.error('🔴 Error stack:', error.stack)
    
    return Response.json({
      success: false,
      error: 'Failed to approve plan',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}
```

**Logging Legend**:
- 🔵 **Blue** = Info/Progress
- 🟢 **Green** = Success
- 🔴 **Red** = Error/Failure

---

## 🧪 Testing Steps

### Step 1: Open Terminal with Server Logs
1. Find terminal running `npm run dev`
2. Keep it visible
3. Watch for colored emoji logs (🔵🟢🔴)

### Step 2: Open Browser DevTools
1. Press **F12**
2. Go to **Console** tab
3. Clear console (click 🚫 icon or Cmd+K)
4. Go to **Network** tab
5. Filter: `approve`

### Step 3: Attempt Approval
1. Login as: `kepala@sppg-purwakarta.com` (password: `password123`)
2. Go to menu planning: `/menu-planning`
3. Open a plan detail
4. Click "..." menu
5. Click "Approve Plan"
6. Fill approval notes (optional)
7. Click "Approve" button

### Step 4: Collect Debug Information

**From Server Logs** (Terminal):
```
Expected flow:
🔵 Approve API called
🔵 Session: user-id SPPG_KEPALA
🔵 Checking role: SPPG_KEPALA
🔵 Plan ID: clxx...
🔵 Request body: { approvalNotes: '...' }
🔵 Finding plan...
🔵 Plan found: Yes (PENDING_REVIEW)
🔵 Updating plan to APPROVED...
🟢 Plan updated successfully
🔵 Creating audit log...
🟢 Audit log created
🟢 Returning success response
```

**If Error Occurs**:
```
🔴 [Error description]
🔴 Error message: [detail]
🔴 Error stack: [trace]
```

**From Browser Console**:
```
Look for:
- "Approve plan API error - Status: [code]"
- "Approve plan API error - Body: [detail]"
- Any red error messages
```

**From Network Tab**:
1. Click on the `approve` request
2. Check **Headers** tab:
   - Request URL
   - Status Code
3. Check **Payload** tab:
   - Request body sent
4. Check **Response** tab:
   - Response body received

---

## 📊 Common Error Patterns

### Pattern 1: Authentication Error
**Server Log**:
```
🔵 Approve API called
🔴 No session - returning 401
```

**Browser Console**:
```
Approve plan API error - Status: 401
Approve plan API error - Body: { error: 'Unauthorized' }
```

**Solution**: Refresh page and login again

---

### Pattern 2: Permission Error
**Server Log**:
```
🔵 Approve API called
🔵 Session: user-id SPPG_AHLI_GIZI
🔵 Checking role: SPPG_AHLI_GIZI
🔴 Insufficient permissions - returning 403
```

**Browser Console**:
```
Approve plan API error - Status: 403
Approve plan API error - Body: { success: false, error: 'Insufficient permissions' }
```

**Solution**: Login as KEPALA or ADMIN

---

### Pattern 3: Wrong Status
**Server Log**:
```
🔵 Approve API called
🔵 Session: user-id SPPG_KEPALA
🔵 Checking role: SPPG_KEPALA
🔵 Plan ID: clxx...
🔵 Finding plan...
🔵 Plan found: Yes (DRAFT)
🔴 Wrong status: DRAFT
```

**Browser Console**:
```
Approve plan API error - Status: 400
Approve plan API error - Body: { success: false, error: 'Cannot approve DRAFT' }
```

**Solution**: Submit plan for review first

---

### Pattern 4: Plan Not Found
**Server Log**:
```
🔵 Approve API called
🔵 Session: user-id SPPG_KEPALA
🔵 Checking role: SPPG_KEPALA
🔵 Plan ID: clxx...
🔵 Finding plan...
🔵 Plan found: No
🔴 Plan not found - returning 404
```

**Browser Console**:
```
Approve plan API error - Status: 404
Approve plan API error - Body: { success: false, error: 'Plan not found' }
```

**Solution**: Verify plan ID and SPPG access

---

### Pattern 5: Database Error
**Server Log**:
```
🔵 Approve API called
🔵 Session: user-id SPPG_KEPALA
🔵 Checking role: SPPG_KEPALA
🔵 Plan ID: clxx...
🔵 Finding plan...
🔴 Approve plan error: Error: ...
🔴 Error message: Invalid column name 'approved_by'
🔴 Error stack: ...
```

**Browser Console**:
```
Approve plan API error - Status: 500
Approve plan API error - Body: { 
  success: false, 
  error: 'Failed to approve plan',
  details: 'Invalid column name approved_by'
}
```

**Solution**: Run migration
```bash
npx prisma migrate dev
```

---

### Pattern 6: No Logs at All
**Server Log**: (silence)

**Browser Console**:
```
Approve plan API error: {}
```

**Possible Causes**:
1. API route not found (404 before reaching handler)
2. Middleware blocking request
3. Server crashed/restarted
4. Network error

**Solution**:
1. Check URL in Network tab (should be `/api/sppg/menu-planning/[id]/approve`)
2. Restart dev server: Ctrl+C then `npm run dev`
3. Check for build errors in terminal

---

## 🎯 What to Report

Please provide **ALL** of the following:

### 1. Server Logs (Terminal)
```
[Copy ENTIRE log sequence from server]
Starting from: 🔵 Approve API called
To: Final message (🟢 success or 🔴 error)
```

### 2. Browser Console
```
[Screenshot or copy-paste]
Look for:
- Approve plan API error - Status: ???
- Approve plan API error - Body: ???
```

### 3. Network Tab Details
```
Request URL: /api/sppg/menu-planning/[id]/approve
Status Code: ???
Request Payload: { approvalNotes: '...' }
Response: ???
```

### 4. Plan Details
```
Plan ID: [from URL]
Plan Status: [from UI or database]
User: kepala@sppg-purwakarta.com
User Role: SPPG_KEPALA
```

---

## 🔧 If Still Failing

If you still see empty error `{}`:

1. **Check if API endpoint is registered**:
   ```bash
   curl -X POST http://localhost:3000/api/sppg/menu-planning/test-id/approve \
     -H "Content-Type: application/json" \
     -d '{"approvalNotes": "test"}'
   ```
   
   Expected: Some response (even error)  
   Not expected: Empty response or connection refused

2. **Check Next.js build**:
   ```bash
   # Stop dev server (Ctrl+C)
   # Clear cache
   rm -rf .next
   # Restart
   npm run dev
   ```

3. **Check middleware**:
   Look for any middleware that might block the request

4. **Enable verbose logging**:
   Add to `.env.local`:
   ```
   NODE_ENV=development
   DEBUG=*
   ```

---

## 📝 Summary

**Changes Made**:
- ✅ Enhanced client error handling (show status, handle non-JSON)
- ✅ Comprehensive API logging (every step with emoji)
- ✅ Detailed error logging (message + stack trace)

**Next Action**:
1. Try approval again
2. Watch terminal for 🔵🟢🔴 logs
3. Check browser console for status code
4. Report back with ALL logs

**Expected**:
- Should see detailed log flow
- Should know exact failure point
- Should have actionable error message

Let's find where it's failing! 🔍
