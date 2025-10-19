# Comprehensive Distribution Domain Schema Analysis 📊

**Date**: October 18, 2025
**Analyst**: Architecture Review
**Purpose**: Deep analysis of all distribution-related models in Prisma schema

---

## 🎯 Executive Summary

### **Models Found**: 8 core models
### **Related Enums**: 6 enums
### **Key Finding**: **REDUNDANCY CONFIRMED** - `SchoolDistribution` duplicates `FoodDistribution`

---

## 📋 Distribution Domain Models

### **1. FoodDistribution** (PRIMARY MODEL) ⭐

**Location**: Line 3184
**Table**: `food_distributions`
**Status**: ✅ ACTIVE - Primary distribution model

#### **Core Fields**:
```prisma
model FoodDistribution {
  id           String  @id @default(cuid())
  sppgId       String  // Multi-tenant
  programId    String
  productionId String?
  schoolId     String? // ✅ Optional - Supports school distributions
  
  // Distribution Details
  distributionDate DateTime
  distributionCode String   @unique
  mealType         MealType
  
  // Location
  distributionPoint String  // Nama sekolah/posyandu/lokasi
  address           String
  coordinates       String?
  
  // Planning
  plannedRecipients Int
  actualRecipients  Int?
  plannedStartTime  DateTime
  plannedEndTime    DateTime
  
  // Staff Assignment
  distributorId String  // Kepala distribusi
  driverId      String? // Sopir
  volunteers    String[] // Relawan
  
  // Logistics
  distributionMethod DistributionMethod?
  vehicleType        String?
  vehiclePlate       String?
  transportCost      Float?
  fuelCost           Float?
  otherCosts         Float?
  
  // Food Details
  menuItems     Json  // Detail menu (flexible)
  totalPortions Int
  portionSize   Float
  
  // Temperature Tracking (Quality Control)
  departureTemp Float?
  arrivalTemp   Float?
  servingTemp   Float?
  
  // Status Tracking
  status DistributionStatus @default(SCHEDULED)
  
  // Timing
  actualStartTime DateTime?
  actualEndTime   DateTime?
  departureTime   DateTime?
  arrivalTime     DateTime?
  completionTime  DateTime?
  
  // Quality Assessment
  foodQuality        QualityGrade?
  hygieneScore       Int? // 1-100
  packagingCondition String?
  
  // Environment
  weatherCondition String?
  temperature      Float?
  humidity         Float?
  
  // Documentation
  notes     String?
  photos    String[]
  signature String?
}
```

#### **Relations**:
```prisma
// Outbound Relations (FoodDistribution → Other Models)
sppg                SPPG
program             NutritionProgram
production          FoodProduction?
school              SchoolBeneficiary?  // ✅ IMPORTANT!
beneficiaryFeedback BeneficiaryFeedback[]
feedback            Feedback[]
```

#### **Indexes**:
```prisma
@@index([sppgId, distributionDate])      // Performance
@@index([programId, status])              // Filtering
@@index([status, distributionDate])       // Dashboard queries
@@index([distributionPoint])              // Search
@@index([schoolId, distributionDate])     // ✅ School filtering!
```

#### **Capabilities**:
- ✅ **Multi-recipient type**: Schools, posyandu, communities
- ✅ **Full logistics tracking**: Staff, vehicles, costs
- ✅ **Temperature monitoring**: Food safety compliance
- ✅ **Quality control**: Hygiene scores, packaging condition
- ✅ **Environmental tracking**: Weather, temperature, humidity
- ✅ **Documentation**: Photos, signatures, notes
- ✅ **Flexible menu**: JSON field supports any menu structure

#### **Use Cases**:
1. **School Distributions**: Use `schoolId` field
2. **Posyandu Distributions**: Use `distributionPoint` field
3. **Community Distributions**: General distribution point
4. **Mobile Unit Distributions**: Vehicle tracking

---

