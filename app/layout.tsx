import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import QueryProvider from "@/components/QueryProvider";

export const metadata: Metadata = {
  title: "청약 대시보드",
  description: "한국부동산원 청약홈 공공데이터 기반 청약 정보 대시보드",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body style={{ background: "var(--bg)", minHeight: "100vh" }}>
        <QueryProvider>
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </QueryProvider>
      </body>
    </html>
  );
}
