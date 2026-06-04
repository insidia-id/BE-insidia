/*
  Warnings:

  - You are about to drop the column `scope` on the `Permission` table. All the data in the column will be lost.
  - Added the required column `scope` to the `ModulePermission` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Permission_scope_idx";

-- AlterTable
ALTER TABLE "ModulePermission" ADD COLUMN     "scope" "RoleScope" NOT NULL;

-- AlterTable
ALTER TABLE "Permission" DROP COLUMN "scope";

-- CreateIndex
CREATE INDEX "ModulePermission_scope_idx" ON "ModulePermission"("scope");

-- CreateIndex
CREATE INDEX "Permission_moduleId_idx" ON "Permission"("moduleId");
