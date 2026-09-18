"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Cat = "study" | "tech" | "blog";

const PINS: {
  key: Cat;
  label: string;
  desc: string;
  left: string;
  top: string;
  flip?: boolean;
}[] = [
  { key: "study", label: "Study", desc: "공부하며 남긴 메모와 정리.", left: "11%", top: "30%" },
  { key: "tech", label: "Tech", desc: "개발하며 겪은 것들.", left: "68%", top: "31.5%", flip: true },
  { key: "blog", label: "Blog", desc: "일상, 생각, 하루의 기록.", left: "30%", top: "68.5%" },
];

// 홈 화면의 나무 그래픽 - 핀을 클릭하면 카테고리 설명이 뜨고, 다시 클릭하면 이동
export default function TreeHero() {
  const router = useRouter();
  const [openKey, setOpenKey] = useState<Cat | null>(null);
  const [leaving, setLeaving] = useState(false);

  // 핀을 클릭하면 설명 풍선을 열거나 닫음 (같은 핀 재클릭 시 닫힘)
  function toggle(key: Cat) {
    if (leaving) return;
    setOpenKey((prev) => (prev === key ? null : key));
  }

  // 카테고리 페이지로 이동 - 전환 애니메이션을 먼저 보여준 뒤 라우팅
  function goToCategory(key: Cat) {
  if (leaving) return;
  setLeaving(true);
  router.push(`/category/${key}`);
 }

  return (
    <>
      {/* 나무 사진에 바람에 흔들리는 듯한 효과를 주는 SVG 필터 (화면에는 보이지 않음) */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <filter id="windWobble">
          <feTurbulence type="fractalNoise" numOctaves={2} seed={7} result="noise">
            <animate
              attributeName="baseFrequency"
              values="0.007 0.013;0.010 0.017;0.007 0.013"
              dur="10s"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={3.2} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <div className={`tree-stage${leaving ? " tree-leaving" : ""}`}>
        <div className="hero-photo-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="hero-photo"
            src="/tree.jpg"
            alt="앙상한 나무"
            style={{ filter: "url(#windWobble)" }}
          />

          {PINS.map((pin) => (
            <div
              key={pin.key}
              className={`pin${pin.flip ? " flip" : ""}${openKey === pin.key ? " open" : ""}`}
              style={{ left: pin.left, top: pin.top }}
              tabIndex={0}
              onClick={() => toggle(pin.key)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") toggle(pin.key);
              }}
            >
              <div className="flyout">
                <div className="flyout-label">Category</div>
                <div className="flyout-title">{pin.label}</div>
                <p className="flyout-desc">{pin.desc}</p>
                                <span
                  role="button"
                  tabIndex={0}
                  className="flyout-link"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToCategory(pin.key);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation();
                      goToCategory(pin.key);
                    }
                  }}
                >
                  보러가기 →
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="hint">버튼을 눌러 카테고리로 이동</div>
      </div>
    </>
  );
}