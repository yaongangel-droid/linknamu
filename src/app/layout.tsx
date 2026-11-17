import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import DevInspector from "@/components/DevInspector";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 공유 미리보기(OG) 이미지처럼 상대 경로로 적은 주소를 절대 주소로 바꿀 때 쓰는 기준 주소
const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "링크나무",
  description: "내 모든 링크를 한 페이지에 모아 두고, 하나의 URL로 공유하세요.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        {/* 개발 중에만 보이는 구성요소 선택 도구 (배포 화면에는 포함되지 않음) */}
        {process.env.NODE_ENV === "development" && <DevInspector />}
      </body>
    </html>
  );
}
