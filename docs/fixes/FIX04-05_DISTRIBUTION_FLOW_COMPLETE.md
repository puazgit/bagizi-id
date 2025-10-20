# FIX #4-5: Distribution Flow - Schedule & Delivery Tracking

**Priority**: 🔥🔥 CRITICAL  
**Estimate**: 26 hours (3-4 days) - Combined Fix #4 (10h) + Fix #5 (16h)  
**Status**: ⏳ PENDING  
**Dependencies**: Fix #3 (Production must be fixed first)  
**Phase**: 1 - Week 3

---

## 📋 Problem Statement

### Current Broken State - Part 1: DistributionSchedule

```prisma
model DistributionSchedule {
  id                String      @id @default(cuid())
  programId         String
  
  // ❌ CRITICAL: Optional production link
  productionId      String?     // Should be required
  
  // ❌ HIGH: Free-text school tracking
  schoolName        String      // Duplicate from SchoolBeneficiary
  schoolLocation    String      // Duplicate address
  
  // Schedule & portions
  deliveryDate      DateTime
  scheduledPortions Int
  deliveryStatus    String      // Free text instead of enum
  
  // ❌ MEDIUM: No delivery route optimization
  // No route planning, vehicle assignment, driver tracking
  
  // Relations
  program           NutritionProgram @relation(...)
  production        FoodProduction? @relation(...)
  distributions     FoodDistribution[]
}
```

### Current Broken State - Part 2: FoodDistribution

```prisma
model FoodDistribution {
  id                String      @id @default(cuid())
  scheduleId        String
  
  // ❌ CRITICAL: Multiple optional relations
  productionId      String?     // Optional - can't track source
  schoolId          String?     // Optional - lose beneficiary link
  vehicleId         String?     // Optional - no vehicle tracking
  driverId          String?     // Optional - no driver accountability
  
  // Distribution tracking
  distributionDate  DateTime
  portionsDelivered Int
  deliveryStatus    String      // Free text
  
  // ❌ HIGH: No delivery confirmation
  // No signature, photo proof, GPS location
  
  // ❌ MEDIUM: No temperature monitoring
  // Critical for food safety - no cold chain tracking
  
  // Relations (all optional)
  schedule          DistributionSchedule @relation(...)
  production        FoodProduction? @relation(...)
  school            SchoolBeneficiary? @relation(...)
  vehicle           Vehicle? @relation(...)
  driver            User? @relation(...)
}
```

### Issues Identified

**DistributionSchedule Issues:**
1. **❌ CRITICAL - Optional Production Link**
   - Can schedule distribution without production
   - BREAKS production → distribution workflow
   - Can't verify food availability

2. **❌ HIGH - Free-Text School Tracking**
   - Duplicate school data (name, location)
   - Can't track beneficiary count accurately
   - Makes reporting unreliable

3. **❌ MEDIUM - No Route Optimization**
   - No delivery route planning
   - No vehicle/driver assignment
   - Inefficient distribution

**FoodDistribution Issues:**
1. **❌ CRITICAL - Multiple Optional Relations**
   - Can distribute without linking to production/school/vehicle/driver
   - BREAKS accountability and traceability
   - Impossible to track complete delivery chain

2. **❌ HIGH - No Delivery Confirmation**
   - No recipient signature
   - No photo proof of delivery
   - No GPS location tracking
   - Can't prove delivery happened

3. **❌ MEDIUM - No Food Safety Tracking**
   - No temperature monitoring during transport
   - No time-at-temperature tracking
   - Food safety compliance at risk

---

## 💥 Business Impact

### Broken Scenario #1: Distribute Non-Existent Food

**Current Broken Flow:**
```typescript
// Create distribution schedule WITHOUT production
const schedule = await db.distributionSchedule.create({
  data: {
    programId: "program-123",
    productionId: null,           // ❌ No production!
    schoolName: "SD Merdeka",     // ❌ Free text
    schoolLocation: "Jl. Gatot Subroto",  // ❌ Free text
    deliveryDate: new Date("2025-10-25"),
    scheduledPortions: 500,
    deliveryStatus: "SCHEDULED"
  }
})

// Create distribution delivery
const distribution = await db.foodDistribution.create({
  data: {
    scheduleId: schedule.id,
    productionId: null,           // ❌ No production link!
    schoolId: null,               // ❌ No school link!
    vehicleId: null,              // ❌ No vehicle!
    driverId: null,               // ❌ No driver!
    distributionDate: new Date(),
    portionsDelivered: 500,
    deliveryStatus: "DELIVERED"   // ❌ Claims delivered!
  }
})

// ❌ PROBLEMS:
// 1. No production exists - where did the food come from?
// 2. No school link - who received it?
// 3. No vehicle/driver - who delivered it?
// 4. No proof - how do we know it was delivered?
// 5. Reporting shows 500 portions distributed but NO production record!

// Result: Data corruption, fraud risk, accountability zero
```

