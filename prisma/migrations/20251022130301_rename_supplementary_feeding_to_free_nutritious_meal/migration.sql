/*
  Warnings:

  - The values [SUPPLEMENTARY_FEEDING] on the enum `ProgramType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ProgramType_new" AS ENUM ('NUTRITIONAL_RECOVERY', 'NUTRITIONAL_EDUCATION', 'FREE_NUTRITIOUS_MEAL', 'EMERGENCY_NUTRITION', 'STUNTING_INTERVENTION');
ALTER TABLE "nutrition_programs" ALTER COLUMN "programType" TYPE "ProgramType_new" USING ("programType"::text::"ProgramType_new");
ALTER TYPE "ProgramType" RENAME TO "ProgramType_old";
ALTER TYPE "ProgramType_new" RENAME TO "ProgramType";
DROP TYPE "public"."ProgramType_old";
COMMIT;

-- CreateIndex
CREATE INDEX "nutrition_programs_sppgId_status_idx" ON "nutrition_programs"("sppgId", "status");

-- CreateIndex
CREATE INDEX "nutrition_programs_programType_status_idx" ON "nutrition_programs"("programType", "status");
