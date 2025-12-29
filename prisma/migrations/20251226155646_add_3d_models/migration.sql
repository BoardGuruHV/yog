-- CreateTable
CREATE TABLE "AsanaModel3D" (
    "id" TEXT NOT NULL,
    "asanaId" TEXT NOT NULL,
    "modelPath" TEXT NOT NULL,
    "format" TEXT NOT NULL DEFAULT 'glb',
    "scale" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "position" JSONB,
    "rotation" JSONB,
    "hasRig" BOOLEAN NOT NULL DEFAULT false,
    "hasMorphs" BOOLEAN NOT NULL DEFAULT false,
    "thumbnail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AsanaModel3D_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AsanaModel3D_asanaId_key" ON "AsanaModel3D"("asanaId");

-- AddForeignKey
ALTER TABLE "AsanaModel3D" ADD CONSTRAINT "AsanaModel3D_asanaId_fkey" FOREIGN KEY ("asanaId") REFERENCES "Asana"("id") ON DELETE CASCADE ON UPDATE CASCADE;
