# Distribution Schedule Enum Error Fix

**Date**: October 19, 2025  
**Status**: ✅ Complete  
**Issue**: Runtime TypeError - "Cannot convert undefined or null to object" when accessing distribution schedule

## Root Cause

The code was trying to import `DistributionScheduleStatus` enum from `@prisma/client`, but this enum doesn't exist in the generated Prisma client because the `DistributionSchedule.status` field in the schema is defined as `String` type instead of using the `DistributionScheduleStatus` enum type.

### Schema Inconsistency

**In Prisma Schema**:
```prisma
model DistributionSchedule {
  // ...
  status String @default("PLANNED")  // ❌ Uses String, not enum
  // ...
}

enum DistributionScheduleStatus {  // ✅ Enum exists but not used
  PLANNED
  PREPARED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  DELAYED
}
```

**Result**: The enum `DistributionScheduleStatus` exists in the schema but since it's not referenced by any field, Prisma doesn't generate it in the client, causing `undefined` when imported.

## Issues Fixed

### 1. Schema Validation (scheduleSchema.ts)

**Location**: Lines 8-38 in `src/features/sppg/distribution/schedule/schemas/scheduleSchema.ts`

**Before (Broken)**:
```typescript
import { 
  DistributionWave, 
  BeneficiaryCategory,
  DistributionScheduleStatus  // ❌ Doesn't exist in Prisma client
} from '@prisma/client'

export const scheduleStatusSchema = z.nativeEnum(DistributionScheduleStatus, {
  message: 'Status jadwal tidak valid',
})
```

**After (Fixed)**:
```typescript
import { 
  DistributionWave, 
  BeneficiaryCategory,
  // Removed DistributionScheduleStatus import
} from '@prisma/client'

export const scheduleStatusSchema = z.enum([
  'PLANNED',
  'PREPARED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'DELAYED',
], {
  message: 'Status jadwal tidak valid',
})
```

### 2. Type Definitions (schedule.types.ts)

**Location**: Lines 8-27 in `src/features/sppg/distribution/schedule/types/schedule.types.ts`

**Before (Broken)**:
```typescript
import {
  DistributionSchedule,
  DistributionDelivery,
  VehicleAssignment,
  DistributionWave,
  BeneficiaryCategory,
  DistributionScheduleStatus,  // ❌ Doesn't exist
} from '@prisma/client'

export { DistributionScheduleStatus as ScheduleStatus } from '@prisma/client'
```

**After (Fixed)**:
```typescript
import {
  DistributionSchedule,
  DistributionDelivery,
  VehicleAssignment,
  DistributionWave,
  BeneficiaryCategory,
  // Removed DistributionScheduleStatus import
} from '@prisma/client'

// Manual enum definition
export enum ScheduleStatus {
  PLANNED = 'PLANNED',
  PREPARED = 'PREPARED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DELAYED = 'DELAYED',
}

export type DistributionScheduleStatus = ScheduleStatus
```

### 3. Status Transitions & Labels

**Location**: Lines 95-133 in `src/features/sppg/distribution/schedule/types/schedule.types.ts`

**Before**:
```typescript
export const SCHEDULE_STATUS_TRANSITIONS: Record<
  DistributionScheduleStatus,  // ❌ Type doesn't exist
  DistributionScheduleStatus[]
> = {
  PLANNED: ['PREPARED', 'CANCELLED'],
  // ...
}
```

**After**:
```typescript
export const SCHEDULE_STATUS_TRANSITIONS: Record<
  ScheduleStatus,
  ScheduleStatus[]
> = {
  [ScheduleStatus.PLANNED]: [ScheduleStatus.PREPARED, ScheduleStatus.CANCELLED],
  [ScheduleStatus.PREPARED]: [ScheduleStatus.IN_PROGRESS, ScheduleStatus.CANCELLED, ScheduleStatus.DELAYED],
  // ... using enum values
}

export const SCHEDULE_STATUS_LABELS: Record<ScheduleStatus, string> = {
  [ScheduleStatus.PLANNED]: 'Direncanakan',
  // ... using enum values
}

export const SCHEDULE_STATUS_COLORS: Record<
  ScheduleStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  [ScheduleStatus.PLANNED]: 'outline',
  // ... using enum values
}
```

## Files Modified

1. **`/src/features/sppg/distribution/schedule/schemas/scheduleSchema.ts`**
   - Removed import of non-existent `DistributionScheduleStatus`
   - Changed from `z.nativeEnum()` to `z.enum()` with manual string array

2. **`/src/features/sppg/distribution/schedule/types/schedule.types.ts`**
   - Removed import of non-existent `DistributionScheduleStatus`
   - Created manual `ScheduleStatus` enum
   - Updated all status-related constants to use the new enum

## Solution Strategy

Instead of importing the enum from Prisma (which doesn't exist), we:
1. Created a **manual TypeScript enum** with the same values as defined in the Prisma schema
2. Used `z.enum()` with string array instead of `z.nativeEnum()` for Zod validation
3. Updated all type references to use the new manual enum

## Future Considerations

### Option A: Keep Manual Enum (Current Solution)
**Pros:**
- Works immediately without schema changes
- No migration needed
- Maintains backward compatibility

**Cons:**
- Enum definition duplicated (in schema and TypeScript)
- Manual synchronization required if status values change

### Option B: Fix Prisma Schema (Future)
Update the Prisma schema to actually use the enum:

```prisma
model DistributionSchedule {
  // ...
  status DistributionScheduleStatus @default(PLANNED)  // ✅ Use the enum
  // ...
}
```

Then:
1. Run `npx prisma migrate dev --name use-schedule-status-enum`
2. Revert TypeScript code to use Prisma-generated enum
3. Update existing database records if needed

## Testing Checklist

- [x] TypeScript compilation successful
- [x] No import errors for DistributionScheduleStatus
- [ ] Navigate to http://localhost:3000/distribution/schedule
- [ ] Page loads without errors
- [ ] Create schedule form works
- [ ] Status filtering works
- [ ] Status transitions validate correctly

## Expected Result

The distribution schedule pages should now:
- ✅ Load without "Cannot convert undefined or null to object" error
- ✅ Display schedule list correctly
- ✅ Allow schedule creation with proper status validation
- ✅ Show status badges with correct colors
- ✅ Support status transitions according to business rules

## Related Files

- `/src/features/sppg/distribution/schedule/schemas/scheduleSchema.ts` - Validation schemas (fixed)
- `/src/features/sppg/distribution/schedule/types/schedule.types.ts` - Type definitions (fixed)
- `/src/features/sppg/distribution/schedule/components/ScheduleList.tsx` - List component
- `/src/features/sppg/distribution/schedule/components/ScheduleForm.tsx` - Form component
- `/src/app/(sppg)/distribution/schedule/new/page.tsx` - Create page
- `prisma/schema.prisma` - Database schema (enum exists but unused)

## Notes

This is a common issue when Prisma enums are defined but not actually used by any model field. The Prisma client generator only includes types that are actively referenced in the schema.

The manual enum solution provides immediate relief while maintaining type safety. For long-term maintainability, consider updating the Prisma schema to actually use the enum type (Option B above).
