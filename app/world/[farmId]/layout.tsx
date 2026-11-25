import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "3D 가상농장",
  description: "꽃폈네 농장을 3D로 직접 탐방해 보세요. 밀양 덕산농장·신월리 농장 조성 준비 중입니다.",
};

export default function WorldLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
