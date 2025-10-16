# 🗓️ Menu Planning Domain - Implementation Plan

**Status**: 🔵 **PLANNING**  
**Date**: October 15, 2025  
**Domain**: Menu Planning (Operational Planning)  
**Estimated Timeline**: 2 weeks

---

## 📋 Domain Overview

### **Business Context**
Menu Planning Domain mengelola **operational planning** untuk program gizi SPPG:
- Perencanaan menu mingguan/bulanan
- Assignment menu ke tanggal spesifik
- Perhitungan porsi & biaya
- Approval workflow
- Basis untuk Procurement & Production planning

### **User Roles**
- **Kepala SPPG**: Approve menu plans
- **Manager Produksi**: Create & manage plans
- **Ahli Gizi**: Review nutrition balance
- **Staff Procurement**: Use plan for procurement calculation

---

## 🏗️ Architecture Design

### **Domain Structure (Following Menu Domain Pattern)**

```
src/features/sppg/menu-planning/
├── components/
│   ├── MenuPlanList.tsx           # List all plans
│   ├── MenuPlanCard.tsx           # Plan summary card
│   ├── MenuPlanForm.tsx           # Create/edit plan
│   ├── MenuPlanCalendar.tsx       # Calendar view with drag-drop
│   ├── MenuAssignmentDialog.tsx   # Assign menu to date
│   ├── PlanningAnalytics.tsx      # Nutrition/cost analytics
│   ├── ApprovalWorkflow.tsx       # Approval UI
│   └── index.ts
│
├── hooks/
│   ├── useMenuPlans.ts            # TanStack Query hooks
│   ├── useMenuPlanMutations.ts    # Create/update/delete
│   ├── useMenuAssignments.ts      # Assignment CRUD
│   ├── usePlanningAnalytics.ts    # Calculations
│   └── index.ts
│
├── stores/
│   ├── menuPlanningStore.ts       # Zustand store
│   ├── calendarStore.ts           # Calendar state
│   └── index.ts
│
├── schemas/
│   ├── menuPlanSchema.ts          # Zod validation
│   ├── menuAssignmentSchema.ts    # Assignment validation
│   └── index.ts
│
├── types/
│   ├── menu-planning.types.ts     # Domain types
│   ├── api.types.ts               # API request/response
│   └── index.ts
│
├── lib/
│   ├── planningUtils.ts           # Utility functions
│   ├── nutritionCalculator.ts     # Nutrition balance
│   ├── costCalculator.ts          # Cost aggregation
│   └── index.ts
│
└── api/
    ├── menuPlanningApi.ts         # API client
    └── index.ts
```

---

## 📊 Database Schema (Already Exists!)

### **Prisma Models**

```prisma
model MenuPlan {
  id         String   @id @default(cuid())
  programId  String
  sppgId     String
  createdBy  String
  approvedBy String?

  // Plan Details
  name        String
  description String?
  startDate   DateTime
  endDate     DateTime

  // Status Tracking
  status       MenuPlanStatus @default(DRAFT)
  isDraft      Boolean        @default(true)
  isActive     Boolean        @default(false)
  isArchived   Boolean        @default(false)
  publishedAt  DateTime?
  archivedAt   DateTime?

  // Planning Metrics
  totalDays          Int     @default(0)
  totalMenus         Int     @default(0)
  averageCostPerDay  Float   @default(0)
  totalEstimatedCost Float   @default(0)
  
  // Nutrition Balance Score (0-100)
  nutritionScore     Float?
  varietyScore       Float?
  costEfficiency     Float?
  
  // Compliance
  meetsNutritionStandards Boolean @default(false)
  meetsbudgetConstraints  Boolean @default(false)
  
  // Planning Constraints (stored as JSON)
  planningRules      Json?
  generationMetadata Json?

  // Relations
  program     NutritionProgram
  sppg        SPPG
  creator     User
  approver    User?
  assignments MenuAssignment[]
  templates   MenuPlanTemplate[]

  @@map("menu_plans")
}

model MenuAssignment {
  id         String   @id @default(cuid())
  menuPlanId String
  menuId     String
  
  // Assignment Details
  assignedDate DateTime
  mealType     MealType
  
  // Portion Planning
  plannedPortions    Int   @default(0)
  estimatedCost      Float @default(0)
  
  // Nutrition per serving (denormalized)
  calories       Int   @default(0)
  protein        Float @default(0)
  carbohydrates  Float @default(0)
  fat            Float @default(0)
  
  // Assignment Metadata
  isSubstitute Boolean @default(false)
  notes        String?
  
  // Status
  status        AssignmentStatus @default(PLANNED)
  isProduced    Boolean          @default(false)
  isDistributed Boolean          @default(false)
  
  // Actual Production Data
  actualPortions     Int?
  actualCost         Float?
  productionId       String?

  // Relations
  menuPlan   MenuPlan
  menu       NutritionMenu
  production FoodProduction?

  @@unique([menuPlanId, assignedDate, mealType])
  @@map("menu_assignments")
}

enum MenuPlanStatus {
  DRAFT
  SUBMITTED
  APPROVED
  REJECTED
  PUBLISHED
  ARCHIVED
}

enum AssignmentStatus {
  PLANNED
  CONFIRMED
  IN_PRODUCTION
  PRODUCED
  DISTRIBUTED
  CANCELLED
}
```

