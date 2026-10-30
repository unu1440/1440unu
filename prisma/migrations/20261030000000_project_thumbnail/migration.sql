-- 프로젝트 썸네일 (작은 JPEG data URL, 프로필 사진처럼 DB에 직접 저장)
ALTER TABLE "HistoryEntry" ADD COLUMN "thumbnail" TEXT;
