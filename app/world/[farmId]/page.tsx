"use client";
import { Suspense, useMemo, useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import dynamic from "next/dynamic";
import * as THREE from "three";
import WorldHUD from "@/components/world/WorldHUD";
import type { AvatarPresetId } from "@/components/world/VisitorAvatar";
import { resolveMood, FARM_BOUNDS, type PreviewMode, type PlayerPosition } from "@/components/world/world-mood";
import { sunDirection } from "@/lib/weather";
import { useWeather } from "@/lib/useWeather";
import Link from "next/link";

const DeoksanScene = dynamic(() => import("@/components/world/DeoksanScene"), { ssr: false });
const SinwolScene = dynamic(() => import("@/components/world/SinwolScene"), { ssr: false });
const WalkController = dynamic(() => import("@/components/world/WalkController"), { ssr: false });
const MobileJoystick = dynamic(() => import("@/components/world/MobileJoystick"), { ssr: false });
const IsoFarmMap = dynamic(() => import("@/components/world/IsoFarmMap"), { ssr: false });
const WeatherEnvironment = dynamic(() => import("@/components/world/WeatherEnvironment"), { ssr: false });
const CameraCompassTracker = dynamic(() => import("@/components/world/Compass").then((m) => m.CameraCompassTracker), {
  ssr: false,
});
const Compass = dynamic(() => import("@/components/world/Compass"), { ssr: false });

const farmMeta: Record<
  string,
  { name: string; subtitle: string; start: [number, number, number] }
> = {
  deoksan: {
    name: "밀양 덕산농장",
    subtitle: "덕산리 756번지 · 2027 봄감자 40구획",
    start: [0, 0, 8.6],
  },
  sinwol: {
    name: "신월리 농장",
    subtitle: "초동면 신월리 98번지 · 자두 유무·호밀밭",
    start: [-9.6, 0, 8.4],
  },
};

interface JoystickState {
  x: number;
  y: number;
}

interface HotspotInfo {
  label: string;
  info: string;
  imageUrl?: string;
}

type ViewMode = "3d" | "2d";

export default function WorldPage({ params }: { params: Promise<{ farmId: string }> }) {
  const [farmId, setFarmId] = useState<string>("");
  const [hotspot, setHotspot] = useState<HotspotInfo | null>(null);
  const [walkMode, setWalkMode] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("3d");
  const [preview, setPreview] = useState<PreviewMode>("live");
  const [avatar, setAvatar] = useState<AvatarPresetId>("farmer");
  const joystickRef = useRef<JoystickState>({ x: 0, y: 0 });
  const playerRef = useRef<PlayerPosition>({ x: 0, y: 0, z: 0 });
  const compassRef = useRef(0);
  const [sunDir, setSunDir] = useState<[number, number, number] | null>(null);
  const { weather } = useWeather();

  // 실제 태양 궤적 (동→남→서) — 서버 프리렌더 시각에 고정되지 않도록 마운트 후 계산
  useEffect(() => {
    const update = () => setSunDir(sunDirection());
    update();
    const id = window.setInterval(update, 5 * 60 * 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    params.then((p) => setFarmId(p.farmId));
  }, [params]);

  const meta = farmMeta[farmId];
  const start = useMemo<[number, number, number]>(() => meta?.start ?? [0, 0, 8], [meta]);

  // 아바타 시작 위치 동기화
  useEffect(() => {
    playerRef.current.x = start[0];
    playerRef.current.z = start[2];
  }, [start]);

  const mood = useMemo(
    () => resolveMood(weather?.kind, weather?.phase ?? "day", preview, preview === "live" ? sunDir : null),
    [weather?.kind, weather?.phase, preview, sunDir]
  );

  if (!farmId) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center text-white">로딩 중...</div>
    );
  }

  if (!meta) {
    return (
      <div className="fixed inset-0 bg-surface flex items-center justify-center flex-col gap-4">
        <p className="text-on-surface">농장을 찾을 수 없습니다.</p>
        <Link href="/" className="text-primary underline">
          대문으로 돌아가기
        </Link>
      </div>
    );
  }

  const bounds = FARM_BOUNDS[farmId as "sinwol" | "deoksan"] ?? FARM_BOUNDS.deoksan;
  const isoFarm = farmId as "sinwol" | "deoksan";

  // 2D 맵 뷰
  if (viewMode === "2d") {
    return <IsoFarmMap farm={isoFarm} onClose={() => setViewMode("3d")} />;
  }

  return (
    <div className="fixed inset-0 bg-black">
      <Canvas
        shadows="soft"
        dpr={[1, 1.8]}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
        className="w-full h-full"
      >
        <Suspense fallback={null}>
          <WeatherEnvironment mood={mood} shadowRadius={farmId === "sinwol" ? 34 : 30} />
          {farmId === "deoksan" ? (
            <DeoksanScene
              onHotspotSelect={(label, info) => setHotspot({ label, info })}
              walkMode={walkMode}
              playerRef={playerRef}
            />
          ) : (
            <SinwolScene
              onHotspotSelect={(label, info) => setHotspot({ label, info })}
              walkMode={walkMode}
              playerRef={playerRef}
            />
          )}
          <WalkController
            enabled={walkMode}
            speed={4.3}
            bounds={bounds}
            joystickRef={joystickRef}
            farm={isoFarm}
            avatar={avatar}
            playerRef={playerRef}
            startPosition={start}
          />
          <CameraCompassTracker yawRef={compassRef} />
        </Suspense>
      </Canvas>

      <WorldHUD
        farmName={meta.name}
        farmId={farmId}
        isDemo
        walkMode={walkMode}
        onToggleWalkMode={() => {
          setWalkMode((v) => !v);
          setHotspot(null);
        }}
        weather={weather}
        preview={preview}
        onPreviewChange={setPreview}
        avatar={avatar}
        onAvatarChange={setAvatar}
      />

      {/* 동서남북 나침반 */}
      <Compass yawRef={compassRef} />

      {/* 2D 맵 전환 버튼 */}
      <button
        onClick={() => {
          setViewMode("2d");
          setHotspot(null);
          setWalkMode(false);
        }}
        className="absolute bottom-20 right-4 z-20 flex items-center gap-1.5 px-3 py-2 rounded-full bg-black/60 text-white text-xs font-bold backdrop-blur-sm hover:bg-black/80 transition-colors"
        aria-label="2D 아이소메트릭 맵으로 전환"
      >
        <span className="material-symbols-outlined text-[15px]">map</span>
        <span className="hidden sm:inline">2D 맵 탐방</span>
      </button>

      {/* 모바일 조이스틱 */}
      {walkMode && <MobileJoystick joystickRef={joystickRef} />}

      {/* 구역·지기 정보 패널 */}
      {hotspot && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-30 max-w-sm w-[92%] px-2">
          <div className="bg-surface/95 backdrop-blur-md rounded-2xl shadow-xl p-5 border border-outline-variant/30">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="material-symbols-outlined text-primary text-[16px]">eco</span>
                  <div className="font-semibold text-on-surface">{hotspot.label}</div>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed" style={{ wordBreak: "keep-all" }}>
                  {hotspot.info}
                </p>
                {hotspot.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={hotspot.imageUrl} alt={hotspot.label} className="mt-3 w-full rounded-xl" />
                ) : (
                  <p className="mt-3 text-[11px] text-outline flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">photo_camera</span>
                    현장 사진은 준비되는 대로 이 자리에 표시됩니다
                  </p>
                )}
                <p className="mt-2 text-[10px] text-outline">
                  {meta.name} · {meta.subtitle}
                </p>
              </div>
              <button
                onClick={() => setHotspot(null)}
                className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant flex-shrink-0"
                aria-label="정보 닫기"
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
