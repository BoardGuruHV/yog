-- CreateTable
CREATE TABLE "UserAsanaNote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "asanaId" TEXT NOT NULL,
    "note" TEXT,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAsanaNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserAsanaNote_userId_asanaId_key" ON "UserAsanaNote"("userId", "asanaId");

-- AddForeignKey
ALTER TABLE "UserAsanaNote" ADD CONSTRAINT "UserAsanaNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAsanaNote" ADD CONSTRAINT "UserAsanaNote_asanaId_fkey" FOREIGN KEY ("asanaId") REFERENCES "Asana"("id") ON DELETE CASCADE ON UPDATE CASCADE;
