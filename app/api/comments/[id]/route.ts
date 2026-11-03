import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// 댓글 삭제 - 관리자만 가능
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 401 });
  }
  if (!(await prisma.comment.findUnique({ where: { id: params.id } }))) {
    return NextResponse.json({ error: "댓글을 찾을 수 없습니다." }, { status: 404 });
  }
  await prisma.comment.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
