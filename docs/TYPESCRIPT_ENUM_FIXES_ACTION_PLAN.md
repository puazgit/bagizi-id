# 🔧 TypeScript Enum Fixes - Action Plan

## 📅 Date: October 19, 2025

---

## 🎯 Quick Fix Guide

### Step 1: Search & Replace Old Enum Values (15 minutes)

Run these commands to fix all old enum string references:

```bash
# Navigate to project root
cd /Users/yasunstudio/Development/bagizi-id

# Fix DeliveryStatus enum values
grep -rl "'IN_TRANSIT'" src/app/api/sppg/distribution src/features/sppg/distribution | xargs sed -i '' "s/'IN_TRANSIT'/'DEPARTED'/g"
grep -rl "'ARRIVED'" src/app/api/sppg/distribution src/features/sppg/distribution | xargs sed -i '' "s/'ARRIVED'/'DELIVERED'/g"
grep -rl "'PENDING'" src/app/api/sppg/distribution src/features/sppg/distribution | xargs sed -i '' "s/'PENDING'/'ASSIGNED'/g"
grep -rl "'PARTIAL'" src/app/api/sppg/distribution src/features/sppg/distribution | xargs sed -i '' "s/'PARTIAL'/'FAILED'/g"

# Fix DistributionScheduleStatus enum values  
grep -rl "'CONFIRMED'" src/app/api/sppg/distribution src/features/sppg/distribution | xargs sed -i '' "s/'CONFIRMED'/'IN_PROGRESS'/g"

# Fix delivery completion status (COMPLETED → DELIVERED)
grep -rl "delivery.status === 'COMPLETED'" src/ | xargs sed -i '' "s/delivery.status === 'COMPLETED'/delivery.status === 'DELIVERED'/g"
grep -rl "status === 'IN_PROGRESS'" src/features/sppg/distribution/execution | xargs sed -i '' "s/status === 'IN_PROGRESS'/status === 'DEPARTED'/g"
```

**Note**: Check results before committing!

---

### Step 2: Update Manual TypeScript Enums (10 minutes)

#### File: `src/features/sppg/distribution/delivery/types/delivery.types.ts`

**Find this:**
```typescript
export const DELIVERY_STATUS = {
  PENDING: 'PENDING',
  IN_TRANSIT: 'IN_TRANSIT',
  ARRIVED: 'ARRIVED',
  DELIVERED: 'DELIVERED',
  FAILED: 'FAILED',
  PARTIAL: 'PARTIAL',
} as const
```

**Replace with:**
```typescript
// Use Prisma-generated enum instead
export { DeliveryStatus } from '@prisma/client'

// Helper for UI display
export const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, string> = {
  ASSIGNED: 'Ditugaskan',
  DEPARTED: 'Dalam Perjalanan',
  DELIVERED: 'Terkirim',
  FAILED: 'Gagal',
  CANCELLED: 'Dibatalkan',
}
```

#### File: `src/features/sppg/distribution/schedule/types/schedule.types.ts`

**Find this:**
```typescript
export const SCHEDULE_STATUS = {
  PLANNED: 'PLANNED',
  ASSIGNED: 'ASSIGNED',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const
```

**Replace with:**
```typescript
// Use Prisma-generated enum instead
export { DistributionScheduleStatus } from '@prisma/client'

// Helper for UI display
export const SCHEDULE_STATUS_LABELS: Record<DistributionScheduleStatus, string> = {
  PLANNED: 'Direncanakan',
  PREPARED: 'Disiapkan',
  IN_PROGRESS: 'Dalam Proses',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan',
  DELAYED: 'Tertunda',
}
```

---

### Step 3: Fix Prisma Include Statements (30 minutes)

#### Common Mistake Pattern:

```typescript
// ❌ WRONG: Including non-existent relations
const delivery = await db.distributionDelivery.findFirst({
  include: {
    schedule: true,      // ❌ No relation (only scheduleId field)
    distribution: true,  // ❌ No relation (only distributionId field)
    school: true,        // ❌ No relation (only schoolBeneficiaryId field)
  }
})
```

#### Fix Pattern:

```typescript
// ✅ CORRECT: Include actual relations OR fetch separately
const delivery = await db.distributionDelivery.findFirst({
  include: {
    delivery_photos: true,   // ✅ Actual relation
    delivery_issues: true,   // ✅ Actual relation
    delivery_tracking: true, // ✅ Actual relation
  }
})

// If you need related data, fetch separately:
const schedule = delivery.scheduleId 
  ? await db.distributionSchedule.findUnique({ where: { id: delivery.scheduleId }})
  : null

const distribution = delivery.distributionId
  ? await db.foodDistribution.findUnique({ where: { id: delivery.distributionId }})
  : null
```

