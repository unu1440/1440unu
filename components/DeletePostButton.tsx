"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// 관리자 대시보드의 글 삭제 버튼 - 확인창을 거친 뒤 삭제 API 호출
export default function DeletePostButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    // 되돌릴 수 없는 작업이므로 삭제 전 확인
    if (!confirm("정말 삭제할까요? 되돌릴 수 없습니다.")) return;
    setLoading(true);
    await fetch(`/api/posts/${id}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button className="btn-link danger" onClick={handleDelete} disabled={loading} type="button">
      {loading ? "삭제 중..." : "삭제"}
    </button>
  );
}
