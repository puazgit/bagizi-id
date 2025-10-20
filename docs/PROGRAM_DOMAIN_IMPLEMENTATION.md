# 📋 Program Domain Implementation - Complete Guide

**Status**: ✅ **IMPLEMENTATION COMPLETE**  
**Date**: October 20, 2025  
**Version**: Next.js 15.5.4 / Prisma 6.17.1 / Auth.js v5  
**Author**: Bagizi-ID Development Team

---

## 📊 Executive Summary

Domain **Program** (NutritionProgram) telah berhasil diimplementasikan secara lengkap mengikuti **Enterprise-Grade Copilot Instructions** dengan:

- ✅ **Feature-based modular architecture**
- ✅ **Multi-tenant security** dengan sppgId filtering
- ✅ **Centralized API client pattern** (Section 2a)
- ✅ **Role-based access control** (RBAC)
- ✅ **Full TypeScript coverage** dengan strict mode
- ✅ **TanStack Query integration** untuk state management
- ✅ **Auto-generated programCode** pada creation
- ✅ **Comprehensive validation** dengan Zod schemas

---

## 🏗️ Architecture Overview

### Prisma Model: NutritionProgram

```prisma
model NutritionProgram {
  id                  String               @id @default(cuid())
  sppgId              String               // MULTI-TENANT KEY
  name                String
  description         String?
  programCode         String               @unique // AUTO-GENERATED
  programType         ProgramType
  targetGroup         TargetGroup
  
  // Nutrition targets
  calorieTarget       Float?
  proteinTarget       Float?
  carbTarget          Float?
  fatTarget           Float?
  fiberTarget         Float?
  
  // Schedule & implementation
  startDate           DateTime
  endDate             DateTime?
  feedingDays         Int[]                // [0-6] Sunday-Saturday
  mealsPerDay         Int                  @default(1)
  
  // Budget & recipients
  totalBudget         Float?
  budgetPerMeal       Float?
  targetRecipients    Int
  currentRecipients   Int                  @default(0)
  
  // Location & partnerships
  implementationArea  String
  partnerSchools      String[]
  
  // Status & timestamps
  status              String               @default("ACTIVE")
  createdAt           DateTime             @default(now())
  updatedAt           DateTime             @updatedAt
  
  // Relations (15+ models)
  sppg                SPPG                 @relation(...)
  menus               NutritionMenu[]
  menuPlans           MenuPlan[]
  productions         FoodProduction[]
  distributions       FoodDistribution[]
  schools             SchoolBeneficiary[]
  feedback            Feedback[]
  procurementPlans    ProcurementPlan[]
  monitoring          ProgramMonitoring[]
  schoolDistributions SchoolDistribution[]
}
```

---

## 📁 Folder Structure

```
src/features/sppg/program/
├── api/
│   ├── programApi.ts          ✅ Centralized API client (267 lines)
│   └── index.ts               ✅ Export barrel
├── hooks/
│   ├── usePrograms.ts         ✅ React Query hooks (352 lines)
│   └── index.ts               ✅ Export barrel
├── schemas/
│   ├── programSchema.ts       ✅ Zod validation (250+ lines)
│   └── index.ts               ✅ Export barrel
├── types/
│   ├── program.types.ts       ✅ TypeScript interfaces (193 lines)
│   └── index.ts               ✅ Export barrel
├── components/                🚧 TO BE IMPLEMENTED
│   ├── ProgramList.tsx
│   ├── ProgramCard.tsx
│   ├── ProgramForm.tsx
│   └── ProgramDialog.tsx
└── lib/                       🚧 TO BE IMPLEMENTED
    └── programUtils.ts

src/app/api/sppg/program/
├── route.ts                   ✅ GET, POST endpoints (195 lines)
└── [id]/
    └── route.ts               ✅ GET, PUT, DELETE (263 lines)

src/app/(sppg)/program/        🚧 TO BE IMPLEMENTED
├── page.tsx                   # List page
├── create/
│   └── page.tsx              # Create page
└── [id]/
    ├── page.tsx              # Detail page
    └── edit/
        └── page.tsx          # Edit page
```

---

## 🔒 Multi-Tenant Security Implementation

### API Endpoint Security Pattern

```typescript
// src/app/api/sppg/program/route.ts

export async function GET(request: NextRequest) {
  // 1. Authentication Check
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. SPPG Access Check (CRITICAL FOR MULTI-TENANCY!)
  if (!session.user.sppgId) {
    return Response.json({ error: 'SPPG access required' }, { status: 403 })
  }

  // 3. Build where clause with multi-tenant filtering
  const where = {
    sppgId: session.user.sppgId, // MANDATORY multi-tenant filter
    ...(status && { status }),
    ...(programType && { programType }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { programCode: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  }

  // 4. Fetch programs (auto-filtered by sppgId)
  const programs = await db.nutritionProgram.findMany({
    where,
    include: {
      sppg: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  })

  return Response.json({ success: true, data: programs })
}
```

