# 📋 Menu Planning - User Guide & Workflow
**Platform**: Bagizi-ID SaaS  
**Module**: Menu Planning (Perencanaan Menu)  
**Date**: October 16, 2025  
**Version**: 1.0

---

## 🎯 Apa itu Menu Planning?

**Menu Planning** adalah modul untuk merencanakan menu makanan untuk periode tertentu (misalnya: 1 bulan) sebelum eksekusi di lapangan.

### **Tujuan**:
- ✅ Merencanakan menu untuk periode waktu tertentu (harian/mingguan/bulanan)
- ✅ Memastikan variasi menu yang cukup
- ✅ Mengontrol budget sesuai target
- ✅ Memenuhi standar nutrisi
- ✅ Approval workflow untuk validasi

### **Manfaat**:
- 📊 Planning yang terstruktur dan terorganisir
- 💰 Budget control yang lebih baik
- 🥗 Nutrisi yang terkontrol
- 📅 Jadwal yang jelas untuk tim produksi
- 📈 Analytics untuk evaluasi

---

## 🔄 Complete Workflow - Menu Planning

### **Big Picture: 6 Tahapan Utama**

```
1. CREATE PLAN → 2. ADD ASSIGNMENTS → 3. REVIEW → 4. APPROVE → 5. PUBLISH → 6. EXECUTE
    (Draft)         (Isi Menu)         (Check)     (Validate)   (Active)    (Production)
```

---

## 📊 Detailed Workflow & Steps

### **Phase 1: CREATE MENU PLAN** 📝

**Tujuan**: Membuat rencana menu untuk periode tertentu

**Steps**:
1. Navigate ke: **Menu Planning** di sidebar
2. Klik tombol: **"Create New Plan"**
3. Isi form:
   - **Plan Name**: "Rencana Menu Desember 2025"
   - **Program**: Pilih program (contoh: "Program Makan Siang Anak Sekolah")
   - **Start Date**: 1 Desember 2025
   - **End Date**: 31 Desember 2025
   - **Planning Rules** (Optional): 
     ```json
     {
       "maxBudgetPerDay": 3500000,
       "minVarietyScore": 70,
       "maxMenuRepetitionPerWeek": 2
     }
     ```
   - **Description**: "Rencana menu untuk bulan Desember dengan fokus menu tradisional"

4. Klik: **"Save as Draft"**

**Result**: 
- ✅ Plan created dengan status **DRAFT**
- ✅ Total Days calculated: 31 hari
- ✅ Ready untuk di-isi menu assignments

**Screenshot Location**:
```
/menu-planning/create
```

---

### **Phase 2: ADD MENU ASSIGNMENTS** 🍽️

**Tujuan**: Mengisi menu untuk setiap hari dalam periode plan

**Current Status**: ❌ **BELUM ADA UI untuk add assignments**

**Yang Perlu Dibuat**:

#### **Option A: Calendar-based Assignment** (Recommended)
```
Location: /menu-planning/[id] → Calendar Tab

UI Components Needed:
1. Calendar Grid dengan:
   - Click pada tanggal → Open "Add Menu" dialog
   - Pilih meal type (SARAPAN, SNACK_PAGI, MAKAN_SIANG, etc)
   - Pilih menu dari dropdown (filter by meal type)
   - Input portions (default: program.targetRecipients)
   - Calculate cost automatically
   - Save assignment

2. Edit existing assignment:
   - Click pada assignment di calendar cell
   - Edit dialog dengan same form
   - Update assignment

3. Delete assignment:
   - Click assignment → Show delete button
   - Confirm delete
```

#### **Option B: Bulk Assignment Form** (Alternative)
```
Location: /menu-planning/[id] → Assignments Tab

UI Components Needed:
1. Table with date range
2. For each date:
   - Row with: Date | Meal Type | Menu Dropdown | Portions | Estimated Cost
   - Add/Remove meal type per date
3. Bulk actions:
   - Copy week template
   - Apply menu pattern
4. Save all assignments
```

