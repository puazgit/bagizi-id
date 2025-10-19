# Production Domain Audit Report 🔍

**Date**: October 17, 2025  
**Auditor**: GitHub Copilot  
**Status**: ⚠️ CRITICAL ISSUES FOUND

---

## 🚨 Critical Issues Found

### 1. **Missing Programs & Menus API** ❌ BLOCKER

**Issue**: ProductionForm requires `programs` prop with nested menus, but NO API endpoint exists to fetch this data.

**Affected Files**:
- `src/features/sppg/production/components/ProductionForm.tsx`
  - Line 58: `programs?: Array<NutritionProgram & { menus?: NutritionMenu[] }>`
  - Line 154-156: `availableMenus` depends on programs prop
  - Line 306-323: Program dropdown is empty
  - Line 325-342: Menu dropdown is empty

**Root Cause**:
```tsx
// ❌ ProductionForm expects programs prop
<ProductionForm programs={programs} />

// ❌ But page doesn't provide it
<ProductionForm /> // Empty - no data!
```

**Impact**: 🔴 HIGH
- Users CANNOT create new production (form is unusable)
- Dropdown program is EMPTY
- Dropdown menu is EMPTY
- Form cannot calculate estimated cost
- Critical blocker for CRUD operations

---

### 2. **Missing API Endpoints** ❌ BLOCKER

**Missing Endpoints**:

#### A. Programs API
```
❌ GET /api/sppg/programs
❌ GET /api/sppg/programs/[id]
```

**Required Response**:
```typescript
{
  success: true,
  data: [
    {
      id: string
      name: string
      programType: string
      menus: [
        {
          id: string
          menuName: string
          menuCode: string
          mealType: string
          costPerServing: number
          servingSize: number
          calories: number
        }
      ]
    }
  ]
}
```

#### B. Users API (for Chef Selection)
```
❌ GET /api/sppg/users
❌ GET /api/sppg/users?role=SPPG_STAFF_DAPUR
```

**Required for**:
- Head Cook dropdown (line 418-433)
- Assistant Cooks dropdown (line 435-450)
- Supervisor dropdown (line 452-467)

**Current State**: All user dropdowns are EMPTY

---

### 3. **Missing Hooks for Data Fetching** ❌

**ProductionForm needs these hooks**:

```typescript
// ❌ NOT IMPLEMENTED
usePrograms() // Fetch all programs with menus
useUsers(role?) // Fetch users by role for chef selection
```

**Current hooks** (`src/features/sppg/production/hooks/useProductions.ts`):
- ✅ useProductions() - List productions
- ✅ useProduction(id) - Get production detail
- ✅ useCreateProduction() - Create production
- ✅ useUpdateProduction() - Update production
- ✅ useDeleteProduction() - Delete production
- ✅ useUpdateProductionStatus() - Update status
- ✅ useAddQualityCheck() - Add quality check
- ❌ usePrograms() - MISSING
- ❌ useUsers() - MISSING

---

### 4. **Server-Side Data Not Fetched** ❌

**Page Components Missing Data Fetching**:

#### `/production/new/page.tsx`
```tsx
// ❌ CURRENT (No data fetching)
export default async function CreateProductionPage() {
  return <ProductionForm /> // Empty!
}

// ✅ SHOULD BE
export default async function CreateProductionPage() {
  const programs = await fetchPrograms() // Fetch programs with menus
  const users = await fetchUsers() // Fetch users for chef selection
  
  return (
    <ProductionForm 
      programs={programs} 
      users={users}
    />
  )
}
```

#### `/production/[id]/edit/page.tsx`
```tsx
// ❌ CURRENT (No programs/users data)
export default async function EditProductionPage({ params }: PageProps) {
  const production = await fetchProduction(params.id)
  return <ProductionForm production={production} /> // Missing programs & users!
}

// ✅ SHOULD BE
export default async function EditProductionPage({ params }: PageProps) {
  const [production, programs, users] = await Promise.all([
    fetchProduction(params.id),
    fetchPrograms(),
    fetchUsers()
  ])
  
  return (
    <ProductionForm 
      production={production}
      programs={programs}
      users={users}
    />
  )
}
```

---

### 5. **Form Field Issues** ⚠️

**Empty Dropdowns** (Lines 306-467):

