// 포트폴리오 플레이스홀더 내용(placeholder.mjs)을 DB에 넣는 시드 스크립트
// 실행: node --env-file=.env prisma/seed.mjs
// 빈 DB용 - 프로필이 이미 있으면 건드리지 않고(실제 내용이 예시로 덮어써지지 않게), 섹션 항목도 하나도 없을 때만 넣음
import { PrismaClient } from "@prisma/client";
import { placeholderProfile as profile, placeholderEntries as entries } from "./placeholder.mjs";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.profile.findUnique({ where: { id: "me" }, select: { id: true } });
  if (existing) {
    console.log("이미 프로필이 있어서 프로필 시드는 건너뜁니다.");
  } else {
    await prisma.profile.create({ data: { id: "me", ...profile } });
    console.log("프로필 플레이스홀더를 넣었습니다.");
  }

  const count = await prisma.historyEntry.count();
  if (count > 0) {
    console.log("이미 섹션 항목이 있어서 항목 시드는 건너뜁니다.");
    return;
  }
  await prisma.historyEntry.createMany({ data: entries });
  console.log(`섹션 항목 ${entries.length}개를 넣었습니다.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
