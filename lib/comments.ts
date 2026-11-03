import crypto from "crypto";
import { prisma } from "@/lib/prisma";

// 블로그 댓글 - 로그인 없이 닉네임으로 작성, 내용은 일반 텍스트로만 보여 줌
const SECRET = process.env.SESSION_SECRET || "dev-secret-change-me";
const MIN_FILL_MS = 3000; // 폼을 연 뒤 3초 안에 보내면 봇으로 봄
const MAX_FORM_AGE_MS = 24 * 60 * 60 * 1000; // 하루 지난 폼은 다시 열어야 함
const LIMIT_10MIN = 3;
const LIMIT_DAY = 20;

export type CommentItem = { id: string; name: string; content: string; createdAt: string };

export async function loadComments(postId: string): Promise<CommentItem[]> {
  try {
    const rows = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, content: true, createdAt: true },
    });
    return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));
  } catch (error) {
    console.error("댓글을 불러오지 못했습니다.", error);
    return [];
  }
}

function sign(value: string) {
  return crypto.createHmac("sha256", SECRET).update(`comment.${value}`).digest("hex");
}

/** 폼을 연 시각에 서명한 값 - 제출할 때 같이 돌아와서 작성 시간을 확인함 */
export function makeFormToken() {
  const issuedAt = String(Date.now());
  return `${issuedAt}.${sign(issuedAt)}`;
}

function checkFormToken(token: unknown) {
  if (typeof token !== "string") return false;
  const [issuedAt, signature] = token.split(".");
  const a = Buffer.from(signature ?? "");
  const b = Buffer.from(sign(issuedAt ?? ""));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  const age = Date.now() - Number(issuedAt);
  return age >= MIN_FILL_MS && age <= MAX_FORM_AGE_MS;
}

/** IP 원문 대신 저장하는 해시 */
export function hashIp(ip: string) {
  return crypto.createHmac("sha256", SECRET).update(`ip.${ip}`).digest("hex");
}

/** 입력 검사 - 닉네임 20자, 내용 1,000자, 링크 1개까지 */
export function parseCommentBody(body: Record<string, unknown>) {
  if (typeof body.website === "string" && body.website !== "") return { error: "spam" as const };
  if (!checkFormToken(body.token)) return { error: "잠시 후 다시 보내 주세요. 계속되면 새로고침해 주세요." };

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";
  const postId = typeof body.postId === "string" ? body.postId : "";
  if (!postId) return { error: "글을 찾을 수 없습니다." };
  if (!name || name.length > 20) return { error: "닉네임은 1~20자로 써 주세요." };
  if (!content || content.length > 1000) return { error: "댓글은 1~1,000자로 써 주세요." };
  if ((content.match(/https?:\/\//gi) ?? []).length > 1) return { error: "링크는 하나만 넣을 수 있습니다." };
  return { postId, name, content };
}

/** 같은 IP의 횟수 제한과 같은 내용 반복 확인 - 문제가 없으면 null */
export async function checkRateLimit(ipHash: string, content: string) {
  const now = Date.now();
  const [recent, today, same] = await Promise.all([
    prisma.comment.count({ where: { ipHash, createdAt: { gte: new Date(now - 10 * 60 * 1000) } } }),
    prisma.comment.count({ where: { ipHash, createdAt: { gte: new Date(now - 24 * 60 * 60 * 1000) } } }),
    prisma.comment.findFirst({ where: { ipHash, content }, select: { id: true } }),
  ]);
  if (recent >= LIMIT_10MIN || today >= LIMIT_DAY) return "댓글을 너무 자주 남겼어요. 조금 뒤에 다시 써 주세요.";
  if (same) return "같은 댓글을 이미 남겼어요.";
  return null;
}
