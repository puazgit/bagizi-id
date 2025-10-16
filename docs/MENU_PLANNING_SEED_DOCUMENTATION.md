# Menu Planning Seed Documentation

**File**: `prisma/seeds/menu-planning-seed.ts`  
**Created**: October 16, 2025  
**Domain**: Menu Planning  
**Version**: Enterprise-grade seed with realistic data

---

## 📋 Overview

Seed file untuk domain **Menu Planning** yang mencakup semua model terkait:
- **MenuPlan** - Rencana menu bulanan
- **MenuAssignment** - Penugasan menu harian per jenis makanan
- **MenuPlanTemplate** - Template pola menu yang dapat digunakan berulang

---

## 🎯 Seed Strategy

### Data Dependencies
```typescript
// Required dependencies (must be seeded first):
- SPPG entities (from sppg-seed.ts)
- User entities (from user-seed.ts)
- NutritionProgram (from menu-seed.ts)
- NutritionMenu (from menu-seed.ts)
```

### Data Creation Per SPPG

Setiap SPPG mendapatkan **4 Menu Plans** dengan status berbeda:

#### 1. **DRAFT Plan** (Current Month)
- **Status**: `DRAFT`
- **Period**: Bulan berjalan (hari ke-1 sampai akhir bulan)
- **Assignments**: 7 hari pertama saja (first week)
- **Meals**: 2 makanan per hari (SARAPAN + SNACK_PAGI)
- **Purpose**: Simulasi planning yang sedang disusun
- **Metrics**:
  - `nutritionScore`: null (belum dihitung)
  - `meetsNutritionStandards`: false
  - `meetsbudgetConstraints`: false

#### 2. **APPROVED Plan** (Last Month)
- **Status**: `APPROVED`
- **Period**: Bulan lalu (full month)
- **Assignments**: Semua hari dalam bulan
- **Meals**: 3 makanan per hari (SARAPAN + SNACK_PAGI + MAKAN_SIANG)
- **Purpose**: Simulasi plan yang sudah disetujui, siap dipublikasikan
- **Metrics**:
  - `nutritionScore`: 85.5
  - `varietyScore`: 78.2
  - `costEfficiency`: 92.3
  - `meetsNutritionStandards`: true
  - `meetsbudgetConstraints`: true
- **Features**:
  - Has `approvedBy` (SPPG_KEPALA/ADMIN)
  - All assignments in `CONFIRMED` status

#### 3. **ACTIVE Plan** (Two Months Ago)
- **Status**: `ACTIVE`
- **Period**: 2 bulan lalu (full month)
- **Assignments**: Semua hari dalam bulan
- **Meals**: 3 makanan per hari (SARAPAN + SNACK_PAGI + MAKAN_SIANG)
- **Purpose**: Simulasi plan yang sedang berjalan
- **Metrics**:
  - `nutritionScore`: 88.7
  - `varietyScore`: 82.5
  - `costEfficiency`: 89.8
  - `publishedAt`: Set to start date
  - `isActive`: true
- **Features**:
  - Past assignments marked as `PRODUCED` or `DISTRIBUTED`
  - Has `actualPortions` and `actualCost` for past dates
  - Future assignments in `CONFIRMED` status

#### 4. **COMPLETED Plan** (Three Months Ago)
- **Status**: `COMPLETED`
- **Period**: 3 bulan lalu (full month)
- **Assignments**: Semua hari dalam bulan (all completed)
- **Meals**: 3 makanan per hari
- **Purpose**: Simulasi plan yang sudah selesai dilaksanakan
- **Metrics**:
  - `nutritionScore`: 87.3
  - `varietyScore`: 80.1
  - `costEfficiency`: 91.5
- **Features**:
  - All assignments in `COMPLETED` status
  - All have `isProduced`: true, `isDistributed`: true
  - All have `actualPortions` and `actualCost`

---

## 📊 Assignment Status Flow

```
DRAFT Plan → PLANNED
APPROVED Plan → CONFIRMED
ACTIVE Plan → CONFIRMED (future) | PRODUCED (past) | DISTRIBUTED (past)
COMPLETED Plan → COMPLETED
```

### Assignment Status Details:
- **PLANNED**: Assignment created, not confirmed yet (DRAFT plans)
- **CONFIRMED**: Assignment confirmed, ready for production (APPROVED/ACTIVE)
- **IN_PRODUCTION**: Currently being produced (not used in seed)
- **PRODUCED**: Food has been produced (ACTIVE past dates)
- **DISTRIBUTED**: Food has been distributed (ACTIVE past dates, every 3rd assignment)
- **COMPLETED**: Assignment fully completed (COMPLETED plans)

