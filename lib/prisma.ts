import { PrismaClient } from "@prisma/client";

// 개발 환경에서 핫 리로드 시 PrismaClient가 매번 새로 생성되는 것을 막기 위해 전역에 캐싱
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
