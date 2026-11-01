import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { parseCategoryName } from "@/lib/posts";

// 카테고리 이름 변경 - 관리자만 가능, 글에는 바로 반영됨
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 401 });
  }

  const parsed = parseCategoryName(await req.json().catch(() => ({})));
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  if (!(await prisma.category.findUnique({ where: { id: params.id } }))) {
    return NextResponse.json({ error: "카테고리를 찾을 수 없습니다." }, { status: 404 });
  }
  const same = await prisma.category.findUnique({ where: { name: parsed.name } });
  if (same && same.id !== params.id) {
    return NextResponse.json({ error: "이미 있는 카테고리입니다." }, { status: 409 });
  }

  const category = await prisma.category.update({ where: { id: params.id }, data: { name: parsed.name } });
  return NextResponse.json({ category });
}

// 카테고리 삭제 - 관리자만 가능, 글이 남아 있으면 지우지 않음
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 401 });
  }

  const count = await prisma.post.count({ where: { categoryId: params.id } });
  if (count > 0) {
    return NextResponse.json({ error: `글이 ${count}개 있어서 지울 수 없습니다.` }, { status: 409 });
  }
  if (!(await prisma.category.findUnique({ where: { id: params.id } }))) {
    return NextResponse.json({ error: "카테고리를 찾을 수 없습니다." }, { status: 404 });
  }

  await prisma.category.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
