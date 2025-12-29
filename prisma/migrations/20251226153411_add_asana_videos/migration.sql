-- CreateTable
CREATE TABLE "AsanaVideo" (
    "id" TEXT NOT NULL,
    "asanaId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "thumbnail" TEXT,
    "description" TEXT,
    "instructor" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AsanaVideo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AsanaVideo_asanaId_idx" ON "AsanaVideo"("asanaId");

-- AddForeignKey
ALTER TABLE "AsanaVideo" ADD CONSTRAINT "AsanaVideo_asanaId_fkey" FOREIGN KEY ("asanaId") REFERENCES "Asana"("id") ON DELETE CASCADE ON UPDATE CASCADE;