### **2. SchoolDistribution** (REDUNDANT MODEL) ❌

**Location**: Line 3685
**Table**: `school_distributions`
**Status**: ⚠️ **REDUNDANT** - Should be deprecated

#### **Core Fields**:
```prisma
model SchoolDistribution {
  id        String @id @default(cuid())
  programId String
  schoolId  String  // ⚠️ Also exists in FoodDistribution!
  menuId    String
  
  // Distribution Planning
  distributionDate DateTime
  targetQuantity   Int
  actualQuantity   Int
  
  // School Information (Denormalized)
  schoolName     String
  targetStudents Int
  
  // Menu Information (Denormalized)
  menuName    String
  portionSize Float
  totalWeight Float
  
  // Cost Information
  costPerPortion  Float
  totalCost       Float
  budgetAllocated Float?
  
  // Logistics
  deliveryTime    DateTime?
  deliveryAddress String
  deliveryContact String
  deliveryStatus  String  // ⚠️ Plain string, not enum!
  
  // Quality Control
  temperatureCheck Boolean
  foodTemperature  Float?
  qualityStatus    String?  // ⚠️ Plain string, not enum!
  qualityNotes     String?
  
  // Confirmation
  receivedBy String?
  receivedAt DateTime?
  signature  String?
  photos     String[]
  
  // Feedback
  schoolFeedback    String?
  satisfactionScore Int? // 1-5
  issues            String[]
  
  // Follow-up
  needsFollowUp Boolean
  followUpNotes String?
}
```

#### **Relations**:
```prisma
program NutritionProgram
school  SchoolBeneficiary
menu    NutritionMenu
reports SchoolFeedingReport[]
```

#### **Problems**:

1. **❌ Duplicate Fields**:
   - `schoolId` - Already in FoodDistribution
   - `distributionDate` - Duplicate
   - `deliveryStatus` - Duplicate (string vs enum)
   - `photos`, `signature` - Duplicate
   - Temperature tracking - Duplicate

2. **❌ Missing Features**:
   - No staff assignment (distributorId, driverId, volunteers)
   - No vehicle tracking
   - No cost breakdown (transport, fuel)
   - No weather/environment tracking
   - No production relation
   - No comprehensive quality assessment

3. **❌ Design Issues**:
   - Uses plain strings for status (not type-safe)
   - Denormalized data (schoolName, menuName stored directly)
   - Less flexible menu structure (single menuId only)
   - No distribution method enum

4. **❌ Limited Scope**:
   - Only for schools (not reusable)
   - Can't handle mixed distributions
   - No support for other beneficiary types

#### **Why It Exists**:
Likely created before `FoodDistribution.schoolId` field was added. Now completely redundant.

#### **Recommendation**: 
**⚠️ DEPRECATE AND MIGRATE** to `FoodDistribution`

---

### **3. DistributionSchedule** (SCHEDULING MODEL) ✅

**Location**: Line 5056
**Table**: `distribution_schedules`
**Status**: ✅ ACTIVE - Scheduling/planning layer

#### **Core Fields**:
```prisma
model DistributionSchedule {
  id     String @id @default(cuid())
  sppgId String
  
  // Schedule Details
  distributionDate DateTime
  wave             DistributionWave  // MORNING | MIDDAY
  
  // Target Information
  targetCategories       BeneficiaryCategory[]
  estimatedBeneficiaries Int
  
  // Menu & Portion
  menuName        String
  menuDescription String?
  portionSize     Float
  totalPortions   Int
  
  // Packaging
  packagingType String  // "OMPRENG", "BOX", "CONTAINER"
  packagingCost Float?
  
  // Distribution Method
  deliveryMethod   String    // "SCHOOL_DELIVERY", "PICKUP", "POSYANDU", "PKK"
  distributionTeam String[]  // Team member IDs
  
  // Logistics Planning
  vehicleCount        Int?
  estimatedTravelTime Int?   // Minutes
  fuelCost            Float?
  
  // Status
  status      String    @default("PLANNED")
  startedAt   DateTime?
  completedAt DateTime?
}
```

