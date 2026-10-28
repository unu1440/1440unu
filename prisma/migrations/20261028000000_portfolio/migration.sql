-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "affiliation" TEXT,
ADD COLUMN     "cvUrl" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "github" TEXT,
ADD COLUMN     "interests" TEXT,
ADD COLUMN     "nameEn" TEXT,
ADD COLUMN     "scholar" TEXT,
ADD COLUMN     "skills" TEXT;

-- AlterTable
ALTER TABLE "HistoryEntry" ADD COLUMN     "link" TEXT,
ADD COLUMN     "tags" TEXT;
