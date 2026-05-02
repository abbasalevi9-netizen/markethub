-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "homeSort" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "showOnHome" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "Store_showOnHome_idx" ON "Store"("showOnHome");

-- CreateIndex
CREATE INDEX "Store_homeSort_idx" ON "Store"("homeSort");
