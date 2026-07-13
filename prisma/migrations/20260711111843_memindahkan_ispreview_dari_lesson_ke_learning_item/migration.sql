/*
  Warnings:

  - You are about to drop the column `isPreview` on the `Lesson` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LearningItem" ADD COLUMN     "isPreview" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "isPreview";