#### **Option C: Template-based Assignment** (Future Enhancement)
```
Location: /menu-planning/[id] → Templates Tab

Features:
1. Load dari MenuPlanTemplate
2. Apply template ke date range
3. Auto-populate assignments
4. Review & adjust before save
```

---

### **Phase 3: REVIEW PLAN** 🔍

**Tujuan**: Review dan validasi sebelum submit untuk approval

**Steps**:
1. Navigate ke detail plan: `/menu-planning/[id]`
2. Review tabs:
   - **Overview**: Check plan details, dates, total cost
   - **Calendar**: Visual check semua assignments
   - **Analytics**: Check nutrition balance, cost efficiency
3. Validate:
   - ✅ Semua hari terisi (coverage 100%)
   - ✅ Variasi menu cukup (tidak terlalu repetitive)
   - ✅ Budget sesuai target
   - ✅ Nutrisi balance (protein, carbs, fat)
4. Edit jika perlu:
   - Add missing assignments
   - Replace menu yang terlalu sering repeat
   - Adjust portions jika cost over budget

**Decision Point**:
- ✅ **OK** → Lanjut ke Phase 4 (Submit for Review)
- ❌ **Not OK** → Back to Phase 2 (Edit assignments)

---

### **Phase 4: SUBMIT FOR APPROVAL** 📤

**Tujuan**: Submit plan untuk direview oleh approver (Kepala SPPG / Ahli Gizi)

**Steps**:
1. Di detail plan page
2. Klik button: **"Submit for Review"**
3. Confirm submission
4. Plan status berubah: **DRAFT** → **PENDING_REVIEW**

**Result**:
- ✅ Plan locked for editing (read-only)
- ✅ Notifikasi ke approver
- ✅ Approval workflow dimulai

**Screenshot Location**:
```
/menu-planning/[id] → "Submit for Review" button di header
```

---

### **Phase 5: APPROVAL PROCESS** ✅

**Tujuan**: Approver validate & approve plan

**Role**: SPPG_KEPALA atau SPPG_AHLI_GIZI

**Steps (Approver)**:
1. Receive notification tentang plan yang perlu diapprove
2. Navigate ke: `/menu-planning/[id]`
3. Review plan:
   - Check calendar coverage
   - Review analytics (nutrition, cost)
   - Validate compliance dengan standar
4. Decision:
   - ✅ **Approve** → Status: **PENDING_REVIEW** → **APPROVED**
   - ❌ **Reject** → Status: **PENDING_REVIEW** → **DRAFT** (with comments)

**Actions**:
- Approve button
- Reject button (with reason)
- Add comments

**Result if Approved**:
- ✅ Plan status: **APPROVED**
- ✅ Ready untuk dipublish
- ✅ `approvedBy` & `approvedAt` recorded

---

### **Phase 6: PUBLISH PLAN** 📢

**Tujuan**: Publish plan untuk digunakan di production

**Steps**:
1. Navigate ke approved plan: `/menu-planning/[id]`
2. Klik button: **"Publish Plan"**
3. Confirm publish
4. Plan status berubah: **APPROVED** → **ACTIVE**

**Result**:
- ✅ Plan status: **ACTIVE**
- ✅ Visible untuk tim production
- ✅ Assignments siap di-execute
- ✅ `publishedAt` timestamp recorded

**What Happens Next**:
- Tim produksi bisa lihat menu yang harus dibuat
- System bisa generate procurement plan dari menu assignments
- Distribution schedule auto-generated

---

### **Phase 7: EXECUTION** 🏭

**Tujuan**: Execute plan di production

**Integration dengan Module Lain**:

#### **A. Procurement Integration**
```
MenuPlan (ACTIVE)
  ↓ Generate
ProcurementPlan
  ↓ Create
ProcurementOrders
  ↓ Execute
Inventory Updates
```

**Flow**:
1. System analyze menu assignments
2. Calculate total ingredient needs
3. Generate procurement plan
4. Create purchase orders
5. Update inventory when goods received

#### **B. Production Integration**
```
MenuPlan Assignments
  ↓ Daily Schedule
FoodProduction Schedule
  ↓ Execute
Production Records
  ↓ Track
Quality Control
```

