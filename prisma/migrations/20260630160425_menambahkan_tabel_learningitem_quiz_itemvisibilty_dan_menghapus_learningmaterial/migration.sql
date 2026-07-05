/*
  Warnings:

  - You are about to drop the column `courseId` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `moduleId` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the `LearningMaterial` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[learningItemId]` on the table `Lesson` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `learningItemId` to the `Lesson` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "LearningItemType" AS ENUM ('LESSON', 'QUIZ', 'ASSIGNMENT');

-- DropForeignKey
ALTER TABLE "LearningMaterial" DROP CONSTRAINT "LearningMaterial_classGroupId_fkey";

-- DropForeignKey
ALTER TABLE "LearningMaterial" DROP CONSTRAINT "LearningMaterial_courseId_fkey";

-- DropForeignKey
ALTER TABLE "LearningMaterial" DROP CONSTRAINT "LearningMaterial_mitraId_fkey";

-- DropForeignKey
ALTER TABLE "LearningMaterial" DROP CONSTRAINT "LearningMaterial_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_moduleId_fkey";

-- DropIndex
DROP INDEX "Lesson_courseId_idx";

-- DropIndex
DROP INDEX "Lesson_courseId_slug_key";

-- DropIndex
DROP INDEX "Lesson_moduleId_sortOrder_key";

-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "courseId",
DROP COLUMN "moduleId",
ADD COLUMN     "learningItemId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Module" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "LearningMaterial";

-- CreateTable
CREATE TABLE "LearningItem" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "moduleId" TEXT,
    "type" "LearningItemType" NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "availableFrom" TIMESTAMP(3),
    "availableUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quiz" (
    "id" TEXT NOT NULL,
    "learningItemId" TEXT NOT NULL,
    "duration" INTEGER,
    "passingScore" INTEGER,
    "maxAttempts" INTEGER,
    "shuffleQuestions" BOOLEAN NOT NULL DEFAULT false,
    "showAnswerAfterSubmit" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizQuestion" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "explanation" TEXT,
    "points" INTEGER NOT NULL DEFAULT 1,
    "order" INTEGER NOT NULL,

    CONSTRAINT "QuizQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizOption" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,

    CONSTRAINT "QuizOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizAttempt" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "score" DOUBLE PRECISION,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "QuizAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizAnswer" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "optionId" TEXT,

    CONSTRAINT "QuizAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" TEXT NOT NULL,
    "learningItemId" TEXT NOT NULL,
    "instruction" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "maxScore" INTEGER NOT NULL DEFAULT 100,
    "allowLateSubmission" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningItemVisibility" (
    "id" TEXT NOT NULL,
    "learningItemId" TEXT NOT NULL,
    "classGroupCourseId" TEXT NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "LearningItemVisibility_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LearningItem_moduleId_order_key" ON "LearningItem"("moduleId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Quiz_learningItemId_key" ON "Quiz"("learningItemId");

-- CreateIndex
CREATE UNIQUE INDEX "QuizQuestion_quizId_order_key" ON "QuizQuestion"("quizId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Assignment_learningItemId_key" ON "Assignment"("learningItemId");

-- CreateIndex
CREATE UNIQUE INDEX "LearningItemVisibility_learningItemId_classGroupCourseId_key" ON "LearningItemVisibility"("learningItemId", "classGroupCourseId");

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_learningItemId_key" ON "Lesson"("learningItemId");

-- AddForeignKey
ALTER TABLE "LearningItem" ADD CONSTRAINT "LearningItem_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningItem" ADD CONSTRAINT "LearningItem_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_learningItemId_fkey" FOREIGN KEY ("learningItemId") REFERENCES "LearningItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_learningItemId_fkey" FOREIGN KEY ("learningItemId") REFERENCES "LearningItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizOption" ADD CONSTRAINT "QuizOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuizQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAnswer" ADD CONSTRAINT "QuizAnswer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "QuizAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_learningItemId_fkey" FOREIGN KEY ("learningItemId") REFERENCES "LearningItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningItemVisibility" ADD CONSTRAINT "LearningItemVisibility_learningItemId_fkey" FOREIGN KEY ("learningItemId") REFERENCES "LearningItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningItemVisibility" ADD CONSTRAINT "LearningItemVisibility_classGroupCourseId_fkey" FOREIGN KEY ("classGroupCourseId") REFERENCES "ClassGroupCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
