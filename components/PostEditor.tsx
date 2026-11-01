"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { toJpeg } from "@/lib/image";
import type { CategoryItem, PostItem } from "@/lib/posts";

// 버튼 하나 = 선택한 글자 앞뒤에 넣을 문자
const TOOLS = [
  { label: "제목", before: "## ", after: "" },
  { label: "굵게", before: "**", after: "**" },
  { label: "기울임", before: "*", after: "*" },
  { label: "인용", before: "> ", after: "" },
  { label: "목록", before: "- ", after: "" },
  { label: "번호", before: "1. ", after: "" },
  { label: "링크", before: "[", after: "](https://)" },
  { label: "사진", before: "![설명](", after: ")" },
  { label: "코드", before: "`", after: "`" },
  { label: "코드 블록", before: "```\n", after: "\n```" },
  { label: "표", before: "| 제목 | 제목 |\n|---|---|\n| 내용 | 내용 |\n", after: "" },
];

type Draft = { title: string; excerpt: string; categoryId: string; tags: string; content: string; links: string };

function readDraft(key: string): Draft | null {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "null");
  } catch {
    return null;
  }
}

// 글 작성·수정 양식 - post가 있으면 수정, 없으면 새 글. 쓰는 동안 브라우저에 임시저장
export default function PostEditor({ post, categories, onClose }: { post?: PostItem; categories: CategoryItem[]; onClose: () => void }) {
  const router = useRouter();
  const draftKey = post ? `post-draft-${post.id}` : "post-draft-new";
  const [draft] = useState(() => readDraft(draftKey));
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const thumbRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(draft?.title ?? post?.title ?? "");
  const [excerpt, setExcerpt] = useState(draft?.excerpt ?? post?.excerpt ?? "");
  const [categoryId, setCategoryId] = useState(draft?.categoryId ?? post?.categoryId ?? categories[0]?.id ?? "");
  const [tags, setTags] = useState(draft?.tags ?? post?.tags.join(", ") ?? "");
  const [links, setLinks] = useState(draft?.links ?? post?.links ?? "");
  const [content, setContent] = useState(draft?.content ?? post?.content ?? "");
  const [thumbnail, setThumbnail] = useState(post?.thumbnail ?? null);
  const [published, setPublished] = useState(post?.published ?? true);
  const [restored, setRestored] = useState(Boolean(draft));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(draftKey, JSON.stringify({ title, excerpt, categoryId, tags, content, links }));
      } catch {
        // 저장 공간을 못 쓰는 브라우저에서는 임시저장 없이 진행
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [draftKey, title, excerpt, categoryId, tags, content, links]);

  function clearDraft() {
    try {
      localStorage.removeItem(draftKey);
    } catch {
      // 지울 것이 없으면 그대로 둠
    }
  }

  function applyTool(tool: (typeof TOOLS)[number]) {
    const area = bodyRef.current;
    if (!area) return;
    const { selectionStart: start, selectionEnd: end, value } = area;
    setContent(value.slice(0, start) + tool.before + value.slice(start, end) + tool.after + value.slice(end));
    requestAnimationFrame(() => {
      area.focus();
      area.selectionStart = start + tool.before.length;
      area.selectionEnd = end + tool.before.length;
    });
  }

  async function handleThumbnail(file?: File) {
    if (file) setThumbnail(await toJpeg(file, { maxSize: 800 }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch(post ? `/api/posts/${post.id}` : "/api/posts", {
      method: post ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, excerpt, categoryId, tags, thumbnail, content, links, published }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setSaving(false);
    if (!res?.ok) {
      setError(data.error || "저장하지 못했습니다.");
      return;
    }
    clearDraft();
    if (post) {
      onClose();
      router.refresh();
    } else {
      router.push(`/blog/${data.post.slug}`);
    }
  }

  return (
    <form className="editor-form entry-form post-editor" onSubmit={handleSubmit}>
      {restored && (
        <p className="form-ok">
          임시저장된 내용을 불러왔습니다.{" "}
          <button
            className="btn-link"
            type="button"
            onClick={() => {
              clearDraft();
              setTitle(post?.title ?? "");
              setExcerpt(post?.excerpt ?? "");
              setTags(post?.tags.join(", ") ?? "");
              setLinks(post?.links ?? "");
              setContent(post?.content ?? "");
              setRestored(false);
            }}
          >
            버리기
          </button>
        </p>
      )}
      <label>
        제목
        <input value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
      </label>
      <label>
        요약 (목록에 한 줄로 표시)
        <input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
      </label>
      <div className="form-row">
        <label>
          카테고리
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          해시태그 (쉼표로 구분)
          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Robotics, 회고" />
        </label>
      </div>
      <div className="photo-field">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {thumbnail ? <img className="thumb-preview" src={thumbnail} alt="썸네일 미리보기" /> : <div className="thumb-preview photo-empty" />}
        <div className="photo-actions">
          <button className="btn-ghost" type="button" onClick={() => thumbRef.current?.click()}>
            {thumbnail ? "썸네일 변경" : "썸네일 등록"}
          </button>
          {thumbnail && (
            <button className="btn-link danger" type="button" onClick={() => setThumbnail(null)}>
              삭제
            </button>
          )}
        </div>
        <input ref={thumbRef} type="file" accept="image/*" hidden onChange={(e) => handleThumbnail(e.target.files?.[0])} />
      </div>

      <div className="post-tools" role="toolbar" aria-label="글 서식">
        {TOOLS.map((tool) => (
          <button key={tool.label} className="btn-ghost" type="button" onClick={() => applyTool(tool)}>
            {tool.label}
          </button>
        ))}
      </div>
      <div className="post-write">
        <textarea
          ref={bodyRef}
          className="plain"
          aria-label="본문"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <div className="post-body post-preview" aria-label="미리보기">
          <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
            {content}
          </Markdown>
        </div>
      </div>

      <label>
        링크 (한 줄에 하나: 이름 | 주소)
        <textarea
          className="plain"
          rows={3}
          value={links}
          onChange={(e) => setLinks(e.target.value)}
          placeholder="GitHub 저장소 | https://github.com/..."
        />
      </label>
      <label className="post-check">
        <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
        공개
      </label>
      {error && <p className="form-error">{error}</p>}
      <div className="editor-actions">
        <button type="submit" disabled={saving}>
          {saving ? "저장 중..." : post ? "수정 저장" : "올리기"}
        </button>
        <button className="btn-ghost" type="button" onClick={onClose}>
          닫기
        </button>
      </div>
    </form>
  );
}
