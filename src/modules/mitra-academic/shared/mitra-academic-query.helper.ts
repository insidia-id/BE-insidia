export type MitraAcademicTerm = {
  academicYearId?: string;
  semesterId?: string;
};

export function toAcademicTermParams(term: MitraAcademicTerm) {
  return {
    academicYearId: term.academicYearId,
    semesterId: term.semesterId,
  };
}

export function matchesAcademicClassTerm(
  item: { academicClass: { academicYearId: string; semesterId: string } },
  term: MitraAcademicTerm,
) {
  if (
    term.academicYearId &&
    item.academicClass.academicYearId !== term.academicYearId
  ) {
    return false;
  }

  if (term.semesterId && item.academicClass.semesterId !== term.semesterId) {
    return false;
  }

  return true;
}
