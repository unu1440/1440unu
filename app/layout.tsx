import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "1440unu",
  description: "1440unu, 하루 1440분 중 어느 한 순간을 기록하는 블로그",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <div className="shell">
          <header className="site-header">
            <Link className="wordmark" href="/">
              1440<span>unu</span>
            </Link>
            <nav className="site-nav">
              <Link href="/">글</Link>
              <Link href="/about">소개</Link>
            </nav>
          </header>

          <main>{children}</main>

          <footer className="site-footer">
            <span>© 2026 1440unu</span>
            <a href="mailto:hello@1440unu.com">hello@1440unu.com</a>
          </footer>
        </div>
      </body>
    </html>
  );
}
