import PortfolioView from "@/components/PortfolioView";
import { loadPortfolio } from "@/lib/portfolio";

// 프로필/항목 저장 시 revalidatePath로 즉시 갱신되므로 평소에는 캐시된 결과를 사용
export const revalidate = 60;

// 홈 (/) = 영어 포트폴리오 (메인). 영어 값이 비어 있는 항목은 한국어로 표시
// 데이터만 조회하고 화면과 관리자 인라인 편집은 PortfolioView(client)가 담당
export default async function HomePage() {
  const { profile, entries } = await loadPortfolio();
  return <PortfolioView lang="en" profile={profile} entries={entries} />;
}
