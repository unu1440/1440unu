import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";
import DeletePostButton from "@/components/DeletePostButton";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  if (!(await requireAdmin())) {
    redirect("/admin/login");
  }

  const posts = await prisma.post.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="admin-page">
      <div className="admin-header-row">
        <h1>글 관리</h1>
        <div className="admin-actions">
          <Link className="btn" href="/admin/new">
            새 글 쓰기
          </Link>
          <LogoutButton />
        </div>
      </div>

      <ul className="admin-post-list">
        {posts.length === 0 && <li className="empty">아직 쓴 글이 없습니다.</li>}
        {posts.map((post) => (
          <li key={post.id}>
            <span className="admin-post-title">
              {post.title} {!post.published && <em className="draft-tag">(비공개)</em>}
            </span>
            <span className="admin-post-actions">
              <Link href={`/admin/edit/${post.id}`}>수정</Link>
              <DeletePostButton id={post.id} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
