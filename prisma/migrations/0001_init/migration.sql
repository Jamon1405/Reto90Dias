-- CreateTable
CREATE TABLE "TitanDay" (
    "date" TEXT NOT NULL,
    "tsUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "waist" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "workout" TEXT NOT NULL DEFAULT '',
    "calIn" INTEGER NOT NULL DEFAULT 0,
    "calOut" INTEGER NOT NULL DEFAULT 0,
    "water" INTEGER NOT NULL DEFAULT 0,
    "suppsJson" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "macrosJson" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "fastHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "steps" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT NOT NULL DEFAULT '',
    "activityJson" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "titanScore" INTEGER NOT NULL DEFAULT 0,
    "flagsJson" JSONB NOT NULL DEFAULT '{}'::jsonb,

    CONSTRAINT "TitanDay_pkey" PRIMARY KEY ("date")
);

-- CreateTable
CREATE TABLE "TitanState" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TitanState_pkey" PRIMARY KEY ("key")
);
