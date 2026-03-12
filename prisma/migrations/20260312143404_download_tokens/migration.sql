-- CreateTable
CREATE TABLE "DownloadToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,

    CONSTRAINT "DownloadToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DownloadToken_token_key" ON "DownloadToken"("token");

-- AddForeignKey
ALTER TABLE "DownloadToken" ADD CONSTRAINT "DownloadToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DownloadToken" ADD CONSTRAINT "DownloadToken_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
