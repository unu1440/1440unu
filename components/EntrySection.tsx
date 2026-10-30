"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { EntryItem } from "@/lib/portfolio";
import { ENTRY_TYPES, Section, SectionKey } from "@/lib/history";
import { Lang, UI, pick, periodText } from "@/lib/i18n";
import { toJpeg } from "@/lib/image";

const THUMB_SIZE = 960;

function splitTags(tags: string | null) {
  return (tags ?? "").split(",").map((t) => t.trim()).filter(Boolean);
}

// 섹션 항목 하나를 추가·수정하는 폼 (entry가 있으면 수정, 없으면 추가)
function EntryForm({
  section,
  entry,
  onDone,
}: {
  section: Section;
  entry?: EntryItem;
  onDone: () => void;
}) {
  // 섹션에 종류가 여러 개면(학력+경력) 폼에서 고름
  const [type, setType] = useState<SectionKey>((entry?.type as SectionKey) ?? section.types[0]);
  const hints = ENTRY_TYPES[type];
  const [title, setTitle] = useState(entry?.title ?? "");
  const [titleEn, setTitleEn] = useState(entry?.titleEn ?? "");
  const [org, setOrg] = useState(entry?.org ?? "");
  const [orgEn, setOrgEn] = useState(entry?.orgEn ?? "");
  const [period, setPeriod] = useState(entry?.period ?? "");
  const [sortMonth, setSortMonth] = useState(entry ? entry.sortDate.slice(0, 7) : "");
  const [description, setDescription] = useState(entry?.description ?? "");
  const [descriptionEn, setDescriptionEn] = useState(entry?.descriptionEn ?? "");
  const [link, setLink] = useState(entry?.link ?? "");
  const [tags, setTags] = useState(entry?.tags ?? "");
  const [thumbnail, setThumbnail] = useState<string | null>(entry?.thumbnail ?? null);
  const thumbRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleThumbnail(file: File | undefined) {
    if (!file) return;
    setError("");
    try {
      setThumbnail(await toJpeg(file, { maxSize: THUMB_SIZE }));
    } catch {
      setError("이미지를 읽을 수 없습니다. JPG/PNG/WebP 파일인지 확인해 주세요.");
    }
    if (thumbRef.current) thumbRef.current.value = "";
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch(entry ? `/api/history/${entry.id}` : "/api/history", {
      method: entry ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        title,
        titleEn,
        org,
        orgEn,
        period,
        sortDate: sortMonth,
        description,
        descriptionEn,
        link,
        tags,
        thumbnail: type === "project" ? thumbnail : null,
      }),
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
    <form className="editor-form entry-form" onSubmit={handleSubmit}>
      {section.types.length > 1 && (
        <label>
          구분 (화면에는 구분 없이 최신순으로 함께 표시)
          <select value={type} onChange={(e) => setType(e.target.value as SectionKey)}>
            {section.types.map((t) => (
              <option key={t} value={t}>
                {ENTRY_TYPES[t].name}
              </option>
            ))}
          </select>
        </label>
      )}
      <div className="form-row">
        <label>
          {hints.titleHint}
          <input value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
        </label>
        <label>
          {hints.titleHint} (English)
          <input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} />
        </label>
      </div>
      {hints.orgHint && (
        <div className="form-row">
          <label>
            {hints.orgHint}
            <input value={org} onChange={(e) => setOrg(e.target.value)} />
          </label>
          <label>
            {hints.orgHint} (English)
            <input value={orgEn} onChange={(e) => setOrgEn(e.target.value)} />
          </label>
        </div>
      )}
      <div className="form-row">
        <label>
          표시할 기간 (예: 2025.03 – 현재 · 영어 페이지에선 Present)
          <input value={period} onChange={(e) => setPeriod(e.target.value)} required />
        </label>
        <label>
          정렬 기준 월 (최신순 정렬)
          <input type="month" value={sortMonth} onChange={(e) => setSortMonth(e.target.value)} required />
        </label>
      </div>
      <div className="form-row">
        <label>
          설명 (선택, 줄바꿈 유지)
          <textarea className="plain" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </label>
        <label>
          설명 (English)
          <textarea className="plain" value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} rows={3} />
        </label>
      </div>
      <div className="form-row">
        <label>
          {type === "project" ? "GitHub 주소 (팝업 맨 아래 버튼)" : "링크 (선택, GitHub·데모 등)"}
          <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://" />
        </label>
        {type === "project" && (
          <label>
            태그 (쉼표로 구분)
            <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="PyTorch, ROS 2" />
          </label>
        )}
      </div>
      {type === "project" && (
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
      )}
      {error && <p className="form-error">{error}</p>}
      <div className="editor-actions">
        <button type="submit" disabled={saving}>
          {saving ? "저장 중..." : entry ? "수정 저장" : "추가"}
        </button>
        <button className="btn-ghost" type="button" onClick={onDone}>
          취소
        </button>
      </div>
    </form>
  );
}

// 학력·경력 타임라인에서 기간 옆에 붙는 구분
const KIND_LABEL = {
  education: { ko: "학력", en: "Education" },
  experience: { ko: "경력", en: "Work" },
} as const;

