"use client";
import Link from "next/link";
import Image from "next/image";
import type { WeatherNow } from "@/lib/weather";
import type { PreviewMode } from "./world-mood";
import { AVATAR_PRESETS, type AvatarPresetId } from "./VisitorAvatar";

interface WorldHUDProps {
  farmName: string;
  farmId: string;
  isDemo?: boolean;
  walkMode?: boolean;
  onToggleWalkMode?: () => void;
  weather: WeatherNow | null;
  preview: PreviewMode;
  onPreviewChange: (preview: PreviewMode) => void;
  avatar: AvatarPresetId;
  onAvatarChange: (avatar: AvatarPresetId) => void;
}

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
  avatar,
  onAvatarChange,
}: WorldHUDProps) {
  const otherFarm =
    farmId === "deoksan" ? { id: "sinwol", name: "신월리 농장" } : { id: "deoksan", name: "밀양 덕산농장" };

  const live = weather?.source === "open-meteo" && weather.temperature !== null;

  return (
    <>
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/65 to-transparent pointer-events-none z-10">
        <div className="flex items-center gap-2">
          <Link href="/" aria-label="꽃폈네 메인으로 이동" className="flex items-center pointer-events-auto">
            <Image
              src="/assets/brand/logo-farm-blossom.png"
              alt="꽃폈네"
              width={72}
              height={28}
              className="h-7 w-auto rounded-md opacity-90 hover:opacity-100 transition-opacity"
            />
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 text-white text-sm backdrop-blur-sm pointer-events-auto hover:bg-black/70 transition-colors"
          >
            <span className="material-symbols-outlined text-[15px]">arrow_back</span>
            대문으로
          </Link>
          <Link
            href={`/world/${otherFarm.id}`}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 text-white text-sm backdrop-blur-sm pointer-events-auto hover:bg-black/70 transition-colors"
          >
            <span className="material-symbols-outlined text-[15px]">swap_horiz</span>
            {otherFarm.name}
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {/* 실시간 날씨 */}
          <div
            title={
              live
                ? `밀양시 초동면 실시간 (Open-Meteo) · 관측 ${weather?.observedAt ?? "-"} · 일출 ${weather?.sunrise?.slice(11) ?? "-"} / 일몰 ${weather?.sunset?.slice(11) ?? "-"}`
                : "날씨 정보를 불러오는 중입니다"
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 text-white text-sm backdrop-blur-sm"
          >
            <span className="material-symbols-outlined text-[15px]">
              {weather?.icon ?? "cloud_sync"}
            </span>
            {live ? (
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="font-semibold">{weather?.temperature}°C</span>
                <span className="text-white/85">{weather?.label}</span>
                <span className="hidden sm:inline text-white/60 text-xs">
                  바람 {weather?.windSpeed}km/h · {weather?.phaseLabel}
                </span>
              </span>
            ) : (
              <span className="text-white/70 text-xs">날씨 불러오는 중</span>
            )}
          </div>

          {/* 걷기 / 조감 모드 토글 */}
          {onToggleWalkMode && (
            <button
              onClick={onToggleWalkMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm backdrop-blur-sm pointer-events-auto transition-colors ${
                walkMode ? "bg-primary/90 text-on-primary hover:bg-primary" : "bg-black/50 text-white hover:bg-black/70"
              }`}
              aria-label={walkMode ? "조감 모드로 전환" : "걷기 모드로 전환"}
            >
              <span className="material-symbols-outlined text-[15px]">{walkMode ? "360" : "directions_walk"}</span>
              <span className="hidden sm:inline">{walkMode ? "조감 모드" : "걷기 모드"}</span>
            </button>
          )}

          {isDemo && (
            <span className="hidden md:inline px-2.5 py-1 rounded-full bg-amber-500/80 text-white text-xs font-semibold backdrop-blur-sm">
              3D 시뮬레이션
            </span>
          )}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 text-white text-sm backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
            {farmName}
          </div>
        </div>
      </div>

      {/* 하늘·시간 미리보기 */}
      <div className="absolute top-16 left-4 z-20 flex flex-col gap-1.5 items-start">
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm text-[10px] text-white/70">
          <span className="material-symbols-outlined text-[12px]">visibility</span>
          {preview === "live" ? "밀양 실제 날씨·시간 반영 중" : `미리보기 · ${PREVIEWS.find((p) => p.id === preview)?.label}`}
        </div>
        <div className="flex items-center gap-1 p-1 rounded-full bg-black/45 backdrop-blur-sm">
          {PREVIEWS.map((p) => (
            <button
              key={p.id}
              onClick={() => onPreviewChange(p.id)}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] transition-colors ${
                preview === p.id ? "bg-white text-[#23301d] font-bold" : "text-white/80 hover:bg-white/15"
              }`}
            >
              <span className="material-symbols-outlined text-[13px]">{p.icon}</span>
              <span className="hidden sm:inline">{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 방문자 아바타 선택 */}
      <div className="absolute bottom-24 right-4 z-20 flex flex-col items-end gap-1.5">
        <span className="text-[10px] text-white/70 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
          방문자 아바타
        </span>
        <div className="flex items-center gap-1 p-1 rounded-full bg-black/45 backdrop-blur-sm">
          {AVATAR_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onAvatarChange(preset.id)}
              title={preset.label}
              aria-label={preset.label}
              className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                avatar === preset.id ? "bg-white text-[#23301d]" : "text-white/80 hover:bg-white/15"
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">{preset.icon}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <div className="bg-black/60 text-white/90 text-xs px-5 py-2.5 rounded-full backdrop-blur-sm flex items-center gap-3">
          {walkMode ? (
            <>
              <span className="hidden sm:inline">⌨️ WASD / 방향키: 걷기 · Shift: 뛰기 · 드래그: 시점</span>
              <span className="sm:hidden">🕹️ 조이스틱: 걷기 · 드래그: 시점</span>
              <span>🔵 구획·지기 클릭: 현장 정보</span>
            </>
          ) : (
            <>
              <span className="hidden sm:inline">🖱️ 드래그: 회전 · 스크롤: 줌 · 우클릭: 이동</span>
              <span className="sm:hidden">👆 드래그: 회전 · 핀치: 줌</span>
              <span>🔵 마커 클릭: 현장 정보</span>
            </>
          )}
        </div>
      </div>
    </>
  );
}
