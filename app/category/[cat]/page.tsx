import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const VALID_CATS = ["study", "tech", "blog"] as const;
type Cat = (typeof VALID_CATS)[number];

const LABELS: Record<Cat, string> = {
  study: "Study",
  tech: "Tech",
  blog: "Blog",
};

function formatDateKo(date: Date) {
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function formatClock(date: Date) {
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ cat: string }>;
}) {
  const { cat } = await params;

  if (!VALID_CATS.includes(cat as Cat)) {
    notFound();
  }
  const category = cat as Cat;

  const posts = await prisma.post.findMany({
    where: { published: true, category },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <Link className="back-link" href="/">
        ← Tree로 돌아가기
      </Link>
      <h1 className="category-title">{LABELS[category]}</h1>

      <ul className="post-list">
        {posts.length === 0 && <li className="empty">아직 이 카테고리엔 쓴 글이 없습니다.</li>}
        {posts.map((post) => (
          <li key={post.id}>
            <Link className="post-entry" href={`/posts/${post.slug}`}>
              <span className="post-stamp">
                {formatDateKo(post.createdAt)}
                <span className="clock">{formatClock(post.createdAt)}</span>
              </span>
              <span>
                <span className="post-title">{post.title}</span>
                {post.excerpt && <p className="post-excerpt">{post.excerpt}</p>}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}