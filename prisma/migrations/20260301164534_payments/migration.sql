/*
  Warnings:

  - You are about to drop the column `stripeCheckoutSessionId` on the `Purchase` table. All the data in the column will be lost.
  - You are about to drop the column `stripePaymentIntentId` on the `Purchase` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Purchase_stripeCheckoutSessionId_key";

-- DropIndex
DROP INDEX "Purchase_stripePaymentIntentId_key";

-- AlterTable
ALTER TABLE "Purchase" DROP COLUMN "stripeCheckoutSessionId",
DROP COLUMN "stripePaymentIntentId",
ADD COLUMN     "paymentProvider" TEXT,
ADD COLUMN     "providerPaymentId" TEXT;
