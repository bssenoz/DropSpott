-- CreateTable
CREATE TABLE "Drop" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "claimWindowStart" DATETIME NOT NULL,
    "claimWindowEnd" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "WaitlistEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "dropId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WaitlistEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WaitlistEntry_dropId_fkey" FOREIGN KEY ("dropId") REFERENCES "Drop" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClaimCode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dropId" TEXT NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedAt" DATETIME,
    CONSTRAINT "ClaimCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ClaimCode_dropId_fkey" FOREIGN KEY ("dropId") REFERENCES "Drop" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "WaitlistEntry_dropId_position_idx" ON "WaitlistEntry"("dropId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "WaitlistEntry_userId_dropId_key" ON "WaitlistEntry"("userId", "dropId");

-- CreateIndex
CREATE UNIQUE INDEX "ClaimCode_code_key" ON "ClaimCode"("code");

-- CreateIndex
CREATE INDEX "ClaimCode_dropId_idx" ON "ClaimCode"("dropId");

-- CreateIndex
CREATE INDEX "ClaimCode_userId_idx" ON "ClaimCode"("userId");

-- CreateIndex
CREATE INDEX "ClaimCode_code_idx" ON "ClaimCode"("code");
