import Link from "next/link";
import Image from "next/image";

export default function GatewayPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
          <Link href="/" aria-label="꽃폈네 메인으로 이동">
            <Image
              src="/assets/brand/logo-farm-blossom.png"
              alt="꽃폈네 FARM BLOSSOM"
              width={120}
              height={40}
              className="h-10 w-auto rounded-lg"
              priority
            />
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#farms" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">농장 탐방</a>
            <a href="#about" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">참여 안내</a>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* 히어로 — 포스터 + 텍스트 */}
        <section className="bg-gradient-to-b from-surface-container-low to-surface px-4 py-12 md:py-20">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-14">
            {/* 텍스트 */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-container/50 text-on-primary-container text-xs font-semibold mb-6">
                <span className="material-symbols-outlined text-[13px]">eco</span>
                2027 봄 · 밀양 덕산리 봄감자 실증 준비 중
              </div>
              <h1 className="text-4xl md:text-5xl text-on-surface font-bold leading-tight mb-4">
                꽃폈네, 두 농장의<br />계절을 걷다
              </h1>
              <p className="text-on-surface-variant max-w-xl mb-8">
                실제 밀양 덕산리와 신월리 농장을 3D로 탐방하고, 내 감자가 자라는 고랑을 직접 만나보세요.
                퍼뜨기·쑤담이와 함께하는 꽃폈네 가상농장입니다.
              </p>
              <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
                <a href="#farms" className="px-6 py-3 rounded-full bg-primary text-on-primary font-semibold hover:bg-primary/90 transition-colors">
                  농장 선택하기
                </a>
                <a href="#about" className="px-6 py-3 rounded-full bg-surface-container text-on-surface font-semibold hover:bg-surface-container-high transition-colors">
                  참여 안내
                </a>
              </div>
            </div>
            {/* 브랜드 포스터 */}
            <div className="flex-shrink-0">
              <Image
                src="/assets/brand/poster-brand.png"
                alt="꽃폈네 브랜드 포스터 — 자연이 키운 건강한 선물"
                width={240}
                height={360}
                className="rounded-2xl shadow-xl w-44 md:w-56 h-auto"
                priority
              />
            </div>
          </div>
        </section>

        {/* 두 농장 선택 — 핵심 섹션 */}
        <section id="farms" className="px-4 md:px-8 py-16 max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl text-on-surface text-center font-bold mb-3">
            탐방할 농장을 선택하세요
          </h2>
          <p className="text-center text-sm text-on-surface-variant mb-10">
            두 농장은 각각 독립된 3D 공간으로, 서로 다른 지형과 이야기를 가지고 있습니다.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 덕산농장 카드 */}
            <div className="relative rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a1e] via-[#2d5a2d] to-[#4a6243]" />
              <div className="relative z-10 p-7 flex flex-col min-h-[360px] justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-5">
                    <span className="text-4xl">🥔</span>
                    <span className="px-2.5 py-1 rounded-full bg-green-400/20 text-green-300 text-xs font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                      2027 실증 준비 중
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">밀양 덕산농장</h3>
                  <p className="text-white/60 text-xs mb-3 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">location_on</span>
                    경남 밀양시 덕산리
                  </p>
                  <p className="text-white/80 text-sm leading-relaxed mb-5">
                    내 감자 고랑을 만나러 가는 곳. 실제 감자 고랑·농로를 바탕으로 만든 3D 농장. 구역 기록과 성장 이야기.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["봄감자", "고랑 40구획", "부분수확"].map((tag) => (
                      <span key={tag} className="px-2.5 py-1 rounded-full bg-white/10 text-white/70 text-xs">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="mt-6 flex flex-col gap-2">
                  <Link
                    href="/world/deoksan"
                    className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white text-primary font-semibold text-sm hover:bg-white/90 active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">3d_rotation</span>
                    덕산리 3D 농장 들어가기
                    <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                  </Link>
                  <Link
                    href="/farm/deoksan"
                    className="flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-white/10 text-white/80 text-sm hover:bg-white/20 transition-all"
                  >
                    농장 소개 보기
                  </Link>
                </div>
              </div>
            </div>

            {/* 신월리 농장 카드 */}
            <div className="relative rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-[#1a2e18] via-[#263d24] to-[#3a5438]" />
              <div className="relative z-10 p-7 flex flex-col min-h-[360px] justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-5">
                    <span className="text-4xl">🌳</span>
                    <span className="px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold">
                      과원 조성 중
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">신월리 농장</h3>
                  <p className="text-white/60 text-xs mb-3 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">location_on</span>
                    경남 밀양시 신월리 · 약 541평
                  </p>
                  <p className="text-white/80 text-sm leading-relaxed mb-5">
                    한 그루가 자라는 과정을 따라 걷는 곳. 필지·숲·경사지·과원 조성 과정 기반 3D 농장. 조성 기록과 나무 이야기.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["경사지·수목", "과원 조성", "현장 탐방"].map((tag) => (
                      <span key={tag} className="px-2.5 py-1 rounded-full bg-white/10 text-white/70 text-xs">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="mt-6 flex flex-col gap-2">
                  <Link
                    href="/world/sinwol"
                    className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white text-on-surface font-semibold text-sm hover:bg-white/90 active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">3d_rotation</span>
                    신월리 3D 농장 들어가기
                    <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                  </Link>
                  <Link
                    href="/farm/sinwol"
                    className="flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-white/10 text-white/80 text-sm hover:bg-white/20 transition-all"
                  >
                    농장 소개 보기
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 체험 소개 */}
        <section id="about" className="bg-surface-container-low px-4 md:px-8 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl text-on-surface font-bold text-center mb-10">
              꽃폈네 가상농장 체험
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                { icon: "3d_rotation", title: "두 농장 독립 3D", desc: "덕산리와 신월리, 각각 완전히 다른 지형과 공간을 걸어다닐 수 있어요" },
                { icon: "360", title: "360° 현장 사진", desc: "주요 지점에서 실제 현장 사진으로 연결돼요 (자료 준비 중)" },
                { icon: "smartphone", title: "모바일 최적화", desc: "터치로 농장을 탐방할 수 있어요. 저사양 기기에선 2D 대안 모드 제공" },
              ].map((f) => (
                <div key={f.title} className="bg-surface-container rounded-2xl p-5 shadow-sm">
                  <span className="material-symbols-outlined text-primary text-[28px] mb-3 block">{f.icon}</span>
                  <div className="font-semibold text-on-surface mb-2">{f.title}</div>
                  <div className="text-sm text-on-surface-variant">{f.desc}</div>
                </div>
              ))}
            </div>

            {/* 캐릭터 소개 — 실제 에셋 사용 */}
            <div className="mt-10 p-6 bg-surface-container rounded-2xl border border-outline-variant/30">
              <h3 className="font-semibold text-on-surface mb-6">농장 안내 캐릭터</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* FM 쩡이 */}
                <div className="flex flex-col gap-2">
                  <div className="w-full h-36 rounded-xl bg-white overflow-hidden border border-outline-variant/40 flex items-center justify-center">
                    <Image
                      src="/assets/brand/fm-jeong-i.jpg"
                      alt="FM 쩡이 — 꽃폈네 총괄 농장관리자"
                      width={160}
                      height={144}
                      className="h-full w-auto object-contain"
                    />
                  </div>
                  <div className="font-semibold text-on-surface">FM 쩡이</div>
                  <div className="text-xs text-secondary">농장 운영자</div>
                  <div className="text-xs text-on-surface-variant">실제 농업 판단과 모든 승인을 담당하는 꽃폈네 총괄 농장관리자</div>
                </div>

                {/* 퍼뜨기 — 단독 원본 */}
                <div className="flex flex-col gap-2">
                  <div className="w-full h-36 rounded-xl bg-white overflow-hidden border border-outline-variant/40 flex items-center justify-center">
                    <Image
                      src="/assets/brand/putteogi.png"
                      alt="퍼뜨기 — 고구마 하트잎 캐릭터"
                      width={160}
                      height={144}
                      className="h-full w-auto object-contain"
                    />
                  </div>
                  <div className="font-semibold text-on-surface">퍼뜨기</div>
                  <div className="text-xs text-secondary">고구마 하트잎 캐릭터</div>
                  <div className="text-xs text-on-surface-variant">활발하게 농장 구석구석을 안내하는 꽃폈네의 첫 번째 캐릭터</div>
                </div>

                {/* 쑤담이 — 단독 원본 */}
                <div className="flex flex-col gap-2">
                  <div className="w-full h-36 rounded-xl bg-white overflow-hidden border border-outline-variant/40 flex items-center justify-center">
                    <Image
                      src="/assets/brand/ssudami.png"
                      alt="쑤담이 — 감자꽃 캐릭터"
                      width={160}
                      height={144}
                      className="h-full w-auto object-contain"
                    />
                  </div>
                  <div className="font-semibold text-on-surface">쑤담이</div>
                  <div className="text-xs text-secondary">감자꽃 캐릭터</div>
                  <div className="text-xs text-on-surface-variant">차분하게 생육 과정과 농장 이야기를 들려주는 두 번째 캐릭터</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 푸터 */}
      <footer className="bg-surface-container px-4 md:px-8 py-10 border-t border-outline-variant/30">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Image
              src="/assets/brand/logo-couple.png"
              alt="꽃폈네 커플 로고"
              width={80}
              height={32}
              className="h-8 w-auto rounded-md"
            />
          </div>
          <p className="text-sm text-on-surface-variant mb-3">
            실제 농장 두 곳을 3D로 탐방하고, 계절의 변화를 관찰하며, 내 농작물 기록과 연결되는 참여형 가상농장 플랫폼입니다.
          </p>
          <div className="flex items-center gap-4 flex-wrap text-xs text-outline">
            <span>© 2027 꽃폈네 · FM 쩡이 운영</span>
            <span>|</span>
            <span>본 사이트의 3D 장면과 샘플 데이터는 2027년 실증을 위한 시뮬레이션입니다</span>
          </div>
          <div className="mt-4 pt-4 border-t border-outline-variant/30">
            <Link href="/media-content" className="text-xs text-outline hover:text-on-surface-variant transition-colors">
              관리자 센터 →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
