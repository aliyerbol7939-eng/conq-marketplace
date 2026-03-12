-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ListingStatus" ADD VALUE 'REVIEW_PENDING';
ALTER TYPE "ListingStatus" ADD VALUE 'REJECTED';

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "avStatus" TEXT DEFAULT 'PENDING',
ADD COLUMN     "fileSha256" TEXT,
ADD COLUMN     "moderationReasons" TEXT,
ADD COLUMN     "thumbSha256" TEXT;
