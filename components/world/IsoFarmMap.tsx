"use client";
import { useState, useEffect, useRef, useMemo } from "react";

type Farm = "sinwol" | "deoksan";
type Pos = { x: number; y: number };

// ── 아이소메트릭 좌표 헬퍼 ─────────────────────────────────────
const iP = (x: number, y: number) => ({ x: 485 + (x - y) * 26, y: 85 + (x + y) * 13 });
const iTile = (x: number, y: number) => {
  const a = iP(x, y), b = iP(x + 1, y), c = iP(x + 1, y + 1), d = iP(x, y + 1);
  return `${a.x},${a.y} ${b.x},${b.y} ${c.x},${c.y} ${d.x},${d.y}`;
};
const iNoise = (x: number, y: number) => ((x * 19 + y * 31 + x * y * 7) % 11 + 11) % 11;
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

// ── 핫스팟 데이터 (farmblossom-web siteContent.js 기반) ─────────
const HOTSPOTS: Record<Farm, { id: string; x: number; y: number; label: string; category: string; title: string; body: string; status: string }[]> = {
  sinwol: [
    { id: "new-field", x: 5, y: 5, label: "조성 기록", category: "농장 일지", title: "조성 과정을 기록합니다", body: "정리 전후 사진과 작업 내용, 계획 변경 사항을 시간순으로 모을 수 있는 자리입니다. 현재 임업분석 기반 컨셉 맵입니다.", status: "구현 예정" },
    { id: "orchard", x: 9, y: 6, label: "나무 조성예정지", category: "과원 관리", title: "나무 조성예정지", body: "밤나무·상수리나무를 심을 자리입니다. 식재 위치·품종·정식 시기, 생육 관찰 기록을 실제 자료와 연결할 예정입니다.", status: "설계 중" },
    { id: "water", x: 11, y: 9, label: "용수 점검", category: "현장 관리", title: "배수·관수 관리", body: "남서향 경사지(10~15도) 지형과 물길을 검토하고 점검 항목을 정리하는 공간입니다.", status: "구현 예정" },
  ],
  deoksan: [
    { id: "plot-a", x: 4, y: 5, label: "A-01 구역", category: "고랑 안내", title: "고객별 고랑 체험", body: "참여자에게 고랑을 배정하고 재배 사진과 성장일지를 보여 주는 기능을 이 구역부터 검증합니다. A-01 등 구역 표기는 예시이며 실제 배정이 아닙니다.", status: "시제품 계획" },
    { id: "journal", x: 10, y: 5, label: "성장 일지", category: "농장 기록", title: "감자의 성장 이야기", body: "파종·싹트기·생육·수확 기록을 실제 날짜와 사진으로 연결할 수 있습니다.", status: "구현 예정" },
    { id: "harvest", x: 9, y: 9, label: "수확 안내", category: "고객 참여", title: "수확 요청 안내", body: "수확 가능 기간이 열리면 참여 고객이 날짜와 요청 수량을 선택하고 농장 관리자가 승인하는 흐름입니다.", status: "구현 예정" },
  ],
};

const FARM_INFO: Record<Farm, { name: string; english: string; note: string }> = {
  sinwol: { name: "신월농장", english: "SHINWOL FARM", note: "현재 지도는 임업분석 데이터 기반 예시 공간입니다." },
  deoksan: { name: "덕산농장", english: "DEOKSAN FARM", note: "A-01 등 구역 표기는 기능 검증용 예시이며 실제 배정이 아닙니다." },
};

// ── 타일 데이터 빌더 ─────────────────────────────────────────────
type TileEl = { key: string; points: string; fill: string };
type TreeEl = { key: string; cx: number; cy: number; leaf: string; shade: string };
type SproutEl = { key: string; cx: number; cy: number; fill: string; fill2: string };

