# SPPG Form Component - Complete Design Specification

**Date**: October 25, 2025  
**Module**: Admin Platform - SPPG Management  
**Responsible**: AI Development Team  
**Review Status**: ⚠️ CRITICAL - Must be reviewed before implementation

---

## 📋 Executive Summary

This document provides the **complete technical specification** for the `SppgForm` component - a reusable, enterprise-grade form component for creating and editing SPPG entities in the Bagizi-ID admin platform.

### Why This Document Exists

The previous attempt to create this component **failed** because:
1. ❌ No proper planning or design phase
2. ❌ Attempted "simple approach" (shortcuts) instead of enterprise patterns
3. ❌ TypeScript type errors due to incomplete understanding of data flow
4. ❌ Did not verify existing hooks/APIs before implementation
5. ❌ No documentation of technical decisions

This specification ensures **proper planning before execution**.

---

## 🎯 Component Requirements

### Functional Requirements

1. **Dual Mode Operation**
   - `mode='create'`: Empty form with default values
   - `mode='edit'`: Pre-filled form with existing data

2. **Complete Field Coverage**
   - All 48 fields from Prisma SPPG model
   - NO additional fields (no website, socialMedia, etc.)
   - Proper validation for each field

3. **Regional Cascading**
   - Province → Regency → District → Village
   - Dynamic loading based on selection
   - Proper loading states

4. **Conditional Logic**
   - Demo settings visible only if `isDemoAccount = true`
   - Proper date range validations
   - Budget calculations

5. **Form Validation**
   - Zod schema validation (createSppgSchema)
   - Real-time field validation
   - Clear error messages

6. **User Experience**
   - Loading skeletons for edit mode
   - Toast notifications for success/error
   - Responsive layout (mobile-first)
   - Proper form sections with icons

---

## 📊 Data Flow Architecture

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     SppgForm Component                   │
│                                                          │
│  Props:                                                  │
│  - mode: 'create' | 'edit'                              │
│  - sppgId?: string                                       │
│  - initialData?: SppgDetail                             │
│  - isLoading?: boolean                                   │
└────────────────┬────────────────────────────────────────┘
                 │
                 ├─ CREATE MODE ──────────────────────────┐
                 │                                         │
                 │  useForm({                             │
                 │    resolver: zodResolver(createSppgSchema),
                 │    defaultValues: { ...emptyDefaults } │
                 │  })                                     │
                 │                                         │
                 │  onSubmit(data) ─────────────────────► │
                 │    createSppg(data) ──► API POST /api/admin/sppg
                 │    ↓                                    │
                 │    toast.success()                     │
                 │    router.push(`/admin/sppg/${id}`)   │
                 │                                         │
                 └─────────────────────────────────────────┘
                 │
                 ├─ EDIT MODE ────────────────────────────┐
                 │                                         │
                 │  useForm({                             │
                 │    resolver: zodResolver(createSppgSchema), // SAME!
                 │    values: {                            │
                 │      code: initialData.code,           │
                 │      provinceId: initialData.province.id, // NOTE: .id!
                 │      ...                                │
                 │    }                                    │
                 │  })                                     │
                 │                                         │
                 │  onSubmit(data) ─────────────────────► │
                 │    updateSppg({ id: sppgId, data }) ──► API PUT /api/admin/sppg/[id]
                 │    ↓                                    │
                 │    toast.success()                     │
                 │    router.push(`/admin/sppg/${id}`)   │
                 │                                         │
                 └─────────────────────────────────────────┘
```

### Type System Flow

```typescript
// Zod Schema (Source of Truth)
createSppgSchema: z.object({ ... })
  ↓
// Inferred TypeScript Type
type CreateSppgInput = z.infer<typeof createSppgSchema>
  ↓
// React Hook Form
useForm<CreateSppgInput>({ 
  resolver: zodResolver(createSppgSchema),
  values: {...} // Must match CreateSppgInput EXACTLY
})
  ↓
// Form Submission
onSubmit(data: CreateSppgInput)
  ↓
