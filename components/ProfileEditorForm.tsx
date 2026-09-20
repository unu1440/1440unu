"use client";

import { useRef, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";

type Props = {
  initialPhoto: string | null;
  initialName: string;
  initialTagline: string;
  initialBio: string;
  // 사진 옆에 들어갈 내용 (학력/이력 관리 UI)
  children?: ReactNode;
};

const PHOTO_SIZE = 512;

// 업로드한 사진을 가운데 기준 정사각형으로 잘라 512px JPEG data URL로 변환
// (원본 그대로 DB에 넣으면 용량이 커지고 Vercel 요청 크기 제한에도 걸림)
async function toSquareJpeg(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const out = Math.min(PHOTO_SIZE, side);

  const canvas = document.createElement("canvas");
  canvas.width = out;
  canvas.height = out;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");

  ctx.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    out,
    out
  );
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.85);
}

// 프로필 카드 편집 UI (위 줄: 사진+이름 | children(학력/이력) / 아래 줄: 한줄소개 · 자기소개) - /about 관리자 모드에서 사용.
// children에 들어가는 학력/이력 UI가 자체 <form>을 가지므로 여기서는 <form>을 쓰지 않고 저장 버튼 클릭으로 처리
export default function ProfileEditorForm({
  initialPhoto,
  initialName,
  initialTagline,
  initialBio,
  children,
}: Props) {
  const [photo, setPhoto] = useState<string | null>(initialPhoto);
  const [name, setName] = useState(initialName);
  const [tagline, setTagline] = useState(initialTagline);
  const [bio, setBio] = useState(initialBio);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError("");
    try {
      setPhoto(await toSquareJpeg(file));
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
      body: JSON.stringify({ photo, name, tagline, bio }),
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
    <>
      {/* 위 줄: [사진 + 그 밑에 이름] | [사진 옆: 학력/이력(children)] */}
      <div className="profile-top">
        <div className="profile-photo-col photo-field editor-form">
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
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <label>
            이름
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
          </label>
        </div>

        <div className="profile-main">{children}</div>
      </div>

      {/* 아래 줄: 카드 전체 폭 - 한줄소개 · 자기소개 · 저장 */}
      <div className="profile-bottom editor-form">
        <label>
          한줄소개
          <input value={tagline} onChange={(e) => setTagline(e.target.value)} maxLength={200} />
        </label>
        <label>
          자기소개 (줄바꿈이 그대로 보입니다)
          <textarea
            className="plain"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={5}
            maxLength={5000}
          />
        </label>

        {error && <p className="form-error">{error}</p>}
        {message && <p className="form-ok">{message}</p>}
        <div className="editor-actions">
          <button type="button" disabled={saving} onClick={handleSave}>
            {saving ? "저장 중..." : "프로필 저장"}
          </button>
        </div>
      </div>
    </>
  );
}
