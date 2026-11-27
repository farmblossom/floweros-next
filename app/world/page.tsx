import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "3D 가상농장 — 농장 선택",
  description:
    "밀양 초동면의 두 농장, 신월리 농장과 덕산 농장 중 하나를 골라 3D로 산책해 보세요.",
  alternates: { canonical: "/world" },
  openGraph: {
    title: "꽃폈네 3D 시뮬레이션 농장",
    description: "신월리 98번지 호밀밭과 덕산 봄감자밭을 직접 걸어 보세요.",
    url: "/world",
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
    description: "호밀밭과 봄감자밭을 3D로 산책.",
    images: ["/assets/og/og-world.jpg"],
  },
};

const FARMS = [
  {
    id: "sinwol",
    name: "신월리 농장",
    english: "Shinwol Farm",
    emoji: "🌾",
    address: "밀양시 초동면 신월리 98",
    note: "호밀을 파종한 밭과 자두 유목, 나무 조성예정지가 있는 0.18ha 과원 조성지입니다.",
    tags: ["호밀밭", "자두 유목", "나무 조성예정지"],
    /** 카드 배경 — 들녘 초록 */
    cardBg: "bg-[#33472c]",
    cardText: "text-white",
    subText: "text-white/75",
    tagClass: "bg-white/12 text-white/90",
    accent: "#8fbf6a",
    href: "/world/sinwol",
  },
  {
    id: "deoksan",
    name: "덕산 농장",
    english: "Deoksan Farm",
    emoji: "🥔",
    address: "밀양시 초동면 덕산리 756",
    note: "2027년 봄감자 40구획을 준비하는 참여형 농장입니다. 고랑마다 참여 팀이 함께 가꿉니다.",
    tags: ["2027 봄감자", "고랑 40구획", "참여형 농장"],
    /** 카드 배경 — 흙과 감자꽃 */
    cardBg: "bg-[#4d3a2a]",
    cardText: "text-white",
    subText: "text-white/75",
    tagClass: "bg-white/12 text-white/90",
    accent: "#d9a86a",
    href: "/world/deoksan",
  },
] as const;

export default function WorldChooserPage() {
  return (
    <main className="relative flex flex-1 flex-col overflow-hidden">
      {/* 배경 */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(115%_80%_at_50%_-15%,#eef5e6_0%,#fff8f5_48%,#f7ece3_100%)]" />
        <div className="absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-primary-fixed/40 blur-3xl" />
        <div className="absolute -right-20 -top-12 h-64 w-64 rounded-full bg-secondary-container/40 blur-3xl" />
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-5 pb-8 pt-7 sm:px-8 sm:pt-9">
        {/* 상단 */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#e4d8ca] bg-white/70 px-3.5 py-2 text-[12px] font-semibold text-secondary backdrop-blur-sm transition-colors hover:bg-white sm:text-[12.5px]"
          >
            <span className="material-symbols-outlined text-[15px]">arrow_back</span>
            처음 화면으로
          </Link>
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.24em] text-outline/80">
            3D Simulation
          </span>
        </div>

        <div className="my-auto w-full">
        {/* 제목 */}
        <header className="mt-7 text-center sm:mt-9">
          <h1
            className="text-[24px] font-bold leading-[1.3] tracking-[-0.02em] text-on-surface sm:text-[34px] sm:leading-[1.26]"
            style={{ wordBreak: "keep-all" }}
          >
            어느 농장으로 들어갈까요?
          </h1>
          <p
            className="mt-3 text-[13px] leading-relaxed text-on-surface-variant sm:text-[14.5px]"
            style={{ wordBreak: "keep-all" }}
          >
            같은 마을, 다른 계절입니다. 걸어 보고 싶은 밭을 골라 주세요.
          </p>
        </header>

        {/* 농장 카드 */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-5">
          {FARMS.map((farm, i) => (
            <Link
              key={farm.id}
              href={farm.href}
              aria-label={`${farm.name} 3D로 들어가기`}
              className={`group relative flex min-h-[244px] flex-col justify-between overflow-hidden rounded-[22px] p-6 shadow-[0_18px_40px_-26px_rgba(40,58,33,0.8)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_54px_-24px_rgba(40,58,33,0.85)] sm:min-h-[344px] sm:p-7 ${farm.cardBg} ${farm.cardText}`}
            >
              {/* 밭고랑 결 */}
              <svg
                aria-hidden
                viewBox="0 0 400 200"
                preserveAspectRatio="none"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-28 w-full opacity-40 sm:h-36"
              >
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <path
                    key={i}
                    d={`M0 ${118 + i * 15} C 90 ${102 + i * 15} 210 ${138 + i * 15} 400 ${110 + i * 15}`}
                    stroke={farm.accent}
                    strokeWidth={i % 2 ? 5 : 9}
                    fill="none"
                    strokeLinecap="round"
                    opacity={0.55}
                  />
                ))}
              </svg>
              <div className="absolute -right-10 -top-12 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

              <div className="relative">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10.5px] font-semibold tracking-wide backdrop-blur-sm ${farm.tagClass}`}>
                  <span aria-hidden>{farm.emoji}</span>0{i + 1} / FARM
                </span>
                <h2 className="mt-4 text-[21px] font-bold leading-snug tracking-[-0.01em] sm:mt-5 sm:text-[26px]">
                  {farm.name}
                </h2>
                <p className={`mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${farm.subText}`}>
                  {farm.english}
                </p>
                <p className={`mt-3 text-[12.5px] leading-relaxed sm:text-[13.5px] ${farm.subText}`} style={{ wordBreak: "keep-all" }}>
                  {farm.address}
                </p>
                <p className={`mt-2.5 text-[12px] leading-[1.7] sm:text-[13px] ${farm.subText}`} style={{ wordBreak: "keep-all" }}>
                  {farm.note}
                </p>
              </div>

              <div className="relative mt-6">
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {farm.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`rounded-full px-2.5 py-1 text-[10.5px] font-semibold ${farm.tagClass}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-white/15 pt-4">
                  <span className="text-[12.5px] font-semibold text-white/90">3D로 들어가기</span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 transition-transform duration-300 group-hover:translate-x-1 group-hover:bg-white/25">
                    <span className="material-symbols-outlined text-[17px]">arrow_forward</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        </div>

        <p className="pt-6 text-center text-[11px] leading-relaxed text-outline" style={{ wordBreak: "keep-all" }}>
          농장 안에서도 언제든 이 화면으로 돌아와 다른 밭으로 옮겨 갈 수 있어요.
        </p>
      </div>
    </main>
  );
}
