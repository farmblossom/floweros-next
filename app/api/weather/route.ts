import { NextResponse } from "next/server";
import { getMilyangWeather } from "@/lib/weather";

export async function GET() {
  const weather = await getMilyangWeather();
  return NextResponse.json(weather, {
    headers: {
      "cache-control": "public, s-maxage=600, stale-while-revalidate=1200",
    },
  });
}
