import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { parseHistoryBody } from "@/lib/history";

// 경력/학력 항목 수정 - 관리자만 가능
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = parseHistoryBody(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const entry = await prisma.historyEntry.update({ where: { id }, data: parsed.data });
  revalidatePath("/about");
  return NextResponse.json({ entry });
}

// 경력/학력 항목 삭제 - 관리자만 가능
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 401 });
  }

  const { id } = await params;
  await prisma.historyEntry.delete({ where: { id } });
  revalidatePath("/about");
  return NextResponse.json({ ok: true });
}
