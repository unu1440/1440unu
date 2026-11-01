import { parsePostLinks } from "@/lib/post-utils";
import { prisma } from "@/lib/prisma";

// 블로그 글은 categoryId로 카테고리에 연결됨. 옛 블로그 글은 categoryId가 비어 있어 DB에만 남아 있음
export { formatPostDate } from "@/lib/post-utils";

export type CategoryItem = { id: string; name: string };

export type PostItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  published: boolean;
  category: string;
  categoryId: string | null;
  thumbnail: string | null;
  tags: string[];
  links: string; // 한 줄에 하나 "이름 | 주소"
  createdAt: string; // ISO 문자열
};

const SAMPLE_MARKDOWN = `개발 모드에서만 보이는 글입니다. **굵게**, [링크](https://1440unu.com), \`짧은 코드\`를 씁니다.

## 코드 블록

\`\`\`python
def stiffness(force, depth):
    # 깊이에 따른 강성
    return force / depth
\`\`\`

## 목록과 표

- 첫 번째
- 두 번째

| 깊이 | 반발력 |
|---|---|
| 1 mm | 0.2 N |
| 2 mm | 0.5 N |

> 인용은 이렇게 보입니다.
`;

// DB 없이 개발할 때만 보이는 예시 글
const SAMPLE_POSTS: PostItem[] = [
  { id: "sample-1", slug: "sample-tactile", title: "🤖 촉각 센서 시뮬레이션을 시작하며", excerpt: "개발 글의 요약은 이렇게 한 줄로 보입니다.", content: SAMPLE_MARKDOWN, published: true, category: "개발", categoryId: "sample-dev", thumbnail: "/icon.svg", tags: ["Robotics", "Simulation"], links: "프로젝트 저장소 | https://github.com/unu1440", createdAt: "2026-11-01T00:00:00.000Z" },
  { id: "sample-2", slug: "sample-daily", title: "☕ 복학하고 첫 학기를 보내며", excerpt: "일상 글도 같은 모양으로 놓입니다.", content: "문단은 빈 줄로 나눕니다.", published: true, category: "일상", categoryId: "sample-life", thumbnail: null, tags: ["회고"], links: "", createdAt: "2026-10-20T00:00:00.000Z" },
  { id: "sample-3", slug: "sample-memo", title: "요약이 없는 글", excerpt: null, content: "요약은 비워 둘 수 있습니다.", published: true, category: "일상", categoryId: "sample-life", thumbnail: null, tags: [], links: "", createdAt: "2026-10-02T00:00:00.000Z" },
];

type PostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  published: boolean;
  categoryId: string | null;
  categoryRef: { name: string } | null;
  thumbnail: string | null;
  tags: string | null;
  links: string | null;
  createdAt: Date;
};

function toPost(row: PostRow): PostItem {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    published: row.published,
    category: row.categoryRef?.name ?? "",
    categoryId: row.categoryId,
    thumbnail: row.thumbnail,
    tags: (row.tags ?? "").split(",").map((t) => t.trim()).filter(Boolean),
    links: row.links ?? "",
    createdAt: row.createdAt.toISOString(),
  };
}

/** 카테고리 목록 - 관리자가 정한 순서대로 */
export async function loadCategories(): Promise<CategoryItem[]> {
  try {
    return await prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }], select: { id: true, name: true } });
  } catch (error) {
    if (process.env.NODE_ENV === "production") throw error;
    return [{ id: "sample-dev", name: "개발" }, { id: "sample-life", name: "일상" }];
  }
}

/** 글 목록 (최신순) - 관리자는 비공개 글까지. 옛 글은 categoryId가 비어 있어 빠짐 */
export async function loadPosts(includeDrafts: boolean) {
  try {
    const rows = await prisma.post.findMany({
      where: { categoryId: { not: null }, ...(includeDrafts ? {} : { published: true }) },
      include: { categoryRef: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
    // 목록에는 본문이 필요 없으니 브라우저로 보내지 않음
    return rows.map((row) => ({ ...toPost(row), content: "" }));
  } catch (error) {
    // 개발 모드에서 DB 연결이 없으면 예시 글로 화면만 확인 (배포 환경에서는 그대로 에러)
    if (process.env.NODE_ENV === "production") throw error;
    console.warn("[blog] DB 조회 실패 - 예시 글로 표시합니다:", (error as Error).message.trim().split("\n").at(-1));
    return SAMPLE_POSTS;
  }
}

/** 글 하나 - 비공개 글은 관리자에게만 */
export async function loadPost(slug: string, includeDrafts: boolean) {
  try {
    const row = await prisma.post.findUnique({ where: { slug }, include: { categoryRef: { select: { name: true } } } });
    if (!row || !row.categoryId) return null;
    if (!row.published && !includeDrafts) return null;
    return toPost(row);
  } catch (error) {
    if (process.env.NODE_ENV === "production") throw error;
    return SAMPLE_POSTS.find((p) => p.slug === slug) ?? null;
  }
}

/** 제목을 주소에 쓸 수 있는 영문 slug로 - 한글 제목처럼 남는 글자가 없으면 post-시각 */
export function makeSlug(title: string) {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  return slug || `post-${Date.now().toString(36)}`;
}

// 1MB 이미지를 base64로 바꾸면 약 1.37MB
const THUMBNAIL_MAX = 1_400_000;

/** 글 입력값 검증 */
export function parsePostBody(body: Record<string, unknown>) {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";
  const excerpt = typeof body.excerpt === "string" ? body.excerpt.trim() : "";
  const categoryId = typeof body.categoryId === "string" ? body.categoryId : "";
  const tagList = typeof body.tags === "string" ? body.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
  const tags = Array.from(new Set(tagList)).join(", ");
  const thumbnail = typeof body.thumbnail === "string" ? body.thumbnail : null;
  const links = typeof body.links === "string" ? body.links.trim() : "";

  if (!title || !content) return { error: "제목과 본문은 필수입니다." };
  if (!categoryId) return { error: "카테고리를 골라 주세요." };
  if (title.length > 200) return { error: "제목이 너무 깁니다." };
  if (excerpt.length > 300) return { error: "요약이 너무 깁니다." };
  if (content.length > 50000) return { error: "본문이 너무 깁니다." };
  if (tags.length > 300) return { error: "해시태그가 너무 많습니다." };
  if (links.length > 2000) return { error: "링크가 너무 많습니다." };
  if (links && parsePostLinks(links).length !== links.split("\n").filter((line) => line.trim()).length) {
    return { error: "링크는 http로 시작하는 주소만 넣을 수 있습니다." };
  }
  if (thumbnail && (!thumbnail.startsWith("data:image/jpeg;base64,") || thumbnail.length > THUMBNAIL_MAX)) {
    return { error: "썸네일을 저장할 수 없습니다. 더 작은 사진을 올려 주세요." };
  }

  return {
    data: { title, content, excerpt: excerpt || null, categoryId, tags: tags || null, thumbnail, links: links || null, published: body.published !== false },
  };
}

/** 카테고리 이름 검증 */
export function parseCategoryName(body: Record<string, unknown>) {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return { error: "카테고리 이름을 입력해 주세요." };
  if (name.length > 30) return { error: "카테고리 이름이 너무 깁니다." };
  return { name };
}
