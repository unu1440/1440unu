import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import PostEditorForm from "@/components/PostEditorForm";

// 새 글 작성 페이지 (/admin/new)
export default async function NewPostPage() {
  if (!(await requireAdmin())) {
    redirect("/admin/login");
  }

  return (
    <div className="admin-page">
      <h1>새 글 쓰기</h1>
      <PostEditorForm />
    </div>
  );
}
