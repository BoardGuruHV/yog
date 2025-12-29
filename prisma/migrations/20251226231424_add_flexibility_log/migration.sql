-- CreateTable
CREATE TABLE "FlexibilityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "asanaId" TEXT NOT NULL,
    "measurement" DOUBLE PRECISION,
    "measurementType" TEXT NOT NULL DEFAULT 'reach',
    "photoPath" TEXT,
    "notes" TEXT,
    "bodyPart" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FlexibilityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FlexibilityLog_userId_idx" ON "FlexibilityLog"("userId");

-- CreateIndex
CREATE INDEX "FlexibilityLog_asanaId_idx" ON "FlexibilityLog"("asanaId");

-- CreateIndex
CREATE INDEX "FlexibilityLog_userId_asanaId_idx" ON "FlexibilityLog"("userId", "asanaId");

-- AddForeignKey
ALTER TABLE "FlexibilityLog" ADD CONSTRAINT "FlexibilityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlexibilityLog" ADD CONSTRAINT "FlexibilityLog_asanaId_fkey" FOREIGN KEY ("asanaId") REFERENCES "Asana"("id") ON DELETE CASCADE ON UPDATE CASCADE;