#### Files to Check:
1. `src/app/api/sppg/distribution/delivery/route.ts` (line 134, 212-218)
2. `src/app/api/sppg/distribution/execution/[id]/complete/route.ts` (line 50, 96, 98, 103, 122)
3. `src/app/api/sppg/distribution/execution/[id]/route.ts` (line 56, 178)
4. `src/app/api/sppg/distribution/execution/route.ts` (line 115, 209, 256)
5. `src/app/api/sppg/distribution/schedule/statistics/route.ts` (line 153, 188)

---

### Step 4: Fix Component Type Issues (20 minutes)

#### File: `src/features/sppg/distribution/schedule/components/ScheduleStatusActions.tsx`

**Issue**: Line 154 tries to assign `DistributionScheduleStatus` to `ScheduleStatus`

**Fix**: Import and use correct Prisma enum:
```typescript
import { DistributionScheduleStatus } from '@prisma/client'

// Update function signature:
const handleStatusChange = async (newStatus: DistributionScheduleStatus) => {
  // ...
}
```

#### File: `src/features/sppg/distribution/schedule/components/VehicleAssignmentDialog.tsx`

**Issue**: Lines 81 & 109 - function call mismatch

**Fix**: Check function signature and update props accordingly

---

### Step 5: Test & Verify (15 minutes)

```bash
# 1. Run TypeScript compilation
npx tsc --noEmit

# 2. If no errors, start dev server
npm run dev

# 3. Test distribution workflow:
# - Create schedule (PLANNED)
# - Prepare food (PREPARED)
# - Start execution (IN_PROGRESS)
# - Assign delivery (ASSIGNED)
# - Depart (DEPARTED)
# - Complete delivery (DELIVERED)

# 4. Check all status transitions work correctly
```

---

## 📊 Error Breakdown

### By Category:
| Category                  | Count | Priority | Estimate |
|---------------------------|-------|----------|----------|
| Enum value comparisons    | 25    | HIGH     | 15 min   |
| Manual enum types         | 8     | HIGH     | 10 min   |
| Prisma include statements | 15    | MEDIUM   | 30 min   |
| Component type issues     | 4     | LOW      | 20 min   |
| **TOTAL**                 | **52**| -        | **75 min** |

### By File Type:
- API Endpoints: 30 errors (58%)
- Type Definitions: 10 errors (19%)
- Components: 12 errors (23%)

---

## 🚦 Quick Wins (Do First)

### 1. Global Search & Replace (5 minutes)
Use VS Code's global search & replace to fix common patterns:

**Find**: `'IN_TRANSIT'`  
**Replace**: `'DEPARTED'`  
**Files**: `src/app/api/sppg/distribution/**/*.ts`, `src/features/sppg/distribution/**/*.ts`

**Find**: `'ARRIVED'`  
**Replace**: `'DELIVERED'`  

**Find**: `'PENDING'`  
**Replace**: `'ASSIGNED'`  

**Find**: `'CONFIRMED'`  
**Replace**: `'IN_PROGRESS'`  

**Find**: `'PARTIAL'`  
**Replace**: `'FAILED'`  

This will fix ~25 errors immediately! ⚡

---

### 2. Remove Manual Enums (5 minutes)
Delete manual enum definitions and import from Prisma:

```typescript
// Remove these:
- export const DELIVERY_STATUS = { ... }
- export const SCHEDULE_STATUS = { ... }

// Add these:
+ export { DeliveryStatus, DistributionScheduleStatus } from '@prisma/client'
```

This will fix ~8 errors! ⚡

---

### 3. Comment Out Problematic Includes (2 minutes)
Temporarily comment out include statements causing errors:

```typescript
const delivery = await db.distributionDelivery.findFirst({
  // include: {
  //   schedule: true,  // TODO: Fix - not a relation
  // }
})
```

This will let you compile and test the core functionality while you fix the remaining issues properly.

---

## ✅ Verification Checklist

After each step, verify:

- [ ] TypeScript compilation passes (`npx tsc --noEmit`)
- [ ] Dev server starts without errors (`npm run dev`)
- [ ] API endpoints return correct data
- [ ] Status transitions work in UI
- [ ] All enum values display correctly
- [ ] No console errors in browser
- [ ] Seed script still works (`npx tsx prisma/seed.ts`)

---

## 🎯 Final Goal

**Target**: 0 TypeScript errors  
**Current**: 52 errors  
**Estimated Time**: 75 minutes (1 hour 15 min)  
**Priority**: HIGH ⚡

After fixing all TypeScript errors, the distribution domain will be:
- ✅ 100% type-safe
- ✅ 100% enum consistent
- ✅ 100% workflow aligned
- ✅ Ready for production deployment

---

## 📝 Notes

- Use `git stash` before making bulk changes
- Test after each major change
- Keep backup of original files
- Commit frequently with descriptive messages
- Use `git diff` to review changes before committing

---

**Created**: October 19, 2025, 15:50 WIB  
**Status**: Ready to execute 🚀  
**Next Action**: Start with Quick Wins → Global Search & Replace