**Expected Fixed Flow:**
```typescript
// Step 1: Production must be completed first
const production = await db.foodProduction.create({
  data: {
    menuId: "nasi-gudeg-id",
    targetPortions: 1000,
    productionStatus: "COMPLETED",
    actualPortions: 1000
  }
})

// Step 2: Create schedule WITH required production link
const schedule = await db.distributionSchedule.create({
  data: {
    programId: "program-123",
    productionId: production.id,   // ✅ Required!
    schoolId: "sd-merdeka-id",     // ✅ FK to SchoolBeneficiary
    deliveryDate: new Date("2025-10-25"),
    scheduledPortions: 500,
    vehicleId: "vehicle-1",        // ✅ Assigned vehicle
    driverId: "driver-1",          // ✅ Assigned driver
    deliveryStatus: "SCHEDULED"
  }
})

// Verify portions available
if (schedule.scheduledPortions > production.actualPortions) {
  throw new Error('Not enough portions produced')
}

// Step 3: Deliver with tracking
const distribution = await db.foodDistribution.create({
  data: {
    scheduleId: schedule.id,
    productionId: production.id,   // ✅ Required!
    schoolId: "sd-merdeka-id",     // ✅ Required!
    vehicleId: "vehicle-1",        // ✅ Required!
    driverId: "driver-1",          // ✅ Required!
    portionsDelivered: 500,
    deliveryStatus: "DELIVERED",
    
    // ✅ Delivery confirmation
    recipientName: "Kepala Sekolah",
    recipientSignature: "base64-signature",
    deliveryPhoto: "url-to-photo",
    gpsLatitude: -6.2088,
    gpsLongitude: 106.8456,
    confirmationTime: new Date(),
    
    // ✅ Food safety
    departureTemp: 4.5,           // °C
    arrivalTemp: 6.2,             // °C
    transportDuration: 45          // minutes
  }
})

// ✅ FIXED:
// - Complete production chain tracked
// - All stakeholders recorded
// - Delivery confirmed with proof
// - Food safety compliance
// - Full audit trail
```

### Broken Scenario #2: No Delivery Proof = Fraud Risk

**Problem:**
```typescript
// Driver claims delivered 500 portions
await db.foodDistribution.create({
  data: {
    scheduleId: "schedule-123",
    portionsDelivered: 500,
    deliveryStatus: "DELIVERED",  // ❌ Just a status, no proof!
    // No signature, no photo, no GPS, no nothing
  }
})

// Questions that can't be answered:
// - Did delivery actually happen?
// - Who received it?
// - When exactly was it delivered?
// - Where was it delivered (GPS)?
// - Was food still safe (temperature)?
// - Any issues during delivery?

// Result: Fraud easy, accountability zero, compliance fail
```

### Broken Scenario #3: Temperature Violation Undetected

**Problem:**
```typescript
// Food produced at 4°C (safe)
// Transported for 3 hours in 35°C heat
// Arrived at 25°C (DANGER ZONE!)

// ❌ Current system: No temperature tracking
// Distribution recorded as "DELIVERED"
// School serves potentially unsafe food
// Children get sick
// SPPG liable for food poisoning outbreak

// Root cause: No cold chain monitoring
```

---

## 🎯 Target State

### Fixed Schema - Part 1: DistributionSchedule

```prisma
model DistributionSchedule {
  id                String      @id @default(cuid())
  programId         String
  
  // ✅ REQUIRED: Production link
  productionId      String      // Required - must have production
  
  // ✅ REQUIRED: School link (no free text)
  schoolId          String      // FK to SchoolBeneficiary
  
  // Schedule details
  deliveryDate      DateTime
  scheduledPortions Int
  
  // ✅ Route planning
  vehicleId         String?     // Assigned vehicle
  driverId          String?     // Assigned driver
  routeOrder        Int?        // Order in delivery route
  estimatedDuration Int?        // Minutes
  estimatedDistance Float?      // Km
  
  // Status enum (not free text)
  deliveryStatus    DistributionStatus  @default(SCHEDULED)
  
  // Timestamps
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  createdBy         String?
  
  // Relations
  program           NutritionProgram @relation(...)
  production        FoodProduction @relation(...)  // ✅ Required
  school            SchoolBeneficiary @relation(...)  // ✅ Required
  vehicle           Vehicle? @relation(...)
  driver            User? @relation(...)
  distributions     FoodDistribution[]
  
  @@index([programId])
  @@index([productionId])
  @@index([schoolId])
  @@index([deliveryDate])
}

enum DistributionStatus {
  SCHEDULED         // Planned, not yet started
  IN_TRANSIT        // Driver picked up, delivering
  DELIVERED         // Confirmed delivered
  PARTIAL_DELIVERY  // Less than scheduled portions
  CANCELLED         // Cancelled
  FAILED            // Delivery failed (rejected, accident, etc)
}
```

### Fixed Schema - Part 2: FoodDistribution

