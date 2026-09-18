import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ONLINE_WINDOW_MS = 2 * 60 * 1000; // 최근 2분 안에 신호 온 세션만 "접속 중"으로 침
const CLEANUP_AGE_MS = 60 * 60 * 1000; // 1시간 넘게 조용한 기록은 가끔 정리

export async function GET() {
  const now = new Date();
  const cutoff = new Date(now.getTime() - ONLINE_WINDOW_MS);

  const count = await prisma.presence.count({
    where: { lastSeen: { gte: cutoff } },
  });

  // 오래된 기록 정리 (실패해도 응답에는 영향 없도록 기다리지 않음)
  const staleCutoff = new Date(now.getTime() - CLEANUP_AGE_MS);
  prisma.presence.deleteMany({ where: { lastSeen: { lt: staleCutoff } } }).catch(() => {});

  return NextResponse.json({ count });
}