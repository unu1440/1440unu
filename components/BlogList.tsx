"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatPostDate } from "@/lib/post-utils";
import type { CategoryItem, PostItem } from "@/lib/posts";

// 글 목록 - 카테고리, 검색어, 해시태그로 걸러서 보여줌
export default function BlogList({ posts, categories }: { posts: PostItem[]; categories: CategoryItem[] }) {
  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("");

  const tags = useMemo(() => Array.from(new Set(posts.flatMap((p) => p.tags))), [posts]);

  const word = query.trim().toLowerCase();
  const shown = posts.filter(
    (p) =>
      (!category || p.categoryId === category) &&
      (!tag || p.tags.includes(tag)) &&
      (!word || `${p.title} ${p.excerpt ?? ""}`.toLowerCase().includes(word)),
  );

  return (
    <>
      <div className="post-filters">
        <select aria-label="카테고리" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">전체</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input aria-label="검색" placeholder="검색어" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      {tags.length > 0 && (
        <div className="post-tags">
          {tags.map((t) => (
            <button
              key={t}
              type="button"
              className={t === tag ? "post-tag on" : "post-tag"}
              aria-pressed={t === tag}
              onClick={() => setTag(t === tag ? "" : t)}
            >
              #{t}
            </button>
          ))}
        </div>
      )}

      <p className="post-count">총 {shown.length}개의 글</p>
      <ul className="post-list">
        {shown.map((post) => (
          <li key={post.id}>
            <Link className="post-item" href={`/blog/${post.slug}`}>
              <span className="post-text">
                {post.category && <span className="post-cat">{post.category}</span>}
                <span className="post-item-title">
                  {post.title}
                  {!post.published && <span className="dim"> 비공개</span>}
                </span>
                {post.excerpt && <span className="post-excerpt">{post.excerpt}</span>}
                <span className="post-date">{formatPostDate(post.createdAt)}</span>
              </span>
              {post.thumbnail && (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="post-thumb" src={post.thumbnail} alt="" />
              )}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
