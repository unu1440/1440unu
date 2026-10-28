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
  },
  en: {
    about: "About",
    interests: "Interests",
    navProjects: "Projects",
    navBackground: "Experience",
    cvValue: "Download PDF",
  },
} as const;

/** 영어 페이지면 영어 값을 (비어 있으면 한국어 값으로 대신), 한국어 페이지면 한국어 값을 돌려줌 */
export function pick(lang: Lang, ko: string, en: string | null | undefined) {
  return lang === "en" && en ? en : ko;
}

/** 기간 표기의 한국어 단어를 영어로 ("2024.03 – 현재" → "2024.03 – Present") */
export function periodText(lang: Lang, period: string) {
  if (lang === "ko") return period;
  return period.replace(/현재/g, "Present").replace(/예정/g, "expected");
}
