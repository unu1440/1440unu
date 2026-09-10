"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

type Props = {
  postId?: string;
  initialTitle?: string;
  initialExcerpt?: string;
  initialContent?: string;
  initialPublished?: boolean;
};

export default function PostEditorForm({
  postId,
  initialTitle = "",
  initialExcerpt = "",
  initialContent = "",
  initialPublished = true,
}: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [excerpt, setExcerpt] = useState(initialExcerpt);
  const [content, setContent] = useState(initialContent);
  const [published, setPublished] = useState(initialPublished);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch(postId ? `/api/posts/${postId}` : "/api/posts", {
      method: postId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, excerpt, content, published }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "저장에 실패했습니다.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form className="editor-form" onSubmit={handleSubmit}>
      <label>
        제목
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </label>
      <label>
        요약 (목록에 보일 한두 줄, 선택)
        <input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
      </label>
      <label>
        본문 (HTML 태그 사용 가능: &lt;p&gt;, &lt;strong&gt;, &lt;em&gt; 등)
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={16}
          required
        />
      </label>
      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
        />
        공개하기
      </label>
      {error && <p className="form-error">{error}</p>}
      <div className="editor-actions">
        <button type="submit" disabled={saving}>
          {saving ? "저장 중..." : "저장"}
        </button>
      </div>
    </form>
  );
}
