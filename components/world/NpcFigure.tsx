"use client";
import { useMemo, useRef, useState } from "react";
import { Html, useTexture, Billboard } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { PlayerPosition } from "./terrain";

interface NpcFigureProps {
  name: string;
  role: string;
  textureUrl: string;
  position: [number, number, number];
  lines: string[];
  playerRef: React.RefObject<PlayerPosition>;
  /** 피규어 높이(월드 단위) */
  height?: number;
  /** 이 거리 안으로 들어오면 먼저 인사한다 */
  greetRadius?: number;
  accent?: string;
  /** 걷기 모드일 때만 다가가면 인사 (조감 화면에서 말풍선이 겹치지 않게) */
  greetEnabled?: boolean;
}

/**
 * 원본 캐릭터 이미지를 그대로 텍스처로 사용하는 아크릴 피규어 스탠드.
 * (도형으로 재해석하지 않고 대표님이 주신 원본 그림 100% 유지)
 */
export default function NpcFigure({
  name,
  role,
  textureUrl,
  position,
  lines,
  playerRef,
  height = 1.75,
  greetRadius = 3.4,
  accent = "#4a6243",
  greetEnabled = true,
}: NpcFigureProps) {
  const texture = useTexture(textureUrl);
  const [lineIdx, setLineIdx] = useState<number | null>(null);
  const [hint, setHint] = useState(false);
  const greetedRef = useRef(false);
  const panelRef = useRef<THREE.Group>(null);
  const baseRef = useRef<THREE.Group>(null);
  const seedRef = useRef(Math.random() * 10);
  const hintRef = useRef(false);

  const aspect = useMemo(() => {
    const img = texture.image as { width?: number; height?: number } | undefined;
    if (img?.width && img?.height) return img.width / img.height;
    return 0.75;
  }, [texture]);

  const width = height * aspect;

  useTexture.preload(textureUrl);

  useFrame((state) => {
    const t = state.clock.elapsedTime + seedRef.current;

    // 살짝 흔들리는 아크릴 피규어
    if (panelRef.current) {
      panelRef.current.rotation.z = Math.sin(t * 0.85) * 0.018;
      panelRef.current.position.y = Math.sin(t * 1.6) * 0.012;
    }
    if (baseRef.current) {
      baseRef.current.rotation.y = Math.sin(t * 0.3) * 0.02;
    }

    // 방문자가 가까이 오면 먼저 인사
    const p = playerRef.current;
    if (!p) return;
    const dx = p.x - position[0];
    const dz = p.z - position[2];
    const dist = Math.hypot(dx, dz);
    const near = greetEnabled && dist < greetRadius;

    if (near && !greetedRef.current) {
      greetedRef.current = true;
      setLineIdx(0);
    } else if (!near && dist > greetRadius + 1.6 && greetedRef.current) {
      greetedRef.current = false;
      setLineIdx(null);
    }
    const nextHint = near && lineIdx === null;
    if (nextHint !== hintRef.current) {
      hintRef.current = nextHint;
      setHint(nextHint);
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setLineIdx((prev) => {
      if (prev === null) return 0;
      const next = prev + 1;
      return next >= lines.length ? null : next;
    });
  };

  return (
    <group position={position}>
      {/* 바닥 그림자 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[width * 0.42, 24]} />
        <meshBasicMaterial color="#1b2416" transparent opacity={0.26} depthWrite={false} />
      </mesh>

      {/* 아크릴 받침대 */}
      <group ref={baseRef}>
        <mesh position={[0, 0.055, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[width * 0.34, width * 0.38, 0.11, 28]} />
          <meshStandardMaterial
            color="#f2f7f0"
            transparent
            opacity={0.55}
            roughness={0.18}
            metalness={0.15}
            emissive={accent}
            emissiveIntensity={0.12}
          />
        </mesh>
        <mesh position={[0, 0.112, 0]}>
          <torusGeometry args={[width * 0.33, 0.012, 8, 32]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.5} toneMapped={false} />
        </mesh>
      </group>

      {/* 원본 이미지 패널 (항상 카메라를 바라봄) */}
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        <group ref={panelRef} position={[0, height / 2 + 0.1, 0]}>
          <mesh position={[0, 0, -0.035]}>
            <planeGeometry args={[width + 0.07, height + 0.07]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.14} depthWrite={false} />
          </mesh>
          <mesh onClick={handleClick}>
            <planeGeometry args={[width, height]} />
            <meshBasicMaterial
              map={texture}
              transparent
              alphaTest={0.02}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>
        </group>
      </Billboard>

      {/* 이름 · 역할 */}
      <Html position={[0, height + 0.34, 0]} center distanceFactor={12} zIndexRange={[8, 20]}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            pointerEvents: "none",
            whiteSpace: "nowrap",
            fontFamily: "system-ui, -apple-system, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
          }}
        >
          <span
            style={{
              background: "rgba(255,255,255,0.94)",
              border: `1.5px solid ${accent}`,
              color: "#1e2b1a",
              borderRadius: 999,
              padding: "2px 9px",
              fontSize: 12,
              fontWeight: 700,
              boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
            }}
          >
            {name}
          </span>
          <span
            style={{
              background: "rgba(30,43,26,0.72)",
              color: "#f2f7ee",
              borderRadius: 999,
              padding: "1px 7px",
              fontSize: 9.5,
              letterSpacing: "0.02em",
            }}
          >
            {role}
          </span>
        </div>
      </Html>

      {/* 근접 안내 */}
      {hint ? (
        <Html position={[0, height * 0.55, 0]} center distanceFactor={12} zIndexRange={[6, 18]}>
          <div
            style={{
              background: "rgba(255,255,255,0.9)",
              color: "#3d5236",
              borderRadius: 999,
              padding: "3px 9px",
              fontSize: 10,
              fontWeight: 600,
              whiteSpace: "nowrap",
              pointerEvents: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.16)",
            }}
          >
            클릭하면 인사해요
          </div>
        </Html>
      ) : null}

      {/* 대사 말풍선 */}
      {lineIdx !== null ? (
        <Html position={[0, height + 1.05, 0]} center distanceFactor={11} zIndexRange={[9, 22]}>
          <div
            style={{
              background: "rgba(255,255,255,0.97)",
              border: `2px solid ${accent}`,
              borderRadius: 14,
              padding: "9px 12px",
              width: 200,
              boxSizing: "border-box",
              fontSize: 11.5,
              lineHeight: 1.55,
              color: "#1e1b18",
              textAlign: "center",
              whiteSpace: "pre-wrap",
              boxShadow: "0 4px 16px rgba(0,0,0,0.22)",
              pointerEvents: "none",
              wordBreak: "keep-all",
              fontFamily: "system-ui, -apple-system, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
            }}
          >
            {lines[lineIdx]}
            <div style={{ fontSize: 9, color: "#8a8a8a", marginTop: 4 }}>
              {lineIdx + 1}/{lines.length} · 클릭해서 다음
            </div>
          </div>
        </Html>
      ) : null}
    </group>
  );
}
