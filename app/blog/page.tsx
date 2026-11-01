import type { Metadata } from "next";
import BlogList from "@/components/BlogList";
import PostAdmin from "@/components/PostAdmin";
import SiteHeader from "@/components/SiteHeader";
import { requireAdmin } from "@/lib/auth";
import { loadCategories, loadPosts } from "@/lib/posts";

export const metadata: Metadata = { title: "Blog - 1440unu.com" };
export const dynamic = "force-dynamic";

// 블로그 목록 (/blog) - 관리자에게는 비공개 글도 보임
export default async function BlogPage() {
  const isAdmin = await requireAdmin();
  const [posts, categories] = await Promise.all([loadPosts(isAdmin), loadCategories()]);

  return (
    <>
      <SiteHeader />
      <main className="blog">
        <h1 className="blog-title">Blog</h1>
        {isAdmin && <PostAdmin categories={categories} />}
        {posts.length > 0 ? <BlogList posts={posts} categories={categories} /> : <p className="empty">아직 글이 없습니다.</p>}
      </main>
    </>
  );
}
