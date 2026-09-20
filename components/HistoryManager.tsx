"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export type HistoryItem = {
  id: string;
  type: string;
  title: string;
  org: string;
  period: string;
  sortDate: string; // ISO 문자열 (서버 컴포넌트에서 직렬화해서 전달)
  description: string | null;
};

const TYPE_LABEL: Record<string, string> = { career: "경력", education: "학력" };

// 경력/학력 한 건을 추가·수정하는 폼 (entry가 있으면 수정, 없으면 추가)
// onDone: 저장 성공 시 호출, onCancel: 있으면 취소 버튼 표시(수정 중일 때만)
function HistoryForm({
  entry,
  onDone,
  onCancel,
}: {
  entry?: HistoryItem;
  onDone: () => void;
  onCancel?: () => void;
}) {
  const [type, setType] = useState(entry?.type ?? "career");
  const [title, setTitle] = useState(entry?.title ?? "");
  const [org, setOrg] = useState(entry?.org ?? "");
  const [period, setPeriod] = useState(entry?.period ?? "");
  const [sortMonth, setSortMonth] = useState(entry ? entry.sortDate.slice(0, 7) : "");
  const [description, setDescription] = useState(entry?.description ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch(entry ? `/api/history/${entry.id}` : "/api/history", {
      method: entry ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, title, org, period, sortDate: sortMonth, description }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "저장에 실패했습니다.");
      return;
    }

    router.refresh();
    onDone();
  }

  return (
    <form className="editor-form history-form" onSubmit={handleSubmit}>
      <label>
        구분
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="career">경력</option>
          <option value="education">학력</option>
        </select>
      </label>
      <label>
        제목 (직함 / 학위)
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </label>
      <label>
        기관 (회사 / 학교)
        <input value={org} onChange={(e) => setOrg(e.target.value)} required />
      </label>
      <label>
        표시할 기간 (예: 2022.03 – 현재)
        <input value={period} onChange={(e) => setPeriod(e.target.value)} required />
      </label>
      <label>
        정렬 기준 월 (시작한 달 — 최신순으로 정렬됩니다)
        <input type="month" value={sortMonth} onChange={(e) => setSortMonth(e.target.value)} required />
      </label>
      <label>
        설명 (선택)
        <textarea
          className="plain"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </label>
      {error && <p className="form-error">{error}</p>}
      <div className="editor-actions history-form-actions">
        <button type="submit" disabled={saving}>
          {saving ? "저장 중..." : entry ? "수정 저장" : "추가"}
        </button>
        {onCancel && (
          <button className="btn-ghost" type="button" onClick={onCancel}>
            취소
          </button>
        )}
      </div>
    </form>
  );
}

// 경력/학력 타임라인 관리 - 목록(수정/삭제) + 항상 열려 있는 추가 폼 (/about 관리자 모드에서 사용)
export default function HistoryManager({ entries }: { entries: HistoryItem[] }) {
  // 수정 중인 항목의 id (null이면 수정 중인 항목 없음)
  const [editing, setEditing] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  // 추가 폼 리셋용 - 저장에 성공하면 key를 바꿔 폼을 비운 채 다시 띄움
  const [addKey, setAddKey] = useState(0);
  const router = useRouter();

  async function handleDelete(id: string) {
    if (!confirm("정말 삭제할까요? 되돌릴 수 없습니다.")) return;
    setBusyId(id);
    await fetch(`/api/history/${id}`, { method: "DELETE" });
    setBusyId(null);
    router.refresh();
  }

  return (
    <div className="history-manager">
      <ul className="admin-post-list">
        {entries.length === 0 && <li className="empty">아직 등록한 학력/이력이 없습니다. 아래에서 추가해 보세요.</li>}
        {entries.map((entry) =>
          editing === entry.id ? (
            <li key={entry.id} className="history-editing">
              <HistoryForm entry={entry} onDone={() => setEditing(null)} onCancel={() => setEditing(null)} />
            </li>
          ) : (
            <li key={entry.id}>
              <span className="admin-post-title">
                {entry.title}
                <em className="draft-tag">
                  {" "}
                  {entry.org} · {entry.period} · {TYPE_LABEL[entry.type] ?? entry.type}
                </em>
              </span>
              <span className="admin-post-actions">
                <button className="btn-link" type="button" onClick={() => setEditing(entry.id)}>
                  수정
                </button>
                <button
                  className="btn-link danger"
                  type="button"
                  disabled={busyId === entry.id}
                  onClick={() => handleDelete(entry.id)}
                >
                  {busyId === entry.id ? "삭제 중..." : "삭제"}
                </button>
              </span>
            </li>
          )
        )}
      </ul>

      <h3 className="history-add-title">새로 추가</h3>
      <HistoryForm key={addKey} onDone={() => setAddKey((k) => k + 1)} />
    </div>
  );
}
