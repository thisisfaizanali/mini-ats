-- CreateEnum
CREATE TYPE "Stage" AS ENUM ('APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED');

-- CreateEnum
CREATE TYPE "Source" AS ENUM ('LINKEDIN', 'REFERRAL', 'JOB_BOARD', 'CAREERS_PAGE', 'OTHER');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'OPEN',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "skills" TEXT[],
    "source" "Source" NOT NULL,
    "resumeUrl" TEXT,
    "notes" TEXT,
    "stage" "Stage" NOT NULL DEFAULT 'APPLIED',
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "jobId" TEXT NOT NULL,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StageChange" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "fromStage" "Stage",
    "toStage" "Stage" NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StageChange_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_email_key" ON "Candidate"("email");

-- CreateIndex
CREATE INDEX "Candidate_stage_idx" ON "Candidate"("stage");

-- CreateIndex
CREATE INDEX "Candidate_jobId_idx" ON "Candidate"("jobId");

-- CreateIndex
CREATE INDEX "Candidate_appliedAt_idx" ON "Candidate"("appliedAt");

-- CreateIndex
CREATE INDEX "StageChange_candidateId_changedAt_idx" ON "StageChange"("candidateId", "changedAt");

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageChange" ADD CONSTRAINT "StageChange_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
