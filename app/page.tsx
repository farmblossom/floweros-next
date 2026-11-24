import Link from "next/link";
import Image from "next/image";

// ── 아이소메트릭 미니맵 헬퍼 ──────────────────────────────────────
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
      <text x="200" y="118" textAnchor="middle" fontSize="68" fill="#497d56" opacity=".88">✳</text>
      <rect x="195" y="118" width="10" height="38" rx="5" fill="#5a8a4a" opacity=".6" />
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

// ── 소셜 아이콘 목록 ─────────────────────────────────────────────
const socialLinks = [
  { icon: "article",      title: "네이버 블로그" },
  { icon: "storefront",   title: "스마트스토어" },
  { icon: "groups",       title: "밴드 커뮤니티" },
  { icon: "play_circle",  title: "유튜브" },
  { icon: "photo_camera", title: "인스타그램" },
];

// ── 메인 홈페이지 ────────────────────────────────────────────────
export default function GatewayPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col">

      {/* ── 헤더 (Stitch: 80px, warm shadow) ── */}
      <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(112,85,68,0.06)]">
        <div className="h-20 max-w-[1440px] mx-auto px-5 md:px-[3rem] flex items-center justify-between gap-4">

          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label="꽃폈네 홈">
            <Image
              src="/assets/brand/logo-farm-blossom.png"
              alt=""
              width={36}
              height={36}
              className="w-9 h-9 rounded-lg object-contain"
              priority
            />
            <div className="flex flex-col leading-none">
              <span className="text-primary font-bold tracking-tight text-[17px]">꽃폈네</span>
              <span className="text-on-surface-variant text-[11px] font-medium mt-0.5">Farmblossom OS</span>
            </div>
          </Link>

          {/* 네비게이션 */}
          <nav className="hidden xl:flex items-center gap-1" aria-label="주요 메뉴">
            {[
              { href: "/farm/sinwol",   label: "신월농장" },
              { href: "/farm/deoksan",  label: "덕산농장" },
              { href: "/brand",         label: "브랜드 안내" },
              { href: "/world/deoksan", label: "3D 가상농장" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-3 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors text-[14px] font-medium"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* 우측: 날씨 칩 + 소셜 + 관리자 */}
          <div className="flex items-center gap-2 shrink-0">
            {/* 날씨 — API 미연결, 임의 수치 표시 없음 */}
            <div className="hidden 2xl:flex items-center gap-2 bg-surface-container px-3 py-1.5 rounded-lg">
              <span className="material-symbols-outlined text-outline text-[18px]">cloud_off</span>
              <div className="flex flex-col text-left">
                <span className="text-on-surface-variant text-[11px] font-medium leading-tight">기상청 연동 준비 중</span>
                <span className="text-outline text-[10px] leading-tight">덕산리 현장 관측 예정</span>
              </div>
            </div>

            {/* 소셜 아이콘 — 실제 URL 미확인, 비활성 표시 */}
            <div className="hidden lg:flex items-center gap-0.5 text-on-surface-variant/40" title="SNS 채널 연결 준비 중">
              {socialLinks.map((s) => (
                <span
                  key={s.icon}
                  aria-label={`${s.title} (준비 중)`}
                  className="p-1.5 rounded-full cursor-default select-none"
                >
                  <span className="material-symbols-outlined text-[18px]">{s.icon}</span>
                </span>
              ))}
            </div>

            {/* 관리자 */}
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-on-secondary rounded-lg text-[13px] font-semibold hover:opacity-90 transition-opacity shadow-sm"
            >
              <span className="material-symbols-outlined text-[15px]">tune</span>
              FM 관리자
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">

        {/* ── 히어로 (Stitch: surface-container-low/70, 12칼럼 그리드) ── */}
        <section className="w-full bg-surface-container-low/70 relative overflow-hidden py-10 md:py-16">
          {/* 유기적 블롭 장식 */}
          <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" aria-hidden="true" />
          <div className="absolute left-1/4 bottom-0 w-80 h-80 rounded-full bg-secondary-container/40 blur-3xl pointer-events-none" aria-hidden="true" />

          <div className="max-w-[1440px] mx-auto px-5 md:px-[3rem] relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

              {/* 텍스트 칼럼 (7칼럼) */}
              <div className="lg:col-span-7 flex flex-col items-start">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary-container text-on-secondary-container font-semibold text-[12px] mb-5">
                  <span className="material-symbols-outlined text-[14px]">nest_eco_leaf</span>
                  자연순환 생태농원 · 꽃폈네 (Farmblossom)
                </div>

                {/* 헤드라인: Stitch text-secondary (로암 브라운) */}
                <h1
                  className="text-[30px] md:text-[40px] font-bold leading-tight tracking-[-0.02em] text-secondary mb-5"
                  style={{ wordBreak: "keep-all" }}
                >
                  농장을 걷고,<br />
                  계절의 이야기를 만나다
                </h1>

                <p
                  className="text-[15px] md:text-[16px] text-on-surface-variant leading-relaxed mb-7 max-w-lg"
                  style={{ wordBreak: "keep-all" }}
                >
                  씨앗에서 수확까지, 꽃폈네의 두 농장과 브랜드 이야기를 만나보세요.
                  신월농장·덕산농장을 3D로 탐방하고 캐릭터들의 여정에 함께하세요.
                </p>

                <div className="flex flex-wrap items-center gap-3 mb-7">
                  <Link
                    href="/world/deoksan"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary text-on-primary font-semibold text-[14px] hover:opacity-90 transition-all shadow-md hover:shadow-lg active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[18px]">view_in_ar</span>
                    3D 가상 농장 산책하기
                  </Link>
                  <Link
                    href="/brand"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-surface-container text-on-surface font-semibold text-[14px] hover:bg-surface-container-high transition-all shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[18px]">auto_stories</span>
                    브랜드 이야기
                  </Link>
                </div>

                {/* 실증 목표 안내 — 수치 과장 없음 */}
                <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-surface-container text-on-surface-variant text-[12px] font-medium border border-outline-variant/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse flex-shrink-0" />
                  2027 봄감자 · 밀양 덕산리 · 40팀 참여 목표 (실증 준비 중)
                </div>
              </div>

              {/* 비주얼 칼럼 (5칼럼) */}
              <div className="lg:col-span-5 relative mt-6 lg:mt-0">
                <div className="relative bg-surface rounded-2xl p-6 shadow-[0_8px_32px_-4px_rgba(112,85,68,0.12)] overflow-hidden flex flex-col items-center text-center">
                  <div className="absolute inset-0 bg-gradient-to-b from-surface-container-low/80 via-transparent to-surface-container/40 pointer-events-none" />

                  {/* 브랜드 로고 */}
                  <div className="relative z-10 mb-5">
                    <Image
                      src="/assets/brand/logo-farm-blossom.png"
                      alt="꽃폈네 로고"
                      width={140}
                      height={56}
                      className="h-14 w-auto mx-auto object-contain drop-shadow-sm"
                    />
                  </div>

                  {/* 캐릭터 */}
                  <div className="relative z-10 w-full rounded-xl overflow-hidden bg-surface-container-lowest/90 p-4 shadow-inner">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col items-center gap-2">
                        <Image
                          src="/assets/brand/putteogi-original.jpg"
                          alt="퍼뜨기"
                          width={120}
                          height={120}
                          className="w-full aspect-square object-contain rounded-lg"
                        />
                        <span className="text-secondary text-[12px] font-semibold bg-surface-container-high px-3 py-1 rounded-full">🌱 퍼뜨기</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <Image
                          src="/assets/brand/ssudami-original.jpg"
                          alt="쑤담이"
                          width={120}
                          height={120}
                          className="w-full aspect-square object-contain rounded-lg"
                        />
                        <span className="text-primary text-[12px] font-semibold bg-surface-container-high px-3 py-1 rounded-full">🌸 쑤담이</span>
                      </div>
                    </div>
                  </div>

                  <p className="relative z-10 text-on-surface-variant text-[13px] leading-relaxed mt-4" style={{ wordBreak: "keep-all" }}>
                    꽃폈네의 첫 번째 가족이 되어보세요
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── 세 가지 입구 (3 포털 카드) ── */}
        <section className="w-full py-12 md:py-16 bg-surface" aria-label="세 가지 공간 입구">
          <div className="max-w-[1440px] mx-auto px-5 md:px-[3rem]">

            {/* 섹션 헤더 */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-3">
              <div>
                <span className="text-secondary text-[12px] font-semibold uppercase tracking-wider">두 농장 · 하나의 브랜드</span>
                <h2 className="text-[24px] md:text-[30px] font-bold text-on-surface tracking-tight mt-1" style={{ wordBreak: "keep-all" }}>
                  탐방할 공간을 선택하세요
                </h2>
              </div>
              <p className="text-on-surface-variant text-[14px] max-w-sm leading-relaxed" style={{ wordBreak: "keep-all" }}>
                각 농장을 3D로 탐방하거나 2D 맵으로 직접 걸어보세요
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              {/* 01 — 신월농장 */}
              <div className="group bg-surface-container-low rounded-2xl overflow-hidden shadow-[0_4px_16px_-2px_rgba(112,85,68,0.06)] hover:shadow-[0_8px_32px_-4px_rgba(112,85,68,0.14)] hover:-translate-y-1 transition-all duration-200 flex flex-col">
                <div className="relative h-52 overflow-hidden bg-[#dfeada]">
                  <div className="absolute inset-0 group-hover:scale-105 transition-transform duration-500">
                    <ShinwolMiniMap />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                  <span className="absolute top-3 left-3 bg-surface/85 backdrop-blur-sm text-on-surface text-[10px] font-bold tracking-widest px-3 py-1.5 rounded-full">
                    01 / FARM
                  </span>
                  <span className="absolute bottom-3 right-3 bg-surface/80 backdrop-blur-sm text-on-surface-variant text-[10px] font-medium px-2.5 py-1 rounded-full">
                    신월리 · 0.18ha
                  </span>
                </div>

                <div className="flex flex-col flex-1 p-6">
                  <span className="text-secondary text-[11px] font-bold tracking-widest uppercase">Shinwol Farm</span>
                  <h3 className="text-[22px] font-bold text-on-surface tracking-tight mt-1.5 mb-2">신월농장</h3>
                  <p className="text-on-surface-variant text-[14px] leading-relaxed mb-3" style={{ wordBreak: "keep-all" }}>
                    새로운 과원이 조성 중인 경남 밀양시 초동면의 농장입니다.
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {["과원 조성 중", "남서향 경사지", "활엽수림"].map((tag) => (
                      <span key={tag} className="text-[11px] text-primary bg-primary-fixed/60 px-2.5 py-1 rounded-full font-medium">{tag}</span>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2 mt-auto">
                    <Link
                      href="/world/sinwol"
                      className="flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-primary text-on-primary text-[14px] font-semibold hover:opacity-90 transition-opacity shadow-sm"
                    >
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">3d_rotation</span>
                        3D 농장 탐방
                      </span>
                      <span>↗</span>
                    </Link>
                    <Link
                      href="/farm/sinwol"
                      className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-outline-variant text-on-surface-variant text-[13px] font-medium hover:bg-surface-container transition-colors"
                    >
                      농장 소개 보기
                    </Link>
                  </div>
                </div>
              </div>

              {/* 02 — 덕산농장 */}
              <div className="group bg-surface-container-low rounded-2xl overflow-hidden shadow-[0_4px_16px_-2px_rgba(112,85,68,0.06)] hover:shadow-[0_8px_32px_-4px_rgba(112,85,68,0.14)] hover:-translate-y-1 transition-all duration-200 flex flex-col">
                <div className="relative h-52 overflow-hidden bg-[#e8e4c9]">
                  <div className="absolute inset-0 group-hover:scale-105 transition-transform duration-500">
                    <DeoksanMiniMap />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                  <span className="absolute top-3 left-3 bg-surface/85 backdrop-blur-sm text-on-surface text-[10px] font-bold tracking-widest px-3 py-1.5 rounded-full">
                    02 / FARM
                  </span>
                  <span className="absolute top-3 right-3 flex items-center gap-1 bg-primary-fixed/90 backdrop-blur-sm text-on-primary-fixed text-[10px] font-bold px-2.5 py-1.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    2027 준비 중
                  </span>
                </div>

                <div className="flex flex-col flex-1 p-6">
                  <span className="text-secondary text-[11px] font-bold tracking-widest uppercase">Deoksan Farm</span>
                  <h3 className="text-[22px] font-bold text-on-surface tracking-tight mt-1.5 mb-2">덕산농장</h3>
                  <p className="text-on-surface-variant text-[14px] leading-relaxed mb-3" style={{ wordBreak: "keep-all" }}>
                    감자가 자라고 이야기가 쌓이는 밀양 덕산리의 주요 운영 농장입니다.
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {["봄감자", "고랑 40구획", "참여형 농장"].map((tag) => (
                      <span key={tag} className="text-[11px] text-secondary bg-secondary-container/50 px-2.5 py-1 rounded-full font-medium">{tag}</span>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2 mt-auto">
                    <Link
                      href="/world/deoksan"
                      className="flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-primary text-on-primary text-[14px] font-semibold hover:opacity-90 transition-opacity shadow-sm"
                    >
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">3d_rotation</span>
                        3D 농장 탐방
                      </span>
                      <span>↗</span>
                    </Link>
                    <Link
                      href="/farm/deoksan"
                      className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-outline-variant text-on-surface-variant text-[13px] font-medium hover:bg-surface-container transition-colors"
                    >
                      농장 소개 보기
                    </Link>
                  </div>
                </div>
              </div>

              {/* 03 — 꽃폈네 브랜드 */}
              <div className="group bg-surface-container-low rounded-2xl overflow-hidden shadow-[0_4px_16px_-2px_rgba(112,85,68,0.06)] hover:shadow-[0_8px_32px_-4px_rgba(112,85,68,0.14)] hover:-translate-y-1 transition-all duration-200 flex flex-col">
                <div className="relative h-52 overflow-hidden bg-surface-container">
                  <div className="absolute inset-0 group-hover:scale-105 transition-transform duration-500">
                    <BrandArtMini />
                  </div>
                  <span className="absolute top-3 left-3 bg-surface/85 backdrop-blur-sm text-on-surface text-[10px] font-bold tracking-widest px-3 py-1.5 rounded-full">
                    03 / BRAND
                  </span>
                </div>

                <div className="flex flex-col flex-1 p-6">
                  <span className="text-secondary text-[11px] font-bold tracking-widest uppercase">Our Brand</span>
                  <h3 className="text-[22px] font-bold text-on-surface tracking-tight mt-1.5 mb-2">꽃폈네 브랜드</h3>
                  <p className="text-on-surface-variant text-[14px] leading-relaxed mb-3" style={{ wordBreak: "keep-all" }}>
                    꽃이 피어야 열매를 맺는 이유. 퍼뜨기·쑤담이와 꽃폈네의 이야기를 만나보세요.
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {["브랜드 철학", "캐릭터 소개", "스토리박스"].map((tag) => (
                      <span key={tag} className="text-[11px] text-tertiary bg-tertiary-fixed/40 px-2.5 py-1 rounded-full font-medium">{tag}</span>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2 mt-auto">
                    <Link
                      href="/brand"
                      className="flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-secondary text-on-secondary text-[14px] font-semibold hover:opacity-90 transition-opacity shadow-sm"
                    >
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">auto_stories</span>
                        브랜드 이야기 보기
                      </span>
                      <span>↗</span>
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── FM 쩡이 소개 (소형) ── */}
        <section className="w-full bg-surface-container py-10 border-t border-outline-variant/20">
          <div className="max-w-[1440px] mx-auto px-5 md:px-[3rem]">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
              <div className="flex items-center gap-4 shrink-0">
                <Image
                  src="/assets/brand/fm-jeong-i.jpg"
                  alt="FM 쩡이 농장관리자"
                  width={56}
                  height={56}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-primary-fixed"
                />
                <div>
                  <div className="text-on-surface font-bold text-[15px]">FM 쩡이</div>
                  <div className="text-on-surface-variant text-[12px]">꽃폈네 농장관리자 · 운영 총괄</div>
                </div>
              </div>
              <p className="text-on-surface-variant text-[14px] leading-relaxed max-w-xl" style={{ wordBreak: "keep-all" }}>
                실제 농장의 모든 판단과 승인을 담당하는 꽃폈네 총괄 농장관리자입니다.
                두 농장의 성장 과정을 직접 기록하고 함께 나눕니다.
              </p>
              <Link
                href="/brand"
                className="ml-auto shrink-0 text-primary text-[13px] font-semibold hover:underline hidden md:block"
              >
                꽃폈네 이야기 →
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* ── 푸터 ── */}
      <footer className="border-t border-outline-variant/30 px-5 md:px-[3rem] py-10 bg-surface-container-low">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <Image
              src="/assets/brand/logo-couple.png"
              alt="꽃폈네 커플 로고"
              width={80}
              height={30}
              className="h-7 w-auto rounded-md mb-3"
            />
            <p className="text-on-surface-variant text-[13px] max-w-sm leading-relaxed" style={{ wordBreak: "keep-all" }}>
              실제 농장 두 곳을 3D로 탐방하고, 계절의 변화를 관찰하는 참여형 가상농장 플랫폼입니다.
            </p>
            <p className="text-outline text-[11px] mt-2">
              © 2027 꽃폈네 · FM 쩡이 운영 · 3D 장면과 샘플 데이터는 2027년 실증을 위한 시뮬레이션입니다
            </p>
          </div>
          <Link href="/login" className="text-on-surface-variant hover:text-on-surface text-[12px] transition-colors">
            관리자 로그인 →
          </Link>
        </div>
      </footer>

    </div>
  );
}
