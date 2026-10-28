import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// 사진은 브라우저에서 512px로 줄여 올리므로 base64로도 수백 KB 이하 (그보다 큰 요청은 거부)
const MAX_PHOTO_LENGTH = 700_000;
const PHOTO_PATTERN = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;

const TEXT_FIELDS = [
  ["name", 100],
  ["nameEn", 100],
  ["slogan", 200],
  ["sloganEn", 200],
  ["tagline", 200],
  ["taglineEn", 200],
  ["affiliation", 200],
  ["affiliationEn", 200],
  ["bio", 5000],
  ["bioEn", 5000],
  ["interests", 3000],
  ["interestsEn", 3000],
  ["skills", 3000],
  ["email", 200],
  ["github", 500],
  ["scholar", 500],
  ["cvUrl", 500],
] as const;

// 프로필 저장 - 관리자만 가능, 싱글턴(id="me") 행을 upsert. 보내지 않은 필드는 그대로 유지
export async function PUT(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { photo } = body;

  const data: Record<string, string | null> = {};

  // photo: 문자열이면 data URL 검증 후 저장, null/빈 문자열이면 사진 삭제
  if (photo !== undefined) {
    if (photo) {
      if (typeof photo !== "string" || photo.length > MAX_PHOTO_LENGTH || !PHOTO_PATTERN.test(photo)) {
        return NextResponse.json({ error: "사진 형식이 올바르지 않거나 너무 큽니다." }, { status: 400 });
      }
      data.photo = photo;
    } else {
      data.photo = null;
    }
  }

  // 텍스트 필드: [이름, 최대 길이]
  for (const [key, max] of TEXT_FIELDS) {
    const value = body[key];
    if (value === undefined) continue;
    if (typeof value !== "string" || value.length > max) {
      return NextResponse.json({ error: `${key} 값이 올바르지 않습니다.` }, { status: 400 });
    }
    data[key] = value.trim() || null;
  }

  // 링크 필드는 http(s)로 시작하는 주소만 허용 (javascript: 같은 값 차단)
  for (const key of ["github", "scholar", "cvUrl"]) {
    if (data[key] && !/^https?:\/\//.test(data[key]!)) {
      return NextResponse.json({ error: "링크는 http(s):// 로 시작해야 합니다." }, { status: 400 });
    }
  }

  await prisma.profile.upsert({
    where: { id: "me" },
    update: data,
    create: { id: "me", ...data },
  });

  revalidatePath("/");
  revalidatePath("/ko");
  return NextResponse.json({ ok: true });
}
