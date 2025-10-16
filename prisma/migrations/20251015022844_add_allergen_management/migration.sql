-- CreateTable
CREATE TABLE "allergens" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "isCommon" BOOLEAN NOT NULL DEFAULT true,
    "category" VARCHAR(50),
    "localName" VARCHAR(100),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "allergens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "allergens_sppgId_isActive_idx" ON "allergens"("sppgId", "isActive");

-- CreateIndex
CREATE INDEX "allergens_isCommon_isActive_idx" ON "allergens"("isCommon", "isActive");

-- CreateIndex
CREATE INDEX "allergens_category_isActive_idx" ON "allergens"("category", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "allergens_sppgId_name_key" ON "allergens"("sppgId", "name");

-- AddForeignKey
ALTER TABLE "allergens" ADD CONSTRAINT "allergens_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;
