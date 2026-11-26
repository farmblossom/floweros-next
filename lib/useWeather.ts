"use client";
import { useEffect, useState } from "react";
import type { WeatherNow } from "@/lib/weather";

/** 클라이언트에서 10분 주기로 /api/weather 를 읽어오는 훅 */
export function useWeather(): { weather: WeatherNow | null; loading: boolean } {
  const [weather, setWeather] = useState<WeatherNow | null>(null);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        const res = await fetch("/api/weather", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as WeatherNow;
        if (alive) setWeather(data);
      } catch {
        // 네트워크 실패 시 마지막 값을 유지 (없으면 표시만 비움)
      }
    };

    load();
    const id = window.setInterval(load, 10 * 60 * 1000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, []);

  return { weather, loading: weather === null };
}