---

## 🎯 Implementation Phases

### **Phase 1: Foundation (Days 1-3)**

#### 1.1 API Routes
```
src/app/api/sppg/menu-planning/
├── route.ts                        # GET, POST /api/sppg/menu-planning
├── [id]/
│   ├── route.ts                    # GET, PUT, DELETE /api/sppg/menu-planning/[id]
│   ├── publish/route.ts            # POST publish plan
│   ├── approve/route.ts            # POST approve plan
│   └── analytics/route.ts          # GET planning analytics
└── assignments/
    ├── route.ts                    # GET, POST assignments
    └── [id]/route.ts               # PUT, DELETE assignment
```

#### 1.2 API Implementation Checklist
- [ ] GET /api/sppg/menu-planning (list with filters)
- [ ] POST /api/sppg/menu-planning (create plan)
- [ ] GET /api/sppg/menu-planning/[id] (detail with assignments)
- [ ] PUT /api/sppg/menu-planning/[id] (update plan)
- [ ] DELETE /api/sppg/menu-planning/[id] (soft delete)
- [ ] POST /api/sppg/menu-planning/[id]/publish (publish plan)
- [ ] POST /api/sppg/menu-planning/[id]/approve (approval workflow)
- [ ] GET /api/sppg/menu-planning/[id]/analytics (nutrition/cost analysis)

#### 1.3 Multi-tenant Security
```typescript
// Every query must filter by sppgId
const plans = await db.menuPlan.findMany({
  where: {
    sppgId: session.user.sppgId!  // MANDATORY!
  }
})
```

---

### **Phase 2: Core Features (Days 4-7)**

#### 2.1 Menu Plan List Page
```
src/app/(sppg)/menu-planning/page.tsx
```

**Features:**
- [ ] List all plans (table view)
- [ ] Filter by status (Draft, Published, Archived)
- [ ] Filter by date range
- [ ] Search by plan name
- [ ] Quick stats cards (Total Plans, Active Plans, etc)
- [ ] Create New Plan button
- [ ] Actions: View, Edit, Publish, Archive, Delete

**Components:**
- [ ] `MenuPlanList.tsx` - Main list component
- [ ] `MenuPlanCard.tsx` - Individual plan card
- [ ] `PlanStatusBadge.tsx` - Status indicator
- [ ] `PlanStatsCard.tsx` - Statistics display

---

#### 2.2 Menu Plan Detail/Editor Page
```
src/app/(sppg)/menu-planning/[id]/page.tsx
```

**Features:**
- [ ] Plan header (name, dates, status)
- [ ] Calendar view (week/month grid)
- [ ] Drag & drop menu assignment
- [ ] Daily summary (portions, cost, nutrition)
- [ ] Weekly/monthly aggregation
- [ ] Analytics sidebar (nutrition balance, cost trends)
- [ ] Approval workflow UI
- [ ] Export options (PDF, Excel)

**Components:**
- [ ] `MenuPlanCalendar.tsx` - Calendar grid with DnD
- [ ] `MenuAssignmentDialog.tsx` - Assign menu modal
- [ ] `DailySummaryCard.tsx` - Daily stats
- [ ] `PlanningAnalytics.tsx` - Analytics panel
- [ ] `ApprovalWorkflow.tsx` - Approval buttons/status

---

#### 2.3 Menu Assignment Features

**Assignment Dialog:**
- [ ] Select menu (searchable dropdown)
- [ ] Set portions
- [ ] Auto-calculate cost
- [ ] Show nutrition preview
- [ ] Optional notes
- [ ] Mark as substitute (if replacing another menu)

**Batch Operations:**
- [ ] Copy week to next week
- [ ] Clear all assignments in range
- [ ] Apply template (predefined patterns)