function buildTiles(farm: Farm) {
  const tiles: TileEl[] = [];
  const trees: TreeEl[] = [];
  const sprouts: SproutEl[] = [];

  for (let sum = 0; sum < 27; sum++) {
    for (let x = 0; x < 15; x++) {
      const y = sum - x;
      if (y < 0 || y > 12) continue;
      const n = iNoise(x, y);

      if (farm === "sinwol") {
        const isWood = y < 2 || x > 12 || (x > 9 && y > 10) || (y > 11 && x < 4);
        // 밭 전체가 호밀밭 — 고랑을 따라 파릇하게 올라온 호밀
        let fill: string = isWood
          ? ["#93ad74", "#9aae71", "#7c9a6c"][n % 3]
          : ["#8cbc57", "#95c562", "#84b350"][n % 3];
        if ((x === 7 || x === 8) && y >= 3 && y <= 10) fill = "#d9c4a0";
        tiles.push({ key: `t${x}${y}`, points: iTile(x, y), fill });
        if (isWood && n > 2 && (x + y) % 2 === 0) {
          const c = iP(x + 0.5, y + 0.5);
          trees.push({ key: `tr${x}${y}`, cx: c.x, cy: c.y, leaf: n % 2 ? "#47765a" : "#356d52", shade: n % 3 ? "#79a174" : "#628e66" });
        } else if (!isWood && y % 2 === 0 && n !== 5) {
          const c = iP(x + 0.5, y + 0.5);
          sprouts.push({ key: `sp${x}${y}`, cx: c.x, cy: c.y, fill: n % 2 ? "#7ab648" : "#8ec95a", fill2: "#6aa838" });
        }
      } else {
        const isField = x >= 3 && x <= 11 && y >= 2 && y <= 10;
        const isPath = (x === 7 && y >= 2 && y <= 10) || (y === 10 && x >= 3 && x <= 11);
        const fill: string = isField
          ? isPath ? "#ddc69a" : ["#967e57", "#a79064", "#aa976e"][n % 3]
          : ["#8ca775", "#9bb584", "#83a071"][n % 3];
        tiles.push({ key: `t${x}${y}`, points: iTile(x, y), fill });
        if (isField && !isPath && n !== 0) {
          const c = iP(x + 0.5, y + 0.5);
          sprouts.push({ key: `sp${x}${y}`, cx: c.x, cy: c.y, fill: n % 2 ? "#5f995a" : "#79a65c", fill2: "#3a7854" });
        } else if (!isField && n > 6 && (x + y) % 2 === 0) {
          const c = iP(x + 0.5, y + 0.5);
          trees.push({ key: `tr${x}${y}`, cx: c.x, cy: c.y, leaf: "#2a5e1e", shade: "#356728" });
        }
      }
    }
  }
  return { tiles, trees, sprouts };
}

// ── 방향 패드 컴포넌트 ────────────────────────────────────────────
function DirectionPad({ onDir }: { onDir: (dx: number, dy: number) => void }) {
  return (
    <div className="grid" style={{ gridTemplateColumns: "repeat(3, 32px)", gridTemplateRows: "repeat(2, 28px)", gap: 3 }}>
      <button aria-label="위" style={{ gridColumn: 2, gridRow: 1 }} onClick={() => onDir(0, -1)}
        className="bg-white border border-[#d6e2d3] rounded-lg text-[#467350] text-base hover:bg-[#e4f0df] flex items-center justify-center">↑</button>
      <button aria-label="왼쪽" style={{ gridColumn: 1, gridRow: 2 }} onClick={() => onDir(-1, 0)}
        className="bg-white border border-[#d6e2d3] rounded-lg text-[#467350] text-base hover:bg-[#e4f0df] flex items-center justify-center">←</button>
      <button aria-label="아래" style={{ gridColumn: 2, gridRow: 2 }} onClick={() => onDir(0, 1)}
        className="bg-white border border-[#d6e2d3] rounded-lg text-[#467350] text-base hover:bg-[#e4f0df] flex items-center justify-center">↓</button>
      <button aria-label="오른쪽" style={{ gridColumn: 3, gridRow: 2 }} onClick={() => onDir(1, 0)}
        className="bg-white border border-[#d6e2d3] rounded-lg text-[#467350] text-base hover:bg-[#e4f0df] flex items-center justify-center">→</button>
    </div>
  );
}

// ── IsoFarmMap 메인 컴포넌트 ─────────────────────────────────────
interface IsoFarmMapProps {
  farm: Farm;
  onClose?: () => void;
}

