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
      : "https://farmblossom.kr"
  ),
  applicationName: "꽃폈네",
  authors: [{ name: "꽃폈네 · FM 쩡이", url: "https://farmblossom.kr" }],
  creator: "꽃폈네",
  publisher: "꽃폈네",
  title: {
    default: "꽃폈네",
    template: "%s — 꽃폈네",
  },
  description: "FM 쩡이와 함께하는 참여형 농장 — 밀양 봄감자를 직접 가꾸는 꽃폈네 디지털 플랫폼",
  keywords: ["꽃폈네", "farmblossom", "밀양 농장", "초동면", "봄감자", "농장 체험", "3D 농장"],
  openGraph: {
    siteName: "꽃폈네",
    locale: "ko_KR",
    type: "website",
    title: "꽃폈네 — 자연이 키운 건강한 선물",
    description:
      "밀양 초동면의 농장과 브랜드. 3D 시뮬레이션 농장을 산책하고, 꽃폈네의 계절과 굿즈를 만나보세요.",
    images: [
      {
        url: "/assets/og/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "꽃폈네 — 자연이 키운 건강한 선물",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "꽃폈네 — 자연이 키운 건강한 선물",
    description:
      "밀양 초동면의 농장과 브랜드. 3D 농장 산책과 꽃폈네의 계절 이야기.",
    images: ["/assets/og/og-default.jpg"],
  },
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" }],
    apple: [{ url: "/favicon.ico" }],
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
