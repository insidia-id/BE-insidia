/*
  Warnings:

  - The values [SUSPENDED] on the enum `UserStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `content` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `durationSec` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `videoUrl` on the `Lesson` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[moduleId,sortOrder]` on the table `Lesson` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[courseId,sortOrder]` on the table `Module` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserStatus_new" AS ENUM ('ACTIVE', 'BANNED');
ALTER TABLE "public"."User" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "status" TYPE "UserStatus_new" USING ("status"::text::"UserStatus_new");
ALTER TYPE "UserStatus" RENAME TO "UserStatus_old";
ALTER TYPE "UserStatus_new" RENAME TO "UserStatus";
DROP TYPE "public"."UserStatus_old";
ALTER TABLE "User" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- DropIndex
DROP INDEX "Lesson_moduleId_sortOrder_idx";

-- DropIndex
DROP INDEX "Module_courseId_sortOrder_idx";

-- AlterTable
ALTER TABLE "Course" ALTER COLUMN "price" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "content",
DROP COLUMN "durationSec",
DROP COLUMN "videoUrl",
ADD COLUMN     "contentHtml" TEXT,
ADD COLUMN     "contentJson" JSONB;

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_moduleId_sortOrder_key" ON "Lesson"("moduleId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Module_courseId_sortOrder_key" ON "Module"("courseId", "sortOrder");