---

### **Phase 3: Advanced Features (Days 8-10)**

#### 3.1 Planning Analytics

**Nutrition Balance:**
```typescript
interface NutritionAnalytics {
  averageCalories: number
  averageProtein: number
  averageCarbs: number
  averageFat: number
  
  // Compliance scores (0-100)
  calorieCompliance: number
  proteinCompliance: number
  varietyScore: number
  
  // Alerts
  deficientNutrients: string[]  // "Low protein on Mon-Wed"
  excessiveNutrients: string[]  // "High fat on Friday"
}
```

**Cost Analysis:**
```typescript
interface CostAnalytics {
  totalEstimatedCost: number
  averageCostPerDay: number
  averageCostPerPortion: number
  
  // Budget tracking
  budgetAllocation: number
  budgetUtilization: number  // %
  budgetRemaining: number
  
  // Cost trends
  costByDay: Array<{date: string, cost: number}>
  costByMenu: Array<{menuName: string, totalCost: number}>
}
```

**Variety Score:**
```typescript
interface VarietyAnalysis {
  uniqueMenus: number
  totalAssignments: number
  varietyScore: number  // uniqueMenus / totalAssignments * 100
  
  // Repetition tracking
  repeatedMenus: Array<{
    menuName: string
    occurrences: number
    dates: string[]
  }>
  
  // Suggestions
  suggestions: string[]  // "Consider adding more variety"
}
```

---

#### 3.2 Approval Workflow

**Status Flow:**
```
DRAFT → SUBMITTED → APPROVED → PUBLISHED
          ↓
       REJECTED → DRAFT (revise)
```

**Approval Rules:**
- [ ] Only Manager Produksi can create/submit
- [ ] Ahli Gizi can review nutrition compliance
- [ ] Kepala SPPG must approve before publish
- [ ] Cannot edit after published (must create new version)
- [ ] Rejection requires reason

**Implementation:**
```typescript
interface ApprovalAction {
  action: 'SUBMIT' | 'APPROVE' | 'REJECT' | 'PUBLISH'
  notes?: string
  rejectionReason?: string
}
```

---

#### 3.3 Procurement Integration

**Generate Procurement Suggestions:**
```typescript
interface ProcurementSuggestion {
  // Aggregate ingredients from all assigned menus
  ingredients: Array<{
    inventoryItemId: string
    itemName: string
    totalQuantity: number
    unit: string
    estimatedCost: number
    
    // Breakdown by date
    dailyUsage: Array<{
      date: string
      quantity: number
      menuName: string
    }>
  }>
  
  // Summary
  totalItems: number
  totalEstimatedCost: number
  
  // Procurement timeline
  suggestedOrderDate: Date
  requiredDeliveryDate: Date
}
```

**Export to Procurement:**
- [ ] Button: "Generate Procurement Plan"
- [ ] Create ProcurementPlan with calculated quantities
- [ ] Link MenuPlan → ProcurementPlan

---

### **Phase 4: UI/UX Polish (Days 11-14)**

#### 4.1 Calendar UI Enhancements
- [ ] Drag & drop smooth animations
- [ ] Visual indicators (cost, nutrition status)
- [ ] Mini preview on hover
- [ ] Conflict detection (duplicate assignments)
- [ ] Loading states
- [ ] Empty states with helpful messages

#### 4.2 Responsive Design
- [ ] Mobile-friendly calendar (stacked view)
- [ ] Touch-friendly controls
- [ ] Responsive analytics charts
- [ ] Mobile menu for actions

#### 4.3 Dark Mode Support
- [ ] All components support dark mode
- [ ] Calendar grid contrast optimization
- [ ] Chart color schemes (dark-aware)

#### 4.4 Accessibility
- [ ] Keyboard navigation for calendar
- [ ] Screen reader support
- [ ] ARIA labels
- [ ] Focus management

---

## 🔧 Technical Implementation Details

### **1. TanStack Query Hooks Pattern**

