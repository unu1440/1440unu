import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";
import DeletePostButton from "@/components/DeletePostButton";

// 매 요청마다 새로 렌더링 (관리자 데이터는 캐시하지 않음)
export const dynamic = "force-dynamic";

// 관리자 대시보드 (/admin) - 전체 글 목록과 공개/비공개 상태, 수정/삭제 액션 제공
export default async function AdminDashboard() {
  // 로그인하지 않았으면 로그인 페이지로 이동
  if (!(await requireAdmin())) {
    redirect("/admin/login");
  }

  // 공개 여부와 상관없이 전체 글을 최신순으로 조회
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