```prisma
model FoodDistribution {
  id                String      @id @default(cuid())
  scheduleId        String
  
  // ✅ REQUIRED: All key relations
  productionId      String      // Required - track source
  schoolId          String      // Required - track destination
  vehicleId         String      // Required - track transport
  driverId          String      // Required - track driver
  
  // Distribution details
  distributionDate  DateTime    @default(now())
  portionsDelivered Int
  deliveryStatus    DistributionStatus
  
  // ✅ Delivery confirmation (required for DELIVERED status)
  recipientName     String?
  recipientPosition String?
  recipientSignature String?    // Base64 or file URL
  deliveryPhoto     String?     // Evidence photo URL
  deliveryNotes     String?
  
  // ✅ GPS tracking
  gpsLatitude       Float?
  gpsLongitude      Float?
  gpsAccuracy       Float?      // Meters
  confirmationTime  DateTime?
  
  // ✅ Food safety tracking
  departureTemp     Float?      // °C at departure
  arrivalTemp       Float?      // °C at arrival
  transportDuration Int?        // Minutes
  temperatureLog    Json?       // Detailed temp log
  
  // Quality issues
  qualityIssues     String?
  portionsRejected  Int?        @default(0)
  rejectionReason   String?
  
  // Timestamps
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  createdBy         String?
  
  // Relations (all required)
  schedule          DistributionSchedule @relation(...)
  production        FoodProduction @relation(...)
  school            SchoolBeneficiary @relation(...)
  vehicle           Vehicle @relation(...)
  driver            User @relation(...)
  
  @@index([scheduleId])
  @@index([productionId])
  @@index([schoolId])
  @@index([distributionDate])
}
```

### Benefits After Fix

1. **✅ Complete Traceability**
   - Production → Schedule → Distribution → Delivery
   - Every portion tracked from kitchen to school
   - Full audit trail for compliance

2. **✅ Fraud Prevention**
   - Mandatory delivery confirmation (signature + photo + GPS)
   - Can't claim delivered without proof
   - Driver accountability enforced

3. **✅ Food Safety Compliance**
   - Temperature monitoring required
   - Cold chain violations detected
   - Compliance reports automatic

4. **✅ Operational Efficiency**
   - Route optimization enabled
   - Vehicle/driver assignment clear
   - Distribution performance metrics

---

## 📝 Implementation Plan

### PART A: Fix DistributionSchedule (10 hours)

#### Step A1: Data Analysis (1.5 hours)

```sql
-- Check current distribution schedules
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN "productionId" IS NOT NULL THEN 1 END) as with_production,
  COUNT(CASE WHEN "productionId" IS NULL THEN 1 END) as orphaned
FROM "DistributionSchedule";

-- Find schedules without production
SELECT 
  ds."id",
  ds."schoolName",
  ds."scheduledPortions",
  ds."deliveryDate",
  ds."deliveryStatus",
  p."id" as program_id
FROM "DistributionSchedule" ds
JOIN "NutritionProgram" p ON ds."programId" = p."id"
WHERE ds."productionId" IS NULL;

-- Try to match with schools
SELECT 
  ds."schoolName",
  ds."schoolLocation",
  sb."id" as potential_school_id,
  sb."schoolName" as actual_school_name,
  SIMILARITY(ds."schoolName", sb."schoolName") as similarity
FROM "DistributionSchedule" ds
LEFT JOIN "SchoolBeneficiary" sb ON sb."schoolName" ILIKE '%' || ds."schoolName" || '%'
WHERE similarity > 0.7
ORDER BY ds."schoolName", similarity DESC;
```

#### Step A2: Create Missing Productions (2 hours)

```typescript
// prisma/scripts/create-missing-productions-for-schedules.ts

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function createMissingProductions() {
  const orphanedSchedules = await db.distributionSchedule.findMany({
    where: { productionId: null },
    include: {
      program: {
        include: {
          nutritionMenus: true  // Get program's menus
        }
      }
    }
  })
  
  console.log(`Found ${orphanedSchedules.length} schedules without production`)
  
  for (const schedule of orphanedSchedules) {
    try {
      // Get or create a menu for this program
      let menu = schedule.program.nutritionMenus[0]
      
      if (!menu) {
        // Create default menu for migration
        menu = await db.nutritionMenu.create({
          data: {
            programId: schedule.programId,
            menuName: `Legacy Menu (migrated)`,
            menuCode: `LEGACY-${Date.now()}`,
            mealType: 'SNACK',
            servingSize: 200,
            calories: 350,
            protein: 12,
            description: 'Auto-created during migration for orphaned schedules'
          }
        })
      }
      
      // Create production for this schedule
      const production = await db.foodProduction.create({
        data: {
          programId: schedule.programId,
          menuId: menu.id,
          productionDate: new Date(schedule.deliveryDate),
          productionDate.setDate(productionDate.getDate() - 1), // Day before delivery
          targetPortions: schedule.scheduledPortions,
          actualPortions: schedule.scheduledPortions,
          productionStatus: 'COMPLETED',
          batchNumber: `MIGRATED-${schedule.id.substring(0, 8)}`,
          notes: `Auto-created during migration for schedule ${schedule.id}`
        }
      })
      
      // Link schedule to production
      await db.distributionSchedule.update({
        where: { id: schedule.id },
        data: { productionId: production.id }
      })
      
      console.log(`✅ Created production for schedule ${schedule.id}`)
      
    } catch (error) {
      console.error(`❌ Failed for schedule ${schedule.id}:`, error)
    }
  }
}

createMissingProductions()
  .then(() => console.log('✅ Migration complete'))
  .catch(error => {
    console.error('Migration failed:', error)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
```

