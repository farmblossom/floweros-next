import Link from "next/link";
import Image from "next/image";

// ── 아이소메트릭 미니맵 헬퍼 (farmblossom-web 포팅) ──────────────
const iP = (x: number, y: number) => ({
  x: 485 + (x - y) * 26,
  y: 85 + (x + y) * 13,
});
const iTile = (x: number, y: number) => {
  const a = iP(x, y), b = iP(x + 1, y), c = iP(x + 1, y + 1), d = iP(x, y + 1);
  return `${a.x},${a.y} ${b.x},${b.y} ${c.x},${c.y} ${d.x},${d.y}`;
};
const iNoise = (x: number, y: number) => ((x * 19 + y * 31 + x * y * 7) % 11 + 11) % 11;

type TileRow = { key: string; points: string; fill: string };
type Tree = { key: string; x: number; y: number; leaf: string; shade: string };
type Sprout = { key: string; x: number; y: number; fill: string };

function ShinwolMiniMap() {
  const tiles: TileRow[] = [];
  const trees: Tree[] = [];

  for (let sum = 0; sum < 27; sum++) {
    for (let x = 0; x < 15; x++) {
      const y = sum - x;
      if (y < 0 || y > 12) continue;
      const n = iNoise(x, y);
      const isWood = y < 2 || x > 12 || (x > 9 && y > 10) || (y > 11 && x < 4);
      let fill: string = isWood
        ? ["#93ad74", "#9aae71", "#7c9a6c"][n % 3]
        : ["#bdba8b", "#cfbf94", "#cab78d"][n % 3];
      if ((x === 7 || x === 8) && y >= 3 && y <= 10) fill = "#d9c4a0";
      tiles.push({ key: `t${x}-${y}`, points: iTile(x, y), fill });
      if (isWood && n > 2 && (x + y) % 2 === 0) {
        const c = iP(x + 0.5, y + 0.5);
        trees.push({ key: `tr${x}-${y}`, x: c.x, y: c.y, leaf: n % 2 ? "#47765a" : "#356d52", shade: n % 3 ? "#79a174" : "#628e66" });
      }
    }
  }
  const b = iP(4.1, 2.2);

  return (
    <svg viewBox="0 0 970 560" width="100%" height="100%" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="bg-shin" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#eaf4da" /><stop offset="1" stopColor="#c6d8bb" />
        </linearGradient>
      </defs>
      <rect width="970" height="560" fill="url(#bg-shin)" />
      <circle cx="800" cy="85" r="62" fill="#fff8d9" opacity=".65" />
      {tiles.map((t) => (
        <polygon key={t.key} points={t.points} fill={t.fill} stroke="#fff5d7" strokeOpacity=".11" strokeWidth="1.2" />
      ))}
      {trees.map((t) => (
        <g key={t.key}>
          <path d={`M${t.x - 2} ${t.y}v-23h5v23Z`} fill="#856744" />
          <circle cx={t.x - 7} cy={t.y - 28} r="13" fill={t.leaf} />
          <circle cx={t.x + 6} cy={t.y - 33} r="15" fill={t.shade} />
          <circle cx={t.x} cy={t.y - 42} r="13" fill={t.leaf} />
        </g>
      ))}
      <g transform={`translate(${b.x} ${b.y})`}>
        <ellipse cx="0" cy="8" rx="37" ry="13" fill="#193b2a" opacity=".18" />
        <path d="M-30 -31L0 -49 30 -31V8L0 26 -30 8Z" fill="#fff2d9" />
        <path d="M-30 -31L0 -49 0 -5 -30 12Z" fill="#e5ccaa" />
        <path d="M0 -49L30 -31V8L0 26Z" fill="#f1dfc1" />
        <path d="M-39 -32L0 -61 39 -32 0 -8Z" fill="#a96d4b" />
      </g>
      <text x="30" y="528" fontSize="11" fontWeight="700" letterSpacing="1.2" fill="#4b7055" opacity=".7">SHINWOL FARM</text>
    </svg>
  );
}

