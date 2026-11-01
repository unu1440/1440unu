import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { parsePostBody } from "@/lib/posts";

// 옛 블로그 글은 건드리지 않도록 지금 블로그의 글인지 확인
async function findPost(id: string) {
  const post = await prisma.post.findUnique({ where: { id } });
  return post && post.categoryId ? post : null;
}

// 글 수정 - 관리자만 가능 (주소가 바뀌지 않도록 slug는 그대로)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 401 });
  }
  if (!(await findPost(params.id))) {
    return NextResponse.json({ error: "글을 찾을 수 없습니다." }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = parsePostBody(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  if (!(await prisma.category.findUnique({ where: { id: parsed.data.categoryId } }))) {
    return NextResponse.json({ error: "없는 카테고리입니다." }, { status: 400 });
  }

  const post = await prisma.post.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json({ post });
}

// 글 삭제 - 관리자만 가능
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 401 });
  }
  if (!(await findPost(params.id))) {
    return NextResponse.json({ error: "글을 찾을 수 없습니다." }, { status: 404 });
  }

  await prisma.post.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
