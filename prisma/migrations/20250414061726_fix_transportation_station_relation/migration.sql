/*
  Warnings:

  - You are about to drop the column `stationId` on the `Transportation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name,type]` on the table `Transportation` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Transportation" DROP CONSTRAINT "Transportation_stationId_fkey";

-- DropIndex
DROP INDEX "Transportation_type_name_stationId_key";

-- AlterTable
ALTER TABLE "Transportation" DROP COLUMN "stationId",
ADD COLUMN     "isAllStation" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "_StationTransportation" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_StationTransportation_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_StationTransportation_B_index" ON "_StationTransportation"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Transportation_name_type_key" ON "Transportation"("name", "type");

-- AddForeignKey
ALTER TABLE "_StationTransportation" ADD CONSTRAINT "_StationTransportation_A_fkey" FOREIGN KEY ("A") REFERENCES "Station"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StationTransportation" ADD CONSTRAINT "_StationTransportation_B_fkey" FOREIGN KEY ("B") REFERENCES "Transportation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
