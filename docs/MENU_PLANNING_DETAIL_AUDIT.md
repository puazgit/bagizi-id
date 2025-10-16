# 🔍 Menu Planning Detail Page Audit

**Date**: October 16, 2025  
**Page**: http://localhost:3000/menu-planning/cmgsbngat00018ofbhdt4htzi  
**Issue**: Data bernilai 0, tidak akurat  
**Status**: 🔴 **ISSUES FOUND**

---

## 🐛 Issues Identified

### Issue 1: Planning Metrics Not Calculated ❌

**Location**: MenuPlan model fields
```prisma
totalDays          Int     @default(0)  // ❌ Not calculated
totalMenus         Int     @default(0)  // ❌ Not calculated
averageCostPerDay  Float   @default(0)  // ❌ Not calculated
totalEstimatedCost Float   @default(0)  // ❌ Not calculated
```

**Problem**:
- Fields initialized with 0 on creation
- Never updated when assignments are created
- Values remain 0 even with data

**Impact**:
- Quick Stats show wrong data
- Users see "0" everywhere
- Cost calculations incorrect

---

### Issue 2: Missing Calculation Triggers ❌

**What's Missing**:
1. No calculation when MenuAssignment created
2. No recalculation when MenuAssignment updated
3. No recalculation when MenuAssignment deleted
4. No bulk recalculation endpoint

**Current Flow** (BROKEN):
```
1. Create MenuPlan → totalDays = 0, totalMenus = 0, etc.
2. Add Assignments → Fields NOT updated ❌
3. Display plan detail → Shows 0 ❌
```

**Expected Flow**:
```
1. Create MenuPlan → Calculate from date range
2. Add Assignments → Recalculate metrics
3. Update Assignment → Recalculate metrics
4. Delete Assignment → Recalculate metrics
5. Display plan detail → Shows accurate data ✅
```

---

### Issue 3: API Returns Calculated Metrics But Not Persisted ⚠️

**Location**: `src/app/api/sppg/menu-planning/[id]/route.ts` (Line 117-148)

```typescript
// 5. Calculate additional metrics
const metrics = {
  totalAssignments: plan.assignments.length,
  totalPlannedPortions: plan.assignments.reduce(
    (sum, a) => sum + a.plannedPortions, 0
  ),
  totalEstimatedCost: plan.assignments.reduce(
    (sum, a) => sum + a.estimatedCost, 0
  ),
  averageCostPerPortion: plan.assignments.length > 0
    ? plan.assignments.reduce((sum, a) => sum + a.estimatedCost, 0) /
      plan.assignments.reduce((sum, a) => sum + a.plannedPortions, 0)
    : 0,
  // ...
}
```

**Problem**:
- Metrics calculated in API ✅
- But returned as separate `metrics` object
- Original plan fields still show 0
- Frontend uses plan fields, not metrics object

**Evidence**:
```typescript
// Frontend displays (MenuPlanDetail.tsx Line 245-260):
<QuickStat label="Total Days" value={plan.totalDays} />  // ❌ Shows 0
<QuickStat label="Avg Cost/Day" value={plan.averageCostPerDay} />  // ❌ Shows 0
<QuickStat label="Total Cost" value={plan.totalEstimatedCost} />  // ❌ Shows 0

// But API returns metrics separately:
data: {
  ...plan,  // totalDays: 0, totalEstimatedCost: 0
  metrics   // Has correct calculations!
}
```

---

### Issue 4: Date Range Not Calculated on Creation ❌

**Location**: MenuPlan creation

**Problem**:
```typescript
totalDays: 0  // Should be calculated from endDate - startDate
```

**Should be**:
```typescript
const daysDiff = Math.ceil(
  (new Date(endDate).getTime() - new Date(startDate).getTime()) / 
  (1000 * 60 * 60 * 24)
) + 1

totalDays: daysDiff
```

---

## 🎯 Root Cause Analysis

### Why Fields Are 0:

1. **No automatic calculation** on MenuPlan creation
2. **No update triggers** when assignments change
3. **Frontend reads wrong fields** (uses `plan.totalDays` instead of `plan.metrics.dateRange.days`)
4. **No periodic recalculation** job

