import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { makeSlug, parsePostBody } from "@/lib/posts";

// 새 글 작성 - 관리자만 가능, slug가 겹치면 시각을 덧붙임
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = parsePostBody(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  if (!(await prisma.category.findUnique({ where: { id: parsed.data.categoryId } }))) {
    return NextResponse.json({ error: "없는 카테고리입니다." }, { status: 400 });
  }

  let slug = makeSlug(parsed.data.title);
  if (await prisma.post.findUnique({ where: { slug } })) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const post = await prisma.post.create({ data: { ...parsed.data, slug } });
  return NextResponse.json({ post });
}
