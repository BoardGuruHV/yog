-- CreateTable
CREATE TABLE "AsanaEmbedding" (
    "id" TEXT NOT NULL,
    "asanaId" TEXT NOT NULL,
    "embedding" JSONB NOT NULL,
    "textHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AsanaEmbedding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AsanaEmbedding_asanaId_key" ON "AsanaEmbedding"("asanaId");

-- AddForeignKey
ALTER TABLE "AsanaEmbedding" ADD CONSTRAINT "AsanaEmbedding_asanaId_fkey" FOREIGN KEY ("asanaId") REFERENCES "Asana"("id") ON DELETE CASCADE ON UPDATE CASCADE;
