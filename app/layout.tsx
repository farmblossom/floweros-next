import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL?.startsWith("https://")
      ? process.env.NEXT_PUBLIC_SITE_URL
      : "https://floweros-next.vercel.app"
  ),
  title: {
    default: "꽃폈네",
    template: "%s — 꽃폈네",
  },
  description: "FM 쩡이와 함께하는 참여형 농장 — 밀양 봄감자를 직접 가꾸는 꽃폈네 디지털 플랫폼",
  openGraph: {
    siteName: "꽃폈네",
    locale: "ko_KR",
    type: "website",
  },
  verification: {
    google: "YFYMtrQ5oVG6nH9GMe2kJfG5GLb1hnjSWcWEZfap-a0",
    other: {
      "naver-site-verification": ["d67f6562c7f171486689c774354ddc007c46f306"],
    },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${plusJakartaSans.variable} ${notoSansKR.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="min-h-full flex flex-col bg-surface text-on-surface">
        {children}
      </body>
    </html>
  );
}
