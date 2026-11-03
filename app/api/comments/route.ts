import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, hashIp, parseCommentBody } from "@/lib/comments";

// 댓글 쓰기 - 누구나 가능, 공개된 블로그 글에만. 봇(허니팟)에는 성공처럼 답하고 저장하지 않음
export async function POST(req: NextRequest) {
  const parsed = parseCommentBody(await req.json().catch(() => ({})));
  if ("error" in parsed) {
    if (parsed.error === "spam") return NextResponse.json({ ok: true });
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const post = await prisma.post.findUnique({ where: { id: parsed.postId }, select: { published: true, categoryId: true } });
  if (!post || !post.published || !post.categoryId) {
    return NextResponse.json({ error: "글을 찾을 수 없습니다." }, { status: 404 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
  const ipHash = hashIp(ip);
  const limited = await checkRateLimit(ipHash, parsed.content);
  if (limited) return NextResponse.json({ error: limited }, { status: 429 });

  const comment = await prisma.comment.create({
    data: { postId: parsed.postId, name: parsed.name, content: parsed.content, ipHash },
    select: { id: true, name: true, content: true, createdAt: true },
  });
  return NextResponse.json({ comment: { ...comment, createdAt: comment.createdAt.toISOString() } });
}
