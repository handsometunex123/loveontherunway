-- CreateTable
CREATE TABLE "DesignerInvite" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "DesignerInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DesignerInvite_tokenHash_key" ON "DesignerInvite"("tokenHash");

-- CreateIndex
CREATE INDEX "DesignerInvite_email_idx" ON "DesignerInvite"("email");

-- CreateIndex
CREATE INDEX "DesignerInvite_expiresAt_idx" ON "DesignerInvite"("expiresAt");

-- AddForeignKey
ALTER TABLE "DesignerInvite" ADD CONSTRAINT "DesignerInvite_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
