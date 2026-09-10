"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function CommentForm({ postId }: { postId: string }) {
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!content.trim()) {
      setError("내용을 입력해주세요.");
      return;
    }
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, author, content }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "댓글 등록에 실패했습니다.");
      return;
    }

    setAuthor("");
    setContent("");
    router.refresh();
  }

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="이름 (선택)"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        maxLength={40}
      />
      <textarea
        placeholder="댓글을 남겨주세요"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        maxLength={1000}
      />
      {error && <p className="form-error">{error}</p>}
      <button type="submit" disabled={submitting}>
        {submitting ? "등록 중..." : "댓글 남기기"}
      </button>
    </form>
  );
}
