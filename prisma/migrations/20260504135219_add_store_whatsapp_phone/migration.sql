/*
  Warnings:

  - A unique constraint covering the columns `[whatsappPhone]` on the table `Store` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "whatsappPhone" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Store_whatsappPhone_key" ON "Store"("whatsappPhone");
