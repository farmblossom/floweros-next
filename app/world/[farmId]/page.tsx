"use client";
import { Suspense, useMemo, useRef, useState, useEffect, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import dynamic from "next/dynamic";
import * as THREE from "three";
import WorldHUD from "@/components/world/WorldHUD";
import VisitorSetup from "@/components/world/VisitorSetup";
import {
  AVATAR_TYPES,
  DEFAULT_LOOK,
  POSES,
  safeLook,
  safePose,
  type VisitorLook,
  type VisitorPose,
} from "@/components/world/VisitorAvatar";
import { resolveMood, FARM_BOUNDS, type PreviewMode, type PlayerPosition } from "@/components/world/world-mood";
import {
  DEFAULT_VIEW,
  PHOTO_EXTRAS,
  scaledView,
  spotById,
  spotsFor,
  type PhotoExtraId,
} from "@/components/world/photo-spots";
import PhotoStudio, { playShutter } from "@/components/world/PhotoStudio";
import useFarmPresence, { fallbackName } from "@/components/world/useFarmPresence";
import { sunDirection } from "@/lib/weather";
import { useWeather } from "@/lib/useWeather";
import Link from "next/link";

const DeoksanScene = dynamic(() => import("@/components/world/DeoksanScene"), { ssr: false });
const SinwolScene = dynamic(() => import("@/components/world/SinwolScene"), { ssr: false });
const WalkController = dynamic(() => import("@/components/world/WalkController"), { ssr: false });
const MobileJoystick = dynamic(() => import("@/components/world/MobileJoystick"), { ssr: false });
const IsoFarmMap = dynamic(() => import("@/components/world/IsoFarmMap"), { ssr: false });
const WeatherEnvironment = dynamic(() => import("@/components/world/WeatherEnvironment"), { ssr: false });
const RemoteVisitors = dynamic(() => import("@/components/world/RemoteVisitors"), { ssr: false });
const PhotoCamera = dynamic(() => import("@/components/world/PhotoCamera"), { ssr: false });
const CaptureBridge = dynamic(() => import("@/components/world/PhotoCamera").then((m) => m.CaptureBridge), {
  ssr: false,
});
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
    start: [0, 0, 5.6],
  },
  sinwol: {
    name: "신월리 농장",
    subtitle: "초동면 신월리 98번지 · 자두 유목·호밀밭",
    start: [-10.6, 0, 11.4],
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

const LOOK_STORAGE_KEY = "floweros:visitor-look";
const POSE_STORAGE_KEY = "floweros:visitor-pose";

type ViewMode = "3d" | "2d";

export default function WorldPage({ params }: { params: Promise<{ farmId: string }> }) {
  const [farmId, setFarmId] = useState<string>("");
  const [hotspot, setHotspot] = useState<HotspotInfo | null>(null);
  const [walkMode, setWalkMode] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("3d");
  const [preview, setPreview] = useState<PreviewMode>("live");
  const [look, setLook] = useState<VisitorLook>(DEFAULT_LOOK);
  const [pose, setPose] = useState<VisitorPose>("stand");
  const [setupMode, setSetupMode] = useState<"entry" | "edit" | null>(null);
  const [photoExtras, setPhotoExtras] = useState<PhotoExtraId[]>([]);
  const [activeNpc, setActiveNpc] = useState<string | null>(null);
  const [photoSpotId, setPhotoSpotId] = useState<string | null>(null);
  const [spotPanel, setSpotPanel] = useState(false);
  const [shot, setShot] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  const [cameraBusy, setCameraBusy] = useState(false);
  const [homeTick, setHomeTick] = useState(0);
  const [portrait, setPortrait] = useState(false);
  const joystickRef = useRef<JoystickState>({ x: 0, y: 0 });
  const playerRef = useRef<PlayerPosition>({ x: 0, y: 0, z: 0 });
  const compassRef = useRef(0);
  const headingOutRef = useRef(Math.PI);
  const movingOutRef = useRef<{ moving: boolean }>({ moving: false });
  const captureRef = useRef<(() => string | null) | null>(null);
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

  // 세로(모바일) 화면 — 카메라를 뒤로 물려 밭 전체가 들어오게
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 700px)");
    const on = () => setPortrait(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  // 저장해 둔 내 모습·닉네임 불러오기 — 이름이 없으면 입장 카드를 연다
  useEffect(() => {
    let saved: VisitorLook | null = null;
    try {
      const raw = window.localStorage.getItem(LOOK_STORAGE_KEY);
      if (raw) saved = safeLook(JSON.parse(raw));
      const savedPose = window.localStorage.getItem(POSE_STORAGE_KEY);
      if (savedPose) setPose(safePose(savedPose));
    } catch {
      /* 저장된 값이 깨졌으면 기본값으로 */
    }
    if (saved?.name) {
      setLook(saved);
      return;
    }
    // 3D가 한 번 그려진 뒤 입장 카드를 띄운다
    const id = window.setTimeout(() => setSetupMode("entry"), 650);
    return () => window.clearTimeout(id);
  }, []);

  const saveLook = useCallback((next: VisitorLook) => {
    setLook(next);
    setSetupMode(null);
    try {
      window.localStorage.setItem(LOOK_STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* 저장 못 해도 이번 방문은 그대로 */
    }
  }, []);

  const changePose = useCallback((next: VisitorPose) => {
    setPose(next);
    try {
      window.localStorage.setItem(POSE_STORAGE_KEY, next);
    } catch {
      /* 저장 못 해도 이번 방문은 그대로 */
    }
  }, []);

  const toggleExtra = useCallback((id: PhotoExtraId) => {
    setPhotoExtras((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  }, []);

  // 농장을 바꾸면 보던 시점·패널은 초기화
  useEffect(() => {
    setPhotoSpotId(null);
    setWalkMode(false);
    setHotspot(null);
    setActiveNpc(null);
    setShot(null);
    setSpotPanel(false);
    setHomeTick((v) => v + 1);
  }, [farmId]);

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

  // 같은 농장에 함께 접속한 방문자 (환경변수·연결이 없으면 조용히 단독 모드)
  const { peersRef, peerIds, peerLookVersion, online, status, selfId } = useFarmPresence({
    farmId,
    look,
    pose,
    playerRef,
    headingRef: headingOutRef,
    movingRef: movingOutRef,
    enabled: viewMode === "3d" && !!farmId && !!meta,
  });

  const photoSpot = useMemo(() => spotById((farmId as "sinwol" | "deoksan") ?? "sinwol", photoSpotId), [farmId, photoSpotId]);
  const farmSpots = useMemo(() => spotsFor((farmId as "sinwol" | "deoksan") ?? "sinwol"), [farmId]);
  const cameraView = photoSpot;

  // 같은 포토존을 여러 명이 골라도 한 좌표에 완전히 겹치지 않게 — 접속자 id 순서로 좌우 한 걸음씩
  const stageAt = useMemo(() => {
    if (!photoSpot) return null;
    const ids = [selfId, ...peerIds].filter(Boolean).sort();
    const total = Math.max(1, ids.length);
    const slot = Math.max(0, ids.indexOf(selfId));
    const apart = (slot - (total - 1) / 2) * 1.15;
    return {
      x: photoSpot.avatarAt[0] + Math.cos(photoSpot.yaw) * apart,
      z: photoSpot.avatarAt[1] - Math.sin(photoSpot.yaw) * apart,
      yaw: photoSpot.yaw,
    };
  }, [photoSpot, selfId, peerIds]);

  const takePhoto = useCallback(() => {
    if (!captureRef.current) return;
    playShutter();
    setFlash(true);
    window.setTimeout(() => setFlash(false), 220);
    const raw = captureRef.current();
    if (raw) setShot(raw);
  }, []);

  const openSpot = useCallback((id: string | null) => {
    setWalkMode(false);
    setHotspot(null);
    setActiveNpc(null);
    setSpotPanel(false);
    setPhotoSpotId(id);
  }, []);

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
  const orbitTarget = photoSpot ? photoSpot.view.target : isoFarm === "sinwol" ? [0, 1, 2] : [0, 0.5, 2.5];

  // 2D 맵 뷰
  if (viewMode === "2d") {
    return <IsoFarmMap farm={isoFarm} onClose={() => setViewMode("3d")} />;
  }

  return (
    <div className="fixed inset-0 bg-black">
      <Canvas
        shadows="soft"
        dpr={[1, 1.8]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
          preserveDrawingBuffer: true,
        }}
        className="w-full h-full"
      >
        <Suspense fallback={null}>
          <WeatherEnvironment mood={mood} shadowRadius={farmId === "sinwol" ? 34 : 30} />
          {farmId === "deoksan" ? (
            <DeoksanScene
              onHotspotSelect={(label, info) => setHotspot({ label, info })}
              walkMode={walkMode}
              playerRef={playerRef}
              activeId={activeNpc}
              onTalk={setActiveNpc}
              photoSpot={photoSpot}
              photoExtras={photoExtras}
              photoMode={!!photoSpot || cameraBusy}
              orbitTarget={orbitTarget as [number, number, number]}
              onPhotoSpotSelect={openSpot}
              portrait={portrait}
            />
          ) : (
            <SinwolScene
              onHotspotSelect={(label, info) => setHotspot({ label, info })}
              walkMode={walkMode}
              playerRef={playerRef}
              activeId={activeNpc}
              onTalk={setActiveNpc}
              photoSpot={photoSpot}
              photoExtras={photoExtras}
              photoMode={!!photoSpot || cameraBusy}
              orbitTarget={orbitTarget as [number, number, number]}
              onPhotoSpotSelect={openSpot}
              portrait={portrait}
            />
          )}
          <WalkController
            enabled={walkMode}
            speed={4.3}
            bounds={bounds}
            joystickRef={joystickRef}
            farm={isoFarm}
            look={look}
            pose={pose}
            name={fallbackName(look.name)}
            playerRef={playerRef}
            startPosition={start}
            headingOutRef={headingOutRef}
            movingOutRef={movingOutRef}
            stageAt={stageAt}
          />
          <RemoteVisitors farm={isoFarm} peerIds={peerIds} peersRef={peersRef} version={peerLookVersion} />
          <PhotoCamera
            view={cameraView ? scaledView(cameraView.view, portrait ? 2.4 : 1.25) : scaledView(DEFAULT_VIEW[isoFarm], portrait ? 1.45 : 1)}
            requestId={photoSpot ? photoSpot.id : `home-${isoFarm}-${homeTick}`}
            onAnimating={setCameraBusy}
          />
          <CaptureBridge captureRef={captureRef} />          <CameraCompassTracker yawRef={compassRef} />
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
          setActiveNpc(null);
          setPhotoSpotId(null);
        }}
        weather={weather}
        preview={preview}
        onPreviewChange={setPreview}
        visitors={online}
        presence={status}
      />

      {/* 동서남북 나침반 */}
      <Compass yawRef={compassRef} />

      {/* 🧍 서기 · 🪑 앉기 · 🌱 구부리기 — 방문자 자세 */}
      <div className="absolute right-3 bottom-[156px] z-20 flex items-center gap-0.5 p-1 rounded-full bg-black/50 backdrop-blur-sm sm:right-4 sm:bottom-[164px]">
        {POSES.map((p) => {
          const on = pose === p.id;
          return (
            <button
              key={p.id}
              onClick={() => changePose(p.id)}
              aria-pressed={on}
              aria-label={`${p.label} 자세`}
              title={`${p.label} 자세`}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors ${
                on ? "bg-white text-[#23301d]" : "text-white/85 hover:bg-white/15"
              }`}
            >
              <span className="text-[12px] leading-none">{p.emoji}</span>
              {p.label}
            </button>
          );
        })}
      </div>

      {/* 👤 내 캐릭터 — 닉네임 · 아바타 꾸미기 다시 열기 */}
      <button
        onClick={() => setSetupMode("edit")}
        aria-label="내 캐릭터 닉네임·아바타 꾸미기"
        className="absolute right-3 bottom-[112px] z-20 flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full bg-black/55 text-white backdrop-blur-sm hover:bg-black/75 transition-colors sm:right-4 sm:bottom-[114px]"
      >
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#7fb04d] text-[12px]">
          {AVATAR_TYPES.find((t) => t.id === look.type)?.emoji ?? "👩"}
        </span>
        <span className="max-w-[88px] truncate text-[11px] font-bold">{fallbackName(look.name)}</span>
        <span className="material-symbols-outlined text-[14px] text-white/80">palette</span>
      </button>

      {/* 👥 포토존 단체샷 — 함께 찍을 지기 고르기 (퍼뜨기·쑤담이는 기본) */}
      {photoSpot ? (
        <div className="absolute left-2 top-[98px] z-20 w-[178px] rounded-2xl bg-[#1b2018]/92 backdrop-blur-md border border-white/12 shadow-xl p-2 sm:left-4 sm:top-auto sm:bottom-[196px] sm:w-[188px]">
          <div className="flex items-center gap-1 px-1 pb-1">
            <span className="material-symbols-outlined text-[13px] text-[#b8e08a]">photo_camera</span>
            <span className="flex-1 truncate text-[10px] font-bold text-white/90">{photoSpot.label}</span>
            <button
              onClick={() => openSpot(null)}
              className="p-0.5 -mr-0.5 rounded-full text-white/70 hover:bg-white/15"
              aria-label="포토존 시점 해제"
            >
              <span className="material-symbols-outlined text-[13px]">close</span>
            </button>
          </div>
          <p className="px-1 text-[10.5px] font-bold text-white">👥 함께 찍을 지기</p>
          <p className="px-1 pt-0.5 text-[9px] leading-snug text-white/55" style={{ wordBreak: "keep-all" }}>
            퍼뜨기·쑤담이는 늘 함께해요
          </p>
          <div className="mt-1.5 grid grid-cols-2 gap-1">
            {PHOTO_EXTRAS.map((e) => {
              const on = photoExtras.includes(e.id);
              return (
                <button
                  key={e.id}
                  onClick={() => toggleExtra(e.id)}
                  aria-pressed={on}
                  className={`flex items-center gap-1 rounded-lg px-1.5 py-1.5 text-[10.5px] font-semibold border transition-colors ${
                    on
                      ? "bg-[#8cbd57]/25 border-[#8cbd57] text-white"
                      : "bg-white/6 border-white/10 text-white/70 hover:bg-white/12"
                  }`}
                >
                  <span className="text-[11px]">{e.emoji}</span>
                  <span className="truncate">{e.label}</span>
                  <span className="ml-auto material-symbols-outlined text-[12px] opacity-80">
                    {on ? "check" : "add"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* 입장 카드 · 내 캐릭터 꾸미기 */}
      <VisitorSetup
        open={setupMode !== null}
        mode={setupMode ?? "edit"}
        initial={look}
        onSave={saveLook}
        onClose={() => setSetupMode(null)}
      />

      {/* 📷 사진 찍기 · 포토존 · 전체 보기 */}
      <div className="absolute right-3 bottom-16 z-20 flex flex-col items-end gap-1.5 sm:right-auto sm:bottom-28 sm:left-4 sm:items-start">
        {photoSpot ? (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#3f6b34]/85 text-white text-[11px] backdrop-blur-sm">
            <span className="material-symbols-outlined text-[13px]">photo_camera</span>
            <span className="font-semibold">{photoSpot.label}</span>
            <button
              onClick={() => openSpot(null)}
              className="ml-0.5 p-0.5 rounded-full hover:bg-white/20"
              aria-label="포토존 시점 해제"
            >
              <span className="material-symbols-outlined text-[13px]">close</span>
            </button>
          </div>
        ) : null}

        <div className="flex items-center gap-2">
          <button
            onClick={takePhoto}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-[#7fb04d] text-[#12200c] text-sm font-extrabold shadow-lg hover:bg-[#8cbd57] transition-colors"
            aria-label="기념사진 찍기"
          >
            <span className="material-symbols-outlined text-[17px]">photo_camera</span>
            사진 찍기
          </button>
          <button
            onClick={() => setSpotPanel((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-full text-sm backdrop-blur-sm transition-colors ${
              spotPanel ? "bg-white text-[#23301d] font-bold" : "bg-black/55 text-white hover:bg-black/75"
            }`}
            aria-label="포토존 시점 찾기"
          >
            <span className="material-symbols-outlined text-[16px]">photo_camera_front</span>
            <span className="hidden sm:inline">포토존</span>
          </button>
          <button
            onClick={() => {
              setWalkMode(false);
              setPhotoSpotId(null);
              setSpotPanel(false);
              setHotspot(null);
              setHomeTick((v) => v + 1);
            }}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-full bg-black/55 text-white text-sm backdrop-blur-sm hover:bg-black/75 transition-colors"
            aria-label="농장 전체 보기로 시점 초기화"
            title="농장 전체 보기"
          >
            <span className="material-symbols-outlined text-[16px]">fit_screen</span>
            <span className="hidden sm:inline">전체 보기</span>
          </button>
        </div>

        {spotPanel ? (
          <div className="w-60 rounded-2xl bg-[#1b2018]/92 backdrop-blur-md border border-white/12 shadow-xl p-2">
            <p className="px-1.5 pb-1 text-[10px] text-white/55">지기들과 나란히 서는 포토존 시점</p>
            {farmSpots.map((s) => (
              <button
                key={s.id}
                onClick={() => openSpot(s.id)}
                className={`w-full text-left px-2 py-2 rounded-xl transition-colors ${
                  photoSpotId === s.id ? "bg-white/15" : "hover:bg-white/10"
                }`}
              >
                <span className="block text-[12.5px] font-semibold text-white">{s.label}</span>
                <span className="block text-[10px] text-white/55">{s.hint}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* 셔터 플래시 */}
      <div
        className={`pointer-events-none fixed inset-0 z-40 bg-white transition-opacity duration-300 ${
          flash ? "opacity-80" : "opacity-0"
        }`}
        aria-hidden
      />

      {/* 2D 맵 전환 버튼 */}
      <button
        onClick={() => {
          setViewMode("2d");
          setHotspot(null);
          setWalkMode(false);
          setPhotoSpotId(null);
        }}
        className="absolute right-3 bottom-4 z-20 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full bg-black/60 text-white text-xs font-bold backdrop-blur-sm hover:bg-black/80 transition-colors sm:right-4 sm:bottom-16"
        aria-label="2D 아이소메트릭 맵으로 전환"
      >
        <span className="material-symbols-outlined text-[15px]">map</span>
        <span className="hidden sm:inline">2D 맵 탐방</span>
      </button>

      {/* 모바일 조이스틱 */}
      {walkMode && (
        <div className="md:hidden">
          <MobileJoystick joystickRef={joystickRef} />
        </div>
      )}

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

      {/* 기념사진 미리보기 */}
      <PhotoStudio
        raw={shot}
        farmName={meta.name}
        spotLabel={photoSpot?.label ?? null}
        onClose={() => setShot(null)}
        onRetake={() => {
          setShot(null);
          window.setTimeout(takePhoto, 120);
        }}
      />
    </div>
  );
}
