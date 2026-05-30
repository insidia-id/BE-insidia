export function serializeAcademicYear(record: any) {
  return record;
}

export function serializeSemester(record: any) {
  return record;
}

export function serializeCurriculum(record: any) {
  return record;
}

export function serializeSubject(record: any) {
  return {
    id: record.id,
    mitraId: record.mitraId,
    curriculumId: record.curriculumId,
    name: record.title,
    slug: record.slug,
    code: record.code,
    description: record.description,
    status: record.academicStatus,
    courseStatus: record.status,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    deletedAt: record.deletedAt,
    curriculum: record.curriculum,
  };
}

export function serializeAcademicClass(record: any) {
  return record;
}

export function serializeClassGroup(record: any) {
  return record;
}

export function serializeClassGroupCourse(record: any) {
  const { course, ...rest } = record;
  return {
    ...rest,
    subject: serializeSubject(course),
  };
}

export function serializeClassGroupStudent(record: any) {
  return record;
}

export function serializeLearningMaterial(record: any) {
  const { course, ...rest } = record;
  return {
    ...rest,
    subject: serializeSubject(course),
  };
}
