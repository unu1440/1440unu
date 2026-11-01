// 화면과 서버가 함께 쓰는 블로그 값 (DB 코드를 부르지 않음)
export function formatPostDate(iso: string) {
  return iso.slice(0, 10).replace(/-/g, ".");
}

export type PostLink = { label: string; href: string };

/** "이름 | 주소" 줄들을 링크 목록으로 - http(s) 주소만, 이름이 없으면 주소를 표시 */
export function parsePostLinks(text: string | null): PostLink[] {
  return (text ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      const at = line.lastIndexOf("|");
      const href = (at < 0 ? line : line.slice(at + 1)).trim();
      const label = at < 0 ? href : line.slice(0, at).trim();
      return /^https?:\/\//i.test(href) ? [{ label: label || href, href }] : [];
    });
}

/** 읽는 시간 (분) - 1분에 500자 기준 */
export function readingMinutes(content: string) {
  return Math.max(1, Math.round(content.length / 500));
}
