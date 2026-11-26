import type { DayPhase, WeatherKind } from "@/lib/weather";

export type { FarmId, PlayerPosition, WalkBounds } from "./terrain";
export { FARM_BOUNDS, sinwolHeight, terrainHeight } from "./terrain";

export type PreviewMode = "live" | "day" | "sunset" | "night" | "rain" | "snow";

export interface MoodPreset {
  phase: DayPhase;
  kind: WeatherKind;
  background: string;
  fog: string;
  fogNear: number;
  fogFar: number;
  sunPosition: [number, number, number];
  sunColor: string;
  sunIntensity: number;
  ambientColor: string;
  ambientIntensity: number;
  groundColor: string;
  cloudCount: number;
  cloudColor: string;
  cloudOpacity: number;
  precipitation: "none" | "rain" | "snow";
  stars: boolean;
  useSky: boolean;
  rayleigh: number;
  turbidity: number;
}

const BASE: Record<Exclude<PreviewMode, "live" | "rain" | "snow">, MoodPreset> = {
  day: {
    phase: "day",
    kind: "clear",
    background: "#cfe6f2",
    fog: "#d8e9db",
    fogNear: 42,
    fogFar: 125,
    sunPosition: [0, 84, 52],
    sunColor: "#fff7e2",
    sunIntensity: 1.25,
    ambientColor: "#d3e2f0",
    ambientIntensity: 0.78,
    groundColor: "#8ba169",
    cloudCount: 7,
    cloudColor: "#ffffff",
    cloudOpacity: 0.9,
    precipitation: "none",
    stars: false,
    useSky: true,
    rayleigh: 1.1,
    turbidity: 2.6,
  },
  sunset: {
    phase: "sunset",
    kind: "clear",
    background: "#f0a874",
    fog: "#eab086",
    fogNear: 30,
    fogFar: 88,
    sunPosition: [-110, 18, 40],
    sunColor: "#ff9a5e",
    sunIntensity: 0.95,
    ambientColor: "#d9a08a",
    ambientIntensity: 0.5,
    groundColor: "#7d7a52",
    cloudCount: 11,
    cloudColor: "#f6c8a4",
    cloudOpacity: 0.85,
    precipitation: "none",
    stars: false,
    useSky: true,
    rayleigh: 2.6,
    turbidity: 6.5,
  },
  night: {
    phase: "night",
    kind: "clear",
    background: "#0d1830",
    fog: "#142039",
    fogNear: 20,
    fogFar: 84,
    sunPosition: [34, 46, -26],
    sunColor: "#9db4e6",
    sunIntensity: 0.55,
    ambientColor: "#6577a3",
    ambientIntensity: 0.78,
    groundColor: "#2a3550",
    cloudCount: 5,
    cloudColor: "#2a3a55",
    cloudOpacity: 0.5,
    precipitation: "none",
    stars: true,
    useSky: false,
    rayleigh: 0,
    turbidity: 0,
  },
};

