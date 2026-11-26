"use client";
import { useWeather } from "@/lib/useWeather";

interface WeatherChipProps {
  /** home: 대문 헤더(밝은 배경) · dark: 3D 월드/오버레이(어두운 배경) */
  variant?: "home" | "dark";
  compact?: boolean;
}

export default function WeatherChip({ variant = "home", compact = false }: WeatherChipProps) {
  const { weather, loading } = useWeather();
  const live = weather?.source === "open-meteo" && weather.temperature !== null;

  const title = live
    ? `밀양시 초동면 실시간 (Open-Meteo) · 관측 ${weather?.observedAt ?? "-"} · 일출 ${weather?.sunrise?.slice(11) ?? "-"} / 일몰 ${weather?.sunset?.slice(11) ?? "-"}`
    : "날씨 정보를 불러오지 못했습니다";

  if (variant === "dark") {
    return (
      <div
        title={title}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 text-white text-sm backdrop-blur-sm"
      >
        <span className="material-symbols-outlined text-[15px]">
          {loading ? "cloud_sync" : weather?.icon ?? "cloud_off"}
        </span>
        {loading ? (
          <span className="text-white/80 text-xs">날씨 불러오는 중</span>
        ) : live ? (
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="font-semibold">{weather?.temperature}°C</span>
            <span className="text-white/85">{weather?.label}</span>
            <span className="text-white/60 text-xs hidden sm:inline">
              바람 {weather?.windSpeed}km/h · {weather?.phaseLabel}
            </span>
          </span>
        ) : (
          <span className="text-white/70 text-xs">날씨 정보 없음</span>
        )}
      </div>
    );
  }

  return (
    <div
      title={title}
      className="flex items-center gap-2 bg-surface-container px-3 py-1.5 rounded-lg"
    >
      <span className="material-symbols-outlined text-primary text-[18px]">
        {loading ? "cloud_sync" : weather?.icon ?? "cloud_off"}
      </span>
      <div className="flex flex-col text-left leading-tight">
        {loading ? (
          <>
            <span className="text-on-surface-variant text-[11px] font-medium">밀양 날씨 불러오는 중</span>
            <span className="text-outline text-[10px]">신월리 · 덕산리</span>
          </>
        ) : live ? (
          <>
            <span className="text-on-surface text-[11px] font-semibold whitespace-nowrap">
              {weather?.place} {weather?.temperature}°C {weather?.label}
            </span>
            <span className="text-outline text-[10px] whitespace-nowrap">
              {compact
                ? `바람 ${weather?.windSpeed}km/h`
                : `바람 ${weather?.windSpeed}km/h · ${weather?.phaseLabel} · 실시간`}
            </span>
          </>
        ) : (
          <>
            <span className="text-on-surface-variant text-[11px] font-medium">날씨 정보 없음</span>
            <span className="text-outline text-[10px]">잠시 후 다시 확인합니다</span>
          </>
        )}
      </div>
    </div>
  );
}
