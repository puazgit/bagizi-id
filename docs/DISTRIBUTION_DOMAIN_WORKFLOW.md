# 🚚 Distribution Domain - Comprehensive Workflow Analysis

**Document Version**: 1.0.0  
**Last Updated**: October 19, 2025  
**Author**: Bagizi-ID Development Team  
**Status**: Analysis Complete

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Schema Analysis](#schema-analysis)
3. [Distribution Models Hierarchy](#distribution-models-hierarchy)
4. [Complete Workflow](#complete-workflow)
5. [API Endpoints](#api-endpoints)
6. [State Management](#state-management)
7. [Business Rules](#business-rules)
8. [Integration Points](#integration-points)
9. [Data Flow Diagrams](#data-flow-diagrams)

---

## 1. Overview

### 1.1 Domain Purpose
Domain Distribusi mengelola seluruh proses pendistribusian makanan dari dapur SPPG ke penerima manfaat (beneficiaries), termasuk:
- Penjadwalan distribusi
- Pengelolaan kendaraan dan logistik
- Pelacakan pengiriman
- Konfirmasi penerimaan
- Quality control di lokasi
- Feedback dan pelaporan

### 1.2 Core Models
```
FoodDistribution (Main)
├── DistributionSchedule
├── DistributionDelivery
├── SchoolDistribution
├── BeneficiaryReceipt
└── Vehicle & VehicleAssignment
```

### 1.3 Key Stakeholders
- **SPPG Admin/Kepala**: Approval & monitoring
- **Kepala Distribusi**: Planning & coordination
- **Sopir/Driver**: Vehicle operation & delivery
- **Relawan/Volunteers**: Assistance in distribution
- **Penerima (Schools/Beneficiaries)**: Recipients
- **Quality Control**: Food safety verification

---

## 2. Schema Analysis

### 2.1 FoodDistribution Model
```prisma
model FoodDistribution {
  id           String  @id @default(cuid())
  sppgId       String  // Multi-tenant isolation
  programId    String  // Nutrition program
  productionId String? // Link to production batch
  schoolId     String? // Optional school relation
  vehicleId    String? // Primary vehicle

  // Distribution Details
  distributionDate DateTime
  distributionCode String   @unique
  mealType         MealType

  // Location
  distributionPoint String
  address           String
  coordinates       String?

  // Planning
  plannedRecipients Int
  actualRecipients  Int?
  plannedStartTime  DateTime
  plannedEndTime    DateTime

  // Staff Assignment
  distributorId String   // Kepala distribusi
  driverId      String?  // Sopir
  volunteers    String[] // Relawan IDs

  // Logistics
  distributionMethod DistributionMethod?
  vehicleType        String? // DEPRECATED
  vehiclePlate       String? // DEPRECATED
  transportCost      Float?
  fuelCost           Float?
  otherCosts         Float?

  // Food Details
  menuItems     Json // Menu yang didistribusikan
  totalPortions Int
  portionSize   Float

  // Temperature Tracking
  departureTemp Float?
  arrivalTemp   Float?
  servingTemp   Float?

  // Status
  status DistributionStatus @default(SCHEDULED)

  // Timing
  actualStartTime DateTime?
  actualEndTime   DateTime?
  departureTime   DateTime?
  arrivalTime     DateTime?
  completionTime  DateTime?

  // Quality
  foodQuality        QualityGrade?
  hygieneScore       Int?
  packagingCondition String?

  // Environment
  weatherCondition String?
  temperature      Float?
  humidity         Float?

  // Documentation
  notes     String?
  photos    String[]
  signature String?

  // Relations
  sppg               SPPG
  program            NutritionProgram
  production         FoodProduction?
  school             SchoolBeneficiary?
  vehicle            Vehicle?
  vehicleAssignments VehicleAssignment[]
  feedback           Feedback[]
}
```

### 2.2 Supporting Models

#### DistributionSchedule
```prisma
model DistributionSchedule {
  id     String @id @default(cuid())
  sppgId String

  // Schedule
  distributionDate DateTime
  wave             DistributionWave // MORNING/MIDDAY

  // Target
  targetCategories       BeneficiaryCategory[]
  estimatedBeneficiaries Int

  // Menu
  menuName        String
  menuDescription String?
  portionSize     Float
  totalPortions   Int

  // Packaging
  packagingType String
  packagingCost Float?

  // Method
  deliveryMethod   String
  distributionTeam String[]

  // Logistics
  estimatedTravelTime Int?
  fuelCost            Float?

  // Status
  status      String @default("PLANNED")
  startedAt   DateTime?
  completedAt DateTime?

  // Relations
  sppg               SPPG
  deliveries         DistributionDelivery[]
  vehicleAssignments VehicleAssignment[]
}
```

#### DistributionDelivery
```prisma
model DistributionDelivery {
  id         String @id @default(cuid())
  scheduleId String

  // Target
  targetType    String // SCHOOL/POSYANDU/INDIVIDUAL
  targetName    String
  targetAddress String
  targetContact String?

  // Delivery
  estimatedArrival  DateTime
  actualArrival     DateTime?
  portionsDelivered Int

  // Team
  driverName  String
  helperNames String[]
  vehicleInfo String?

  // Status
  status      String @default("ASSIGNED")
  deliveredBy String?
  deliveredAt DateTime?

  // Proof
  recipientName      String?
  recipientSignature String?
  deliveryPhoto      String?
  notes              String?

  // Relations
  schedule DistributionSchedule
  receipts BeneficiaryReceipt[]
}
```

#### SchoolDistribution
```prisma
model SchoolDistribution {
  id        String @id @default(cuid())
  programId String
  schoolId  String
  menuId    String

  // Planning
  distributionDate DateTime
  targetQuantity   Int
  actualQuantity   Int @default(0)

  // School Info
  schoolName     String
  targetStudents Int

  // Menu Info
  menuName    String
  portionSize Float
  totalWeight Float @default(0)

  // Cost
  costPerPortion  Float @default(0)
  totalCost       Float @default(0)
  budgetAllocated Float?

  // Logistics
  deliveryTime    DateTime?
  deliveryAddress String
  deliveryContact String
  deliveryStatus  String @default("PLANNED")

  // Quality
  temperatureCheck Boolean @default(false)
  foodTemperature  Float?
  qualityStatus    String?
  qualityNotes     String?

  // Confirmation
  receivedBy String?
  receivedAt DateTime?
  signature  String?
  photos     String[]

  // Feedback
  schoolFeedback    String?
  satisfactionScore Int?
  issues            String[]

  // Follow-up
  needsFollowUp Boolean @default(false)
  followUpNotes String?

  // Relations
  program NutritionProgram
  school  SchoolBeneficiary
  menu    NutritionMenu
  reports SchoolFeedingReport[]
}
```

#### BeneficiaryReceipt
```prisma
model BeneficiaryReceipt {
  id         String  @id @default(cuid())
  sppgId     String
  deliveryId String?

  // Receipt
  receiptNumber String   @unique
  receiptDate   DateTime @default(now())

  // Beneficiary
  beneficiaryName     String
  beneficiaryId       String?
  beneficiaryCategory BeneficiaryCategory

  // School/Institution
  schoolName  String?
  className   String?
  teacherName String?

  // Meal
  mealType     String
  menuName     String
  portionCount Int

  // Status
  status     ReceiptStatus @default(PENDING)
  receivedAt DateTime?

  // Proof
  recipientSignature String?
  photoProof         String?
  gpsLocation        String?

  // Quality
  mealQuality Float?
  feedback    String?

  // Follow-up
  followUpRequired Boolean @default(false)
  followUpNotes    String?

  // Relations
  sppg     SPPG
  delivery DistributionDelivery?
}
```

### 2.3 Enums

```prisma
// Distribution Status
enum DistributionStatus {
  SCHEDULED     // Dijadwalkan
  PREPARING     // Persiapan
  IN_TRANSIT    // Dalam Perjalanan
  DISTRIBUTING  // Sedang Distribusi
  COMPLETED     // Selesai
  CANCELLED     // Dibatalkan
}

// Distribution Method
enum DistributionMethod {
  DIRECT       // Langsung
  PICKUP       // Ambil Sendiri
  DELIVERY     // Diantar
  MOBILE_UNIT  // Unit Bergerak
}

// Distribution Wave
enum DistributionWave {
  MORNING  // Pagi (08:00) - Balita, PAUD, TK/RA, SD 1-3
  MIDDAY   // Siang (10:00) - SD 4-6, SMP, SMA, ibu hamil
}

// Delivery Status
enum DeliveryStatus {
  SCHEDULED  // Dijadwalkan
  DELIVERED  // Terkirim
  FAILED     // Gagal
  RETURNED   // Dikembalikan
  PARTIAL    // Sebagian
}

// Receipt Status
enum ReceiptStatus {
  PENDING    // Menunggu
  CONFIRMED  // Dikonfirmasi
  REJECTED   // Ditolak
  DISPUTED   // Dipersengketakan
}
```

---

## 3. Distribution Models Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                    NutritionProgram                         │
│                    (Program Gizi)                           │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ├─── NutritionMenu (Menu)
                          │
                          ├─── FoodProduction (Produksi)
                          │           │
                          ↓           ↓
┌─────────────────────────────────────────────────────────────┐
│                   FoodDistribution                          │
│                   (Distribusi Utama)                        │
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐       │
│  │ Schedule    │  │  Logistics   │  │   Quality   │       │
│  │ Management  │  │  Management  │  │   Control   │       │
│  └─────────────┘  └──────────────┘  └─────────────┘       │
└─────────────────────────┬───────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ↓               ↓               ↓
┌──────────────────┐ ┌────────────┐ ┌──────────────────┐
│ Distribution     │ │  Vehicle   │ │ School           │
│ Schedule         │ │ Assignment │ │ Distribution     │
│ (Penjadwalan)    │ │ (Kendaraan)│ │ (Sekolah)        │
└────────┬─────────┘ └────────────┘ └────────┬─────────┘
         │                                    │
         ↓                                    ↓
┌──────────────────┐                 ┌──────────────────┐
│ Distribution     │                 │ School Feeding   │
│ Delivery         │                 │ Report           │
│ (Pengiriman)     │                 │ (Laporan)        │
└────────┬─────────┘                 └──────────────────┘
         │
         ↓
┌──────────────────┐
│ Beneficiary      │
│ Receipt          │
│ (Bukti Terima)   │
└──────────────────┘
```

---

## 4. Complete Workflow

### 4.1 Distribution Planning Phase

#### Step 1: Create Distribution Schedule
```typescript
POST /api/sppg/distribution/schedule

Input:
- distributionDate: DateTime
- wave: DistributionWave
- targetCategories: BeneficiaryCategory[]
- menuName: string
- totalPortions: int
- deliveryMethod: string

Business Rules:
1. Schedule dibuat berdasarkan production yang sudah COMPLETED
2. Harus ada production dengan quantity >= totalPortions
3. DistributionDate >= current date
4. Wave menentukan jam distribusi (MORNING: 08:00, MIDDAY: 10:00)
5. Target categories menentukan recipient list

Output:
- DistributionSchedule created with status "PLANNED"
```

#### Step 2: Create FoodDistribution Records
```typescript
POST /api/sppg/distribution

Input:
- programId: string (required)
- productionId: string (optional, link to production)
- distributionDate: DateTime
- distributionCode: string (auto-generated)
- mealType: MealType
- distributionPoint: string
- address: string
- coordinates: string (optional)
- plannedRecipients: int
- plannedStartTime: DateTime
- plannedEndTime: DateTime
- distributorId: string (required)
- driverId: string (optional)
- volunteers: string[] (optional)
- distributionMethod: DistributionMethod
- menuItems: Json (array of menu details)
- totalPortions: int
- portionSize: float

Business Rules:
1. programId must be valid and belong to sppgId
2. distributionCode format: DIST-{YYYYMMDD}-{sequence}
3. distributorId must be user with DISTRIBUTION role
4. plannedStartTime < plannedEndTime
5. totalPortions must match production quantity if linked
6. menuItems must include menuId, menuName, portions

Status: SCHEDULED

Output:
- FoodDistribution created with status SCHEDULED
```

#### Step 3: Assign Vehicles
```typescript
POST /api/sppg/distribution/vehicle-assignment

Input:
- distributionId: string (or scheduleId)
- vehicleId: string
- driverId: string
- helpers: string[]
- departureTime: DateTime
- estimatedArrival: DateTime
- route: Json (pickup points, delivery points)

Business Rules:
1. Vehicle must be AVAILABLE status
2. Driver must have valid license
3. Vehicle capacity >= total portions to deliver
4. Check maintenance schedule conflicts
5. Calculate fuel needs based on route

Output:
- VehicleAssignment created
- Vehicle status updated to IN_USE
```

### 4.2 Distribution Preparation Phase

#### Step 4: Update Status to PREPARING
```typescript
PATCH /api/sppg/distribution/{id}/status

Input:
- status: "PREPARING"
- notes: string (optional)

Business Rules:
1. Current status must be SCHEDULED
2. Production must be COMPLETED
3. All menu items must be ready
4. Packaging must be prepared

Actions:
- Update FoodDistribution status to PREPARING
- Send notification to distribution team
- Generate packing list
- Prepare quality control checklist

Output:
- Status updated to PREPARING
- Notifications sent
```

#### Step 5: Quality Control Check
```typescript
POST /api/sppg/distribution/{id}/quality-check

Input:
- departureTemp: float
- packagingCondition: string
- hygieneScore: int (1-100)
- notes: string

Business Rules:
1. departureTemp must be in safe range (>60°C for hot food)
2. packagingCondition must be INTACT or MINOR_DAMAGE
3. hygieneScore must be >= 80

Output:
- Quality check recorded
- If passed: Ready for dispatch
- If failed: Cannot proceed, need correction
```

### 4.3 Distribution Execution Phase

#### Step 6: Start Distribution (Departure)
```typescript
PATCH /api/sppg/distribution/{id}/depart

Input:
- departureTime: DateTime (auto: now())
- departureTemp: float
- weatherCondition: string
- temperature: float (environment)

Business Rules:
1. Status must be PREPARING
2. Vehicle must be assigned and ready
3. Driver must be present
4. Quality check must be passed

Actions:
- Update status to IN_TRANSIT
- Record departure time
- Update vehicle status to IN_USE
- Track GPS location (if available)
- Send ETA to recipients

Output:
- Status: IN_TRANSIT
- Real-time tracking enabled
```

#### Step 7: Arrival at Distribution Point
```typescript
PATCH /api/sppg/distribution/{id}/arrive

Input:
- arrivalTime: DateTime (auto: now())
- arrivalTemp: float
- gpsLocation: string
- photos: string[] (optional)

Business Rules:
1. Status must be IN_TRANSIT
2. arrivalTime >= departureTime
3. Arrival temp check (must be safe)
4. GPS location matches planned location (tolerance ±500m)

Actions:
- Update status to DISTRIBUTING
- Record arrival time and temp
- Calculate travel time
- Notify recipients

Output:
- Status: DISTRIBUTING
- Arrival recorded
```

#### Step 8: Food Distribution Process
```typescript
PATCH /api/sppg/distribution/{id}/distribute

Input:
- actualRecipients: int
- servingTemp: float
- recipientList: Json[] (name, id, portions)
- photos: string[]
- notes: string

Business Rules:
1. Status must be DISTRIBUTING
2. actualRecipients <= plannedRecipients
3. servingTemp must be in safe range
4. Track each recipient

Actions:
- Record actual distribution
- Update actualRecipients
- Create BeneficiaryReceipt for each recipient
- Photo documentation

Output:
- Distribution details recorded
- Receipts generated
```

### 4.4 Distribution Completion Phase

#### Step 9: Complete Distribution
```typescript
PATCH /api/sppg/distribution/{id}/complete

Input:
- completionTime: DateTime (auto: now())
- actualRecipients: int
- signature: string (recipient signature)
- foodQuality: QualityGrade
- feedback: string
- photos: string[]

Business Rules:
1. Status must be DISTRIBUTING
2. All planned deliveries completed
3. All receipts confirmed
4. Quality assessment done

Actions:
- Update status to COMPLETED
- Record completion time
- Calculate efficiency metrics
- Update inventory (if tracked)
- Generate distribution report
- Send completion notification

Output:
- Status: COMPLETED
- Distribution report generated
- Metrics updated
```

#### Step 10: Post-Distribution Follow-up
```typescript
POST /api/sppg/distribution/{id}/feedback

Input:
- recipientFeedback: string
- satisfactionScore: int (1-5)
- issues: string[]
- suggestions: string[]
- followUpRequired: boolean

Business Rules:
1. Feedback can be submitted within 7 days
2. Issues must be categorized
3. Follow-up actions assigned if needed

Actions:
- Record feedback
- Create follow-up tasks if needed
- Update recipient satisfaction metrics
- Generate improvement recommendations

Output:
- Feedback recorded
- Follow-up tasks created (if needed)
```

### 4.5 School Distribution Workflow

#### School-Specific Flow
```typescript
// Create School Distribution
POST /api/sppg/distribution/school

Input:
- programId: string
- schoolId: string
- menuId: string
- distributionDate: DateTime
- targetQuantity: int
- deliveryAddress: string
- deliveryContact: string

Business Rules:
1. School must be active beneficiary
2. Menu must be approved
3. Target quantity based on enrolled students
4. Cost calculation automatic

Flow:
PLANNED → IN_TRANSIT → DELIVERED → CONFIRMED

// Confirmation Process
PATCH /api/sppg/distribution/school/{id}/confirm

Input:
- actualQuantity: int
- receivedBy: string (teacher/staff name)
- signature: string
- foodTemperature: float
- qualityStatus: string
- photos: string[]
- schoolFeedback: string

Output:
- Status: CONFIRMED
- Receipt generated
- School feeding report created
```

### 4.6 Receipt Management Workflow

```typescript
// Generate Receipt
POST /api/sppg/distribution/receipt

Input:
- deliveryId: string
- beneficiaryName: string
- beneficiaryId: string (NIK)
- beneficiaryCategory: BeneficiaryCategory
- mealType: string
- menuName: string
- portionCount: int

Output:
- Receipt number: RCP-{YYYYMMDD}-{sequence}
- Status: PENDING

// Confirm Receipt
PATCH /api/sppg/distribution/receipt/{id}/confirm

Input:
- recipientSignature: string
- photoProof: string
- gpsLocation: string
- mealQuality: float (1-5)
- feedback: string

Output:
- Status: CONFIRMED
- Digital proof recorded
```

---

## 5. API Endpoints

### 5.1 Main Distribution APIs

```typescript
// ============================================================================
// FoodDistribution CRUD
// ============================================================================

GET    /api/sppg/distribution
       - List all distributions (filtered by sppgId)
       - Query params: status, date, programId, pagination

POST   /api/sppg/distribution
       - Create new distribution
       - Body: DistributionInput

GET    /api/sppg/distribution/{id}
       - Get distribution details
       - Include: relations, metrics

PATCH  /api/sppg/distribution/{id}
       - Update distribution
       - Body: Partial<DistributionInput>

DELETE /api/sppg/distribution/{id}
       - Delete distribution (only if SCHEDULED)

// ============================================================================
// Distribution Status Management
// ============================================================================

PATCH  /api/sppg/distribution/{id}/status
       - Update status
       - Body: { status, notes }

POST   /api/sppg/distribution/{id}/prepare
       - Start preparation phase
       - Body: { packagingType, qualityChecks }

POST   /api/sppg/distribution/{id}/depart
       - Record departure
       - Body: { departureTime, departureTemp }

POST   /api/sppg/distribution/{id}/arrive
       - Record arrival
       - Body: { arrivalTime, arrivalTemp, gpsLocation }

POST   /api/sppg/distribution/{id}/complete
       - Complete distribution
       - Body: { completionData, signature, feedback }

POST   /api/sppg/distribution/{id}/cancel
       - Cancel distribution
       - Body: { reason, notes }

// ============================================================================
// Distribution Schedule APIs
// ============================================================================

GET    /api/sppg/distribution/schedule
       - List schedules
       - Query: date, wave, status

POST   /api/sppg/distribution/schedule
       - Create schedule
       - Body: ScheduleInput

GET    /api/sppg/distribution/schedule/{id}
       - Get schedule details

PATCH  /api/sppg/distribution/schedule/{id}
       - Update schedule

DELETE /api/sppg/distribution/schedule/{id}
       - Delete schedule

// ============================================================================
// Distribution Delivery APIs
// ============================================================================

GET    /api/sppg/distribution/delivery
       - List deliveries
       - Query: scheduleId, status, date

POST   /api/sppg/distribution/delivery
       - Create delivery assignment
       - Body: DeliveryInput

PATCH  /api/sppg/distribution/delivery/{id}/confirm
       - Confirm delivery
       - Body: { deliveryProof, signature }

// ============================================================================
// School Distribution APIs
// ============================================================================

GET    /api/sppg/distribution/school
       - List school distributions
       - Query: schoolId, date, status

POST   /api/sppg/distribution/school
       - Create school distribution
       - Body: SchoolDistributionInput

PATCH  /api/sppg/distribution/school/{id}/confirm
       - Confirm school delivery
       - Body: { confirmationData }

GET    /api/sppg/distribution/school/{id}/report
       - Get school feeding report

// ============================================================================
// Receipt Management APIs
// ============================================================================

GET    /api/sppg/distribution/receipt
       - List receipts
       - Query: date, beneficiaryCategory, status

POST   /api/sppg/distribution/receipt
       - Generate receipt
       - Body: ReceiptInput

PATCH  /api/sppg/distribution/receipt/{id}/confirm
       - Confirm receipt
       - Body: { signature, proof }

GET    /api/sppg/distribution/receipt/{receiptNumber}
       - Get receipt by number

// ============================================================================
// Vehicle Assignment APIs
// ============================================================================

POST   /api/sppg/distribution/vehicle-assignment
       - Assign vehicle to distribution
       - Body: VehicleAssignmentInput

GET    /api/sppg/distribution/{id}/vehicles
       - Get assigned vehicles

PATCH  /api/sppg/distribution/vehicle-assignment/{id}
       - Update vehicle assignment

// ============================================================================
// Analytics & Reporting APIs
// ============================================================================

GET    /api/sppg/distribution/statistics
       - Get distribution statistics
       - Query: startDate, endDate, groupBy

GET    /api/sppg/distribution/upcoming
       - Get upcoming distributions
       - Query: days (default: 7)

GET    /api/sppg/distribution/active
       - Get active distributions (IN_TRANSIT, DISTRIBUTING)

GET    /api/sppg/distribution/metrics
       - Get distribution metrics
       - Includes: efficiency, on-time rate, satisfaction

GET    /api/sppg/distribution/export
       - Export distribution data
       - Query: format (csv, excel, pdf), filters
```

### 5.2 API Response Formats

```typescript
// Success Response
{
  success: true,
  data: T,
  meta?: {
    pagination?: {
      page: number
      pageSize: number
      total: number
      totalPages: number
    }
    summary?: {
      totalDistributions: number
      completedDistributions: number
      activeDistributions: number
      totalRecipients: number
    }
  }
}

// Error Response
{
  success: false,
  error: string,
  details?: any,
  code?: string
}
```

---

## 6. State Management

### 6.1 Zustand Store Structure

```typescript
// src/features/sppg/distribution/stores/distributionStore.ts

interface DistributionState {
  // Data
  distributions: Distribution[]
  currentDistribution: Distribution | null
  schedules: DistributionSchedule[]
  deliveries: DistributionDelivery[]
  
  // UI State
  isLoading: boolean
  error: string | null
  filters: {
    status: DistributionStatus[]
    dateRange: { start: Date; end: Date } | null
    programId: string | null
    search: string
  }
  
  // Pagination
  pagination: {
    page: number
    pageSize: number
    total: number
  }
  
  // Selected Items
  selectedDistributionIds: string[]
  
  // Actions
  fetchDistributions: () => Promise<void>
  createDistribution: (input: DistributionInput) => Promise<Distribution>
  updateDistribution: (id: string, data: Partial<Distribution>) => Promise<void>
  deleteDistribution: (id: string) => Promise<void>
  
  // Status Actions
  prepareDistribution: (id: string) => Promise<void>
  departDistribution: (id: string, data: DepartureData) => Promise<void>
  arriveDistribution: (id: string, data: ArrivalData) => Promise<void>
  completeDistribution: (id: string, data: CompletionData) => Promise<void>
  cancelDistribution: (id: string, reason: string) => Promise<void>
  
  // Filter Actions
  setFilters: (filters: Partial<DistributionFilters>) => void
  clearFilters: () => void
  
  // Selection Actions
  selectDistribution: (id: string) => void
  deselectDistribution: (id: string) => void
  selectAll: () => void
  clearSelection: () => void
}
```

### 6.2 TanStack Query Keys

```typescript
// Query Keys
export const distributionKeys = {
  all: ['distributions'] as const,
  lists: () => [...distributionKeys.all, 'list'] as const,
  list: (filters: DistributionFilters) => 
    [...distributionKeys.lists(), filters] as const,
  details: () => [...distributionKeys.all, 'detail'] as const,
  detail: (id: string) => [...distributionKeys.details(), id] as const,
  statistics: (filters: any) => 
    [...distributionKeys.all, 'statistics', filters] as const,
  upcoming: (days: number) => 
    [...distributionKeys.all, 'upcoming', days] as const,
  active: () => [...distributionKeys.all, 'active'] as const,
  schedules: () => [...distributionKeys.all, 'schedules'] as const,
  deliveries: () => [...distributionKeys.all, 'deliveries'] as const,
  receipts: () => [...distributionKeys.all, 'receipts'] as const,
}
```

---

## 7. Business Rules

### 7.1 Distribution Creation Rules

1. **Program Validation**
   - Program must be ACTIVE
   - Program must belong to user's SPPG
   - Program must have approved menus

2. **Production Linkage**
   - If productionId provided, production must be COMPLETED
   - Production quantity must be >= distribution quantity
   - Production date must be <= distribution date

3. **Schedule Validation**
   - Distribution date must be >= today
   - Wave determines distribution time:
     - MORNING: 08:00 - 10:00
     - MIDDAY: 10:00 - 12:00
   - Cannot schedule >2 distributions per day per location

4. **Staff Assignment**
   - Distributor must have DISTRIBUTION role
   - Driver must have valid license (if vehicle required)
   - Maximum 20 volunteers per distribution
   - Staff must not have conflicting assignments

5. **Menu Validation**
   - All menu items must exist and be approved
   - Total portions must match sum of menu portions
   - Portion sizes must be consistent with menu specs

6. **Location Validation**
   - Distribution point must be valid address
   - Coordinates format: "latitude,longitude"
   - Must be within service area

### 7.2 Status Transition Rules

```
SCHEDULED → PREPARING → IN_TRANSIT → DISTRIBUTING → COMPLETED
                ↓           ↓            ↓
            CANCELLED   CANCELLED    CANCELLED

Rules:
1. SCHEDULED → PREPARING
   - Production must be COMPLETED
   - All staff must be assigned
   - Quality checks must be passed

2. PREPARING → IN_TRANSIT
   - Food must be packed and ready
   - Temperature checks passed
   - Vehicle assigned and ready
   - Driver present

3. IN_TRANSIT → DISTRIBUTING
   - Must arrive at distribution point
   - GPS location verified
   - Arrival temperature check passed

4. DISTRIBUTING → COMPLETED
   - All recipients served
   - Quality assessment completed
   - Documentation complete (photos, signatures)
   - Receipts generated

5. Any Status → CANCELLED
   - Requires reason
   - SPPG_ADMIN approval required
   - Cannot cancel if DISTRIBUTING or COMPLETED
```

### 7.3 Quality Control Rules

1. **Temperature Checks** (Critical for Food Safety)
   - Departure: Hot food >60°C, Cold food <5°C
   - Transit: Maximum 2 hours in transit
   - Arrival: Hot food >55°C, Cold food <8°C
   - Serving: Hot food >50°C, Cold food <10°C

2. **Hygiene Score Requirements**
   - Minimum score: 80/100
   - Score <80: Cannot proceed
   - Score 80-89: Acceptable
   - Score 90-95: Good
   - Score >95: Excellent

3. **Packaging Condition**
   - INTACT: Proceed normally
   - MINOR_DAMAGE: Document and proceed
   - MAJOR_DAMAGE: Cannot proceed
   - CONTAMINATED: Must reject

4. **Documentation Requirements**
   - Minimum 2 photos at departure
   - Minimum 3 photos at distribution point
   - GPS location at all checkpoints
   - Recipient signature required

### 7.4 Receipt Management Rules

1. **Receipt Generation**
   - Auto-generate on distribution completion
   - Format: RCP-{YYYYMMDD}-{sequence}
   - Each beneficiary gets unique receipt

2. **Receipt Confirmation**
   - Must be confirmed within 24 hours
   - Requires signature or digital proof
   - GPS location must match distribution point

3. **Receipt Dispute**
   - Can be disputed within 7 days
   - Requires evidence (photos, testimony)
   - SPPG_ADMIN reviews and resolves

### 7.5 Vehicle Assignment Rules

1. **Vehicle Availability**
   - Vehicle status must be AVAILABLE
   - Not in maintenance schedule
   - Sufficient fuel level (>25%)
   - Valid insurance and registration

2. **Capacity Checks**
   - Vehicle capacity >= total portions
   - Consider weight: totalPortions × portionSize
   - Account for packaging volume

3. **Driver Requirements**
   - Valid driver's license
   - License type matches vehicle type
   - Not exceeding daily drive time limits
   - Medical clearance if required

4. **Route Optimization**
   - Calculate shortest/fastest route
   - Consider traffic patterns
   - Multiple stops optimization
   - Fuel estimation

---

## 8. Integration Points

### 8.1 Production Integration

```typescript
// Link Distribution to Production
const linkDistributionToProduction = async (
  distributionId: string,
  productionId: string
) => {
  // 1. Validate production
  const production = await db.foodProduction.findUnique({
    where: { id: productionId }
  })
  
  if (production.status !== 'COMPLETED') {
    throw new Error('Production must be completed')
  }
  
  if (production.actualQuantity < distribution.totalPortions) {
    throw new Error('Insufficient production quantity')
  }
  
  // 2. Link distribution
  await db.foodDistribution.update({
    where: { id: distributionId },
    data: { productionId }
  })
  
  // 3. Update production allocation
  await db.foodProduction.update({
    where: { id: productionId },
    data: {
      allocatedQuantity: {
        increment: distribution.totalPortions
      }
    }
  })
}
```

### 8.2 School Integration

```typescript
// Create School Distribution
const createSchoolDistribution = async (input: SchoolDistributionInput) => {
  // 1. Get school details
  const school = await db.schoolBeneficiary.findUnique({
    where: { id: input.schoolId }
  })
  
  // 2. Calculate costs
  const menu = await db.nutritionMenu.findUnique({
    where: { id: input.menuId }
  })
  
  const costPerPortion = menu.costPerServing
  const totalCost = costPerPortion * input.targetQuantity
  
  // 3. Create distribution
  const schoolDistribution = await db.schoolDistribution.create({
    data: {
      ...input,
      schoolName: school.schoolName,
      targetStudents: school.totalStudents,
      menuName: menu.menuName,
      portionSize: menu.servingSize,
      costPerPortion,
      totalCost,
      totalWeight: (menu.servingSize * input.targetQuantity) / 1000 // kg
    }
  })
  
  // 4. Create main FoodDistribution
  const foodDistribution = await db.foodDistribution.create({
    data: {
      sppgId: input.sppgId,
      programId: input.programId,
      schoolId: input.schoolId,
      distributionDate: input.distributionDate,
      distributionPoint: school.schoolName,
      address: school.address,
      plannedRecipients: school.totalStudents,
      totalPortions: input.targetQuantity,
      // ... other fields
    }
  })
  
  return { schoolDistribution, foodDistribution }
}
```

### 8.3 Vehicle Integration

```typescript
// Assign Vehicle
const assignVehicle = async (
  distributionId: string,
  vehicleId: string,
  driverId: string
) => {
  // 1. Check vehicle availability
  const vehicle = await db.vehicle.findUnique({
    where: { id: vehicleId }
  })
  
  if (vehicle.status !== 'AVAILABLE') {
    throw new Error('Vehicle not available')
  }
  
  // 2. Check maintenance schedule
  const hasMaintenance = await db.vehicleMaintenance.count({
    where: {
      vehicleId,
      scheduledDate: distribution.distributionDate,
      status: { in: ['SCHEDULED', 'IN_PROGRESS'] }
    }
  })
  
  if (hasMaintenance > 0) {
    throw new Error('Vehicle has scheduled maintenance')
  }
  
  // 3. Create assignment
  const assignment = await db.vehicleAssignment.create({
    data: {
      distributionId,
      vehicleId,
      driverId,
      assignmentDate: distribution.distributionDate,
      // ... other fields
    }
  })
  
  // 4. Update vehicle status
  await db.vehicle.update({
    where: { id: vehicleId },
    data: { status: 'ASSIGNED' }
  })
  
  // 5. Update distribution
  await db.foodDistribution.update({
    where: { id: distributionId },
    data: { vehicleId, driverId }
  })
  
  return assignment
}
```

### 8.4 Feedback Integration

```typescript
// Process Distribution Feedback
const processFeedback = async (
  distributionId: string,
  feedbackData: FeedbackInput
) => {
  // 1. Create feedback record
  const feedback = await db.feedback.create({
    data: {
      distributionId,
      ...feedbackData
    }
  })
  
  // 2. Update distribution metrics
  await db.foodDistribution.update({
    where: { id: distributionId },
    data: {
      // Calculate average satisfaction
      satisfactionScore: feedbackData.rating
    }
  })
  
  // 3. Check for issues
  if (feedbackData.issues && feedbackData.issues.length > 0) {
    // Create follow-up tasks
    const tasks = feedbackData.issues.map(issue => ({
      distributionId,
      issueType: issue.type,
      description: issue.description,
      priority: issue.severity,
      status: 'PENDING'
    }))
    
    await db.followUpTask.createMany({
      data: tasks
    })
  }
  
  // 4. Update quality metrics
  await updateQualityMetrics(distributionId, feedbackData)
  
  return feedback
}
```

---

## 9. Data Flow Diagrams

### 9.1 Distribution Creation Flow

```
┌──────────┐
│  User    │
│ (SPPG)   │
└────┬─────┘
     │
     │ 1. Fill Distribution Form
     │
     ↓
┌─────────────────────────────┐
│  DistributionForm.tsx       │
│  - Validate inputs          │
│  - Check production         │
│  - Select menu items        │
└────────────┬────────────────┘
             │
             │ 2. Submit Form
             │
             ↓
┌─────────────────────────────┐
│  useCreateDistribution()    │
│  - Call API                 │
│  - Handle loading           │
│  - Show notifications       │
└────────────┬────────────────┘
             │
             │ 3. POST Request
             │
             ↓
┌─────────────────────────────────────┐
│  POST /api/sppg/distribution        │
│  1. Auth check (session)            │
│  2. SPPG access check               │
│  3. Validate input (Zod)            │
│  4. Check production availability   │
│  5. Generate distribution code      │
│  6. Create FoodDistribution         │
│  7. Create related records          │
│  8. Return response                 │
└────────────┬────────────────────────┘
             │
             │ 4. DB Transaction
             │
             ↓
┌─────────────────────────────────────┐
│  Prisma Database                    │
│  ┌───────────────────────────────┐  │
│  │ FoodDistribution              │  │
│  │ - Basic info                  │  │
│  │ - Relations                   │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ AuditLog                      │  │
│  │ - Track creation              │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### 9.2 Distribution Execution Flow

```
SCHEDULED
    │
    │ User: Prepare Distribution
    ↓
┌─────────────────────┐
│ Quality Check       │
│ - Temperature       │
│ - Packaging         │
│ - Hygiene          │
└─────────┬───────────┘
          │ ✓ Passed
          ↓
      PREPARING
          │
          │ User: Confirm Departure
          ↓
┌─────────────────────┐
│ Record Departure    │
│ - Time              │
│ - Temperature       │
│ - GPS location      │
└─────────┬───────────┘
          │
          ↓
      IN_TRANSIT
          │
          │ GPS Tracking
          │ Real-time updates
          │
          │ User: Arrive at Location
          ↓
┌─────────────────────┐
│ Record Arrival      │
│ - Time              │
│ - Temperature       │
│ - Location verify   │
└─────────┬───────────┘
          │
          ↓
    DISTRIBUTING
          │
          │ User: Distribute Food
          │
          ↓
┌─────────────────────────┐
│ Track Distribution      │
│ - Recipient count       │
│ - Generate receipts     │
│ - Photos                │
│ - Signatures            │
└─────────┬───────────────┘
          │
          │ User: Complete
          ↓
┌─────────────────────────┐
│ Finalize Distribution   │
│ - Quality assessment    │
│ - Cost calculation      │
│ - Generate report       │
│ - Update metrics        │
└─────────┬───────────────┘
          │
          ↓
      COMPLETED
          │
          │ Post-completion
          ↓
┌─────────────────────────┐
│ Follow-up Actions       │
│ - Collect feedback      │
│ - Process issues        │
│ - Update analytics      │
└─────────────────────────┘
```

### 9.3 School Distribution Flow

```
┌────────────────┐
│ Create School  │
│ Distribution   │
└────────┬───────┘
         │
         ↓
┌──────────────────────────┐
│ Calculate Requirements   │
│ - Student count          │
│ - Portion size           │
│ - Total cost             │
│ - Budget check           │
└────────┬─────────────────┘
         │
         ↓
┌──────────────────────────┐
│ Schedule Delivery        │
│ - Assign vehicle         │
│ - Select driver          │
│ - Plan route             │
│ - Set ETA                │
└────────┬─────────────────┘
         │
         │ Status: PLANNED
         ↓
┌──────────────────────────┐
│ Prepare & Depart         │
│ - Pack food              │
│ - Quality check          │
│ - Load vehicle           │
│ - Start delivery         │
└────────┬─────────────────┘
         │
         │ Status: IN_TRANSIT
         ↓
┌──────────────────────────┐
│ Deliver to School        │
│ - Arrive at school       │
│ - Unload food            │
│ - Temperature check      │
│ - Hand over to staff     │
└────────┬─────────────────┘
         │
         │ Status: DELIVERED
         ↓
┌──────────────────────────┐
│ School Confirmation      │
│ - Verify quantity        │
│ - Quality assessment     │
│ - Sign receipt           │
│ - Take photos            │
└────────┬─────────────────┘
         │
         │ Status: CONFIRMED
         ↓
┌──────────────────────────┐
│ Generate Reports         │
│ - School feeding report  │
│ - Distribution summary   │
│ - Cost breakdown         │
│ - Quality metrics        │
└──────────────────────────┘
```

### 9.4 Receipt Generation Flow

```
┌─────────────────────┐
│ Distribution        │
│ Complete            │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────────────┐
│ For Each Recipient:         │
│                             │
│ ┌─────────────────────────┐ │
│ │ Generate Receipt        │ │
│ │ - Unique number         │ │
│ │ - Beneficiary info      │ │
│ │ - Meal details          │ │
│ │ - Portion count         │ │
│ └────────┬────────────────┘ │
│          │                  │
│          ↓                  │
│ ┌─────────────────────────┐ │
│ │ Create Receipt Record   │ │
│ │ - Status: PENDING       │ │
│ │ - QR code               │ │
│ │ - Print/send digital    │ │
│ └────────┬────────────────┘ │
└──────────┼──────────────────┘
           │
           ↓
┌─────────────────────────────┐
│ Recipient Confirmation      │
│ ┌─────────────────────────┐ │
│ │ Scan QR / Verify        │ │
│ │ - Digital signature     │ │
│ │ - GPS location          │ │
│ │ - Photo proof           │ │
│ └────────┬────────────────┘ │
│          │                  │
│          ↓                  │
│ ┌─────────────────────────┐ │
│ │ Update Receipt          │ │
│ │ - Status: CONFIRMED     │ │
│ │ - Timestamp             │ │
│ │ - Proof attached        │ │
│ └────────┬────────────────┘ │
└──────────┼──────────────────┘
           │
           ↓
┌─────────────────────────────┐
│ Quality Feedback (Optional) │
│ - Meal quality rating       │
│ - Comments                  │
│ - Issues reported           │
└─────────────────────────────┘
```

---

## 10. Implementation Checklist

### Phase 1: Core Distribution (✅ Mostly Complete)
- [x] FoodDistribution CRUD APIs
- [x] Distribution status management
- [x] Basic form components
- [x] List and card components
- [x] Schema validation
- [ ] Complete vehicle integration
- [ ] Temperature tracking implementation

### Phase 2: Advanced Features (🔄 In Progress)
- [ ] Distribution schedule management
- [ ] Real-time GPS tracking
- [ ] Photo upload and management
- [ ] Digital signature capture
- [ ] QR code generation for receipts
- [ ] Multi-vehicle assignment
- [ ] Route optimization

### Phase 3: School Integration (📝 Planned)
- [ ] School distribution APIs
- [ ] School feeding reports
- [ ] School confirmation workflow
- [ ] School-specific metrics
- [ ] Bulk school distribution

### Phase 4: Receipt Management (📝 Planned)
- [ ] Receipt generation system
- [ ] Receipt confirmation workflow
- [ ] Receipt dispute resolution
- [ ] Receipt analytics
- [ ] Digital receipt portal

### Phase 5: Analytics & Reporting (📝 Planned)
- [ ] Distribution efficiency metrics
- [ ] Cost per distribution analysis
- [ ] On-time delivery rate
- [ ] Recipient satisfaction tracking
- [ ] Quality trends analysis
- [ ] Export and reporting tools

### Phase 6: Mobile App Integration (📝 Future)
- [ ] Driver mobile app
- [ ] Recipient confirmation app
- [ ] Real-time tracking
- [ ] Offline capability
- [ ] Push notifications

---

## 11. Key Metrics & KPIs

### 11.1 Operational Metrics
```typescript
interface DistributionMetrics {
  // Efficiency
  onTimeDeliveryRate: number      // % distributions on time
  averageDeliveryTime: number     // Average time from depart to complete
  costPerDistribution: number     // Average cost per distribution
  costPerRecipient: number        // Average cost per recipient
  
  // Quality
  temperatureComplianceRate: number // % within safe temperature
  hygieneScoreAverage: number      // Average hygiene score
  foodQualityAverage: number       // Average quality grade
  satisfactionScore: number        // Average recipient satisfaction
  
  // Coverage
  totalRecipients: number          // Total recipients served
  totalPortions: number            // Total portions distributed
  coverageRate: number             // % of planned recipients reached
  distributionFrequency: number    // Distributions per week/month
  
  // Issues
  failedDeliveries: number         // Count of failed deliveries
  cancelledDistributions: number   // Count of cancellations
  issueRate: number                // % distributions with issues
  resolutionTime: number           // Average time to resolve issues
}
```

### 11.2 Financial Metrics
```typescript
interface FinancialMetrics {
  totalDistributionCost: number    // Total cost
  transportCost: number            // Vehicle & fuel costs
  packagingCost: number            // Packaging materials
  laborCost: number                // Staff costs
  overheadCost: number             // Other costs
  budgetUtilization: number        // % of budget used
  costVariance: number             // Planned vs actual cost
}
```

### 11.3 Dashboard Views

```typescript
// Distribution Overview Dashboard
interface DashboardData {
  today: {
    scheduled: number
    inProgress: number
    completed: number
    recipients: number
  }
  
  thisWeek: {
    total: number
    onTime: number
    delayed: number
    cancelled: number
  }
  
  trends: {
    distributionsOverTime: Array<{ date: string; count: number }>
    recipientsOverTime: Array<{ date: string; count: number }>
    satisfactionTrend: Array<{ date: string; score: number }>
  }
  
  topIssues: Array<{
    issue: string
    count: number
    severity: string
  }>
  
  vehicleUtilization: Array<{
    vehicleId: string
    vehicleName: string
    utilizationRate: number
    trips: number
  }>
}
```

---

## 12. Recommendations

### 12.1 Immediate Actions
1. ✅ **Complete Vehicle Integration**
   - Implement vehicle assignment workflow
   - Add vehicle availability checks
   - Create vehicle assignment tracking

2. ✅ **Enhance Temperature Tracking**
   - Add automated alerts for temperature violations
   - Implement temperature graph visualization
   - Add cold chain monitoring

3. ✅ **Implement Photo Management**
   - Add image upload functionality
   - Implement image compression
   - Create photo gallery component

4. ✅ **Add GPS Tracking**
   - Implement real-time location tracking
   - Add geofencing for distribution points
   - Create route visualization

### 12.2 Short-term Improvements
1. **School Distribution Workflow**
   - Complete school-specific APIs
   - Add bulk distribution feature
   - Implement school confirmation process

2. **Receipt Management**
   - Build receipt generation system
   - Add QR code functionality
   - Create digital receipt portal

3. **Analytics Enhancement**
   - Add distribution efficiency dashboard
   - Implement cost analysis tools
   - Create automated reports

### 12.3 Long-term Vision
1. **Mobile Application**
   - Driver app for delivery management
   - Recipient app for confirmation
   - Admin app for monitoring

2. **AI/ML Integration**
   - Route optimization algorithms
   - Demand prediction
   - Quality prediction models

3. **IoT Integration**
   - Temperature sensors
   - GPS trackers
   - Smart packaging

---

## Conclusion

Domain Distribusi adalah bagian krusial dari sistem Bagizi-ID yang menghubungkan produksi dengan penerima manfaat. Workflow yang komprehensif ini mencakup:

✅ **Complete Schema Analysis** - Semua model distribusi teridentifikasi  
✅ **Detailed Workflow** - 10 langkah distribusi dari planning hingga completion  
✅ **API Endpoints** - 30+ endpoints untuk management lengkap  
✅ **Business Rules** - Aturan validasi dan status transitions  
✅ **Integration Points** - Koneksi dengan Production, School, Vehicle  
✅ **Metrics & KPIs** - Pengukuran performa dan quality  

### Next Steps:
1. Implement remaining vehicle integration features
2. Complete school distribution workflow
3. Build receipt management system
4. Add analytics dashboard
5. Develop mobile applications

---

**Document Status**: ✅ Complete and Ready for Implementation  
**Last Review**: October 19, 2025  
**Next Review**: When implementing Phase 2 features
