// 화면과 서버가 함께 쓰는 블로그 값 (DB 코드를 부르지 않음)
export function formatPostDate(iso: string) {
  return iso.slice(0, 10).replace(/-/g, ".");
}

/** 읽는 시간 (분) - 1분에 500자 기준 */
export function readingMinutes(content: string) {
  return Math.max(1, Math.round(content.length / 500));
}
