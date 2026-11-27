import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "꽃폈네 — 어디로 들어가 볼까요?",
  description:
    "밀양 초동면 꽃폈네의 두 갈래 입구. 3D 시뮬레이션 농장을 산책하거나 꽃폈네 홈페이지에서 브랜드 이야기를 만나보세요.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "꽃폈네 — 어디로 들어가 볼까요?",
    description:
      "3D 시뮬레이션 농장과 브랜드 홈페이지, 두 갈래 입구. 밀양 초동면 꽃폈네.",
    url: "/",
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
    title: "꽃폈네 — 어디로 들어가 볼까요?",
    description: "3D 시뮬레이션 농장과 브랜드 홈페이지, 두 갈래 입구.",
    images: ["/assets/og/og-default.jpg"],
  },
};

export default function LandingPage() {
  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden">
      {/* 배경 — 이른 아침 들녘의 빛 */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(120%_85%_at_50%_-15%,#eef5e6_0%,#fff8f5_46%,#f7ece3_100%)]" />
        <div className="absolute -left-28 top-1/4 h-80 w-80 rounded-full bg-primary-fixed/45 blur-3xl" />
        <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-secondary-container/45 blur-3xl" />
      </div>

      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-5 pb-7 pt-9 sm:px-8 sm:pt-10">
        <div className="my-auto w-full">
        {/* 브랜드 */}
        <header className="flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e3d7c8] bg-white/60 px-3 py-1 text-[11px] font-semibold tracking-[0.22em] text-secondary backdrop-blur-sm">
            MIRYANG · CHODONG
          </span>
          <h1
            className="mt-5 text-[27px] font-bold leading-[1.3] tracking-[-0.025em] text-on-surface sm:mt-6 sm:text-[40px] sm:leading-[1.22]"
            style={{ wordBreak: "keep-all" }}
          >
            어디로 들어가 볼까요?
          </h1>
          <p
            className="mt-3 max-w-sm text-[13.5px] leading-[1.75] text-on-surface-variant sm:mt-4 sm:max-w-md sm:text-[15px]"
            style={{ wordBreak: "keep-all" }}
          >
            꽃이 피어야 열매를 맺습니다.
            <br className="sm:hidden" /> 두 갈래 길 중에 하나를 골라 주세요.
          </p>
        </header>

        {/* 두 갈래 입구 */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-11 sm:grid-cols-2 sm:gap-5">
          {/* 1 — 3D 시뮬레이션 농장 */}
          <Link
            href="/world"
            aria-label="3D 시뮬레이션 농장 들어가기"
            className="group relative flex min-h-[196px] flex-col justify-between overflow-hidden rounded-[22px] bg-[#33472c] p-6 text-white shadow-[0_18px_40px_-26px_rgba(40,58,33,0.8)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_54px_-24px_rgba(40,58,33,0.85)] sm:min-h-[292px] sm:p-7"
          >
            <svg
              aria-hidden
              viewBox="0 0 400 200"
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-28 w-full opacity-40 sm:h-36"
            >
              <defs>
                <linearGradient id="land-rye" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#9ecb72" stopOpacity="0.9" />
                  <stop offset="1" stopColor="#4a6243" stopOpacity="0.95" />
                </linearGradient>
              </defs>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <path
                  key={i}
                  d={`M0 ${118 + i * 15} C 90 ${102 + i * 15} 210 ${138 + i * 15} 400 ${110 + i * 15}`}
                  stroke="url(#land-rye)"
                  strokeWidth={i % 2 ? 5 : 9}
                  fill="none"
                  strokeLinecap="round"
                />
              ))}
            </svg>
            <div className="absolute -right-10 -top-12 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

            <div className="relative">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10.5px] font-semibold tracking-wide text-white/90 backdrop-blur-sm">
                <span className="material-symbols-outlined text-[13px]">3d_rotation</span>
                실시간 3D
              </span>
              <h2
                className="mt-4 text-[21px] font-bold leading-[1.32] tracking-[-0.015em] sm:mt-5 sm:text-[26px]"
                style={{ wordBreak: "keep-all" }}
              >
                <span aria-hidden className="mr-1.5">🌾</span>
                3D 시뮬레이션 농장
              </h2>
              <p className="mt-2.5 text-[12.5px] leading-[1.7] text-white/75 sm:text-[13.5px]" style={{ wordBreak: "keep-all" }}>
                신월리 98번지의 호밀밭과 덕산리 봄감자밭을
                <br className="hidden sm:block" /> 직접 걸어 보세요.
              </p>
            </div>

            <div className="relative mt-5 flex items-center justify-between border-t border-white/15 pt-4">
              <span className="text-[12px] font-semibold text-white/85">들어가기 · 신월리 / 덕산</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 transition-transform duration-300 group-hover:translate-x-1 group-hover:bg-white/25">
                <span className="material-symbols-outlined text-[17px]">arrow_forward</span>
              </span>
            </div>
          </Link>

          {/* 2 — 꽃폈네 홈페이지 */}
          <Link
            href="/os"
            aria-label="꽃폈네 홈페이지 바로가기"
            className="group relative flex min-h-[196px] flex-col justify-between overflow-hidden rounded-[22px] border border-[#e8dbcd] bg-[#fdf6ef] p-6 text-on-surface shadow-[0_14px_34px_-28px_rgba(112,85,68,0.5)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_46px_-26px_rgba(112,85,68,0.55)] sm:min-h-[292px] sm:p-7"
          >
            <svg
              aria-hidden
              viewBox="0 0 200 200"
              className="pointer-events-none absolute -bottom-14 -right-12 h-32 w-32 text-[#f2d9c9] opacity-70 sm:h-40 sm:w-40"
            >
              {[0, 72, 144, 216, 288].map((deg) => (
                <ellipse
                  key={deg}
                  cx="100"
                  cy="64"
                  rx="22"
                  ry="35"
                  fill="currentColor"
                  transform={`rotate(${deg} 100 100)`}
                />
              ))}
              <circle cx="100" cy="100" r="15" fill="#e5bda0" />
            </svg>

            <div className="relative">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f0e4d7] px-2.5 py-1 text-[10.5px] font-semibold tracking-wide text-secondary">
                <span className="material-symbols-outlined text-[13px]">auto_stories</span>
                브랜드 홈페이지
              </span>
              <h2
                className="mt-4 text-[21px] font-bold leading-[1.32] tracking-[-0.015em] text-[#2a2119] sm:mt-5 sm:text-[26px]"
                style={{ wordBreak: "keep-all" }}
              >
                <span aria-hidden className="mr-1.5">🌸</span>
                꽃폈네 홈페이지
              </h2>
              <p className="mt-2.5 text-[12.5px] leading-[1.7] text-[#6d5a4b] sm:text-[13.5px]" style={{ wordBreak: "keep-all" }}>
                브랜드 이야기와 농장 소식,
                <br className="hidden sm:block" /> 꽃폈네의 계절을 전합니다.
              </p>
              <ul className="mt-3.5 hidden flex-wrap gap-x-3 gap-y-1.5 sm:flex">
                {["브랜드 이야기", "농장 소식", "계절 기록"].map((item) => (
                  <li key={item} className="flex items-center gap-1 text-[11.5px] text-[#8a7562]">
                    <span aria-hidden className="h-1 w-1 rounded-full bg-[#d8bda6]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative mt-5 flex items-center justify-between border-t border-[#e8dbcd] pt-4">
              <span className="text-[11.5px] font-semibold text-secondary/85">바로가기 · farmblossom.kr</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0e4d7] text-secondary transition-transform duration-300 group-hover:translate-x-1 group-hover:bg-[#e7d7c7]">
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </span>
            </div>
          </Link>
        </div>
        </div>

        {/* 푸터 */}
        <footer className="flex flex-col items-center gap-2.5 pt-7 text-center">
          <p className="text-[10.5px] leading-relaxed text-outline" style={{ wordBreak: "keep-all" }}>
            © 2026 꽃폈네 · FM 쩡이 운영 · 3D 장면과 데이터는 실증을 위한 시뮬레이션입니다
          </p>
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10.5px] font-medium text-outline/75 transition-colors hover:text-secondary"
          >
            <span className="material-symbols-outlined text-[12px]">north_east</span>
            꽃폈네 브랜드 포트폴리오
          </Link>
        </footer>
      </div>
    </main>
  );
}
