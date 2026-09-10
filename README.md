# 1440unu (동적 버전)

Next.js + SQLite(Prisma) 기반 동적 블로그입니다. 관리자 로그인 후 웹에서 글을 쓰고, 방문자는 댓글을 남길 수 있습니다. 디자인은 색 없이 흑백만 사용한 미니멀 스타일입니다.

## 폴더 구조

```
1440unu-dynamic/
├── app/
│   ├── page.tsx               # 홈 (글 목록)
│   ├── posts/[slug]/page.tsx  # 개별 글 + 댓글
│   ├── about/page.tsx         # 소개
│   ├── admin/
│   │   ├── login/page.tsx     # 관리자 로그인
│   │   ├── page.tsx           # 대시보드 (글 목록/삭제)
│   │   ├── new/page.tsx       # 새 글 쓰기
│   │   └── edit/[id]/page.tsx # 글 수정
│   ├── api/
│   │   ├── admin/login, logout
│   │   ├── posts, posts/[id]  # 글 CRUD (관리자만)
│   │   └── comments           # 댓글 작성 (누구나)
│   └── globals.css
├── components/                # 댓글 폼, 에디터 폼, 로그아웃/삭제 버튼
├── lib/
│   ├── prisma.ts              # Prisma 클라이언트
│   └── auth.ts                # 세션 쿠키 발급/검증
├── prisma/
│   ├── schema.prisma          # Post, Comment 모델
│   └── seed.mjs               # 샘플 글 하나 넣는 시드
└── scripts/generate-hash.mjs  # 관리자 비밀번호 해시 생성기
```

## 처음 실행하기

```bash
cd 1440unu-dynamic
npm install

# 환경변수 파일 만들기
cp .env.example .env
```

`.env` 파일을 열어서:
1. `SESSION_SECRET`을 아무 긴 랜덤 문자열로 바꾸기
2. `ADMIN_USERNAME`을 원하는 아이디로 설정
3. 아래 명령으로 비밀번호 해시를 만들어서 `ADMIN_PASSWORD_HASH`에 붙여넣기

```bash
npm run hash-password 원하는비밀번호
```

그 다음 데이터베이스를 만들고 실행합니다.

```bash
npx prisma migrate dev --name init
node prisma/seed.mjs      # 선택: 샘플 글 하나 넣기
npm run dev
```

- 블로그: http://localhost:3000
- 관리자 로그인: http://localhost:3000/admin/login

## 글 쓰기

`/admin/login`에서 로그인하면 `/admin`에서 새 글 쓰기, 수정, 삭제, 공개/비공개 전환이 가능합니다. 본문은 HTML 태그(`<p>`, `<strong>`, `<em>` 등)를 그대로 입력하는 방식입니다.

## 댓글

로그인 없이 누구나 이름(선택)과 내용만 입력하면 댓글을 남길 수 있습니다. 댓글 삭제 기능은 아직 없는데, 필요하시면 관리자 대시보드에 추가해드릴 수 있어요.

## 배포하기

이 프로젝트는 SQLite 파일을 로컬 디스크에 저장하기 때문에, Vercel처럼 파일시스템이 매 요청마다 초기화되는 서버리스 환경에는 그대로 배포할 수 없습니다. 아래 중 하나를 선택하세요.

**A. 직접 서버 하나 두고 배포 (가장 간단)**
- Railway, Render, Fly.io, 또는 저렴한 VPS(카페24, Vultr 등)에 Node 서버로 올리기
- `npm run build && npm run start`로 실행, SQLite 파일은 디스크에 그대로 유지됨
- 도메인 `1440unu.com`을 서버 IP로 연결(A 레코드)하거나 플랫폼이 안내하는 CNAME 등록

**B. Vercel처럼 서버리스에 올리고 싶다면**
- SQLite 대신 Postgres(예: Supabase, Neon, Vercel Postgres)로 바꿔야 합니다.
- `prisma/schema.prisma`의 `provider = "sqlite"`를 `"postgresql"`로 바꾸고 `DATABASE_URL`을 해당 서비스 연결 문자열로 교체하면 나머지 코드는 그대로 사용 가능합니다 (Prisma가 대부분 흡수해줌).

## 다음에 고려해볼 것들

- 댓글 스팸 방지(레이트 리밋, 캡차)
- 이미지 업로드
- 태그/카테고리
- RSS 피드
