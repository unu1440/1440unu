import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const VALID_CATS = ["study", "tech", "blog"];

// 글 수정 - 관리자만 가능, 유효하지 않은 카테고리는 "blog"로 대체
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { title, excerpt, content, published, category } = body;

  if (!title || !content) {
    return NextResponse.json({ error: "제목과 본문은 필수입니다." }, { status: 400 });
  }

  const post = await prisma.post.update({
    where: { id },
    data: {
      title,
      excerpt: excerpt || null,
      content,
      published,
      category: VALID_CATS.includes(category) ? category : "blog",
    },
  });

  return NextResponse.json({ post });
}

// 글 삭제 - 관리자만 가능, 외래키 제약 때문에 딸린 댓글을 먼저 삭제
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 401 });
  }

  const { id } = await params;
  await prisma.comment.deleteMany({ where: { postId: id } });
  await prisma.post.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}