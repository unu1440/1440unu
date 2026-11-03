"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPostDate } from "@/lib/post-utils";
import type { CommentItem } from "@/lib/comments";

// 글 아래 댓글 - 목록과 쓰기 폼, 관리자에게는 삭제 버튼
// website 칸은 사람에게 안 보이는 허니팟, token은 폼을 연 시각(서버 서명)
export default function Comments({ postId, comments, token, isAdmin }: { postId: string; comments: CommentItem[]; token: string; isAdmin: boolean }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError("");
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ postId, name, content, website, token }),
    });
    const data = await res.json().catch(() => ({}));
    setSending(false);
    if (!res.ok) {
      setError(data.error || "댓글을 남기지 못했습니다.");
      return;
    }
    setContent("");
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!window.confirm("이 댓글을 삭제할까요?")) return;
    const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
    if (!res.ok) {
      window.alert("삭제하지 못했습니다.");
      return;
    }
    router.refresh();
  }

  return (
    <section className="comments">
      <h2>댓글 {comments.length > 0 && comments.length}</h2>
      {comments.length > 0 && (
        <ul className="comment-list">
          {comments.map((c) => (
            <li key={c.id}>
              <p className="comment-meta">
                <strong>{c.name}</strong>
                <span>{formatPostDate(c.createdAt)}</span>
                {isAdmin && (
                  <button className="btn-link danger" type="button" onClick={() => handleDelete(c.id)}>
                    삭제
                  </button>
                )}
              </p>
              <p className="comment-text">{c.content}</p>
            </li>
          ))}
        </ul>
      )}
      <form className="comment-form" onSubmit={handleSubmit}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="닉네임" maxLength={20} required />
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="댓글을 남겨 주세요" maxLength={1000} rows={4} required />
        <div className="comment-trap" aria-hidden="true">
          <input value={website} onChange={(e) => setWebsite(e.target.value)} name="website" tabIndex={-1} autoComplete="off" />
        </div>
        <div className="comment-form-foot">
          <span>{content.length} / 1,000</span>
          <button className="btn-ghost" type="submit" disabled={sending}>
            {sending ? "보내는 중" : "댓글 남기기"}
          </button>
        </div>
        {error && <p className="form-error">{error}</p>}
      </form>
    </section>
  );
}
