"use client";

import { useRouter } from "next/navigation";

type Props = {
  className?: string;
  // 로그아웃 후 이동할 경로 (기본: 관리자 로그인 페이지)
  redirectTo?: string;
  // 로그아웃 직후 호출 (호출한 화면이 스스로 로그아웃 상태로 전환할 때 사용)
  onLoggedOut?: () => void;
};

// 관리자 로그아웃 버튼 - 세션 쿠키를 제거하고 지정한 경로로 이동
export default function LogoutButton({
  className = "btn btn-ghost",
  redirectTo = "/admin/login",
  onLoggedOut,
}: Props) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    onLoggedOut?.();
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <button className={className} onClick={handleLogout} type="button">
      로그아웃
    </button>
  );
}
