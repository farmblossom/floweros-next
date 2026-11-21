"use client";
import { useMemo } from "react";
import { Sky, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import WorldHotspot from "./WorldHotspot";
import CharacterSprite from "./CharacterSprite";

// 퍼뜨기 순찰 경로 — 서쪽 접근로 → 개간 구역 중앙 → 동쪽 경계
// 드론 사진 반영: 접근로가 서쪽(왼쪽)에 위치
const PUTTEOGI_WAYPOINTS: [number, number, number][] = [
  [-9, 0.2, 9],
  [-5, 0.3, 5],
  [0, 0.3, 4],
  [4, 0.3, 2],
  [4, 0.3, 6],
  [0, 0.3, 4],
  [-5, 0.3, 5],
  [-9, 0.2, 9],
];

// 필지분석 데이터 반영 (경남 밀양시 초동면 신월리 98 · 0.18ha · 임지생산능력 Ⅱ급지(상))
const PUTTEOGI_DIALOG = [
  "신월리 98번지 0.18ha 개간 현장이에요 🌿",
  "31~40년생 활엽수림 — 지름 6~18cm, 울폐도 51~70% 분포해요",
  "밤나무 재배 최적지! 상수리나무 조림도 추천돼요 🌰",
  "남서향 경사지(10~15도) — 일조 좋은 과수 명당이에요 ☀️",
  "산사태 위험 5등급(최저) — 안전한 땅이에요 ✅",
];

interface SinwolSceneProps {
  onHotspotSelect: (label: string, info: string) => void;
  walkMode?: boolean;
}

// 지형: 남서향 경사 10~15도 (필지분석결과서 반영)
function HillyTerrain() {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(80, 80, 44, 44);
    const positions = geo.attributes.position as THREE.BufferAttribute;
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
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} geometry={geometry}>
      <meshStandardMaterial color="#435f28" roughness={0.96} />
    </mesh>
  );
}

// 활엽수 — 기타활엽수 31~40년생, 지름 6~18cm (실측 반영: 중소형 나무)
function BroadleafTree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1.3, 0]}>
        <cylinderGeometry args={[0.16, 0.26, 2.6, 7]} />
        <meshStandardMaterial color="#3d2208" roughness={0.92} />
      </mesh>
      <mesh position={[0, 3.6, 0]}>
        <sphereGeometry args={[1.4, 8, 8]} />
        <meshStandardMaterial color="#1c4d14" roughness={0.86} />
      </mesh>
      <mesh position={[0.55, 2.9, 0.35]}>
        <sphereGeometry args={[0.85, 7, 7]} />
        <meshStandardMaterial color="#245c1a" roughness={0.84} />
      </mesh>
      <mesh position={[-0.4, 3.2, -0.3]}>
        <sphereGeometry args={[0.75, 7, 7]} />
        <meshStandardMaterial color="#1f5218" roughness={0.86} />
      </mesh>
    </group>
  );
}

// 개간 구역 — 양토 노출, 경계 측량 말뚝
function ClearedZone() {
  return (
    <group>
      {/* 개간 평탄지 — 드론 사진 붉은 흙 색상 반영 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2, 0.15, 3]}>
        <planeGeometry args={[18, 15]} />
        <meshStandardMaterial color="#8c5e38" roughness={0.94} />
      </mesh>
      {/* 측량 경계 말뚝 */}
      {([-10.5, 7.5] as number[]).flatMap((px) =>
        ([-4.5, 10.5] as number[]).map((pz) => (
          <mesh key={`survey-${px}-${pz}`} position={[px, 0.4, pz]}>
            <cylinderGeometry args={[0.07, 0.09, 1.4, 6]} />
            <meshStandardMaterial color="#5a3a18" roughness={0.8} />
          </mesh>
        ))
      )}
    </group>
  );
}

// 드론 사진 반영: 동쪽 경계 옹벽 (사진에서 오른쪽 가장자리 단차)
function RetainingWall() {
  return (
    <group>
      <mesh position={[8.0, 0.55, 3]}>
        <boxGeometry args={[0.6, 1.1, 16]} />
        <meshStandardMaterial color="#7a6e60" roughness={0.9} />
      </mesh>
      {/* 옹벽 상단 모서리 */}
      <mesh position={[8.0, 1.12, 3]}>
        <boxGeometry args={[0.8, 0.12, 16.2]} />
        <meshStandardMaterial color="#8a7e70" roughness={0.85} />
      </mesh>
    </group>
  );
}

// 드론 사진 반영: 개간지 북쪽에 흰색 차량
function FarmVehicle({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* 차체 */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[2.0, 0.85, 4.2]} />
        <meshStandardMaterial color="#f0eeea" roughness={0.6} />
      </mesh>
      {/* 운전석/캡 */}
      <mesh position={[0, 1.15, -0.7]}>
        <boxGeometry args={[1.85, 0.75, 2.1]} />
        <meshStandardMaterial color="#dddbd5" roughness={0.55} />
      </mesh>
      {/* 창문 */}
      <mesh position={[0, 1.22, -1.76]}>
        <boxGeometry args={[1.5, 0.5, 0.06]} />
        <meshStandardMaterial color="#a0c8e0" roughness={0.1} metalness={0.2} />
      </mesh>
      {/* 바퀴 */}
      {([-1.0, 1.0] as number[]).flatMap((x) =>
        ([-1.5, 1.5] as number[]).map((z) => (
          <mesh key={`w-${x}-${z}`} position={[x, 0.22, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.24, 0.24, 0.2, 10]} />
            <meshStandardMaterial color="#111111" roughness={0.95} />
          </mesh>
        ))
      )}
    </group>
  );
}

