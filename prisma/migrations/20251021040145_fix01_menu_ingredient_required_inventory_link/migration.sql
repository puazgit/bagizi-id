/*
  Warnings:

  - You are about to drop the column `actualCost` on the `food_productions` table. All the data in the column will be lost.
  - You are about to drop the column `costPerPortion` on the `food_productions` table. All the data in the column will be lost.
  - You are about to drop the column `estimatedCost` on the `food_productions` table. All the data in the column will be lost.
  - You are about to drop the column `costPerUnit` on the `menu_ingredients` table. All the data in the column will be lost.
  - You are about to drop the column `ingredientName` on the `menu_ingredients` table. All the data in the column will be lost.
  - You are about to drop the column `totalCost` on the `menu_ingredients` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `menu_ingredients` table. All the data in the column will be lost.
  - Made the column `inventoryItemId` on table `menu_ingredients` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PermissionType" ADD VALUE 'INVENTORY_VIEW';
ALTER TYPE "PermissionType" ADD VALUE 'INVENTORY_MANAGE';
ALTER TYPE "PermissionType" ADD VALUE 'INVENTORY_APPROVE';

-- DropForeignKey
ALTER TABLE "public"."menu_ingredients" DROP CONSTRAINT "menu_ingredients_inventoryItemId_fkey";

-- AlterTable
ALTER TABLE "food_productions" DROP COLUMN "actualCost",
DROP COLUMN "costPerPortion",
DROP COLUMN "estimatedCost";

-- AlterTable
ALTER TABLE "menu_ingredients" DROP COLUMN "costPerUnit",
DROP COLUMN "ingredientName",
DROP COLUMN "totalCost",
DROP COLUMN "unit",
ALTER COLUMN "inventoryItemId" SET NOT NULL;

-- CreateTable
CREATE TABLE "production_stock_usage" (
    "id" TEXT NOT NULL,
    "productionId" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "quantityUsed" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "unitCostAtUse" DOUBLE PRECISION NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordedBy" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_stock_usage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "production_stock_usage_productionId_idx" ON "production_stock_usage"("productionId");

-- CreateIndex
CREATE INDEX "production_stock_usage_inventoryItemId_idx" ON "production_stock_usage"("inventoryItemId");

-- CreateIndex
CREATE INDEX "production_stock_usage_usedAt_idx" ON "production_stock_usage"("usedAt");

-- AddForeignKey
ALTER TABLE "production_stock_usage" ADD CONSTRAINT "production_stock_usage_productionId_fkey" FOREIGN KEY ("productionId") REFERENCES "food_productions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_stock_usage" ADD CONSTRAINT "production_stock_usage_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_ingredients" ADD CONSTRAINT "menu_ingredients_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
