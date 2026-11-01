import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// 프로젝트 팝업의 추가 사진 - 공개 페이지에서 팝업을 열 때 불러옴
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const entry = await prisma.historyEntry.findUnique({ where: { id }, select: { images: true } });
  return NextResponse.json({ images: entry?.images ?? [] });
}
