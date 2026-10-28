// 포트폴리오 플레이스홀더 내용 - 시드 스크립트와 (개발 모드에서 DB가 아직 준비 안 됐을 때) 홈 화면이 함께 사용
// ○○ 표시된 부분을 실제 내용으로 바꿔 쓰면 됨

export const placeholderProfile = {
  name: "홍길동",
  nameEn: "Gildong Hong",
  slogan: "로봇과 사람의 경계를 허문다",
  sloganEn: "Breaking down the boundary between robots and people",
  tagline: "인공지능학 학부생 · Robot Learning & Tactile Sensing",
  taglineEn: "Undergraduate in AI · Robot Learning & Tactile Sensing",
  affiliation: "○○대학교 인공지능학과 (B.S.)",
  affiliationEn: "B.S. in Artificial Intelligence, ○○ University",
  bio:
    "로봇이 사람처럼 '만져서' 세상을 이해하는 방법에 관심이 있습니다. " +
    "촉각 센서 데이터를 활용해 물체의 상태를 추정하고, 이를 조작(manipulation) 정책 학습에 연결하는 연구를 하고 싶습니다.\n\n" +
    "현재 ○○ 연구실에서 학부연구생으로 활동하며 로봇 학습과 센서 데이터 처리를 공부하고 있고, 석사 과정 진학을 준비하고 있습니다.",
  bioEn:
    "I am interested in how robots can understand the world by touch. " +
    "I want to estimate object states from tactile sensor data and connect them to learning manipulation policies.\n\n" +
    "I am currently an undergraduate researcher at the ○○ Lab, studying robot learning and sensor data processing, and preparing for graduate school.",
  interestsEn: [
    "Robot Learning — Learning manipulation policies from demonstrations and reinforcement learning",
    "Tactile Sensing — Estimating contact states and object properties from tactile signals",
    "Haptics — Tactile interaction and feedback between people and robots",
  ].join("\n"),
  interests: [
    "Robot Learning — 시연·강화학습으로 로봇 조작 정책을 학습하는 방법",
    "Tactile Sensing — 촉각 센서 신호로 접촉 상태와 물체 특성을 추정",
    "Haptics — 사람과 로봇 사이의 촉각 상호작용과 피드백",
  ].join("\n"),
  email: "1440unu@gmail.com",
  github: "https://github.com/",
  scholar: null,
  cvUrl: null,
};

const month = (ym) => new Date(`${ym}-01T00:00:00Z`);

export const placeholderEntries = [

  {
    type: "education",
    title: "B.S. in Artificial Intelligence",
    org: "○○대학교",
    orgEn: "○○ University",
    period: "20○○.03 – 현재",
    sortDate: month("2023-03"),
    description: "GPA ○.○○ / 4.5 · 관련 과목: 기계학습, 딥러닝, 로보틱스, 선형대수, 확률과 통계",
  },

  {
    type: "project",
    title: "Tactile Slip Detection",
    org: "촉각 신호로 물체 미끄러짐을 실시간 감지",
    period: "2026.05 – 2026.08",
    sortDate: month("2026-05"),
    description: "문제 → 방법 → 결과 순서로 2~3줄 정리. 예) 시계열 촉각 데이터에 1D-CNN을 적용해 미끄러짐 감지 정확도 ○○% 달성.",
    tags: "PyTorch, Tactile Sensing, Time Series",
    link: "https://github.com/",
  },
  {
    type: "project",
    title: "Pick-and-Place with Imitation Learning",
    org: "MuJoCo 시뮬레이션에서 시연 데이터로 집기 정책 학습",
    period: "2025.09 – 2025.12",
    sortDate: month("2025-09"),
    description: "Behavior Cloning 기반 정책을 학습하고 데이터 양에 따른 성공률 변화를 분석.",
    tags: "MuJoCo, Imitation Learning, Python",
    link: "https://github.com/",
  },
  {
    type: "project",
    title: "1440unu.com",
    org: "이 포트폴리오 사이트",
    period: "2026.09 – 현재",
    sortDate: month("2026-09"),
    description: "Next.js + Prisma + PostgreSQL로 직접 만든 개인 사이트. 관리자 로그인 시 페이지에서 바로 편집.",
    tags: "Next.js, TypeScript, PostgreSQL",
  },

  {
    type: "experience",
    title: "(예시) 학습 동아리 운영",
    org: "○○ AI 스터디",
    period: "2024.03 – 2025.02",
    sortDate: month("2024-03"),
    description: "논문 리딩 세션 운영, 강화학습 기초 스터디 진행",
  },

  { type: "certification", title: "(예시) ○○ 자격증", titleEn: "(Example) ○○ Certificate", org: "○○", period: "2020.06", sortDate: month("2020-06") },
];
