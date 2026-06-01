import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import QueryProvider from "@/components/QueryProvider";

const geist = Geist({ subsets: ["latin"] });

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
      <body className={`${geist.className} bg-gray-50 min-h-screen`}>
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
