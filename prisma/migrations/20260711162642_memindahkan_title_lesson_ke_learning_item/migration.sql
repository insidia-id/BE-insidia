/*
  Warnings:

  - You are about to drop the column `description` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Lesson` table. All the data in the column will be lost.
  - Added the required column `slug` to the `LearningItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LearningItem" ADD COLUMN     "description" TEXT,
ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "description",
DROP COLUMN "slug",
DROP COLUMN "title";
