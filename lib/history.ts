// 항목 종류 (HistoryEntry.type에 들어가는 값) - titleHint / orgHint: 관리자 입력 폼에서 보여줄 라벨
export const ENTRY_TYPES = {
  project: { name: "프로젝트", titleHint: "프로젝트명", orgHint: "한 줄 요약" },
  education: { name: "학력", titleHint: "학위 · 전공", orgHint: "학교" },
  experience: { name: "경력", titleHint: "역할", orgHint: "기관 · 회사" },
  certification: { name: "자격", titleHint: "자격증 이름", orgHint: "발급 기관" },
} as const;

export type SectionKey = keyof typeof ENTRY_TYPES;

// 화면에 보이는 섹션 - 한 섹션에 여러 종류를 묶을 수 있음 (학력+경력은 한 타임라인에 최신순)
// label: 영어 페이지 제목 / labelKo: 한국어 페이지 제목
export const SECTIONS = [
  { key: "project", label: "Projects", labelKo: "프로젝트", types: ["project"] },
  { key: "background", label: "Education & Experience", labelKo: "학력과 경력", types: ["education", "experience"] },
  { key: "certification", label: "Certifications", labelKo: "자격", types: ["certification"] },
] as const satisfies readonly { key: string; label: string; labelKo: string; types: readonly SectionKey[] }[];

export type Section = (typeof SECTIONS)[number];

export const HISTORY_TYPES = Object.keys(ENTRY_TYPES) as SectionKey[];

export type HistoryInput = {
  type: SectionKey;
  title: string;
  titleEn: string | null;
  org: string;
  orgEn: string | null;
  period: string;
  sortDate: Date;
  description: string | null;
  descriptionEn: string | null;
  link: string | null;
  tags: string | null;
  thumbnail: string | null;
  images?: string[];
};

// 프로젝트 팝업 사진 제한 - Vercel 요청 본문 한도(4.5MB) 안에 들어가게 전체 크기를 묶음
const MAX_IMAGES = 8;
const MAX_IMAGES_SIZE = 4_000_000;

function optionalText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/** 섹션 항목 요청 본문을 검증하고 DB에 넣을 형태로 변환 (실패 시 error 메시지 반환) */
export function parseHistoryBody(
  body: Record<string, unknown>
): { data: HistoryInput } | { error: string } {
  const { type, title, titleEn, org, orgEn, period, sortDate, description, descriptionEn, link, tags, thumbnail, images } = body;

  if (!HISTORY_TYPES.includes(type as SectionKey)) {
    return { error: "섹션 구분이 올바르지 않습니다." };
  }
  if (
    typeof title !== "string" || !title.trim() ||
    typeof period !== "string" || !period.trim()
  ) {
    return { error: "제목과 기간은 필수입니다." };
  }
  if (org !== undefined && typeof org !== "string") {
    return { error: "기관 값이 올바르지 않습니다." };
  }

  // 정렬용 날짜: "YYYY-MM"(월 입력) 또는 "YYYY-MM-DD" 형식만 허용
  if (typeof sortDate !== "string" || !/^\d{4}-\d{2}(-\d{2})?$/.test(sortDate)) {
    return { error: "정렬 기준 날짜가 올바르지 않습니다." };
  }
  const date = new Date(`${sortDate.length === 7 ? `${sortDate}-01` : sortDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    return { error: "정렬 기준 날짜가 올바르지 않습니다." };
  }

  const linkValue = optionalText(link);
  if (linkValue && !/^(https?:\/\/|mailto:|\/)/.test(linkValue)) {
    return { error: "링크는 http(s):// 로 시작해야 합니다." };
  }

  // 썸네일: 브라우저에서 줄인 JPEG data URL만 허용 (줄인 결과는 보통 100KB 안팎, 넉넉히 1.5MB까지)
  const thumbnailValue = typeof thumbnail === "string" && thumbnail ? thumbnail : null;
  if (thumbnailValue && (!thumbnailValue.startsWith("data:image/jpeg;base64,") || thumbnailValue.length > 1_500_000)) {
    return { error: "썸네일 이미지가 올바르지 않거나 너무 큽니다." };
  }

  // 추가 사진: 보내지 않으면(undefined) 기존 사진을 그대로 둠
  if (images !== undefined) {
    const valid = Array.isArray(images) && images.every((v) => typeof v === "string" && v.startsWith("data:image/jpeg;base64,"));
    if (!valid || images.length > MAX_IMAGES) {
      return { error: `사진은 ${MAX_IMAGES}장까지 올릴 수 있습니다.` };
    }
    const total = (images as string[]).reduce((sum, v) => sum + v.length, thumbnailValue?.length ?? 0);
    if (total > MAX_IMAGES_SIZE) {
      return { error: "사진 용량이 너무 큽니다. 몇 장을 빼고 저장해 주세요." };
    }
  }

  return {
    data: {
      type: type as SectionKey,
      title: title.trim(),
      titleEn: optionalText(titleEn),
      org: typeof org === "string" ? org.trim() : "",
      orgEn: optionalText(orgEn),
      period: period.trim(),
      sortDate: date,
      description: optionalText(description),
      descriptionEn: optionalText(descriptionEn),
      link: linkValue,
      tags: optionalText(tags),
      thumbnail: thumbnailValue,
      ...(images !== undefined ? { images: images as string[] } : {}),
    },
  };
}