#### **Relations**:
```prisma
sppg       SPPG
deliveries DistributionDelivery[]  // One-to-many
```

#### **Purpose**:
- **Planning layer** for distribution
- **Wave management** (morning/midday)
- **Resource planning** (vehicles, team)
- **Parent for multiple deliveries**

#### **Use Case**:
```typescript
// Create schedule for a day
const schedule = await db.distributionSchedule.create({
  data: {
    sppgId: 'xxx',
    distributionDate: new Date('2025-10-20'),
    wave: 'MORNING',
    targetCategories: ['CHILD', 'TODDLER'],
    deliveryMethod: 'SCHOOL_DELIVERY',
    // ... planning data
  }
})

// Create multiple deliveries under this schedule
await db.distributionDelivery.createMany({
  data: [
    { scheduleId: schedule.id, targetName: 'SD 1', ... },
    { scheduleId: schedule.id, targetName: 'SD 2', ... },
    { scheduleId: schedule.id, targetName: 'SD 3', ... },
  ]
})
```

---

### **4. DistributionDelivery** (DELIVERY EXECUTION) ✅

**Location**: Line 5104
**Table**: `distribution_deliveries`
**Status**: ✅ ACTIVE - Execution layer

#### **Core Fields**:
```prisma
model DistributionDelivery {
  id         String @id @default(cuid())
  scheduleId String
  
  // Delivery Target
  targetType    String  // "SCHOOL", "POSYANDU", "INDIVIDUAL"
  targetName    String
  targetAddress String
  targetContact String?
  
  // Delivery Details
  estimatedArrival  DateTime
  actualArrival     DateTime?
  portionsDelivered Int
  
  // Delivery Team
  driverName  String
  helperNames String[]  // Helpers
  vehicleInfo String?
  
  // Delivery Status
  status      String    @default("ASSIGNED")
  deliveredBy String?   // Team member ID
  deliveredAt DateTime?
  
  // Proof of Delivery
  recipientName      String?
  recipientSignature String?  // URL
  deliveryPhoto      String?  // URL
  notes              String?
}
```

#### **Relations**:
```prisma
schedule DistributionSchedule
receipts BeneficiaryReceipt[]
```

#### **Purpose**:
- **Individual delivery tracking**
- **Proof of delivery** (POD)
- **Real-time status updates**
- **Child of DistributionSchedule**

---

### **5. BeneficiaryReceipt** (RECEIPT MANAGEMENT) ✅

**Location**: Line 5147
**Table**: `beneficiary_receipts`
**Status**: ✅ ACTIVE - Receipt/confirmation layer

#### **Core Fields**:
```prisma
model BeneficiaryReceipt {
  id         String  @id @default(cuid())
  sppgId     String
  deliveryId String?
  
  // Receipt Information
  receiptNumber String   @unique
  receiptDate   DateTime @default(now())
  
  // Beneficiary Information
  beneficiaryName     String
  beneficiaryId       String?
  beneficiaryCategory BeneficiaryCategory
  
  // School/Institution Information
  schoolName  String?
  className   String?
  teacherName String?
  
  // Meal Information
  mealType     String
  menuName     String
  portionCount Int
  
  // Receipt Status
  status     ReceiptStatus @default(PENDING)
  receivedAt DateTime?
  
  // Digital Proof
  recipientSignature String?  // URL
  photoProof         String?  // URL
  gpsLocation        String?  // GPS
  
  // Quality Feedback
  mealQuality Float?  // 1-5 rating
  feedback    String?
  
  // Follow-up
  followUpRequired Boolean
  followUpNotes    String?
}
```

#### **Purpose**:
- **Digital receipt** for beneficiaries
- **GPS verification**
- **Quality feedback** collection
- **Audit trail** for accountability

---

