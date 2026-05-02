-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "category" "ProductCategory" NOT NULL DEFAULT 'OTHER';

-- CreateIndex
CREATE INDEX "Product_category_idx" ON "Product"("category");
