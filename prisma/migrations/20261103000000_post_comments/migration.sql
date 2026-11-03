-- 옛 블로그 때 만든 Comment 테이블을 새 댓글 구조로 바꿈 (기존 데이터 유지)
-- 외래키 Comment_postId_fkey (ON DELETE CASCADE)는 init_postgres에서 이미 만들어져 있음

-- AlterTable
ALTER TABLE "Comment" RENAME COLUMN "author" TO "name";
ALTER TABLE "Comment" ADD COLUMN "ipHash" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Comment" ALTER COLUMN "ipHash" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Comment_postId_createdAt_idx" ON "Comment"("postId", "createdAt");

-- CreateIndex
CREATE INDEX "Comment_ipHash_createdAt_idx" ON "Comment"("ipHash", "createdAt");
