import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { postId, author, content } = body;

  if (!postId || !content || !String(content).trim()) {
    return NextResponse.json({ error: "내용을 입력해주세요." }, { status: 400 });
  }

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    return NextResponse.json({ error: "글을 찾을 수 없습니다." }, { status: 404 });
  }

  const comment = await prisma.comment.create({
    data: {
      postId,
      author: String(author || "").trim().slice(0, 40) || "익명",
      content: String(content).trim().slice(0, 1000),
    },
  });

  return NextResponse.json({ comment });
}
