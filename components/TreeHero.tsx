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

export default function TreeHero() {
  const router = useRouter();
  const [openKey, setOpenKey] = useState<Cat | null>(null);
  const [leaving, setLeaving] = useState(false);

  function toggle(key: Cat) {
    if (leaving) return;
    setOpenKey((prev) => (prev === key ? null : key));
  }

  function goToCategory(key: Cat) {
  if (leaving) return;
  setLeaving(true);
  router.push(`/category/${key}`);
 }

  return (
    <>
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