// API Client
createSppg(data: CreateSppgInput) → API
updateSppg({ id, data: Partial<CreateSppgInput> }) → API
```

---

## 🗂️ Complete Field Mapping

### Field Inventory (48 Core Fields from Prisma)

#### 1. Basic Information (6 fields)
| Field | Type | Required | Nullable | Zod Validation |
|-------|------|----------|----------|----------------|
| `code` | `string` | ✅ | ❌ | `/^[A-Z0-9-]+$/`, min: 3, max: 20 |
| `name` | `string` | ✅ | ❌ | min: 3, max: 255 |
| `description` | `string` | ❌ | ✅ | optional() |
| `organizationType` | `enum` | ✅ | ❌ | nativeEnum(OrganizationType) |
| `establishedYear` | `number` | ❌ | ✅ | int, min: 1900, max: current year |
| `targetRecipients` | `number` | ✅ | ❌ | int, min: 1, max: 1,000,000 |

#### 2. Location Information (8 fields)
| Field | Type | Required | Nullable | Cascading | Zod Validation |
|-------|------|----------|----------|-----------|----------------|
| `addressDetail` | `string` | ✅ | ❌ | - | min: 10, max: 500 |
| `provinceId` | `string` | ✅ | ❌ | Level 1 | min: 1 |
| `regencyId` | `string` | ✅ | ❌ | Level 2 | min: 1, depends on province |
| `districtId` | `string` | ✅ | ❌ | Level 3 | min: 1, depends on regency |
| `villageId` | `string` | ✅ | ❌ | Level 4 | min: 1, depends on district |
| `postalCode` | `string` | ❌ | ✅ | - | `/^\d{5}$/` |
| `coordinates` | `string` | ❌ | ✅ | - | `/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/` |
| `timezone` | `enum` | ✅ | ❌ | - | nativeEnum(Timezone) |

#### 3. Contact Information (2 fields)
| Field | Type | Required | Nullable | Zod Validation |
|-------|------|----------|----------|----------------|
| `phone` | `string` | ✅ | ❌ | `/^(\+62\|62\|0)[0-9]{9,13}$/` |
| `email` | `string` | ✅ | ❌ | email(), toLowerCase() |

#### 4. PIC Information (5 fields)
| Field | Type | Required | Nullable | Zod Validation |
|-------|------|----------|----------|----------------|
| `picName` | `string` | ✅ | ❌ | min: 3, max: 255 |
| `picPosition` | `string` | ✅ | ❌ | min: 2, max: 150 |
| `picEmail` | `string` | ✅ | ❌ | email(), toLowerCase() |
| `picPhone` | `string` | ✅ | ❌ | `/^(\+62\|62\|0)[0-9]{9,13}$/` |
| `picWhatsapp` | `string` | ❌ | ✅ | `/^(\+62\|62\|0)[0-9]{9,13}$/` |

#### 5. Operations (4 fields)
| Field | Type | Required | Nullable | Zod Validation |
|-------|------|----------|----------|----------------|
| `maxRadius` | `number` | ✅ | ❌ | min: 0, max: 500 |
| `maxTravelTime` | `number` | ✅ | ❌ | int, min: 0, max: 1440 |
| `operationStartDate` | `Date` | ✅ | ❌ | coerce.date() |
| `operationEndDate` | `Date` | ❌ | ✅ | coerce.date(), must be after start |

#### 6. Budget (5 fields)
| Field | Type | Required | Nullable | Zod Validation |
|-------|------|----------|----------|----------------|
| `monthlyBudget` | `number` | ❌ | ✅ | min: 0, max: 10,000,000,000 |
| `yearlyBudget` | `number` | ❌ | ✅ | min: 0, max: 120,000,000,000 |
| `budgetCurrency` | `string` | ❌ | ❌ | default: 'IDR' |
| `budgetStartDate` | `Date` | ❌ | ✅ | coerce.date() |
| `budgetEndDate` | `Date` | ❌ | ✅ | coerce.date(), must be after start |

#### 7. Demo Settings (4 fields)
| Field | Type | Required | Nullable | Conditional | Zod Validation |
|-------|------|----------|----------|-------------|----------------|
| `isDemoAccount` | `boolean` | ❌ | ❌ | - | default: false |
| `demoExpiresAt` | `Date` | ❌ | ✅ | Required if isDemoAccount | coerce.date() |
| `demoMaxBeneficiaries` | `number` | ❌ | ✅ | Only if isDemoAccount | int, min: 1, max: 1000 |
| `demoAllowedFeatures` | `string[]` | ❌ | ❌ | Only if isDemoAccount | array, default: [] |

#### 8. Status (1 field)
| Field | Type | Required | Nullable | Zod Validation |
|-------|------|----------|----------|----------------|
| `status` | `enum` | ❌ | ❌ | nativeEnum(SppgStatus), default: 'ACTIVE' |

**TOTAL: 35 fields** (48 Prisma fields - 13 auto-generated/relations)

---

## 🎨 UI/UX Design

### Form Section Structure

```
┌─────────────────────────────────────────────────────┐
│ Header                                               │
│ ← Back | Title: "Buat SPPG Baru" / "Edit SPPG"     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ 📋 1. INFORMASI DASAR                                │
│ ├─ code (Input - disabled on edit)                  │
│ ├─ name (Input)                                      │
│ ├─ description (Textarea)                            │
│ ├─ organizationType (Select dropdown)                │
│ ├─ establishedYear (Input number)                    │
│ └─ targetRecipients (Input number)                   │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ 📍 2. INFORMASI LOKASI                               │
│ ├─ addressDetail (Textarea)                          │
│ ├─ provinceId (Select - loads from API)             │
│ ├─ regencyId (Select - cascading)                    │
│ ├─ districtId (Select - cascading)                   │
│ ├─ villageId (Select - cascading)                    │
│ ├─ postalCode (Input)                                │
│ ├─ coordinates (Input - format: lat,lng)            │
│ └─ timezone (Select dropdown)                        │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ 📞 3. INFORMASI KONTAK                               │
│ ├─ phone (Input - format: +62xxx)                   │
│ └─ email (Input - email format)                      │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ 👤 4. PENANGGUNG JAWAB (PIC)                         │
│ ├─ picName (Input)                                   │
│ ├─ picPosition (Input)                               │
│ ├─ picEmail (Input)                                  │
│ ├─ picPhone (Input)                                  │
│ └─ picWhatsapp (Input - optional)                    │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ 🚚 5. OPERASIONAL                                    │
│ ├─ maxRadius (Input number + km)                    │
│ ├─ maxTravelTime (Input number + menit)             │
│ ├─ operationStartDate (DatePicker)                  │
│ └─ operationEndDate (DatePicker - optional)          │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ 💰 6. ANGGARAN                                       │
│ ├─ monthlyBudget (Input number - IDR)               │
│ ├─ yearlyBudget (Input number - IDR)                │
│ ├─ budgetCurrency (Input - default: IDR)            │
│ ├─ budgetStartDate (DatePicker)                     │
│ └─ budgetEndDate (DatePicker - optional)             │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ 🎭 7. PENGATURAN DEMO                                │
│ ├─ isDemoAccount (Checkbox)                         │
│ └─ IF isDemoAccount:                                 │
│     ├─ demoExpiresAt (DatePicker - required!)       │
│     ├─ demoMaxBeneficiaries (Input number)           │
│     └─ demoAllowedFeatures (Multi-select)            │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ ⚙️ 8. STATUS                                         │
│ └─ status (Select dropdown)                          │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Actions: [← Kembali] [Reset] [Simpan ✓]            │
└─────────────────────────────────────────────────────┘
```

### Responsive Breakpoints

- **Mobile** (`< 768px`): 1 column, full width
- **Tablet** (`768px - 1024px`): 2 columns for grouped fields
- **Desktop** (`> 1024px`): 3 columns for related fields (e.g., PIC section)

---

## 🔗 Integration Points

### Regional API Hooks (Already Exist!)

```typescript
// Location: src/features/sppg/school/hooks/useRegional.ts

