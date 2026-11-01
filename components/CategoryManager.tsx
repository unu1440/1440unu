"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { CategoryItem } from "@/lib/posts";

// 카테고리 추가·이름 변경·삭제 (관리자)
export default function CategoryManager({ categories, onClose }: { categories: CategoryItem[]; onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  async function send(url: string, method: string, body?: object) {
    setError("");
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    if (!res?.ok) {
      setError(data.error || "저장하지 못했습니다.");
      return false;
    }
    router.refresh();
    return true;
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (await send("/api/categories", "POST", { name })) setName("");
  }

  function handleRename(category: CategoryItem) {
    const next = window.prompt("새 이름", category.name);
    if (next && next !== category.name) send(`/api/categories/${category.id}`, "PUT", { name: next });
  }

  function handleDelete(category: CategoryItem) {
    if (window.confirm(`'${category.name}' 카테고리를 삭제할까요?`)) send(`/api/categories/${category.id}`, "DELETE");
  }

  return (
    <div className="cat-manager">
      <ul>
        {categories.map((category) => (
          <li key={category.id}>
            <span>{category.name}</span>
            <button className="btn-link" type="button" onClick={() => handleRename(category)}>
              이름 변경
            </button>
            <button className="btn-link danger" type="button" onClick={() => handleDelete(category)}>
              삭제
            </button>
          </li>
        ))}
      </ul>
      <form className="cat-add" onSubmit={handleAdd}>
        <input aria-label="새 카테고리 이름" placeholder="새 카테고리 이름" value={name} onChange={(e) => setName(e.target.value)} required />
        <button type="submit">추가</button>
        <button className="btn-ghost" type="button" onClick={onClose}>
          닫기
        </button>
      </form>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
