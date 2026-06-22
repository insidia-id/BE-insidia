/*
  Warnings:

  - You are about to drop the column `userId` on the `AcademicProfile` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `GuruProfile` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `MuridProfile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[usermitraroleId]` on the table `AcademicProfile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[usermitraroleId]` on the table `GuruProfile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nip]` on the table `GuruProfile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[usermritaroleId]` on the table `MuridProfile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nik]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,mitraId,roleId]` on the table `UserMitraRole` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[usermitraroleId]` on the table `WaliMuridProfile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `usermitraroleId` to the `AcademicProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usermitraroleId` to the `GuruProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usermritaroleId` to the `MuridProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usermitraroleId` to the `WaliMuridProfile` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "Religion" AS ENUM ('ISLAM', 'CHRISTIAN', 'CATHOLIC', 'HINDU', 'BUDDHIST', 'CONFUCIAN', 'OTHER');

-- DropForeignKey
ALTER TABLE "AcademicProfile" DROP CONSTRAINT "AcademicProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "GuruProfile" DROP CONSTRAINT "GuruProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "MuridProfile" DROP CONSTRAINT "MuridProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "WaliMuridProfile" DROP CONSTRAINT "WaliMuridProfile_userId_fkey";

-- DropIndex
DROP INDEX "AcademicProfile_userId_key";

-- DropIndex
DROP INDEX "GuruProfile_userId_key";

-- DropIndex
DROP INDEX "MuridProfile_userId_key";

-- DropIndex
DROP INDEX "UserMitraRole_userId_key";

-- DropIndex
DROP INDEX "UserMitraRole_userId_mitraId_key";

-- AlterTable
ALTER TABLE "AcademicProfile" DROP COLUMN "userId",
ADD COLUMN     "usermitraroleId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "GuruProfile" DROP COLUMN "userId",
ADD COLUMN     "usermitraroleId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "MuridProfile" DROP COLUMN "userId",
ADD COLUMN     "usermritaroleId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "birthPlace" TEXT,
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "nik" TEXT,
ADD COLUMN     "religion" "Religion";

-- AlterTable
ALTER TABLE "WaliMuridProfile" ADD COLUMN     "usermitraroleId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "MitraProfile" (
    "id" TEXT NOT NULL,
    "mitraId" TEXT NOT NULL,
    "npsn" TEXT NOT NULL,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MitraProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MitraProfile_mitraId_key" ON "MitraProfile"("mitraId");

-- CreateIndex
CREATE UNIQUE INDEX "MitraProfile_npsn_key" ON "MitraProfile"("npsn");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicProfile_usermitraroleId_key" ON "AcademicProfile"("usermitraroleId");

-- CreateIndex
CREATE UNIQUE INDEX "GuruProfile_usermitraroleId_key" ON "GuruProfile"("usermitraroleId");

-- CreateIndex
CREATE UNIQUE INDEX "GuruProfile_nip_key" ON "GuruProfile"("nip");

-- CreateIndex
CREATE UNIQUE INDEX "MuridProfile_usermritaroleId_key" ON "MuridProfile"("usermritaroleId");

-- CreateIndex
CREATE UNIQUE INDEX "User_nik_key" ON "User"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "UserMitraRole_userId_mitraId_roleId_key" ON "UserMitraRole"("userId", "mitraId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "WaliMuridProfile_usermitraroleId_key" ON "WaliMuridProfile"("usermitraroleId");

-- AddForeignKey
ALTER TABLE "MitraProfile" ADD CONSTRAINT "MitraProfile_mitraId_fkey" FOREIGN KEY ("mitraId") REFERENCES "Mitra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuruProfile" ADD CONSTRAINT "GuruProfile_usermitraroleId_fkey" FOREIGN KEY ("usermitraroleId") REFERENCES "UserMitraRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicProfile" ADD CONSTRAINT "AcademicProfile_usermitraroleId_fkey" FOREIGN KEY ("usermitraroleId") REFERENCES "UserMitraRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MuridProfile" ADD CONSTRAINT "MuridProfile_usermritaroleId_fkey" FOREIGN KEY ("usermritaroleId") REFERENCES "UserMitraRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaliMuridProfile" ADD CONSTRAINT "WaliMuridProfile_usermitraroleId_fkey" FOREIGN KEY ("usermitraroleId") REFERENCES "UserMitraRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;
