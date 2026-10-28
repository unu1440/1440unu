# 1440unu.com

개인블로그

홈은 나무 이미지
점(Study / Tech / Blog) 누르면 그 카테고리로.

## Stack

Next.js 14 (App Router) · TypeScript · Prisma · Supabase · Vercel

폰트: Newsreader / Work Sans / IBM Plex Mono
톤: 파스텔 그레이, 흑백 베이스

## 구조

```
app/
├─ page.tsx              홈 = Tree 히어로
├─ category/[cat]/       카테고리별 글 목록
├─ posts/[slug]/         글 상세 + 댓글
├─ admin/                로그인 · 글쓰기 · 수정
└─ api/
   ├─ posts, comments
   └─ presence/          접속자 수

components/TreeHero.tsx   핀 + 플라이아웃 + 전환
components/PresenceStatus.tsx
prisma/schema.prisma      Post · Comment · Presence
public/tree.jpg
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

```bash
git push
```

Vercel이 알아서 붙임. 환경변수는 로컬 `.env`랑 동일 (단, `$` 이스케이프 없이 그대로).

## 자주 걸리는 것

- Supabase 7일 방치하면 pause → 대시보드에서 Resume
- 런타임은 무조건 Transaction pooler(6543). Session(5432)는 커넥션 15개 제한
- 스키마 바꾸면 `npx prisma generate` + TS 서버 재시작
- `npm run <script> <arg>`는 `--` 필수

## TODO

- 카테고리 추가
- 댓글 삭제
- 이미지 업로드
- 페이지네이션