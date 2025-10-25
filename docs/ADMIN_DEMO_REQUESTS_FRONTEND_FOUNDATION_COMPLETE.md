# 🎨 Admin Demo Requests - Frontend Foundation Complete

**Status**: ✅ **FOUNDATION READY**  
**Date**: January 2025  
**Layer**: Admin Platform Module - Frontend  
**Architecture**: Enterprise Feature-Based Modular Architecture

---

## 📊 Implementation Summary

### **✅ COMPLETED: Frontend Foundation**

**Structure Created**:
```
src/features/admin/demo-requests/
├── types/
│   └── demo-request.types.ts     ✅ Complete TypeScript definitions
├── schemas/
│   └── demo-request.schema.ts    ✅ Zod validation schemas
├── api/
│   └── demoRequestApi.ts         ✅ Centralized API client with SSR support
├── hooks/
│   └── useDemoRequests.ts        ✅ TanStack Query hooks (10 hooks)
└── index.ts                      ✅ Export barrel
```

---

## 📁 Files Created

### **1. Types & Interfaces** ✅

**File**: `types/demo-request.types.ts` (220 lines)

**Exports**:
```typescript
// Core Types
- DemoRequestWithRelations         // Full demo request with relations
- DemoRequestListItem              // Optimized for tables
- DemoRequestFormInput             // Create/update form data
- DemoRequestFilters               // Query filters
- DemoRequestAnalytics             // Analytics dashboard data

// Action Input Types
- DemoRequestApprovalInput         // Approval workflow
- DemoRequestRejectionInput        // Rejection workflow
- DemoRequestAssignmentInput       // Assignment workflow
- DemoRequestConversionInput       // Conversion workflow

// API Response
- ApiResponse<T>                   // Standardized response wrapper

// Constants
- DEMO_REQUEST_STATUS_VARIANTS     // Badge color variants
- ORGANIZATION_TYPE_LABELS         // Human-readable labels
- DEMO_TYPE_LABELS                 // Demo type labels
- DEMO_REQUEST_STATUS_LABELS       // Status labels
```

**Key Features**:
- ✅ Based on actual Prisma schema
- ✅ Includes all relations (demoSppg, productionSppg)
- ✅ Optimized list vs detail types
- ✅ Complete enum mappings for UI

---

### **2. Zod Validation Schemas** ✅

**File**: `schemas/demo-request.schema.ts` (210 lines)

**Exports**:
```typescript
// Main Schemas
- demoRequestFormSchema            // Create/update validation
- demoRequestFiltersSchema         // Query filters validation
- demoRequestApprovalSchema        // Approval validation
- demoRequestRejectionSchema       // Rejection validation
- demoRequestAssignmentSchema      // Assignment validation
- demoRequestConversionSchema      // Conversion validation

// Type Inference
- DemoRequestFormInput             // Inferred from formSchema
- DemoRequestFilters               // Inferred from filtersSchema
- DemoRequestApprovalInput         // Inferred from approvalSchema
- DemoRequestRejectionInput        // Inferred from rejectionSchema
- DemoRequestAssignmentInput       // Inferred from assignmentSchema
- DemoRequestConversionInput       // Inferred from conversionSchema

// Helpers
- parseDemoRequestForm()           // Safe parse with error handling
- parseDemoRequestFilters()        // Safe parse filters
```

**Validation Rules**:
```typescript
// Contact Information
- organizationName: 3-200 chars required
- picName: 3-100 chars required
- picEmail: valid email required
- picPhone: 10-15 digits, format validation
- picWhatsapp: optional, 10-15 digits

// Organization
- organizationType: enum (PEMERINTAH, SWASTA, YAYASAN, KOMUNITAS, LAINNYA)
- targetBeneficiaries: 1-100,000 optional
- currentChallenges: array of strings
- expectedGoals: array of strings

// Demo Details
- demoType: enum (STANDARD, EXTENDED, GUIDED, SELF_SERVICE)
- estimatedDuration: 7-90 days, default 14
- demoDuration: 30-240 minutes, default 60
- demoMode: ONLINE | OFFLINE | HYBRID
- preferredTime: MORNING | AFTERNOON | EVENING | FLEXIBLE

// Rejection
- rejectionReason: 10-1000 chars required
```

---

### **3. Centralized API Client** ✅

**File**: `api/demoRequestApi.ts` (280 lines)

**Methods** (10 endpoints):
```typescript
1. getAll(filters?, headers?)         // GET /api/admin/demo-requests
2. getById(id, headers?)               // GET /api/admin/demo-requests/[id]
3. create(data, headers?)              // POST /api/admin/demo-requests
4. update(id, data, headers?)          // PUT /api/admin/demo-requests/[id]
5. delete(id, headers?)                // DELETE /api/admin/demo-requests/[id]
6. approve(id, data?, headers?)        // POST /api/admin/demo-requests/[id]/approve
7. reject(id, data, headers?)          // POST /api/admin/demo-requests/[id]/reject
8. assign(id, data, headers?)          // POST /api/admin/demo-requests/[id]/assign
9. convert(id, data, headers?)         // POST /api/admin/demo-requests/[id]/convert
10. getAnalytics(start?, end?, headers?) // GET /api/admin/demo-requests/analytics
```

