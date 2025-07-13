/*
  Warnings:

  - Made the column `animalId` on table `records` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "records" DROP CONSTRAINT "records_animalId_fkey";

-- AlterTable
ALTER TABLE "records" ALTER COLUMN "animalId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "records" ADD CONSTRAINT "records_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "animals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
