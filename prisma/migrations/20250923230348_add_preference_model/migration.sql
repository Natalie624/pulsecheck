/*
  Warnings:

  - The values [WIN,RISK,BLOCKER,NEXT_STEP] on the enum `StatusType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."StatusType_new" AS ENUM ('WINS', 'RISKS', 'BLOCKERS', 'DEPENDENCY', 'NEXT_STEPS');
ALTER TABLE "public"."StatusItem" ALTER COLUMN "type" TYPE "public"."StatusType_new" USING ("type"::text::"public"."StatusType_new");
ALTER TYPE "public"."StatusType" RENAME TO "StatusType_old";
ALTER TYPE "public"."StatusType_new" RENAME TO "StatusType";
DROP TYPE "public"."StatusType_old";
COMMIT;
