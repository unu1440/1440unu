import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { sessionId } = body;

  if (!sessionId || typeof sessionId !== "string") {
    return NextResponse.json({ error: "sessionId가 필요합니다." }, { status: 400 });
  }

  await prisma.presence.upsert({
    where: { sessionId },
    update: { lastSeen: new Date() },
    create: { sessionId },
  });

  return NextResponse.json({ ok: true });
}