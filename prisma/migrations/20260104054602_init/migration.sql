-- CreateTable
CREATE TABLE "DailyLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dateISO" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "weightKg" REAL NOT NULL DEFAULT 0,
    "waistCm" REAL NOT NULL DEFAULT 0,
    "steps" INTEGER NOT NULL DEFAULT 0,
    "waterCups" INTEGER NOT NULL DEFAULT 0,
    "suppsJson" TEXT NOT NULL DEFAULT '{}',
    "workout" TEXT NOT NULL DEFAULT '',
    "extraBurnJson" TEXT NOT NULL DEFAULT '{}',
    "macrosJson" TEXT NOT NULL DEFAULT '{}',
    "calIn" INTEGER NOT NULL DEFAULT 0,
    "calOut" INTEGER NOT NULL DEFAULT 0,
    "fastingHours" REAL NOT NULL DEFAULT 0,
    "sleepHours" REAL NOT NULL DEFAULT 0,
    "recoveryJson" TEXT NOT NULL DEFAULT '{}',
    "checkinJson" TEXT NOT NULL DEFAULT '{}',
    "inbodyJson" TEXT NOT NULL DEFAULT '{}',
    "notes" TEXT NOT NULL DEFAULT '',
    "titanScore" INTEGER NOT NULL DEFAULT 0,
    "flagsJson" TEXT NOT NULL DEFAULT '{}'
);

-- CreateTable
CREATE TABLE "AppConfig" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyLog_dateISO_key" ON "DailyLog"("dateISO");
