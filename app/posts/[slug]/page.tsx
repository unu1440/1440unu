import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CommentForm from "@/components/CommentForm";

export const dynamic = "force-dynamic";

function formatDateKo(date: Date) {
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function formatClock(date: Date) {
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug },
    include: { comments: { orderBy: { createdAt: "asc" } } },
  });

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
