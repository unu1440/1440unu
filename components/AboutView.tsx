"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProfileEditorForm from "@/components/ProfileEditorForm";
import HistoryManager, { HistoryItem } from "@/components/HistoryManager";
import LogoutButton from "@/components/LogoutButton";

export type ProfileData = {
  photo: string | null;
  name: string;
  tagline: string;
  bio: string;
};

type Props = { profile: ProfileData; history: HistoryItem[] };

// 프로필 카드 레이아웃:
//   위 줄  [사진 + 그 밑에 이름] | [사진 옆: 학력/이력]
//   아래 줄 [한줄소개 + 자기소개 (카드 전체 폭)]
// isAdmin이면 같은 자리에서 입력칸으로 바뀜 (관리자 모드)
export function AboutLayout({
  profile,
  history,
  isAdmin,
  onLoggedOut,
}: Props & { isAdmin: boolean; onLoggedOut: () => void }) {
  // 사진 옆에 들어가는 학력/이력 (일반 방문자는 등록된 게 없으면 통째로 숨김)
  const historyBlock =
    isAdmin || history.length > 0 ? (
      <div className="history-block">
        {isAdmin ? (
          <HistoryManager entries={history} />
        ) : (
          <ol className="timeline">
            {history.map((h) => (
              <li key={h.id}>
                <span className="timeline-period">{h.period}</span>
                <div className="timeline-main">
                  <div className="timeline-head">{h.title}</div>
                  <div className="timeline-org">{h.org}</div>
                  {h.description && <p className="timeline-desc">{h.description}</p>}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    ) : null;

  return (
    <div className="about-wrap">
      {isAdmin && (
        <div className="admin-bar">
          <span>관리자 모드 · 여기서 바로 수정할 수 있습니다</span>
          <span className="admin-bar-actions">
            <Link className="btn btn-ghost" href="/admin">
              글 관리
            </Link>
            <LogoutButton redirectTo="/about" onLoggedOut={onLoggedOut} />
          </span>
        </div>
      )}

      <section className="about-card profile-card">
        {isAdmin ? (
          <ProfileEditorForm
            initialPhoto={profile.photo}
            initialName={profile.name}
            initialTagline={profile.tagline}
            initialBio={profile.bio}
          >
            {historyBlock}
          </ProfileEditorForm>
        ) : (
          <>
            <div className="profile-top profile-top-center">
              <div className="profile-photo-col">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {profile.photo ? <img className="profile-photo" src={profile.photo} alt={profile.name || "프로필 사진"} /> : <div className="profile-photo photo-empty" />}
                <h1>{profile.name || "1440unu"}</h1>
              </div>
              <div className="profile-main">{historyBlock}</div>
            </div>
            {(profile.tagline || profile.bio) && (
              <div className="profile-bottom">
                {profile.tagline && <p className="profile-tagline">{profile.tagline}</p>}
                {profile.bio && <p className="profile-bio">{profile.bio}</p>}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

// /about 화면 - 페이지 자체는 서버에서 캐시된 채로 내려오고,
// 관리자로 로그인돼 있으면 그 자리에서 바로 편집 UI로 바뀜
export default function AboutView({ profile, history }: Props) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/admin/session")
      .then((res) => res.json())
      .then((data) => setIsAdmin(Boolean(data.admin)))
      .catch(() => setIsAdmin(false));
  }, []);

  return (
    <AboutLayout
      profile={profile}
      history={history}
      isAdmin={isAdmin}
      onLoggedOut={() => setIsAdmin(false)}
    />
  );
}
