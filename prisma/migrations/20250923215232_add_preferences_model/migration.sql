-- CreateTable
CREATE TABLE "public"."Preference" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "pov" TEXT,
    "format" TEXT,
    "tone" TEXT,
    "thirdPersonName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Preference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Preference_sessionId_key" ON "public"."Preference"("sessionId");

-- AddForeignKey
ALTER TABLE "public"."Preference" ADD CONSTRAINT "Preference_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