```typescript
// src/features/sppg/menu-planning/hooks/useMenuPlans.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { menuPlanningApi } from '../api/menuPlanningApi'

// Query keys factory
export const menuPlanningKeys = {
  all: ['menu-planning'] as const,
  lists: () => [...menuPlanningKeys.all, 'list'] as const,
  list: (filters: string) => [...menuPlanningKeys.lists(), { filters }] as const,
  details: () => [...menuPlanningKeys.all, 'detail'] as const,
  detail: (id: string) => [...menuPlanningKeys.details(), id] as const,
  analytics: (id: string) => [...menuPlanningKeys.detail(id), 'analytics'] as const,
}

// Fetch all plans
export function useMenuPlans(filters?: MenuPlanFilters) {
  return useQuery({
    queryKey: menuPlanningKeys.list(JSON.stringify(filters)),
    queryFn: () => menuPlanningApi.getAll(filters),
    select: (data) => data.data,
  })
}

// Fetch plan detail
export function useMenuPlan(id: string) {
  return useQuery({
    queryKey: menuPlanningKeys.detail(id),
    queryFn: () => menuPlanningApi.getById(id),
    select: (data) => data.data,
    enabled: !!id,
  })
}

// Create plan mutation
export function useCreateMenuPlan() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: menuPlanningApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuPlanningKeys.lists() })
      toast.success('Menu plan berhasil dibuat')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal membuat menu plan')
    }
  })
}

// Update plan mutation
export function useUpdateMenuPlan() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MenuPlanInput }) =>
      menuPlanningApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: menuPlanningKeys.detail(variables.id) 
      })
      queryClient.invalidateQueries({ queryKey: menuPlanningKeys.lists() })
      toast.success('Menu plan berhasil diperbarui')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal memperbarui menu plan')
    }
  })
}

// Publish plan mutation
export function usePublishMenuPlan() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => menuPlanningApi.publish(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: menuPlanningKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: menuPlanningKeys.lists() })
      toast.success('Menu plan berhasil dipublikasi')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal mempublikasi menu plan')
    }
  })
}
```

---

### **2. Zod Validation Schemas**

```typescript
// src/features/sppg/menu-planning/schemas/menuPlanSchema.ts

import { z } from 'zod'
import { MenuPlanStatus } from '@prisma/client'

export const menuPlanSchema = z.object({
  programId: z.string().cuid(),
  name: z.string().min(3, 'Nama plan minimal 3 karakter'),
  description: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  
  // Planning constraints
  planningRules: z.object({
    maxBudgetPerDay: z.number().min(0).optional(),
    minVarietyScore: z.number().min(0).max(100).optional(),
    allowRepeatWithinDays: z.number().min(1).optional(),
  }).optional(),
}).refine(
  (data) => data.endDate > data.startDate,
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
)

export const menuAssignmentSchema = z.object({
  menuPlanId: z.string().cuid(),
  menuId: z.string().cuid(),
  assignedDate: z.coerce.date(),
  mealType: z.enum(['BREAKFAST', 'SNACK', 'LUNCH', 'DINNER']),
  plannedPortions: z.number().min(1, 'Minimal 1 porsi'),
  notes: z.string().optional(),
  isSubstitute: z.boolean().default(false),
})

export type MenuPlanInput = z.infer<typeof menuPlanSchema>
export type MenuAssignmentInput = z.infer<typeof menuAssignmentSchema>
```

---

### **3. API Client Pattern**

