# 1440unu.com

개인 포트폴리오 사이트. 구조와 실행 방법은 `README.md`에 있고, 여기에는 작업할 때 필요한 것만 적습니다.

## 구조

- 스택: Next.js 14 (App Router), TypeScript, Prisma, Supabase(Postgres), Vercel.
- `/`는 영어, `/ko`는 한국어. 둘 다 `components/PortfolioView.tsx`가 `lang` prop으로 그립니다.
- 내용은 DB에 있습니다(`Profile`, `HistoryEntry`). 영어 칸(`...En`)이 비어 있으면 한국어 값을 보여 줍니다(`lib/i18n.ts`의 `pick`).
- 관리자는 `/admin/login`으로 로그인한 뒤 홈 화면에서 바로 고칩니다. 세션은 HMAC 서명 쿠키(`lib/auth.ts`)이고, 저장 API는 `/`와 `/ko`의 캐시를 갱신합니다.
- 프로필 사진과 프로젝트 썸네일은 브라우저에서 줄여 base64로 DB에 저장합니다(`lib/image.ts`).

## 문구와 디자인

- 문구는 소박하고 구체적으로 씁니다. 과장된 표현, 장식용 번호·칩·아이콘은 넣지 않습니다.
- 사용자의 개인적인 이야기나 동기를 대신 지어 쓰지 않습니다. 모르면 비워 두고 묻습니다.
- 글꼴은 Pretendard, 위쪽 소개와 아래쪽 CV 영역은 글꼴을 나눕니다. 색은 `app/globals.css`의 토큰을 씁니다.

## DB

- 런타임은 Transaction pooler(6543, `?pgbouncer=true`), 마이그레이션은 Session pooler(5432, `DIRECT_URL`)를 씁니다.
- 마이그레이션은 `prisma migrate deploy`로 적용합니다. 운영 DB를 shadow database로 쓰지 않습니다.
- 블로그 시절의 `Post`, `Comment`, `Presence` 테이블은 스키마에서만 빠져 있고 DB에는 남아 있습니다. `prisma migrate dev` 전에 확인하세요.

## 자주 걸리는 것

- `.env`의 `$`는 `\`로 이스케이프하고, Vercel 환경변수에는 이스케이프 없이 넣습니다.
- 스키마를 바꾸거나 `git pull`한 뒤에는 `npx prisma generate`를 다시 돌립니다.
- Supabase 무료 프로젝트는 7일간 접속이 없으면 멈춥니다.
- API 라우트에는 `export const dynamic = "force-dynamic"`을 넣습니다.
- `npm run build`는 dev 서버를 끄고 돌립니다.

## 작업 규칙

- 커밋과 푸시는 요청받을 때만 합니다. 비밀번호, 키, 개인 서류는 올리지 않습니다.
- 개인 작업 메모는 `CLAUDE.local.md`와 `private/`에 있고 저장소에는 올라가지 않습니다.
