import Link from "next/link";
import Image from "next/image";

// 재배 과정 4단계 (siteContent.js 반영)
const farmingSteps = [
  { phase: "01", title: "심고", desc: "언제 무엇을 심었는지" },
  { phase: "02", title: "가꾸고", desc: "어떤 과정을 거쳤는지" },
  { phase: "03", title: "수확하고", desc: "언제 수확했는지" },
  { phase: "04", title: "전합니다", desc: "그 계절의 이야기를 함께" },
];

// 운영 시스템 구성안 (siteContent.js 반영, 현재 미구현)
const managementItems = [
  { n: "01", title: "재배·작업 기록", detail: "농장·작목·구역별 작업일, 사진, 관찰 사항" },
  { n: "02", title: "식재·구역 관리", detail: "작물·품종·나무·고랑 위치와 관리 이력" },
  { n: "03", title: "수확·재고 관리", detail: "수확일, 수량, 선별, 출고 기록" },
  { n: "04", title: "고객 참여 관리", detail: "예약, 고객별 구역, 성장일지, 수확 요청" },
  { n: "05", title: "브랜드·상품 관리", detail: "스토리박스, 사진, 상품 정보, QR 기록" },
  { n: "06", title: "운영 지표", detail: "관리시간, 참여율, 상품 판매 지표" },
];

