"use client";

import { useRouter } from "next/navigation";

// 관리자 로그아웃 버튼 - 세션 쿠키를 제거하고 로그인 페이지로 이동
export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button className="btn btn-ghost" onClick={handleLogout} type="button">
      로그아웃
    </button>
  );
}
