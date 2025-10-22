/*
  Warnings:

  - You are about to drop the column `totalFolat` on the `menu_nutrition_calculations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "menu_nutrition_calculations" DROP COLUMN "totalFolat",
ADD COLUMN     "totalFolate" DOUBLE PRECISION NOT NULL DEFAULT 0;