**Flow**:
1. System show daily menu assignments
2. Production team prepare food
3. Record actual production (portions made)
4. QC validation
5. Update assignment status: **PLANNED** → **PRODUCED**

#### **C. Distribution Integration**
```
Production Records
  ↓ Ready to Distribute
Distribution Schedule
  ↓ Execute
Distribution Records
  ↓ Track
Beneficiary Received
```

**Flow**:
1. Food ready for distribution
2. Create distribution batches
3. Assign to delivery vehicles
4. Track distribution
5. Update assignment status: **PRODUCED** → **DISTRIBUTED**

---

## 📋 Assignment Status Lifecycle

### **Assignment Status Flow**:

```
PLANNED → IN_PRODUCTION → PRODUCED → DISTRIBUTED → COMPLETED
   ↓           ↓              ↓            ↓
 (Created)  (Cooking)    (Ready)    (Delivered)  (Confirmed)
```

### **Status Definitions**:

| Status | Description | Actions Available |
|--------|-------------|-------------------|
| **PLANNED** | Assignment created, not yet executed | Edit, Delete |
| **IN_PRODUCTION** | Food being prepared | View progress |
| **PRODUCED** | Food ready, waiting distribution | Create distribution |
| **DISTRIBUTED** | Food delivered to beneficiaries | View delivery details |
| **COMPLETED** | Full cycle completed | View reports |
| **CANCELLED** | Assignment cancelled | View reason |

---

## 🎯 User Roles & Permissions

### **Role-based Actions**:

| Role | Create Plan | Add Assignments | Submit | Approve | Publish | Delete |
|------|-------------|-----------------|--------|---------|---------|--------|
| **SPPG_KEPALA** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **SPPG_ADMIN** | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| **SPPG_AHLI_GIZI** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **SPPG_STAFF** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **SPPG_VIEWER** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### **Permission Notes**:
- **SPPG_KEPALA**: Full control (CEO/Director level)
- **SPPG_ADMIN**: Can plan & manage, but cannot approve own plans
- **SPPG_AHLI_GIZI**: Can plan & approve (nutrition expert)
- **SPPG_STAFF**: View-only access untuk execution
- **SPPG_VIEWER**: Read-only access

---

## 🚀 Quick Start Guide

### **Scenario: Buat Plan Menu untuk Bulan Januari 2026**

#### **Step 1: Create Plan** (5 menit)
```
1. Menu Planning → Create New Plan
2. Name: "Rencana Menu Januari 2026"
3. Program: "Program Makan Siang Anak Sekolah"
4. Date: 1 Jan - 31 Jan 2026
5. Save as Draft
```

#### **Step 2: Add Menu Assignments** (30-60 menit)
```
❌ CURRENT: Belum ada UI - NEED TO BUILD

✅ FUTURE: 
1. Click Calendar tab
2. Click tanggal (e.g., 1 Januari 2026)
3. Add assignment:
   - Meal Type: MAKAN_SIANG
   - Menu: "Nasi + Ayam Goreng + Sayur Asem"
   - Portions: 5000 (auto-filled from program)
   - Estimated Cost: Rp 3,500,000 (auto-calculated)
4. Save
5. Repeat untuk semua hari kerja (weekdays only)
```

#### **Step 3: Review** (10 menit)
```
1. Overview tab: Check total cost, days covered
2. Calendar tab: Visual check all assignments
3. Analytics tab: Check nutrition balance
4. Validate: Coverage 100%, budget OK, nutrition OK
```

#### **Step 4: Submit** (1 menit)
```
1. Click "Submit for Review" button
2. Confirm
3. Wait for approval
```

#### **Step 5: Approve** (5 menit - by Approver)
```
1. Approver login
2. Navigate to plan
3. Review analytics
4. Click "Approve"
5. Add approval notes
```

#### **Step 6: Publish** (1 menit)
```
1. Click "Publish Plan"
2. Confirm
3. Plan now ACTIVE
```

#### **Step 7: Execute** (Daily operations)
```
Production team:
1. View daily assignments
2. Prepare food according to menu
3. Record production
4. Distribute to schools
5. Update assignment status
```

---

## ❗ Current Limitations & TODO

