"use client";

import { useEffect, useState } from "react";
import SiteHeader, { NavItem } from "@/components/SiteHeader";
import LogoutButton from "@/components/LogoutButton";
import ProfileEditor from "@/components/ProfileEditor";
import EntrySection from "@/components/EntrySection";
import { SECTIONS, Section } from "@/lib/history";
import { Lang, LANG_HOME, UI, pick } from "@/lib/i18n";
import type { EntryItem, ProfileData } from "@/lib/portfolio";

type Props = { lang: Lang; profile: ProfileData; entries: EntryItem[] };

/** "주제 — 설명" 형식의 줄들을 [{ title, desc }]로 (구분자: —, –, " - ", |) */
function parseInterests(text: string) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const m = line.match(/^(.*?)\s*(?:—|–|\s-\s|\|)\s*(.*)$/);
      return m ? { title: m[1], desc: m[2] } : { title: line, desc: "" };
    });
}

// 홈 화면 (한국어 / 영어 공용) - 페이지 자체는 서버에서 캐시된 채로 내려오고,
// 관리자로 로그인돼 있으면 그 자리에서 바로 편집 UI가 덧붙음
export default function PortfolioView({ lang, profile, entries }: Props) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const ui = UI[lang];

  useEffect(() => {
    fetch("/api/admin/session")
      .then((res) => res.json())
      .then((data) => setIsAdmin(Boolean(data.admin)))
      .catch(() => setIsAdmin(false));
  }, []);

  // 루트 레이아웃은 lang="en" 고정이라 한국어 페이지에서는 여기서 바꿔 줌 (스크린리더·번역기용)
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const name = pick(lang, profile.name, profile.nameEn) || "1440unu";
  // 영어 페이지에서는 영어 이름이 제목이 되므로 아래 줄에는 한국어 이름을 보여줌
  const subName = lang === "en" ? (profile.nameEn ? profile.name : "") : profile.nameEn;
  const slogan = pick(lang, profile.slogan, profile.sloganEn);
  const bio = pick(lang, profile.bio, profile.bioEn);
  const interests = parseInterests(pick(lang, profile.interests, profile.interestsEn));

  // 섹션별 항목 (entries는 이미 최신순) - 방문자에게는 항목이 있는 섹션만, 관리자에게는 빈 섹션도 (추가할 수 있도록) 보여줌
  const sectionItems = (key: Section["key"]) => {
    const section = SECTIONS.find((s) => s.key === key)!;
    const items = entries.filter((e) => (section.types as readonly string[]).includes(e.type));
    return { section, items, visible: isAdmin || items.length > 0 };
  };
  const projects = sectionItems("project");
  const background = sectionItems("background");
  const certifications = sectionItems("certification");

  const nav: NavItem[] = [
    { href: "#about", label: ui.about },
    ...(projects.visible ? [{ href: "#project", label: ui.navProjects }] : []),
    ...(background.visible ? [{ href: "#background", label: ui.navBackground }] : []),
    ...(profile.cvUrl ? [{ href: profile.cvUrl, label: "CV", external: true }] : []),
  ];

  const links = [
    profile.email && { href: `mailto:${profile.email}`, value: profile.email },
    profile.github && { href: profile.github, value: profile.github.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "") },
    profile.scholar && { href: profile.scholar, value: "Google Scholar" },
    profile.cvUrl && { href: profile.cvUrl, value: ui.cvValue },
  ].filter(Boolean) as { href: string; value: string }[];

  return (
    <>
      <SiteHeader nav={nav} lang={lang} />

      {isAdmin && (
        <div className="admin-bar">
          <span>관리자 모드 · 각 섹션에서 바로 추가/수정할 수 있습니다 (영어 칸은 메인 /, 한국어 칸은 /ko 페이지에 표시)</span>
          <span className="admin-bar-actions">
            <button className="btn-ghost" type="button" onClick={() => setEditingProfile((v) => !v)}>
              {editingProfile ? "프로필 편집 닫기" : "프로필 편집"}
            </button>
            <LogoutButton
              redirectTo={LANG_HOME[lang]}
              onLoggedOut={() => {
                setIsAdmin(false);
                setEditingProfile(false);
              }}
            />
          </span>
        </div>
      )}

      <div className="portfolio">
        <aside className="side">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {profile.photo ? <img className="side-photo" src={profile.photo} alt={name} /> : <div className="side-photo photo-empty" aria-hidden />}
          <h1 className="side-name">{name}</h1>
          {subName && <p className="side-name-en">{subName}</p>}
          {profile.tagline && <p className="side-tagline">{pick(lang, profile.tagline, profile.taglineEn)}</p>}
          {profile.affiliation && <p className="side-affil">{pick(lang, profile.affiliation, profile.affiliationEn)}</p>}
          {links.length > 0 && (
            <ul className="side-links">
              {links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} target={link.href.startsWith("mailto:") ? undefined : "_blank"} rel="noreferrer">
                    {link.value}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <div className="content">
          {isAdmin && editingProfile && <ProfileEditor profile={profile} onClose={() => setEditingProfile(false)} />}

          {slogan && <p className="slogan">{slogan}</p>}

          <section className="block" id="about">
            <h2 className="block-title">{ui.about}</h2>
            {bio ? (
              <div className="bio">
                {bio.split(/\n{2,}/).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            ) : (
              <p className="empty">{isAdmin ? "상단 ‘프로필 편집’에서 자기소개를 입력하세요." : ""}</p>
            )}
          </section>

          {projects.visible && (
            <EntrySection lang={lang} section={projects.section} items={projects.items} isAdmin={isAdmin} />
          )}

          {(interests.length > 0 || isAdmin) && (
            <section className="block" id="interests">
              <h2 className="block-title">{ui.interests}</h2>
              {interests.length > 0 ? (
                <ul className="interests">
                  {interests.map((item, i) => (
                    <li key={i}>
                      <strong>{item.title}</strong>
                      {item.desc && <span className="dim"> {item.desc}</span>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty">‘프로필 편집’에서 한 줄에 하나씩 “주제 — 설명” 형식으로 입력하세요.</p>
              )}
            </section>
          )}

          {background.visible && (
            <EntrySection lang={lang} section={background.section} items={background.items} isAdmin={isAdmin} />
          )}

          {certifications.visible && (
            <EntrySection
              lang={lang}
              section={certifications.section}
              items={certifications.items}
             
              isAdmin={isAdmin}
            />
          )}
        </div>
      </div>
    </>
  );
}