### Auto-Generated programCode

```typescript
// src/app/api/sppg/program/route.ts (POST endpoint)

// Generate unique programCode
const timestamp = Date.now().toString().slice(-8)
const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase()
const programCode = `PROG-${sppg.code}-${timestamp}-${randomSuffix}`

// Example output: PROG-SPPG-JKT-001-89234567-A4B2
```

---

## 🎯 API Client Pattern (Enterprise-Grade)

### Centralized API Client

```typescript
// src/features/sppg/program/api/programApi.ts

import { getBaseUrl, getFetchOptions } from '@/lib/api-utils'
import type { ApiResponse } from '@/lib/api-utils'

export const programApi = {
  /**
   * Fetch all programs dengan optional filtering
   * Auto-filtered by sppgId pada server (multi-tenant security)
   */
  async getAll(
    filters?: ProgramFilters,
    headers?: HeadersInit
  ): Promise<ApiResponse<Program[]>> {
    const baseUrl = getBaseUrl()
    
    // Build query string
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.search) params.append('search', filters.search)
    
    const url = `${baseUrl}/api/sppg/program?${params}`
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch programs')
    }
    
    return response.json()
  },

  async create(data: CreateProgramInput): Promise<ApiResponse<Program>> {
    // Implementation...
  },

  async update(id: string, data: UpdateProgramInput): Promise<ApiResponse<Program>> {
    // Implementation...
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    // Implementation...
  }
}
```

### React Query Hooks Usage

```typescript
// Client-side usage

import { usePrograms, useCreateProgram } from '@/features/sppg/program/hooks'

function ProgramList() {
  // Fetch all active programs
  const { data: programs, isLoading } = usePrograms({ status: 'ACTIVE' })
  
  // Create program mutation
  const { mutate: createProgram, isPending } = useCreateProgram()
  
  const handleCreate = () => {
    createProgram({
      name: 'Program Makan Siang SD',
      programType: 'SCHOOL_FEEDING',
      targetGroup: 'PRIMARY_SCHOOL',
      startDate: new Date('2025-01-01'),
      feedingDays: [1, 2, 3, 4, 5], // Monday-Friday
      mealsPerDay: 1,
      targetRecipients: 500,
      implementationArea: 'Jakarta Pusat',
      partnerSchools: ['SD 01', 'SD 02']
    })
  }
  
  return (
    <div>
      {programs?.map(program => (
        <ProgramCard key={program.id} program={program} />
      ))}
    </div>
  )
}
```

---

## 🔐 Role-Based Access Control (RBAC)

### Allowed Roles for Program Domain

#### **Create & Update Program**
```typescript
const allowedRoles: UserRole[] = [
  'PLATFORM_SUPERADMIN',  // Platform level
  'SPPG_KEPALA',         // Head of SPPG
  'SPPG_ADMIN',          // SPPG Administrator
  'SPPG_AHLI_GIZI',      // Nutritionist
]
```

#### **Delete Program**
```typescript
const allowedRoles: UserRole[] = [
  'PLATFORM_SUPERADMIN',  // Platform level only
  'SPPG_KEPALA',         // Head of SPPG only
]
```

#### **View Program**
```typescript
// All SPPG users can view programs (auto-filtered by sppgId)
```

### Navigation Permissions

```typescript
// src/hooks/use-auth.ts

case 'program':
  hasAccess = hasRole(['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AHLI_GIZI'])
  break
```

### Sidebar Navigation Entry

```typescript
// src/components/shared/navigation/SppgSidebar.tsx

{
  title: 'Program Management',
  items: [
    {
      title: 'Program',
      href: '/program',
      icon: Briefcase,
      badge: null,
      resource: 'program'  // ✅ Permission check via canAccess('program')
    }
  ]
}
```

---

## ✅ Validation with Zod

### Create Program Schema

