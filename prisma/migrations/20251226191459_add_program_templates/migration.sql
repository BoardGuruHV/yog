-- CreateTable
CREATE TABLE "ProgramTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "goals" TEXT[],
    "asanas" JSONB NOT NULL,
    "thumbnail" TEXT,
    "icon" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "popularity" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgramTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProgramTemplate_category_idx" ON "ProgramTemplate"("category");

-- CreateIndex
CREATE INDEX "ProgramTemplate_featured_idx" ON "ProgramTemplate"("featured");
