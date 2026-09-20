import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// 사진은 브라우저에서 512px로 줄여 올리므로 base64로도 수백 KB 이하 (그보다 큰 요청은 거부)
const MAX_PHOTO_LENGTH = 700_000;
const PHOTO_PATTERN = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;

// 프로필 저장 - 관리자만 가능, 싱글턴(id="me") 행을 upsert. 보내지 않은 필드는 그대로 유지
export async function PUT(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { photo, name, tagline, bio } = body;

  const data: { photo?: string | null; name?: string | null; tagline?: string | null; bio?: string | null } = {};

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

  for (const [key, value, max] of [
    ["name", name, 100],
    ["tagline", tagline, 200],
    ["bio", bio, 5000],
  ] as const) {
    if (value === undefined) continue;
    if (typeof value !== "string" || value.length > max) {
      return NextResponse.json({ error: `${key} 값이 올바르지 않습니다.` }, { status: 400 });
    }
    data[key] = value.trim() || null;
  }

  await prisma.profile.upsert({
    where: { id: "me" },
    update: data,
    create: { id: "me", ...data },
  });

  revalidatePath("/about");
  return NextResponse.json({ ok: true });
}