export default function IsoFarmMap({ farm, onClose }: IsoFarmMapProps) {
  const [pos, setPos] = useState<Pos>({ x: 7, y: 7 });
  const [target, setTarget] = useState<Pos>({ x: 7, y: 7 });
  const [activeId, setActiveId] = useState<string>(HOTSPOTS[farm][0].id);
  const svgRef = useRef<SVGSVGElement>(null);

  // 농장 변경 시 초기화
  useEffect(() => {
    setPos({ x: 7, y: 7 });
    setTarget({ x: 7, y: 7 });
    setActiveId(HOTSPOTS[farm][0].id);
  }, [farm]);

  // 클릭→걷기 애니메이션 (160ms/step)
  useEffect(() => {
    if (pos.x === target.x && pos.y === target.y) return;
    const id = setTimeout(() => {
      setPos((p) => ({
        x: p.x + Math.sign(target.x - p.x),
        y: p.y + Math.sign(target.y - p.y),
      }));
    }, 160);
    return () => clearTimeout(id);
  }, [pos, target]);

  // 키보드 이동
  useEffect(() => {
    const steps: Record<string, [number, number]> = {
      ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
      w: [0, -1], W: [0, -1], s: [0, 1], S: [0, 1], a: [-1, 0], A: [-1, 0], d: [1, 0], D: [1, 0],
    };
    function onKey(e: KeyboardEvent) {
      const el = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName)) return;
      if (!steps[e.key]) return;
      e.preventDefault();
      const [dx, dy] = steps[e.key];
      setTarget((p) => ({ x: clamp(p.x + dx, 0, 14), y: clamp(p.y + dy, 0, 12) }));
      setPos((p) => ({ x: clamp(p.x + dx, 0, 14), y: clamp(p.y + dy, 0, 12) }));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // SVG 클릭 → 아바타 이동
  function moveFromClick(e: React.MouseEvent<SVGSVGElement>) {
    if (!svgRef.current) return;
    if ((e.target as Element).closest("[data-hotspot]")) return;
    const bounds = svgRef.current.getBoundingClientRect();
    const vb = svgRef.current.viewBox.baseVal;
    const sx = (e.clientX - bounds.left) * vb.width / bounds.width;
    const sy = (e.clientY - bounds.top) * vb.height / bounds.height;
    const a = (sx - 485) / 26;
    const b = (sy - 85) / 13;
    setTarget({ x: clamp(Math.round((a + b) / 2), 0, 14), y: clamp(Math.round((b - a) / 2), 0, 12) });
  }

  function moveDpad(dx: number, dy: number) {
    setTarget((p) => ({ x: clamp(p.x + dx, 0, 14), y: clamp(p.y + dy, 0, 12) }));
    setPos((p) => ({ x: clamp(p.x + dx, 0, 14), y: clamp(p.y + dy, 0, 12) }));
  }

  // 타일 데이터 (farm 변경 시에만 재계산)
  const { tiles, trees, sprouts } = useMemo(() => buildTiles(farm), [farm]);

  const spots = HOTSPOTS[farm];
  const active = spots.find((s) => s.id === activeId) ?? spots[0];
  const info = FARM_INFO[farm];
  const bgGrad = farm === "sinwol" ? ["#eaf4da", "#c6d8bb"] : ["#f2e8cf", "#d4e2be"];
  const avatarC = iP(pos.x + 0.5, pos.y + 0.5);

  // 걷는 중 여부 (목적지와 현재 위치가 다를 때)
  const isWalking = pos.x !== target.x || pos.y !== target.y;

  // 건물 위치
  const bldgPos = farm === "sinwol" ? iP(4.1, 2.2) : iP(12.6, 5.5);

  return (
    <div className="fixed inset-0 z-40 bg-[#fbfaf6] flex flex-col">
      {/* 툴바 */}
      <div className="flex justify-between items-center px-4 py-3 bg-[#f8faf5] border-b border-[#dee6d8] text-xs font-bold text-[#40664e] flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-[#7daa6c] animate-pulse inline-block" />
          <span>농장 탐방 데모</span>
          <span className="text-[#91a294] font-normal">{info.name} · 아이소메트릭 2D 맵</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[9px] text-[#a6b2a2] tracking-widest hidden sm:block">FARMBLOSSOM WORLD / 2D v2.0</span>
          {onClose && (
            <button onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#214c32] text-white text-xs font-bold hover:bg-[#1a3d28] transition-colors">
              <span className="material-symbols-outlined text-[13px]">3d_rotation</span>
              3D로 전환
            </button>
          )}
        </div>
      </div>

      {/* 메인 레이아웃 */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/* SVG 맵 패널 */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden border-b lg:border-b-0 lg:border-r border-[#dee6d8]">
          <svg
            ref={svgRef}
            viewBox="0 0 970 560"
            className="w-full flex-1 cursor-crosshair"
            style={{ minHeight: 0 }}
            role="img"
            aria-label={`${info.name} 아이소메트릭 가상 농장 맵`}
            onClick={moveFromClick}
          >
            <defs>
              <linearGradient id={`iso-bg-${farm}`} x1="0" y1="0" x2="1" y2="1">
                <stop stopColor={bgGrad[0]} />
                <stop offset="1" stopColor={bgGrad[1]} />
              </linearGradient>
            </defs>
            <rect width="970" height="560" fill={`url(#iso-bg-${farm})`} />
            <circle cx="800" cy="85" r="62" fill="#fff8d9" opacity=".65" />

            {/* 타일 그라운드 */}
            {tiles.map((t) => (
              <polygon key={t.key} points={t.points} fill={t.fill} stroke="#fff5d7" strokeOpacity=".11" strokeWidth="1.2" />
            ))}

            {/* 싹/작물 */}
            {sprouts.map((s) => (
              <g key={s.key} transform={`translate(${s.cx} ${s.cy - 3})`}>
                <path d="M0 0V-11" stroke="#4b7950" strokeWidth="2" strokeLinecap="round" />
                <ellipse cx="-5" cy="-8" rx="7" ry="3.8" transform="rotate(28 -5 -8)" fill={s.fill} />
                <ellipse cx="5" cy="-12" rx="7" ry="3.8" transform="rotate(-30 5 -12)" fill={s.fill2} />
              </g>
            ))}

            {/* 나무 */}
            {trees.map((t) => (
              <g key={t.key}>
                <path d={`M${t.cx - 2} ${t.cy}v-23h5v23Z`} fill="#856744" />
                <circle cx={t.cx - 7} cy={t.cy - 28} r="13" fill={t.leaf} />
                <circle cx={t.cx + 6} cy={t.cy - 33} r="15" fill={t.shade} />
                <circle cx={t.cx} cy={t.cy - 42} r="13" fill={t.leaf} />
              </g>
            ))}

            {/* 건물 */}
            <g transform={`translate(${bldgPos.x} ${bldgPos.y})`}>
              <ellipse cx="0" cy="8" rx="37" ry="13" fill="#193b2a" opacity=".18" />
              <path d="M-30 -31L0 -49 30 -31V8L0 26 -30 8Z" fill="#fff2d9" />
              <path d="M-30 -31L0 -49 0 -5 -30 12Z" fill="#e5ccaa" />
              <path d="M0 -49L30 -31V8L0 26Z" fill="#f1dfc1" />
              <path d="M-39 -32L0 -61 39 -32 0 -8Z" fill="#a96d4b" />
              <path d="M-30 -31L0 -49 30 -31" stroke="#874e37" strokeWidth="3" fill="none" />
              <path d="M-10 2L-10 19 5 27 5 8Z" fill="#997958" />
            </g>

            {/* 핫스팟 마커 */}
            {spots.map((s, i) => {
              const at = iP(s.x + 0.5, s.y + 0.5);
              const isActive = s.id === activeId;
              return (
                <g key={s.id} data-hotspot="true"
                  transform={`translate(${at.x} ${at.y - 34})`}
                  className="cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); setActiveId(s.id); setTarget({ x: s.x, y: s.y }); }}
                  role="button" tabIndex={0}
                  aria-label={`${s.label} 정보 보기`}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setActiveId(s.id); setTarget({ x: s.x, y: s.y }); } }}
                >
                  <circle r="20" fill="#fffaf0" stroke={isActive ? "#c27b45" : "#42674a"} strokeWidth={isActive ? 3.5 : 2.5} />
                  {isActive && <circle r="24" fill="none" stroke="#c27b4580" strokeWidth="2" />}
                  <text textAnchor="middle" y="6" fontWeight="800" fontSize="15" fill="#244c36" fontFamily="DM Sans,sans-serif">{i + 1}</text>
                  <rect x="-46" y="24" width="92" height="22" rx="11" fill="#fffaf0" opacity=".97" />
                  <text y="39" textAnchor="middle" fontSize="11.5" fontWeight="bold" fill="#244632" fontFamily="system-ui,sans-serif">{s.label}</text>
                </g>
              );
            })}

            {/* 목적지 표시 (걷는 중) */}
            {isWalking && (() => {
              const tc = iP(target.x + 0.5, target.y + 0.5);
              return (
                <g opacity=".7">
                  <circle cx={tc.x} cy={tc.y + 4} r="14" fill="none" stroke="#214c32" strokeWidth="1.5" strokeDasharray="4 3" />
                  <circle cx={tc.x} cy={tc.y + 4} r="4" fill="#214c3240" />
                </g>
              );
            })()}

            {/* 아바타 */}
            <g className="pointer-events-none" filter="drop-shadow(0 2px 1px #264c3340)">
              <g transform={`translate(${avatarC.x} ${avatarC.y - 1})`}>
                <ellipse cx="0" cy="6" rx="14" ry="5" fill="#142e23" opacity=".3" />
                <path d="M-9 -1L-8 -23H8L9 -1Z" fill="#e6c87e" stroke="#3e5c44" strokeWidth="1.8" />
                <path d="M-7 -14L-13 -4M7 -14L13 -4" stroke="#b47a5d" strokeWidth="4" strokeLinecap="round" />
                <circle cx="0" cy="-32" r="13" fill="#d7a881" />
                <path d="M-14 -34q1 -18 14 -16q14 -2 14 16q-7 -9 -14 -7q-8 -2 -14 7" fill="#383a31" />
                <circle cx="-4" cy="-30" r="1.5" fill="#31332f" />
                <circle cx="4" cy="-30" r="1.5" fill="#31332f" />
                <path d="M-3 -25q3 3 6 0" fill="none" stroke="#955b55" strokeWidth="1.3" />
                <path d="M-10 -13h20" stroke="#fff2d5" strokeWidth="2" opacity=".7" />
              </g>
            </g>

            <text x="30" y="528" fontSize="11" fontWeight="700" letterSpacing="1.2" fill="#4b7055" opacity=".7">{info.english}  •  CONCEPT MAP</text>
          </svg>

          {/* 하단 컨트롤 바 */}
          <div className="flex justify-between items-center px-4 py-3 bg-[#f7f9f4] border-t border-[#e4eddd] gap-4 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">🕹️</span>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-[#315e3f]">아바타 이동</span>
                <span className="text-[10px] text-[#849688]">키보드 방향키 / W·A·S·D / 지도 클릭</span>
              </div>
            </div>
            <DirectionPad onDir={moveDpad} />
          </div>
        </div>

        {/* 사이드바 */}
        <aside className="w-full lg:w-72 xl:w-80 flex flex-col bg-white border-t lg:border-t-0 overflow-y-auto flex-shrink-0">
          <div className="px-6 py-5 border-b border-[#edf0e8]">
            <span className="text-[9px] font-bold tracking-widest text-[#b78b5b]">FIELD GUIDE</span>
            <h2 className="text-lg font-bold text-[#193a2a] mt-2 mb-1 tracking-tight">이 공간에서 할 수 있는 일</h2>
            <p className="text-xs text-[#839485] leading-relaxed">번호를 선택하면 해당 위치로 이동합니다.</p>
          </div>

          <div className="px-3 py-2">
            {spots.map((s, i) => (
              <button
                type="button"
                key={s.id}
                className={`w-full flex items-center gap-3 text-left rounded-xl px-3 py-3 transition-colors ${
                  s.id === activeId ? "bg-[#e9f2e6]" : "hover:bg-[#f2f6ed]"
                }`}
                onClick={() => { setActiveId(s.id); setTarget({ x: s.x, y: s.y }); }}
              >
                <span className="text-[11px] font-bold text-[#ac8659] flex-shrink-0 font-mono">0{i + 1}</span>
                <span className="flex-1 flex flex-col gap-0.5">
                  <span className="text-sm font-bold text-[#30563c]">{s.label}</span>
                  <small className="text-[10px] text-[#8b9d8b]">{s.category}</small>
                </span>
                <span className="text-[#87a087] text-base">↗</span>
              </button>
            ))}
          </div>

          <div className="mx-4 mb-3 p-4 border border-[#e1e7d6] bg-[#f8f6ec] rounded-xl">
            <span className="text-[10px] text-[#9d774e] bg-[#ece3d2] rounded-full px-2.5 py-1 font-bold">{active.status}</span>
            <h3 className="text-base font-bold text-[#193a2a] mt-3 mb-2 tracking-tight">{active.title}</h3>
            <p className="text-xs text-[#728475] leading-relaxed">{active.body}</p>
          </div>

          <p className="mx-4 mb-4 text-[10px] text-[#94a094] leading-relaxed">※ {info.note} 고객별 자료 입력·수정 기능은 아직 연결되지 않았습니다.</p>
        </aside>
      </div>
    </div>
  );
}
