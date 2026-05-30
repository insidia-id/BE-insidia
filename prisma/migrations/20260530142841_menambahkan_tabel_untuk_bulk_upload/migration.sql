-- CreateEnum
CREATE TYPE "BulkUploadJobStatus" AS ENUM ('VALIDATED', 'QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "BulkUploadRowStatus" AS ENUM ('VALID', 'INVALID', 'SUCCESS', 'FAILED', 'SKIPPED');

-- CreateTable
CREATE TABLE "BulkUploadJob" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "uploadedBy" TEXT,
    "status" "BulkUploadJobStatus" NOT NULL DEFAULT 'VALIDATED',
    "totalRows" INTEGER NOT NULL DEFAULT 0,
    "validRows" INTEGER NOT NULL DEFAULT 0,
    "invalidRows" INTEGER NOT NULL DEFAULT 0,
    "successRows" INTEGER NOT NULL DEFAULT 0,
    "failedRows" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BulkUploadJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BulkUploadRow" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "rowNumber" INTEGER NOT NULL,
    "rawData" JSONB NOT NULL,
    "errors" JSONB,
    "status" "BulkUploadRowStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BulkUploadRow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BulkUploadRow_jobId_idx" ON "BulkUploadRow"("jobId");

-- CreateIndex
CREATE INDEX "BulkUploadRow_status_idx" ON "BulkUploadRow"("status");

-- AddForeignKey
ALTER TABLE "BulkUploadRow" ADD CONSTRAINT "BulkUploadRow_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "BulkUploadJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
