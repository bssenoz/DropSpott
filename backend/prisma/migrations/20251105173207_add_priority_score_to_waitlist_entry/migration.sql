/*
  Warnings:

  - Added the required column `priorityScore` to the `WaitlistEntry` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_WaitlistEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "dropId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "priorityScore" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WaitlistEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WaitlistEntry_dropId_fkey" FOREIGN KEY ("dropId") REFERENCES "Drop" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_WaitlistEntry" ("createdAt", "dropId", "id", "position", "userId") SELECT "createdAt", "dropId", "id", "position", "userId" FROM "WaitlistEntry";
DROP TABLE "WaitlistEntry";
ALTER TABLE "new_WaitlistEntry" RENAME TO "WaitlistEntry";
CREATE INDEX "WaitlistEntry_dropId_position_idx" ON "WaitlistEntry"("dropId", "position");
CREATE INDEX "WaitlistEntry_dropId_priorityScore_idx" ON "WaitlistEntry"("dropId", "priorityScore");
CREATE UNIQUE INDEX "WaitlistEntry_userId_dropId_key" ON "WaitlistEntry"("userId", "dropId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
