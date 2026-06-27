import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/layout/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sajudex - 인연록",
  description: "사주 기반 지인 관계 관리 인연록",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "인연록",
    startupImage: [
      "/splash.png"
    ],
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Mobile App Container: Desktop에서는 가운데 정렬된 모바일 화면처럼 보임 */}
        <div className="max-w-md mx-auto bg-white min-h-[100dvh] relative shadow-2xl overflow-hidden flex flex-col">
          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
          
          {/* Fixed Bottom Navigation */}
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