### **🚧 Missing Features** (HARUS DIBUAT):

#### **1. Add/Edit Assignment UI** ⚠️ **CRITICAL**
**Status**: ❌ Not implemented

**What Needed**:
- Dialog/Modal untuk add assignment
- Form fields:
  - Date selector (must be within plan date range)
  - Meal type dropdown
  - Menu dropdown (filtered by meal type)
  - Portions input (default from program.targetRecipients)
  - Cost display (auto-calculated)
- Integration dengan Calendar component
- API endpoint: `POST /api/sppg/menu-planning/[id]/assignments`

**Priority**: 🔴 **HIGH** - Tanpa ini, user tidak bisa mengisi menu!

**Recommended Location**:
```tsx
// src/features/sppg/menu-planning/components/AssignmentDialog.tsx
<Dialog>
  <DialogContent>
    <AssignmentForm 
      planId={planId}
      date={selectedDate}
      onSave={handleSaveAssignment}
    />
  </DialogContent>
</Dialog>
```

---

#### **2. Submit for Review Button** ⚠️ **HIGH PRIORITY**
**Status**: ❌ Not implemented

**What Needed**:
- Button di detail page header
- Confirm dialog
- API call: `POST /api/sppg/menu-planning/[id]/submit`
- Status update: DRAFT → PENDING_REVIEW

**Recommended Location**:
```tsx
// src/features/sppg/menu-planning/components/MenuPlanDetail.tsx
{plan.status === 'DRAFT' && (
  <Button onClick={handleSubmitForReview}>
    <Send className="mr-2 h-4 w-4" />
    Submit for Review
  </Button>
)}
```

---

#### **3. Approve/Reject Actions** ⚠️ **HIGH PRIORITY**
**Status**: ❌ Not implemented

**What Needed**:
- Approve button (for SPPG_KEPALA, SPPG_AHLI_GIZI)
- Reject button dengan reason textarea
- API call: `POST /api/sppg/menu-planning/[id]/approve`
- API call: `POST /api/sppg/menu-planning/[id]/reject`

**Recommended Location**:
```tsx
// src/features/sppg/menu-planning/components/ApprovalActions.tsx
{plan.status === 'PENDING_REVIEW' && canApprove && (
  <div>
    <Button onClick={handleApprove}>Approve</Button>
    <Button variant="destructive" onClick={handleReject}>
      Reject
    </Button>
  </div>
)}
```

---

#### **4. Publish Plan Button** ⚠️ **MEDIUM PRIORITY**
**Status**: ❌ Not implemented

**What Needed**:
- Publish button
- Confirm dialog
- API call: `POST /api/sppg/menu-planning/[id]/publish`
- Status update: APPROVED → ACTIVE

---

#### **5. Assignment CRUD Endpoints** ⚠️ **CRITICAL**
**Status**: ❌ Not implemented

**What Needed**:
```typescript
// API Endpoints to create:
POST   /api/sppg/menu-planning/[id]/assignments
PUT    /api/sppg/menu-planning/[id]/assignments/[assignmentId]
DELETE /api/sppg/menu-planning/[id]/assignments/[assignmentId]
```

---

### **✅ Implemented Features**:

- ✅ Menu Plan list page with filters
- ✅ Menu Plan detail page with tabs
- ✅ Create Plan form
- ✅ Edit Plan form
- ✅ Calendar visualization (view-only)
- ✅ Analytics dashboard
- ✅ Plan status badges
- ✅ Multi-tenant security
- ✅ API endpoints: List, Create, Get, Update, Delete (Plan level)

---

## 📱 UI/UX Flow Diagram

### **Visual Flow**:

