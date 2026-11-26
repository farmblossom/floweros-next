"use client";
import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import NpcCharacter from "@/components/world/NpcCharacter";
import WeatherEnvironment from "@/components/world/WeatherEnvironment";
import { resolveMood, type PreviewMode } from "@/components/world/world-mood";

/**
 * 개발용 캐릭터 확인 화면 — 배포에는 쓰지 않는다.
 * /dev/chars              : 퍼뜨기·쑤담이 전신
 * /dev/chars?view=head    : 머리 클로즈업
 * /dev/chars?shadows=1    : 간단 조명 + 그림자
 * /dev/chars?mood=day     : 실제 농장과 같은 환경 조명(낮/노을/밤)
 */
export default function DevCharsPage() {
  const [view, setView] = useState<"full" | "head">("full");
  const [shadows, setShadows] = useState(false);
  const [kind, setKind] = useState<"both" | "putteogi" | "ssudami">("both");
  const [dist, setDist] = useState(0);
  const [camY, setCamY] = useState(0);
  const [moodId, setMoodId] = useState<"none" | "day" | "sunset" | "night">("none");
  const [fig, setFig] = useState(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setView(q.get("view") === "head" ? "head" : "full");
    setShadows(q.get("shadows") === "1");
    const k = q.get("kind");
    setKind(k === "putteogi" || k === "ssudami" ? k : "both");
    setDist(Number(q.get("d") ?? 0));
    setCamY(Number(q.get("y") ?? 0));
    const m = q.get("mood");
    setMoodId(m === "day" || m === "sunset" || m === "night" ? m : "none");
    setFig(q.get("fig") === "1");
  }, []);

  const head = view === "head";
  const showPutteogi = kind !== "ssudami";
  const showSsudami = kind !== "putteogi";
  const spread = head ? 0 : 0.62;
  const camZ = dist > 0 ? dist : head ? 2.0 : 3.6;
  const camHeight = camY > 0 ? camY : head ? 0.8 : 0.9;
  const targetY = head ? 0.78 : 0.72;
  const mood = moodId === "none" ? null : resolveMood("clear", moodId, moodId as PreviewMode, null);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#e9efe3" }}>
      <Canvas
        shadows={shadows || !!mood}
        dpr={[1, 2]}
        camera={{ position: [0, camHeight, camZ], fov: 30 }}
        onCreated={({ camera }) => camera.lookAt(0, targetY, 0)}
        gl={{ antialias: true }}
      >
        {mood ? (
          <WeatherEnvironment mood={mood} shadowRadius={34} />
        ) : (
          <>
            <color attach="background" args={["#e9efe3"]} />
            <hemisphereLight args={["#ffffff", "#c9d3bd", 1.15]} />
            <ambientLight intensity={0.45} />
            <directionalLight
              position={[2.4, 4.2, 3.2]}
              intensity={2.1}
              castShadow={shadows}
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              shadow-bias={0}
              shadow-normalBias={0.035}
              shadow-camera-left={-4}
              shadow-camera-right={4}
              shadow-camera-top={4}
              shadow-camera-bottom={-4}
            />
          </>
        )}
        {showPutteogi ? (
          <group position={[head ? (showSsudami ? -0.44 : 0) : -spread, 0, 0]}>
            <NpcCharacter kind="putteogi" gather={{ x: 0, z: 0, yaw: 0 }} />
            {fig ? <FigShell height={0.95} /> : null}
          </group>
        ) : null}
        {showSsudami ? (
          <group position={[head ? (showPutteogi ? 0.44 : 0) : spread, 0, 0]}>
            <NpcCharacter kind="ssudami" gather={{ x: 0, z: 0, yaw: 0 }} />
            {fig ? <FigShell height={0.9} /> : null}
          </group>
        ) : null}
        {/* 그림자 받을 바닥 */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[40, 40]} />
          <meshStandardMaterial color="#dfe7d6" roughness={1} />
        </mesh>
      </Canvas>
    </div>
  );
}

/** NpcFigure 가 캐릭터에 붙이는 바닥 그림자 원 + 투명 클릭 박스 재현 */
function FigShell({ height }: { height: number }) {
  const width = Math.max(1, height * 0.62);
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[width * 0.46, 24]} />
        <meshBasicMaterial color="#1b2416" transparent opacity={0.26} depthWrite={false} />
      </mesh>
      <mesh position={[0, height * 0.5, 0]}>
        <boxGeometry args={[width, height, width]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </>
  );
}