---

## 🎨 Menu Plan Templates

Setiap SPPG mendapatkan **3 templates**:

### 1. **Standard Weekly Pattern**
```typescript
{
  name: 'Pola Menu Mingguan Standar',
  category: 'Weekly',
  templatePattern: {
    pattern: 'weekly',
    days: 7,
    mealsPerDay: 3,
    rotationCycle: 1,
    mealTypes: ['SARAPAN', 'SNACK_PAGI', 'MAKAN_SIANG']
  },
  useCount: 5,
  isPublic: false
}
```

### 2. **Monthly Rotation**
```typescript
{
  name: 'Rotasi Menu Bulanan',
  category: 'Monthly',
  templatePattern: {
    pattern: 'monthly',
    days: 30,
    mealsPerDay: 3,
    rotationCycle: 4,
    mealTypes: ['SARAPAN', 'SNACK_PAGI', 'MAKAN_SIANG'],
    varietyRules: {
      minDaysBetweenRepeat: 5,
      maxRepeatPerWeek: 2
    }
  },
  useCount: 2,
  isPublic: false
}
```

### 3. **Budget-Optimized Pattern**
```typescript
{
  name: 'Pola Menu Hemat Anggaran',
  category: 'Budget',
  templatePattern: {
    pattern: 'budget-optimized',
    days: 7,
    mealsPerDay: 3,
    maxBudgetPerDay: 12000,
    costOptimization: true,
    mealTypes: ['SARAPAN', 'SNACK_PAGI', 'MAKAN_SIANG']
  },
  useCount: 8,
  isPublic: true  // ✓ Shared template
}
```

---

## 🔢 Calculation Logic

### Menu Plan Totals (Auto-calculated):
```typescript
// After creating assignments
await prisma.menuPlan.update({
  data: {
    totalMenus: assignments.length,
    totalEstimatedCost: assignments.reduce((sum, a) => sum + a.estimatedCost, 0),
    averageCostPerDay: totalEstimatedCost / totalDays,
  }
})
```

### Assignment Cost Calculation:
```typescript
estimatedCost = menu.estimatedCostPerServing * program.targetBeneficiaries
```

### Planning Rules (Stored in JSON):
```typescript
planningRules: {
  maxBudgetPerDay: 15000,
  minVarietyScore: 70,
  maxMenuRepetitionPerWeek: 2
}
```

---

## 📅 Date Distribution

### Timeline Overview:
```
3 months ago  → COMPLETED Plan (full month, all completed)
2 months ago  → ACTIVE Plan (full month, some produced/distributed)
1 month ago   → APPROVED Plan (full month, all confirmed)
Current month → DRAFT Plan (first week only, planned)
```

### Assignment Date Logic:
```typescript
// For each day in plan period
for (let i = 0; i < totalDays; i++) {
  const assignDate = new Date(startDate)
  assignDate.setDate(assignDate.getDate() + i)
  
  // Create assignments for meal types
  for (const mealType of mealTypes) {
    // Pick random suitable menu
    // Create assignment
  }
}
```

---

## 🎯 Meal Type Distribution

### DRAFT Plan (7 days):
- **SARAPAN** (7 assignments)
- **SNACK_PAGI** (7 assignments)
- **Total**: 14 assignments

### APPROVED/ACTIVE/COMPLETED Plans (full month):
- **SARAPAN** (30-31 assignments)
- **SNACK_PAGI** (30-31 assignments)
- **MAKAN_SIANG** (30-31 assignments)
- **Total**: 90-93 assignments per plan

---

## 🏗️ Seed Architecture Compliance

### ✅ Follows Enterprise Pattern:

1. **Modular Seed File**: `menu-planning-seed.ts` (separate from other domains)
2. **Dependency Management**: Receives `prisma`, `sppgs`, `users` as parameters
3. **Error Handling**: Checks for required data before seeding
4. **Logging**: Clear console output with emojis and progress indicators
5. **Idempotent**: Uses `upsert` with predictable IDs
6. **Multi-tenant Safe**: Creates data per SPPG with proper isolation
7. **Realistic Data**: Multiple status states, past/present/future dates
8. **Data Integrity**: Foreign key relationships properly maintained

### 📋 Integration with Master Seed:
```typescript
// prisma/seed.ts
import { seedMenuPlanning } from './seeds/menu-planning-seed'

// Called after menu domain seed
console.log('📅 Seeding menu planning domain...')
await seedMenuPlanning(prisma, sppgs, users)
```

---

## 🔍 Data Verification

