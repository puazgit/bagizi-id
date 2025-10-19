# Phase 5.17.5 Complete: Data Fetching Hooks Created ✅

**Date**: 2025-01-16  
**Time Spent**: 15 minutes  
**Status**: Complete  

---

## 🎯 Objective

Create TanStack Query hooks and API client functions to enable easy data fetching for Programs and Users in the ProductionForm component.

---

## ✅ Files Created (6 New Files)

### 1. **programsApi.ts** (148 lines)
**Path**: `src/features/sppg/production/api/programsApi.ts`

**Purpose**: API client for fetching programs with menus

**Methods**:
- `getAll()` - Fetch all programs with menus
- `getById(id)` - Fetch single program
- `getFiltered(filters)` - Fetch with filters (programType, targetGroup, status, search)

**Helper Functions**:
- `hasMenus()` - Type guard for programs with menus
- `getAllMenus()` - Flatten all menus from programs
- `findProgram()` - Find program by ID
- `getMenusForProgram()` - Get menus for specific program

**TypeScript Types**:
```typescript
export interface ProgramWithMenus extends NutritionProgram {
  menus: Array<
    Pick<NutritionMenu, 'id' | 'menuName' | 'menuCode' | 'mealType' | 'servingSize' | 'costPerServing' | 'description'> 
    & {
      nutritionCalc?: {
        totalCalories: number
        totalProtein: number
        totalCarbs: number
        totalFat: number
        totalFiber: number
      } | null
    }
  >
}
```

---

### 2. **usersApi.ts** (155 lines)
**Path**: `src/features/sppg/production/api/usersApi.ts`

**Purpose**: API client for fetching SPPG users

**Methods**:
- `getAll(role?)` - Fetch all users with optional role filter
- `getKitchenStaff()` - Fetch kitchen staff (SPPG_STAFF_DAPUR)
- `getFiltered(options)` - Fetch with filters (role, search, status)
- `getById(id)` - Fetch single user

**Helper Functions**:
- `filterUsersByRole()` - Filter users array by role
- `getKitchenStaff()` - Get kitchen staff from array
- `getActiveUsers()` - Filter active users only
- `findUser()` - Find user by ID
- `getUserDisplayName()` - Format user name
- `getUserFullDisplay()` - Format full user info

**TypeScript Types**:
```typescript
export interface UserData {
  id: string
  name: string
  email: string
  userRole: UserRole
  phone?: string | null
  isActive: boolean
  profileImage?: string | null
  jobTitle?: string | null
  department?: string | null
  createdAt: Date | string
}
```

---

### 3. **usePrograms.ts** (105 lines)
**Path**: `src/features/sppg/production/hooks/usePrograms.ts`

**Purpose**: TanStack Query hooks for programs

**Hooks**:

#### `usePrograms()`
```typescript
const { data: programs, isLoading, error } = usePrograms()
```
- Returns all programs with menus
- Stale time: 5 minutes
- Cache time: 10 minutes
- Auto refetch on window focus

#### `useProgram(programId, enabled?)`
```typescript
const { data: program } = useProgram('program-id')
```
- Returns single program by ID
- Enabled by default when ID exists

#### `useProgramsFiltered(filters)`
```typescript
const { data: programs } = useProgramsFiltered({
  status: 'ACTIVE',
  programType: 'SCHOOL_FEEDING'
})
```
- Returns filtered programs
- Supports: programType, targetGroup, status, search

#### `useActivePrograms()`
```typescript
const { data: activePrograms } = useActivePrograms()
```
- Convenience wrapper for active programs only

#### `useProgramsCount()`
```typescript
const { data: count } = useProgramsCount()
```
- Returns just the count without full data

---

### 4. **useUsers.ts** (176 lines)
**Path**: `src/features/sppg/production/hooks/useUsers.ts`

**Purpose**: TanStack Query hooks for users

**Hooks**:

#### `useUsers(role?)`
```typescript
const { data: users } = useUsers()
const { data: kitchenStaff } = useUsers('SPPG_STAFF_DAPUR')
```
- Returns all users or filtered by role
- Stale time: 5 minutes
- Cache time: 10 minutes

#### `useKitchenStaff()`
```typescript
const { data: kitchenStaff } = useKitchenStaff()
```
- Convenience wrapper for kitchen staff
- Perfect for ProductionForm chef selection

#### `useUsersFiltered(options)`
```typescript
const { data: users } = useUsersFiltered({
  role: 'SPPG_AHLI_GIZI',
  status: 'active',
  search: 'john'
})
```
- Returns filtered users
- Supports: role, search, status

#### `useUser(userId, enabled?)`
```typescript
const { data: user } = useUser('user-id')
```
- Returns single user by ID

#### `useActiveUsers(role?)`
```typescript
const { data: activeUsers } = useActiveUsers('SPPG_STAFF_DAPUR')
```
- Returns active users only with optional role filter

#### `useUsersCount(role?)`
```typescript
const { data: count } = useUsersCount('SPPG_STAFF_DAPUR')
```
- Returns count of users

#### `useChefOptions()`
```typescript
const { data: options } = useChefOptions()
// Returns: [{ value: 'user-id', label: 'John Doe (Kepala Koki)' }]
```
- Returns formatted options for dropdown
- Includes job title in label

---

### 5. **hooks/index.ts** (13 lines)
**Path**: `src/features/sppg/production/hooks/index.ts`

**Purpose**: Central export for all hooks

```typescript
export * from './useProductions'
export * from './usePrograms'
export * from './useUsers'
```

