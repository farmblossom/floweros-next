import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "3D 가상농장",
  description: "꽃폈네 농장을 3D로 직접 탐방해 보세요. 밀양 덕산농장·신월리 농장 조성 준비 중입니다.",
  openGraph: {
    title: "꽃폈네 3D 시뮬레이션 농장",
    description: "꽃폈네 농장을 3D로 직접 걸어 보세요.",
    images: [
      {
        url: "/assets/og/og-world.jpg",
        width: 1200,
        height: 630,
        alt: "꽃폈네 3D 시뮬레이션 농장",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "꽃폈네 3D 시뮬레이션 농장",
    images: ["/assets/og/og-world.jpg"],
  },
};

export default function WorldLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
