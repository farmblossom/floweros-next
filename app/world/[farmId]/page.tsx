"use client";
import { Suspense, useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import dynamic from "next/dynamic";
import WorldHUD from "@/components/world/WorldHUD";
import Link from "next/link";

const DeoksanScene = dynamic(() => import("@/components/world/DeoksanScene"), { ssr: false });
const SinwolScene = dynamic(() => import("@/components/world/SinwolScene"), { ssr: false });
const WalkController = dynamic(() => import("@/components/world/WalkController"), { ssr: false });
const MobileJoystick = dynamic(() => import("@/components/world/MobileJoystick"), { ssr: false });
const IsoFarmMap = dynamic(() => import("@/components/world/IsoFarmMap"), { ssr: false });

const farmMeta: Record<string, { name: string }> = {
  deoksan: { name: "밀양 덕산농장" },
  sinwol: { name: "신월리 농장" },
};

const farmBounds: Record<string, { minX: number; maxX: number; minZ: number; maxZ: number }> = {
  deoksan: { minX: -13, maxX: 13, minZ: -13, maxZ: 13 },
  sinwol: { minX: -18, maxX: 18, minZ: -18, maxZ: 18 },
};

interface JoystickState { x: number; y: number; }

type ViewMode = "3d" | "2d";

export default function WorldPage({ params }: { params: Promise<{ farmId: string }> }) {
  const [farmId, setFarmId] = useState<string>("");
  const [hotspot, setHotspot] = useState<{ label: string; info: string } | null>(null);
  const [walkMode, setWalkMode] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("3d");
  const joystickRef = useRef<JoystickState>({ x: 0, y: 0 });

  useEffect(() => {
    params.then((p) => setFarmId(p.farmId));
  }, [params]);

  if (!farmId) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center text-white">
        로딩 중...
      </div>
    );
  }

  const meta = farmMeta[farmId];
  if (!meta) {
    return (
      <div className="fixed inset-0 bg-surface flex items-center justify-center flex-col gap-4">
        <p className="text-on-surface">농장을 찾을 수 없습니다.</p>
        <Link href="/" className="text-primary underline">대문으로 돌아가기</Link>
      </div>
    );
  }

  const bounds = farmBounds[farmId] ?? farmBounds.deoksan;
  const isoFarm = farmId as "sinwol" | "deoksan";

  // 2D 맵 뷰 (3D 위에 올라오는 오버레이)
  if (viewMode === "2d") {
    return (
      <IsoFarmMap
        farm={isoFarm}
        onClose={() => setViewMode("3d")}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black">
      <Canvas shadows gl={{ antialias: true }} className="w-full h-full">
        <Suspense fallback={null}>
          {farmId === "deoksan" ? (
            <DeoksanScene
              onHotspotSelect={(label, info) => setHotspot({ label, info })}
              walkMode={walkMode}
            />
          ) : (
            <SinwolScene
              onHotspotSelect={(label, info) => setHotspot({ label, info })}
              walkMode={walkMode}
            />
          )}
          <WalkController
            enabled={walkMode}
            speed={5}
            bounds={bounds}
            joystickRef={joystickRef}
          />
        </Suspense>
      </Canvas>

      <WorldHUD
        farmName={meta.name}
        farmId={farmId}
        isDemo={true}
        walkMode={walkMode}
        onToggleWalkMode={() => {
          setWalkMode((v) => !v);
          setHotspot(null);
        }}
      />

      {/* 2D 맵 전환 버튼 */}
      <button
        onClick={() => { setViewMode("2d"); setHotspot(null); setWalkMode(false); }}
        className="absolute bottom-20 right-4 z-20 flex items-center gap-1.5 px-3 py-2 rounded-full bg-black/60 text-white text-xs font-bold backdrop-blur-sm hover:bg-black/80 transition-colors"
        aria-label="2D 아이소메트릭 맵으로 전환"
      >
        <span className="material-symbols-outlined text-[15px]">map</span>
        <span className="hidden sm:inline">2D 맵 탐방</span>
      </button>

      {/* 모바일 조이스틱 */}
      {walkMode && <MobileJoystick joystickRef={joystickRef} />}

      {hotspot && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 max-w-sm w-full px-4">
          <div className="bg-surface/95 backdrop-blur-md rounded-2xl shadow-xl p-5 border border-outline-variant/30">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold text-on-surface mb-1">{hotspot.label}</div>
                <p className="text-sm text-on-surface-variant">{hotspot.info}</p>
              </div>
              <button
                onClick={() => setHotspot(null)}
                className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant flex-shrink-0"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
