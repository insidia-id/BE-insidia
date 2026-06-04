/*
  Warnings:

  - A unique constraint covering the columns `[module,scope]` on the table `ModulePermission` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ModulePermission_module_key";

-- CreateIndex
CREATE UNIQUE INDEX "ModulePermission_module_scope_key" ON "ModulePermission"("module", "scope");
