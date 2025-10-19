# 🚨 Distribution Domain - Comprehensive Audit Report

**Date**: October 18, 2025  
**Status**: ⚠️ Critical Issues Found  
**Priority**: 🔴 HIGH - Production Blocker  

---

## 📋 Executive Summary

Distribution domain memiliki masalah **critical** yang membuat form tidak bisa digunakan:
1. **Dropdown kosong** - Programs dan Users tidak dikirim ke form
2. **Data tidak lengkap** - Beberapa field tidak ter-populate
3. **Relasi tidak jelas** - Relationship dengan Production, Program, Menu tidak terlihat
4. **Missing API calls** - Page tidak fetch data yang diperlukan

---

## 🔍 Critical Issues Found

### **Issue 1: Dropdown Kosong - No Data Passed to Form** 🔴

#### **Problem**:
`DistributionForm` menerima props `programs` dan `users` tapi page yang memanggil **tidak mengirim data apapun**!

#### **Evidence**:

**Form Definition** (`DistributionForm.tsx` line 58-64):
```typescript
interface DistributionFormProps {
  distribution?: FoodDistribution
  programs?: Array<NutritionProgram & { menus?: NutritionMenu[] }>  // ← Expects programs
  users?: User[]  // ← Expects users
  className?: string
  onSuccess?: () => void
}
```

**Page Usage** (`/distribution/new/page.tsx` line 72):
```typescript
<DistributionForm />  
// ❌ NO PROPS! programs={} users={} MISSING!
```

#### **Impact**:
- ✅ Form renders
- ❌ Program dropdown **KOSONG** (line 342-353)
- ❌ Menu dropdown **KOSONG** (line 638-650)
- ❌ Distributor dropdown **KOSONG** (line 849-863)
- ❌ Driver dropdown **KOSONG** (line 877-891)
- ❌ User tidak bisa create distribution!

#### **Root Cause**:
Page component adalah **Server Component** tapi tidak melakukan fetch data. Form mengharapkan data di-inject via props.

---

### **Issue 2: Missing Relational Context** 🟡

#### **Problem**:
Form tidak menunjukkan dengan jelas bahwa distribution:
1. **Terkait dengan Production** - `productionId` field hidden
2. **Menggunakan Menu dari Program** - Menu dropdown tidak filtered by program
3. **Ditugaskan ke Staff** - Staff filtering tidak sesuai role

#### **Evidence**:

**Production Relationship** (`schema.prisma` line 3190):
```prisma
model FoodDistribution {
  productionId String?  // ← Optional link to production
  production   FoodProduction? @relation(fields: [productionId], references: [id])
}
```

**Form Implementation**:
- ❌ `productionId` field **TIDAK ADA** di form
- ❌ Tidak ada cara untuk link distribution ke production yang sudah ada
- ❌ User tidak tahu distribution ini terkait production mana

**Menu Filtering**:
```typescript
// Line 186: Menus filtered by selected program
const availableMenus = useMemo(() => {
  const program = programs.find(p => p.id === selectedProgramId)
  return program?.menus ?? []
}, [programs, selectedProgramId])
```
- ✅ Logic sudah benar
- ❌ Tapi `programs` prop kosong, jadi `availableMenus` selalu `[]`

**Staff Filtering** (line 852-858):
```typescript
{users
  .filter(u => u.userRole?.includes('STAFF'))  // ← Filter too broad
  .map((user) => (
    <SelectItem key={user.id} value={user.id}>
      {user.name}
    </SelectItem>
  ))}
```
- ⚠️ Filter hanya check string `'STAFF'`
- ⚠️ Tidak specific ke role `SPPG_STAFF_DISTRIBUSI`
- ⚠️ Mungkin menampilkan staff dari domain lain

---

### **Issue 3: Incomplete Field Population** 🟡

#### **Problem**:
Beberapa field tidak ter-populate dengan baik saat edit mode.

#### **Evidence**:

**Menu Items** (`menuItems` state):
```typescript
// Line 146: Default value saat edit
const [menuItems, setMenuItems] = useState<MenuItemInput[]>(
  distribution?.menuItems
    ? (distribution.menuItems as never as MenuItemInput[])
    : []
)
```
- ⚠️ `distribution.menuItems` adalah JSON
- ⚠️ Type casting `as never as` adalah **red flag**
- ⚠️ Tidak ada validation apakah structure JSON sesuai

