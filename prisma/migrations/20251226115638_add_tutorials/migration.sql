-- CreateTable
CREATE TABLE "AsanaTutorial" (
    "id" TEXT NOT NULL,
    "asanaId" TEXT NOT NULL,
    "tips" TEXT[],
    "commonErrors" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AsanaTutorial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TutorialStep" (
    "id" TEXT NOT NULL,
    "tutorialId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "phase" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "instruction" TEXT NOT NULL,
    "breathCue" TEXT,
    "duration" INTEGER,
    "imagePath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TutorialStep_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AsanaTutorial_asanaId_key" ON "AsanaTutorial"("asanaId");

-- CreateIndex
CREATE UNIQUE INDEX "TutorialStep_tutorialId_order_key" ON "TutorialStep"("tutorialId", "order");

-- AddForeignKey
ALTER TABLE "AsanaTutorial" ADD CONSTRAINT "AsanaTutorial_asanaId_fkey" FOREIGN KEY ("asanaId") REFERENCES "Asana"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutorialStep" ADD CONSTRAINT "TutorialStep_tutorialId_fkey" FOREIGN KEY ("tutorialId") REFERENCES "AsanaTutorial"("id") ON DELETE CASCADE ON UPDATE CASCADE;