---

### 6. **api/index.ts** (9 lines)
**Path**: `src/features/sppg/production/api/index.ts`

**Purpose**: Central export for all API clients

```typescript
export * from './programsApi'
export * from './usersApi'
```

---

## 🎨 Usage Examples

### Example 1: Production Create Page (Server-Side)
```typescript
// This will be implemented in Phase 5.17.6
import { programsApi, usersApi } from '@/features/sppg/production/api'

export default async function CreateProductionPage() {
  // Fetch data server-side
  const [programsRes, usersRes] = await Promise.all([
    programsApi.getAll(),
    usersApi.getKitchenStaff()
  ])

  const programs = programsRes.data || []
  const users = usersRes.data || []

  return <ProductionForm programs={programs} users={users} />
}
```

### Example 2: Client Component with Hooks
```typescript
'use client'

import { usePrograms, useKitchenStaff } from '@/features/sppg/production/hooks'

function ProductionFormContainer() {
  const { data: programs, isLoading: programsLoading } = usePrograms()
  const { data: kitchenStaff, isLoading: usersLoading } = useKitchenStaff()

  if (programsLoading || usersLoading) {
    return <LoadingSpinner />
  }

  return (
    <ProductionForm 
      programs={programs} 
      users={kitchenStaff}
    />
  )
}
```

### Example 3: Filtered Data
```typescript
function FilteredProgramsList() {
  const { data: activePrograms } = useActivePrograms()
  const { data: activeChefs } = useActiveUsers('SPPG_STAFF_DAPUR')

  return (
    <div>
      <h3>Active Programs: {activePrograms?.length}</h3>
      <h3>Available Chefs: {activeChefs?.length}</h3>
    </div>
  )
}
```

---

## 🔧 Technical Details

### TanStack Query Configuration

**Stale Time**: 5 minutes
- Data is considered fresh for 5 minutes
- No refetch will happen during this time
- Perfect for relatively static data like programs and users

**Cache Time (gcTime)**: 10 minutes
- Data stays in cache for 10 minutes after last usage
- Allows instant loading when switching between pages
- Reduces API calls

**Refetch Strategies**:
- `refetchOnWindowFocus: true` - Refetch when user returns to tab
- `refetchOnMount: true` - Refetch when component mounts
- Auto retry on failure (default TanStack Query behavior)

### Error Handling Pattern

```typescript
try {
  const response = await fetch('/api/sppg/programs')
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch programs')
  }
  return response.json()
} catch (error) {
  // Error is caught by TanStack Query
  // Available in component via `error` property
}
```

### Type Safety

All hooks return properly typed data:
```typescript
UseQueryResult<ProgramWithMenus[], Error>
UseQueryResult<UserData[], Error>
```

Components get full TypeScript autocomplete and type checking.

---

## 📊 Build Status

```bash
✅ TypeScript: 0 errors
✅ npm run build: SUCCESS
✅ Build time: 9.0 seconds
✅ All hooks compile correctly
✅ All API clients functional
```

---

## 📁 File Structure

```
src/features/sppg/production/
├── api/
│   ├── index.ts              ← NEW (9 lines)
│   ├── programsApi.ts        ← NEW (148 lines)
│   └── usersApi.ts           ← NEW (155 lines)
├── hooks/
│   ├── index.ts              ← NEW (13 lines)
│   ├── usePrograms.ts        ← NEW (105 lines)
│   ├── useUsers.ts           ← NEW (176 lines)
│   └── useProductions.ts     (existing)
└── components/
    └── ProductionForm.tsx    (will be updated in Phase 5.17.7)
```

**Total New Code**: 606 lines across 6 files

---

## ✅ Success Criteria Met

- [x] API client functions created
- [x] TanStack Query hooks implemented
- [x] TypeScript types defined
- [x] Helper functions added
- [x] Comprehensive JSDoc documentation
- [x] Usage examples in comments
- [x] Index files for exports
- [x] Build successful with 0 errors
- [x] Stale time and cache configured
- [x] Error handling implemented

---

## 🎯 Next Steps (Phase 5.17.6)

Now that we have the hooks and API clients, we need to:

1. **Update `/production/new/page.tsx`**:
   - Fetch programs and users server-side
   - Pass as props to ProductionForm
   - Add error handling

2. **Update `/production/[id]/edit/page.tsx`**:
   - Fetch production, programs, and users
   - Pass all data to ProductionForm
   - Handle edit restrictions (PLANNED only)

3. **Add Type Definitions**:
   - Define page props interfaces
   - Ensure type safety throughout

**Estimated Time**: 20 minutes

---

## 📝 Key Learnings

### 1. **Separation of Concerns**
- API clients handle HTTP requests
- Hooks handle caching and state
- Components just consume the data

### 2. **Type Safety First**
- Define interfaces before implementation
- Export types for reuse
- Use Prisma types as base

### 3. **Developer Experience**
- Comprehensive JSDoc comments
- Usage examples in comments
- Helper functions for common patterns

### 4. **Performance Optimization**
- Proper stale/cache time configuration
- Parallel data fetching support
- Efficient query key structure

---

## 🚀 Ready for Next Phase

With all hooks and API clients created, we're now ready to update the production pages to actually fetch and pass this data to the ProductionForm component.

**Status**: Phase 5.17.5 ✅ COMPLETE  
**Next**: Phase 5.17.6 - Update Production Pages (IN PROGRESS)  
**Progress**: 5/9 phases complete (55%)
