-- AlterTable
ALTER TABLE "Booking"
ADD COLUMN "paymentStatus" TEXT NOT NULL DEFAULT 'unpaid',
ADD COLUMN "paidMethod" TEXT,
ADD COLUMN "paymentReference" TEXT,
ADD COLUMN "paidAt" TIMESTAMP(3);

-- Existing online bookings were only confirmed after PayMongo reported them paid.
UPDATE "Booking"
SET "paymentStatus" = 'paid',
    "paidMethod" = 'gcash',
    "paidAt" = COALESCE("updatedAt", "createdAt")
WHERE "payment" <> 'cash'
  AND "status" IN ('confirmed', 'completed');

-- CreateIndex
CREATE INDEX "Booking_paymentStatus_idx" ON "Booking"("paymentStatus");
