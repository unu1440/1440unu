"use client";

import { useEffect, useState } from "react";

// 로컬 스토리지에 저장된 방문자 세션 ID를 가져오거나 없으면 새로 생성
function getSessionId() {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("1440unu_sid");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("1440unu_sid", id);
  }
  return id;
}

// 헤더에 표시되는 실시간 접속자 수 - 주기적으로 heartbeat를 보내고 접속자 수를 갱신
export default function PresenceStatus() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const sessionId = getSessionId();

    // 내 세션이 아직 접속 중임을 서버에 알림
    async function heartbeat() {
      try {
        await fetch("/api/presence/heartbeat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
      } catch {
        // 조용히 무시 (접속자 수는 부가 기능이라 실패해도 페이지엔 영향 없음)
      }
    }

    // 현재 접속자 수를 서버에서 조회
    async function fetchCount() {
      try {
        const res = await fetch("/api/presence/count");
        const data = await res.json();
        setCount(data.count);
      } catch {
        // 무시
      }
    }

    heartbeat();
    fetchCount();

    // heartbeat는 25초, 접속자 수 갱신은 15초 주기로 반복
    const hbInterval = setInterval(heartbeat, 25000);
    const countInterval = setInterval(fetchCount, 15000);

    return () => {
      clearInterval(hbInterval);
      clearInterval(countInterval);
    };
  }, []);

  return (
    <span className="status-item">
      <span className="status-dot"></span>
      <span>{count ?? "–"}</span> 접속 중
    </span>
  );
}