### **6. BeneficiaryFeedback** (FEEDBACK SYSTEM) ✅

**Location**: Line 8317
**Table**: `beneficiary_feedback_legacy`
**Status**: ✅ ACTIVE - Feedback collection

#### **Core Fields**:
```prisma
model BeneficiaryFeedback {
  id        String  @id @default(cuid())
  sppgId    String
  programId String?
  
  // Beneficiary Info
  beneficiaryId   String?
  beneficiaryName String
  beneficiaryType BeneficiaryType
  
  // Feedback Details
  feedbackType FeedbackType
  subject      String
  message      String
  rating       Int?
  status       FeedbackStatus @default(PENDING)
  
  // Related Entities
  menuId         String?
  distributionId String?
}
```

#### **Relations**:
```prisma
sppg         SPPG
program      NutritionProgram?
menu         NutritionMenu?
distribution FoodDistribution?  // ✅ Links to FoodDistribution
beneficiary  SchoolBeneficiary?
```

#### **Purpose**:
- **Collect feedback** from beneficiaries
- **Link to specific distributions**
- **Track satisfaction ratings**
- **Issue reporting**

---

### **7. SchoolBeneficiary** (SCHOOL MASTER DATA) ✅

**Location**: Line 2991
**Table**: `school_beneficiaries`
**Status**: ✅ ACTIVE - School information

#### **Key Relations**:
```prisma
model SchoolBeneficiary {
  // ... school data fields ...
  
  // Relations
  program           NutritionProgram
  distributions     SchoolDistribution[]  // ⚠️ Old relation
  foodDistributions FoodDistribution[]    // ✅ New relation!
  reports           SchoolFeedingReport[]
  feedback          BeneficiaryFeedback[]
  village           Village
}
```

#### **Important Note**:
- Has **TWO distribution relations**:
  1. `distributions` → SchoolDistribution (old, redundant)
  2. `foodDistributions` → FoodDistribution (new, preferred) ✅

---

## 📊 Enum Analysis

### **1. DistributionStatus** (Line 312)
```prisma
enum DistributionStatus {
  SCHEDULED      // Dijadwalkan
  PREPARING      // Persiapan
  IN_TRANSIT     // Dalam Perjalanan
  DISTRIBUTING   // Sedang Distribusi
  COMPLETED      // Selesai
  CANCELLED      // Dibatalkan
}
```
**Used by**: `FoodDistribution.status`
**Type-safe**: ✅ Yes

---

### **2. DeliveryStatus** (Line 321)
```prisma
enum DeliveryStatus {
  SCHEDULED   // Dijadwalkan
  DELIVERED   // Terkirim
  FAILED      // Gagal
  RETURNED    // Dikembalikan
  PARTIAL     // Sebagian
}
```
**Used by**: Various delivery tracking
**Type-safe**: ✅ Yes

---

### **3. DistributionMethod** (Line 518)
```prisma
enum DistributionMethod {
  DIRECT       // Langsung
  PICKUP       // Ambil Sendiri
  DELIVERY     // Diantar
  MOBILE_UNIT  // Unit Bergerak
}
```
**Used by**: `FoodDistribution.distributionMethod`
**Type-safe**: ✅ Yes

---

### **4. DistributionWave** (Line 750)
```prisma
enum DistributionWave {
  MORNING  // Pagi (08:00) - Balita, PAUD, TK/RA, SD kelas 1-3
  MIDDAY   // Siang (10:00) - SD kelas 4-6, SMP, SMA, ibu hamil & menyusui
}
```
**Used by**: `DistributionSchedule.wave`
**Purpose**: Age-based scheduling
**Type-safe**: ✅ Yes

---

### **5. DistributionScheduleStatus** (Line 7784)
```prisma
enum DistributionScheduleStatus {
  PLANNED
  PREPARED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}
```
**Used by**: Schedule tracking
**Type-safe**: ✅ Yes

---

