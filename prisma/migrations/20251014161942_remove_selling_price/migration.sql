/*
  Warnings:

  - You are about to drop the column `marketPrice` on the `menu_cost_calculations` table. All the data in the column will be lost.
  - You are about to drop the column `priceCompetitiveness` on the `menu_cost_calculations` table. All the data in the column will be lost.
  - You are about to drop the column `recommendedPrice` on the `menu_cost_calculations` table. All the data in the column will be lost.
  - You are about to drop the column `targetProfitMargin` on the `menu_cost_calculations` table. All the data in the column will be lost.
  - You are about to drop the column `sellingPrice` on the `nutrition_menus` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "menu_cost_calculations" DROP COLUMN "marketPrice",
DROP COLUMN "priceCompetitiveness",
DROP COLUMN "recommendedPrice",
DROP COLUMN "targetProfitMargin",
ADD COLUMN     "budgetAllocation" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "nutrition_menus" DROP COLUMN "sellingPrice";