**Enterprise Features**:
- ✅ **SSR Support**: All methods accept optional `headers` parameter
- ✅ **Base URL Management**: Uses `getBaseUrl()` from api-utils
- ✅ **Fetch Options**: Uses `getFetchOptions()` for consistent configuration
- ✅ **Error Handling**: Proper error parsing and throwing
- ✅ **Type Safety**: Full TypeScript coverage with generics
- ✅ **Query Building**: URLSearchParams for filters

**Usage Example**:
```typescript
// Client-side
const result = await demoRequestApi.getAll({ status: 'SUBMITTED' })

// Server-side (SSR/RSC)
import { headers } from 'next/headers'
const result = await demoRequestApi.getAll(undefined, headers())
```

---

### **4. TanStack Query Hooks** ✅

**File**: `hooks/useDemoRequests.ts` (310 lines)

**Query Hooks** (3 hooks):
```typescript
1. useDemoRequests(filters?)          // List with filters
2. useDemoRequest(id)                 // Single detail
3. useDemoRequestAnalytics(start?, end?) // Analytics data
```

**Mutation Hooks** (7 hooks):
```typescript
4. useCreateDemoRequest()             // Create new
5. useUpdateDemoRequest()             // Update existing
6. useDeleteDemoRequest()             // Soft delete
7. useApproveDemoRequest()            // Approve workflow
8. useRejectDemoRequest()             // Reject workflow
9. useAssignDemoRequest()             // Assign to user
10. useConvertDemoRequest()           // Convert to SPPG
```

**Query Keys Structure**:
```typescript
export const DEMO_REQUEST_KEYS = {
  all: ['admin', 'demo-requests'],
  lists: () => [...DEMO_REQUEST_KEYS.all, 'list'],
  list: (filters?) => [...DEMO_REQUEST_KEYS.lists(), filters],
  details: () => [...DEMO_REQUEST_KEYS.all, 'detail'],
  detail: (id) => [...DEMO_REQUEST_KEYS.details(), id],
  analytics: () => [...DEMO_REQUEST_KEYS.all, 'analytics'],
}
```

**Features**:
- ✅ **Automatic Cache Invalidation**: Smart query invalidation on mutations
- ✅ **Optimistic Updates**: Cache updates before server confirmation
- ✅ **Error Handling**: Toast notifications with sonner
- ✅ **Success Feedback**: User-friendly success messages
- ✅ **Stale Time**: 5 minutes for lists/details, 10 minutes for analytics
- ✅ **Type Safety**: Full TypeScript with proper generics

**Usage Example**:
```typescript
// In component
function DemoRequestsPage() {
  const { data, isLoading, error } = useDemoRequests({ status: 'SUBMITTED' })
  const createMutation = useCreateDemoRequest()
  
  const handleCreate = (formData: DemoRequestFormInput) => {
    createMutation.mutate(formData)
  }
  
  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />
  
  return <DemoRequestTable data={data} />
}
```

---

### **5. Export Barrel** ✅

**File**: `index.ts`

**Clean Exports**:
```typescript
// No naming conflicts
// Types from types.ts
// Schema validators from schemas.ts (not inferred types)
// API client methods
// All hooks
```

---

## 🎯 What's Ready

### **✅ Complete Foundation**
1. **Type System**: All TypeScript interfaces and types
2. **Validation**: Zod schemas with comprehensive rules
3. **API Layer**: Centralized API client with 10 endpoints
4. **Data Layer**: TanStack Query hooks with cache management
5. **Export Structure**: Clean barrel exports

### **Ready for UI Development**
Components can now be built using:
- `useDemoRequests()` - for lists
- `useDemoRequest(id)` - for details
- `useCreateDemoRequest()` - for forms
- `useApproveDemoRequest()` - for actions
- All types and schemas for validation

---

## 📊 Next Steps: UI Components

### **Recommended Component Structure**

```
src/features/admin/demo-requests/
└── components/
    ├── DemoRequestTable.tsx          // shadcn/ui DataTable
    ├── DemoRequestCard.tsx           // Card display
    ├── DemoRequestForm.tsx           // Create/Edit form (React Hook Form + Zod)
    ├── DemoRequestFilters.tsx        // Filter sidebar
    ├── DemoRequestStatusBadge.tsx    // Status indicator
    ├── DemoRequestActions.tsx        // Action dropdown (approve, reject, assign)
    ├── DemoRequestDetailSheet.tsx    // Detail sheet (shadcn/ui Sheet)
    ├── DemoRequestAnalyticsDashboard.tsx // Analytics dashboard
    ├── dialogs/
    │   ├── ApproveDialog.tsx         // Approval confirmation
    │   ├── RejectDialog.tsx          // Rejection with reason
    │   ├── AssignDialog.tsx          // Assignment selection
    │   └── ConvertDialog.tsx         // Conversion confirmation
    └── index.ts
```

