-- CreateEnum
CREATE TYPE "Category" AS ENUM ('STANDING', 'SEATED', 'PRONE', 'SUPINE', 'INVERSION', 'BALANCE', 'TWIST', 'FORWARD_BEND', 'BACK_BEND');

-- CreateTable
CREATE TABLE "Asana" (
    "id" TEXT NOT NULL,
    "nameEnglish" TEXT NOT NULL,
    "nameSanskrit" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "durationSeconds" INTEGER NOT NULL DEFAULT 30,
    "benefits" TEXT[],
    "targetBodyParts" TEXT[],
    "svgPath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Asana_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Condition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Condition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contraindication" (
    "id" TEXT NOT NULL,
    "asanaId" TEXT NOT NULL,
    "conditionId" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'avoid',
    "notes" TEXT,

    CONSTRAINT "Contraindication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Modification" (
    "id" TEXT NOT NULL,
    "asanaId" TEXT NOT NULL,
    "conditionId" TEXT,
    "forAge" TEXT,
    "description" TEXT NOT NULL,
    "svgPath" TEXT,

    CONSTRAINT "Modification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "totalDuration" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramAsana" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "asanaId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "notes" TEXT,

    CONSTRAINT "ProgramAsana_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Condition_name_key" ON "Condition"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Contraindication_asanaId_conditionId_key" ON "Contraindication"("asanaId", "conditionId");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramAsana_programId_order_key" ON "ProgramAsana"("programId", "order");

-- AddForeignKey
ALTER TABLE "Contraindication" ADD CONSTRAINT "Contraindication_asanaId_fkey" FOREIGN KEY ("asanaId") REFERENCES "Asana"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contraindication" ADD CONSTRAINT "Contraindication_conditionId_fkey" FOREIGN KEY ("conditionId") REFERENCES "Condition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Modification" ADD CONSTRAINT "Modification_asanaId_fkey" FOREIGN KEY ("asanaId") REFERENCES "Asana"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Modification" ADD CONSTRAINT "Modification_conditionId_fkey" FOREIGN KEY ("conditionId") REFERENCES "Condition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramAsana" ADD CONSTRAINT "ProgramAsana_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramAsana" ADD CONSTRAINT "ProgramAsana_asanaId_fkey" FOREIGN KEY ("asanaId") REFERENCES "Asana"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