**Volunteers** (line 113):
```typescript
volunteers: distribution?.volunteers ?? []
```
- ✅ Defaulting ke empty array
- ❌ Tapi form **TIDAK ADA INPUT** untuk volunteers
- ❌ Field `volunteers: String[]` di schema tidak ter-expose di UI

---

### **Issue 4: Missing Data Fetching** 🔴

#### **Problem**:
Page tidak fetch data yang diperlukan dari database.

#### **What's Missing**:

1. **Programs with Menus**:
```typescript
// SHOULD BE:
const programs = await db.nutritionProgram.findMany({
  where: { sppgId: session.user.sppgId },
  include: {
    menus: {
      where: { isActive: true },
      select: {
        id: true,
        menuName: true,
        menuCode: true,
        servingSize: true
      }
    }
  }
})
```

2. **Users (Staff)**:
```typescript
// SHOULD BE:
const users = await db.user.findMany({
  where: {
    sppgId: session.user.sppgId,
    userRole: {
      in: [
        'SPPG_STAFF_DISTRIBUSI',
        'SPPG_DISTRIBUSI_MANAGER',
        'SPPG_ADMIN'
      ]
    },
    isActive: true
  },
  select: {
    id: true,
    name: true,
    email: true,
    userRole: true
  }
})
```

3. **Productions (for linking)**:
```typescript
// SHOULD BE:
const productions = await db.foodProduction.findMany({
  where: {
    sppgId: session.user.sppgId,
    status: 'COMPLETED',  // Only completed productions can be distributed
    distributionDate: { gte: new Date() }
  },
  include: {
    menu: true,
    program: true
  }
})
```

---

## 📊 Schema Analysis

### **FoodDistribution Model Relationships**:

```prisma
model FoodDistribution {
  // Core Relations
  sppg         SPPG              @relation(...)       // ✅ Used (multi-tenant)
  program      NutritionProgram  @relation(...)       // ⚠️ Used but not clear
  production   FoodProduction?   @relation(...)       // ❌ NOT EXPOSED in form
  
  // Many-to-Many Relations (Implicit)
  menuItems    Json              // ⚠️ Should reference NutritionMenu[]
  
  // User References (String IDs)
  distributorId String            // ⚠️ Should be User relation
  driverId      String?           // ⚠️ Should be User relation
  volunteers    String[]          // ⚠️ Should be User[] relation
  
  // Feedback Relations
  beneficiaryFeedback BeneficiaryFeedback[]  // ✅ Defined
  feedback            Feedback[]              // ✅ Defined
}
```

### **Data Flow Problems**:

```
❌ CURRENT FLOW:
Page (no fetch) → Form (expects props) → Dropdowns (empty)

✅ SHOULD BE:
Page (fetch programs + users) → Form (receive props) → Dropdowns (populated)
```

---

## 🎯 Required Fixes

### **Fix 1: Add Data Fetching to Page** (Priority: 🔴 HIGH)

**File**: `src/app/(sppg)/distribution/new/page.tsx`

```typescript
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function NewDistributionPage() {
  // 1. Authentication
  const session = await auth()
  if (!session?.user?.sppgId) {
    redirect('/login')
  }

  // 2. Fetch Programs with Menus
  const programs = await db.nutritionProgram.findMany({
    where: {
      sppgId: session.user.sppgId,
      isActive: true
    },
    include: {
      menus: {
        where: { isActive: true },
        select: {
          id: true,
          menuName: true,
          menuCode: true,
          servingSize: true,
          mealType: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // 3. Fetch Staff Users
  const users = await db.user.findMany({
    where: {
      sppgId: session.user.sppgId,
      userRole: {
        in: [
          'SPPG_STAFF_DISTRIBUSI',
          'SPPG_DISTRIBUSI_MANAGER',
          'SPPG_ADMIN',
          'SPPG_KEPALA'
        ]
      },
      isActive: true
    },
    select: {
      id: true,
      name: true,
      email: true,
      userRole: true
    },
    orderBy: { name: 'asc' }
  })

  // 4. Fetch Available Productions (Optional - for linking)
  const productions = await db.foodProduction.findMany({
    where: {
      sppgId: session.user.sppgId,
      status: 'COMPLETED',
      // Production yang belum di-distribute atau bisa di-distribute lagi
    },
    include: {
      menu: {
        select: {
          id: true,
          menuName: true,
          mealType: true
        }
      },
      program: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: { productionDate: 'desc' },
    take: 50  // Limit recent productions
  })

  return (
    <div className="flex flex-col gap-6">
      {/* ... breadcrumb ... */}
      
      <DistributionForm 
        programs={programs}
        users={users}
        productions={productions}  // NEW: Add productions
      />
    </div>
  )
}
```