### **6. DistributionDeliveryStatus** (Line 7793)
```prisma
enum DistributionDeliveryStatus {
  ASSIGNED
  DEPARTED
  DELIVERED
  FAILED
}
```
**Used by**: Delivery tracking
**Type-safe**: ✅ Yes

---

## 🔄 Model Relationships Map

```
┌─────────────────────────────────────────────────────────────┐
│                    DISTRIBUTION DOMAIN                       │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┐
│      SPPG        │ (Multi-tenant root)
└────────┬─────────┘
         │
         ├─────► NutritionProgram
         │            │
         │            ├─────► SchoolBeneficiary ──┐
         │            │              │            │
         │            │              │            │
         │            └──────┐       │            │
         │                   │       │            │
         ├─────► FoodProduction      │            │
         │            │               │            │
         │            │               │            │
    ┌────▼────────────▼───────────────▼────────────▼──┐
    │         FoodDistribution (PRIMARY)              │
    │  ✅ schoolId field                              │
    │  ✅ Comprehensive tracking                      │
    │  ✅ Multi-recipient type support                │
    └────┬────────────────────────────────────────────┘
         │
         ├─────► BeneficiaryFeedback
         └─────► Feedback

    ┌────────────────────────────────────────────┐
    │    SchoolDistribution (REDUNDANT!)        │
    │  ❌ Duplicate of FoodDistribution         │
    │  ❌ Should be deprecated                   │
    └────┬───────────────────────────────────────┘
         │
         └─────► SchoolFeedingReport

    ┌─────────────────────────────────┐
    │   DistributionSchedule          │ (Planning Layer)
    │   - Wave management             │
    │   - Resource planning           │
    └────┬────────────────────────────┘
         │
         ├─────► DistributionDelivery (Execution Layer)
         │            │
         │            └─────► BeneficiaryReceipt (Proof Layer)
         │
         └─────► [Multiple deliveries per schedule]
```

---

## 🎯 Key Findings & Recommendations

### **Critical Finding**: Redundancy

**Problem**: `SchoolDistribution` duplicates `FoodDistribution`

**Evidence**:
1. ✅ `FoodDistribution` already has `schoolId` field
2. ✅ `FoodDistribution` has school relation
3. ✅ `FoodDistribution` has more comprehensive features
4. ✅ `FoodDistribution` uses proper enums (type-safe)
5. ❌ `SchoolDistribution` lacks many features
6. ❌ `SchoolDistribution` uses plain strings (not type-safe)

---

### **Recommendation 1**: Deprecate `SchoolDistribution`

**Action Plan**:

1. **Migration Strategy**:
   ```sql
   -- Migrate existing SchoolDistribution data to FoodDistribution
   INSERT INTO food_distributions (
     sppg_id,
     program_id,
     school_id,
     distribution_date,
     -- ... map all fields
   )
   SELECT 
     p.sppg_id,
     sd.program_id,
     sd.school_id,
     sd.distribution_date,
     -- ... from SchoolDistribution
   FROM school_distributions sd
   JOIN nutrition_programs p ON sd.program_id = p.id
   WHERE sd.id NOT IN (
     SELECT source_id FROM migration_log 
     WHERE source_table = 'school_distributions'
   )
   ```

2. **Update Relations**:
   ```prisma
   model SchoolBeneficiary {
     // ❌ Remove old relation
     // distributions SchoolDistribution[]
     
     // ✅ Keep only new relation
     foodDistributions FoodDistribution[]
   }
   ```

3. **Deprecation Timeline**:
   - **Phase 1** (Week 1-2): Add deprecation warnings
   - **Phase 2** (Week 3-4): Migrate existing data
   - **Phase 3** (Week 5-6): Update all code references
   - **Phase 4** (Week 7-8): Remove model from schema

---

### **Recommendation 2**: Unified Distribution Domain Structure

**Proposed Architecture**:

