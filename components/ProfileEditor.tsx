"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ProfileData } from "@/lib/portfolio";
import { toJpeg } from "@/lib/image";

const PHOTO_SIZE = 512;

type TextKey = Exclude<keyof ProfileData, "photo">;

// 한 줄 입력칸: [필드, 라벨, 최대 길이, placeholder] - 한국어/영어 짝은 2열로 나란히 배치
const LINE_FIELDS: [TextKey, string, number, string][] = [
  ["name", "이름", 100, "홍길동"],
  ["nameEn", "이름 (English)", 100, "Gildong Hong"],
  ["slogan", "슬로건 (소개 위에 크게 표시)", 200, "로봇과 사람의 경계를 허문다"],
  ["sloganEn", "슬로건 (English)", 200, "Breaking down the boundary between robots and people"],
  ["tagline", "한 줄 소개", 200, "컴퓨터공학 학부생 · Physical AI"],
  ["taglineEn", "한 줄 소개 (English)", 200, "Undergraduate in Computer Engineering"],
  ["affiliation", "소속", 200, "○○대학교 ○○학과 (B.S.)"],
  ["affiliationEn", "소속 (English)", 200, "B.S. in ○○, ○○ University"],
  ["email", "이메일", 200, "name@example.com"],
  ["github", "GitHub 주소", 500, "https://github.com/..."],
  ["scholar", "Google Scholar 주소 (선택)", 500, "https://scholar.google.com/..."],
  ["cvUrl", "CV PDF 주소 (선택 — Google Drive 공유 링크 등)", 500, "https://"],
];

// 여러 줄 입력칸: [필드, 라벨, 줄 수, 최대 길이]
const AREA_FIELDS: [TextKey, string, number, number][] = [
  ["bio", "자기소개 (빈 줄로 문단 구분)", 6, 5000],
  ["bioEn", "자기소개 (English)", 6, 5000],
  ["interests", "관심 분야 (한 줄에 하나: 주제 — 설명)", 4, 3000],
  ["interestsEn", "관심 분야 (English)", 4, 3000],
];


// 프로필 편집 패널 - 홈 관리자 모드에서 '프로필 편집'을 누르면 본문 맨 위에 열림
export default function ProfileEditor({ profile, onClose }: { profile: ProfileData; onClose: () => void }) {
  const [photo, setPhoto] = useState<string | null>(profile.photo);
  const [values, setValues] = useState(profile);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function set(key: TextKey, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError("");
    try {
      setPhoto(await toJpeg(file, { maxSize: PHOTO_SIZE, square: true }));
      setMessage("");
    } catch {
      setError("이미지를 읽을 수 없습니다. JPG/PNG/WebP 파일인지 확인해 주세요.");
    }
    // 같은 파일을 다시 골라도 change 이벤트가 나도록 초기화
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setMessage("");

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, photo }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "저장에 실패했습니다.");
      return;
    }

    setMessage("저장했습니다.");
    router.refresh();
  }

  return (
    <div className="profile-editor editor-form">
      <div className="photo-field">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {photo ? <img className="photo-preview" src={photo} alt="프로필 사진 미리보기" /> : <div className="photo-preview photo-empty" />}
        <div className="photo-actions">
          <button className="btn-ghost" type="button" onClick={() => fileRef.current?.click()}>
            {photo ? "사진 변경" : "사진 등록"}
          </button>
          {photo && (
            <button className="btn-link danger" type="button" onClick={() => setPhoto(null)}>
              삭제
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => handleFile(e.target.files?.[0])} />
      </div>

      <div className="form-grid">
        {LINE_FIELDS.map(([key, label, max, placeholder]) => (
          <label key={key}>
            {label}
            <input value={values[key]} onChange={(e) => set(key, e.target.value)} maxLength={max} placeholder={placeholder} />
          </label>
        ))}
      </div>

      <div className="form-grid">
        {AREA_FIELDS.map(([key, label, rows, max]) => (
          <label key={key}>
            {label}
            <textarea className="plain" value={values[key]} onChange={(e) => set(key, e.target.value)} rows={rows} maxLength={max} />
          </label>
        ))}
      </div>


      {error && <p className="form-error">{error}</p>}
      {message && <p className="form-ok">{message}</p>}
      <div className="editor-actions">
        <button type="button" disabled={saving} onClick={handleSave}>
          {saving ? "저장 중..." : "프로필 저장"}
        </button>
        <button className="btn-ghost" type="button" onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  );
}
