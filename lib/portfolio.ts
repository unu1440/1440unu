import { prisma } from "@/lib/prisma";
import { placeholderEntries, placeholderProfile } from "@/prisma/placeholder.mjs";

// 포트폴리오 화면에 넘기는 데이터 모양 (서버 → 클라이언트 직렬화용, null 대신 빈 문자열)
export type ProfileData = {
  photo: string | null;
  name: string;
  nameEn: string;
  slogan: string;
  sloganEn: string;
  tagline: string;
  taglineEn: string;
  affiliation: string;
  affiliationEn: string;
  bio: string;
  bioEn: string;
  interests: string;
  interestsEn: string;
  skills: string;
  email: string;
  github: string;
  scholar: string;
  cvUrl: string;
};

export type EntryItem = {
  id: string;
  type: string;
  title: string;
  titleEn: string | null;
  org: string;
  orgEn: string | null;
  period: string;
  sortDate: string; // ISO 문자열
  description: string | null;
  descriptionEn: string | null;
  link: string | null;
  tags: string | null;
  thumbnail: string | null;
};

const PROFILE_KEYS = [
  "name", "nameEn", "slogan", "sloganEn", "tagline", "taglineEn", "affiliation", "affiliationEn",
  "bio", "bioEn", "interests", "interestsEn", "skills", "email", "github", "scholar", "cvUrl",
] as const;

type ProfileRow = Partial<Record<keyof ProfileData, string | null>> | null;

function toProfile(row: ProfileRow): ProfileData {
  const data = { photo: row?.photo ?? null } as ProfileData;
  for (const key of PROFILE_KEYS) data[key] = row?.[key] ?? "";
  return data;
}

type EntryRow = {
  id: string;
  type: string;
  title: string;
  titleEn?: string | null;
  org: string;
  orgEn?: string | null;
  period: string;
  sortDate: Date;
  description?: string | null;
  descriptionEn?: string | null;
  link?: string | null;
  tags?: string | null;
  thumbnail?: string | null;
};

function toEntry(row: EntryRow): EntryItem {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    titleEn: row.titleEn ?? null,
    org: row.org,
    orgEn: row.orgEn ?? null,
    period: row.period,
    sortDate: row.sortDate.toISOString(),
    description: row.description ?? null,
    descriptionEn: row.descriptionEn ?? null,
    link: row.link ?? null,
    tags: row.tags ?? null,
    thumbnail: row.thumbnail ?? null,
  };
}

/** 프로필 + 섹션 항목(최신순) 조회 - 한국어/영어 페이지가 함께 사용 */
export async function loadPortfolio() {
  try {
    const [profile, entries] = await Promise.all([
      prisma.profile.findUnique({ where: { id: "me" } }),
      prisma.historyEntry.findMany({
        orderBy: { sortDate: "desc" },
        // 추가 사진은 크기가 커서 페이지에 싣지 않음 (팝업을 열 때 /api/history/[id]/images로 불러옴)
        select: {
          id: true, type: true, title: true, titleEn: true, org: true, orgEn: true, period: true, sortDate: true,
          description: true, descriptionEn: true, link: true, tags: true, thumbnail: true,
        },
      }),
    ]);
    return { profile: toProfile(profile), entries: entries.map(toEntry) };
  } catch (error) {
    // 개발 모드에서 마이그레이션 전이라 DB 조회가 실패하면 플레이스홀더로 화면만 확인 (배포 환경에서는 그대로 에러)
    if (process.env.NODE_ENV === "production") throw error;
    console.warn("[portfolio] DB 조회 실패 - 플레이스홀더로 표시합니다:", (error as Error).message.trim().split("\n").at(-1));
    const entries = placeholderEntries
      .map((e, i) => toEntry({ id: `placeholder-${i}`, ...e }))
      .sort((a, b) => b.sortDate.localeCompare(a.sortDate));
    return { profile: toProfile(placeholderProfile), entries };
  }
}