#### Step A3: Link to Schools (2 hours)

```typescript
// prisma/scripts/link-schedules-to-schools.ts

interface SchoolMapping {
  scheduleId: string
  currentName: string
  schoolId?: string
  confidence: number
  action: 'LINK' | 'CREATE'
}

async function linkSchedulesToSchools() {
  const schedules = await db.distributionSchedule.findMany({
    include: {
      program: {
        select: { sppgId: true }
      }
    }
  })
  
  const mappings: SchoolMapping[] = []
  
  for (const schedule of schedules) {
    // Try to find matching school
    const schools = await db.schoolBeneficiary.findMany({
      where: {
        program: {
          sppgId: schedule.program.sppgId
        }
      }
    })
    
    // Try exact match
    const exactMatch = schools.find(
      s => s.schoolName.toLowerCase() === schedule.schoolName.toLowerCase()
    )
    
    if (exactMatch) {
      mappings.push({
        scheduleId: schedule.id,
        currentName: schedule.schoolName,
        schoolId: exactMatch.id,
        confidence: 1.0,
        action: 'LINK'
      })
      continue
    }
    
    // Try fuzzy match
    const fuzzyMatches = schools
      .map(s => ({
        school: s,
        similarity: stringSimilarity(schedule.schoolName, s.schoolName)
      }))
      .filter(m => m.similarity > 0.8)
      .sort((a, b) => b.similarity - a.similarity)
    
    if (fuzzyMatches.length > 0) {
      mappings.push({
        scheduleId: schedule.id,
        currentName: schedule.schoolName,
        schoolId: fuzzyMatches[0].school.id,
        confidence: fuzzyMatches[0].similarity,
        action: 'LINK'
      })
    } else {
      // Need to create new school
      mappings.push({
        scheduleId: schedule.id,
        currentName: schedule.schoolName,
        confidence: 0,
        action: 'CREATE'
      })
    }
  }
  
  // Execute mappings
  for (const mapping of mappings) {
    if (mapping.action === 'CREATE') {
      // Create new school from schedule data
      const schedule = schedules.find(s => s.id === mapping.scheduleId)!
      
      const newSchool = await db.schoolBeneficiary.create({
        data: {
          programId: schedule.programId,
          schoolName: schedule.schoolName,
          address: schedule.schoolLocation,
          totalStudents: schedule.scheduledPortions, // Estimate
          gradeLevel: 'SD',  // Default
          enrollmentStatus: 'ACTIVE',
          notes: 'Auto-created during distribution schedule migration'
        }
      })
      
      await db.distributionSchedule.update({
        where: { id: schedule.id },
        data: { schoolId: newSchool.id }
      })
      
      console.log(`✅ Created school and linked: ${schedule.schoolName}`)
    } else {
      // Link to existing school
      await db.distributionSchedule.update({
        where: { id: mapping.scheduleId },
        data: { schoolId: mapping.schoolId }
      })
      
      console.log(`✅ Linked to existing school: ${mapping.currentName} (${(mapping.confidence * 100).toFixed(0)}%)`)
    }
  }
}
```

#### Step A4: Schema Migration - DistributionSchedule (2 hours)

