"use client";
import { useLayoutEffect, useMemo, useRef } from "react";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import WorldHotspot from "./WorldHotspot";
import NpcFigure from "./NpcFigure";
import { FARM_NPCS } from "./farm-npcs";
import { sinwolHeight, terrainPatchGeometry, type PlayerPosition } from "./terrain";
import { BroadleafTree, HorizonGround, LampPost, MountainRidge } from "./Scenery";

interface SinwolSceneProps {
  onHotspotSelect: (label: string, info: string) => void;
  walkMode?: boolean;
  playerRef: React.RefObject<PlayerPosition>;
}

// 지형: 남서향 경사 10~15도 (필지분석결과서 반영) + 잔디 색 얼룩
function HillyTerrain() {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(80, 80, 96, 96);
    const positions = geo.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(positions.count * 3);
    const base = new THREE.Color("#4f7030");
    const dry = new THREE.Color("#7d8a45");
    const dark = new THREE.Color("#3a5826");

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getY(i);
      // 남서향(SW facing): 북동쪽(+z,+x)이 높고 남서쪽(-z,-x)이 낮음
      const baseSlope = z * 0.07 + x * 0.04;
      const noise =
        Math.sin(x * 0.28) * 0.55 +
        Math.cos(z * 0.22) * 0.45 +
        Math.sin(x * 0.65 + z * 0.38) * 0.28 +
        Math.cos(x * 0.15 + z * 0.6) * 0.18;
      positions.setZ(i, baseSlope + noise);

      const patch = (Math.sin(x * 0.42 + z * 0.31) + Math.cos(z * 0.53 - x * 0.17)) * 0.5;
      const c = base.clone().lerp(patch > 0.25 ? dry : dark, Math.min(1, Math.abs(patch)) * 0.45);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} geometry={geometry} receiveShadow>
      <meshStandardMaterial vertexColors roughness={0.97} metalness={0} />
    </mesh>
  );
}

/** 자두 유목 — 어린 과수, 연한 꽃 */
function PlumSapling({ position, delay = 0 }: { position: [number, number, number]; delay?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.7 + delay) * 0.012;
    }
  });
  return (
    <group position={position} ref={groupRef}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.07, 1.1, 6]} />
        <meshStandardMaterial color="#5a3a1c" roughness={0.9} />
      </mesh>
      {[
        [0, 1.25, 0, 0.5],
        [0.26, 1.05, 0.12, 0.36],
        [-0.24, 1.02, -0.1, 0.33],
        [0.05, 1.45, -0.18, 0.28],
      ].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <sphereGeometry args={[r, 8, 7]} />
          <meshStandardMaterial color={i % 2 ? "#f0c4cf" : "#e7aebd"} roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

/** 호밀밭 — 초록 바람결 */
function RyeField({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const count = 900;
  const ground = useMemo(
    () => terrainPatchGeometry(8.5, 5.5, position[0], position[2], 0.14, 20),
    [position]
  );

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    const baseX = position[0];
    const baseZ = position[2];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 8.0 + baseX;
      const z = (Math.random() - 0.5) * 5.0 + baseZ;
      dummy.position.set(x, sinwolHeight(x, z) + 0.24 + Math.random() * 0.16, z);
      dummy.rotation.set((Math.random() - 0.5) * 0.22, Math.random() * Math.PI, (Math.random() - 0.5) * 0.22);
      const s = 0.55 + Math.random() * 0.55;
      dummy.scale.set(s, s * (0.9 + Math.random() * 0.5), s);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [position]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.8) * 0.006;
      groupRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.6) * 0.004;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh geometry={ground} rotation={[-Math.PI / 2, 0, 0]} position={[position[0], 0, position[2]]} receiveShadow>
        <meshStandardMaterial color="#5f7f2e" roughness={0.95} />
      </mesh>
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow receiveShadow>
        <coneGeometry args={[0.05, 0.62, 4]} />
        <meshStandardMaterial color="#7ba33c" roughness={0.86} />
      </instancedMesh>
    </group>
  );
}

/** 잔디 포기 — 지면 질감 */
function GrassTufts() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 1400;

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 62;
      const z = (Math.random() - 0.5) * 62;
      // 개간지(흙) 안쪽은 잔디 제외
      if (x > -11 && x < 7 && z > -4.5 && z < 10.5) continue;
      dummy.position.set(x, sinwolHeight(x, z) + 0.12, z);
      dummy.rotation.set((Math.random() - 0.5) * 0.3, Math.random() * Math.PI, (Math.random() - 0.5) * 0.3);
      const s = 0.5 + Math.random() * 0.7;
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <coneGeometry args={[0.055, 0.34, 3]} />
      <meshStandardMaterial color="#6b8b3c" roughness={0.95} />
    </instancedMesh>
  );
}

