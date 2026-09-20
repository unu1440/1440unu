import { prisma } from "@/lib/prisma";
import AboutView from "@/components/AboutView";

// 프로필 저장/수정 시 revalidatePath("/about")로 즉시 갱신되므로 평소에는 캐시된 결과를 사용
export const revalidate = 60;

// 소개 페이지 (/about) - 데이터만 조회하고 화면과 관리자 인라인 편집은 AboutView(client)가 담당
export default async function AboutPage() {
  const [profile, history] = await Promise.all([
    prisma.profile.findUnique({ where: { id: "me" } }),
    prisma.historyEntry.findMany({ orderBy: { sortDate: "desc" } }),
  ]);

  return (
    <AboutView
      profile={{
        photo: profile?.photo ?? null,
        name: profile?.name ?? "",
        tagline: profile?.tagline ?? "",
        bio: profile?.bio ?? "",
      }}
      history={history.map((h) => ({
        id: h.id,
        type: h.type,
        title: h.title,
        org: h.org,
        period: h.period,
        sortDate: h.sortDate.toISOString(),
        description: h.description,
      }))}
    />
  );
}
