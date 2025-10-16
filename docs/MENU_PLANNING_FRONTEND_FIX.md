# Menu Planning Frontend Fix - API Response Structure

**Date**: January 16, 2025  
**Issue**: Frontend tidak menampilkan data menu planning  
**Status**: ✅ FIXED

---

## 🐛 Root Cause

**Problem**: API response structure mismatch antara backend dan frontend

### Backend Response (INCORRECT):
```typescript
// GET /api/sppg/menu-planning
return Response.json({
  success: true,
  plans: plans,  // ❌ WRONG KEY
  summary,
  meta: { ... }
})
```

### Frontend Expected (CORRECT):
```typescript
// useMenuPlans hook expects:
select: (response) => ({
  plans: response.data || [],  // ✅ Expects 'data' key
  summary: response.summary,
  meta: response.meta
})
```

---

## ✅ Solution Applied

### Fixed API Response Structure

**File**: `src/app/api/sppg/menu-planning/route.ts`

**Change**:
```typescript
// Before (INCORRECT):
return Response.json({
  success: true,
  plans: plans,  // ❌ Wrong key
  summary,
  meta: { ... }
})

// After (CORRECT):
return Response.json({
  success: true,
  data: plans,  // ✅ Correct key matching ApiListResponse<T> type
  summary,
  meta: { ... }
})
```

### Type Definition Verification

**File**: `src/features/sppg/menu-planning/types/index.ts`

```typescript
export interface ApiListResponse<T> extends ApiResponse<T> {
  meta?: {
    total: number
    page?: number
    limit?: number
    filters?: Record<string, unknown>
  }
  summary?: MenuPlanSummary  // ✅ Summary included
}

export interface ApiResponse<T> {
  success: boolean
  data?: T  // ✅ Data should be in 'data' key
  error?: string
  details?: unknown
  message?: string
}
```

---

## 📊 Verification Steps

### 1. Check Response Structure
```bash
# With authentication (requires login):
curl -b cookies.txt http://localhost:3000/api/sppg/menu-planning

# Expected response:
{
  "success": true,
  "data": [
    {
      "id": "...",
      "name": "Rencana Menu November 2025 - DRAFT",
      "status": "DRAFT",
      ...
    }
  ],
  "summary": {
    "totalPlans": 4,
    "byStatus": { ... }
  },
  "meta": { ... }
}
```

### 2. Browser Dev Tools
```javascript
// In browser console, check network tab:
// Request: GET /api/sppg/menu-planning
// Response should have "data" key with array of plans
```

### 3. React Query DevTools
```typescript
// Check query data structure:
queryKey: ['menu-planning', 'list', filters]
queryData: {
  plans: [...],  // From select transformation
  summary: {...},
  meta: {...}
}
```

---

## 🔍 Related Files

### API Files (Backend)
- ✅ `src/app/api/sppg/menu-planning/route.ts` - GET endpoint fixed
- ✅ `src/app/api/sppg/menu-planning/[id]/route.ts` - Already correct

### Frontend Files
- ✅ `src/features/sppg/menu-planning/hooks/useMenuPlans.ts` - Hook expects `data` key
- ✅ `src/features/sppg/menu-planning/api/index.ts` - API client calls endpoint
- ✅ `src/features/sppg/menu-planning/components/MenuPlanList.tsx` - Renders plans
- ✅ `src/features/sppg/menu-planning/types/index.ts` - Type definitions

---

## 🎯 Testing Checklist

- [x] API response structure fixed (plans → data)
- [ ] Login to application (admin@sppg-purwakarta.com)
- [ ] Navigate to /menu-planning
- [ ] Verify 4 plans are displayed
- [ ] Check summary statistics show correct counts
- [ ] Verify filters work (status, search)
- [ ] Test plan detail page
- [ ] Verify calendar tab shows assignments
- [ ] Check analytics charts render

---

## 🚨 Common Issues & Solutions

### Issue 1: "Cannot read properties of undefined (reading 'draft')"
**Cause**: `summary.byStatus` is undefined  
**Solution**: API now returns proper summary structure with byStatus object

### Issue 2: Plans array is empty
**Possible Causes**:
1. ❌ Not logged in → redirect to /login
2. ❌ sppgId is null → 403 SPPG access required
3. ❌ No data in database → run `npm run db:seed`
4. ❌ Wrong response key → FIXED (plans → data)

**Debug Steps**:
```typescript
// Check in browser console:
1. Session: Check if user is logged in
2. Network: Check API response has 'data' key
3. React Query: Check query state (loading, error, data)
4. Database: Verify data exists in menu_plans table
```

### Issue 3: Authentication redirect loop
**Cause**: Session not persisting  
**Solution**: Check auth configuration and cookies

---

## 📝 Key Learnings

### 1. Response Structure Consistency
Always use consistent response structure across all endpoints:
```typescript
// Standard success response:
{
  success: true,
  data: T,           // Main data in 'data' key
  meta?: {},         // Metadata (pagination, filters)
  summary?: {},      // Aggregated statistics
  message?: string   // Optional success message
}

// Standard error response:
{
  success: false,
  error: string,     // Error message
  details?: unknown  // Debug details (dev only)
}
```

### 2. Type Safety Matters
TypeScript interfaces help catch these issues early:
```typescript
// If backend returns different structure than type definition,
// TypeScript should show errors during development

interface ApiListResponse<T> extends ApiResponse<T> {
  summary?: MenuPlanSummary  // Required for frontend
}
```

### 3. Frontend Data Transformation
React Query's `select` allows transformation:
```typescript
useQuery({
  queryFn: () => api.getPlans(),
  select: (response) => ({
    plans: response.data || [],      // Transform for component
    summary: response.summary,
    meta: response.meta
  })
})
```

---

## 🎉 Expected Outcome

After fix, frontend should display:

**Summary Statistics**:
- Total: 4 plans
- Draft: 1 (November)
- Approved: 1 (October)
- Active: 1 (September) 
- Completed: 1 (August)

**Plan Cards**:
- Each plan card shows: name, status, date range, assignments count
- Click card → navigate to detail page
- Action buttons: Edit, Delete, Submit, Approve (based on status)

**Filters**:
- Status filter: All, Draft, Approved, Active, Completed
- Search: Filter by plan name or description

---

## 🔗 Related Documentation

- [Menu Planning Seed Implementation](./MENU_PLANNING_SEED_IMPLEMENTATION_COMPLETE.md)
- [Menu Planning Domain Implementation](./MENU_PLANNING_DOMAIN_IMPLEMENTATION.md)
- [API Response Structure Bug Fix](./API_RESPONSE_STRUCTURE_BUG_FIX.md) (previous similar fix)

---

**Status**: ✅ API Response Structure FIXED  
**Next**: Browser integration testing with real user session  
**File Updated**: `src/app/api/sppg/menu-planning/route.ts` (Line 115)
