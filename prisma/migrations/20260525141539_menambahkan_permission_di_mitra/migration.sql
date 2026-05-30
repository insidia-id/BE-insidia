-- CreateTable
CREATE TABLE "MitraRolePermission" (
    "id" TEXT NOT NULL,
    "mitraId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "MitraRolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MitraRolePermission_mitraId_idx" ON "MitraRolePermission"("mitraId");

-- CreateIndex
CREATE INDEX "MitraRolePermission_roleId_idx" ON "MitraRolePermission"("roleId");

-- CreateIndex
CREATE INDEX "MitraRolePermission_permissionId_idx" ON "MitraRolePermission"("permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "MitraRolePermission_mitraId_roleId_permissionId_key" ON "MitraRolePermission"("mitraId", "roleId", "permissionId");

-- AddForeignKey
ALTER TABLE "MitraRolePermission" ADD CONSTRAINT "MitraRolePermission_mitraId_fkey" FOREIGN KEY ("mitraId") REFERENCES "Mitra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MitraRolePermission" ADD CONSTRAINT "MitraRolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MitraRolePermission" ADD CONSTRAINT "MitraRolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
