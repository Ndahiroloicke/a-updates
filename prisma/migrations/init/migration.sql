-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'PUBLISHER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('POLITICS', 'BUSINESS', 'TECHNOLOGY', 'SCIENCE', 'HEALTH', 'SPORTS', 'ENTERTAINMENT', 'LIFESTYLE', 'WORLD', 'EDUCATION', 'ENVIRONMENT', 'TRAVEL', 'FOOD', 'FASHION', 'ART', 'CULTURE', 'RELIGION', 'CRIME', 'OPINION', 'ANALYSIS', 'LOCAL', 'NATIONAL', 'GLOBAL', 'HISTORY', 'WEATHER', 'FINANCE', 'REAL_ESTATE', 'STARTUPS', 'AUTOMOTIVE', 'CAREER', 'LAW', 'PHOTOGRAPHY', 'VIDEOGRAPHY', 'ANIMALS', 'AGRICULTURE', 'GAMING', 'CELEBRITY');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('LIKE', 'FOLLOW', 'COMMENT', 'BECOME_PUBLISHER');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "users" (
  "id" TEXT NOT NULL,
  "username" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "email" TEXT,
  "passwordHash" TEXT,
  "googleId" TEXT,
  "avatarUrl" TEXT,
  "bio" TEXT,
  "role" "Role" NOT NULL DEFAULT 'USER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "hasPaid" BOOLEAN DEFAULT false,

  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
  "id" TEXT NOT NULL,
  "recipientId" TEXT NOT NULL,
  "issuerId" TEXT NOT NULL,
  "postId" TEXT,
  "storyId" TEXT,
  "type" "NotificationType" NOT NULL,
  "read" BOOLEAN NOT NULL DEFAULT false,
  "body" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "publisherRequestId" TEXT,

  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publisher_requests" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "status" "RequestStatus" NOT NULL,
  "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "respondedAt" TIMESTAMP(3),
  "message" TEXT,

  CONSTRAINT "publisher_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publisher_profiles" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "workPhone" TEXT NOT NULL,
  "cellPhone" TEXT,
  "address" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "stateProvince" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "postalCode" TEXT NOT NULL,
  "companyName" TEXT NOT NULL,
  "socialMedia" TEXT,
  "pressReleaseFrequency" TEXT NOT NULL,
  "productsOfInterest" TEXT[],
  "bestTimeToReach" TEXT NOT NULL,
  "additionalInfo" TEXT,
  "paymentType" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "publisher_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");
CREATE UNIQUE INDEX "publisher_profiles_userId_key" ON "publisher_profiles"("userId");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_issuerId_fkey" FOREIGN KEY ("issuerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_publisherRequestId_fkey" FOREIGN KEY ("publisherRequestId") REFERENCES "publisher_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publisher_requests" ADD CONSTRAINT "publisher_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publisher_profiles" ADD CONSTRAINT "publisher_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE; 