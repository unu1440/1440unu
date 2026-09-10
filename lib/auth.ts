import crypto from "crypto";
import { cookies } from "next/headers";

const SECRET = process.env.SESSION_SECRET || "dev-secret-change-me";
export const ADMIN_COOKIE_NAME = "1440unu_admin";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7일 (초 단위)

function sign(expiry: number) {
  return crypto.createHmac("sha256", SECRET).update(`admin.${expiry}`).digest("hex");
}

/** 로그인 성공 시 쿠키에 넣을 값 생성 */
export function createSessionCookieValue() {
  const expiry = Date.now() + SESSION_MAX_AGE * 1000;
  return `${expiry}.${sign(expiry)}`;
}

/** 쿠키 값이 유효한(위조되지 않고 만료되지 않은) 세션인지 확인 */
export function isValidSession(value: string | undefined) {
  if (!value) return false;
  const [expiryStr, signature] = value.split(".");
  const expiry = Number(expiryStr);
  if (!expiry || !signature) return false;
  if (Date.now() > expiry) return false;

  const expected = sign(expiry);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/** 서버 컴포넌트/라우트 핸들러에서 관리자 여부 확인 */
export async function requireAdmin() {
  const store = await cookies();
  const value = store.get(ADMIN_COOKIE_NAME)?.value;
  return isValidSession(value);
}
