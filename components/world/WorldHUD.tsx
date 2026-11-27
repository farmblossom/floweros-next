"use client";
import Link from "next/link";
import Image from "next/image";
import type { WeatherNow } from "@/lib/weather";
import type { PreviewMode } from "./world-mood";

interface WorldHUDProps {
  farmName: string;
  farmId: string;
  isDemo?: boolean;
  walkMode?: boolean;
  onToggleWalkMode?: () => void;
  weather: WeatherNow | null;
  preview: PreviewMode;
  onPreviewChange: (preview: PreviewMode) => void;
  /** 같은 농장에 함께 접속한 방문자 수 (나 포함) */
  visitors?: number;
  presence?: "off" | "connecting" | "live" | "error";
}

const FARMS: { id: "deoksan" | "sinwol"; short: string; full: string }[] = [
  { id: "deoksan", short: "덕산", full: "밀양 덕산농장" },
  { id: "sinwol", short: "신월", full: "신월리 농장" },
];

const PREVIEWS: { id: PreviewMode; label: string; icon: string }[] = [
  { id: "live", label: "실시간", icon: "sensors" },
  { id: "day", label: "낮", icon: "wb_sunny" },
  { id: "sunset", label: "노을", icon: "wb_twilight" },
  { id: "night", label: "밤", icon: "bedtime" },
  { id: "rain", label: "비", icon: "rainy" },
  { id: "snow", label: "눈", icon: "weather_snowy" },
];

