-- AlterTable
ALTER TABLE "menu_cost_calculations" ADD COLUMN     "ingredientsLastModified" TIMESTAMP(3),
ADD COLUMN     "isStale" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "staleReason" TEXT;

-- AlterTable
ALTER TABLE "menu_nutrition_calculations" ADD COLUMN     "ingredientsLastModified" TIMESTAMP(3),
ADD COLUMN     "isStale" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "staleReason" TEXT;

-- CreateIndex
CREATE INDEX "menu_cost_calculations_isStale_idx" ON "menu_cost_calculations"("isStale");

-- CreateIndex
CREATE INDEX "menu_nutrition_calculations_isStale_idx" ON "menu_nutrition_calculations"("isStale");
