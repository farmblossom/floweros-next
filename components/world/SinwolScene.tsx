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
import { PhotoSpotSign } from "./Decorations";
import { spotsFor, type PhotoSpot } from "./photo-spots";

interface SinwolSceneProps {
  onHotspotSelect: (label: string, info: string) => void;
  walkMode?: boolean;
  playerRef: React.RefObject<PlayerPosition>;
  activeId: string | null;
  onTalk: (id: string | null) => void;
  /** 포토존 — 지기들이 이 자리로 모여 선다 */
  photoSpot?: PhotoSpot | null;
  photoMode?: boolean;
  orbitTarget?: [number, number, number];
  onPhotoSpotSelect?: (id: string) => void;
  /** 세로(모바일) 화면 — 카메라를 뒤로 물린다 */
  portrait?: boolean;
}

/**
 * 캐릭터가 선 자리의 발밑 지형 — 몸통 반경 안에서 가장 높은 지점.
 * 경사면이 발·몸통 아래를 스쳐 가리지 않도록 그만큼 올려 세운다.
 */
function footGroundY(x: number, z: number, radius = 0.34): number {
  let y = sinwolHeight(x, z);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    y = Math.max(y, sinwolHeight(x + Math.cos(a) * radius, z + Math.sin(a) * radius));
  }
  return y + 0.02;
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

/**
 * 호밀 포기 — 파릇하게 올라온 이파리. 포기마다 키와 기우는 방향이 조금씩 다르고,
 * 바람이 지나면 밭 전체가 초록 물결로 흔들린다.
 */
function RyeBlades({
  baseX,
  baseZ,
  width,
  depth,
  count,
  lift = 0.16,
  rowStart,
  rowStep,
  rowCount,
  rowSpread,
}: {
  baseX: number;
  baseZ: number;
  width: number;
  depth: number;
  count: number;
  lift?: number;
  /** 고랑 줄 배치 — 주면 줄을 따라 촘촘히 올라온다 */
  rowStart?: number;
  rowStep?: number;
  rowCount?: number;
  rowSpread?: number;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      let x: number;
      if (rowStart !== undefined && rowStep !== undefined && rowCount !== undefined) {
        const row = Math.floor(Math.random() * rowCount);
        x = rowStart + row * rowStep + (Math.random() - 0.5) * (rowSpread ?? 1.2);
      } else {
        x = (Math.random() - 0.5) * width + baseX;
      }
      const z = (Math.random() - 0.5) * depth + baseZ;
      const s = 0.62 + Math.random() * 0.4;
      dummy.position.set(x, sinwolHeight(x, z) + lift + 0.14 * s - 0.02, z);
      dummy.rotation.set((Math.random() - 0.5) * 0.22, Math.random() * Math.PI, (Math.random() - 0.5) * 0.22);
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [baseX, baseZ, width, depth, count, lift, rowStart, rowStep, rowCount, rowSpread]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.8) * 0.006;
      groupRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.6) * 0.004;
    }
  });

  return (
    <group ref={groupRef}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]} receiveShadow>
        <coneGeometry args={[0.035, 0.28, 3]} />
        <meshStandardMaterial color="#86bd45" roughness={0.86} />
      </instancedMesh>
    </group>
  );
}

