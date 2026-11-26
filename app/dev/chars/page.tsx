"use client";
import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import NpcCharacter from "@/components/world/NpcCharacter";

/**
 * 개발용 캐릭터 확인 화면 — 배포에는 쓰지 않는다.
 * /dev/chars            : 퍼뜨기·쑤담이 전신
 * /dev/chars?view=head  : 머리 클로즈업
 * /dev/chars?shadows=1  : 실제 농장과 같은 그림자 켬
 */
export default function DevCharsPage() {
  const [view, setView] = useState<"full" | "head">("full");
  const [shadows, setShadows] = useState(false);
  const [kind, setKind] = useState<"both" | "putteogi" | "ssudami">("both");
  const [dist, setDist] = useState(0);
  const [camY, setCamY] = useState(0);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setView(q.get("view") === "head" ? "head" : "full");
    setShadows(q.get("shadows") === "1");
    const k = q.get("kind");
    setKind(k === "putteogi" || k === "ssudami" ? k : "both");
    setDist(Number(q.get("d") ?? 0));
    setCamY(Number(q.get("y") ?? 0));
  }, []);

  const head = view === "head";
  const showPutteogi = kind !== "ssudami";
  const showSsudami = kind !== "putteogi";
  const spread = head ? 0 : 0.62;
  const camZ = dist > 0 ? dist : head ? 2.0 : 3.6;
  const camHeight = camY > 0 ? camY : head ? 0.8 : 0.9;
  const targetY = head ? 0.78 : 0.72;

  return (
    <div style={{ position: "fixed", inset: 0, background: "#e9efe3" }}>
      <Canvas
        shadows={shadows}
        dpr={[1, 2]}
        camera={{ position: [0, camHeight, camZ], fov: 30 }}
        onCreated={({ camera }) => camera.lookAt(0, targetY, 0)}
        gl={{ antialias: true }}
      >
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
        {showPutteogi ? (
          <group position={[head ? (showSsudami ? -0.44 : 0) : -spread, 0, 0]}>
            <NpcCharacter kind="putteogi" gather={{ x: 0, z: 0, yaw: 0 }} />
          </group>
        ) : null}
        {showSsudami ? (
          <group position={[head ? (showPutteogi ? 0.44 : 0) : spread, 0, 0]}>
            <NpcCharacter kind="ssudami" gather={{ x: 0, z: 0, yaw: 0 }} />
          </group>
        ) : null}
        {/* 그림자 받을 바닥 */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow={shadows}>
          <planeGeometry args={[12, 12]} />
          <meshStandardMaterial color="#dfe7d6" roughness={1} />
        </mesh>
      </Canvas>
    </div>
  );
}
