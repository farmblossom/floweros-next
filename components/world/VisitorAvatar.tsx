"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export type AvatarPresetId = "farmer" | "farmerette" | "kid";

export interface AvatarPreset {
  id: AvatarPresetId;
  label: string;
  icon: string;
  shirt: string;
  pants: string;
  hat: string;
  skin: string;
  scale: number;
  apron?: string;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: "farmer",
    label: "작업복 방문객",
    icon: "man",
    shirt: "#3f6fa8",
    pants: "#39485a",
    hat: "#d9b878",
    skin: "#f0c69c",
    scale: 1,
  },
  {
    id: "farmerette",
    label: "앞치마 방문객",
    icon: "woman",
    shirt: "#c96a58",
    pants: "#5b6f86",
    hat: "#e6d6b8",
    skin: "#f4cfae",
    scale: 0.98,
    apron: "#efe7d6",
  },
  {
    id: "kid",
    label: "어린이 방문객",
    icon: "child_care",
    shirt: "#e8b93a",
    pants: "#4a6b8a",
    hat: "#7fae5a",
    skin: "#f7d3b0",
    scale: 0.74,
  },
];

interface VisitorAvatarProps {
  preset: AvatarPresetId;
  /** 컨트롤러가 공유하는 이동 상태 (걷기 애니메이션 트리거) */
  movingState: React.RefObject<{ moving: boolean }>;
}

/** 방문자(플레이어) — 사람 형태 3D 아바타. 걷고 있을 때 팔·다리가 움직인다. */
export default function VisitorAvatar({ preset, movingState }: VisitorAvatarProps) {
  const config = useMemo(
    () => AVATAR_PRESETS.find((p) => p.id === preset) ?? AVATAR_PRESETS[0],
    [preset]
  );

  const bodyRef = useRef<THREE.Group>(null);
  const legLRef = useRef<THREE.Group>(null);
  const legRRef = useRef<THREE.Group>(null);
  const armLRef = useRef<THREE.Group>(null);
  const armRRef = useRef<THREE.Group>(null);
  const phaseRef = useRef(0);

  useFrame((_, delta) => {
    const moving = movingState.current?.moving ?? false;
    const speed = moving ? 9 : 1.6;
    phaseRef.current += delta * speed;
    const swing = moving ? 0.6 : 0.04;

    const sin = Math.sin(phaseRef.current);
    if (legLRef.current) legLRef.current.rotation.x = sin * swing;
    if (legRRef.current) legRRef.current.rotation.x = -sin * swing;
    if (armLRef.current) armLRef.current.rotation.x = -sin * swing * 0.8;
    if (armRRef.current) armRRef.current.rotation.x = sin * swing * 0.8;
    if (bodyRef.current) {
      bodyRef.current.position.y = moving ? Math.abs(Math.sin(phaseRef.current)) * 0.045 : 0;
    }
  });

  const s = config.scale;

  return (
    <group scale={[s, s, s]}>
      <group ref={bodyRef}>
        {/* 다리 */}
        <group ref={legLRef} position={[-0.1, 0.58, 0]}>
          <mesh position={[0, -0.29, 0]} castShadow>
            <cylinderGeometry args={[0.075, 0.065, 0.58, 8]} />
            <meshStandardMaterial color={config.pants} roughness={0.85} />
          </mesh>
          <mesh position={[0, -0.6, 0.04]} castShadow>
            <boxGeometry args={[0.15, 0.1, 0.26]} />
            <meshStandardMaterial color="#2c2a28" roughness={0.9} />
          </mesh>
        </group>
        <group ref={legRRef} position={[0.1, 0.58, 0]}>
          <mesh position={[0, -0.29, 0]} castShadow>
            <cylinderGeometry args={[0.075, 0.065, 0.58, 8]} />
            <meshStandardMaterial color={config.pants} roughness={0.85} />
          </mesh>
          <mesh position={[0, -0.6, 0.04]} castShadow>
            <boxGeometry args={[0.15, 0.1, 0.26]} />
            <meshStandardMaterial color="#2c2a28" roughness={0.9} />
          </mesh>
        </group>

        {/* 몸통 */}
        <mesh position={[0, 0.92, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.23, 0.56, 12]} />
          <meshStandardMaterial color={config.shirt} roughness={0.82} />
        </mesh>
        {config.apron ? (
          <mesh position={[0, 0.86, 0.2]}>
            <boxGeometry args={[0.3, 0.42, 0.03]} />
            <meshStandardMaterial color={config.apron} roughness={0.9} />
          </mesh>
        ) : null}

        {/* 어깨 */}
        <mesh position={[0, 1.2, 0]}>
          <sphereGeometry args={[0.2, 10, 8]} />
          <meshStandardMaterial color={config.shirt} roughness={0.82} />
        </mesh>

        {/* 팔 */}
        <group ref={armLRef} position={[-0.25, 1.18, 0]}>
          <mesh position={[0, -0.22, 0]} castShadow>
            <cylinderGeometry args={[0.055, 0.05, 0.45, 8]} />
            <meshStandardMaterial color={config.shirt} roughness={0.85} />
          </mesh>
          <mesh position={[0, -0.46, 0]}>
            <sphereGeometry args={[0.06, 8, 6]} />
            <meshStandardMaterial color={config.skin} roughness={0.7} />
          </mesh>
        </group>
        <group ref={armRRef} position={[0.25, 1.18, 0]}>
          <mesh position={[0, -0.22, 0]} castShadow>
            <cylinderGeometry args={[0.055, 0.05, 0.45, 8]} />
            <meshStandardMaterial color={config.shirt} roughness={0.85} />
          </mesh>
          <mesh position={[0, -0.46, 0]}>
            <sphereGeometry args={[0.06, 8, 6]} />
            <meshStandardMaterial color={config.skin} roughness={0.7} />
          </mesh>
        </group>

        {/* 목 + 머리 */}
        <mesh position={[0, 1.34, 0]}>
          <cylinderGeometry args={[0.075, 0.085, 0.1, 8]} />
          <meshStandardMaterial color={config.skin} roughness={0.7} />
        </mesh>
        <mesh position={[0, 1.5, 0]} castShadow>
          <sphereGeometry args={[0.17, 16, 14]} />
          <meshStandardMaterial color={config.skin} roughness={0.65} />
        </mesh>
        {/* 눈 */}
        <mesh position={[-0.06, 1.52, 0.155]}>
          <sphereGeometry args={[0.022, 6, 6]} />
          <meshStandardMaterial color="#2b2622" />
        </mesh>
        <mesh position={[0.06, 1.52, 0.155]}>
          <sphereGeometry args={[0.022, 6, 6]} />
          <meshStandardMaterial color="#2b2622" />
        </mesh>

        {/* 모자 */}
        <mesh position={[0, 1.62, 0]} castShadow>
          <cylinderGeometry args={[0.33, 0.33, 0.03, 16]} />
          <meshStandardMaterial color={config.hat} roughness={0.9} />
        </mesh>
        <mesh position={[0, 1.68, 0]} castShadow>
          <cylinderGeometry args={[0.16, 0.18, 0.13, 14]} />
          <meshStandardMaterial color={config.hat} roughness={0.9} />
        </mesh>
        <mesh position={[0, 1.63, 0]}>
          <cylinderGeometry args={[0.185, 0.185, 0.035, 14]} />
          <meshStandardMaterial color="#9c7a4a" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}
