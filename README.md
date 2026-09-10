# 1440unu.com

Next.js + SQLite(Prisma) 기반 동적 블로그를 기획 중입니다.

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


## 업데이트 예정

- 댓글 스팸 방지(레이트 리밋, 캡차)
- 이미지 업로드
- 태그/카테고리
- RSS 피드
