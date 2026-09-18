import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CommentForm from "@/components/CommentForm";

// 댓글이 실시간으로 반영되어야 하므로 캐시하지 않음
export const dynamic = "force-dynamic";

// "9월 18일" 형식으로 날짜 표시
function formatDateKo(date: Date) {
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

// "HH:MM" 형식으로 시각 표시
function formatClock(date: Date) {
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

// 글 상세 페이지 (/posts/[slug]) - 본문과 댓글, 댓글 작성 폼을 함께 표시
export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // 글과 함께 댓글을 오래된 순으로 조회
  const post = await prisma.post.findUnique({
    where: { slug },
    include: { comments: { orderBy: { createdAt: "asc" } } },
  });

  // 존재하지 않거나 비공개 글이면 404
  if (!post || !post.published) {
    notFound();
  }

  return (
    <div className="post-page">
      <Link className="back-link" href="/">
        ← 모든 글
      </Link>
      <p className="post-meta">
        {formatDateKo(post.createdAt)} <span className="clock">{formatClock(post.createdAt)}</span>에 쓴 글
      </p>
      <h1>{post.title}</h1>
      <div className="post-body" dangerouslySetInnerHTML={{ __html: post.content }} />

      <section className="comments">
        <h2>댓글 {post.comments.length}개</h2>
        <ul className="comment-list">
          {post.comments.length === 0 && <li className="empty">첫 댓글을 남겨보세요.</li>}
          {post.comments.map((c) => (
            <li key={c.id}>
              <div className="comment-head">
                <span className="comment-author">{c.author}</span>
                <span className="comment-date">
                  {formatDateKo(c.createdAt)} {formatClock(c.createdAt)}
                </span>
              </div>
              <p className="comment-body">{c.content}</p>
            </li>
          ))}
        </ul>
        <CommentForm postId={post.id} />
      </section>
    </div>
  );
}
