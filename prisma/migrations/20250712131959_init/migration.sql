/*
  Warnings:

  - You are about to drop the column `type` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `records` table. All the data in the column will be lost.
  - Added the required column `emoji` to the `animal_types` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryTypeId` to the `categories` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "animal_types" ADD COLUMN     "emoji" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "type",
ADD COLUMN     "categoryTypeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "records" DROP COLUMN "type";

-- DropEnum
DROP TYPE "CategoryType";

-- CreateTable
CREATE TABLE "category_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "category_types_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "category_types_name_key" ON "category_types"("name");

-- CreateIndex
CREATE INDEX "categories_categoryTypeId_idx" ON "categories"("categoryTypeId");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_categoryTypeId_fkey" FOREIGN KEY ("categoryTypeId") REFERENCES "category_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
