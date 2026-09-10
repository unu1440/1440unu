import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatDateKo(date: Date) {
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function formatClock(date: Date) {
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

export default async function HomePage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <section className="hero">
        <div className="hero-count">
          {/* //1440unu */}
        </div>
        <p className="hero-tagline">
          이 사이트는 테스트 중입니다.
        </p>
      </section>

      <ul className="post-list">
        {posts.length === 0 && <li className="empty">아직 쓴 글이 없습니다.</li>}
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