```typescript
// src/features/sppg/menu-planning/api/menuPlanningApi.ts

import type { 
  MenuPlanInput, 
  MenuPlanResponse,
  MenuPlanAnalytics 
} from '../types'

export const menuPlanningApi = {
  // Get all plans
  async getAll(filters?: MenuPlanFilters): Promise<ApiResponse<MenuPlanResponse[]>> {
    const params = new URLSearchParams(filters as any)
    const response = await fetch(`/api/sppg/menu-planning?${params}`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch menu plans')
    }
    
    return response.json()
  },

  // Get plan by ID
  async getById(id: string): Promise<ApiResponse<MenuPlanResponse>> {
    const response = await fetch(`/api/sppg/menu-planning/${id}`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch menu plan')
    }
    
    return response.json()
  },

  // Create plan
  async create(data: MenuPlanInput): Promise<ApiResponse<MenuPlanResponse>> {
    const response = await fetch('/api/sppg/menu-planning', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create menu plan')
    }

    return response.json()
  },

  // Update plan
  async update(
    id: string, 
    data: Partial<MenuPlanInput>
  ): Promise<ApiResponse<MenuPlanResponse>> {
    const response = await fetch(`/api/sppg/menu-planning/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update menu plan')
    }

    return response.json()
  },

  // Delete plan
  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await fetch(`/api/sppg/menu-planning/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete menu plan')
    }

    return response.json()
  },

  // Publish plan
  async publish(id: string): Promise<ApiResponse<MenuPlanResponse>> {
    const response = await fetch(`/api/sppg/menu-planning/${id}/publish`, {
      method: 'POST',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to publish menu plan')
    }

    return response.json()
  },

  // Get analytics
  async getAnalytics(id: string): Promise<ApiResponse<MenuPlanAnalytics>> {
    const response = await fetch(`/api/sppg/menu-planning/${id}/analytics`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch analytics')
    }

    return response.json()
  },
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
```

---

## ✅ Implementation Checklist

### **Week 1: Core Features**

#### Day 1-2: API Layer
- [ ] Create API routes structure
- [ ] Implement GET /api/sppg/menu-planning (list)
- [ ] Implement POST /api/sppg/menu-planning (create)
- [ ] Implement GET /api/sppg/menu-planning/[id] (detail)
- [ ] Implement PUT /api/sppg/menu-planning/[id] (update)
- [ ] Implement DELETE /api/sppg/menu-planning/[id] (delete)
- [ ] Add multi-tenant security (sppgId filtering)
- [ ] Test API endpoints with Postman/Thunder Client

#### Day 3-4: Frontend Foundation
- [ ] Create feature folder structure
- [ ] Implement Zod schemas
- [ ] Implement TypeScript types
- [ ] Create TanStack Query hooks
- [ ] Create API client functions
- [ ] Create Zustand store (if needed)

#### Day 5-7: List & Detail Pages
- [ ] Create menu-planning list page
- [ ] Implement MenuPlanList component
- [ ] Implement MenuPlanCard component
- [ ] Implement filters & search
- [ ] Create menu-planning/[id] detail page
- [ ] Implement basic form for create/edit

---

### **Week 2: Advanced Features & Polish**

#### Day 8-9: Calendar & Assignment
- [ ] Implement MenuPlanCalendar component
- [ ] Add drag & drop functionality (dnd-kit)
- [ ] Implement MenuAssignmentDialog
- [ ] Create assignment API endpoints
- [ ] Implement assignment CRUD operations
- [ ] Add daily summary cards

#### Day 10-11: Analytics & Workflow
- [ ] Implement PlanningAnalytics component
- [ ] Add nutrition balance calculations
- [ ] Add cost analysis calculations
- [ ] Add variety score calculations
- [ ] Implement approval workflow UI
- [ ] Add publish functionality

#### Day 12-13: Integration & Testing
- [ ] Test all API endpoints
- [ ] Test multi-tenant security
- [ ] Test create/edit/delete flows
- [ ] Test approval workflow
- [ ] Test analytics calculations
- [ ] Fix bugs & edge cases

#### Day 14: Polish & Documentation
- [ ] Add loading states
- [ ] Add empty states
- [ ] Improve error messages
- [ ] Optimize performance
- [ ] Add dark mode support
- [ ] Update documentation
- [ ] Create user guide

---

## 🎨 UI/UX Design References

### **Calendar Component**
Reference: FullCalendar, React Big Calendar
- Week/Month view toggle
- Drag & drop menu assignment
- Visual indicators (colors by meal type)
- Hover preview
- Click to edit

### **Analytics Dashboard**
Reference: Recharts, Chart.js
- Line chart: Cost trends
- Bar chart: Nutrition by day
- Pie chart: Menu distribution
- Progress bars: Budget utilization

### **Approval Workflow**
Reference: GitHub PR approval, Jira workflow
- Status badges
- Approval buttons with confirmation
- Comment/notes field
- Activity timeline

---

## 🚀 Next Steps After Menu Planning

After completing Menu Planning Domain:

1. **Procurement Domain** (3 weeks)
   - Use menu plan to calculate ingredient needs
   - Purchase order management
   - Receiving & inventory update

2. **Production Domain** (3 weeks)
   - Use menu plan for production schedule
   - Batch production tracking
   - Quality control

3. **Distribution Domain** (2 weeks)
   - Use menu plan for delivery schedule
   - School distribution tracking
   - Proof of delivery

---

## 📝 Notes

### **Key Decisions**
- ✅ Use existing schema (MenuPlan, MenuAssignment)
- ✅ Follow Menu Domain architecture pattern
- ✅ TanStack Query for server state
- ✅ shadcn/ui for all components
- ✅ Multi-tenant security in all APIs

### **Deferred Features**
- ⏸️ AI-powered menu suggestions (future)
- ⏸️ Template library (Phase 2)
- ⏸️ Mobile app (Phase 3)
- ⏸️ Notification system (Phase 2)

### **Technical Debt to Avoid**
- ❌ No mock data (all real database)
- ❌ No client-side only state (use API)
- ❌ No skipping multi-tenant checks
- ❌ No hardcoded values (use constants)

---

**Ready to start implementation? Let's build! 🚀**
