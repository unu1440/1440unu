import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// 제목을 URL에 쓸 수 있는 slug로 변환 (한글, 영숫자, 하이픈만 허용)
function slugify(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const VALID_CATS = ["study", "tech", "blog"];

// 새 글 작성 - 관리자만 가능, slug가 비거나 중복되면 타임스탬프를 덧붙여 고유화
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { title, excerpt, content, published, category } = body;

  if (!title || !content) {
    return NextResponse.json({ error: "제목과 본문은 필수입니다." }, { status: 400 });
  }

  let slug = slugify(title) || `post-${Date.now().toString(36)}`;
  const existing = await prisma.post.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const post = await prisma.post.create({
    data: {
      title,
      excerpt: excerpt || null,
      content,
      slug,
      published: published ?? true,
      category: VALID_CATS.includes(category) ? category : "blog",
    },
  });

  return NextResponse.json({ post });
}