```sql
-- prisma/migrations/YYYYMMDDHHMMSS_fix_distribution_schedule/migration.sql

-- Step 1: Add schoolId column (nullable for migration)
ALTER TABLE "DistributionSchedule"
  ADD COLUMN IF NOT EXISTS "schoolId" TEXT;

-- Step 2: Add other new columns
ALTER TABLE "DistributionSchedule"
  ADD COLUMN IF NOT EXISTS "vehicleId" TEXT,
  ADD COLUMN IF NOT EXISTS "driverId" TEXT,
  ADD COLUMN IF NOT EXISTS "routeOrder" INTEGER,
  ADD COLUMN IF NOT EXISTS "estimatedDuration" INTEGER,
  ADD COLUMN IF NOT EXISTS "estimatedDistance" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "createdBy" TEXT;

-- Step 3: Create DistributionStatus enum
CREATE TYPE "DistributionStatus" AS ENUM (
  'SCHEDULED',
  'IN_TRANSIT',
  'DELIVERED',
  'PARTIAL_DELIVERY',
  'CANCELLED',
  'FAILED'
);

-- Step 4: Migrate deliveryStatus to enum
-- First, map old free-text values to enum values
UPDATE "DistributionSchedule"
SET "deliveryStatus" = 
  CASE
    WHEN LOWER("deliveryStatus") IN ('scheduled', 'pending') THEN 'SCHEDULED'
    WHEN LOWER("deliveryStatus") IN ('in transit', 'delivering') THEN 'IN_TRANSIT'
    WHEN LOWER("deliveryStatus") IN ('delivered', 'complete') THEN 'DELIVERED'
    WHEN LOWER("deliveryStatus") IN ('partial') THEN 'PARTIAL_DELIVERY'
    WHEN LOWER("deliveryStatus") IN ('cancelled', 'canceled') THEN 'CANCELLED'
    WHEN LOWER("deliveryStatus") IN ('failed', 'rejected') THEN 'FAILED'
    ELSE 'SCHEDULED'
  END;

-- Change column type to enum
ALTER TABLE "DistributionSchedule"
  ALTER COLUMN "deliveryStatus" TYPE "DistributionStatus"
  USING "deliveryStatus"::"DistributionStatus";

-- Step 5: Verify all schedules have productionId and schoolId
DO $$
DECLARE
  no_production INTEGER;
  no_school INTEGER;
BEGIN
  SELECT COUNT(*) INTO no_production
  FROM "DistributionSchedule"
  WHERE "productionId" IS NULL;
  
  SELECT COUNT(*) INTO no_school
  FROM "DistributionSchedule"
  WHERE "schoolId" IS NULL;
  
  IF no_production > 0 OR no_school > 0 THEN
    RAISE EXCEPTION 'Migration incomplete: % without production, % without school', 
      no_production, no_school;
  END IF;
END $$;

-- Step 6: Make productionId and schoolId required
ALTER TABLE "DistributionSchedule"
  ALTER COLUMN "productionId" SET NOT NULL,
  ALTER COLUMN "schoolId" SET NOT NULL;

-- Step 7: Add foreign keys
ALTER TABLE "DistributionSchedule"
  ADD CONSTRAINT "DistributionSchedule_schoolId_fkey"
    FOREIGN KEY ("schoolId")
    REFERENCES "SchoolBeneficiary"("id")
    ON DELETE RESTRICT
    ON UPDATE CASCADE;

ALTER TABLE "DistributionSchedule"
  ADD CONSTRAINT "DistributionSchedule_vehicleId_fkey"
    FOREIGN KEY ("vehicleId")
    REFERENCES "Vehicle"("id")
    ON DELETE SET NULL
    ON UPDATE CASCADE;

ALTER TABLE "DistributionSchedule"
  ADD CONSTRAINT "DistributionSchedule_driverId_fkey"
    FOREIGN KEY ("driverId")
    REFERENCES "User"("id")
    ON DELETE SET NULL
    ON UPDATE CASCADE;

-- Step 8: Remove duplicate free-text fields
ALTER TABLE "DistributionSchedule"
  DROP COLUMN IF EXISTS "schoolName",
  DROP COLUMN IF EXISTS "schoolLocation";

-- Step 9: Add indexes
CREATE INDEX "DistributionSchedule_schoolId_idx" ON "DistributionSchedule"("schoolId");
CREATE INDEX "DistributionSchedule_vehicleId_idx" ON "DistributionSchedule"("vehicleId");
CREATE INDEX "DistributionSchedule_driverId_idx" ON "DistributionSchedule"("driverId");
```

#### Step A5: Update DistributionScheduleService (2 hours)

```typescript
// src/features/sppg/distribution/services/DistributionScheduleService.ts

export class DistributionScheduleService {
  /**
   * Create distribution schedule with validation
   */
  async createSchedule(data: {
    programId: string
    productionId: string
    schoolId: string
    deliveryDate: Date
    scheduledPortions: number
    vehicleId?: string
    driverId?: string
  }): Promise<DistributionSchedule> {
    // Validate production exists and has enough portions
    const production = await db.foodProduction.findUnique({
      where: { id: data.productionId },
      include: {
        _count: {
          select: {
            distributionSchedules: true
          }
        }
      }
    })
    
    if (!production) {
      throw new Error('Production not found')
    }
    
    if (production.productionStatus !== 'COMPLETED') {
      throw new Error('Production not completed yet')
    }
    
    // Calculate already scheduled portions
    const scheduledPortions = await db.distributionSchedule.aggregate({
      where: { productionId: data.productionId },
      _sum: { scheduledPortions: true }
    })
    
    const totalScheduled = (scheduledPortions._sum.scheduledPortions || 0) + data.scheduledPortions
    
    if (totalScheduled > production.actualPortions!) {
      throw new Error(
        `Cannot schedule ${data.scheduledPortions} portions. ` +
        `Production has ${production.actualPortions} portions, ` +
        `${scheduledPortions._sum.scheduledPortions || 0} already scheduled, ` +
        `${production.actualPortions! - (scheduledPortions._sum.scheduledPortions || 0)} available`
      )
    }
    
    // Validate school exists
    const school = await db.schoolBeneficiary.findUnique({
      where: { id: data.schoolId }
    })
    
    if (!school) {
      throw new Error('School not found')
    }
    
    // Create schedule
    return db.distributionSchedule.create({
      data: {
        ...data,
        deliveryStatus: 'SCHEDULED'
      },
      include: {
        production: true,
        school: true,
        vehicle: true,
        driver: true
      }
    })
  }
}
```

---

### PART B: Fix FoodDistribution (16 hours)

#### Step B1: Add Delivery Confirmation Fields (2 hours)