1. **Program Dropdown** (Line 306-323)
   ```tsx
   {/* ❌ Empty - no programs data */}
   <Select value={watchProgramId} onValueChange={(value) => form.setValue('programId', value)}>
     <SelectContent>
       {programs.map((program) => ( /* programs = [] empty! */
         <SelectItem key={program.id} value={program.id}>
           {program.name}
         </SelectItem>
       ))}
     </SelectContent>
   </Select>
   ```

2. **Menu Dropdown** (Line 325-342)
   ```tsx
   {/* ❌ Empty - availableMenus = [] */}
   {availableMenus.map((menu) => ( /* No menus! */
     <SelectItem key={menu.id} value={menu.id}>
       {menu.menuName}
     </SelectItem>
   ))}
   ```

3. **Head Cook Dropdown** (Line 418-433)
   ```tsx
   {/* ❌ No users data - hardcoded to "user-1" */}
   <SelectContent>
     <SelectItem value="user-1">Pilih kepala koki</SelectItem>
   </SelectContent>
   ```

4. **Assistant Cooks** (Line 435-450)
   ```tsx
   {/* ❌ Hardcoded - not functional */}
   <Badge variant="secondary">user-2</Badge>
   <Badge variant="secondary">user-3</Badge>
   ```

5. **Supervisor Dropdown** (Line 452-467)
   ```tsx
   {/* ❌ Empty dropdown */}
   <SelectContent>
     <SelectItem value="">Tidak ada</SelectItem>
   </SelectContent>
   ```

---

### 6. **Batch Number Generation** ⚠️ BROKEN

**Issue**: Auto-generation not working properly

**File**: `src/features/sppg/production/lib/index.ts`

```typescript
// Line 203-209: Generate batch on production date change
useEffect(() => {
  if (watchProductionDate && !isEdit) {
    const batchNumber = generateBatchNumber(new Date(watchProductionDate))
    form.setValue('batchNumber', batchNumber)
  }
}, [watchProductionDate, isEdit, form])
```

**Problem**: `generateBatchNumber` function exists but might not be called correctly due to date format issues.

---

### 7. **Missing User Interface Types** ⚠️

**ProductionForm needs User type for chef selection**:

```typescript
// ❌ NOT DEFINED
interface User {
  id: string
  name: string
  email: string
  userRole: string
}

// Form should accept
interface ProductionFormProps {
  production?: FoodProduction & { menu?: NutritionMenu; program?: NutritionProgram }
  programs?: Array<NutritionProgram & { menus?: NutritionMenu[] }>
  users?: User[] // ❌ MISSING!
  className?: string
  onSuccess?: () => void
}
```

---

### 8. **Edit Page Restrictions Not Enforced** ⚠️

**File**: `/production/[id]/edit/page.tsx`

**Issue**: Edit page checks if status is PLANNED but doesn't fetch programs/users data:

```tsx
// Line 35-40: Check edit permission
if (production.status !== 'PLANNED') {
  return (
    <Card className="border-destructive">
      {/* Warning banner */}
    </Card>
  )
}

// ❌ But still renders form without data
return <ProductionForm production={production} /> // Missing programs & users!
```

---

## 📊 Impact Summary

| Component | Status | Impact | Priority |
|-----------|--------|--------|----------|
| Program Dropdown | ❌ Empty | Cannot select program | 🔴 CRITICAL |
| Menu Dropdown | ❌ Empty | Cannot select menu | 🔴 CRITICAL |
| Head Cook Dropdown | ❌ Empty | Cannot assign chef | 🔴 CRITICAL |
| Assistant Cooks | ❌ Hardcoded | Not functional | 🟡 MEDIUM |
| Supervisor Dropdown | ❌ Empty | Optional field | 🟢 LOW |
| Cost Calculation | ❌ Broken | Depends on menu data | 🔴 CRITICAL |
| Batch Number | ⚠️ Partial | Generation works but unreliable | 🟡 MEDIUM |
| Form Validation | ⚠️ Limited | Missing data causes validation issues | 🔴 CRITICAL |

---

## 🔧 Required Fixes

### Priority 1: CRITICAL (Must Fix Now) 🔴

1. **Create Programs API**
   - `GET /api/sppg/programs` - List all programs with menus
   - Include: id, name, programType, menus[]
   - Filter by sppgId (multi-tenant)