import { 
  useProvinces,          // () => Province[]
  useRegencies,          // (provinceId) => Regency[]
  useDistricts,          // (regencyId) => District[]
  useVillagesByDistrict  // (districtId) => Village[]
} from '@/features/sppg/school/hooks'

// Usage in SppgForm:
const { data: provinces, isLoading: provincesLoading } = useProvinces()

const provinceId = form.watch('provinceId')
const { data: regencies, isLoading: regenciesLoading } = useRegencies(provinceId, {
  enabled: !!provinceId
})

const regencyId = form.watch('regencyId')
const { data: districts, isLoading: districtsLoading } = useDistricts(regencyId, {
  enabled: !!regencyId
})

const districtId = form.watch('districtId')
const { data: villages, isLoading: villagesLoading } = useVillagesByDistrict(districtId, {
  enabled: !!districtId
})
```

### CRUD Hooks (Already Exist!)

```typescript
// Location: src/features/admin/sppg-management/hooks/useSppg.ts

import { useCreateSppg, useUpdateSppg } from '../hooks'

// Create
const { mutate: createSppg, isPending: isCreating } = useCreateSppg()
createSppg(data, {
  onSuccess: (response) => {
    toast.success('SPPG berhasil dibuat')
    router.push(`/admin/sppg/${response.id}`) // NOTE: response.id NOT response.data.id!
  }
})

