// 밀양 초동면(신월리·덕산리) 실시간 날씨 — Open-Meteo (API 키 불필요)
// 좌표: 밀양시 초동면 일대 (신월리 98번지 · 덕산리 756번지 기준)

export const MILYANG = {
  latitude: 35.42,
  longitude: 128.69,
  place: "밀양 초동",
} as const;

export type DayPhase = "dawn" | "day" | "sunset" | "night";

export type WeatherKind =
  | "clear"
  | "partly"
  | "cloudy"
  | "fog"
  | "drizzle"
  | "rain"
  | "shower"
  | "snow"
  | "thunder";

export interface WeatherNow {
  place: string;
  temperature: number | null;
  humidity: number | null;
  windSpeed: number | null;
  weatherCode: number | null;
  isDay: boolean;
  kind: WeatherKind;
  label: string;
  icon: string;
  phase: DayPhase;
  phaseLabel: string;
  sunrise: string | null;
  sunset: string | null;
  observedAt: string | null;
  fetchedAt: string;
  source: "open-meteo" | "unavailable";
}

export const PHASE_LABEL: Record<DayPhase, string> = {
  dawn: "새벽",
  day: "낮",
  sunset: "노을",
  night: "밤",
};

/** WMO weather code → 꽃폈네 표기(한글 + Material Symbols 이름) */
export function describeWeatherCode(code: number | null, isDay = true): {
  kind: WeatherKind;
  label: string;
  icon: string;
} {
  const c = code ?? 0;
  if (c === 0) return { kind: "clear", label: "맑음", icon: isDay ? "wb_sunny" : "clear_night" };
  if (c === 1) return { kind: "partly", label: "대체로 맑음", icon: isDay ? "partly_cloudy_day" : "nights_stay" };
  if (c === 2) return { kind: "partly", label: "구름 조금", icon: isDay ? "partly_cloudy_day" : "nights_stay" };
  if (c === 3) return { kind: "cloudy", label: "흐림", icon: "cloud" };
  if (c === 45 || c === 48) return { kind: "fog", label: "안개", icon: "foggy" };
  if (c >= 51 && c <= 57) return { kind: "drizzle", label: "이슬비", icon: "rainy" };
  if (c >= 61 && c <= 65) return { kind: "rain", label: "비", icon: "rainy" };
  if (c === 66 || c === 67) return { kind: "rain", label: "어는 비", icon: "rainy" };
  if (c >= 71 && c <= 77) return { kind: "snow", label: "눈", icon: "weather_snowy" };
  if (c >= 80 && c <= 82) return { kind: "shower", label: "소나기", icon: "rainy" };
  if (c === 85 || c === 86) return { kind: "snow", label: "눈 소나기", icon: "weather_snowy" };
  if (c >= 95) return { kind: "thunder", label: "천둥·번개", icon: "thunderstorm" };
  return { kind: "clear", label: "맑음", icon: isDay ? "wb_sunny" : "clear_night" };
}

