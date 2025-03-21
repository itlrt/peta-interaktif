/*
  Warnings:

  - You are about to drop the column `image` on the `Destination` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `Station` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name,stationId]` on the table `Destination` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Station` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Destination" DROP CONSTRAINT "Destination_stationId_fkey";

-- AlterTable
ALTER TABLE "Destination" DROP COLUMN "image",
ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "Station" DROP COLUMN "image",
ADD COLUMN     "imageUrl" TEXT,
ALTER COLUMN "location" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Destination_name_stationId_key" ON "Destination"("name", "stationId");

-- CreateIndex
CREATE UNIQUE INDEX "Station_name_key" ON "Station"("name");

-- AddForeignKey
ALTER TABLE "Destination" ADD CONSTRAINT "Destination_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE CASCADE ON UPDATE CASCADE;