### Architecture Issue:

```
❌ CURRENT (Broken):
MenuPlan creation → Set totalDays = 0
Add Assignment → Do nothing
Display → Show 0

✅ EXPECTED (Fixed):
MenuPlan creation → Calculate totalDays from dates
Add Assignment → Recalculate metrics
Display → Show accurate data
```

---

## ✅ Solutions Required

### Solution 1: Add Calculation on MenuPlan Creation

**File**: Creation endpoint or service

```typescript
// Calculate total days from date range
const totalDays = Math.ceil(
  (new Date(endDate).getTime() - new Date(startDate).getTime()) / 
  (1000 * 60 * 60 * 24)
) + 1

const menuPlan = await db.menuPlan.create({
  data: {
    // ... other fields
    totalDays,  // ✅ Calculate on creation
    totalMenus: 0,  // Will be updated when assignments added
    averageCostPerDay: 0,
    totalEstimatedCost: 0
  }
})
```

### Solution 2: Add Recalculation Function

**File**: `src/lib/menu-planning/calculations.ts` (NEW)

```typescript
export async function recalculateMenuPlanMetrics(planId: string) {
  // 1. Get all assignments
  const assignments = await db.menuAssignment.findMany({
    where: { menuPlanId: planId }
  })

  // 2. Calculate metrics
  const totalMenus = assignments.length
  const totalEstimatedCost = assignments.reduce(
    (sum, a) => sum + a.estimatedCost, 0
  )
  
  // Get unique dates
  const uniqueDates = new Set(
    assignments.map(a => a.assignedDate.toISOString().split('T')[0])
  )
  
  const daysWithAssignments = uniqueDates.size
  const averageCostPerDay = daysWithAssignments > 0 
    ? totalEstimatedCost / daysWithAssignments 
    : 0

  // 3. Update plan
  await db.menuPlan.update({
    where: { id: planId },
    data: {
      totalMenus,
      totalEstimatedCost,
      averageCostPerDay
    }
  })
}
```

### Solution 3: Add Triggers on Assignment Changes

**File**: Assignment create/update/delete endpoints

```typescript
// After creating assignment
await recalculateMenuPlanMetrics(menuPlanId)

// After updating assignment
await recalculateMenuPlanMetrics(menuPlanId)

// After deleting assignment
await recalculateMenuPlanMetrics(menuPlanId)
```

### Solution 4: Fix Frontend to Use Correct Data

**Option A**: Use metrics from API response
```typescript
// MenuPlanDetail.tsx
<QuickStat 
  label="Total Days" 
  value={plan.metrics?.dateRange?.days || plan.totalDays} 
/>
<QuickStat 
  label="Total Cost" 
  value={plan.metrics?.totalEstimatedCost || plan.totalEstimatedCost} 
/>
```

**Option B**: Recalculate all existing plans
```typescript
// Run migration script
async function fixExistingPlans() {
  const plans = await db.menuPlan.findMany()
  
  for (const plan of plans) {
    await recalculateMenuPlanMetrics(plan.id)
  }
}
```

### Solution 5: Add Bulk Recalculation Endpoint

**File**: `src/app/api/sppg/menu-planning/recalculate/route.ts` (NEW)

```typescript
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // Get all plans for this SPPG
  const plans = await db.menuPlan.findMany({
    where: { sppgId: session.user.sppgId }
  })

  // Recalculate each
  for (const plan of plans) {
    await recalculateMenuPlanMetrics(plan.id)
  }

  return Response.json({ 
    success: true, 
    message: `Recalculated ${plans.length} plans` 
  })
}
```

---

## 📊 Data Accuracy Issues Found

### Quick Stats Display (Line 244-261):

```typescript
// ❌ ISSUE: All showing 0
<QuickStat label="Total Days" value={plan.totalDays} />
// Current: 0
// Expected: Date difference (e.g., 30 days)

<QuickStat label="Assignments" value={plan._count?.assignments || 0} />
// Current: May be correct (using _count)
// Status: ✅ OK

<QuickStat label="Avg Cost/Day" value={`Rp ${plan.averageCostPerDay}`} />
// Current: Rp 0
// Expected: Rp 150,000 (example)

<QuickStat label="Total Cost" value={`Rp ${plan.totalEstimatedCost}`} />
// Current: Rp 0
// Expected: Rp 4,500,000 (example)
```

