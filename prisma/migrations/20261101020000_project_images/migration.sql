-- AlterTable
ALTER TABLE "HistoryEntry" ADD COLUMN "images" TEXT[] DEFAULT ARRAY[]::TEXT[];
