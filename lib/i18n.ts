// 영어(/, 메인) · 한국어(/ko) 페이지에서 쓰는 화면 고정 문구
export type Lang = "ko" | "en";

export const LANG_HOME: Record<Lang, string> = { en: "/", ko: "/ko" };

export const UI = {
  ko: {
    about: "소개",
    interests: "관심 분야",
    navProjects: "프로젝트",
    navBackground: "학력과 경력",
    cvValue: "PDF 다운로드",
    cvPdf: "PDF로 보기",
    github: "GitHub 저장소 보기",
    projectLink: "프로젝트 링크 열기",
    close: "닫기",
  },
  en: {
    about: "About",
    interests: "Interests",
    navProjects: "Projects",
    navBackground: "Experience",
    cvValue: "Download PDF",
    cvPdf: "View as PDF",
    github: "View on GitHub",
    projectLink: "Open project link",
    close: "Close",
  },
} as const;

/** 영어 페이지면 영어 값을 (비어 있으면 한국어 값으로 대신), 한국어 페이지면 한국어 값을 돌려줌 */
export function pick(lang: Lang, ko: string, en: string | null | undefined) {
  return lang === "en" && en ? en : ko;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** 영어 페이지의 기간을 영문 CV 표기로 ("2024.03 – 2028.08 예정" → "Mar 2024 – Aug 2028 (expected)") */
export function periodText(lang: Lang, period: string) {
  if (lang === "ko") return period;
  return period
    .replace(/(\d{4})\.(\d{1,2})/g, (whole, y, m) => (MONTHS[Number(m) - 1] ? `${MONTHS[Number(m) - 1]} ${y}` : whole))
    .replace(/현재/g, "Present")
    .replace(/\s*예정/g, " (expected)");
}
