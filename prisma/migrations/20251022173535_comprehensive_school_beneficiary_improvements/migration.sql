/*
  Warnings:

  - You are about to alter the column `schoolName` on the `school_beneficiaries` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `schoolCode` on the `school_beneficiaries` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `principalName` on the `school_beneficiaries` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `contactPhone` on the `school_beneficiaries` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - You are about to alter the column `contactEmail` on the `school_beneficiaries` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `postalCode` on the `school_beneficiaries` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(10)`.
  - You are about to alter the column `coordinates` on the `school_beneficiaries` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `feedingTime` on the `school_beneficiaries` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `deliveryContact` on the `school_beneficiaries` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `storageCapacity` on the `school_beneficiaries` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - The `servingMethod` column on the `school_beneficiaries` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[schoolCode]` on the table `school_beneficiaries` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[npsn]` on the table `school_beneficiaries` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[dapodikId]` on the table `school_beneficiaries` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sppgId,schoolCode]` on the table `school_beneficiaries` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `districtId` to the `school_beneficiaries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provinceId` to the `school_beneficiaries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `regencyId` to the `school_beneficiaries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sppgId` to the `school_beneficiaries` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `schoolType` on the `school_beneficiaries` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `schoolStatus` on the `school_beneficiaries` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/

-- ========================================
-- STEP 1: Create New Enums
-- ========================================
CREATE TYPE "SchoolType" AS ENUM ('SD', 'SMP', 'SMA', 'SMK', 'MI', 'MTS', 'MA', 'PAUD', 'TK', 'SLB', 'PONDOK_PESANTREN', 'LAINNYA');

CREATE TYPE "SchoolStatus" AS ENUM ('NEGERI', 'SWASTA', 'TERAKREDITASI_A', 'TERAKREDITASI_B', 'TERAKREDITASI_C', 'BELUM_TERAKREDITASI');

CREATE TYPE "SchoolServingMethod" AS ENUM ('CAFETERIA', 'CLASSROOM', 'OUTDOOR', 'TAKEAWAY', 'HYBRID');

-- ========================================
-- STEP 2: Add New Optional Columns First
-- ========================================
ALTER TABLE "school_beneficiaries" 
ADD COLUMN "accessRoadCondition" VARCHAR(50),
ADD COLUMN "accreditationGrade" VARCHAR(1),
ADD COLUMN "accreditationYear" INTEGER,
ADD COLUMN "alternatePhone" VARCHAR(20),
ADD COLUMN "attendanceRate" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN "breakfastTime" VARCHAR(10),
ADD COLUMN "budgetPerStudent" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN "contractEndDate" TIMESTAMP(3),
ADD COLUMN "contractNumber" VARCHAR(100),
ADD COLUMN "contractStartDate" TIMESTAMP(3),
ADD COLUMN "contractValue" DOUBLE PRECISION,
ADD COLUMN "createdBy" VARCHAR(100),
ADD COLUMN "dapodikId" VARCHAR(50),
ADD COLUMN "deliveryPhone" VARCHAR(20),
ADD COLUMN "diningCapacity" INTEGER,
ADD COLUMN "distanceFromSppg" DOUBLE PRECISION,
ADD COLUMN "documents" JSONB,
ADD COLUMN "estimatedTravelTime" INTEGER,
ADD COLUMN "externalSystemId" VARCHAR(100),
ADD COLUMN "femaleStudents" INTEGER DEFAULT 0,
ADD COLUMN "hasDiningArea" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "hasHandwashing" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "hasRefrigerator" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "kemendikbudId" VARCHAR(50),
ADD COLUMN "lastDistributionDate" TIMESTAMP(3),
ADD COLUMN "lastReportDate" TIMESTAMP(3),
ADD COLUMN "lunchTime" VARCHAR(10),
ADD COLUMN "maleStudents" INTEGER DEFAULT 0,
ADD COLUMN "monthlyBudgetAllocation" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN "notes" TEXT,
ADD COLUMN "npsn" VARCHAR(20),
ADD COLUMN "participationRate" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN "preferredDeliveryTime" VARCHAR(50),
ADD COLUMN "principalNip" VARCHAR(30),
ADD COLUMN "reactivationDate" TIMESTAMP(3),
ADD COLUMN "religiousReqs" TEXT[],
ADD COLUMN "satisfactionScore" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN "snackTime" VARCHAR(10),
ADD COLUMN "specialInstructions" TEXT,
ADD COLUMN "syncedAt" TIMESTAMP(3),
ADD COLUMN "totalDistributions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "totalMealsServed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "updatedBy" VARCHAR(100),
ADD COLUMN "urbanRural" VARCHAR(20) DEFAULT 'URBAN',
ADD COLUMN "whatsappNumber" VARCHAR(20);

-- ========================================
-- STEP 3: Add Regional Fields with Temporary Nullability
-- ========================================
ALTER TABLE "school_beneficiaries" 
ADD COLUMN "sppgId_temp" TEXT,
ADD COLUMN "provinceId_temp" TEXT,
ADD COLUMN "regencyId_temp" TEXT,
ADD COLUMN "districtId_temp" TEXT;

-- ========================================
-- STEP 4: Populate Required Fields from Related Data
-- ========================================
-- Get sppgId from program relation
UPDATE "school_beneficiaries" sb
SET "sppgId_temp" = np."sppgId"
FROM "nutrition_programs" np
WHERE sb."programId" = np.id;

-- Get regional IDs from village relation (corrected joins)
UPDATE "school_beneficiaries" sb
SET 
  "districtId_temp" = v."districtId",
  "regencyId_temp" = d."regencyId",
  "provinceId_temp" = r."provinceId"
FROM "villages" v
JOIN "districts" d ON v."districtId" = d.id
JOIN "regencies" r ON d."regencyId" = r.id
WHERE sb."villageId" = v.id;

-- ========================================
-- STEP 5: Create Permanent Required Columns
-- ========================================
ALTER TABLE "school_beneficiaries" 
ADD COLUMN "sppgId" TEXT NOT NULL DEFAULT 'temp',
ADD COLUMN "provinceId" TEXT NOT NULL DEFAULT 'temp',
ADD COLUMN "regencyId" TEXT NOT NULL DEFAULT 'temp',
ADD COLUMN "districtId" TEXT NOT NULL DEFAULT 'temp';

-- Update with actual values
UPDATE "school_beneficiaries" 
SET 
  "sppgId" = "sppgId_temp",
  "provinceId" = "provinceId_temp",
  "regencyId" = "regencyId_temp",
  "districtId" = "districtId_temp";

-- Remove temp columns
ALTER TABLE "school_beneficiaries" 
DROP COLUMN "sppgId_temp",
DROP COLUMN "provinceId_temp",
DROP COLUMN "regencyId_temp",
DROP COLUMN "districtId_temp";

-- Remove defaults
ALTER TABLE "school_beneficiaries" 
ALTER COLUMN "sppgId" DROP DEFAULT,
ALTER COLUMN "provinceId" DROP DEFAULT,
ALTER COLUMN "regencyId" DROP DEFAULT,
ALTER COLUMN "districtId" DROP DEFAULT;

-- ========================================
-- STEP 6: Handle Enum Conversions
-- ========================================
-- Save old schoolType values
ALTER TABLE "school_beneficiaries" ADD COLUMN "schoolType_old" TEXT;
UPDATE "school_beneficiaries" SET "schoolType_old" = "schoolType";

-- Drop and recreate schoolType with enum
ALTER TABLE "school_beneficiaries" DROP COLUMN "schoolType";
ALTER TABLE "school_beneficiaries" ADD COLUMN "schoolType" "SchoolType";

-- Map old values to new enum (adjust mapping as needed)
UPDATE "school_beneficiaries" 
SET "schoolType" = 
  CASE 
    WHEN UPPER("schoolType_old") LIKE '%SD%' THEN 'SD'::"SchoolType"
    WHEN UPPER("schoolType_old") LIKE '%SMP%' THEN 'SMP'::"SchoolType"
    WHEN UPPER("schoolType_old") LIKE '%SMA%' THEN 'SMA'::"SchoolType"
    WHEN UPPER("schoolType_old") LIKE '%SMK%' THEN 'SMK'::"SchoolType"
    WHEN UPPER("schoolType_old") LIKE '%MI%' THEN 'MI'::"SchoolType"
    WHEN UPPER("schoolType_old") LIKE '%MTS%' THEN 'MTS'::"SchoolType"
    WHEN UPPER("schoolType_old") LIKE '%MA%' THEN 'MA'::"SchoolType"
    WHEN UPPER("schoolType_old") LIKE '%PAUD%' THEN 'PAUD'::"SchoolType"
    WHEN UPPER("schoolType_old") LIKE '%TK%' THEN 'TK'::"SchoolType"
    WHEN UPPER("schoolType_old") LIKE '%SLB%' THEN 'SLB'::"SchoolType"
    WHEN UPPER("schoolType_old") LIKE '%PESANTREN%' THEN 'PONDOK_PESANTREN'::"SchoolType"
    ELSE 'SD'::"SchoolType"  -- Default fallback
  END;

ALTER TABLE "school_beneficiaries" ALTER COLUMN "schoolType" SET NOT NULL;
ALTER TABLE "school_beneficiaries" DROP COLUMN "schoolType_old";

-- Save old schoolStatus values
ALTER TABLE "school_beneficiaries" ADD COLUMN "schoolStatus_old" TEXT;
UPDATE "school_beneficiaries" SET "schoolStatus_old" = "schoolStatus";

-- Drop and recreate schoolStatus with enum
ALTER TABLE "school_beneficiaries" DROP COLUMN "schoolStatus";
ALTER TABLE "school_beneficiaries" ADD COLUMN "schoolStatus" "SchoolStatus";

-- Map old values to new enum
UPDATE "school_beneficiaries" 
SET "schoolStatus" = 
  CASE 
    WHEN UPPER("schoolStatus_old") LIKE '%NEGERI%' THEN 'NEGERI'::"SchoolStatus"
    WHEN UPPER("schoolStatus_old") LIKE '%SWASTA%' THEN 'SWASTA'::"SchoolStatus"
    WHEN UPPER("schoolStatus_old") = 'A' THEN 'TERAKREDITASI_A'::"SchoolStatus"
    WHEN UPPER("schoolStatus_old") = 'B' THEN 'TERAKREDITASI_B'::"SchoolStatus"
    WHEN UPPER("schoolStatus_old") = 'C' THEN 'TERAKREDITASI_C'::"SchoolStatus"
    ELSE 'SWASTA'::"SchoolStatus"  -- Default fallback
  END;

ALTER TABLE "school_beneficiaries" ALTER COLUMN "schoolStatus" SET NOT NULL;
ALTER TABLE "school_beneficiaries" DROP COLUMN "schoolStatus_old";

-- ========================================
-- STEP 7: Handle servingMethod Conversion
-- ========================================
ALTER TABLE "school_beneficiaries" ADD COLUMN "servingMethod_old" TEXT;
UPDATE "school_beneficiaries" SET "servingMethod_old" = "servingMethod";

ALTER TABLE "school_beneficiaries" DROP COLUMN "servingMethod";
ALTER TABLE "school_beneficiaries" ADD COLUMN "servingMethod" "SchoolServingMethod";

UPDATE "school_beneficiaries" 
SET "servingMethod" = 
  CASE 
    WHEN UPPER("servingMethod_old") LIKE '%CAFETERIA%' THEN 'CAFETERIA'::"SchoolServingMethod"
    WHEN UPPER("servingMethod_old") LIKE '%CLASSROOM%' THEN 'CLASSROOM'::"SchoolServingMethod"
    WHEN UPPER("servingMethod_old") LIKE '%OUTDOOR%' THEN 'OUTDOOR'::"SchoolServingMethod"
    WHEN UPPER("servingMethod_old") LIKE '%TAKEAWAY%' THEN 'TAKEAWAY'::"SchoolServingMethod"
    WHEN UPPER("servingMethod_old") LIKE '%HYBRID%' THEN 'HYBRID'::"SchoolServingMethod"
    ELSE 'CAFETERIA'::"SchoolServingMethod"
  END;

ALTER TABLE "school_beneficiaries" ALTER COLUMN "servingMethod" SET NOT NULL;
ALTER TABLE "school_beneficiaries" ALTER COLUMN "servingMethod" SET DEFAULT 'CAFETERIA'::"SchoolServingMethod";
ALTER TABLE "school_beneficiaries" DROP COLUMN "servingMethod_old";

-- ========================================
-- STEP 8: Alter Existing Column Types
-- ========================================
ALTER TABLE "school_beneficiaries" 
ALTER COLUMN "schoolName" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "schoolCode" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "principalName" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "contactPhone" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "contactEmail" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "postalCode" SET DATA TYPE VARCHAR(10),
ALTER COLUMN "coordinates" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "feedingTime" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "deliveryContact" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "storageCapacity" SET DATA TYPE VARCHAR(100);

-- ========================================
-- STEP 9: Create Indexes
-- ========================================
CREATE UNIQUE INDEX "school_beneficiaries_schoolCode_key" ON "school_beneficiaries"("schoolCode");
CREATE UNIQUE INDEX "school_beneficiaries_npsn_key" ON "school_beneficiaries"("npsn");
CREATE UNIQUE INDEX "school_beneficiaries_dapodikId_key" ON "school_beneficiaries"("dapodikId");
CREATE INDEX "school_beneficiaries_sppgId_isActive_idx" ON "school_beneficiaries"("sppgId", "isActive");
CREATE INDEX "school_beneficiaries_schoolType_isActive_idx" ON "school_beneficiaries"("schoolType", "isActive");
CREATE INDEX "school_beneficiaries_provinceId_regencyId_districtId_idx" ON "school_beneficiaries"("provinceId", "regencyId", "districtId");
CREATE INDEX "school_beneficiaries_npsn_idx" ON "school_beneficiaries"("npsn");
CREATE INDEX "school_beneficiaries_enrollmentDate_idx" ON "school_beneficiaries"("enrollmentDate");
CREATE INDEX "school_beneficiaries_contractEndDate_idx" ON "school_beneficiaries"("contractEndDate");
CREATE UNIQUE INDEX "school_beneficiaries_sppgId_schoolCode_key" ON "school_beneficiaries"("sppgId", "schoolCode");

-- ========================================
-- STEP 10: Add Foreign Keys
-- ========================================
ALTER TABLE "school_beneficiaries" 
ADD CONSTRAINT "school_beneficiaries_sppgId_fkey" 
FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "school_beneficiaries" 
ADD CONSTRAINT "school_beneficiaries_provinceId_fkey" 
FOREIGN KEY ("provinceId") REFERENCES "provinces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "school_beneficiaries" 
ADD CONSTRAINT "school_beneficiaries_regencyId_fkey" 
FOREIGN KEY ("regencyId") REFERENCES "regencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "school_beneficiaries" 
ADD CONSTRAINT "school_beneficiaries_districtId_fkey" 
FOREIGN KEY ("districtId") REFERENCES "districts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
