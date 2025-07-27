-- CreateEnum
CREATE TYPE "ConfirmationTokenType" AS ENUM ('VERIFICATION', 'PASSWORD_RECOVERY');

-- CreateTable
CREATE TABLE "ConfirmationToken" (
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "ConfirmationTokenType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfirmationToken_pkey" PRIMARY KEY ("token")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConfirmationToken_token_key" ON "ConfirmationToken"("token");

-- AddForeignKey
ALTER TABLE "ConfirmationToken" ADD CONSTRAINT "ConfirmationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