function BrandArtFull() {
  return (
    <div className="relative w-full h-full min-h-[380px] rounded-2xl overflow-hidden" aria-hidden="true"
      style={{ background: "radial-gradient(circle at 48% 36%, #f3ecda, #dce3d2 70%, #d0d4b8)" }}>
      {/* 링 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[310px] h-[310px] rounded-full border border-white/55" style={{ transform: "rotate(-20deg)" }} />
        <div className="absolute w-[420px] h-[420px] rounded-full border border-white/35" />
      </div>
      {/* Plant */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0 pointer-events-none">
        <span className="text-[90px] leading-none text-[#497d56] opacity-90" style={{ textShadow: "5px 6px 0 #2c5a4240" }}>✳</span>
        <div className="relative w-[150px] h-[108px] mt-3" style={{ transform: "rotate(-9deg)" }}>
          <div className="absolute inset-0 rounded-sm" style={{ background: "#bf9865", boxShadow: "10px 14px 0 #a17f54" }} />
          <div className="absolute top-[-28px] left-[-6px] right-0 h-[42px] rounded-sm" style={{ background: "#d8b584", border: "2px solid #bc9766" }} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[22px] font-bold text-[#234632] z-10 tracking-tight">꽃폈네</span>
            <div className="w-14 h-0.5 mt-2" style={{ background: "#e6d6ac" }} />
          </div>
        </div>
      </div>
      <span className="absolute bottom-4 right-5 text-[8px] font-bold tracking-widest text-[#486e4f] text-right leading-relaxed">
        FROM OUR FARM<br />TO YOUR SEASON
      </span>
    </div>
  );
}

export default function BrandPage() {
  return (
    <div className="min-h-screen bg-[#fbfaf6]">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-[#fbfaf6]/98 backdrop-blur-xl border-b border-[#e4e6db]">
        <div className="max-w-7xl mx-auto px-5 md:px-10 h-16 flex items-center justify-between">
          <Link href="/" aria-label="꽃폈네 메인">
            <Image src="/assets/brand/logo-farm-blossom.png" alt="꽃폈네" width={110} height={36} className="h-9 w-auto rounded-md" priority />
          </Link>
          <Link href="/" className="text-sm font-bold text-[#5d7364] hover:text-[#19462f] transition-colors flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            세 공간으로 돌아가기
          </Link>
        </div>
      </header>

      {/* 히어로 */}
      <section className="max-w-6xl mx-auto px-5 md:px-10 pt-12 pb-16 md:pt-16 md:pb-20 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 items-center border-b border-[#e4e7dd]">
        <div>
          <div className="text-[10px] font-bold tracking-widest text-[#64836d] mb-5">ABOUT FARMBLOSSOM</div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#193a2a] leading-tight tracking-tight mb-5" style={{ wordBreak: "keep-all" }}>
            꽃이 피어야<br /><em className="not-italic text-[#b68d57]">열매를 맺습니다.</em>
          </h1>
          <p className="text-[15px] text-[#667c6c] leading-loose max-w-[470px]">
            꽃이 피어야 열매를 맺듯, 한 계절을 정성껏 기록하고 이야기가 있는 농산물을 전합니다.
          </p>
          <div className="mt-5 inline-block bg-[#ebf1e6] text-[#406548] rounded-full px-4 py-2.5 text-xs font-bold">
            한 철의 맛을 오래 기억하도록
          </div>
        </div>
        <BrandArtFull />
      </section>

      <div className="max-w-6xl mx-auto px-5 md:px-10">

        {/* 01 — 우리가 기록하는 이유 */}
        <section className="py-16 md:py-24 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 md:gap-16 border-b border-[#e4e7dd]">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-[#b78b5b]">01 · OUR PHILOSOPHY</span>
            <h2 className="text-2xl md:text-3xl font-bold text-[#193a2a] mt-3 mb-3 tracking-tight leading-tight">우리가<br />기록하는 이유</h2>
          </div>
          <div className="text-[#6e8171] leading-loose text-[15px] space-y-4">
            <p className="text-2xl font-bold text-[#254a33] leading-snug tracking-tight max-w-[540px]" style={{ wordBreak: "keep-all" }}>
              농산물의 가치는 가격표만으로 설명하기 어렵습니다.
            </p>
            <p>언제 심었는지, 어떻게 자랐는지, 언제 수확했는지. 꽃폈네는 농장에서 소비자에게 닿기까지의 이야기를 함께 전하려 합니다.</p>
            <p>재배 과정과 수확일 기록을 기반으로 농산물에 대한 이해와 신뢰를 높이는 것이 브랜드의 출발점입니다.</p>
          </div>
        </section>

        {/* 02 — 흙에서 식탁까지 */}
        <section className="py-16 md:py-24 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 md:gap-16 border-b border-[#e4e7dd]">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-[#b78b5b]">02 · FROM THE FIELD</span>
            <h2 className="text-2xl md:text-3xl font-bold text-[#193a2a] mt-3 tracking-tight leading-tight">흙에서<br />식탁까지</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {farmingSteps.map((s) => (
              <div key={s.phase} className="bg-[#f2f3ea] rounded-2xl p-5 md:p-6">
                <span className="text-[11px] font-bold text-[#a78c60] tracking-widest">{s.phase}</span>
                <div className="text-3xl text-[#6b9b70] my-3">✳</div>
                <h3 className="text-xl font-bold text-[#193a2a] tracking-tight mb-2">{s.title}</h3>
                <p className="text-xs text-[#879688] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 03 — 캐릭터 소개 */}
        <section className="py-16 md:py-24 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 md:gap-16 border-b border-[#e4e7dd]">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-[#b78b5b]">03 · OUR CHARACTERS</span>
            <h2 className="text-2xl md:text-3xl font-bold text-[#193a2a] mt-3 mb-3 tracking-tight leading-tight">농장의 작은<br />안내자</h2>
            <p className="text-xs text-[#7d8e7d] leading-relaxed">원본 캐릭터를 변경하지 않고 그대로 적용합니다.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              {
                src: "/assets/brand/putteogi-original.jpg",
                name: "퍼뜨기",
                role: "고구마 하트잎 캐릭터",
                desc: "활발하게 농장 구석구석을 안내하는 꽃폈네의 첫 번째 캐릭터. 신월리 과원과 덕산리 감자밭을 함께 걸으며 이야기를 전합니다.",
                world: "/world/sinwol",
              },
              {
                src: "/assets/brand/ssudami-original.jpg",
                name: "쑤담이",
                role: "감자꽃 캐릭터",
                desc: "차분하게 생육 과정과 농장 이야기를 들려주는 두 번째 캐릭터. 감자 고랑의 하루하루를 함께 기록합니다.",
                world: "/world/deoksan",
              },
            ].map((c) => (
              <div key={c.name} className="bg-[#f6f7f0] rounded-2xl p-5">
                <div className="rounded-xl overflow-hidden bg-white border border-[#dfe6d8] mb-4 aspect-square flex items-center justify-center">
                  <Image src={c.src} alt={c.name} width={320} height={320} className="w-full h-full object-contain" />
                </div>
                <h3 className="text-xl font-bold text-[#193a2a] tracking-tight mb-1">{c.name}</h3>
                <div className="text-xs font-semibold text-[#7a9480] mb-2">{c.role}</div>
                <p className="text-xs text-[#7d927e] leading-relaxed mb-3">{c.desc}</p>
                <Link href={c.world} className="inline-flex items-center gap-1.5 text-xs font-bold text-[#406c4d] hover:text-[#214c32] transition-colors">
                  <span className="material-symbols-outlined text-[14px]">3d_rotation</span>
                  3D 농장에서 만나기 ↗
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* 04 — 스토리박스 */}
        <section className="py-16 md:py-24 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 md:gap-16 border-b border-[#e4e7dd]">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-[#b78b5b]">04 · STORY BOX</span>
            <h2 className="text-2xl md:text-3xl font-bold text-[#193a2a] mt-3 tracking-tight leading-tight">한 철의 맛을<br />오래 기억하도록</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[0.8fr_1fr] gap-7 items-center">
            <div className="rounded-2xl overflow-hidden bg-[#e9dfca] h-64 md:h-72 flex items-center justify-center">
              <Image src="/assets/brand/poster-brand.png" alt="꽃폈네 브랜드 포스터" width={240} height={340} className="h-full w-auto object-contain" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#254a33] leading-snug tracking-tight mb-4" style={{ wordBreak: "keep-all" }}>
                농산물과 이야기를 함께 담는 스토리박스
              </p>
              <p className="text-sm text-[#748675] leading-loose mb-4">
                농장에서 수확한 작물에 생산·수확 기록과 계절의 이야기를 담습니다. 실제 기록과 상품 정보를 연결하는 형태로 준비합니다.
              </p>
              <div className="flex flex-wrap gap-2 mb-5">
                {["생산 기록", "수확일 정보", "브랜드 스토리"].map((tag) => (
                  <span key={tag} className="text-xs font-bold text-[#56745a] bg-[#edf3e8] px-3 py-1.5 rounded-full">{tag}</span>
                ))}
              </div>
              <div className="text-xs text-[#a18d71] p-3 bg-[#f8f3ec] rounded-xl border border-[#ddd0bb]">
                ※ 판매 기능은 준비 중입니다. 현재 주문·결제는 지원하지 않습니다.
              </div>
            </div>
          </div>
        </section>

        {/* 05 — 고객과 농장이 연결되는 방식 */}
        <section className="py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 md:gap-16">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-[#b78b5b]">05 · FARM CONNECTIONS</span>
              <h2 className="text-2xl md:text-3xl font-bold text-[#193a2a] mt-3 mb-3 tracking-tight leading-tight">고객과 농장이<br />연결되는 방식</h2>
              <p className="text-xs text-[#7d8e7d] leading-relaxed">고객에게 보여주는 이야기와 실제 관리 데이터는 따로 운영합니다.</p>
            </div>
            <div>
              <div className="flex items-center justify-between gap-3 p-4 bg-[#e7eee4] rounded-xl mb-4">
                <span className="text-sm font-bold text-[#376347]">운영자 전용 시스템 구성안</span>
                <span className="text-xs text-[#819682]">※ 기능 설계 목록 · 현재 데이터 저장 없음</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {managementItems.map((m) => (
                  <div key={m.title} className="p-5 bg-white border border-[#e0e8dc] rounded-xl">
                    <span className="text-[11px] font-bold text-[#b18a55] tracking-wider">{m.n}</span>
                    <h3 className="text-base font-bold text-[#193a2a] tracking-tight mt-3 mb-2">{m.title}</h3>
                    <p className="text-xs text-[#88988b] leading-relaxed">{m.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* 엔딩 */}
      <section className="bg-[#244d35] text-white text-center px-5 py-16 md:py-20">
        <div className="text-4xl mb-5">✳</div>
        <p className="text-2xl md:text-3xl font-bold tracking-tight mb-7" style={{ wordBreak: "keep-all" }}>
          계절이 익으면, 꽃폈네가 보내드릴게요.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/farm/sinwol" className="bg-[#f8f8ec] text-[#214b32] px-5 py-3 rounded-full text-sm font-bold hover:bg-white transition-colors">
            신월농장 둘러보기 ↗
          </Link>
          <Link href="/farm/deoksan" className="bg-[#f8f8ec] text-[#214b32] px-5 py-3 rounded-full text-sm font-bold hover:bg-white transition-colors">
            덕산농장 둘러보기 ↗
          </Link>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="border-t border-[#e2e7dc] px-5 md:px-10 py-8 bg-[#fbfaf6] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <Image src="/assets/brand/logo-couple.png" alt="꽃폈네 커플 로고" width={80} height={30} className="h-7 w-auto rounded-md mb-2" />
          <p className="text-[11px] text-[#b4c0b4]">© 2027 꽃폈네 · FM 쩡이 운영</p>
        </div>
        <Link href="/" className="text-xs font-bold text-[#406c4d] hover:text-[#214c32] transition-colors flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[14px]">home</span>
          대문으로 돌아가기
        </Link>
      </footer>
    </div>
  );
}
