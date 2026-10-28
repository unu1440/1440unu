import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// /admin - 별도 대시보드 없이 홈에서 바로 편집하므로, 로그인돼 있으면 홈으로 / 아니면 로그인 페이지로
export default async function AdminPage() {
  redirect((await requireAdmin()) ? "/" : "/admin/login");
}
