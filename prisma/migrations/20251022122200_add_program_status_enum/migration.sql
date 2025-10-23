-- CreateEnum: ProgramStatus
CREATE TYPE "ProgramStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED', 'ARCHIVED');

-- AlterTable: Convert existing String status to ProgramStatus enum
-- Step 1: Add new temporary column with enum type
ALTER TABLE "nutrition_programs" ADD COLUMN "status_new" "ProgramStatus";

-- Step 2: Migrate existing data (map String values to enum)
UPDATE "nutrition_programs" 
SET "status_new" = CASE 
  WHEN "status" = 'ACTIVE' THEN 'ACTIVE'::"ProgramStatus"
  WHEN "status" = 'DRAFT' THEN 'DRAFT'::"ProgramStatus"
  WHEN "status" = 'PAUSED' THEN 'PAUSED'::"ProgramStatus"
  WHEN "status" = 'COMPLETED' THEN 'COMPLETED'::"ProgramStatus"
  WHEN "status" = 'CANCELLED' THEN 'CANCELLED'::"ProgramStatus"
  WHEN "status" = 'ARCHIVED' THEN 'ARCHIVED'::"ProgramStatus"
  ELSE 'ACTIVE'::"ProgramStatus" -- Default for any unknown values
END;

-- Step 3: Drop old String column
ALTER TABLE "nutrition_programs" DROP COLUMN "status";

-- Step 4: Rename new column to status
ALTER TABLE "nutrition_programs" RENAME COLUMN "status_new" TO "status";

-- Step 5: Set NOT NULL and default value
ALTER TABLE "nutrition_programs" ALTER COLUMN "status" SET NOT NULL;
ALTER TABLE "nutrition_programs" ALTER COLUMN "status" SET DEFAULT 'ACTIVE'::"ProgramStatus";