### **Page Structure**

```
src/app/(admin)/
└── admin/
    └── demo-requests/
        ├── page.tsx                  // List view
        ├── [id]/
        │   └── page.tsx              // Detail view
        ├── new/
        │   └── page.tsx              // Create form
        └── analytics/
            └── page.tsx              // Analytics dashboard
```

---

## 💡 Usage Examples

### **1. List Page with Filters**
```typescript
'use client'

import { useDemoRequests } from '@/features/admin/demo-requests'
import { DemoRequestTable, DemoRequestFilters } from '@/features/admin/demo-requests/components'
import { useState } from 'react'

export default function DemoRequestsPage() {
  const [filters, setFilters] = useState<DemoRequestFilters>({})
  const { data, isLoading } = useDemoRequests(filters)
  
  return (
    <div className="flex gap-4">
      <DemoRequestFilters filters={filters} onChange={setFilters} />
      <DemoRequestTable data={data} isLoading={isLoading} />
    </div>
  )
}
```

### **2. Create Form**
```typescript
'use client'

import { useCreateDemoRequest, demoRequestFormSchema } from '@/features/admin/demo-requests'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Form } from '@/components/ui/form'

export function DemoRequestCreateForm() {
  const createMutation = useCreateDemoRequest()
  
  const form = useForm({
    resolver: zodResolver(demoRequestFormSchema),
    defaultValues: {
      organizationType: 'YAYASAN',
      demoType: 'STANDARD',
      // ...other defaults
    }
  })
  
  const onSubmit = form.handleSubmit((data) => {
    createMutation.mutate(data)
  })
  
  return (
    <Form {...form}>
      <form onSubmit={onSubmit}>
        {/* Form fields using shadcn/ui components */}
      </form>
    </Form>
  )
}
```

### **3. Approval Action**
```typescript
'use client'

import { useApproveDemoRequest } from '@/features/admin/demo-requests'
import { Button } from '@/components/ui/button'

export function ApproveButton({ id }: { id: string }) {
  const approveMutation = useApproveDemoRequest()
  
  const handleApprove = () => {
    approveMutation.mutate({
      id,
      data: { notes: 'Approved via admin panel' }
    })
  }
  
  return (
    <Button 
      onClick={handleApprove} 
      disabled={approveMutation.isPending}
    >
      {approveMutation.isPending ? 'Approving...' : 'Approve'}
    </Button>
  )
}
```

---

## 🎯 Benefits Achieved

### **✅ Enterprise Patterns**
1. **Centralized API**: Single source of truth for all API calls
2. **Type Safety**: End-to-end TypeScript coverage
3. **Validation**: Client-side + server-side validation with Zod
4. **Cache Management**: Smart invalidation and optimistic updates
5. **SSR Ready**: All API calls support server-side rendering
6. **Error Handling**: Consistent error handling with user feedback

### **✅ Developer Experience**
1. **Autocomplete**: Full IntelliSense support
2. **Type Checking**: Catch errors at compile time
3. **Code Reuse**: Shared types, schemas, and API clients
4. **Easy Testing**: Isolated, testable layers
5. **Documentation**: Comprehensive JSDoc comments

### **✅ User Experience**
1. **Fast Loading**: React Query caching
2. **Optimistic UI**: Instant feedback on actions
3. **Error Messages**: Clear, actionable error messages
4. **Success Feedback**: Toast notifications on success
5. **Loading States**: Proper loading indicators

---

## 📝 Quality Checklist

- ✅ **No TypeScript Errors**: All files compile successfully
- ✅ **Schema Compliance**: Types match Prisma schema exactly
- ✅ **API Pattern**: Follows enterprise API client pattern (Section 2a)
- ✅ **Hook Pattern**: TanStack Query best practices
- ✅ **Validation**: Comprehensive Zod schemas
- ✅ **SSR Support**: All API calls support headers parameter
- ✅ **Error Handling**: Proper error throwing and catching
- ✅ **Cache Keys**: Hierarchical query key structure
- ✅ **Export Clean**: No naming conflicts in barrel exports

---

## 🚀 Ready to Build UI

**Foundation Complete!** ✅

Next step: Build UI components using this foundation:
1. **Start with Table** - `DemoRequestTable.tsx` using shadcn/ui DataTable
2. **Add Form** - `DemoRequestForm.tsx` with React Hook Form + Zod
3. **Build Actions** - Approve/Reject/Assign dialogs
4. **Create Pages** - List, Detail, Create, Analytics

All hooks, types, and API clients are ready to use! 🎉

---

**Documentation**: Created January 2025  
**Status**: Foundation Ready for UI Development  
**Next**: UI Components Implementation
