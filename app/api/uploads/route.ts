import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

const BUCKET = "blog-images";
const MAX_SIZE = 3 * 1024 * 1024; // 브라우저에서 줄인 사진 기준 (Vercel 요청 4.5MB 제한보다 작게)

// 블로그 본문 사진 올리기 - 관리자만 가능, Supabase Storage에 저장하고 공개 주소를 돌려줌
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 401 });
  }

  const { SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key } = process.env;
  if (!url || !key) {
    return NextResponse.json({ error: "사진 저장소가 설정되지 않았습니다." }, { status: 500 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "사진을 골라 주세요." }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "사진이 너무 큽니다." }, { status: 413 });
  }

  // 파일 종류는 헤더가 아니라 앞부분으로 확인 (브라우저가 줄인 JPEG만 받음)
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff) {
    return NextResponse.json({ error: "JPEG 사진만 올릴 수 있습니다." }, { status: 415 });
  }

  const path = `${new Date().toISOString().slice(0, 7)}/${randomUUID()}.jpg`;
  const res = await fetch(`${url}/storage/v1/object/${BUCKET}/${path}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${key}`,
      apikey: key,
      "content-type": "image/jpeg",
      "cache-control": "max-age=31536000",
    },
    body: bytes,
  }).catch(() => null);

  if (!res?.ok) {
    console.error("[upload] 저장 실패:", res?.status);
    return NextResponse.json({ error: "사진을 저장하지 못했습니다." }, { status: 502 });
  }
  return NextResponse.json({ url: `${url}/storage/v1/object/public/${BUCKET}/${path}` });
}