---

### **Fix 2: Add Production Linking to Form** (Priority: 🟡 MEDIUM)

**File**: `src/features/sppg/distribution/components/DistributionForm.tsx`

**Add to Props**:
```typescript
interface DistributionFormProps {
  distribution?: FoodDistribution
  programs?: Array<NutritionProgram & { menus?: NutritionMenu[] }>
  users?: User[]
  productions?: Array<FoodProduction & { menu: NutritionMenu, program: NutritionProgram }>  // NEW
  className?: string
  onSuccess?: () => void
}
```

**Add Production Selection Section** (After Program selection):
```typescript
{/* Link to Production (Optional) */}
<div className="space-y-2">
  <Label htmlFor="productionId">
    Link ke Produksi (Opsional)
  </Label>
  <Select
    value={form.watch('productionId') || undefined}
    onValueChange={(value) => {
      form.setValue('productionId', value)
      // Auto-populate menu from production
      const prod = productions?.find(p => p.id === value)
      if (prod) {
        form.setValue('programId', prod.programId)
        form.setValue('mealType', prod.menu.mealType)
      }
    }}
    disabled={!canEdit}
  >
    <SelectTrigger id="productionId">
      <SelectValue placeholder="Pilih produksi (optional)" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="">Tidak link ke produksi</SelectItem>
      {productions?.map((prod) => (
        <SelectItem key={prod.id} value={prod.id}>
          {prod.productionCode} - {prod.menu.menuName} ({prod.program.name})
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
  <p className="text-xs text-muted-foreground">
    Link distribusi ini dengan batch produksi yang sudah selesai
  </p>
</div>
```

---

### **Fix 3: Add Volunteers Input** (Priority: 🟢 LOW)

**File**: `src/features/sppg/distribution/components/DistributionForm.tsx`

**Add Volunteers Multi-Select** (After Driver selection):
```typescript
{/* Volunteers */}
<div className="space-y-2">
  <Label htmlFor="volunteers">Relawan (Opsional)</Label>
  <div className="space-y-2">
    {/* Multi-select checkboxes */}
    <div className="border rounded-md p-3 max-h-[200px] overflow-y-auto">
      {users
        .filter(u => 
          u.userRole?.includes('STAFF') || 
          u.userRole?.includes('VOLUNTEER')
        )
        .map((user) => (
          <div key={user.id} className="flex items-center space-x-2 py-1">
            <input
              type="checkbox"
              id={`volunteer-${user.id}`}
              checked={form.watch('volunteers')?.includes(user.id) ?? false}
              onChange={(e) => {
                const current = form.watch('volunteers') ?? []
                if (e.target.checked) {
                  form.setValue('volunteers', [...current, user.id])
                } else {
                  form.setValue('volunteers', current.filter(id => id !== user.id))
                }
              }}
              disabled={!canEdit}
              className="rounded"
            />
            <label htmlFor={`volunteer-${user.id}`} className="text-sm">
              {user.name} ({user.userRole})
            </label>
          </div>
        ))}
    </div>
    <p className="text-xs text-muted-foreground">
      Pilih relawan yang akan membantu distribusi
    </p>
  </div>
</div>
```

---

### **Fix 4: Improve Staff Filtering** (Priority: 🟡 MEDIUM)

**File**: `src/features/sppg/distribution/components/DistributionForm.tsx`

**Replace Current Filtering**:
```typescript
// ❌ OLD: Too broad
{users
  .filter(u => u.userRole?.includes('STAFF'))
  .map(...)}

// ✅ NEW: Specific roles
{users
  .filter(u => {
    const role = u.userRole as UserRole
    return [
      'SPPG_STAFF_DISTRIBUSI',
      'SPPG_DISTRIBUSI_MANAGER',
      'SPPG_ADMIN',
      'SPPG_KEPALA'
    ].includes(role)
  })
  .map(...)}
```