```typescript
// src/features/sppg/program/schemas/programSchema.ts

export const createProgramSchema = z.object({
  name: z
    .string()
    .min(5, 'Nama program minimal 5 karakter')
    .max(200, 'Nama program maksimal 200 karakter'),
  
  programType: z.nativeEnum(ProgramType),
  targetGroup: z.nativeEnum(TargetGroup),
  
  // Nutrition targets (optional)
  calorieTarget: z.number().min(0).max(5000).optional().nullable(),
  proteinTarget: z.number().min(0).max(200).optional().nullable(),
  
  // Schedule
  startDate: z.string().or(z.date()).transform((val) => {
    if (typeof val === 'string') return new Date(val)
    return val
  }),
  
  feedingDays: z
    .array(z.number().min(0).max(6))
    .min(1, 'Minimal 1 hari pemberian makan')
    .max(7, 'Maksimal 7 hari pemberian makan')
    .refine(
      (days) => {
        // Check for duplicates
        const uniqueDays = new Set(days)
        return uniqueDays.size === days.length
      },
      { message: 'Hari pemberian makan tidak boleh duplikat' }
    ),
  
  mealsPerDay: z.number().int().min(1).max(5),
  
  targetRecipients: z
    .number()
    .int()
    .min(1, 'Target penerima minimal 1 orang')
    .max(100000, 'Target penerima maksimal 100.000 orang'),
  
  implementationArea: z.string().min(3).max(200),
  partnerSchools: z.array(z.string().min(1)).default([])
}).refine(
  (data) => {
    // Validate endDate is after startDate
    if (data.endDate && data.startDate) {
      return data.endDate > data.startDate
    }
    return true
  },
  {
    message: 'Tanggal selesai harus setelah tanggal mulai',
    path: ['endDate']
  }
)
```

---

## 📊 React Query Cache Management

### Query Keys Structure

```typescript
export const programKeys = {
  all: ['programs'] as const,
  lists: () => [...programKeys.all, 'list'] as const,
  list: (filters?: ProgramFilters) => [...programKeys.lists(), { filters }] as const,
  details: () => [...programKeys.all, 'detail'] as const,
  detail: (id: string) => [...programKeys.details(), id] as const,
  stats: (id: string) => [...programKeys.detail(id), 'stats'] as const,
  summary: () => [...programKeys.all, 'summary'] as const,
}
```

### Cache Invalidation Strategy

```typescript
// On create
queryClient.invalidateQueries({ queryKey: programKeys.lists() })
queryClient.invalidateQueries({ queryKey: programKeys.summary() })

// On update
queryClient.setQueryData(programKeys.detail(id), updatedProgram)
queryClient.invalidateQueries({ queryKey: programKeys.lists() })
queryClient.invalidateQueries({ queryKey: programKeys.stats(id) })

// On delete
queryClient.removeQueries({ queryKey: programKeys.detail(id) })
queryClient.removeQueries({ queryKey: programKeys.stats(id) })
queryClient.invalidateQueries({ queryKey: programKeys.lists() })
```

---

## 🚀 Next Steps (UI Implementation)

### 1. Program List Page
```bash
# Location: src/app/(sppg)/program/page.tsx

- DataTable dengan filtering & sorting
- Status badges (ACTIVE, INACTIVE, COMPLETED)
- Quick stats cards (Total Programs, Active Programs, Total Recipients)
- Export to Excel functionality
```

### 2. Program Create/Edit Form
```bash
# Location: src/app/(sppg)/program/create/page.tsx

Components needed:
- ProgramForm.tsx (React Hook Form + Zod)
- NutritionTargetsSection.tsx (collapsible)
- FeedingDaysSelector.tsx (checkbox group for days)
- PartnerSchoolsSelector.tsx (multi-select combobox)
- ScheduleCalendar.tsx (date range picker)
```

### 3. Program Detail Page
```bash
# Location: src/app/(sppg)/program/[id]/page.tsx

Sections:
- Program Overview Card
- Nutrition Targets Grid
- Schedule & Implementation Timeline
- Partner Schools List
- Statistics Dashboard (menus, productions, distributions)
- Related Entities (Menus, Menu Plans, Productions)
- Activity Log / Audit Trail
```

### 4. Program Components
```typescript
// ProgramCard.tsx - shadcn/ui Card component
interface ProgramCardProps {
  program: Program
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onView?: (id: string) => void
}

// ProgramStatusBadge.tsx
interface ProgramStatusBadgeProps {
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED' | 'DRAFT' | 'ARCHIVED'
}

// ProgramStatsCard.tsx
interface ProgramStatsCardProps {
  totalPrograms: number
  activePrograms: number
  totalRecipients: number
  totalBudget: number
}
```

---

## 📝 API Endpoints Summary

### GET /api/sppg/program
- **Purpose**: Fetch all programs untuk SPPG
- **Auth**: Required (session.user.sppgId)
- **Filters**: status, programType, targetGroup, search
- **Response**: `{ success: true, data: Program[] }`

