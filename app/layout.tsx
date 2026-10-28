import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "1440unu.com",
  description: "Hyunho Lee's homepage",
};

// 모든 페이지를 감싸는 루트 레이아웃 (글꼴, 전역 스타일, 푸터). 헤더는 페이지마다 SiteHeader로 직접 넣음
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* 본문 글꼴: Pretendard (한글·영문 같이) */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body>
        <div className="shell">
          {children}

          <footer className="site-footer">
            <span>©1440unu·2026</span>
            <a href="mailto:1440unu@gmail.com">1440unu@gmail.com</a>
          </footer>
        </div>
      </body>
    </html>
  );
}
