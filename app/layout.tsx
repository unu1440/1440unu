
import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";
import PresenceStatus from "@/components/PresenceStatus";

export const metadata: Metadata = {
  title: "1440unu.com",
  description: "lee 1440unu's personal website",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,500;0,600;1,500;1,600&family=Work+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="shell">
          <header className="site-header">
            <Link className="wordmark" href="/">
              1440<span>unu.com</span>
            </Link>
            <nav className="site-nav">
              <PresenceStatus />
              <Link href="/">Tree</Link>
              <Link href="/about">me</Link>
            </nav>
          </header>

          <main>{children}</main>

          <footer className="site-footer">
            <span>©1440unu·2026</span>
            <a href="mailto:1440unu@gmail.com">1440unu@gmail.com</a>
          </footer>
        </div>
      </body>
    </html>
  );
}