import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { parseCategoryName } from "@/lib/posts";

// 카테고리 추가 - 관리자만 가능, 맨 뒤에 붙음
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 401 });
  }

  const parsed = parseCategoryName(await req.json().catch(() => ({})));
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  if (await prisma.category.findUnique({ where: { name: parsed.name } })) {
    return NextResponse.json({ error: "이미 있는 카테고리입니다." }, { status: 409 });
  }

  const last = await prisma.category.aggregate({ _max: { sortOrder: true } });
  const category = await prisma.category.create({
    data: { name: parsed.name, sortOrder: (last._max.sortOrder ?? 0) + 1 },
  });
  return NextResponse.json({ category });
}
