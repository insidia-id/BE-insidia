/*
  Warnings:

  - You are about to drop the column `bio` on the `MentorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `linkedin` on the `MentorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `headline` on the `User` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "PlatformRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'MENTOR', 'USER');

-- CreateEnum
CREATE TYPE "MitraRole" AS ENUM ('AKADEMIK', 'GURU', 'MURID', 'WALI_MURID');

-- CreateEnum
CREATE TYPE "MitraType" AS ENUM ('KAMPUS', 'SEKOLAH');

-- AlterTable
ALTER TABLE "MentorProfile" DROP COLUMN "bio",
DROP COLUMN "linkedin";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "headline",
DROP COLUMN "role",
ADD COLUMN     "role" "PlatformRole" NOT NULL DEFAULT 'USER';

-- DropEnum
DROP TYPE "UserRole";

-- CreateTable
CREATE TABLE "Mitra" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "MitraType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Mitra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserMitraRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mitraId" TEXT NOT NULL,
    "role" "MitraRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserMitraRole_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Mitra_slug_key" ON "Mitra"("slug");

-- CreateIndex
CREATE INDEX "Mitra_type_idx" ON "Mitra"("type");

-- CreateIndex
CREATE INDEX "Mitra_deletedAt_idx" ON "Mitra"("deletedAt");

-- CreateIndex
CREATE INDEX "UserMitraRole_userId_idx" ON "UserMitraRole"("userId");

-- CreateIndex
CREATE INDEX "UserMitraRole_mitraId_idx" ON "UserMitraRole"("mitraId");

-- CreateIndex
CREATE INDEX "UserMitraRole_role_idx" ON "UserMitraRole"("role");

-- CreateIndex
CREATE UNIQUE INDEX "UserMitraRole_userId_mitraId_role_key" ON "UserMitraRole"("userId", "mitraId", "role");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- AddForeignKey
ALTER TABLE "UserMitraRole" ADD CONSTRAINT "UserMitraRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMitraRole" ADD CONSTRAINT "UserMitraRole_mitraId_fkey" FOREIGN KEY ("mitraId") REFERENCES "Mitra"("id") ON DELETE CASCADE ON UPDATE CASCADE;
