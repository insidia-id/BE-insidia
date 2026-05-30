/*
  Warnings:

  - A unique constraint covering the columns `[userId,mitraId]` on the table `UserMitraRole` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "UserMitraRole_userId_mitraId_roleId_key";

-- CreateIndex
CREATE UNIQUE INDEX "UserMitraRole_userId_mitraId_key" ON "UserMitraRole"("userId", "mitraId");
