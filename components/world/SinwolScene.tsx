"use client";
import { useMemo } from "react";
import { Sky, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import WorldHotspot from "./WorldHotspot";
import CharacterSprite from "./CharacterSprite";

// 퍼뜨기 순찰 경로 — 접근로 · 개간 구역
const PUTTEOGI_WAYPOINTS: [number, number, number][] = [
  [7, 0.2, 9],
  [7, 0.2, 3],
  [0, 0.3, 4],
  [-5, 0.4, 5],
  [-5, 0.4, 2],
  [0, 0.3, 4],
  [7, 0.2, 3],
  [7, 0.2, 9],
];

const PUTTEOGI_DIALOG = [
  "안녕하세요! 신월리 과원 조성 현장이에요 🌿",
  "541평 경사지에 과원을 만들어 가는 과정을 기록 중이에요",
  "기존 수목을 보존하면서 새 나무를 심을 계획이에요",
  "드론·측량 자료가 확보되면 정밀하게 업데이트될 예정이에요",
  "현재 3D 장면은 시뮬레이션 초안입니다 🔧",
];

interface SinwolSceneProps {
  onHotspotSelect: (label: string, info: string) => void;
  walkMode?: boolean;
}

function HillyTerrain() {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(70, 70, 40, 40);
    const positions = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getY(i);
      const baseSlope = -z * 0.18;
      const noise = Math.sin(x * 0.3) * 0.6 + Math.cos(z * 0.25) * 0.5 + Math.sin(x * 0.7 + z * 0.4) * 0.3;
      positions.setZ(i, baseSlope + noise);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} geometry={geometry}>
      <meshStandardMaterial color="#4a6b2a" roughness={0.95} />
    </mesh>
  );
}

function ExistingTree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.2, 0.35, 3, 7]} />
        <meshStandardMaterial color="#4a2e10" roughness={0.9} />
      </mesh>
      <mesh position={[0, 4.0, 0]}>
        <sphereGeometry args={[1.6, 8, 8]} />
        <meshStandardMaterial color="#1e5218" roughness={0.85} />
      </mesh>
      <mesh position={[0.6, 3.2, 0.4]}>
        <sphereGeometry args={[0.9, 7, 7]} />
        <meshStandardMaterial color="#245c1e" roughness={0.85} />
      </mesh>
    </group>
  );
}

function ClearedZone() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-5, 0.3, 5]}>
        <planeGeometry args={[18, 14]} />
        <meshStandardMaterial color="#8B7355" roughness={0.9} />
      </mesh>
      {([-14, 4] as number[]).flatMap((x) =>
        ([-2, 12] as number[]).map((z) => (
          <mesh key={`stake-${x}-${z}`} position={[x, 0.4, z]}>
            <cylinderGeometry args={[0.08, 0.1, 1.5, 6]} />
            <meshStandardMaterial color="#5a3a18" roughness={0.8} />
          </mesh>
        ))
      )}
    </group>
  );
}

function PlannedOrchardZone({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <circleGeometry args={[2, 12]} />
        <meshStandardMaterial color="#c8a06e" transparent opacity={0.5} />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 1.5, 6]} />
        <meshStandardMaterial color="#ff9900" roughness={0.6} />
      </mesh>
    </group>
  );
}

const forestPositions: [number, number, number][] = [
  [-18, 0, -20], [-12, 0.5, -22], [-6, 1, -24], [0, 1.5, -25], [6, 2, -24],
  [12, 1.8, -22], [18, 1.2, -20], [-20, 0, -12], [20, 0.8, -12],
  [-22, -0.5, 0], [22, 0.3, 0], [-18, 0, -6], [18, 0.6, -8],
];
const midTreePositions: [number, number, number][] = [
  [-8, 1, -10], [4, 1.5, -12], [-2, 0.8, -8], [10, 1.2, -10],
];
const orchardPositions: [number, number, number][] = [
  [-8, 0.5, 2], [-4, 0.4, 2], [0, 0.3, 2], [4, 0.3, 2],
  [-8, 0.5, 6], [-4, 0.4, 6], [0, 0.3, 6], [4, 0.3, 6],
];

export default function SinwolScene({ onHotspotSelect, walkMode = false }: SinwolSceneProps) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[5, 12, 20]} fov={68} />
      {/* 흐린 오후 — 덕산리와 완전히 다른 분위기 */}
      <Sky sunPosition={[30, 20, -80]} turbidity={4} rayleigh={1.5} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[-15, 25, -10]} intensity={1.1} castShadow />
      <fog attach="fog" args={["#c0d8b8", 35, 80]} />

      <HillyTerrain />
      <ClearedZone />

      {forestPositions.map((pos, i) => (
        <ExistingTree key={i} position={pos} scale={0.9} />
      ))}
      {midTreePositions.map((pos, i) => (
        <ExistingTree key={`mid-${i}`} position={pos} scale={0.6} />
      ))}
      {orchardPositions.map((pos, i) => (
        <PlannedOrchardZone key={`plan-${i}`} position={pos} />
      ))}

      {/* 접근 동선 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[8, 0.2, 5]}>
        <planeGeometry args={[2.5, 20]} />
        <meshStandardMaterial color="#a08060" roughness={0.9} />
      </mesh>

      <WorldHotspot
        position={[-5, 0.5, 5]}
        label="🌱 개간 구역"
        info="신월리 98번지 개간 중 평탄 구역 — 과원 조성 예정 (현장 자료 반영 전 초안)"
        onSelect={onHotspotSelect}
      />
      <WorldHotspot
        position={[-2, 1.5, -8]}
        label="🌳 기존 수목"
        info="현존 수목 구역 — 경사지·숲. 개간 범위 확정 후 정확한 경계 반영 예정"
        onSelect={onHotspotSelect}
      />
      <WorldHotspot
        position={[0, 0.5, 4]}
        label="🌳 과원 계획지"
        info="과원 조성 예정 구역 — 품종·식재 계획 확정 전 시뮬레이션 배치"
        onSelect={onHotspotSelect}
      />

      <CharacterSprite
        waypoints={PUTTEOGI_WAYPOINTS}
        textureUrl="/assets/brand/putteogi-row.png"
        name="퍼뜨기"
        dialogLines={PUTTEOGI_DIALOG}
        speed={1.0}
        size={[1.3, 1.7]}
      />

      {!walkMode && (
        <OrbitControls
          maxPolarAngle={Math.PI / 2.0}
          minDistance={4}
          maxDistance={40}
          enablePan={true}
          target={[0, 1, 0]}
        />
      )}
    </>
  );
}