function parseSeoulTime(value: string | null | undefined): Date | null {
  if (!value) return null;
  const d = new Date(`${value}:00+09:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** 한국 시각 + 일출·일몰로 낮/노을/밤/새벽 판정 */
export function resolvePhase(
  now: Date,
  sunrise: string | null,
  sunset: string | null,
  isDay: boolean
): DayPhase {
  const rise = parseSeoulTime(sunrise);
  const set = parseSeoulTime(sunset);
  const t = now.getTime();

  if (set) {
    const setT = set.getTime();
    if (t >= setT - 45 * 60 * 1000 && t <= setT + 25 * 60 * 1000) return "sunset";
  }
  if (rise) {
    const riseT = rise.getTime();
    if (t >= riseT - 30 * 60 * 1000 && t <= riseT + 60 * 60 * 1000) return "dawn";
  }
  return isDay ? "day" : "night";
}

function unavailableWeather(): WeatherNow {
  return {
    place: MILYANG.place,
    temperature: null,
    humidity: null,
    windSpeed: null,
    weatherCode: null,
    isDay: true,
    kind: "clear",
    label: "날씨 정보 없음",
    icon: "cloud_off",
    phase: "day",
    phaseLabel: PHASE_LABEL.day,
    sunrise: null,
    sunset: null,
    observedAt: null,
    fetchedAt: new Date().toISOString(),
    source: "unavailable",
  };
}

const WEATHER_URL =
  `https://api.open-meteo.com/v1/forecast?latitude=${MILYANG.latitude}&longitude=${MILYANG.longitude}` +
  `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,is_day` +
  `&daily=sunrise,sunset&timezone=Asia%2FSeoul&forecast_days=1`;

interface OpenMeteoResponse {
  current?: {
    time?: string;
    temperature_2m?: number;
    relative_humidity_2m?: number;
    weather_code?: number;
    wind_speed_10m?: number;
    is_day?: number;
  };
  daily?: { sunrise?: string[]; sunset?: string[] };
}

/** 서버에서 호출. 10분 캐시, 실패해도 화면이 깨지지 않도록 안전한 기본값 반환 */
export async function getMilyangWeather(): Promise<WeatherNow> {
  try {
    const res = await fetch(WEATHER_URL, {
      next: { revalidate: 600 },
      headers: { accept: "application/json" },
    });
    if (!res.ok) return unavailableWeather();

    const data = (await res.json()) as OpenMeteoResponse;
    const cur = data.current;
    if (!cur || typeof cur.temperature_2m !== "number") return unavailableWeather();

    const isDay = (cur.is_day ?? 1) === 1;
    const code = typeof cur.weather_code === "number" ? cur.weather_code : 0;
    const { kind, label, icon } = describeWeatherCode(code, isDay);
    const sunrise = data.daily?.sunrise?.[0] ?? null;
    const sunset = data.daily?.sunset?.[0] ?? null;
    const phase = resolvePhase(new Date(), sunrise, sunset, isDay);

    return {
      place: MILYANG.place,
      temperature: Math.round(cur.temperature_2m * 10) / 10,
      humidity: typeof cur.relative_humidity_2m === "number" ? Math.round(cur.relative_humidity_2m) : null,
      windSpeed: typeof cur.wind_speed_10m === "number" ? Math.round(cur.wind_speed_10m * 10) / 10 : null,
      weatherCode: code,
      isDay,
      kind,
      label,
      icon,
      phase,
      phaseLabel: PHASE_LABEL[phase],
      sunrise,
      sunset,
      observedAt: cur.time ?? null,
      fetchedAt: new Date().toISOString(),
      source: "open-meteo",
    };
  } catch {
    return unavailableWeather();
  }
}

export function weatherSummary(w: WeatherNow | null): string {
  if (!w || w.temperature === null) return "날씨 정보 없음";
  const wind = w.windSpeed !== null ? ` · 바람 ${w.windSpeed}km/h` : "";
  return `${w.temperature}°C ${w.label}${wind}`;
}

/**
 * 태양 위치(고도·방위) — NOAA 간이식. 방위는 북쪽 0°, 동쪽 90°(시계방향).
 * 밀양 기준 일출 115°(ESE) · 정오 185°(S) · 일몰 245°(WSW)로 계산된다.
 */
export function solarPosition(
  date: Date,
  latitude: number = MILYANG.latitude,
  longitude: number = MILYANG.longitude
): { elevation: number; azimuth: number } {
  const rad = Math.PI / 180;
  const jd = date.getTime() / 86400000 + 2440587.5;
  const T = (jd - 2451545.0) / 36525;
  const L0 = (280.46646 + T * (36000.76983 + 0.0003032 * T)) % 360;
  const M = 357.52911 + T * (35999.05029 - 0.0001537 * T);
  const e = 0.016708634 - T * (0.000042037 + 0.0000001267 * T);
  const C =
    Math.sin(M * rad) * (1.914602 - T * (0.004817 + 0.000014 * T)) +
    Math.sin(2 * M * rad) * (0.019993 - 0.000101 * T) +
    Math.sin(3 * M * rad) * 0.000289;
  const trueLong = L0 + C;
  const omega = 125.04 - 1934.136 * T;
  const lambda = trueLong - 0.00569 - 0.00478 * Math.sin(omega * rad);
  const epsilon0 = 23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60;
  const epsilon = epsilon0 + 0.00256 * Math.cos(omega * rad);
  const decl = Math.asin(Math.sin(epsilon * rad) * Math.sin(lambda * rad));
  const y = Math.tan((epsilon * rad) / 2) ** 2;
  const eqTime =
    (4 *
      (y * Math.sin(2 * L0 * rad) -
        2 * e * Math.sin(M * rad) +
        4 * e * y * Math.sin(M * rad) * Math.cos(2 * L0 * rad) -
        0.5 * y * y * Math.sin(4 * L0 * rad) -
        1.25 * e * e * Math.sin(2 * M * rad))) /
    rad;
  const utcMinutes = date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60;
  const trueSolarTime = utcMinutes + eqTime + 4 * longitude;
  let hourAngle = trueSolarTime / 4 - 180;
  while (hourAngle < -180) hourAngle += 360;
  while (hourAngle > 180) hourAngle -= 360;

  const cosZenith =
    Math.sin(latitude * rad) * Math.sin(decl) +
    Math.cos(latitude * rad) * Math.cos(decl) * Math.cos(hourAngle * rad);
  const zenith = Math.acos(Math.max(-1, Math.min(1, cosZenith)));
  const elevation = 90 - zenith / rad;
  const azimuth =
    ((Math.atan2(
      Math.sin(hourAngle * rad),
      Math.cos(hourAngle * rad) * Math.sin(latitude * rad) - Math.tan(decl) * Math.cos(latitude * rad)
    ) /
      rad +
      180) %
      360 +
      360) %
    360;

  return { elevation, azimuth };
}

/**
 * 3D 씬 좌표계 기준 태양 방향.
 * 신월리 지형은 -Z=북, +Z=남, +X=동, -X=서 (남서향 경사)이므로 그대로 대응시킨다.
 * 해가 지평선 아래(밤)면 null — 밤 프리셋의 달빛을 쓴다.
 */
export function sunDirection(date: Date = new Date(), distance = 120): [number, number, number] | null {
  const { elevation, azimuth } = solarPosition(date);
  if (elevation <= 1.5) return null;
  const rad = Math.PI / 180;
  const alt = elevation * rad;
  const az = azimuth * rad;
  return [
    Math.sin(az) * Math.cos(alt) * distance,
    Math.sin(alt) * distance,
    -Math.cos(az) * Math.cos(alt) * distance,
  ];
}
