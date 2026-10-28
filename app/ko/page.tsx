import type { Metadata } from "next";
import PortfolioView from "@/components/PortfolioView";
import { loadPortfolio } from "@/lib/portfolio";

export const revalidate = 60;

export const metadata: Metadata = {
  description: "이현호 개인 홈페이지",
};

// /ko = 한국어 포트폴리오
export default async function KoreanHomePage() {
  const { profile, entries } = await loadPortfolio();
  return <PortfolioView lang="ko" profile={profile} entries={entries} />;
}
