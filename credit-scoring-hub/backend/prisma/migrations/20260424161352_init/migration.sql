-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "monthlyIncome" DOUBLE PRECISION NOT NULL,
    "loanAmount" DOUBLE PRECISION NOT NULL,
    "loanTermMonths" INTEGER NOT NULL,
    "creditHistoryYears" DOUBLE PRECISION NOT NULL,
    "currentDebt" DOUBLE PRECISION NOT NULL,
    "employmentYears" DOUBLE PRECISION NOT NULL,
    "dependents" INTEGER NOT NULL,
    "result" TEXT NOT NULL,
    "probability" DOUBLE PRECISION NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "recommendedAmount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);
