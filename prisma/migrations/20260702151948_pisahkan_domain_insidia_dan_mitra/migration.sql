/*
  Warnings:

  - You are about to drop the column `courseId` on the `Certificate` table. All the data in the column will be lost.
  - You are about to drop the column `courseId` on the `ClassGroupCourse` table. All the data in the column will be lost.
  - You are about to drop the column `academicStatus` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `curriculumId` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `isFree` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `language` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `mitraId` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `outcomes` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `publishedAt` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `rejectReason` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `rejectedAt` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `requirements` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `salePrice` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `targetUsers` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `courseId` on the `CourseLike` table. All the data in the column will be lost.
  - You are about to drop the column `courseId` on the `CourseReview` table. All the data in the column will be lost.
  - You are about to drop the column `courseId` on the `Enrollment` table. All the data in the column will be lost.
  - You are about to drop the column `courseId` on the `LearningItem` table. All the data in the column will be lost.
  - You are about to drop the column `courseId` on the `Module` table. All the data in the column will be lost.
  - You are about to drop the column `courseId` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `courseId` on the `Wishlist` table. All the data in the column will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LearningItemVisibility` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,courseInsidiaId]` on the table `Certificate` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[classGroupId,courseMitraId,academicYearId,semesterId]` on the table `ClassGroupCourse` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,courseInsidiaId]` on the table `CourseLike` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[courseInsidiaId,userId]` on the table `CourseReview` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,courseInsidiaId]` on the table `Enrollment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[courseInsidiaId,sortOrder]` on the table `Module` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[classGroupCourseId,sortOrder]` on the table `Module` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[orderId,courseInsidiaId]` on the table `OrderItem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,courseInsidiaId]` on the table `Wishlist` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `courseInsidiaId` to the `Certificate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `courseInsidiaId` to the `CourseLike` table without a default value. This is not possible if the table is not empty.
  - Added the required column `courseInsidiaId` to the `CourseReview` table without a default value. This is not possible if the table is not empty.
  - Added the required column `courseInsidiaId` to the `Enrollment` table without a default value. This is not possible if the table is not empty.
  - Made the column `moduleId` on table `LearningItem` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `courseInsidiaId` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `courseInsidiaId` to the `Wishlist` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Certificate" DROP CONSTRAINT "Certificate_courseId_fkey";

-- DropForeignKey
ALTER TABLE "ClassGroupCourse" DROP CONSTRAINT "ClassGroupCourse_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_curriculumId_fkey";

-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_mitraId_fkey";

-- DropForeignKey
ALTER TABLE "CourseLike" DROP CONSTRAINT "CourseLike_courseId_fkey";

-- DropForeignKey
ALTER TABLE "CourseReview" DROP CONSTRAINT "CourseReview_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Enrollment" DROP CONSTRAINT "Enrollment_courseId_fkey";

-- DropForeignKey
ALTER TABLE "LearningItem" DROP CONSTRAINT "LearningItem_courseId_fkey";

-- DropForeignKey
ALTER TABLE "LearningItemVisibility" DROP CONSTRAINT "LearningItemVisibility_classGroupCourseId_fkey";

-- DropForeignKey
ALTER TABLE "LearningItemVisibility" DROP CONSTRAINT "LearningItemVisibility_learningItemId_fkey";

-- DropForeignKey
ALTER TABLE "Module" DROP CONSTRAINT "Module_courseId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Wishlist" DROP CONSTRAINT "Wishlist_courseId_fkey";

-- DropIndex
DROP INDEX "Certificate_courseId_idx";

-- DropIndex
DROP INDEX "Certificate_userId_courseId_key";

-- DropIndex
DROP INDEX "ClassGroupCourse_classGroupId_courseId_academicYearId_semes_key";

-- DropIndex
DROP INDEX "ClassGroupCourse_courseId_idx";

-- DropIndex
DROP INDEX "Course_academicStatus_idx";

-- DropIndex
DROP INDEX "Course_categoryId_idx";

-- DropIndex
DROP INDEX "Course_curriculumId_idx";

-- DropIndex
DROP INDEX "Course_mitraId_code_key";

-- DropIndex
DROP INDEX "Course_mitraId_idx";

-- DropIndex
DROP INDEX "Course_status_idx";

-- DropIndex
DROP INDEX "CourseLike_courseId_createdAt_idx";

-- DropIndex
DROP INDEX "CourseLike_userId_courseId_key";

-- DropIndex
DROP INDEX "CourseReview_courseId_status_createdAt_idx";

-- DropIndex
DROP INDEX "CourseReview_courseId_userId_key";

-- DropIndex
DROP INDEX "Enrollment_courseId_idx";

-- DropIndex
DROP INDEX "Enrollment_userId_courseId_key";

-- DropIndex
DROP INDEX "Module_courseId_sortOrder_key";

-- DropIndex
DROP INDEX "OrderItem_courseId_idx";

-- DropIndex
DROP INDEX "OrderItem_orderId_courseId_key";

-- DropIndex
DROP INDEX "Wishlist_courseId_idx";

-- DropIndex
DROP INDEX "Wishlist_userId_courseId_key";

-- AlterTable
ALTER TABLE "Certificate" DROP COLUMN "courseId",
ADD COLUMN     "courseInsidiaId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ClassGroupCourse" DROP COLUMN "courseId",
ADD COLUMN     "courseMitraId" TEXT;

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "academicStatus",
DROP COLUMN "categoryId",
DROP COLUMN "curriculumId",
DROP COLUMN "isFree",
DROP COLUMN "language",
DROP COLUMN "level",
DROP COLUMN "mitraId",
DROP COLUMN "outcomes",
DROP COLUMN "price",
DROP COLUMN "publishedAt",
DROP COLUMN "rejectReason",
DROP COLUMN "rejectedAt",
DROP COLUMN "requirements",
DROP COLUMN "salePrice",
DROP COLUMN "status",
DROP COLUMN "targetUsers";

-- AlterTable
ALTER TABLE "CourseLike" DROP COLUMN "courseId",
ADD COLUMN     "courseInsidiaId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CourseReview" DROP COLUMN "courseId",
ADD COLUMN     "courseInsidiaId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Enrollment" DROP COLUMN "courseId",
ADD COLUMN     "courseInsidiaId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "LearningItem" DROP COLUMN "courseId",
ALTER COLUMN "moduleId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Module" DROP COLUMN "courseId",
ADD COLUMN     "classGroupCourseId" TEXT,
ADD COLUMN     "courseInsidiaId" TEXT;

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "courseId",
ADD COLUMN     "courseInsidiaId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Wishlist" DROP COLUMN "courseId",
ADD COLUMN     "courseInsidiaId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Category";

-- DropTable
DROP TABLE "LearningItemVisibility";

-- DropEnum
DROP TYPE "CourseStatus";

-- CreateTable
CREATE TABLE "CourseInsidia" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "level" "CourseLevel" NOT NULL DEFAULT 'ALL_LEVEL',
    "price" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "salePrice" DECIMAL(12,2),
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "requirements" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "outcomes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "targetUsers" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "CourseInsidia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseMitra" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "mitraId" TEXT,
    "curriculumId" TEXT,
    "academicStatus" "AcademicStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "CourseMitra_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CourseInsidia_courseId_key" ON "CourseInsidia"("courseId");

-- CreateIndex
CREATE INDEX "CourseInsidia_level_idx" ON "CourseInsidia"("level");

-- CreateIndex
CREATE INDEX "CourseInsidia_price_idx" ON "CourseInsidia"("price");

-- CreateIndex
CREATE UNIQUE INDEX "CourseMitra_courseId_key" ON "CourseMitra"("courseId");

-- CreateIndex
CREATE INDEX "CourseMitra_mitraId_idx" ON "CourseMitra"("mitraId");

-- CreateIndex
CREATE INDEX "CourseMitra_curriculumId_idx" ON "CourseMitra"("curriculumId");

-- CreateIndex
CREATE INDEX "CourseMitra_academicStatus_idx" ON "CourseMitra"("academicStatus");

-- CreateIndex
CREATE INDEX "Certificate_courseInsidiaId_idx" ON "Certificate"("courseInsidiaId");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_userId_courseInsidiaId_key" ON "Certificate"("userId", "courseInsidiaId");

-- CreateIndex
CREATE INDEX "ClassGroupCourse_courseMitraId_idx" ON "ClassGroupCourse"("courseMitraId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassGroupCourse_classGroupId_courseMitraId_academicYearId__key" ON "ClassGroupCourse"("classGroupId", "courseMitraId", "academicYearId", "semesterId");

-- CreateIndex
CREATE INDEX "Course_scope_idx" ON "Course"("scope");

-- CreateIndex
CREATE INDEX "CourseLike_courseInsidiaId_createdAt_idx" ON "CourseLike"("courseInsidiaId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CourseLike_userId_courseInsidiaId_key" ON "CourseLike"("userId", "courseInsidiaId");

-- CreateIndex
CREATE INDEX "CourseReview_courseInsidiaId_status_createdAt_idx" ON "CourseReview"("courseInsidiaId", "status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CourseReview_courseInsidiaId_userId_key" ON "CourseReview"("courseInsidiaId", "userId");

-- CreateIndex
CREATE INDEX "Enrollment_courseInsidiaId_idx" ON "Enrollment"("courseInsidiaId");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_userId_courseInsidiaId_key" ON "Enrollment"("userId", "courseInsidiaId");

-- CreateIndex
CREATE INDEX "LearningItem_moduleId_idx" ON "LearningItem"("moduleId");

-- CreateIndex
CREATE INDEX "LearningItem_type_idx" ON "LearningItem"("type");

-- CreateIndex
CREATE INDEX "LearningItem_published_idx" ON "LearningItem"("published");

-- CreateIndex
CREATE INDEX "Module_courseInsidiaId_idx" ON "Module"("courseInsidiaId");

-- CreateIndex
CREATE INDEX "Module_classGroupCourseId_idx" ON "Module"("classGroupCourseId");

-- CreateIndex
CREATE INDEX "Module_deletedAt_idx" ON "Module"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Module_courseInsidiaId_sortOrder_key" ON "Module"("courseInsidiaId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Module_classGroupCourseId_sortOrder_key" ON "Module"("classGroupCourseId", "sortOrder");

-- CreateIndex
CREATE INDEX "OrderItem_courseInsidiaId_idx" ON "OrderItem"("courseInsidiaId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderItem_orderId_courseInsidiaId_key" ON "OrderItem"("orderId", "courseInsidiaId");

-- CreateIndex
CREATE INDEX "QuizAnswer_attemptId_idx" ON "QuizAnswer"("attemptId");

-- CreateIndex
CREATE INDEX "QuizAnswer_questionId_idx" ON "QuizAnswer"("questionId");

-- CreateIndex
CREATE INDEX "QuizAttempt_quizId_idx" ON "QuizAttempt"("quizId");

-- CreateIndex
CREATE INDEX "QuizOption_questionId_idx" ON "QuizOption"("questionId");

-- CreateIndex
CREATE INDEX "QuizQuestion_quizId_idx" ON "QuizQuestion"("quizId");

-- CreateIndex
CREATE INDEX "Wishlist_courseInsidiaId_idx" ON "Wishlist"("courseInsidiaId");

-- CreateIndex
CREATE UNIQUE INDEX "Wishlist_userId_courseInsidiaId_key" ON "Wishlist"("userId", "courseInsidiaId");

-- AddForeignKey
ALTER TABLE "ClassGroupCourse" ADD CONSTRAINT "ClassGroupCourse_courseMitraId_fkey" FOREIGN KEY ("courseMitraId") REFERENCES "CourseMitra"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseInsidia" ADD CONSTRAINT "CourseInsidia_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseMitra" ADD CONSTRAINT "CourseMitra_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseMitra" ADD CONSTRAINT "CourseMitra_mitraId_fkey" FOREIGN KEY ("mitraId") REFERENCES "Mitra"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseMitra" ADD CONSTRAINT "CourseMitra_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "Curriculum"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Module" ADD CONSTRAINT "Module_courseInsidiaId_fkey" FOREIGN KEY ("courseInsidiaId") REFERENCES "CourseInsidia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Module" ADD CONSTRAINT "Module_classGroupCourseId_fkey" FOREIGN KEY ("classGroupCourseId") REFERENCES "ClassGroupCourse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_courseInsidiaId_fkey" FOREIGN KEY ("courseInsidiaId") REFERENCES "CourseInsidia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_courseInsidiaId_fkey" FOREIGN KEY ("courseInsidiaId") REFERENCES "CourseInsidia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseReview" ADD CONSTRAINT "CourseReview_courseInsidiaId_fkey" FOREIGN KEY ("courseInsidiaId") REFERENCES "CourseInsidia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseLike" ADD CONSTRAINT "CourseLike_courseInsidiaId_fkey" FOREIGN KEY ("courseInsidiaId") REFERENCES "CourseInsidia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_courseInsidiaId_fkey" FOREIGN KEY ("courseInsidiaId") REFERENCES "CourseInsidia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_courseInsidiaId_fkey" FOREIGN KEY ("courseInsidiaId") REFERENCES "CourseInsidia"("id") ON DELETE CASCADE ON UPDATE CASCADE;
