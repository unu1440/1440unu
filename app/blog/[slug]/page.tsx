import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import PostAdmin from "@/components/PostAdmin";
import SiteHeader from "@/components/SiteHeader";
import { requireAdmin } from "@/lib/auth";
import { formatPostDate, parsePostLinks, readingMinutes } from "@/lib/post-utils";
import { loadCategories, loadPost } from "@/lib/posts";

export const dynamic = "force-dynamic";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await loadPost(params.slug, false);
  return { title: post ? `${post.title} - 1440unu.com` : "1440unu.com" };
}

// 글 페이지 (/blog/[slug]) - 비공개 글은 관리자만, 본문은 Markdown (HTML은 실행하지 않음)
export default async function PostPage({ params }: Props) {
  const isAdmin = await requireAdmin();
  const post = await loadPost(params.slug, isAdmin);
  if (!post) notFound();
  const categories = isAdmin ? await loadCategories() : [];
  const postLinks = parsePostLinks(post.links);

  return (
    <>
      <SiteHeader />
      <main className="blog">
        <Link className="post-back" href="/blog">
          Blog
        </Link>
        <header className="post-head">
          <p className="post-meta">
            {post.category && <span>{post.category}</span>}
            <span>{formatPostDate(post.createdAt)}</span>
            <span>읽는 데 {readingMinutes(post.content)}분</span>
          </p>
          <h1 className="post-title">{post.title}</h1>
          {post.excerpt && <p className="post-lead">{post.excerpt}</p>}
          {post.tags.length > 0 && <p className="post-head-tags">{post.tags.map((t) => `#${t}`).join("  ")}</p>}
        </header>
        <div className="post-body">
          <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
            {post.content}
          </Markdown>
        </div>
        {postLinks.length > 0 && (
          <section className="post-links">
            <h2>링크</h2>
            <ul>
              {postLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} target="_blank" rel="noreferrer">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
        {isAdmin && <PostAdmin post={post} categories={categories} />}
      </main>
    </>
  );
}
