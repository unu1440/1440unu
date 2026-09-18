import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

// 30초마다 정적 캐시를 재검증 (ISR)
export const revalidate = 30;

const VALID_CATS = ["study", "tech", "blog"] as const;
type Cat = (typeof VALID_CATS)[number];

const LABELS: Record<Cat, string> = {
  study: "Study",
  tech: "Tech",
  blog: "Blog",
};

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

// 카테고리별 공개 글 목록 페이지 (/category/[cat])
export default async function CategoryPage({
  params,
}: {
  params: Promise<{ cat: string }>;
}) {
  const { cat } = await params;

  // 유효하지 않은 카테고리면 404
  if (!VALID_CATS.includes(cat as Cat)) {
    notFound();
  }
  const category = cat as Cat;

  // 해당 카테고리의 공개된 글만 최신순으로 조회
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