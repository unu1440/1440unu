"use client";

import Link from "next/link";
import { LANG_HOME, Lang } from "@/lib/i18n";

export type NavItem = { href: string; label: string; external?: boolean };

// 상단 헤더 - 워드마크 + (홈에서는) 섹션 바로가기 + KO/EN 전환
export default function SiteHeader({
  nav = [],
  lang,
}: {
  nav?: NavItem[];
  lang?: Lang;
}) {
  return (
    <header className="site-header">
      <Link className="wordmark" href={lang ? LANG_HOME[lang] : "/"}>
        1440<span>unu.com</span>
      </Link>

      {lang && (
        <div className="lang-switch" role="group" aria-label="Language">
          {(["en", "ko"] as const).map((l, i) => (
            <span key={l}>
              {i > 0 && <span className="lang-sep"> / </span>}
              <Link
                href={LANG_HOME[l]}
                aria-current={l === lang ? "true" : undefined}
                lang={l}
                // 언어를 바꿔도 보고 있던 섹션 위치(#hash)는 유지
                onClick={(e) => {
                  if (l === lang || !window.location.hash) return;
                  e.preventDefault();
                  window.location.href = LANG_HOME[l] + window.location.hash;
                }}
              >
                {l === "en" ? "English" : "한국어"}
              </Link>
            </span>
          ))}
        </div>
      )}

      {nav.length > 0 && (
        <nav className="site-nav">
          {nav.map((item) =>
            item.external ? (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noreferrer"
              >
                {item.label}
              </a>
            ) : (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ),
          )}
        </nav>
      )}
    </header>
  );
}