/** 개간 구역 — 양토 노출, 경계 측량 말뚝 (지형에 밀착) */
function ClearedZone() {
  const patch = useMemo(() => terrainPatchGeometry(16, 13, -3, 2.5, 0.08, 28), []);
  const strips = useMemo(
    () => Array.from({ length: 7 }, (_, i) => terrainPatchGeometry(0.9, 12.4, -9.6 + i * 2, 2.5, 0.1, 18)),
    []
  );
  return (
    <group>
      <mesh geometry={patch} rotation={[-Math.PI / 2, 0, 0]} position={[-3, 0, 2.5]} receiveShadow>
        <meshStandardMaterial color="#8c5e38" roughness={0.95} />
      </mesh>
      {strips.map((geo, i) => (
        <mesh key={i} geometry={geo} rotation={[-Math.PI / 2, 0, 0]} position={[-9.6 + i * 2, 0, 2.5]}>
          <meshStandardMaterial color={i % 2 ? "#96683f" : "#7f5530"} roughness={0.96} />
        </mesh>
      ))}
      {([-10.5, 7.5] as number[]).flatMap((px) =>
        ([-4.5, 10.5] as number[]).map((pz) => (
          <group key={`survey-${px}-${pz}`} position={[px, 0.4, pz]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.07, 0.09, 1.4, 6]} />
              <meshStandardMaterial color="#5a3a18" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.72, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 0.1, 8]} />
              <meshStandardMaterial color="#c93a2a" roughness={0.6} />
            </mesh>
          </group>
        ))
      )}
    </group>
  );
}

/** 동쪽 경계 옹벽 */
function RetainingWall() {
  return (
    <group>
      <mesh position={[8.0, 0.55, 3]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 1.1, 16]} />
        <meshStandardMaterial color="#7a6e60" roughness={0.9} />
      </mesh>
      <mesh position={[8.0, 1.12, 3]} castShadow>
        <boxGeometry args={[0.8, 0.12, 16.2]} />
        <meshStandardMaterial color="#8a7e70" roughness={0.85} />
      </mesh>
    </group>
  );
}

/** 밤나무·상수리나무 식재 예정 표시 */
function PlantingSpot({
  position,
  color,
  radius,
}: {
  position: [number, number, number];
  color: string;
  radius: number;
}) {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
        <circleGeometry args={[radius, 12]} />
        <meshStandardMaterial color={color} transparent opacity={0.38} />
      </mesh>
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 1.4, 6]} />
        <meshStandardMaterial color="#6b4a26" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.45, 0]}>
        <sphereGeometry args={[0.12, 7, 7]} />
        <meshStandardMaterial color={color} roughness={0.45} emissive={color} emissiveIntensity={0.25} />
      </mesh>
    </group>
  );
}

const eastForest: [number, number, number][] = [
  [11, 0, -10], [11, 0, -5], [11, 0, 0], [11, 0, 5], [11, 0, 10], [11, 0, 15],
  [14, 0, -8], [14, 0, -3], [14, 0, 2], [14, 0, 7], [14, 0, 12],
  [17, 0, -6], [17, 0, 0], [17, 0, 6],
];
const northForest: [number, number, number][] = [
  [-8, 0, -13], [-4, 0, -13], [0, 0, -13], [4, 0, -13], [8, 0, -13],
  [-6, 0, -16], [-2, 0, -16], [2, 0, -16], [6, 0, -16],
];
const westSparseForest: [number, number, number][] = [
  [-15, 0, -4], [-15, 0, 2], [-15, 0, 8],
];

const chestnutPositions: [number, number, number][] = [
  [-8, 0.3, 1.5], [-4, 0.3, 1.5], [0, 0.3, 1.5], [4, 0.3, 1.5],
  [-8, 0.3, 5.5], [-4, 0.3, 5.5], [0, 0.3, 5.5], [4, 0.3, 5.5],
];

const oakPositions: [number, number, number][] = [
  [-10, 0.4, -2], [-7, 0.7, -4.5], [-4, 0.7, -6],
];

// 자두 유목 과수원 (서남쪽 비탈)
const plumPositions: [number, number, number][] = [
  [-6.5, 0, -7.5], [-3.5, 0, -8.5], [-0.5, 0, -9.0], [2.5, 0, -9.6],
  [-6.8, 0, -10.5], [-3.8, 0, -11.4], [-0.8, 0, -11.9], [2.2, 0, -12.4],
];