export default function WorldHUD({
  farmName,
  farmId,
  isDemo = true,
  walkMode = false,
  onToggleWalkMode,
  weather,
  preview,
  onPreviewChange,
  visitors = 1,
  presence = "off",
}: WorldHUDProps) {
  const live = weather?.source === "open-meteo" && weather.temperature !== null;
  const currentFarm = FARMS.find((f) => f.id === farmId) ?? FARMS[0];

  return (
    <>
      {/* ── 상단 바: 대문 · 농장 전환 · 날씨 · 접속자 · 걷기 ── */}
      <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
        <div className="bg-gradient-to-b from-black/80 via-black/45 to-transparent pb-2.5">
          <div className="flex items-center gap-1.5 px-2 pt-2">
            {/* 농장 선택으로 — 모바일 아이콘 */}
            <Link
              href="/world"
              aria-label="농장 선택으로 이동"
              className="pointer-events-auto flex items-center justify-center w-8 h-8 rounded-full bg-black/55 text-white backdrop-blur-sm hover:bg-black/75 transition-colors sm:hidden"
            >
              <span className="material-symbols-outlined text-[17px]">arrow_back</span>
            </Link>
            {/* 농장 선택 · 처음 화면 — 넓은 화면 */}
            <Link
              href="/world"
              aria-label="농장 선택으로 이동"
              className="pointer-events-auto hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/50 text-white text-xs backdrop-blur-sm hover:bg-black/70 transition-colors"
            >
              <span className="material-symbols-outlined text-[15px]">arrow_back</span>
              농장 선택
            </Link>
            <Link
              href="/"
              aria-label="처음 화면으로 이동"
              title="처음 화면"
              className="pointer-events-auto flex items-center justify-center w-8 h-8 rounded-full bg-black/55 text-white backdrop-blur-sm hover:bg-black/75 transition-colors sm:h-7 sm:w-7"
            >
              <span className="material-symbols-outlined text-[16px]">home</span>
            </Link>
            <Link href="/" aria-label="꽃폈네" className="pointer-events-auto hidden md:flex items-center">
              <Image
                src="/assets/brand/logo-farm-blossom.png"
                alt="꽃폈네"
                width={72}
                height={28}
                className="h-7 w-auto rounded-md opacity-90 hover:opacity-100 transition-opacity"
              />
            </Link>

            {/* 농장 전환 — 모바일에서도 항상 보이는 세그먼트 */}
            <div className="pointer-events-auto flex items-center p-0.5 rounded-full bg-black/55 backdrop-blur-sm">
              {FARMS.map((f) => {
                const active = farmId === f.id;
                return (
                  <Link
                    key={f.id}
                    href={`/world/${f.id}`}
                    aria-current={active ? "page" : undefined}
                    title={f.full}
                    className={`px-3 py-1.5 rounded-full text-[11.5px] font-semibold whitespace-nowrap transition-colors ${
                      active ? "bg-white text-[#23301d]" : "text-white/85 hover:bg-white/15"
                    }`}
                  >
                    {f.short}
                  </Link>
                );
              })}
            </div>

            <div className="flex-1 min-w-0" />

            {/* 실시간 날씨 */}
            <div
              title={
                live
                  ? `밀양시 초동면 실시간 (Open-Meteo) · 관측 ${weather?.observedAt ?? "-"} · 일출 ${weather?.sunrise?.slice(11) ?? "-"} / 일몰 ${weather?.sunset?.slice(11) ?? "-"}`
                  : "날씨 정보를 불러오는 중입니다"
              }
              className="flex items-center gap-1 px-2 py-1.5 rounded-full bg-black/50 text-white text-[11px] backdrop-blur-sm whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[14px]">{weather?.icon ?? "cloud_sync"}</span>
              {live ? (
                <>
                  <span className="font-semibold">{weather?.temperature}°C</span>
                  <span className="hidden sm:inline text-white/85">
                    {weather?.label} · 바람 {weather?.windSpeed}km/h · {weather?.phaseLabel}
                  </span>
                </>
              ) : (
                <span className="text-white/70">날씨…</span>
              )}
            </div>

            {/* 함께 보는 방문자 수 */}
            <div
              title={
                presence === "live"
                  ? "같은 농장에 접속한 방문자끼리 서로의 아바타가 보입니다"
                  : presence === "off"
                    ? "실시간 접속이 설정되지 않아 혼자 둘러보는 중입니다"
                    : presence === "connecting"
                      ? "같은 농장 방문자와 연결하는 중…"
                      : "실시간 연결이 끊겨 혼자 둘러보는 중입니다"
              }
              className="flex items-center gap-1 px-2 py-1.5 rounded-full bg-black/50 text-white text-[11px] backdrop-blur-sm whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[14px]">group</span>
              <span className="font-semibold">{visitors}명</span>
              <span className="hidden sm:inline text-white/60">
                {presence === "live" ? "함께 보는 중" : presence === "connecting" ? "연결 중" : "혼자"}
              </span>
            </div>

            {/* 걷기 / 조감 모드 */}
            {onToggleWalkMode && (
              <button
                onClick={onToggleWalkMode}
                className={`pointer-events-auto flex items-center gap-1 px-2 py-1.5 rounded-full text-[11px] font-semibold backdrop-blur-sm transition-colors ${
                  walkMode ? "bg-primary/90 text-on-primary hover:bg-primary" : "bg-black/50 text-white hover:bg-black/70"
                }`}
                aria-label={walkMode ? "조감 모드로 전환" : "걷기 모드로 전환"}
              >
                <span className="material-symbols-outlined text-[15px]">{walkMode ? "360" : "directions_walk"}</span>
                <span className="hidden sm:inline">{walkMode ? "조감 모드" : "걷기 모드"}</span>
              </button>
            )}
          </div>

          {/* 하늘·시간 미리보기 + 농장 이름 */}
          <div className="mt-1.5 flex items-center gap-1.5 px-2 overflow-x-auto">
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm text-[10px] text-white/70 whitespace-nowrap">
              <span className="material-symbols-outlined text-[12px]">visibility</span>
              {preview === "live" ? "밀양 실제 날씨·시간 반영 중" : `미리보기 · ${PREVIEWS.find((p) => p.id === preview)?.label}`}
            </div>
            <div className="pointer-events-auto flex items-center gap-0.5 p-0.5 rounded-full bg-black/45 backdrop-blur-sm flex-shrink-0">
              {PREVIEWS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onPreviewChange(p.id)}
                  aria-pressed={preview === p.id}
                  className={`flex items-center gap-1 px-1.5 py-1 rounded-full text-[10.5px] transition-colors ${
                    preview === p.id ? "bg-white text-[#23301d] font-bold" : "text-white/80 hover:bg-white/15"
                  }`}
                >
                  <span className="material-symbols-outlined text-[12.5px]">{p.icon}</span>
                  <span className="hidden sm:inline">{p.label}</span>
                </button>
              ))}
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 text-white text-[11px] backdrop-blur-sm whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
              {currentFarm.full}
              {isDemo && farmName ? <span className="text-white/50">· 3D</span> : null}
            </div>
          </div>
        </div>
      </div>

      {/* ── 조작 안내 ── */}
      <div className="hidden sm:flex absolute bottom-5 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <div className="bg-black/60 text-white/90 text-xs px-5 py-2.5 rounded-full backdrop-blur-sm flex items-center gap-3">
          {walkMode ? (
            <>
              <span className="hidden sm:inline">⌨️ WASD / 방향키: 걷기 · Shift: 뛰기 · 드래그: 시점</span>
              <span className="sm:hidden">🕹️ 조이스틱: 걷기 · 드래그: 시점</span>
              <span>🔵 구획·지기 클릭: 현장 정보</span>
            </>
          ) : (
            <>
              <span>🖱️ 드래그: 회전 · 스크롤: 확대</span>
              <span>🔵 마커 클릭: 현장 정보</span>
            </>
          )}
        </div>
      </div>
      <div className="sm:hidden absolute bottom-1 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <div className="bg-black/45 text-white/80 text-[9.5px] px-2.5 py-1 rounded-full backdrop-blur-sm whitespace-nowrap">
          {walkMode ? "조이스틱: 걷기 · 드래그: 시점" : "드래그: 회전 · 두 손가락: 확대"}
        </div>
      </div>
    </>
  );
}
