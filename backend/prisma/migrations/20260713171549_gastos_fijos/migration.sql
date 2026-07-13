-- CreateEnum
CREATE TYPE "FixedExpenseCategory" AS ENUM ('ALQUILER', 'SERVICIO', 'CREDITO', 'OTRO');

-- CreateTable
CREATE TABLE "FixedExpense" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" "FixedExpenseCategory" NOT NULL DEFAULT 'OTRO',
    "amount" DECIMAL(12,2) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FixedExpense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FixedExpense_category_idx" ON "FixedExpense"("category");