// 밤나무 식재 예정 — 임업분석 최적 수종 (amber 말뚝)
function ChestnutPlantingSpot({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
        <circleGeometry args={[1.8, 10]} />
        <meshStandardMaterial color="#c8973a" transparent opacity={0.42} />
      </mesh>
      <mesh position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.07, 0.09, 1.5, 6]} />
        <meshStandardMaterial color="#b45309" roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.13, 7, 7]} />
        <meshStandardMaterial color="#f97316" roughness={0.4} />
      </mesh>
    </group>
  );
}

// 상수리나무 조림 예정 — 적정조림수종 (green 말뚝)
function OakPlantingSpot({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
        <circleGeometry args={[1.5, 8]} />
        <meshStandardMaterial color="#5a8a30" transparent opacity={0.38} />
      </mesh>
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 1.3, 6]} />
        <meshStandardMaterial color="#2d6a1e" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.4, 0]}>
        <sphereGeometry args={[0.11, 6, 6]} />
        <meshStandardMaterial color="#4a9a2a" roughness={0.5} />
      </mesh>
    </group>
  );
}

// 활엽수 위치 — 울폐도 51~70%
// 드론 사진 반영: 동쪽·북쪽 삼림 밀집, 서쪽(접근로 쪽) 희박
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

// 밤나무 식재 예정지 — 개간 구역 내 2열 배치
const chestnutPositions: [number, number, number][] = [
  [-8, 0.3, 1.5], [-4, 0.3, 1.5], [0, 0.3, 1.5], [4, 0.3, 1.5],
  [-8, 0.3, 5.5], [-4, 0.3, 5.5], [0, 0.3, 5.5], [4, 0.3, 5.5],
];

// 상수리나무 조림 예정 — 활엽수림 경계 인근
const oakPositions: [number, number, number][] = [
  [-10, 0.4, -2], [-7, 0.7, -4.5], [-4, 0.7, -6],
];

export default function SinwolScene({ onHotspotSelect, walkMode = false }: SinwolSceneProps) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 12, 22]} fov={68} />

      {/* 남서향 오후 햇살 — 남서향 경사지 반영 */}
      <Sky sunPosition={[-25, 38, 18]} turbidity={3.5} rayleigh={1.3} />
      <ambientLight intensity={0.65} />
      <directionalLight position={[-12, 28, 8]} intensity={1.2} castShadow />
      <fog attach="fog" args={["#b8d4b0", 35, 85]} />

      <HillyTerrain />
      <ClearedZone />

      {/* 동쪽 경계 옹벽 (드론 사진 오른쪽 가장자리 단차 반영) */}
      <RetainingWall />

      {/* 북쪽 개간지 입구: 흰색 차량 (드론 사진 반영) */}
      <FarmVehicle position={[-2, 0.3, -4]} />

      {/* 기존 활엽수림 — 동쪽·북쪽 밀집, 서쪽(접근로) 희박 */}
      {eastForest.map((pos, i) => (
        <BroadleafTree key={`e-${i}`} position={pos} scale={0.9} />
      ))}
      {northForest.map((pos, i) => (
        <BroadleafTree key={`n-${i}`} position={pos} scale={0.95} />
      ))}
      {westSparseForest.map((pos, i) => (
        <BroadleafTree key={`w-${i}`} position={pos} scale={0.75} />
      ))}

      {/* 밤나무 식재 예정지 (임업분석 최적, amber 말뚝) */}
      {chestnutPositions.map((pos, i) => (
        <ChestnutPlantingSpot key={`chestnut-${i}`} position={pos} />
      ))}

      {/* 상수리나무 조림 예정 (green 말뚝) */}
      {oakPositions.map((pos, i) => (
        <OakPlantingSpot key={`oak-${i}`} position={pos} />
      ))}

      {/* 접근로 — 서쪽(왼쪽) 경계, 드론 사진 반영 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-10.5, 0.1, 2]}>
        <planeGeometry args={[2.5, 24]} />
        <meshStandardMaterial color="#8a7050" roughness={0.92} />
      </mesh>

      {/* 핫스팟 — 실제 임업분석 데이터 반영 */}
      <WorldHotspot
        position={[-3, 0.5, 5]}
        label="🌰 밤나무 조성 예정지"
        info="임업분석 최적 수종 — 밤나무. 개간 구역(0.18ha) 내 식재 계획 중. 임지생산능력 Ⅱ급지(상), 양토 토양(토심 30cm 미만), 남서향 경사 10~15도. 오렌지 말뚝 = 밤나무 식재 예정 위치"
        onSelect={onHotspotSelect}
      />
      <WorldHotspot
        position={[2, 1.5, -9]}
        label="🌳 기존 활엽수림"
        info="31~40년생 기타활엽수 — 가슴높이 지름 6~18cm, 울폐도 51~70%. 보존 구역과 개간 범위 경계 확정 중. 적정조림수종: 상수리나무 (초록 말뚝 구역)"
        onSelect={onHotspotSelect}
      />
      <WorldHotspot
        position={[0, 0.5, 4]}
        label="🌿 산나물 재배 가능지"
        info="임업경영분석 결과 — 곰취·두릅·고비 재배 가능. 경사 10~15도, 남서향 경사지, 양토. 연평균기온 13~14°C, 강수량 1200~1300mm 조건. 산사태 위험 5등급(최저)"
        onSelect={onHotspotSelect}
      />
      <WorldHotspot
        position={[-10, 0.2, 7]}
        label="📍 서쪽 접근로 · 필지 경계"
        info="신월리 98번지 · 0.18ha(토지대장). 지목: 전. 계획관리지역, 성장관리계획구역. 드론 사진 기반 접근로 위치 반영 (서쪽 경계)"
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
