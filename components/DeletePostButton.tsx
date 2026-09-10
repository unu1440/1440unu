"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeletePostButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
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