```
/distribution (Single Domain)
├── page.tsx              # Main list with filters
├── new/
│   └── page.tsx          # Universal create form
├── [id]/
│   ├── page.tsx          # Detail view
│   └── edit/
│       └── page.tsx      # Edit form
└── components/
    ├── DistributionList.tsx         # With type filter
    ├── DistributionForm.tsx         # Universal form
    ├── DistributionCard.tsx
    ├── SchoolDistributionView.tsx   # School-specific view
    ├── PosyanduDistributionView.tsx # Posyandu-specific view
    └── filters/
        └── DistributionTypeFilter.tsx
```

**Features**:
- ✅ Single source of truth
- ✅ Type-based filtering (School/Posyandu/Community)
- ✅ Specialized views per type
- ✅ Unified data structure
- ✅ Consistent UI/UX

---

### **Recommendation 3**: Enhance FoodDistribution

**Suggested Improvements**:

1. **Add Recipient Type Field**:
   ```prisma
   model FoodDistribution {
     // ... existing fields ...
     
     recipientType RecipientType  // NEW: Explicit type
     
     // Relations (make all optional)
     school    SchoolBeneficiary?
     posyandu  Posyandu?         // If/when added
     community Community?        // If/when added
   }
   
   enum RecipientType {
     SCHOOL
     POSYANDU
     COMMUNITY
     INDIVIDUAL
   }
   ```

2. **Add School-Specific Fields** (optional):
   ```prisma
   model FoodDistribution {
     // ... existing fields ...
     
     // Optional school-specific data
     className         String?
     targetStudents    Int?
     receivedByTeacher String?
   }
   ```

3. **Better Indexing**:
   ```prisma
   @@index([recipientType, status, distributionDate])
   @@index([schoolId, status])
   @@index([sppgId, recipientType])
   ```

---

## 📈 Model Usage Matrix

| Model | Status | Purpose | Redundant | Action |
|-------|--------|---------|-----------|--------|
| **FoodDistribution** | ✅ Active | Primary distribution model | No | **Keep & Enhance** |
| **SchoolDistribution** | ⚠️ Active | School-specific (duplicate) | **Yes** | **Deprecate** |
| **DistributionSchedule** | ✅ Active | Planning/scheduling layer | No | Keep |
| **DistributionDelivery** | ✅ Active | Delivery execution | No | Keep |
| **BeneficiaryReceipt** | ✅ Active | Digital receipts | No | Keep |
| **BeneficiaryFeedback** | ✅ Active | Feedback collection | No | Keep |
| **SchoolBeneficiary** | ✅ Active | School master data | No | Keep |

---

## 🎉 Summary

### **Models in Distribution Domain**: 7 active models

### **Hierarchy**:
```
SPPG
 └─► NutritionProgram
      └─► FoodDistribution (PRIMARY) ⭐
           ├─► BeneficiaryFeedback
           └─► Feedback

SPPG
 └─► DistributionSchedule (PLANNING)
      └─► DistributionDelivery (EXECUTION)
           └─► BeneficiaryReceipt (PROOF)

SchoolDistribution (REDUNDANT - TO BE DEPRECATED) ❌
```

### **Key Decisions**:

1. ✅ **Use `FoodDistribution` as single source of truth**
2. ❌ **Deprecate `SchoolDistribution`**
3. ✅ **Keep scheduling/delivery models** (different purpose)
4. ✅ **Enhance FoodDistribution** with recipient type field

### **Expected Benefits**:

- 🎯 **Single source of truth** - No data duplication
- 🚀 **Better performance** - Fewer tables, better indexes
- 🛡️ **Type safety** - Use enums instead of strings
- 📊 **Better reporting** - Unified data structure
- 🔧 **Easier maintenance** - One model to update
- 📈 **More flexible** - Support any recipient type

---

**Analysis Complete** ✅
**Recommendation**: Proceed with `SchoolDistribution` deprecation and migration to `FoodDistribution`

---