// Update  
const { mutate: updateSppg, isPending: isUpdating } = useUpdateSppg()
updateSppg(
  { id: sppgId, data }, // NOTE: { id, data } structure!
  {
    onSuccess: () => {
      toast.success('SPPG berhasil diperbarui')
      router.push(`/admin/sppg/${sppgId}`)
    }
  }
)
```

### Type Mapping for Edit Mode

```typescript
// CRITICAL: SppgDetail uses relations, CreateSppgInput uses IDs!

// ❌ WRONG:
provinceId: initialData.provinceId // DOES NOT EXIST!

// ✅ CORRECT:
provinceId: initialData.province.id // Use relation's .id
regencyId: initialData.regency.id
districtId: initialData.district.id
villageId: initialData.village.id
```

---

## ⚠️ Critical Decisions & Trade-offs

### Decision 1: Single Schema for Both Modes

**Decision**: Use `createSppgSchema` for both create and edit modes (not separate updateSppgSchema).

**Rationale**:
- React Hook Form type inference works better with single schema
- `updateSppgSchema` is `createSppgSchema.partial()` which causes type issues
- Validation rules are same for both modes
- Simplifies component logic

**Implementation**:
```typescript
const form = useForm<CreateSppgInput>({
  resolver: zodResolver(createSppgSchema), // ALWAYS createSppgSchema
  values: mode === 'edit' ? mapInitialData(initialData) : defaultValues
})
```

### Decision 2: Date Handling

**Decision**: Use `string | Date` in form, `z.coerce.date()` in schema.

**Rationale**:
- DatePicker components return strings
- Zod coerces to Date automatically
- API accepts ISO strings
- No manual conversion needed

### Decision 3: Nullable vs Undefined

**Decision**: Use `undefined` for optional fields, NOT `null`.

**Rationale**:
- Zod `.optional()` produces `T | undefined`
- React Hook Form expects `undefined` for unset fields
- `.nullable()` produces `T | null` which conflicts with form state

**Mapping**:
```typescript
// ❌ WRONG:
description: initialData.description || null

