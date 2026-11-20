"use client";
import Link from "next/link";
import Image from "next/image";

interface WorldHUDProps {
  farmName: string;
  farmId: string;
  isDemo?: boolean;
  walkMode?: boolean;
  onToggleWalkMode?: () => void;
}

export default function WorldHUD({
  farmName,
  farmId,
  isDemo = true,
  walkMode = false,
  onToggleWalkMode,
}: WorldHUDProps) {
  const otherFarm = farmId === "deoksan"
    ? { id: "sinwol", name: "신월리 농장" }
    : { id: "deoksan", name: "밀양 덕산농장" };

  return (
    <>
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-10">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            aria-label="꽃폈네 메인으로 이동"
            className="flex items-center pointer-events-auto"
          >
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
          {/* 걷기 / 조감 모드 토글 */}
          {onToggleWalkMode && (
            <button
              onClick={onToggleWalkMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm backdrop-blur-sm pointer-events-auto transition-colors ${
                walkMode
                  ? "bg-primary/90 text-on-primary hover:bg-primary"
                  : "bg-black/50 text-white hover:bg-black/70"
              }`}
              aria-label={walkMode ? "조감 모드로 전환" : "걷기 모드로 전환"}
            >
              <span className="material-symbols-outlined text-[15px]">
                {walkMode ? "360" : "directions_walk"}
              </span>
              <span className="hidden sm:inline">{walkMode ? "조감 모드" : "걷기 모드"}</span>
            </button>
          )}

          {isDemo && (
            <span className="px-2.5 py-1 rounded-full bg-amber-500/80 text-white text-xs font-semibold backdrop-blur-sm">
              3D 시뮬레이션 초안
            </span>
          )}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 text-white text-sm backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
            {farmName}
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <div className="bg-black/60 text-white/90 text-xs px-5 py-2.5 rounded-full backdrop-blur-sm flex items-center gap-3">
          {walkMode ? (
            <>
              <span className="hidden sm:inline">⌨️ WASD / 방향키: 이동 · 드래그: 시점 회전</span>
              <span className="sm:hidden">🕹️ 조이스틱: 이동 · 드래그: 시점 회전</span>
              <span>🔵 캐릭터·마커 클릭: 정보</span>
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
