/*
  Warnings:

  - The `difficulty` column on the `nutrition_menus` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `cookingMethod` column on the `nutrition_menus` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "MenuDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "CookingMethod" AS ENUM ('STEAM', 'BOIL', 'FRY', 'BAKE', 'GRILL', 'ROAST', 'SAUTE', 'STIR_FRY');

-- AlterTable
ALTER TABLE "nutrition_menus" DROP COLUMN "difficulty",
ADD COLUMN     "difficulty" "MenuDifficulty",
DROP COLUMN "cookingMethod",
ADD COLUMN     "cookingMethod" "CookingMethod";