```
┌─────────────────────────────────────────────────────────────┐
│                    MENU PLANNING LIST                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  DRAFT   │  │ APPROVED │  │  ACTIVE  │  │COMPLETED │   │
│  │  Plan 1  │  │  Plan 2  │  │  Plan 3  │  │  Plan 4  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                    [Create New Plan]                         │
└─────────────────────────────────────────────────────────────┘
                           ↓ Click Plan
┌─────────────────────────────────────────────────────────────┐
│                   PLAN DETAIL PAGE                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Rencana Menu November 2025                          │   │
│  │  Status: DRAFT  |  1-30 Nov  |  5000 recipients     │   │
│  │  [Edit] [Submit for Review] [Delete]                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  Tabs: [Overview] [Calendar] [Analytics]                    │
│                                                               │
│  ┌─────────────── CALENDAR TAB ──────────────────────┐     │
│  │   Mon    Tue    Wed    Thu    Fri    Sat    Sun   │     │
│  │    1      2      3      4      5      6      7     │     │
│  │ [+]    [Menu]  [Menu]  [Menu]  [Menu]   -     -   │     │
│  │  Empty  Filled Filled Filled Filled  Weekend      │     │
│  │                                                      │     │
│  │  ⚠️ MISSING: Click [+] → Open Assignment Dialog    │     │
│  │  ⚠️ MISSING: Click [Menu] → Edit/Delete Dialog     │     │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ↓ After filling all dates
                     [Submit for Review]
                           ↓
┌─────────────────────────────────────────────────────────────┐
│               APPROVAL WORKFLOW                              │
│                                                               │
│  Status: PENDING_REVIEW                                      │
│                                                               │
│  Approver Actions:                                           │
│  [Approve Plan] [Reject with Reason]                        │
│                                                               │
│  ⚠️ MISSING: Approval buttons & logic                        │
└─────────────────────────────────────────────────────────────┘
                           ↓ Approved
                      [Publish Plan]
                           ↓
┌─────────────────────────────────────────────────────────────┐
│               ACTIVE PLAN                                    │
│                                                               │
│  Status: ACTIVE                                              │
│  Ready for Production Execution                              │
│                                                               │
│  Integration:                                                │
│  → Generate Procurement Plan                                 │
│  → Create Production Schedule                                │
│  → Setup Distribution Routes                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎓 Example: Complete Planning Cycle

### **Scenario: Plan Menu untuk Sekolah di Januari 2026**

**Context**:
- Program: "Program Makan Siang Anak Sekolah"
- Target: 5000 siswa
- Budget: Rp 7,000 per anak per hari
- Periode: 1-31 Januari 2026 (22 hari kerja)

**Total Budget**: 5000 siswa × 22 hari × Rp 7,000 = **Rp 770,000,000**

---

#### **Week 1: Planning**

**Day 1 (Create Plan)**:
```
1. Login sebagai SPPG_ADMIN
2. Menu Planning → Create New Plan
3. Fill form:
   - Name: "Menu Januari 2026"
   - Program: Select existing program
   - Start: 1 Jan 2026, End: 31 Jan 2026
   - Planning Rules:
     {
       "maxBudgetPerDay": 35000000,
       "minVarietyScore": 70,
       "maxMenuRepetitionPerWeek": 2
     }
4. Save as Draft
```

**Day 2-3 (Add Assignments)** - ⚠️ **NEED TO BUILD UI**:
```
❌ CURRENT: Manual SQL insert
✅ FUTURE: Use Calendar UI

For each weekday:
1. Click date on calendar
2. Open assignment dialog
3. Add meal:
   - Meal Type: MAKAN_SIANG
   - Menu: Select from 10 available menus
   - Portions: 5000 (auto-filled)
   - Cost: Auto-calculated
4. Save
5. Repeat for 22 working days
```

**Day 4 (Review)**:
```
1. Calendar tab: Check all 22 days filled
2. Analytics tab:
   - Nutrition: Protein 25g, Carbs 100g, Fat 15g (balanced ✅)
   - Cost: Avg Rp 35M/day (within budget ✅)
   - Variety: 8 different menus used (good ✅)
3. Validation passed
```

**Day 5 (Submit)**:
```
1. Click "Submit for Review"
2. Add notes: "Plan ready for approval"
3. Confirm
4. Status: DRAFT → PENDING_REVIEW
5. Notification sent to SPPG_KEPALA
```

---

#### **Week 2: Approval**

**Day 8 (Approval Process)**:
```
1. SPPG_KEPALA login
2. Navigate to plan
3. Review:
   - Check calendar coverage: 100% ✅
   - Check analytics: All metrics good ✅
   - Check budget: Within limit ✅