/** 호밀밭 — 흙바닥 위에 파릇하게 올라온 호밀 */
function RyeField({
  position,
  width = 8.5,
  depth = 5.5,
  count = 1200,
  lift = 0.14,
}: {
  position: [number, number, number];
  width?: number;
  depth?: number;
  count?: number;
  lift?: number;
}) {
  const [px, , pz] = position;
  const ground = useMemo(
    () => terrainPatchGeometry(width, depth, px, pz, lift, 20),
    [width, depth, px, pz, lift]
  );
  return (
    <group>
      <mesh geometry={ground} rotation={[-Math.PI / 2, 0, 0]} position={[px, 0, pz]} receiveShadow>
        <meshStandardMaterial color="#5d8f2f" roughness={0.95} />
      </mesh>
      <RyeBlades
        baseX={px}
        baseZ={pz}
        width={width}
        depth={depth}
        count={count}
        lift={lift + 0.04}
      />
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
      // 경작지(호밀밭) 안쪽은 잔디 제외
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


/** 남동쪽 모서리의 커다란 팽나무와 그늘 쉼터 */
function ZelkovaShade({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* 굵은 줄기 */}
      <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.55, 0.85, 4.4, 12]} />
        <meshStandardMaterial color="#4a3520" roughness={0.95} />
      </mesh>
      {/* 뿌리 둔덕 */}
      <mesh position={[0, 0.2, 0]} scale={[1.5, 0.25, 1.4]}>
        <sphereGeometry args={[1, 18, 12]} />
        <meshStandardMaterial color="#5d4a2c" roughness={1} />
      </mesh>
      {/* 큰 가지 */}
      {[
        [0.9, 4.2, 0.4, 0.22, 2.2, 0.6],
        [-0.8, 4.3, -0.3, 0.2, 2.0, -0.7],
        [0.2, 4.4, -0.8, 0.18, 1.8, -0.9],
      ].map(([x, y, z, r, len, tilt], i) => (
        <mesh key={`branch-${i}`} position={[x, y, z]} rotation={[tilt, 0, i === 1 ? 0.5 : -0.5]} castShadow>
          <cylinderGeometry args={[r * 0.6, r, len, 8]} />
          <meshStandardMaterial color="#4a3520" roughness={0.95} />
        </mesh>
      ))}
      {/* 넓게 퍼진 잎 — 팽나무 특유의 둥근 수관 */}
      {[
        [0, 5.9, 0, 2.3, 1.6],
        [1.7, 5.5, 0.5, 1.7, 1.2],
        [-1.6, 5.4, -0.4, 1.6, 1.15],
        [0.5, 5.3, 1.7, 1.5, 1.1],
        [-0.6, 5.4, -1.7, 1.5, 1.1],
        [1.3, 6.7, -0.9, 1.4, 1.0],
        [-1.1, 6.6, 1.0, 1.35, 0.95],
      ].map(([x, y, z, r, ry], i) => (
        <mesh key={`canopy-${i}`} position={[x, y, z]} scale={[r, ry, r]} castShadow>
          <sphereGeometry args={[1, 14, 12]} />
          <meshStandardMaterial color={i % 2 ? "#2f6b26" : "#3a7d2c"} roughness={0.88} />
        </mesh>
      ))}

      {/* 나무 평상 */}
      <group position={[1.9, 0.0, 1.3]} rotation={[0, -0.3, 0]}>
        <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.6, 0.14, 1.8]} />
          <meshStandardMaterial color="#b1895a" roughness={0.9} />
        </mesh>
        {[
          [-1.15, 0.38, -0.75],
          [1.15, 0.38, -0.75],
          [-1.15, 0.38, 0.75],
          [1.15, 0.38, 0.75],
        ].map((p, i) => (
          <mesh key={`leg-${i}`} position={p as [number, number, number]} castShadow>
            <boxGeometry args={[0.16, 0.76, 0.16]} />
            <meshStandardMaterial color="#8a6640" roughness={0.92} />
          </mesh>
        ))}
        {/* 방석 */}
        <mesh position={[0, 0.53, 0]}>
          <boxGeometry args={[1.4, 0.08, 1.0]} />
          <meshStandardMaterial color="#d9b48a" roughness={0.95} />
        </mesh>
      </group>

      {/* 그늘 바닥 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.4, 0.03, 0.2]}>
        <circleGeometry args={[4.6, 32]} />
        <meshBasicMaterial color="#22301c" transparent opacity={0.16} depthWrite={false} />
      </mesh>
    </group>
  );
}

/** 경작지 — 밭 전체에 파종한 호밀. 고랑을 따라 파릇하게 올라오고, 경계 측량 말뚝이 서 있다 */
const ROW_START = -8.4;
const ROW_STEP = 1.75;
const ROW_COUNT = 8;

function RyePaddock() {
  const patch = useMemo(() => terrainPatchGeometry(14, 12.6, -2, 2.5, 0.08, 30), []);
  const rows = useMemo(
    () =>
      Array.from({ length: ROW_COUNT }, (_, i) =>
        terrainPatchGeometry(1.15, 12.0, ROW_START + i * ROW_STEP, 2.5, 0.11, 20)
      ),
    []
  );
  return (
    <group>
      <mesh geometry={patch} rotation={[-Math.PI / 2, 0, 0]} position={[-2, 0, 2.5]} receiveShadow>
        <meshStandardMaterial color="#54862b" roughness={0.95} />
      </mesh>
      {rows.map((geo, i) => (
        <mesh key={i} geometry={geo} rotation={[-Math.PI / 2, 0, 0]} position={[ROW_START + i * ROW_STEP, 0, 2.5]}>
          <meshStandardMaterial color={i % 2 ? "#74aa3f" : "#6aa03a"} roughness={0.96} />
        </mesh>
      ))}
      <RyeBlades
        baseX={-2}
        baseZ={2.5}
        width={14}
        depth={12.6}
        count={6000}
        lift={0.12}
        rowStart={ROW_START}
        rowStep={ROW_STEP}
        rowCount={ROW_COUNT}
        rowSpread={0.9}
      />
      {([-10.5, 7.5] as number[]).flatMap((px) =>
        ([-4.5, 10.5] as number[]).map((pz) => (
          <group key={`survey-${px}-${pz}`} position={[px, sinwolHeight(px, pz) + 0.4, pz]}>
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

/** 나무 식재 예정 표시 — 밤나무(주황)·상수리나무(초록) 말뚝 */
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
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.16, 0]}>
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

// 나무 식재 예정 자리 (x, z) — 높이는 지형에서 계산한다
const chestnutPositions: [number, number][] = [
  [-8, 1.5], [-4, 1.5], [0, 1.5], [4, 1.5],
  [-8, 5.5], [-4, 5.5], [0, 5.5], [4, 5.5],
];

const oakPositions: [number, number][] = [
  [-10, -2], [-7, -4.5], [-4, -6],
];

// 자두 유목 과수원 (서남쪽 비탈)
const plumPositions: [number, number, number][] = [
  [-6.5, 0, -7.5], [-3.5, 0, -8.5], [-0.5, 0, -9.0], [2.5, 0, -9.6],
  [-6.8, 0, -10.5], [-3.8, 0, -11.4], [-0.8, 0, -11.9], [2.2, 0, -12.4],
];

export default function SinwolScene({
  onHotspotSelect,
  walkMode = false,
  playerRef,
  activeId,
  onTalk,
  photoSpot = null,
  photoMode = false,
  orbitTarget = [0, 1, 2],
  onPhotoSpotSelect,
  portrait = false,
}: SinwolSceneProps) {
  const npcs = FARM_NPCS.sinwol;
  const accessPath = useMemo(() => terrainPatchGeometry(2.5, 22, -10.5, 4, 0.09, 18), []);
  const mainNpcs = useMemo(() => npcs.filter((n) => n.main), [npcs]);
  const spots = useMemo(() => spotsFor("sinwol"), []);

  // 포토존에 모일 때 — 지기마다 설 자리
  const gatherFor = (id: string): { x: number; z: number; yaw: number; groundY?: number } | null => {
    if (!photoSpot) return null;
    const idx = mainNpcs.findIndex((m) => m.id === id);
    const stand = idx >= 0 ? photoSpot.stands[idx] : null;
    if (!stand) return null;
    return { x: stand[0], z: stand[1], yaw: photoSpot.yaw, groundY: footGroundY(stand[0], stand[1]) };
  };

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={portrait ? [19.5, 15, 34] : [13, 10, 23]}
        fov={portrait ? 60 : 58}
      />

      <HorizonGround y={-2.6} />
      <MountainRidge />
      <HillyTerrain />
      <RyePaddock />
      <RetainingWall />

      <GrassTufts />
      <RyeField position={[7.0, 0.1, 12.0]} count={1800} />

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
        <PlantingSpot key={`chestnut-${i}`} position={[pos[0], sinwolHeight(pos[0], pos[1]), pos[1]]} color="#c8973a" radius={1.6} />
      ))}
      {oakPositions.map((pos, i) => (
        <PlantingSpot key={`oak-${i}`} position={[pos[0], sinwolHeight(pos[0], pos[1]), pos[1]]} color="#5a8a30" radius={1.3} />
      ))}

      <LampPost position={[-11.2, sinwolHeight(-11.2, 9.6), 9.6]} />

      {/* 남동쪽 모서리 — 커다란 팽나무 그늘 쉼터 */}
      <ZelkovaShade position={[15.4, sinwolHeight(15.4, 15.0), 15.0]} />

      {/* 포토존 표지판 — 클릭하면 그 자리 시점으로 */}
      {spots.map((sp) => (
        <PhotoSpotSign
          key={sp.id}
          position={[sp.sign.x, sinwolHeight(sp.sign.x, sp.sign.z), sp.sign.z]}
          rotationY={sp.sign.rotY}
          onSelect={() => onPhotoSpotSelect?.(sp.id)}
        />
      ))}

      {/* 접근로 (지형 밀착) */}
      <mesh geometry={accessPath} rotation={[-Math.PI / 2, 0, 0]} position={[-10.5, 0, 4]}>
        <meshStandardMaterial color="#8a7050" roughness={0.92} />
      </mesh>

      {/* 핫스팟 — 실제 임업분석 데이터 반영 (구역 사진 연결 준비) */}
      <WorldHotspot
        position={[-6.4, sinwolHeight(-6.4, 3.6) + 0.4, 3.6]}
        label="🌳 나무 조성예정지"
        info="밤나무·상수리나무를 심을 자리입니다. 개간 구역(0.18ha) 안에서 밤나무(임지생산능력 Ⅱ급지·양토·남서향 경사 10~15도)와 상수리나무 식재 위치를 잡아 두었습니다. 주황 말뚝 = 밤나무, 초록 말뚝 = 상수리나무 예정지. 지금은 밭 전체에 호밀을 파종해 땅심을 올리는 중입니다."
        onSelect={onHotspotSelect}
        hidden={photoMode}
        playerRef={playerRef}
      />
      <WorldHotspot
        position={[2, 1.5, -9]}
        label="🌳 기존 활엽수림"
        info="31~40년생 기타활엽수 — 가슴높이 지름 6~18cm, 울폐도 51~70%. 보존 구역과 개간 범위 경계 확정 중. 적정조림수종: 상수리나무 (초록 말뚝 구역)"
        onSelect={onHotspotSelect}
        hidden={photoMode}
        playerRef={playerRef}
      />
      <WorldHotspot
        position={[-10, 0.2, 7]}
        label="📍 서쪽 접근로 · 필지 경계"
        info="신월리 98번지 · 0.18ha(토지대장). 지목: 전. 계획관리지역, 성장관리계획구역. 드론 사진 기반 접근로 위치 반영 (서쪽 경계)"
        onSelect={onHotspotSelect}
        hidden={photoMode}
        playerRef={playerRef}
      />
      <WorldHotspot
        position={[2.2, sinwolHeight(2.2, 7.4) + 0.5, 7.4]}
        label="🌾 호밀밭"
        info="신월리 농장 밭 전체에 파종한 호밀. 파릇하게 올라온 호밀이 고랑을 따라 자라고 있습니다. 땅심을 살리고 잡초를 억제하는 녹비작물로, 사이갈이해 땅에 되돌립니다. 바람이 지나면 초록 물결이 일어요."
        onSelect={onHotspotSelect}
        hidden={photoMode}
        playerRef={playerRef}
      />
      <WorldHotspot
        position={[15.4, sinwolHeight(15.4, 15.0) + 1.2, 15.0]}
        label="🌳 팽나무 그늘 쉼터"
        info="신월리 농장 남동쪽 모서리의 큰 팽나무. 잎이 넓게 퍼져 한여름에도 시원한 그늘을 만들어 줍니다. 그 아래 평상에 앉아 밭을 바라보며 쉬어 가세요."
        onSelect={onHotspotSelect}
        hidden={photoMode}
        playerRef={playerRef}
      />
      <WorldHotspot
        position={[-5, 0.7, -10]}
        label="🍑 자두 유목"
        info="자두 어린 나무 8주를 2열로 식재한 구역. 앞으로 2~3년 뒤 첫 열매를 목표로 관리합니다."
        onSelect={onHotspotSelect}
        hidden={photoMode}
        playerRef={playerRef}
      />

      {/* 농장지기 — 원본 캐릭터 이미지 그대로 */}
      {npcs.map((npc) => (
        <NpcFigure
          key={npc.id}
          id={npc.id}
          activeId={activeId}
          onTalk={onTalk}
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
          walkAxis={npc.walkAxis ?? "x"}
          gatherTo={gatherFor(npc.id)}
        />
      ))}

      {!walkMode && (
        <OrbitControls
          makeDefault
          enabled={!photoMode}
          maxPolarAngle={Math.PI / 2.02}
          minDistance={portrait ? 3.5 : 4}
          maxDistance={portrait ? 95 : 46}
          enablePan
          target={orbitTarget}
          enableDamping
          dampingFactor={0.08}
        />
      )}
    </>
  );
}
