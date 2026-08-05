-- AlterTable
ALTER TABLE "User" ADD COLUMN "blockedAt" TIMESTAMP(3),
ADD COLUMN "blockReason" TEXT;

-- CreateIndex
CREATE INDEX "User_blockedAt_idx" ON "User"("blockedAt");
