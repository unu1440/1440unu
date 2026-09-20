export const HISTORY_TYPES = ["career", "education"] as const;

export type HistoryInput = {
  type: (typeof HISTORY_TYPES)[number];
  title: string;
  org: string;
  period: string;
  sortDate: Date;
  description: string | null;
};

/** 경력/학력 요청 본문을 검증하고 DB에 넣을 형태로 변환 (실패 시 error 메시지 반환) */
export function parseHistoryBody(
  body: Record<string, unknown>
): { data: HistoryInput } | { error: string } {
  const { type, title, org, period, sortDate, description } = body;

  if (!HISTORY_TYPES.includes(type as HistoryInput["type"])) {
    return { error: "구분은 경력 또는 학력이어야 합니다." };
  }
  if (
    typeof title !== "string" || !title.trim() ||
    typeof org !== "string" || !org.trim() ||
    typeof period !== "string" || !period.trim()
  ) {
    return { error: "제목, 기관, 기간은 필수입니다." };
  }

  // 정렬용 날짜: "YYYY-MM"(월 입력) 또는 "YYYY-MM-DD" 형식만 허용
  if (typeof sortDate !== "string" || !/^\d{4}-\d{2}(-\d{2})?$/.test(sortDate)) {
    return { error: "정렬 기준 날짜가 올바르지 않습니다." };
  }
  const date = new Date(`${sortDate.length === 7 ? `${sortDate}-01` : sortDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    return { error: "정렬 기준 날짜가 올바르지 않습니다." };
  }

  return {
    data: {
      type: type as HistoryInput["type"],
      title: title.trim(),
      org: org.trim(),
      period: period.trim(),
      sortDate: date,
      description: typeof description === "string" && description.trim() ? description.trim() : null,
    },
  };
}
