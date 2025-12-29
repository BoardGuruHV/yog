-- CreateTable
CREATE TABLE "Pronunciation" (
    "id" TEXT NOT NULL,
    "asanaId" TEXT NOT NULL,
    "phonetic" TEXT NOT NULL,
    "audioPath" TEXT,
    "syllables" JSONB NOT NULL,
    "ipa" TEXT,
    "meaning" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pronunciation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pronunciation_asanaId_key" ON "Pronunciation"("asanaId");

-- AddForeignKey
ALTER TABLE "Pronunciation" ADD CONSTRAINT "Pronunciation_asanaId_fkey" FOREIGN KEY ("asanaId") REFERENCES "Asana"("id") ON DELETE CASCADE ON UPDATE CASCADE;
