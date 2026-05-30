CREATE TYPE "AcademicStatus" AS ENUM ('ACTIVE', 'INACTIVE');

ALTER TABLE "Course"
  ADD COLUMN "mitraId" TEXT,
  ADD COLUMN "curriculumId" TEXT,
  ADD COLUMN "code" TEXT,
  ADD COLUMN "academicStatus" "AcademicStatus" NOT NULL DEFAULT 'ACTIVE';

CREATE TABLE "AcademicYear" (
  "id" TEXT NOT NULL,
  "mitraId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3) NOT NULL,
  "status" "AcademicStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "AcademicYear_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Semester" (
  "id" TEXT NOT NULL,
  "mitraId" TEXT NOT NULL,
  "academicYearId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3) NOT NULL,
  "status" "AcademicStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "Semester_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Curriculum" (
  "id" TEXT NOT NULL,
  "mitraId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "code" TEXT,
  "description" TEXT,
  "status" "AcademicStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "Curriculum_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AcademicClass" (
  "id" TEXT NOT NULL,
  "mitraId" TEXT NOT NULL,
  "academicYearId" TEXT NOT NULL,
  "semesterId" TEXT NOT NULL,
  "curriculumId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "level" TEXT NOT NULL,
  "status" "AcademicStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "AcademicClass_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ClassGroup" (
  "id" TEXT NOT NULL,
  "mitraId" TEXT NOT NULL,
  "classId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "waliKelasId" TEXT,
  "status" "AcademicStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "ClassGroup_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ClassGroupCourse" (
  "id" TEXT NOT NULL,
  "mitraId" TEXT NOT NULL,
  "classGroupId" TEXT NOT NULL,
  "courseId" TEXT NOT NULL,
  "teacherId" TEXT NOT NULL,
  "academicYearId" TEXT NOT NULL,
  "semesterId" TEXT NOT NULL,
  "status" "AcademicStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "ClassGroupCourse_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ClassGroupStudent" (
  "id" TEXT NOT NULL,
  "mitraId" TEXT NOT NULL,
  "classGroupId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "academicYearId" TEXT NOT NULL,
  "semesterId" TEXT NOT NULL,
  "status" "AcademicStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "ClassGroupStudent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LearningMaterial" (
  "id" TEXT NOT NULL,
  "mitraId" TEXT NOT NULL,
  "classGroupId" TEXT NOT NULL,
  "courseId" TEXT NOT NULL,
  "teacherId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "filePath" TEXT NOT NULL,
  "fileType" TEXT NOT NULL,
  "fileSize" INTEGER NOT NULL,
  "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "status" "AcademicStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "LearningMaterial_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AcademicYear_mitraId_name_key" ON "AcademicYear"("mitraId", "name");
CREATE INDEX "AcademicYear_mitraId_idx" ON "AcademicYear"("mitraId");
CREATE INDEX "AcademicYear_status_idx" ON "AcademicYear"("status");
CREATE INDEX "AcademicYear_deletedAt_idx" ON "AcademicYear"("deletedAt");

CREATE UNIQUE INDEX "Semester_academicYearId_name_key" ON "Semester"("academicYearId", "name");
CREATE INDEX "Semester_mitraId_idx" ON "Semester"("mitraId");
CREATE INDEX "Semester_academicYearId_idx" ON "Semester"("academicYearId");
CREATE INDEX "Semester_status_idx" ON "Semester"("status");
CREATE INDEX "Semester_deletedAt_idx" ON "Semester"("deletedAt");

CREATE UNIQUE INDEX "Curriculum_mitraId_name_key" ON "Curriculum"("mitraId", "name");
CREATE UNIQUE INDEX "Curriculum_mitraId_code_key" ON "Curriculum"("mitraId", "code");
CREATE INDEX "Curriculum_mitraId_idx" ON "Curriculum"("mitraId");
CREATE INDEX "Curriculum_status_idx" ON "Curriculum"("status");
CREATE INDEX "Curriculum_deletedAt_idx" ON "Curriculum"("deletedAt");

CREATE UNIQUE INDEX "AcademicClass_mitraId_academicYearId_semesterId_name_key"
  ON "AcademicClass"("mitraId", "academicYearId", "semesterId", "name");
CREATE INDEX "AcademicClass_mitraId_idx" ON "AcademicClass"("mitraId");
CREATE INDEX "AcademicClass_academicYearId_idx" ON "AcademicClass"("academicYearId");
CREATE INDEX "AcademicClass_semesterId_idx" ON "AcademicClass"("semesterId");
CREATE INDEX "AcademicClass_curriculumId_idx" ON "AcademicClass"("curriculumId");
CREATE INDEX "AcademicClass_status_idx" ON "AcademicClass"("status");
CREATE INDEX "AcademicClass_deletedAt_idx" ON "AcademicClass"("deletedAt");

CREATE UNIQUE INDEX "ClassGroup_classId_name_key" ON "ClassGroup"("classId", "name");
CREATE INDEX "ClassGroup_mitraId_idx" ON "ClassGroup"("mitraId");
CREATE INDEX "ClassGroup_classId_idx" ON "ClassGroup"("classId");
CREATE INDEX "ClassGroup_waliKelasId_idx" ON "ClassGroup"("waliKelasId");
CREATE INDEX "ClassGroup_status_idx" ON "ClassGroup"("status");
CREATE INDEX "ClassGroup_deletedAt_idx" ON "ClassGroup"("deletedAt");

CREATE UNIQUE INDEX "ClassGroupCourse_classGroupId_courseId_academicYearId_semesterId_key"
  ON "ClassGroupCourse"("classGroupId", "courseId", "academicYearId", "semesterId");
CREATE INDEX "ClassGroupCourse_mitraId_idx" ON "ClassGroupCourse"("mitraId");
CREATE INDEX "ClassGroupCourse_classGroupId_idx" ON "ClassGroupCourse"("classGroupId");
CREATE INDEX "ClassGroupCourse_courseId_idx" ON "ClassGroupCourse"("courseId");
CREATE INDEX "ClassGroupCourse_teacherId_idx" ON "ClassGroupCourse"("teacherId");
CREATE INDEX "ClassGroupCourse_academicYearId_idx" ON "ClassGroupCourse"("academicYearId");
CREATE INDEX "ClassGroupCourse_semesterId_idx" ON "ClassGroupCourse"("semesterId");
CREATE INDEX "ClassGroupCourse_status_idx" ON "ClassGroupCourse"("status");
CREATE INDEX "ClassGroupCourse_deletedAt_idx" ON "ClassGroupCourse"("deletedAt");

CREATE UNIQUE INDEX "ClassGroupStudent_classGroupId_studentId_academicYearId_semesterId_key"
  ON "ClassGroupStudent"("classGroupId", "studentId", "academicYearId", "semesterId");
CREATE INDEX "ClassGroupStudent_mitraId_idx" ON "ClassGroupStudent"("mitraId");
CREATE INDEX "ClassGroupStudent_classGroupId_idx" ON "ClassGroupStudent"("classGroupId");
CREATE INDEX "ClassGroupStudent_studentId_idx" ON "ClassGroupStudent"("studentId");
CREATE INDEX "ClassGroupStudent_academicYearId_idx" ON "ClassGroupStudent"("academicYearId");
CREATE INDEX "ClassGroupStudent_semesterId_idx" ON "ClassGroupStudent"("semesterId");
CREATE INDEX "ClassGroupStudent_status_idx" ON "ClassGroupStudent"("status");
CREATE INDEX "ClassGroupStudent_deletedAt_idx" ON "ClassGroupStudent"("deletedAt");

CREATE INDEX "LearningMaterial_mitraId_idx" ON "LearningMaterial"("mitraId");
CREATE INDEX "LearningMaterial_classGroupId_idx" ON "LearningMaterial"("classGroupId");
CREATE INDEX "LearningMaterial_courseId_idx" ON "LearningMaterial"("courseId");
CREATE INDEX "LearningMaterial_teacherId_idx" ON "LearningMaterial"("teacherId");
CREATE INDEX "LearningMaterial_status_idx" ON "LearningMaterial"("status");
CREATE INDEX "LearningMaterial_deletedAt_idx" ON "LearningMaterial"("deletedAt");

CREATE INDEX "Course_mitraId_idx" ON "Course"("mitraId");
CREATE INDEX "Course_curriculumId_idx" ON "Course"("curriculumId");
CREATE INDEX "Course_academicStatus_idx" ON "Course"("academicStatus");
CREATE UNIQUE INDEX "Course_mitraId_code_key" ON "Course"("mitraId", "code");

ALTER TABLE "Course"
  ADD CONSTRAINT "Course_mitraId_fkey"
  FOREIGN KEY ("mitraId") REFERENCES "Mitra"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Course"
  ADD CONSTRAINT "Course_curriculumId_fkey"
  FOREIGN KEY ("curriculumId") REFERENCES "Curriculum"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AcademicYear"
  ADD CONSTRAINT "AcademicYear_mitraId_fkey"
  FOREIGN KEY ("mitraId") REFERENCES "Mitra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Semester"
  ADD CONSTRAINT "Semester_mitraId_fkey"
  FOREIGN KEY ("mitraId") REFERENCES "Mitra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Semester"
  ADD CONSTRAINT "Semester_academicYearId_fkey"
  FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Curriculum"
  ADD CONSTRAINT "Curriculum_mitraId_fkey"
  FOREIGN KEY ("mitraId") REFERENCES "Mitra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AcademicClass"
  ADD CONSTRAINT "AcademicClass_mitraId_fkey"
  FOREIGN KEY ("mitraId") REFERENCES "Mitra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AcademicClass"
  ADD CONSTRAINT "AcademicClass_academicYearId_fkey"
  FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AcademicClass"
  ADD CONSTRAINT "AcademicClass_semesterId_fkey"
  FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AcademicClass"
  ADD CONSTRAINT "AcademicClass_curriculumId_fkey"
  FOREIGN KEY ("curriculumId") REFERENCES "Curriculum"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ClassGroup"
  ADD CONSTRAINT "ClassGroup_mitraId_fkey"
  FOREIGN KEY ("mitraId") REFERENCES "Mitra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ClassGroup"
  ADD CONSTRAINT "ClassGroup_classId_fkey"
  FOREIGN KEY ("classId") REFERENCES "AcademicClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ClassGroup"
  ADD CONSTRAINT "ClassGroup_waliKelasId_fkey"
  FOREIGN KEY ("waliKelasId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ClassGroupCourse"
  ADD CONSTRAINT "ClassGroupCourse_mitraId_fkey"
  FOREIGN KEY ("mitraId") REFERENCES "Mitra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ClassGroupCourse"
  ADD CONSTRAINT "ClassGroupCourse_classGroupId_fkey"
  FOREIGN KEY ("classGroupId") REFERENCES "ClassGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ClassGroupCourse"
  ADD CONSTRAINT "ClassGroupCourse_courseId_fkey"
  FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ClassGroupCourse"
  ADD CONSTRAINT "ClassGroupCourse_teacherId_fkey"
  FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ClassGroupCourse"
  ADD CONSTRAINT "ClassGroupCourse_academicYearId_fkey"
  FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ClassGroupCourse"
  ADD CONSTRAINT "ClassGroupCourse_semesterId_fkey"
  FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ClassGroupStudent"
  ADD CONSTRAINT "ClassGroupStudent_mitraId_fkey"
  FOREIGN KEY ("mitraId") REFERENCES "Mitra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ClassGroupStudent"
  ADD CONSTRAINT "ClassGroupStudent_classGroupId_fkey"
  FOREIGN KEY ("classGroupId") REFERENCES "ClassGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ClassGroupStudent"
  ADD CONSTRAINT "ClassGroupStudent_studentId_fkey"
  FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ClassGroupStudent"
  ADD CONSTRAINT "ClassGroupStudent_academicYearId_fkey"
  FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ClassGroupStudent"
  ADD CONSTRAINT "ClassGroupStudent_semesterId_fkey"
  FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "LearningMaterial"
  ADD CONSTRAINT "LearningMaterial_mitraId_fkey"
  FOREIGN KEY ("mitraId") REFERENCES "Mitra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LearningMaterial"
  ADD CONSTRAINT "LearningMaterial_classGroupId_fkey"
  FOREIGN KEY ("classGroupId") REFERENCES "ClassGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LearningMaterial"
  ADD CONSTRAINT "LearningMaterial_courseId_fkey"
  FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LearningMaterial"
  ADD CONSTRAINT "LearningMaterial_teacherId_fkey"
  FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
