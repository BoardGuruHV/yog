-- CreateTable
CREATE TABLE "PoseMastery" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "asanaId" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "practiceCount" INTEGER NOT NULL DEFAULT 0,
    "totalDuration" INTEGER NOT NULL DEFAULT 0,
    "bestHoldTime" INTEGER NOT NULL DEFAULT 0,
    "lastPracticed" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PoseMastery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PoseMastery_userId_idx" ON "PoseMastery"("userId");

-- CreateIndex
CREATE INDEX "PoseMastery_asanaId_idx" ON "PoseMastery"("asanaId");

-- CreateIndex
CREATE UNIQUE INDEX "PoseMastery_userId_asanaId_key" ON "PoseMastery"("userId", "asanaId");

-- AddForeignKey
ALTER TABLE "PoseMastery" ADD CONSTRAINT "PoseMastery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoseMastery" ADD CONSTRAINT "PoseMastery_asanaId_fkey" FOREIGN KEY ("asanaId") REFERENCES "Asana"("id") ON DELETE CASCADE ON UPDATE CASCADE;
