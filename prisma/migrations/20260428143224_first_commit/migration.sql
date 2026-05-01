-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'ADMIN_MENTOR', 'ADMIN_AKADEMIK', 'MENTOR', 'AKADEMIK', 'GURU', 'MURID', 'WALI_MURID', 'USER_BIASA');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'BANNED');

-- CreateEnum
CREATE TYPE "LoginEventProvider" AS ENUM ('GOOGLE', 'EMAIL');

-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('DRAFT', 'REVIEW', 'PUBLISHED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CourseLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVEL');

-- CreateEnum
CREATE TYPE "LessonType" AS ENUM ('VIDEO', 'ARTICLE', 'QUIZ', 'ASSIGNMENT', 'LIVE_SESSION');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO', 'DOCUMENT', 'AUDIO');

-- CreateEnum
CREATE TYPE "MediaOwnerType" AS ENUM ('COURSE', 'MODULE', 'LESSON', 'REVIEW', 'COMMENT', 'PROFILE');

-- CreateEnum
CREATE TYPE "EnrollmentSource" AS ENUM ('PURCHASED', 'ASSIGNED', 'FREE', 'MIGRATION');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING_PAYMENT', 'PAID', 'COMPLETED', 'CANCELLED', 'EXPIRED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentGateway" AS ENUM ('MIDTRANS', 'XENDIT', 'DUITKU', 'MANUAL');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('BANK_TRANSFER', 'E_WALLET', 'QRIS', 'CREDIT_CARD', 'MANUAL_TRANSFER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'EXPIRED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'PUBLISHED', 'HIDDEN', 'REJECTED');

-- CreateEnum
CREATE TYPE "CommentStatus" AS ENUM ('PUBLISHED', 'HIDDEN', 'DELETED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('PAYMENT_SUCCESS', 'COURSE_ENROLLED', 'COURSE_ASSIGNED', 'COURSE_COMMENT', 'LESSON_REPLY', 'CERTIFICATE_ISSUED', 'ADMIN_NOTICE');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('USER_CREATE', 'USER_UPDATE', 'USER_SUSPEND', 'COURSE_CREATE', 'COURSE_UPDATE', 'COURSE_SUBMIT_REVIEW', 'COURSE_PUBLISH', 'COURSE_REJECT', 'ORDER_CREATE', 'ORDER_UPDATE', 'PAYMENT_UPDATE', 'ENROLLMENT_CREATE', 'ENROLLMENT_ASSIGN', 'ENROLLMENT_CANCEL', 'REVIEW_MODERATE', 'COMMENT_MODERATE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "normalizedEmail" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "password" TEXT,
    "phone" TEXT,
    "phoneVerifiedAt" TIMESTAMP(3),
    "image" TEXT,
    "imagePublicId" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER_BIASA',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "bio" TEXT,
    "headline" TEXT,
    "websiteUrl" TEXT,
    "socialLinks" JSONB,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("provider","provider_account_id")
);