export default function SinwolScene({ onHotspotSelect, walkMode = false, playerRef }: SinwolSceneProps) {
  const npcs = FARM_NPCS.sinwol;
  const accessPath = useMemo(() => terrainPatchGeometry(2.5, 22, -10.5, 4, 0.09, 18), []);

  return (
    <>
      <PerspectiveCamera makeDefault position={[13, 10, 23]} fov={58} />

      <HorizonGround y={-2.6} />
      <MountainRidge />
      <HillyTerrain />
      <ClearedZone />
      <RetainingWall />

      <GrassTufts />
      <RyeField position={[7.0, 0.1, 12.0]} />

      {eastForest.map((pos, i) => (
        <BroadleafTree key={`e-${i}`} position={[pos[0], sinwolHeight(pos[0], pos[2]), pos[2]]} scale={0.9} tint={i} />
      ))}
      {northForest.map((pos, i) => (
        <BroadleafTree key={`n-${i}`} position={[pos[0], sinwolHeight(pos[0], pos[2]), pos[2]]} scale={0.95} tint={i + 1} />
      ))}
      {westSparseForest.map((pos, i) => (
        <BroadleafTree key={`w-${i}`} position={[pos[0], sinwolHeight(pos[0], pos[2]), pos[2]]} scale={0.75} tint={i + 2} />
      ))}

      {plumPositions.map((pos, i) => (
        <PlumSapling key={`plum-${i}`} position={[pos[0], sinwolHeight(pos[0], pos[2]), pos[2]]} delay={i} />
      ))}

      {chestnutPositions.map((pos, i) => (
        <PlantingSpot key={`chestnut-${i}`} position={pos} color="#c8973a" radius={1.6} />
      ))}
      {oakPositions.map((pos, i) => (
        <PlantingSpot key={`oak-${i}`} position={pos} color="#5a8a30" radius={1.3} />
      ))}

      <LampPost position={[-11.2, sinwolHeight(-11.2, 9.6), 9.6]} />

      {/* 접근로 (지형 밀착) */}
      <mesh geometry={accessPath} rotation={[-Math.PI / 2, 0, 0]} position={[-10.5, 0, 4]}>
        <meshStandardMaterial color="#8a7050" roughness={0.92} />
      </mesh>

      {/* 핫스팟 — 실제 임업분석 데이터 반영 (구역 사진 연결 준비) */}
      <WorldHotspot
        position={[-3, 0.5, 5]}
        label="🌰 밤나무 조성 예정지"
        info="임업분석 최적 수종 — 밤나무. 개간 구역(0.18ha) 내 식재 계획 중. 임지생산능력 Ⅱ급지(상), 양토 토양(토심 30cm 미만), 남서향 경사 10~15도. 오렌지 말뚝 = 밤나무 식재 예정 위치"
        onSelect={onHotspotSelect}
        playerRef={playerRef}
      />
      <WorldHotspot
        position={[2, 1.5, -9]}
        label="🌳 기존 활엽수림"
        info="31~40년생 기타활엽수 — 가슴높이 지름 6~18cm, 울폐도 51~70%. 보존 구역과 개간 범위 경계 확정 중. 적정조림수종: 상수리나무 (초록 말뚝 구역)"
        onSelect={onHotspotSelect}
        playerRef={playerRef}
      />
      <WorldHotspot
        position={[0, 0.5, 4]}
        label="🌿 산나물 재배 가능지"
        info="임업경영분석 결과 — 곰취·두릅·고비 재배 가능. 경사 10~15도, 남서향 경사지, 양토. 연평균기온 13~14°C, 강수량 1200~1300mm 조건. 산사태 위험 5등급(최저)"
        onSelect={onHotspotSelect}
        playerRef={playerRef}
      />
      <WorldHotspot
        position={[-10, 0.2, 7]}
        label="📍 서쪽 접근로 · 필지 경계"
        info="신월리 98번지 · 0.18ha(토지대장). 지목: 전. 계획관리지역, 성장관리계획구역. 드론 사진 기반 접근로 위치 반영 (서쪽 경계)"
        onSelect={onHotspotSelect}
        playerRef={playerRef}
      />
      <WorldHotspot
        position={[7.0, 0.6, 12.0]}
        label="🌾 호밀밭"
        info="녹비작물 호밀 재배 구역. 땅심을 살리고 잡초를 억제하는 사이갈이용으로 키우고 있습니다. 바람이 지나면 초록 물결이 일어요."
        onSelect={onHotspotSelect}
        playerRef={playerRef}
      />
      <WorldHotspot
        position={[-5, 0.7, -10]}
        label="🍑 자두 유목"
        info="자두 어린 나무 8주를 2열로 식재한 구역. 앞으로 2~3년 뒤 첫 열매를 목표로 관리합니다."
        onSelect={onHotspotSelect}
        playerRef={playerRef}
      />

      {/* 농장지기 — 원본 캐릭터 이미지 그대로 */}
      {npcs.map((npc) => (
        <NpcFigure
          key={npc.id}
          kind={npc.kind}
          name={npc.name}
          role={npc.role}
          textureUrl={npc.textureUrl}
          position={[npc.xz[0], sinwolHeight(npc.xz[0], npc.xz[1]), npc.xz[1]]}
          lines={npc.lines}
          playerRef={playerRef}
          height={npc.height}
          greetRadius={npc.greetRadius}
          accent={npc.accent}
          greetEnabled={walkMode}
        />
      ))}

      {!walkMode && (
        <OrbitControls
          makeDefault
          maxPolarAngle={Math.PI / 2.02}
          minDistance={4}
          maxDistance={46}
          enablePan
          target={[0, 1, 2]}
          enableDamping
          dampingFactor={0.08}
        />
      )}
    </>
  );
}