function DeoksanMiniMap() {
  const tiles: TileRow[] = [];
  const sprouts: Sprout[] = [];
  const trees: Tree[] = [];

  for (let sum = 0; sum < 27; sum++) {
    for (let x = 0; x < 15; x++) {
      const y = sum - x;
      if (y < 0 || y > 12) continue;
      const n = iNoise(x, y);
      const isField = x >= 3 && x <= 11 && y >= 2 && y <= 10;
      const isPath = (x === 7 && y >= 2 && y <= 10) || (y === 10 && x >= 3 && x <= 11);
      const fill: string = isField
        ? isPath ? "#ddc69a" : ["#967e57", "#a79064", "#aa976e"][n % 3]
        : ["#8ca775", "#9bb584", "#83a071"][n % 3];
      tiles.push({ key: `t${x}-${y}`, points: iTile(x, y), fill });
      if (isField && !isPath && n !== 0) {
        const c = iP(x + 0.5, y + 0.5);
        sprouts.push({ key: `sp${x}-${y}`, x: c.x, y: c.y - 3, fill: n % 2 ? "#5f995a" : "#79a65c" });
      } else if (!isField && n > 6 && (x + y) % 2 === 0) {
        const c = iP(x + 0.5, y + 0.5);
        trees.push({ key: `tr${x}-${y}`, x: c.x, y: c.y, leaf: "#2a5e1e", shade: "#356728" });
      }
    }
  }
  const b = iP(12.6, 5.5);

  return (
    <svg viewBox="0 0 970 560" width="100%" height="100%" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="bg-deok" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#f2e8cf" /><stop offset="1" stopColor="#d4e2be" />
        </linearGradient>
      </defs>
      <rect width="970" height="560" fill="url(#bg-deok)" />
      <circle cx="800" cy="85" r="62" fill="#fff8d9" opacity=".65" />
      {tiles.map((t) => (
        <polygon key={t.key} points={t.points} fill={t.fill} stroke="#fff5d7" strokeOpacity=".11" strokeWidth="1.2" />
      ))}
      {sprouts.map((s) => (
        <g key={s.key} transform={`translate(${s.x} ${s.y})`}>
          <path d="M0 0V-11" stroke="#4b7950" strokeWidth="2" strokeLinecap="round" />
          <ellipse cx="-5" cy="-8" rx="7" ry="3.8" transform="rotate(28 -5 -8)" fill={s.fill} />
          <ellipse cx="5" cy="-12" rx="7" ry="3.8" transform="rotate(-30 5 -12)" fill="#3a7854" />
        </g>
      ))}
      {trees.map((t) => (
        <g key={t.key}>
          <line x1={t.x} y1={t.y} x2={t.x} y2={t.y - 22} stroke="#5a3a18" strokeWidth="4" strokeLinecap="round" />
          <circle cx={t.x} cy={t.y - 32} r="14" fill={t.leaf} />
          <circle cx={t.x + 7} cy={t.y - 25} r="10" fill={t.shade} />
        </g>
      ))}
      <g transform={`translate(${b.x} ${b.y})`}>
        <ellipse cx="0" cy="8" rx="37" ry="13" fill="#193b2a" opacity=".18" />
        <path d="M-30 -31L0 -49 30 -31V8L0 26 -30 8Z" fill="#fff2d9" />
        <path d="M-30 -31L0 -49 0 -5 -30 12Z" fill="#e5ccaa" />
        <path d="M0 -49L30 -31V8L0 26Z" fill="#f1dfc1" />
        <path d="M-39 -32L0 -61 39 -32 0 -8Z" fill="#a96d4b" />
      </g>
      <text x="30" y="528" fontSize="11" fontWeight="700" letterSpacing="1.2" fill="#4b7055" opacity=".7">DEOKSAN FARM</text>
    </svg>
  );
}

function BrandArtMini() {
  return (
    <svg viewBox="0 0 400 280" width="100%" height="100%" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="bg-brand" cx="48%" cy="36%" r="65%">
          <stop stopColor="#f3ecda" />
          <stop offset="0.7" stopColor="#dce3d2" />
          <stop offset="1" stopColor="#d0d4b8" />
        </radialGradient>
      </defs>
      <rect width="400" height="280" fill="url(#bg-brand)" />
      <circle cx="200" cy="140" r="128" fill="none" stroke="#ffffff8c" strokeWidth="1.3" transform="rotate(-20 200 140)" />
      <circle cx="200" cy="140" r="172" fill="none" stroke="#ffffff55" strokeWidth="1" />
      {/* Plant ✳ */}
      <text x="200" y="118" textAnchor="middle" fontSize="68" fill="#497d56" opacity=".88">✳</text>
      {/* Stem */}
      <rect x="195" y="118" width="10" height="38" rx="5" fill="#5a8a4a" opacity=".6" />
      {/* Brand box */}
      <g transform="translate(200 198) rotate(-8)">
        <rect x="-60" y="-42" width="120" height="74" rx="3" fill="#bf9865" />
        <rect x="-60" y="-42" width="120" height="74" rx="3" fill="none" stroke="#aa8457" strokeWidth="3" />
        <rect x="-60" y="-42" width="120" height="22" rx="3" fill="#d8b584" />
        <rect x="-58" y="-20" width="116" height="2" fill="#b8945a" opacity=".5" />
        <text textAnchor="middle" y="-24" fontSize="10.5" fontWeight="800" fill="#234632" letterSpacing="1.6">꽃폈네</text>
        <text textAnchor="middle" y="6" fontSize="18" fontWeight="800" fill="#234632">꽃폈네</text>
        <rect x="-22" y="15" width="44" height="2" fill="#e6d6ac" />
      </g>
      <text x="380" y="266" textAnchor="end" fontSize="8" fontWeight="700" letterSpacing="1.1" fill="#486e4f">FROM OUR FARM · TO YOUR SEASON</text>
    </svg>
  );
}