4. Click "Approve"
5. Add notes: "Approved - Good variety and nutrition"
6. Status: PENDING_REVIEW → APPROVED
```

**Day 9 (Publish)**:
```
1. SPPG_ADMIN login
2. Navigate to approved plan
3. Click "Publish Plan"
4. Confirm
5. Status: APPROVED → ACTIVE
6. Plan now visible for production team
```

---

#### **Week 3-4: Execution**

**Daily Operations** (Each working day):
```
Production Team:
1. View today's assignment:
   - Date: 15 Jan 2026
   - Menu: "Nasi + Ayam Goreng + Sayur Asem"
   - Portions: 5000

2. Production:
   - Cook food according to recipe
   - Record actual portions made: 5000
   - Quality control check
   - Update status: PLANNED → PRODUCED

3. Distribution:
   - Pack into containers
   - Assign to delivery vehicles
   - Distribute to schools
   - Record actual portions delivered: 5000
   - Update status: PRODUCED → DISTRIBUTED

4. Confirmation:
   - Schools confirm receipt
   - Update status: DISTRIBUTED → COMPLETED
```

---

## 📊 Reports & Analytics

### **Plan-Level Reports**:
- Coverage Report: Berapa % hari yang terisi
- Budget Report: Actual vs planned cost
- Nutrition Report: Average macros per day
- Variety Report: Menu diversity score
- Compliance Report: Meet nutrition standards?

### **Assignment-Level Reports**:
- Daily production summary
- Actual vs planned portions
- Cost variance analysis
- Distribution completion rate
- Beneficiary feedback scores

---

## 🔧 Technical Implementation Notes

### **Database Relations**:
```
MenuPlan (1) → (Many) MenuAssignment
MenuAssignment (Many) → (1) NutritionMenu
MenuPlan (Many) → (1) NutritionProgram
NutritionProgram (Many) → (1) SPPG
```

### **Status Transitions**:
```prisma
enum MenuPlanStatus {
  DRAFT              // Plan sedang disusun
  PENDING_REVIEW     // Waiting approval
  APPROVED           // Approved, ready to publish
  PUBLISHED          // Published, ready for execution
  ACTIVE             // Currently being executed
  COMPLETED          // Execution finished
  CANCELLED          // Plan dibatalkan
  ARCHIVED           // Old plan (for history)
}

enum AssignmentStatus {
  PLANNED            // Assignment created
  IN_PRODUCTION      // Food being prepared
  PRODUCED           // Food ready
  DISTRIBUTED        // Food delivered
  COMPLETED          // Full cycle done
  CANCELLED          // Assignment cancelled
}
```

---

## 🚀 Next Steps - Development Priorities

### **Phase 1: Essential Features** (URGENT)
1. ✅ Assignment Dialog Component
2. ✅ Add Assignment API endpoint
3. ✅ Edit Assignment API endpoint
4. ✅ Delete Assignment API endpoint
5. ✅ Integration dengan Calendar component

### **Phase 2: Workflow Actions** (HIGH)
6. ✅ Submit for Review button & API
7. ✅ Approve/Reject actions & API
8. ✅ Publish Plan button & API
9. ✅ Status transition validations

### **Phase 3: Enhancements** (MEDIUM)
10. ✅ Bulk assignment operations
11. ✅ Template-based planning
12. ✅ Copy from previous plan
13. ✅ Smart menu suggestions (AI)

### **Phase 4: Integration** (LATER)
14. ✅ Procurement integration
15. ✅ Production integration
16. ✅ Distribution integration
17. ✅ Reporting dashboard

---

## 📞 Support & Questions

**Need Help?**
- Documentation: `/docs/MENU_PLANNING_*.md`
- API Reference: `/api/sppg/menu-planning`
- Contact: admin@bagizi-id.com

**Feedback**:
- Report bugs via GitHub Issues
- Feature requests via Product Board
- Questions via Slack #menu-planning

---

**Last Updated**: October 16, 2025  
**Author**: Bagizi-ID Development Team  
**Version**: 1.0 - Initial Guide