```sql
-- Add all new fields to FoodDistribution
ALTER TABLE "FoodDistribution"
  ADD COLUMN IF NOT EXISTS "recipientName" TEXT,
  ADD COLUMN IF NOT EXISTS "recipientPosition" TEXT,
  ADD COLUMN IF NOT EXISTS "recipientSignature" TEXT,
  ADD COLUMN IF NOT EXISTS "deliveryPhoto" TEXT,
  ADD COLUMN IF NOT EXISTS "deliveryNotes" TEXT,
  ADD COLUMN IF NOT EXISTS "gpsLatitude" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "gpsLongitude" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "gpsAccuracy" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "confirmationTime" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "departureTemp" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "arrivalTemp" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "transportDuration" INTEGER,
  ADD COLUMN IF NOT EXISTS "temperatureLog" JSONB,
  ADD COLUMN IF NOT EXISTS "qualityIssues" TEXT,
  ADD COLUMN IF NOT EXISTS "portionsRejected" INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT,
  ADD COLUMN IF NOT EXISTS "createdBy" TEXT;

-- Make key relations NOT NULL (after ensuring data migration)
ALTER TABLE "FoodDistribution"
  ALTER COLUMN "productionId" SET NOT NULL,
  ALTER COLUMN "schoolId" SET NOT NULL,
  ALTER COLUMN "vehicleId" SET NOT NULL,
  ALTER COLUMN "driverId" SET NOT NULL;
```

#### Step B2: Create FoodDistributionService (4 hours)

```typescript
// src/features/sppg/distribution/services/FoodDistributionService.ts

export class FoodDistributionService {
  /**
   * Start distribution (driver picks up food)
   */
  async startDistribution(
    scheduleId: string,
    data: {
      vehicleId: string
      driverId: string
      departureTemp: number
    }
  ): Promise<FoodDistribution> {
    const schedule = await db.distributionSchedule.findUnique({
      where: { id: scheduleId },
      include: {
        production: true,
        school: true
      }
    })
    
    if (!schedule) {
      throw new Error('Schedule not found')
    }
    
    if (schedule.deliveryStatus !== 'SCHEDULED') {
      throw new Error('Schedule not in SCHEDULED status')
    }
    
    // Validate temperature
    if (data.departureTemp > 10) {
      console.warn(`⚠️ WARNING: Departure temperature ${data.departureTemp}°C exceeds safe limit (10°C)`)
    }
    
    await db.$transaction(async (tx) => {
      // Update schedule status
      await tx.distributionSchedule.update({
        where: { id: scheduleId },
        data: {
          deliveryStatus: 'IN_TRANSIT',
          vehicleId: data.vehicleId,
          driverId: data.driverId
        }
      })
      
      // Create distribution record
      return tx.foodDistribution.create({
        data: {
          scheduleId,
          productionId: schedule.productionId,
          schoolId: schedule.schoolId,
          vehicleId: data.vehicleId,
          driverId: data.driverId,
          distributionDate: new Date(),
          portionsDelivered: 0,  // Will update on confirmation
          deliveryStatus: 'IN_TRANSIT',
          departureTemp: data.departureTemp
        }
      })
    })
  }
  
  /**
   * Complete distribution with confirmation
   */
  async confirmDelivery(
    distributionId: string,
    data: {
      portionsDelivered: number
      recipientName: string
      recipientPosition: string
      recipientSignature: string  // Base64
      deliveryPhoto: string       // File path or URL
      gpsLatitude: number
      gpsLongitude: number
      arrivalTemp: number
      qualityIssues?: string
      portionsRejected?: number
      rejectionReason?: string
    }
  ): Promise<FoodDistribution> {
    const distribution = await db.foodDistribution.findUnique({
      where: { id: distributionId },
      include: {
        schedule: true
      }
    })
    
    if (!distribution) {
      throw new Error('Distribution not found')
    }
    
    if (distribution.deliveryStatus !== 'IN_TRANSIT') {
      throw new Error('Distribution not in IN_TRANSIT status')
    }
    
    // Validate portions
    if (data.portionsDelivered > distribution.schedule.scheduledPortions) {
      throw new Error('Delivered portions exceed scheduled portions')
    }
    
    // Check temperature compliance
    const tempViolation = data.arrivalTemp > 10
    if (tempViolation) {
      console.error(`🚨 TEMPERATURE VIOLATION: ${data.arrivalTemp}°C exceeds safe limit!`)
    }
    
    // Calculate transport duration
    const transportDuration = Math.floor(
      (new Date().getTime() - distribution.distributionDate.getTime()) / 60000
    )
    
    // Determine final status
    const portionsRejected = data.portionsRejected || 0
    const status: DistributionStatus = 
      portionsRejected > 0 ? 'PARTIAL_DELIVERY' :
      data.portionsDelivered === distribution.schedule.scheduledPortions ? 'DELIVERED' :
      'PARTIAL_DELIVERY'
    
    return db.$transaction(async (tx) => {
      // Update distribution
      const updated = await tx.foodDistribution.update({
        where: { id: distributionId },
        data: {
          portionsDelivered: data.portionsDelivered,
          deliveryStatus: status,
          recipientName: data.recipientName,
          recipientPosition: data.recipientPosition,
          recipientSignature: data.recipientSignature,
          deliveryPhoto: data.deliveryPhoto,
          gpsLatitude: data.gpsLatitude,
          gpsLongitude: data.gpsLongitude,
          confirmationTime: new Date(),
          arrivalTemp: data.arrivalTemp,
          transportDuration,
          qualityIssues: tempViolation 
            ? `Temperature violation: ${data.arrivalTemp}°C. ${data.qualityIssues || ''}`
            : data.qualityIssues,
          portionsRejected,
          rejectionReason: data.rejectionReason
        }
      })
      
      // Update schedule status
      await tx.distributionSchedule.update({
        where: { id: distribution.scheduleId },
        data: { deliveryStatus: status }
      })
      
      // Create alert if temperature violation
      if (tempViolation) {
        await tx.notification.create({
          data: {
            type: 'FOOD_SAFETY_ALERT',
            title: 'Temperature Violation Detected',
            message: `Distribution ${distributionId} arrived at ${data.arrivalTemp}°C (safe limit: 10°C)`,
            severity: 'HIGH',
            relatedId: distributionId
          }
        })
      }
      
      return updated
    })
  }
}
```

