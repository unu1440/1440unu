import { redirect, notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PostEditorForm from "@/components/PostEditorForm";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await requireAdmin())) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) {
    notFound();
  }

  return (
    <div className="admin-page">
      <h1>글 수정</h1>
      <PostEditorForm
        postId={post.id}
        initialTitle={post.title}
        initialExcerpt={post.excerpt ?? ""}
        initialContent={post.content}
        initialPublished={post.published}
      />
    </div>
  );
}
