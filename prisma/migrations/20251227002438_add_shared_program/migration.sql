-- CreateTable
CREATE TABLE "SharedProgram" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "shareCode" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "views" INTEGER NOT NULL DEFAULT 0,
    "copies" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SharedProgram_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SharedProgram_programId_key" ON "SharedProgram"("programId");

-- CreateIndex
CREATE UNIQUE INDEX "SharedProgram_shareCode_key" ON "SharedProgram"("shareCode");

-- CreateIndex
CREATE INDEX "SharedProgram_shareCode_idx" ON "SharedProgram"("shareCode");

-- AddForeignKey
ALTER TABLE "SharedProgram" ADD CONSTRAINT "SharedProgram_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;