// 항목 하나의 공개 화면 - 섹션 종류마다 모양이 다름
function EntryBody({ lang, type, entry, onOpen }: { lang: Lang; type: string; entry: EntryItem; onOpen?: () => void }) {
  const tags = splitTags(entry.tags);
  const org = pick(lang, entry.org, entry.orgEn);
  const description = entry.description ? pick(lang, entry.description, entry.descriptionEn) : null;
  const period = periodText(lang, entry.period);
  const title = entry.link ? (
    <a className="entry-link" href={entry.link} target="_blank" rel="noreferrer">
      {pick(lang, entry.title, entry.titleEn)}
    </a>
  ) : (
    pick(lang, entry.title, entry.titleEn)
  );

  // 자격: 한 줄짜리 [날짜] 이름, 발급 기관 (CV 표기)
  if (type === "certification") {
    return (
      <div className={period ? "line-item" : "line-item no-date"}>
        {period && <time className="meta">{period}</time>}
        <span>
          {title}
          {org && <span className="dim">, {org}</span>}
          {description && <span className="line-desc">{description}</span>}
        </span>
      </div>
    );
  }

  // 프로젝트: 작은 썸네일 + 제목·기간·한 줄 요약 (누르면 팝업으로 자세히)
  if (type === "project") {
    return (
      <button className="project" type="button" onClick={onOpen}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {entry.thumbnail ? <img className="project-thumb" src={entry.thumbnail} alt="" /> : <span className="project-thumb photo-empty" aria-hidden />}
        <span className="project-text">
          <span className="project-head">
            <span className="project-title">{pick(lang, entry.title, entry.titleEn)}</span>
            <span className="meta">{period}</span>
          </span>
          {org && <span className="project-sub">{org}</span>}
        </span>
      </button>
    );
  }

  // 학력/경력: 세로 타임라인의 한 칸 (점·선은 CSS) - 기간 옆에 학력/경력 구분, 아래에 제목·기관
  return (
    <div className="tl-item">
      <p className="tl-meta">
        <span className="meta">{period}</span>
        {type in KIND_LABEL && <span className="tl-kind">{KIND_LABEL[type as keyof typeof KIND_LABEL][lang]}</span>}
      </p>
      <h3>{title}</h3>
      {org && <p className="dim">{org}</p>}
      {description && <p className="desc">{description}</p>}
      {tags.length > 0 && <p className="tags">{tags.join(", ")}</p>}
    </div>
  );
}

// 프로젝트 팝업 - 큰 썸네일, 요약·설명, 쓴 기술, 맨 아래 GitHub 링크 (브라우저 기본 <dialog>라 Esc로도 닫힘)
function ProjectDialog({ lang, entry, onClose }: { lang: Lang; entry: EntryItem; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const ui = UI[lang];
  const org = pick(lang, entry.org, entry.orgEn);
  const description = entry.description ? pick(lang, entry.description, entry.descriptionEn) : null;
  const tags = splitTags(entry.tags);
  const isGithub = entry.link ? /^https?:\/\/(www\.)?github\.com\//.test(entry.link) : false;

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      className="project-dialog"
      onClose={onClose}
      // 바깥(어두운 배경)을 누르면 닫힘
      onClick={(e) => {
        if (e.target === ref.current) ref.current.close();
      }}
    >
      <div className="dialog-body">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {entry.thumbnail && <img className="dialog-image" src={entry.thumbnail} alt="" />}
        <div className="project-head">
          <h3>{pick(lang, entry.title, entry.titleEn)}</h3>
          <span className="meta">{periodText(lang, entry.period)}</span>
        </div>
        {org && <p className="project-sub">{org}</p>}
        {description && <p className="desc">{description}</p>}
        {tags.length > 0 && <p className="tags">{tags.join(", ")}</p>}
        <div className="dialog-actions">
          {entry.link && (
            <a className="btn" href={entry.link} target="_blank" rel="noreferrer">
              {isGithub ? ui.github : ui.projectLink}
            </a>
          )}
          <button className="btn-ghost" type="button" onClick={() => ref.current?.close()}>
            {ui.close}
          </button>
        </div>
      </div>
    </dialog>
  );
}

type Props = { lang: Lang; section: Section; items: EntryItem[]; isAdmin: boolean };

// 포트폴리오의 섹션 하나 (Projects, Education & Experience, Certifications) - 관리자면 추가/수정/삭제 UI가 붙음
export default function EntrySection({ lang, section, items, isAdmin }: Props) {
  // 수정 중인 항목 id, 또는 "new"(추가 폼), null(편집 안 함)
  const [editing, setEditing] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  // 팝업으로 열어 둔 프로젝트 id
  const [openId, setOpenId] = useState<string | null>(null);
  const opened = items.find((e) => e.id === openId);
  const router = useRouter();

  async function handleDelete(id: string) {
    if (!confirm("정말 삭제할까요? 되돌릴 수 없습니다.")) return;
    setBusyId(id);
    await fetch(`/api/history/${id}`, { method: "DELETE" });
    setBusyId(null);
    router.refresh();
  }

  const listClass = section.key === "project" ? "projects" : section.key === "certification" ? "lines" : "timeline";

  return (
    <section className="block" id={section.key}>
      <h2 className="block-title">
        {lang === "en" ? section.label : section.labelKo}
        {isAdmin && editing !== "new" && (
          <button className="btn-link add-link" type="button" onClick={() => setEditing("new")}>
            + 추가
          </button>
        )}
      </h2>

      {editing === "new" && <EntryForm section={section} onDone={() => setEditing(null)} />}

      {items.length === 0 && editing !== "new" && <p className="empty">아직 항목이 없습니다. ‘+ 추가’로 넣어 보세요.</p>}

      {items.length > 0 && (
        <ul className={listClass}>
          {items.map((entry) => (
            <li key={entry.id}>
              {editing === entry.id ? (
                <EntryForm section={section} entry={entry} onDone={() => setEditing(null)} />
              ) : (
                <>
                  <EntryBody lang={lang} type={entry.type} entry={entry} onOpen={() => setOpenId(entry.id)} />
                  {isAdmin && (
                    <span className="item-actions">
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
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {opened && <ProjectDialog lang={lang} entry={opened} onClose={() => setOpenId(null)} />}
    </section>
  );
}
