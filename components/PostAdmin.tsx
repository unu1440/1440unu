"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import CategoryManager from "@/components/CategoryManager";
import type { CategoryItem, PostItem } from "@/lib/posts";

// 편집기는 Markdown 패키지가 커서 관리자가 열 때만 불러옴
const PostEditor = dynamic(() => import("@/components/PostEditor"));

// 관리자 버튼 - 목록에서는 글쓰기·카테고리 관리, 글 페이지에서는 수정·삭제
export default function PostAdmin({ post, categories }: { post?: PostItem; categories: CategoryItem[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [managing, setManaging] = useState(false);

  async function handleDelete() {
    if (!post || !window.confirm("이 글을 삭제할까요? 되돌릴 수 없습니다.")) return;
    const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
    if (!res.ok) {
      window.alert("삭제하지 못했습니다.");
      return;
    }
    router.push("/blog");
    router.refresh();
  }

  if (editing) return <PostEditor post={post} categories={categories} onClose={() => setEditing(false)} />;
  if (managing) return <CategoryManager categories={categories} onClose={() => setManaging(false)} />;

  return (
    <div className="post-admin">
      <button className="btn-ghost" type="button" onClick={() => setEditing(true)}>
        {post ? "수정" : "글쓰기"}
      </button>
      {post ? (
        <button className="btn-link danger" type="button" onClick={handleDelete}>
          삭제
        </button>
      ) : (
        <button className="btn-ghost" type="button" onClick={() => setManaging(true)}>
          카테고리 관리
        </button>
      )}
    </div>
  );
}
