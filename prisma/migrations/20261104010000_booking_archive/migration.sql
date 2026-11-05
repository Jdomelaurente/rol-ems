-- AlterTable
ALTER TABLE "Booking"
ADD COLUMN "archivedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Booking_archivedAt_idx" ON "Booking"("archivedAt");
