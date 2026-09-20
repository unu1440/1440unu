import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { parseHistoryBody } from "@/lib/history";

// 경력/학력 항목 추가 - 관리자만 가능
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = parseHistoryBody(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const entry = await prisma.historyEntry.create({ data: parsed.data });
  revalidatePath("/about");
  return NextResponse.json({ entry });
}