### Overview Tab Display (Line 463-471):

```typescript
// ❌ ISSUE: Showing wrong data
<DetailRow label="Total Days" value={plan.totalDays} />
// Current: 0
// Expected: Calculated from dates

<DetailRow label="Total Menus" value={plan.totalMenus || 0} />
// Current: 0
// Expected: Count of assignments
```

### Quality Metrics (Line 503-525):

```typescript
// ⚠️ WARNING: May not exist
{(plan.nutritionScore || plan.varietyScore || plan.costEfficiency) && (
  // These scores might also be 0 or undefined
)}
```

---

## 🧪 Testing Checklist

### Test 1: Check Current Data
```sql
-- Run in database
SELECT 
  id,
  name,
  total_days,
  total_menus,
  average_cost_per_day,
  total_estimated_cost,
  (SELECT COUNT(*) FROM menu_assignments WHERE menu_plan_id = mp.id) as actual_assignments
FROM menu_plans mp
WHERE id = 'cmgsbngat00018ofbhdt4htzi';
```

**Expected Result**:
```
total_days: 0  ❌
total_menus: 0  ❌
average_cost_per_day: 0  ❌
total_estimated_cost: 0  ❌
actual_assignments: > 0  (if assignments exist)
```

### Test 2: Check Assignments Exist
```sql
SELECT 
  COUNT(*) as assignment_count,
  SUM(estimated_cost) as total_cost,
  AVG(estimated_cost) as avg_cost,
  COUNT(DISTINCT DATE(assigned_date)) as unique_dates
FROM menu_assignments
WHERE menu_plan_id = 'cmgsbngat00018ofbhdt4htzi';
```

### Test 3: Check Date Range
```sql
SELECT 
  start_date,
  end_date,
  EXTRACT(DAY FROM (end_date - start_date)) + 1 as calculated_days,
  total_days as stored_days
FROM menu_plans
WHERE id = 'cmgsbngat00018ofbhdt4htzi';
```

---

## 🔧 Implementation Priority

### Phase 1: Quick Fix (Frontend Only) ⚡
**Time**: 15 minutes  
**Impact**: Users see correct data immediately

1. Update frontend to use `plan.metrics` from API response
2. Fallback to calculated values if metrics not available

### Phase 2: Calculation Function 🛠️
**Time**: 30 minutes  
**Impact**: Data accurate for new actions

1. Create `recalculateMenuPlanMetrics()` function
2. Call on assignment create/update/delete
3. Calculate `totalDays` on plan creation

### Phase 3: Fix Existing Data 📊
**Time**: 15 minutes  
**Impact**: Historical data fixed

1. Create recalculation endpoint
2. Run for all existing plans
3. Verify data accuracy

### Phase 4: Automated Triggers 🤖
**Time**: 1 hour  
**Impact**: Always accurate, no manual intervention

1. Add Prisma middleware for auto-calculation
2. Add database triggers (optional)
3. Add background job for periodic recalc

---

## 📝 Summary

**Issues Found**: 4 major issues
1. ❌ Metrics not calculated on creation
2. ❌ No update triggers
3. ⚠️ API calculates but doesn't persist
4. ❌ Frontend reads wrong fields

**Data Accuracy**: 0% (all metrics showing 0)

**Root Cause**: No calculation logic implemented

**Impact**: High - Users cannot see accurate data

**Recommended Action**: 
1. Implement Phase 1 (quick fix) immediately
2. Implement Phase 2 (proper calculation) today
3. Run Phase 3 (fix existing data) today
4. Plan Phase 4 (automation) for next sprint

---

**Next Steps**:
1. ✅ Confirm audit findings with database query
2. 🔧 Implement quick frontend fix
3. 🛠️ Create calculation function
4. 📊 Recalculate existing plans
5. ✅ Verify data accuracy

Would you like me to proceed with the fixes?