// ✅ CORRECT:
description: initialData.description || undefined
```

### Decision 4: Loading States

**Decision**: Show skeleton UI for entire form during edit data loading, not per-field.

**Rationale**:
- Better UX (no flickering fields)
- Prevents partial form submissions
- Clearer loading indication
- Follows enterprise patterns

---

## 🧪 Testing Strategy

### Unit Testing Checklist

- [ ] Form renders in create mode with defaults
- [ ] Form renders in edit mode with pre-filled data
- [ ] All 35 fields display correctly
- [ ] Validation errors show for invalid inputs
- [ ] Regional cascading works (province → regency → district → village)
- [ ] Demo fields toggle based on isDemoAccount
- [ ] Date range validation works (end > start)
- [ ] Submit handlers called with correct data
- [ ] Loading skeleton shows during data fetch
- [ ] Error toasts appear on API failures

### Integration Testing Checklist

- [ ] Create new SPPG → Success → Redirect to detail
- [ ] Edit existing SPPG → Pre-fill correct → Save → Update
- [ ] Invalid data → Show validation errors → Prevent submit
- [ ] Network error → Show error toast → Form stays open
- [ ] Cancel button → Redirect without saving
- [ ] Reset button → Clear form to defaults

---

## 📐 Implementation Checklist

### Phase 1: Component Structure
- [ ] Create SppgForm.tsx with proper JSDoc
- [ ] Define TypeScript interfaces for props
- [ ] Set up React Hook Form with Zod resolver
- [ ] Create loading skeleton component

### Phase 2: Basic Fields (15 fields)
- [ ] Section 1: Basic Information (6 fields)
- [ ] Section 3: Contact Information (2 fields)
- [ ] Section 4: PIC Information (5 fields)
- [ ] Section 8: Status (1 field)
- [ ] Add section headers with icons

### Phase 3: Regional Fields (8 fields)
- [ ] Section 2: Location Information
- [ ] Integrate useProvinces hook
- [ ] Integrate useRegencies with cascading
- [ ] Integrate useDistricts with cascading
- [ ] Integrate useVillages with cascading
- [ ] Add loading states for each dropdown

### Phase 4: Complex Fields (12 fields)
- [ ] Section 5: Operations (4 fields with date pickers)
- [ ] Section 6: Budget (5 fields with number formatting)
- [ ] Section 7: Demo Settings (4 fields with conditional display)

### Phase 5: Form Logic
- [ ] Implement submit handler for create mode
- [ ] Implement submit handler for edit mode
- [ ] Add form reset functionality
- [ ] Add cancel/back navigation
- [ ] Add success/error toasts

### Phase 6: Validation & UX
- [ ] Test all Zod validations
- [ ] Add custom validation messages
- [ ] Implement date range validations
- [ ] Add conditional demo field validation
- [ ] Test responsive layout

### Phase 7: Export & Integration
- [ ] Export from components/index.ts
- [ ] Create edit page using SppgForm
- [ ] Refactor create page to use SppgForm
- [ ] End-to-end testing

---

## 📊 Estimated Effort

| Phase | Lines of Code | Estimated Time |
|-------|---------------|----------------|
| 1. Component Structure | ~100 | 30 min |
| 2. Basic Fields | ~200 | 1 hour |
| 3. Regional Fields | ~150 | 1.5 hours |
| 4. Complex Fields | ~200 | 1.5 hours |
| 5. Form Logic | ~150 | 1 hour |
| 6. Validation & UX | ~100 | 1 hour |
| 7. Export & Integration | ~50 | 30 min |
| **TOTAL** | **~950 lines** | **7 hours** |

---

## ✅ Acceptance Criteria

### Code Quality
- ✅ TypeScript strict mode (no `any` types)
- ✅ All fields validated with Zod schema
- ✅ Proper JSDoc documentation
- ✅ No console errors or warnings
- ✅ Follows enterprise patterns from copilot instructions

### Functionality
- ✅ All 35 fields working correctly
- ✅ Regional cascading functional
- ✅ Conditional demo fields working
- ✅ Date validations working
- ✅ Create and edit modes functional
- ✅ Proper error handling

### User Experience
- ✅ Loading states for all async operations
- ✅ Clear error messages
- ✅ Success/error toast notifications
- ✅ Responsive on mobile, tablet, desktop
- ✅ Accessible (keyboard navigation, ARIA labels)

### Integration
- ✅ Exported from feature module
- ✅ Used in create page (< 100 lines)
- ✅ Used in edit page (< 100 lines)
- ✅ No inline forms in pages

---

## 🚀 Next Steps

1. **Review this specification** with team/user
2. **Approve technical decisions** before implementation
3. **Begin Phase 1** implementation
4. **Regular checkpoints** after each phase
5. **Final testing** before deployment

---

## 📝 Notes

- This component is **CRITICAL** for admin platform functionality
- NO shortcuts or "simple approaches" allowed
- Follow enterprise patterns strictly
- Document all deviations from this spec
- Regular code reviews required

---

**Specification Prepared By**: AI Development Team  
**Review Required By**: Project Lead  
**Implementation Start**: After approval  
**Estimated Completion**: 7 working hours post-approval
