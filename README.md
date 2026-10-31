# 1440unu.com

이현호 개인 포트폴리오 사이트. 영어(`/`)와 한국어(`/ko`) 한 페이지씩.
소개, 프로젝트, 관심 분야, 학력과 경력, 자격을 보여준다.
처음엔 블로그였고 2026년 10월에 포트폴리오로 바꿨다.

내용은 코드에 없고 DB에 있다. 관리자로 로그인하면 홈 화면에서 바로 고친다.

## Stack

Next.js 14 (App Router) · TypeScript · Prisma · Supabase (Postgres) · Vercel

## 구조

```
app/
├─ page.tsx            영어 페이지
├─ ko/page.tsx         한국어 페이지
├─ admin/login/        관리자 로그인
└─ api/
   ├─ admin/           login · logout · session
   ├─ profile/         프로필 수정
   └─ history/         프로젝트·학력·경력·자격 추가/수정/삭제

components/
├─ PortfolioView.tsx   두 언어 페이지를 같이 그리는 화면
├─ EntrySection.tsx    섹션별 목록, 학력과 경력 타임라인
├─ ProfileEditor.tsx   프로필 편집
└─ SiteHeader.tsx

lib/                   auth(세션 쿠키) · history · i18n · image · prisma
prisma/                schema.prisma · migrations · seed
```

## 로컬 실행

```bash
npm install
```

`.env`:
```dotenv
DATABASE_URL="...6543/postgres?pgbouncer=true"   # Transaction pooler
DIRECT_URL="...5432/postgres"                     # Session pooler, migrate 전용
SESSION_SECRET="랜덤 문자열"
ADMIN_USERNAME="아이디"
ADMIN_PASSWORD_HASH="\$2a\$10\$..."                # npm run hash-password -- 비밀번호
```

```bash
npx prisma generate
npm run dev
```

## 배포

`main`에 push하면 Vercel이 배포한다. 환경변수는 Vercel 대시보드에 `.env`와 같은 값을 넣는다
(`$`는 로컬 `.env`에서만 `\`로 이스케이프하고, Vercel에는 그대로 입력).

## 자주 걸리는 것

- Supabase 무료 프로젝트는 7일 동안 접속이 없으면 멈춘다. 대시보드에서 Resume.
- 런타임 연결은 Transaction pooler(6543). Session pooler(5432)를 쓰면 `max clients reached` 오류가 난다.
- 스키마를 바꾸면 `npx prisma generate`를 다시 돌리고 TS 서버를 재시작한다. `git pull` 직후에도 같다.
- `npm run <script> <arg>`는 `--`가 필요하다.
- 운영 DB를 shadow database로 쓰지 않는다(DB가 지워진다). 마이그레이션은 `prisma migrate deploy`로 적용한다.

더 자세한 작업 메모는 `CLAUDE.md`에 있다.