### Check Seeded Data:
```bash
# Run seed
npm run db:seed

# Open Prisma Studio
npm run db:studio

# Verify:
# 1. MenuPlan table → Should have 4 plans per SPPG
# 2. MenuAssignment table → Should have assignments for all plans
# 3. MenuPlanTemplate table → Should have 3 templates per SPPG
```

### Expected Counts (per SPPG):
- **Menu Plans**: 4 (DRAFT, APPROVED, ACTIVE, COMPLETED)
- **Assignments**: 
  - DRAFT: ~14 (7 days × 2 meals)
  - APPROVED: ~90 (30 days × 3 meals)
  - ACTIVE: ~90 (30 days × 3 meals)
  - COMPLETED: ~90 (30 days × 3 meals)
  - **Total**: ~284 assignments per SPPG
- **Templates**: 3 (Weekly, Monthly, Budget)

---

## 🧪 Testing Scenarios

### 1. **List Menu Plans**
```
GET /api/sppg/menu-planning
Expected: 4 plans with different statuses
```

### 2. **View Plan Detail**
```
GET /api/sppg/menu-planning/[id]
Expected: Plan with assignments array
```

### 3. **Calendar View**
```
Check assignments by date in Calendar tab
Expected: Color-coded meal types, daily coverage
```

### 4. **Analytics Dashboard**
```
GET /api/sppg/menu-planning/[id]/analytics
Expected: Cost, nutrition, variety, compliance metrics
```

### 5. **Status Transitions**
```
DRAFT → Submit → PENDING_REVIEW
PENDING_REVIEW → Approve → APPROVED
APPROVED → Publish → PUBLISHED
PUBLISHED → Activate → ACTIVE
```

---

## 📊 Sample Data Structure

### MenuPlan Example:
```typescript
{
  id: "menu-plan-active-SPPG-JKT-001",
  programId: "nutrition-program-id",
  sppgId: "sppg-id",
  createdBy: "user-id-kepala",
  approvedBy: "user-id-kepala",
  name: "Rencana Menu Oktober 2025 - ACTIVE",
  status: "ACTIVE",
  startDate: "2025-08-01",
  endDate: "2025-08-31",
  totalDays: 31,
  totalMenus: 93,
  averageCostPerDay: 450000,
  totalEstimatedCost: 13950000,
  nutritionScore: 88.7,
  meetsNutritionStandards: true
}
```

### MenuAssignment Example:
```typescript
{
  id: "assignment-id",
  menuPlanId: "menu-plan-active-SPPG-JKT-001",
  menuId: "menu-nasi-gudeg",
  assignedDate: "2025-08-15",
  mealType: "SARAPAN",
  plannedPortions: 100,
  estimatedCost: 500000,
  status: "DISTRIBUTED",
  isProduced: true,
  isDistributed: true,
  actualPortions: 100,
  actualCost: 500000
}
```

---

## 🚀 Next Steps

After seeding:

1. **Browser Testing**: Navigate to `/menu-planning` and verify all data displays correctly
2. **Calendar Testing**: Check Calendar tab shows color-coded assignments
3. **Analytics Testing**: Verify Analytics tab shows charts with real data
4. **Workflow Testing**: Test status transitions (Submit, Approve, Publish)
5. **Multi-tenant Testing**: Verify each SPPG only sees their own plans

---

## 📝 Maintenance Notes

### Adding New Plan Status:
1. Add enum value to `MenuPlanStatus` in schema
2. Update seed to create sample plan with new status
3. Update status transition logic in API

### Adjusting Assignment Count:
```typescript
// Change meals per day
const mealTypes: MealType[] = [
  MealType.SARAPAN, 
  MealType.SNACK_PAGI, 
  MealType.MAKAN_SIANG,
  MealType.SNACK_SORE  // ← Add more meal types
]
```

### Customizing Date Ranges:
```typescript
// Adjust months back/forward
completedStartDate.setMonth(completedStartDate.getMonth() - 6)  // 6 months ago
```

---

## ✅ Completion Checklist

- [x] MenuPlan seed data created (4 status variations)
- [x] MenuAssignment seed data created (realistic distribution)
- [x] MenuPlanTemplate seed data created (3 templates)
- [x] Multi-tenant isolation implemented
- [x] Realistic metrics calculated
- [x] Past/present/future dates handled
- [x] Status transitions simulated
- [x] Planning rules included
- [x] Cost calculations accurate
- [x] Integrated into master seed file
- [x] Documentation created
- [ ] Browser testing completed
- [ ] Data verification in Prisma Studio

---

**Status**: ✅ **SEED FILE COMPLETE AND READY FOR USE**

Run with: `npm run db:seed` or `npm run db:reset`
