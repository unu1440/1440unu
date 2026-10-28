-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "affiliationEn" TEXT,
ADD COLUMN     "bioEn" TEXT,
ADD COLUMN     "interestsEn" TEXT,
ADD COLUMN     "slogan" TEXT,
ADD COLUMN     "sloganEn" TEXT,
ADD COLUMN     "taglineEn" TEXT;

-- AlterTable
ALTER TABLE "HistoryEntry" ADD COLUMN     "descriptionEn" TEXT,
ADD COLUMN     "orgEn" TEXT,
ADD COLUMN     "titleEn" TEXT;
