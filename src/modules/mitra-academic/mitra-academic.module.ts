import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastruktur/prisma/prisma.module';
import { AccessTokenGuard } from '../../shared/guards/access-token.guard';
import { AuthModule } from '../auth/auth.module';
import { JwtTokenService } from '../auth/jwt-token.service';
import { RolesModule } from '../roles/roles.module';
import { AcademicClassController } from './academic-class/academic-class.controller';
import { AcademicClassService } from './academic-class/academic-class.service';
import { AcademicYearController } from './academic-year/academic-year.controller';
import { AcademicYearService } from './academic-year/academic-year.service';
import { ClassGroupController } from './class-group/class-group.controller';
import { ClassGroupService } from './class-group/class-group.service';
import { ClassGroupCourseController } from './class-group-course/class-group-course.controller';
import { ClassGroupCourseService } from './class-group-course/class-group-course.service';
import { ClassGroupStudentController } from './class-group-student/class-group-student.controller';
import { ClassGroupStudentService } from './class-group-student/class-group-student.service';
import { CurriculumController } from './curriculum/curriculum.controller';
import { CurriculumRepository } from './curriculum/curriculum.repository';
import { CurriculumService } from './curriculum/curriculum.service';
import { LearningMaterialController } from './learning-material/learning-material.controller';
import { LearningMaterialService } from './learning-material/learning-material.service';
import { MitraAcademicPolicy } from './mitra-academic.policy';
import { MitraAcademicRepository } from './mitra-academic.repository';
import { MyAcademicController } from './my-academic/my-academic.controller';
import { MyAcademicService } from './my-academic/my-academic.service';
import { SemesterController } from './semester/semester.controller';
import { SemesterService } from './semester/semester.service';
import { SubjectController } from './subject/subject.controller';
import { SubjectService } from './subject/subject.service';
import { MitraAcademicAccessService } from './shared/mitra-academic-access.service';

@Module({
  imports: [PrismaModule, AuthModule, RolesModule],
  controllers: [
    AcademicYearController,
    SemesterController,
    CurriculumController,
    SubjectController,
    AcademicClassController,
    ClassGroupController,
    ClassGroupCourseController,
    ClassGroupStudentController,
    LearningMaterialController,
    MyAcademicController,
  ],
  providers: [
    AcademicYearService,
    SemesterService,
    CurriculumService,
    SubjectService,
    AcademicClassService,
    ClassGroupService,
    ClassGroupCourseService,
    ClassGroupStudentService,
    LearningMaterialService,
    MyAcademicService,
    CurriculumRepository,
    MitraAcademicRepository,
    MitraAcademicPolicy,
    MitraAcademicAccessService,
    JwtTokenService,
    AccessTokenGuard,
  ],
  exports: [
    MitraAcademicAccessService,
    MitraAcademicRepository,
    CurriculumRepository,
  ],
})
export class MitraAcademicModule {}
