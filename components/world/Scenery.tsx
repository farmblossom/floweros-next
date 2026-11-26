"use client";
import { useMemo } from "react";
import * as THREE from "three";

/** 지평선 너머까지 이어지는 땅 — 지형 밖 빈 곳을 가린다 */
export function HorizonGround({ color = "#4a6a34", y = -1.6 }: { color?: string; y?: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} receiveShadow>
      <circleGeometry args={[170, 48]} />
      <meshStandardMaterial color={color} roughness={1} />
    </mesh>
  );
}

/** 멀리 밀양 산자락 능선 실루엣 (안개에 잠기는 원경) */
export function MountainRidge({ radiusBase = 62, heightBase = 14 }: { radiusBase?: number; heightBase?: number }) {
  const peaks = useMemo(() => {
    const items: { pos: [number, number, number]; r: number; h: number; color: string }[] = [];
    const colors = ["#6d8a74", "#62806c", "#77957f", "#5b7a66"];
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2 + 0.22;
      const radius = radiusBase + ((i * 9) % 34);
      const h = heightBase + ((i * 11) % 12);
      items.push({
        pos: [Math.cos(angle) * radius, -1, Math.sin(angle) * radius],
        r: 16 + ((i * 5) % 12),
        h,
        color: colors[i % colors.length],
      });
    }
    return items;
  }, [radiusBase, heightBase]);

  return (
    <group>
      {peaks.map((p, i) => (
        <mesh key={i} position={[p.pos[0], p.pos[1] + p.h * 0.22, p.pos[2]]} scale={[p.r, p.h * 0.62, p.r]}>
          <sphereGeometry args={[0.5, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={p.color} roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

/** 활엽수 — 낮은 폴리, 색조 변화 */
export function BroadleafTree({
  position,
  scale = 1,
  tint = 0,
}: {
  position: [number, number, number];
  scale?: number;
  tint?: number;
}) {
  const palette = ["#1c4d14", "#245c1a", "#1f5218", "#2c6620"];
  const leaf = palette[tint % palette.length];
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1.3, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.26, 2.6, 7]} />
        <meshStandardMaterial color="#3d2208" roughness={0.92} />
      </mesh>
      <mesh position={[0, 3.6, 0]} castShadow>
        <sphereGeometry args={[1.4, 10, 9]} />
        <meshStandardMaterial color={leaf} roughness={0.88} />
      </mesh>
      <mesh position={[0.55, 2.9, 0.35]} castShadow>
        <sphereGeometry args={[0.85, 8, 8]} />
        <meshStandardMaterial color="#245c1a" roughness={0.86} />
      </mesh>
      <mesh position={[-0.4, 3.2, -0.3]} castShadow>
        <sphereGeometry args={[0.75, 8, 8]} />
        <meshStandardMaterial color="#1f5218" roughness={0.86} />
      </mesh>
    </group>
  );
}

/** 밭 흙 결 — 고랑 사이 질감 */
export function SoilStrips({
  count,
  spacing,
  length,
  colorA = "#96683f",
  colorB = "#7f5530",
  y = 0.02,
}: {
  count: number;
  spacing: number;
  length: number;
  colorA?: string;
  colorB?: string;
  y?: number;
}) {
  return (
    <group>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[(i - (count - 1) / 2) * spacing, y, 0]}>
          <planeGeometry args={[spacing * 0.55, length]} />
          <meshStandardMaterial color={i % 2 ? colorA : colorB} roughness={0.97} />
        </mesh>
      ))}
    </group>
  );
}

/** 원경 안개색을 살짝 섞은 재질 색 (먼 사물이 하늘에 녹아들도록) */
export function hazeColor(base: string, amount = 0.35): THREE.Color {
  const c = new THREE.Color(base);
  return c.lerp(new THREE.Color("#dfe9e2"), amount);
}

/** 밤에 은은히 켜지는 농장 등불 */
export function LampPost({ position, height = 2.6 }: { position: [number, number, number]; height?: number }) {
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.07, height, 8]} />
        <meshStandardMaterial color="#4a3a26" roughness={0.9} />
      </mesh>
      <mesh position={[0.16, height - 0.1, 0]}>
        <boxGeometry args={[0.34, 0.06, 0.06]} />
        <meshStandardMaterial color="#3a2e1e" roughness={0.9} />
      </mesh>
      <mesh position={[0.32, height - 0.28, 0]}>
        <cylinderGeometry args={[0.1, 0.12, 0.22, 8]} />
        <meshStandardMaterial color="#ffe6b0" emissive="#ffca6a" emissiveIntensity={1.6} toneMapped={false} />
      </mesh>
      <pointLight position={[0.32, height - 0.28, 0]} color="#ffcf8a" intensity={7} distance={11} decay={2} />
    </group>
  );
}