-- CreateTable
CREATE TABLE "LoginEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT,
    "provider" "LoginEventProvider" NOT NULL,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "reason" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MentorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expertise" TEXT,
    "bio" TEXT,
    "linkedin" TEXT,
    "portfolio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MentorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuruProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nip" TEXT,
    "subject" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuruProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "position" TEXT,
    "division" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MuridProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nis" TEXT,
    "kelas" TEXT,
    "jurusan" TEXT,
    "waliId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MuridProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaliMuridProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pekerjaan" TEXT,
    "alamat" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WaliMuridProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "status" "CourseStatus" NOT NULL DEFAULT 'DRAFT',
    "level" "CourseLevel" NOT NULL DEFAULT 'ALL_LEVEL',
    "categoryId" TEXT,
    "language" TEXT NOT NULL DEFAULT 'id',
    "price" DECIMAL(12,2) NOT NULL,
    "salePrice" DECIMAL(12,2),
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "requirements" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "outcomes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "targetUsers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "totalDurationSec" INTEGER NOT NULL DEFAULT 0,
    "totalLessons" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "rejectReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Module" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "type" "LessonType" NOT NULL DEFAULT 'VIDEO',
    "content" TEXT,
    "videoUrl" TEXT,
    "durationSec" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPreview" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "ownerType" "MediaOwnerType" NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT,
    "filename" TEXT,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "durationSec" INTEGER,
    "alt" TEXT,
    "caption" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "courseId" TEXT,
    "moduleId" TEXT,
    "lessonId" TEXT,
    "reviewId" TEXT,
    "commentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "subtotal" DECIMAL(12,2) NOT NULL,
    "discount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL,
    "couponCode" TEXT,
    "notes" TEXT,
    "expiresAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "titleSnapshot" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "discount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "lineTotal" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(12,2) NOT NULL,
    "gateway" "PaymentGateway" NOT NULL,
    "channelCode" TEXT,
    "gatewayReference" TEXT,
    "paymentUrl" TEXT,
    "gatewayStatusCode" TEXT,
    "gatewayStatusMessage" TEXT,
    "callbackPayload" JSONB,
    "callbackAt" TIMESTAMP(3),
    "proofUrl" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "orderId" TEXT,
    "source" "EnrollmentSource" NOT NULL DEFAULT 'PURCHASED',
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "assignedById" TEXT,
    "assignedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiredAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "progressPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "watchedSec" INTEGER NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "lastAccessAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "CommentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommentReply" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CommentReply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseReview" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "moderationReason" TEXT,
    "moderatedAt" TIMESTAMP(3),
    "moderatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CourseReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewReply" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewReply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseLike" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonLike" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wishlist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Wishlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "discountPercent" INTEGER,
    "discountAmount" DECIMAL(12,2),
    "maxUsage" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefundRequest" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "reasonDetail" TEXT,
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "amount" DECIMAL(12,2),
    "note" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefundRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "certificateNo" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fileUrl" TEXT,
    "verificationUrl" TEXT,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT,
    "data" JSONB,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" "AuditAction" NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_normalizedEmail_key" ON "User"("normalizedEmail");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "User_createdById_idx" ON "User"("createdById");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE INDEX "LoginEvent_userId_createdAt_idx" ON "LoginEvent"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "LoginEvent_email_createdAt_idx" ON "LoginEvent"("email", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MentorProfile_userId_key" ON "MentorProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GuruProfile_userId_key" ON "GuruProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicProfile_userId_key" ON "AcademicProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MuridProfile_userId_key" ON "MuridProfile"("userId");

-- CreateIndex
CREATE INDEX "MuridProfile_waliId_idx" ON "MuridProfile"("waliId");

-- CreateIndex
CREATE INDEX "MuridProfile_kelas_idx" ON "MuridProfile"("kelas");

-- CreateIndex
CREATE UNIQUE INDEX "WaliMuridProfile_userId_key" ON "WaliMuridProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_name_idx" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");

-- CreateIndex
CREATE INDEX "Course_creatorId_idx" ON "Course"("creatorId");

-- CreateIndex
CREATE INDEX "Course_categoryId_idx" ON "Course"("categoryId");

-- CreateIndex
CREATE INDEX "Course_status_idx" ON "Course"("status");

-- CreateIndex
CREATE INDEX "Course_deletedAt_idx" ON "Course"("deletedAt");

-- CreateIndex
CREATE INDEX "Module_courseId_sortOrder_idx" ON "Module"("courseId", "sortOrder");

-- CreateIndex
CREATE INDEX "Lesson_courseId_idx" ON "Lesson"("courseId");

-- CreateIndex
CREATE INDEX "Lesson_moduleId_sortOrder_idx" ON "Lesson"("moduleId", "sortOrder");

-- CreateIndex
CREATE INDEX "Lesson_deletedAt_idx" ON "Lesson"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_courseId_slug_key" ON "Lesson"("courseId", "slug");

-- CreateIndex
CREATE INDEX "Media_courseId_sortOrder_idx" ON "Media"("courseId", "sortOrder");

-- CreateIndex
CREATE INDEX "Media_moduleId_sortOrder_idx" ON "Media"("moduleId", "sortOrder");

-- CreateIndex
CREATE INDEX "Media_lessonId_sortOrder_idx" ON "Media"("lessonId", "sortOrder");

-- CreateIndex
CREATE INDEX "Media_reviewId_idx" ON "Media"("reviewId");

-- CreateIndex
CREATE INDEX "Media_commentId_idx" ON "Media"("commentId");

-- CreateIndex
CREATE INDEX "Media_ownerType_idx" ON "Media"("ownerType");

-- CreateIndex
CREATE UNIQUE INDEX "Order_code_key" ON "Order"("code");

-- CreateIndex
CREATE INDEX "Order_userId_createdAt_idx" ON "Order"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Order_status_createdAt_idx" ON "Order"("status", "createdAt");

-- CreateIndex
CREATE INDEX "OrderItem_courseId_idx" ON "OrderItem"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderItem_orderId_courseId_key" ON "OrderItem"("orderId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_orderId_key" ON "Payment"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_gatewayReference_key" ON "Payment"("gatewayReference");

-- CreateIndex
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");

-- CreateIndex
CREATE INDEX "Payment_status_createdAt_idx" ON "Payment"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Payment_method_idx" ON "Payment"("method");

-- CreateIndex
CREATE INDEX "Enrollment_courseId_idx" ON "Enrollment"("courseId");

-- CreateIndex
CREATE INDEX "Enrollment_orderId_idx" ON "Enrollment"("orderId");

-- CreateIndex
CREATE INDEX "Enrollment_source_idx" ON "Enrollment"("source");

-- CreateIndex
CREATE INDEX "Enrollment_status_idx" ON "Enrollment"("status");

-- CreateIndex
CREATE INDEX "Enrollment_assignedById_idx" ON "Enrollment"("assignedById");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_userId_courseId_key" ON "Enrollment"("userId", "courseId");

-- CreateIndex
CREATE INDEX "LessonProgress_lessonId_idx" ON "LessonProgress"("lessonId");

-- CreateIndex
CREATE INDEX "LessonProgress_userId_updatedAt_idx" ON "LessonProgress"("userId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "LessonProgress_userId_lessonId_key" ON "LessonProgress"("userId", "lessonId");

-- CreateIndex
CREATE INDEX "Comment_lessonId_createdAt_idx" ON "Comment"("lessonId", "createdAt");

-- CreateIndex
CREATE INDEX "Comment_userId_createdAt_idx" ON "Comment"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Comment_status_idx" ON "Comment"("status");

-- CreateIndex
CREATE INDEX "Comment_deletedAt_idx" ON "Comment"("deletedAt");

-- CreateIndex
CREATE INDEX "CommentReply_commentId_createdAt_idx" ON "CommentReply"("commentId", "createdAt");

-- CreateIndex
CREATE INDEX "CommentReply_userId_createdAt_idx" ON "CommentReply"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "CommentReply_deletedAt_idx" ON "CommentReply"("deletedAt");

-- CreateIndex
CREATE INDEX "CourseReview_courseId_status_createdAt_idx" ON "CourseReview"("courseId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "CourseReview_userId_createdAt_idx" ON "CourseReview"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "CourseReview_deletedAt_idx" ON "CourseReview"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CourseReview_courseId_userId_key" ON "CourseReview"("courseId", "userId");

-- CreateIndex
CREATE INDEX "ReviewReply_reviewId_createdAt_idx" ON "ReviewReply"("reviewId", "createdAt");

-- CreateIndex
CREATE INDEX "ReviewReply_actorId_createdAt_idx" ON "ReviewReply"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "CourseLike_courseId_createdAt_idx" ON "CourseLike"("courseId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CourseLike_userId_courseId_key" ON "CourseLike"("userId", "courseId");

-- CreateIndex
CREATE INDEX "LessonLike_lessonId_createdAt_idx" ON "LessonLike"("lessonId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "LessonLike_userId_lessonId_key" ON "LessonLike"("userId", "lessonId");

-- CreateIndex
CREATE INDEX "Wishlist_courseId_idx" ON "Wishlist"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "Wishlist_userId_courseId_key" ON "Wishlist"("userId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");

-- CreateIndex
CREATE INDEX "Coupon_isActive_idx" ON "Coupon"("isActive");

-- CreateIndex
CREATE INDEX "Coupon_startsAt_endsAt_idx" ON "Coupon"("startsAt", "endsAt");

-- CreateIndex
CREATE UNIQUE INDEX "RefundRequest_orderId_key" ON "RefundRequest"("orderId");

-- CreateIndex
CREATE INDEX "RefundRequest_status_createdAt_idx" ON "RefundRequest"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_certificateNo_key" ON "Certificate"("certificateNo");

-- CreateIndex
CREATE INDEX "Certificate_courseId_idx" ON "Certificate"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_userId_courseId_key" ON "Certificate"("userId", "courseId");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");

-- CreateIndex
CREATE INDEX "Notification_type_createdAt_idx" ON "Notification"("type", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_createdAt_idx" ON "AuditLog"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoginEvent" ADD CONSTRAINT "LoginEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorProfile" ADD CONSTRAINT "MentorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuruProfile" ADD CONSTRAINT "GuruProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicProfile" ADD CONSTRAINT "AcademicProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MuridProfile" ADD CONSTRAINT "MuridProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MuridProfile" ADD CONSTRAINT "MuridProfile_waliId_fkey" FOREIGN KEY ("waliId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaliMuridProfile" ADD CONSTRAINT "WaliMuridProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Module" ADD CONSTRAINT "Module_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "CourseReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentReply" ADD CONSTRAINT "CommentReply_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentReply" ADD CONSTRAINT "CommentReply_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseReview" ADD CONSTRAINT "CourseReview_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseReview" ADD CONSTRAINT "CourseReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewReply" ADD CONSTRAINT "ReviewReply_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "CourseReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewReply" ADD CONSTRAINT "ReviewReply_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseLike" ADD CONSTRAINT "CourseLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseLike" ADD CONSTRAINT "CourseLike_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonLike" ADD CONSTRAINT "LessonLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonLike" ADD CONSTRAINT "LessonLike_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundRequest" ADD CONSTRAINT "RefundRequest_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
