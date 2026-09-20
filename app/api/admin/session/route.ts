import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

// 캐싱되면 로그인/로그아웃 상태가 고정돼버리므로 매 요청 새로 실행
export const dynamic = "force-dynamic";

// 현재 브라우저가 관리자 세션인지 확인 (DB 조회 없이 쿠키 서명만 검사) - 공개 페이지의 인라인 편집 모드 판정용
export async function GET() {
  return NextResponse.json({ admin: await requireAdmin() });
}