#### Step B3: Create Mobile Delivery App Components (5 hours)

```typescript
// src/features/sppg/distribution/components/DeliveryConfirmationForm.tsx

'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Camera, MapPin, Thermometer, AlertTriangle } from 'lucide-react'
import SignatureCanvas from 'react-signature-canvas'

const confirmationSchema = z.object({
  portionsDelivered: z.number().positive(),
  recipientName: z.string().min(3),
  recipientPosition: z.string().min(2),
  recipientSignature: z.string().min(10),
  deliveryPhoto: z.string().url(),
  gpsLatitude: z.number().min(-90).max(90),
  gpsLongitude: z.number().min(-180).max(180),
  arrivalTemp: z.number(),
  qualityIssues: z.string().optional(),
  portionsRejected: z.number().min(0).optional(),
  rejectionReason: z.string().optional()
})

type ConfirmationInput = z.infer<typeof confirmationSchema>

interface DeliveryConfirmationFormProps {
  distributionId: string
  scheduledPortions: number
  onSubmit: (data: ConfirmationInput) => Promise<void>
}

export function DeliveryConfirmationForm({
  distributionId,
  scheduledPortions,
  onSubmit
}: DeliveryConfirmationFormProps) {
  const [gpsLocation, setGpsLocation] = useState<{lat: number, lng: number} | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const signatureRef = useRef<SignatureCanvas>(null)
  
  const form = useForm<ConfirmationInput>({
    resolver: zodResolver(confirmationSchema),
    defaultValues: {
      portionsDelivered: scheduledPortions,
      portionsRejected: 0
    }
  })
  
  // Get current GPS location
  const captureGPS = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setGpsLocation(location)
          form.setValue('gpsLatitude', location.lat)
          form.setValue('gpsLongitude', location.lng)
        },
        (error) => {
          alert('Failed to get GPS location: ' + error.message)
        },
        { enableHighAccuracy: true }
      )
    }
  }
  
  // Capture delivery photo
  const capturePhoto = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment' as any  // Mobile camera
    
    input.onchange = async (e: any) => {
      const file = e.target.files[0]
      if (file) {
        // Preview
        const reader = new FileReader()
        reader.onload = (e) => setPhotoPreview(e.target?.result as string)
        reader.readAsDataURL(file)
        
        // Upload to server
        const formData = new FormData()
        formData.append('file', file)
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        
        const data = await response.json()
        form.setValue('deliveryPhoto', data.url)
      }
    }
    
    input.click()
  }
  
  // Save signature
  const saveSignature = () => {
    if (signatureRef.current) {
      const signatureData = signatureRef.current.toDataURL()
      form.setValue('recipientSignature', signatureData)
    }
  }
  
  const arrivalTemp = form.watch('arrivalTemp')
  const tempWarning = arrivalTemp > 10
  
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Confirm Delivery</h2>
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* GPS Location */}
        <div>
          <label className="font-medium flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4" />
            GPS Location *
          </label>
          {gpsLocation ? (
            <div className="rounded-lg border p-3 bg-green-50">
              <p className="text-sm">
                📍 Lat: {gpsLocation.lat.toFixed(6)}, Lng: {gpsLocation.lng.toFixed(6)}
              </p>
            </div>
          ) : (
            <Button type="button" onClick={captureGPS} variant="outline">
              Capture Current Location
            </Button>
          )}
        </div>
        
        {/* Delivery Photo */}
        <div>
          <label className="font-medium flex items-center gap-2 mb-2">
            <Camera className="h-4 w-4" />
            Delivery Photo *
          </label>
          {photoPreview ? (
            <div className="space-y-2">
              <img src={photoPreview} alt="Delivery" className="w-full rounded-lg" />
              <Button type="button" onClick={capturePhoto} variant="outline" size="sm">
                Retake Photo
              </Button>
            </div>
          ) : (
            <Button type="button" onClick={capturePhoto} variant="outline">
              Take Photo
            </Button>
          )}
        </div>
        
        {/* Arrival Temperature */}
        <div>
          <label className="font-medium flex items-center gap-2 mb-2">
            <Thermometer className="h-4 w-4" />
            Arrival Temperature (°C) *
          </label>
          <Input
            type="number"
            step="0.1"
            {...form.register('arrivalTemp', { valueAsNumber: true })}
          />
          {tempWarning && (
            <Alert variant="destructive" className="mt-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Temperature {arrivalTemp}°C exceeds safe limit (10°C)!
                Food safety may be compromised.
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        {/* Recipient Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-medium mb-2 block">Recipient Name *</label>
            <Input {...form.register('recipientName')} placeholder="e.g., Kepala Sekolah" />
          </div>
          <div>
            <label className="font-medium mb-2 block">Position *</label>
            <Input {...form.register('recipientPosition')} placeholder="e.g., Principal" />
          </div>
        </div>
        
        {/* Signature */}
        <div>
          <label className="font-medium mb-2 block">Recipient Signature *</label>
          <div className="border rounded-lg">
            <SignatureCanvas
              ref={signatureRef}
              canvasProps={{
                className: 'w-full h-40 bg-white rounded-lg'
              }}
              onEnd={saveSignature}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => signatureRef.current?.clear()}
          >
            Clear Signature
          </Button>
        </div>
        
        {/* Portions Delivered */}
        <div>
          <label className="font-medium mb-2 block">
            Portions Delivered * (Scheduled: {scheduledPortions})
          </label>
          <Input
            type="number"
            {...form.register('portionsDelivered', { valueAsNumber: true })}
          />
        </div>
        
        {/* Quality Issues (optional) */}
        <div>
          <label className="font-medium mb-2 block">Quality Issues (optional)</label>
          <Textarea {...form.register('qualityIssues')} rows={3} />
        </div>
        
        {/* Submit */}
        <Button type="submit" size="lg" className="w-full">
          Confirm Delivery
        </Button>
      </form>
    </Card>
  )
}
```