/** 실제 날씨 + 미리보기 모드를 3D 환경 프리셋으로 변환 */
export function resolveMood(
  weatherKind: WeatherKind | undefined,
  phase: DayPhase,
  preview: PreviewMode,
  liveSun: [number, number, number] | null = null
): MoodPreset {
  const previewPhase: "day" | "sunset" | "night" =
    preview === "day" || preview === "sunset" || preview === "night"
      ? preview
      : phase === "sunset"
        ? "sunset"
        : phase === "night"
          ? "night"
          : "day";

  const mood: MoodPreset = { ...BASE[previewPhase] };

  // 실제 시각의 태양 궤적 — 동(+X)에서 떠서 남(+Z)을 지나 서(-X)로 진다
  if (preview === "live" && liveSun) {
    mood.sunPosition = liveSun;
  }

  // 새벽 — 해 뜨기 전 저채도 여명색
  if (preview === "live" && phase === "dawn") {
    mood.phase = "dawn";
    mood.background = "#e2cdbd";
    mood.fog = "#dcc9bb";
    mood.fogNear = 26;
    mood.fogFar = 88;
    mood.sunColor = "#ffc39a";
    mood.sunIntensity = 0.72;
    mood.ambientColor = "#c9c0c8";
    mood.ambientIntensity = 0.55;
    mood.cloudColor = "#e6cfc4";
    mood.cloudCount = 9;
    mood.rayleigh = 2.1;
    mood.turbidity = 5.2;
  }

  if (preview === "rain") {
    return {
      ...mood,
      kind: "rain",
      phase: "day",
      background: "#b3c0c9",
      fog: "#b8c6cf",
      fogNear: 26,
      fogFar: 78,
      sunColor: "#dfe8f2",
      sunIntensity: mood.phase === "night" ? 0.16 : 0.65,
      ambientColor: "#c6d2dc",
      ambientIntensity: mood.phase === "night" ? 0.3 : 0.55,
      cloudCount: 14,
      cloudColor: "#cfd8e0",
      cloudOpacity: 0.96,
      precipitation: "rain",
      useSky: false,
    };
  }

  if (preview === "snow") {
    return {
      ...mood,
      kind: "snow",
      phase: "day",
      background: "#dfe6ee",
      fog: "#e3e9f0",
      fogNear: 24,
      fogFar: 74,
      sunColor: "#eef4fb",
      sunIntensity: 0.7,
      ambientColor: "#e2e9f1",
      ambientIntensity: 0.62,
      cloudCount: 13,
      cloudColor: "#e8eef5",
      cloudOpacity: 0.95,
      precipitation: "snow",
      useSky: false,
    };
  }

  if (preview !== "live") return mood;

  // 실시간: 실제 밀양 날씨 종류 반영
  const kind = weatherKind ?? "clear";
  const isNight = phase === "night";
  const m: MoodPreset = { ...mood };

  switch (kind) {
    case "clear":
      break;
    case "partly":
      m.cloudCount = 10;
      m.cloudOpacity = 0.85;
      m.sunIntensity *= 0.92;
      break;
    case "cloudy":
      m.cloudCount = 16;
      m.cloudColor = isNight ? "#2a3650" : "#dbe1e7";
      m.cloudOpacity = 0.95;
      m.sunIntensity *= 0.6;
      m.ambientIntensity *= 0.85;
      m.background = isNight ? "#0c1424" : "#b9c8d2";
      m.fog = isNight ? "#0f1a2a" : "#c2cdd6";
      m.useSky = false;
      break;
    case "fog":
      m.cloudCount = 12;
      m.fog = isNight ? "#141d2b" : "#d5dce0";
      m.fogNear = 14;
      m.fogFar = 48;
      m.sunIntensity *= 0.45;
      m.ambientIntensity *= 0.9;
      m.useSky = false;
      m.background = isNight ? "#121b28" : "#cdd5d9";
      break;
    case "drizzle":
    case "rain":
    case "shower":
    case "thunder":
      m.precipitation = "rain";
      m.cloudCount = 15;
      m.cloudColor = isNight ? "#25314a" : "#ccd6de";
      m.cloudOpacity = 0.96;
      m.sunIntensity *= 0.55;
      m.background = isNight ? "#0b1220" : "#b3c0c9";
      m.fog = isNight ? "#0d1726" : "#b8c6cf";
      m.fogNear = isNight ? 18 : 26;
      m.fogFar = isNight ? 62 : 78;
      m.useSky = false;
      if (kind === "thunder") m.sunIntensity *= 0.6;
      break;
    case "snow":
      m.precipitation = "snow";
      m.cloudCount = 14;
      m.cloudColor = isNight ? "#2c3955" : "#e6edf4";
      m.cloudOpacity = 0.95;
      m.sunIntensity *= 0.65;
      m.background = isNight ? "#101a2a" : "#dfe6ee";
      m.fog = isNight ? "#131e2e" : "#e3e9f0";
      m.fogNear = isNight ? 16 : 24;
      m.fogFar = isNight ? 58 : 74;
      m.useSky = false;
      break;
  }

  return m;
}
