-- CreateTable
CREATE TABLE "WhatsappProductDraft" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WhatsappProductDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WhatsappProductDraft_phone_idx" ON "WhatsappProductDraft"("phone");

-- CreateIndex
CREATE INDEX "WhatsappProductDraft_storeId_idx" ON "WhatsappProductDraft"("storeId");

-- CreateIndex
CREATE INDEX "WhatsappProductDraft_createdAt_idx" ON "WhatsappProductDraft"("createdAt");

-- AddForeignKey
ALTER TABLE "WhatsappProductDraft" ADD CONSTRAINT "WhatsappProductDraft_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
