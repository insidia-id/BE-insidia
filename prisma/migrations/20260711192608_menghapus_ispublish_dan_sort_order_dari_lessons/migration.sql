/*
  Warnings:

  - You are about to drop the column `isPublished` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `sortOrder` on the `Lesson` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "isPublished",
DROP COLUMN "sortOrder";
