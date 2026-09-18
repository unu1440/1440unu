"use client";

import { useEffect, useState } from "react";

function getSessionId() {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("1440unu_sid");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("1440unu_sid", id);
  }
  return id;
}

export default function PresenceStatus() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const sessionId = getSessionId();

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
