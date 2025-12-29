-- CreateTable
CREATE TABLE "AsanaAnatomy" (
    "id" TEXT NOT NULL,
    "asanaId" TEXT NOT NULL,
    "primaryMuscles" TEXT[],
    "secondaryMuscles" TEXT[],
    "stretchedMuscles" TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AsanaAnatomy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AsanaAnatomy_asanaId_key" ON "AsanaAnatomy"("asanaId");

-- AddForeignKey
ALTER TABLE "AsanaAnatomy" ADD CONSTRAINT "AsanaAnatomy_asanaId_fkey" FOREIGN KEY ("asanaId") REFERENCES "Asana"("id") ON DELETE CASCADE ON UPDATE CASCADE;