2. **Create Users API**
   - `GET /api/sppg/users` - List users
   - `GET /api/sppg/users?role=SPPG_STAFF_DAPUR` - Filter by role
   - Include: id, name, email, userRole

3. **Add Data Fetching Hooks**
   - Create `usePrograms()` hook
   - Create `useUsers(role?)` hook
   - Export from production/hooks/index.ts

4. **Update Pages to Fetch Data**
   - Update `/production/new/page.tsx` to fetch programs & users
   - Update `/production/[id]/edit/page.tsx` to fetch programs & users
   - Pass data as props to ProductionForm

### Priority 2: HIGH (Fix Soon) 🟡

5. **Fix ProductionForm Props**
   - Add `users` prop to interface
   - Update User dropdowns to use real data
   - Remove hardcoded user values

6. **Improve Batch Number Generation**
   - Add manual override option
   - Show preview of generated batch number
   - Validate uniqueness

### Priority 3: MEDIUM (Enhancement) 🟢

7. **Add Form Helpers**
   - Add "Quick Fill" from previous production
   - Add cost preview before submit
   - Add portion size validator

8. **Improve UX**
   - Add loading states for dropdowns
   - Add "No data" messages
   - Add create program link if no programs exist

---

## 🎯 Recommended Action Plan

### Step 1: Create Programs API (30 minutes)
```bash
src/app/api/sppg/programs/
├── route.ts              # GET all programs with menus
└── [id]/route.ts         # GET single program
```

### Step 2: Create Users API (20 minutes)
```bash
src/app/api/sppg/users/
├── route.ts              # GET users with role filter
└── [id]/route.ts         # GET single user
```

### Step 3: Create Hooks (15 minutes)
```bash
src/features/sppg/production/hooks/
└── usePrograms.ts        # TanStack Query hook for programs
└── useUsers.ts           # TanStack Query hook for users
```

### Step 4: Update Pages (20 minutes)
- Fetch data in Server Components
- Pass to ProductionForm
- Add loading states

### Step 5: Update ProductionForm (15 minutes)
- Add users prop
- Update all dropdowns
- Remove hardcoded values

**Total Estimated Time**: ~2 hours

---

## ✅ Testing Checklist

After fixes, test:
- [ ] Program dropdown shows all programs
- [ ] Menu dropdown shows menus for selected program
- [ ] Head cook dropdown shows kitchen staff
- [ ] Assistant cooks can be selected
- [ ] Supervisor dropdown shows supervisors
- [ ] Cost calculation works when menu selected
- [ ] Batch number generates correctly
- [ ] Form validates all required fields
- [ ] Create production succeeds
- [ ] Edit production works (PLANNED status only)

---

## 📝 Additional Recommendations

1. **Add Form State Persistence**
   - Save draft to localStorage
   - Restore on page reload
   - Prevent data loss

2. **Add Validation Messages**
   - Show which fields are required
   - Explain validation rules
   - Guide user to fix errors

3. **Add Success Feedback**
   - Show success toast on create
   - Redirect to detail page
   - Highlight new production in list

4. **Add Error Handling**
   - Catch API errors gracefully
   - Show user-friendly error messages
   - Offer retry options

---

## 🎓 Lessons Learned

**Why This Happened**:
1. ✅ Created frontend components first (ProductionForm)
2. ✅ Created API routes for productions CRUD
3. ❌ Forgot to create API routes for related entities (Programs, Users)
4. ❌ Didn't test form with actual data
5. ❌ Pages don't fetch required data

**Prevention for Future**:
1. ✅ Always map form dependencies first
2. ✅ Create all required APIs before UI
3. ✅ Test forms with real data early
4. ✅ Document required props clearly
5. ✅ Use TypeScript to catch missing props

---

## 📌 Summary

**Status**: ❌ ProductionForm is NOT FUNCTIONAL

**Blockers**:
- No Programs API → Empty program dropdown
- No Users API → Empty chef dropdowns
- Pages don't fetch data → Props are empty

**Next Actions**:
1. Create Programs API (CRITICAL)
2. Create Users API (CRITICAL)
3. Add data fetching hooks (HIGH)
4. Update pages to fetch data (HIGH)
5. Update form to use real data (HIGH)

**Estimated Fix Time**: 2 hours  
**Priority**: 🔴 CRITICAL - Form unusable without these fixes

---

Would you like me to start implementing these fixes now?