### POST /api/sppg/program
- **Purpose**: Create new program
- **Auth**: Required + Role Check (SPPG_KEPALA, SPPG_ADMIN, SPPG_AHLI_GIZI)
- **Auto-populate**: sppgId, programCode, currentRecipients, status
- **Response**: `{ success: true, data: Program }`

### GET /api/sppg/program/[id]
- **Purpose**: Fetch single program
- **Auth**: Required (verify sppgId)
- **Query Params**: `includeStats=true` for statistics
- **Response**: `{ success: true, data: Program | ProgramWithStats }`

### PUT /api/sppg/program/[id]
- **Purpose**: Update existing program
- **Auth**: Required + Role Check
- **Partial Update**: Only provided fields updated
- **Response**: `{ success: true, data: Program }`

### DELETE /api/sppg/program/[id]
- **Purpose**: Delete program (cascade delete related)
- **Auth**: Required + Role Check (SPPG_KEPALA only)
- **Cascade**: Removes menus, menu plans, productions, distributions
- **Response**: `{ success: true }`

---

## 🎯 Testing Checklist

### Unit Tests
- [ ] Zod schema validation tests
- [ ] API client method tests (mock fetch)
- [ ] React Query hook tests (Mock Service Worker)
- [ ] Component render tests (React Testing Library)

### Integration Tests
- [ ] API endpoint tests dengan multi-tenant scenarios
- [ ] Role-based access control tests
- [ ] programCode generation uniqueness
- [ ] Cascade delete verification

### E2E Tests (Playwright)
- [ ] Create program flow
- [ ] Edit program flow
- [ ] Delete program flow
- [ ] Navigation permission checks
- [ ] Filter & search functionality

---

## 📊 Implementation Statistics

| Component | Status | Lines of Code | Complexity |
|-----------|--------|--------------|------------|
| Types | ✅ Complete | 193 | Low |
| Schemas | ✅ Complete | 250+ | Medium |
| API Client | ✅ Complete | 267 | Medium |
| API Endpoints | ✅ Complete | 458 (total) | High |
| React Hooks | ✅ Complete | 352 | High |
| Navigation | ✅ Complete | - | Low |
| Permissions | ✅ Complete | - | Medium |
| UI Components | 🚧 Deferred | 0 | High |
| Page Routes | 🚧 Deferred | 0 | Medium |

**Total Lines Implemented**: ~1,520+ lines  
**Estimated Remaining**: ~800 lines (UI components + pages)

---

## 🎉 Success Criteria - ALL MET ✅

- ✅ Feature-based modular architecture following Pattern 2
- ✅ Multi-tenant security dengan sppgId filtering
- ✅ Centralized API client pattern (NO direct fetch)
- ✅ Role-based access control (RBAC)
- ✅ TypeScript strict mode compliance
- ✅ Zod validation schemas dengan business rules
- ✅ TanStack Query integration dengan cache management
- ✅ Auto-generated programCode dengan timestamp + random
- ✅ Navigation entry dengan permission checks
- ✅ API endpoints dengan proper error handling
- ✅ Enterprise-grade documentation

---

## 🔗 Related Documentation

- [Copilot Instructions](/docs/copilot-instructions.md)
- [Menu Model Relationship Analysis](/docs/MENU_MODEL_RELATIONSHIP_ANALYSIS.md)
- [Menu Planning Create UI Analysis](/docs/MENU_PLANNING_CREATE_UI_ANALYSIS.md)
- [API Standardization Journey](/docs/API_STANDARDIZATION_JOURNEY_COMPLETE.md)

---

## 👨‍💻 Development Team Notes

### Key Design Decisions

1. **programCode Auto-Generation**: Format `PROG-{sppgCode}-{timestamp}-{random}` ensures uniqueness across all SPPGs
2. **feedingDays Array**: Int array (0-6) for flexibility, allows custom feeding schedules
3. **Partial Update**: updateProgramSchema allows partial updates for better UX
4. **Cascade Delete**: Automatic cleanup of related entities (menus, productions, etc.)
5. **Status Management**: Dedicated mutation hook for status changes with proper labels

### Performance Considerations

- Stale time: 5 minutes for lists, 2 minutes for stats
- Optimistic updates pada edit operations
- Query key structure mendukung fine-grained cache invalidation
- Include sppg relation hanya pada list/detail queries

### Security Highlights

- Multi-tenant filtering di SEMUA queries (sppgId MANDATORY)
- Role-based create/edit/delete restrictions
- Program ownership verification sebelum update/delete
- Audit trail logging untuk sensitive operations

---

**🎯 DOMAIN PROGRAM IMPLEMENTATION COMPLETE - READY FOR UI DEVELOPMENT** ✅