// ── 메인 홈페이지 ─────────────────────────────────────────────────
export default function GatewayPage() {
  return (
    <div className="min-h-screen bg-[#fbfaf6] flex flex-col">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-[#fbfaf6]/98 backdrop-blur-xl border-b border-[#e4e6db]">
        <div className="max-w-7xl mx-auto px-5 md:px-10 h-16 flex items-center justify-between">
          <Link href="/" aria-label="꽃폈네 메인">
            <Image src="/assets/brand/logo-farm-blossom.png" alt="꽃폈네 FARMBLOSSOM" width={110} height={36} className="h-9 w-auto rounded-md" priority />
          </Link>
          <nav className="flex items-center gap-6 md:gap-8" aria-label="주요 메뉴">
            <Link href="/farm/sinwol" className="text-[13px] font-bold text-[#5d7364] hover:text-[#19462f] transition-colors">신월농장</Link>
            <Link href="/farm/deoksan" className="text-[13px] font-bold text-[#5d7364] hover:text-[#19462f] transition-colors">덕산농장</Link>
            <Link href="/brand" className="text-[13px] font-bold text-[#5d7364] hover:text-[#19462f] transition-colors">브랜드 안내</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* 히어로 */}
        <section className="text-center px-5 pt-14 pb-10 md:pt-20 md:pb-14">
          <div className="inline-flex items-center gap-2 text-[10px] font-bold tracking-widest text-[#64836d] mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7daa6c] animate-pulse inline-block" />
            WELCOME TO FARMBLOSSOM
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[#193a2a] leading-tight mb-4" style={{ wordBreak: "keep-all" }}>
            농장을 걷고,<br />
            <em className="not-italic text-[#b68d57]">계절의 이야기를</em> 만나다.
          </h1>
          <p className="text-sm md:text-base text-[#627b69] max-w-lg mx-auto leading-relaxed">
            씨앗에서 수확까지. 꽃폈네의 두 농장과 브랜드 이야기 중<br className="hidden md:block" />
            오늘 둘러보고 싶은 공간을 선택해 보세요.
          </p>
          <p className="inline-flex items-center gap-2 mt-5 bg-[#edf2e8] text-[#406c4d] text-xs font-bold px-4 py-2.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7daa6c] inline-block" />
            가상 농장 체험 시제품 · 키보드와 터치로 탐방할 수 있어요
          </p>
        </section>

        {/* 3개 포털 카드 */}
        <section className="px-5 md:px-10 pb-16 max-w-[1500px] mx-auto" aria-label="세 가지 공간 입구">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">

            {/* 01 — 신월농장 */}
            <div className="group border border-[#dfe5d8] rounded-[18px] overflow-hidden bg-white hover:-translate-y-1.5 hover:shadow-2xl hover:border-[#aac7ab] transition-all duration-200 flex flex-col md:flex-col flex-row">
              {/* 비주얼 — 아이소메트릭 미니맵 */}
              <div className="relative h-72 md:h-72 w-[43%] md:w-auto flex-shrink-0 overflow-hidden bg-[#dfeada]">
                <div className="absolute inset-0 group-hover:scale-105 transition-transform duration-500">
                  <ShinwolMiniMap />
                </div>
                <span className="absolute top-4 left-4 bg-white/85 backdrop-blur-sm text-[#375a40] text-[10px] font-bold tracking-widest px-3 py-2 rounded-full">
                  01 / FARM
                </span>
              </div>
              {/* 정보 */}
              <div className="flex flex-col justify-between flex-1 p-6 md:p-7">
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-[#ad8b63]">SHINWOL FARM</span>
                  <h2 className="text-2xl md:text-3xl font-bold text-[#193a2a] tracking-tight mt-2 mb-2">신월농장</h2>
                  <p className="text-sm text-[#6f8275] leading-relaxed">새로운 과원이 만들어지는 기록<br /><span className="text-xs text-[#9aad8f]">경남 밀양시 초동면 신월리 98 · 0.18ha</span></p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {["과원 조성 중", "남서향 경사지", "활엽수림"].map((tag) => (
                      <span key={tag} className="text-[10px] text-[#56745a] bg-[#edf3e8] px-2.5 py-1 rounded-full font-medium">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2 mt-5">
                  <Link href="/world/sinwol" className="flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-[#214c32] text-white text-sm font-bold hover:bg-[#1a3d28] transition-colors">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">3d_rotation</span>
                      3D 농장 탐방
                    </span>
                    <span className="text-base">↗</span>
                  </Link>
                  <Link href="/farm/sinwol" className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#d6e3d2] text-[#51785d] text-sm font-semibold hover:bg-[#f2f7ee] transition-colors">
                    농장 소개 보기
                  </Link>
                </div>
              </div>
            </div>

            {/* 02 — 덕산농장 */}
            <div className="group border border-[#dfe5d8] rounded-[18px] overflow-hidden bg-white hover:-translate-y-1.5 hover:shadow-2xl hover:border-[#c8bb8a] transition-all duration-200 flex flex-col md:flex-col flex-row">
              <div className="relative h-72 md:h-72 w-[43%] md:w-auto flex-shrink-0 overflow-hidden bg-[#e8e4c9]">
                <div className="absolute inset-0 group-hover:scale-105 transition-transform duration-500">
                  <DeoksanMiniMap />
                </div>
                <span className="absolute top-4 left-4 bg-white/85 backdrop-blur-sm text-[#375a40] text-[10px] font-bold tracking-widest px-3 py-2 rounded-full">
                  02 / FARM
                </span>
                <span className="absolute top-4 right-4 flex items-center gap-1 bg-green-400/20 text-green-700 text-[10px] font-bold px-2.5 py-1.5 rounded-full backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                  2027 준비 중
                </span>
              </div>
              <div className="flex flex-col justify-between flex-1 p-6 md:p-7">
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-[#ad8b63]">DEOKSAN FARM</span>
                  <h2 className="text-2xl md:text-3xl font-bold text-[#193a2a] tracking-tight mt-2 mb-2">덕산농장</h2>
                  <p className="text-sm text-[#6f8275] leading-relaxed">감자가 자라고 이야기가 쌓이는 곳<br /><span className="text-xs text-[#9aad8f]">경남 밀양시 덕산리 756 · 봄감자 40팀</span></p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {["봄감자", "고랑 40구획", "참여형 농장"].map((tag) => (
                      <span key={tag} className="text-[10px] text-[#56745a] bg-[#edf3e8] px-2.5 py-1 rounded-full font-medium">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2 mt-5">
                  <Link href="/world/deoksan" className="flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-[#214c32] text-white text-sm font-bold hover:bg-[#1a3d28] transition-colors">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">3d_rotation</span>
                      3D 농장 탐방
                    </span>
                    <span className="text-base">↗</span>
                  </Link>
                  <Link href="/farm/deoksan" className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#d6e3d2] text-[#51785d] text-sm font-semibold hover:bg-[#f2f7ee] transition-colors">
                    농장 소개 보기
                  </Link>
                </div>
              </div>
            </div>

            {/* 03 — 꽃폈네 브랜드 */}
            <div className="group border border-[#dfe5d8] rounded-[18px] overflow-hidden bg-white hover:-translate-y-1.5 hover:shadow-2xl hover:border-[#c8b890] transition-all duration-200 flex flex-col md:flex-col flex-row">
              <div className="relative h-72 md:h-72 w-[43%] md:w-auto flex-shrink-0 overflow-hidden bg-[#e9dfca]">
                <div className="absolute inset-0 group-hover:scale-105 transition-transform duration-500">
                  <BrandArtMini />
                </div>
                <span className="absolute top-4 left-4 bg-white/85 backdrop-blur-sm text-[#5a4a2a] text-[10px] font-bold tracking-widest px-3 py-2 rounded-full">
                  03 / BRAND
                </span>
              </div>
              <div className="flex flex-col justify-between flex-1 p-6 md:p-7">
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-[#ad8b63]">OUR STORY</span>
                  <h2 className="text-2xl md:text-3xl font-bold text-[#193a2a] tracking-tight mt-2 mb-2">꽃폈네 브랜드</h2>
                  <p className="text-sm text-[#6f8275] leading-relaxed">꽃이 피어야 열매를 맺는 이유<br /><span className="text-xs text-[#9aad8f]">퍼뜨기·쑤담이와 함께하는 꽃폈네 이야기</span></p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {["브랜드 철학", "캐릭터 소개", "스토리박스"].map((tag) => (
                      <span key={tag} className="text-[10px] text-[#7a6040] bg-[#f5ece0] px-2.5 py-1 rounded-full font-medium">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2 mt-5">
                  <Link href="/brand" className="flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-[#4a3418] text-white text-sm font-bold hover:bg-[#3a2810] transition-colors">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">auto_stories</span>
                      브랜드 이야기 보기
                    </span>
                    <span className="text-base">↗</span>
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 캐릭터 소개 */}
        <section className="bg-[#f2f7ee] px-5 md:px-10 py-14 border-t border-[#e2e7dc]">
          <div className="max-w-4xl mx-auto">
            <div className="text-[10px] font-bold tracking-widest text-[#64836d] text-center mb-3">OUR CHARACTERS</div>
            <h3 className="text-xl md:text-2xl font-bold text-[#193a2a] text-center mb-8 tracking-tight">농장을 함께 걷는 안내자</h3>
            <div className="grid grid-cols-3 gap-4 md:gap-6 max-w-2xl mx-auto">
              {[
                { src: "/assets/brand/fm-jeong-i.jpg", name: "FM 쩡이", role: "농장 운영자", desc: "실제 농업 판단과 모든 승인을 담당하는 꽃폈네 총괄 농장관리자" },
                { src: "/assets/brand/putteogi-original.jpg", name: "퍼뜨기", role: "고구마 하트잎 캐릭터", desc: "활발하게 농장 구석구석을 안내하는 꽃폈네의 첫 번째 캐릭터" },
                { src: "/assets/brand/ssudami-original.jpg", name: "쑤담이", role: "감자꽃 캐릭터", desc: "차분하게 생육 과정과 농장 이야기를 들려주는 두 번째 캐릭터" },
              ].map((c) => (
                <div key={c.name} className="flex flex-col gap-2.5">
                  <div className="rounded-xl overflow-hidden border border-[#d6e3d2] bg-white aspect-square flex items-center justify-center">
                    <Image src={c.src} alt={c.name} width={160} height={160} className="w-full h-full object-contain" />
                  </div>
                  <div className="font-bold text-[#193a2a] text-sm">{c.name}</div>
                  <div className="text-[10px] text-[#7a9480] font-semibold">{c.role}</div>
                  <div className="text-[11px] text-[#7a8f7a] leading-relaxed hidden md:block">{c.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 하단 안내 */}
        <section className="px-5 py-10 text-center border-t border-[#e2e7dc]">
          <p className="text-sm text-[#8b9a8b] mb-1">계절이 익으면, 꽃폈네가 보내드릴게요.</p>
          <p className="text-[10px] font-bold tracking-widest text-[#b4c0b4]">SCROLL LESS, EXPLORE MORE · 2026</p>
        </section>
      </main>

      {/* 푸터 */}
      <footer className="border-t border-[#e2e7dc] px-5 md:px-10 py-8 bg-[#fbfaf6]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <Image src="/assets/brand/logo-couple.png" alt="꽃폈네 커플 로고" width={80} height={30} className="h-7 w-auto rounded-md mb-3" />
            <p className="text-xs text-[#8b9a8b] max-w-sm leading-relaxed">
              실제 농장 두 곳을 3D로 탐방하고, 계절의 변화를 관찰하며 농작물 기록과 연결되는 참여형 가상농장 플랫폼입니다.
            </p>
            <p className="text-[11px] text-[#b4c0b4] mt-2">© 2027 꽃폈네 · FM 쩡이 운영 · 3D 장면과 샘플 데이터는 2027년 실증을 위한 시뮬레이션입니다</p>
          </div>
          <Link href="/login" className="text-xs text-[#a0b0a0] hover:text-[#56745a] transition-colors">
            관리자 로그인
          </Link>
        </div>
      </footer>
    </div>
  );
}
