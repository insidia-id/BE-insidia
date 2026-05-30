/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `UserMitraRole` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserMitraRole_userId_key" ON "UserMitraRole"("userId");