---

### **Fix 5: Validate Menu Items JSON Structure** (Priority: 🟡 MEDIUM)

**File**: `src/features/sppg/distribution/schemas/distributionSchema.ts`

**Add Zod Schema for Menu Items**:
```typescript
import { z } from 'zod'

// Menu item schema
const menuItemSchema = z.object({
  menuId: z.string().cuid(),
  menuName: z.string().min(1),
  portions: z.number().int().min(1),
  portionSize: z.number().min(1),
  totalWeight: z.number().min(0)
})

// Update distribution schema
export const distributionCreateSchema = z.object({
  // ... existing fields ...
  
  menuItems: z.array(menuItemSchema).min(1, {
    message: 'Minimal 1 menu item harus ditambahkan'
  }),
  
  // Validate volunteers as array of cuid
  volunteers: z.array(z.string().cuid()).optional().default([])
})
```

---

## 🧪 Testing Checklist

After implementing fixes, verify:

### **Data Fetching**:
- [ ] Programs loaded on page (check React DevTools)
- [ ] Users loaded on page
- [ ] Productions loaded on page (if implemented)
- [ ] No console errors on page load

### **Dropdowns**:
- [ ] Program dropdown shows all active programs
- [ ] Menu dropdown shows menus from selected program
- [ ] Distributor dropdown shows staff with correct roles
- [ ] Driver dropdown shows staff with correct roles
- [ ] Production dropdown shows completed productions (if implemented)

### **Form Submission**:
- [ ] Can select program
- [ ] Can add menu items
- [ ] Can select distributor
- [ ] Can optionally select driver
- [ ] Can optionally select volunteers (if implemented)
- [ ] Form validates before submit
- [ ] Success redirect works

### **Data Relationships**:
- [ ] Distribution created with correct `programId`
- [ ] Distribution created with correct `menuItems` JSON
- [ ] Distribution created with correct `distributorId`
- [ ] Distribution linked to production if selected (if implemented)
- [ ] All multi-tenant `sppgId` checks work

---

## 📋 Priority Summary

| Priority | Issue | Impact | Effort |
|----------|-------|--------|--------|
| 🔴 HIGH | No data fetching in page | Form unusable | 2 hours |
| 🔴 HIGH | Empty dropdowns | Cannot create distribution | 1 hour |
| 🟡 MEDIUM | Missing production link | Reduced traceability | 3 hours |
| 🟡 MEDIUM | Staff filtering too broad | Wrong users shown | 1 hour |
| 🟡 MEDIUM | Menu items validation | Data integrity risk | 2 hours |
| 🟢 LOW | No volunteers input | Missing feature | 2 hours |

**Total Estimated Effort**: ~11 hours

---

## ✅ Success Criteria

Distribution domain is considered **production-ready** when:

1. ✅ Programs dropdown populates with data
2. ✅ Menu dropdown shows menus from selected program
3. ✅ Staff dropdowns show only relevant users
4. ✅ Can successfully create distribution with all required fields
5. ✅ Distribution properly linked to program and menu
6. ✅ Optional production linking works (if implemented)
7. ✅ Volunteers can be selected (if implemented)
8. ✅ All validations pass
9. ✅ Multi-tenant filtering works correctly
10. ✅ No TypeScript errors

---

## 🔄 Next Steps

1. **Immediate** (30 mins):
   - Add data fetching to `/distribution/new/page.tsx`
   - Pass props to `DistributionForm`
   - Test dropdowns populate

2. **Short-term** (2-3 hours):
   - Add production linking
   - Improve staff filtering
   - Add menu items validation

3. **Medium-term** (2-3 hours):
   - Add volunteers input
   - Add edit page fixes
   - Add list page data display improvements

4. **Follow-up**:
   - Similar audit for other domains (Production, Inventory)
   - Standardize data fetching patterns across all pages
   - Create reusable dropdown components

---

**Report Generated**: October 18, 2025  
**Author**: AI Development Assistant  
**Status**: 🔴 CRITICAL - Immediate action required
