import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "브랜드 포트폴리오",
  description:
    "꽃폈네가 만든 것들 — 레이저 각인 알루미늄 명함, 크라프트 끈봉투 패키징, 아크릴·3D 프린팅 키링과 MBTI 키캡까지. 밀양 초동면에서 짓는 브랜드의 실물 기록입니다.",
  alternates: { canonical: "/portfolio" },
  openGraph: {
    title: "꽃폈네 브랜드 포트폴리오",
    description: "명함 · 패키징 · 3D 프린팅 굿즈 — 꽃폈네가 손에 쥘 수 있게 만든 것들",
    url: "/portfolio",
    images: [
      {
        url: "/assets/og/og-portfolio.jpg",
        width: 1200,
        height: 630,
        alt: "꽃폈네 브랜드 포트폴리오 — 3D 프린팅 키링, 크라프트 봉투, 알루미늄 명함",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "꽃폈네 브랜드 포트폴리오",
    description: "명함 · 패키징 · 3D 프린팅 굿즈",
    images: ["/assets/og/og-portfolio.jpg"],
  },
};

type Item = {
  src: string;
  alt: string;
  title: string;
  meta: string;
  note: string;
  width: number;
  height: number;
  span?: string;
  tone?: string;
};

const identityItems: Item[] = [
  {
    src: "/assets/portfolio/card-design-a.jpg",
    alt: "꽃폈네 명함 시안 — 꽃 모자를 쓴 농부 일러스트와 브랜드 로고, QR코드",
    title: "명함 시안 A",
    meta: "일러스트 · 인쇄 시안",
    note: "꽃 모자를 쓴 FM 쩡이의 얼굴을 앞세운 기본 시안.",
    width: 1600,
    height: 889,
    span: "sm:col-span-2",
  },
  {
    src: "/assets/portfolio/card-design-b.jpg",
    alt: "꽃폈네 명함 시안 — 감자를 고르는 농부 일러스트와 브랜드 로고",
    title: "명함 시안 B",
    meta: "일러스트 · 인쇄 시안",
    note: "수확한 감자를 고르는 손을 담은 시안.",
    width: 1600,
    height: 889,
    span: "sm:col-span-2",
  },
];

const goodsItems: Item[] = [
  {
    src: "/assets/portfolio/3d-keyring-5.jpg",
    alt: "꽃폈네 캐릭터 5종 3D 프린팅 키링 실물 — 레몬, 고구마, 감자, 퍼뜨기, 쑤담이",
    title: "캐릭터 키링 5종",
    meta: "3D 프린팅 · 실물",
    note: "퍼뜨기·쑤담이를 비롯한 다섯 캐릭터를 그대로 키링으로.",
    width: 836,
    height: 991,
  },
  {
    src: "/assets/portfolio/acrylic-keyring.jpg",
    alt: "꽃폈네 아크릴 키링 2종 실물 — 글로시 마감과 스파클 마감",
    title: "아크릴 키링 2종",
    meta: "아크릴 · 실물",
    note: "같은 그림, 다른 마감 — 맑은 글로시와 반짝이는 스파클.",
    width: 1400,
    height: 905,
  },
  {
    src: "/assets/portfolio/mbti-keycap.jpg",
    alt: "MBTI 3D 프린팅 키캡 블록 4줄 실물 — INTP, ENTP, ENFP, ISTP",
    title: "MBTI 키캡 블록",
    meta: "3D 프린팅 · 실물",
    note: "네 글자를 블록으로 쌓는 키캡 — 파스텔 12색.",
    width: 1400,
    height: 1380,
  },
];

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-[#fbfaf6]">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 border-b border-[#e4e6db] bg-[#fbfaf6]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 md:px-10">
          <Link href="/" aria-label="꽃폈네 메인">
            <Image
              src="/assets/brand/logo-farm-blossom.png"
              alt="꽃폈네"
              width={110}
              height={36}
              className="h-9 w-auto rounded-md"
              priority
            />
          </Link>
          <nav className="flex items-center gap-4 text-sm font-bold text-[#5d7364]">
            <Link href="/os" className="hidden transition-colors hover:text-[#19462f] sm:inline">
              홈페이지
            </Link>
            <Link href="/world" className="hidden transition-colors hover:text-[#19462f] sm:inline">
              3D 농장
            </Link>
            <Link
              href="/"
              className="flex items-center gap-1.5 transition-colors hover:text-[#19462f]"
            >
              <span className="material-symbols-outlined text-[14px]">arrow_back</span>
              돌아가기
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* 히어로 */}
        <section className="border-b border-[#e4e7dd] px-5 pb-14 pt-12 md:px-10 md:pb-20 md:pt-16">
          <div className="mx-auto max-w-6xl">
            <div className="text-[10px] font-bold tracking-[0.22em] text-[#64836d]">
              BRAND PORTFOLIO · 2026
            </div>
            <h1
              className="mt-4 text-[30px] font-bold leading-[1.24] tracking-[-0.02em] text-[#193a2a] md:text-[46px]"
              style={{ wordBreak: "keep-all" }}
            >
              손에 쥘 수 있게 만든 것들
            </h1>
            <p
              className="mt-4 max-w-xl text-[15px] leading-loose text-[#667c6c]"
              style={{ wordBreak: "keep-all" }}
            >
              밀양 초동면의 밭에서 시작해 명함과 봉투, 키링이 되었습니다. 화면 밖에서 만져지고
              건네지는 꽃폈네의 실물 기록입니다.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {["브랜드 아이덴티티", "패키징", "3D 프린팅 굿즈", "실물 사진"].map((t) => (
                <li
                  key={t}
                  className="rounded-full bg-[#ebf1e6] px-3.5 py-1.5 text-[11.5px] font-bold text-[#406548]"
                >
                  {t}
                </li>
              ))}
            </ul>

            {/* 대표 이미지 */}
            <div className="mt-9 overflow-hidden rounded-[22px] border border-[#e6ddcf] bg-white">
              <div className="relative aspect-[4/3] w-full sm:aspect-[16/9]">
                <Image
                  src="/assets/portfolio/kraft-bag.jpg"
                  alt="꽃폈네 크라프트 끈봉투 3종 — 라벨과 끈 마감"
                  fill
                  sizes="(max-width: 768px) 100vw, 1100px"
                  className="object-cover"
                  priority
                />
              </div>
              <div className="flex flex-col gap-1 border-t border-[#efe6d8] px-5 py-4 sm:flex-row sm:items-baseline sm:justify-between">
                <p className="text-[13.5px] font-bold text-[#2a2119]">
                  크라프트 끈봉투 3종
                  <span className="ml-2 font-normal text-[#8a7562]">패키징 · 실물</span>
                </p>
                <p className="text-[12px] text-[#9a8874]">스티커 라벨 · 끈 묶음 마감</p>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-5 md:px-10">
          {/* 01 · 명함 */}
          <section className="border-b border-[#e4e7dd] py-14 md:py-20">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-[190px_1fr] md:gap-14">
              <div>
                <span className="text-[10px] font-bold tracking-[0.18em] text-[#b78b5b]">
                  01 · CARD
                </span>
                <h2
                  className="mt-3 text-[22px] font-bold leading-snug tracking-tight text-[#193a2a] md:text-[27px]"
                  style={{ wordBreak: "keep-all" }}
                >
                  명함
                </h2>
                <p className="mt-3 text-[12.5px] leading-relaxed text-[#7d8e7d]">
                  손으로 그린 일러스트 두 가지와, 레이저로 새긴 알루미늄 명함.
                </p>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {identityItems.map((it) => (
                    <figure key={it.title} className="overflow-hidden rounded-2xl border border-[#e6e2d6] bg-white">
                      <div className="relative aspect-[16/9] w-full">
                        <Image
                          src={it.src}
                          alt={it.alt}
                          fill
                          sizes="(max-width: 640px) 100vw, 420px"
                          className="object-cover"
                        />
                      </div>
                      <figcaption className="px-4 py-3">
                        <p className="text-[13px] font-bold text-[#2a2119]">{it.title}</p>
                        <p className="mt-1 text-[11.5px] text-[#8a7562]">{it.note}</p>
                      </figcaption>
                    </figure>
                  ))}
                </div>

                <figure className="overflow-hidden rounded-2xl border border-[#2b2b2b] bg-[#141414]">
                  <div className="relative aspect-[4/3] w-full sm:aspect-[16/9]">
                    <Image
                      src="/assets/portfolio/aluminum-card.jpg"
                      alt="꽃폈네 알루미늄 레이저 각인 명함 3장 실물 — 블랙 2장과 블루 1장"
                      fill
                      sizes="(max-width: 768px) 100vw, 780px"
                      className="object-contain"
                    />
                  </div>
                  <figcaption className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-baseline sm:justify-between">
                    <p className="text-[13px] font-bold text-white">
                      알루미늄 레이저 각인 명함 3종
                      <span className="ml-2 font-normal text-white/55">실물</span>
                    </p>
                    <p className="text-[11.5px] text-white/45">블랙 2 · 블루 1 · QR 각인</p>
                  </figcaption>
                </figure>
              </div>
            </div>
          </section>

          {/* 02 · 패키징 */}
          <section className="border-b border-[#e4e7dd] py-14 md:py-20">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-[190px_1fr] md:gap-14">
              <div>
                <span className="text-[10px] font-bold tracking-[0.18em] text-[#b78b5b]">
                  02 · PACKAGING
                </span>
                <h2
                  className="mt-3 text-[22px] font-bold leading-snug tracking-tight text-[#193a2a] md:text-[27px]"
                  style={{ wordBreak: "keep-all" }}
                >
                  패키징
                </h2>
                <p className="mt-3 text-[12.5px] leading-relaxed text-[#7d8e7d]">
                  감자를 담아 건네던 봉투를 브랜드의 얼굴로.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <figure className="overflow-hidden rounded-2xl border border-[#e6e2d6] bg-white sm:col-span-2">
                  <div className="relative aspect-[4/3] w-full">
                    <Image
                      src="/assets/portfolio/kraft-bag.jpg"
                      alt="꽃폈네 크라프트 끈봉투 3종 — 대·중·소, 스티커 라벨과 끈 마감"
                      fill
                      sizes="(max-width: 768px) 100vw, 780px"
                      className="object-cover"
                    />
                  </div>
                  <figcaption className="px-4 py-3">
                    <p className="text-[13px] font-bold text-[#2a2119]">
                      크라프트 끈봉투 3종
                      <span className="ml-2 font-normal text-[#8a7562]">대 · 중 · 소</span>
                    </p>
                    <p className="mt-1 text-[11.5px] text-[#8a7562]">
                      퍼뜨기·쑤담이 라벨, 무게 표기란과 QR, 타공 창.
                    </p>
                  </figcaption>
                </figure>
              </div>
            </div>
          </section>

          {/* 03 · 굿즈 */}
          <section className="py-14 md:py-20">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-[190px_1fr] md:gap-14">
              <div>
                <span className="text-[10px] font-bold tracking-[0.18em] text-[#b78b5b]">
                  03 · GOODS
                </span>
                <h2
                  className="mt-3 text-[22px] font-bold leading-snug tracking-tight text-[#193a2a] md:text-[27px]"
                  style={{ wordBreak: "keep-all" }}
                >
                  굿즈
                </h2>
                <p className="mt-3 text-[12.5px] leading-relaxed text-[#7d8e7d]">
                  직접 뽑고 직접 채운 3D 프린팅과 아크릴 굿즈.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {goodsItems.map((it) => (
                  <figure
                    key={it.title}
                    className="flex flex-col overflow-hidden rounded-2xl border border-[#e6e2d6] bg-white"
                  >
                    <div className="relative aspect-square w-full bg-[#f4efe6]">
                      <Image
                        src={it.src}
                        alt={it.alt}
                        fill
                        sizes="(max-width: 640px) 100vw, 260px"
                        className="object-cover"
                      />
                    </div>
                    <figcaption className="flex flex-1 flex-col px-4 py-3">
                      <p className="text-[13px] font-bold text-[#2a2119]">{it.title}</p>
                      <p className="mt-0.5 text-[10.5px] font-semibold tracking-wide text-[#b78b5b]">
                        {it.meta}
                      </p>
                      <p className="mt-2 text-[11.5px] leading-relaxed text-[#8a7562]">{it.note}</p>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* CTA */}
        <section className="bg-[#244d35] px-5 py-14 text-center text-white md:py-18">
          <p
            className="mx-auto max-w-xl text-[21px] font-bold leading-snug tracking-tight md:text-[26px]"
            style={{ wordBreak: "keep-all" }}
          >
            만져 보고 싶은 것이 있다면, 편하게 물어보세요.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a
              href="https://link.inpock.co.kr/farmblossom"
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-[#f8f8ec] px-5 py-3 text-sm font-bold text-[#214b32] transition-colors hover:bg-white"
            >
              인포크링크에서 보기 ↗
            </a>
            <a
              href="https://www.instagram.com/_farmblossom/"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/35 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
            >
              인스타그램 @_farmblossom ↗
            </a>
          </div>
        </section>
      </main>

      {/* 푸터 */}
      <footer className="border-t border-[#e2e7dc] bg-[#fbfaf6] px-5 py-8 md:px-10">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-[12.5px] font-bold text-[#3f5546]">꽃폈네 · farmblossom.kr</p>
            <p className="mt-1 text-[11.5px] leading-relaxed text-[#8a9a8c]">
              밀양 초동면 · FM 쩡이 운영 · 사진은 실제 제작물을 촬영한 것입니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-[11.5px] font-bold text-[#5d7364]">
            <Link href="/os" className="hover:text-[#19462f]">
              홈페이지
            </Link>
            <Link href="/brand" className="hover:text-[#19462f]">
              브랜드 소개
            </Link>
            <Link href="/world" className="hover:text-[#19462f]">
              3D 농장
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