#### Step B4: Testing (3 hours)

```typescript
// Integration tests for distribution flow

describe('Distribution Flow Integration', () => {
  it('should complete full distribution workflow', async () => {
    // 1. Create production
    const production = await db.foodProduction.create({
      data: {
        menuId: 'test-menu',
        targetPortions: 1000,
        actualPortions: 1000,
        productionStatus: 'COMPLETED'
      }
    })
    
    // 2. Create schedule
    const schedule = await distributionScheduleService.createSchedule({
      programId: 'test-program',
      productionId: production.id,
      schoolId: 'test-school',
      deliveryDate: new Date(),
      scheduledPortions: 500
    })
    
    expect(schedule.deliveryStatus).toBe('SCHEDULED')
    
    // 3. Start distribution
    const distribution = await distributionService.startDistribution(
      schedule.id,
      {
        vehicleId: 'test-vehicle',
        driverId: 'test-driver',
        departureTemp: 5.5
      }
    )
    
    expect(distribution.deliveryStatus).toBe('IN_TRANSIT')
    expect(distribution.departureTemp).toBe(5.5)
    
    // 4. Confirm delivery
    const confirmed = await distributionService.confirmDelivery(
      distribution.id,
      {
        portionsDelivered: 500,
        recipientName: 'Kepala Sekolah',
        recipientPosition: 'Principal',
        recipientSignature: 'base64-signature-data',
        deliveryPhoto: 'https://example.com/photo.jpg',
        gpsLatitude: -6.2088,
        gpsLongitude: 106.8456,
        arrivalTemp: 7.2
      }
    )
    
    expect(confirmed.deliveryStatus).toBe('DELIVERED')
    expect(confirmed.portionsDelivered).toBe(500)
    expect(confirmed.confirmationTime).toBeDefined()
  })
})
```

---

## ✅ Definition of Done

**Part A: DistributionSchedule (10h)**
- [ ] productionId made required
- [ ] schoolId FK added (no free text)
- [ ] deliveryStatus converted to enum
- [ ] Route planning fields added
- [ ] Vehicle/driver assignment working
- [ ] Portion availability validation

**Part B: FoodDistribution (16h)**
- [ ] All key FKs required (production, school, vehicle, driver)
- [ ] Delivery confirmation mandatory for DELIVERED status
- [ ] GPS tracking implemented
- [ ] Photo capture working
- [ ] Signature capture working
- [ ] Temperature monitoring implemented
- [ ] Food safety alerts working
- [ ] Mobile delivery app functional

**Overall**
- [ ] Unit tests pass (90%+ coverage)
- [ ] Integration tests pass
- [ ] Complete traceability verified
- [ ] Documentation updated

---

**Status**: ✅ Combined implementation plan complete  
**Total Estimate**: 26 hours (10h + 16h)  
**Completion Target**: 2025-10-27 (4 days from now)
