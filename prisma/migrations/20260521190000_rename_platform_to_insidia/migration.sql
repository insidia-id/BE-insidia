ALTER TYPE "RoleScope" RENAME VALUE 'PLATFORM' TO 'INSIDIA';

ALTER TABLE "UserPlatformRole" RENAME TO "UserInsidiaRole";

ALTER TABLE "UserInsidiaRole"
  RENAME CONSTRAINT "UserPlatformRole_pkey" TO "UserInsidiaRole_pkey";

ALTER INDEX "UserPlatformRole_userId_key"
  RENAME TO "UserInsidiaRole_userId_key";

ALTER INDEX "UserPlatformRole_roleId_idx"
  RENAME TO "UserInsidiaRole_roleId_idx";

ALTER TABLE "UserInsidiaRole"
  RENAME CONSTRAINT "UserPlatformRole_userId_fkey" TO "UserInsidiaRole_userId_fkey";

ALTER TABLE "UserInsidiaRole"
  RENAME CONSTRAINT "UserPlatformRole_roleId_fkey" TO "UserInsidiaRole_roleId_fkey";
