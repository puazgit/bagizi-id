-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'SUBMIT_FOR_REVIEW';
ALTER TYPE "AuditAction" ADD VALUE 'APPROVE_PLAN';
ALTER TYPE "AuditAction" ADD VALUE 'REJECT_PLAN';
ALTER TYPE "AuditAction" ADD VALUE 'PUBLISH_PLAN';

-- AlterTable
ALTER TABLE "menu_plans" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "publishedBy" TEXT,
ADD COLUMN     "rejectedAt" TIMESTAMP(3),
ADD COLUMN     "rejectedBy" TEXT,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "submittedAt" TIMESTAMP(3),
ADD COLUMN     "submittedBy" TEXT;

-- CreateIndex
CREATE INDEX "menu_plans_status_idx" ON "menu_plans"("status");

-- AddForeignKey
ALTER TABLE "menu_plans" ADD CONSTRAINT "menu_plans_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_plans" ADD CONSTRAINT "menu_plans_rejectedBy_fkey" FOREIGN KEY ("rejectedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_plans" ADD CONSTRAINT "menu_plans_publishedBy_fkey" FOREIGN KEY ("publishedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
