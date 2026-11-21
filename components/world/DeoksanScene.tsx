"use client";
import * as THREE from "three";
import { Sky, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import WorldHotspot from "./WorldHotspot";
import CharacterSprite from "./CharacterSprite";

// 쑤담이 순찰 경로 — 감자밭 중앙 농로 · 고랑 사이
const SSUDAMI_WAYPOINTS: [number, number, number][] = [
  [0, 0, 10.5],
  [0, 0, 5],
  [0, 0, 0],
  [-3.6, 0, -3],
  [0, 0, -6],
  [3.6, 0, -3],
  [0, 0, 0],
  [0, 0, 10.5],
];

const SSUDAMI_DIALOG = [
  "안녕하세요! 덕산리 756번지 감자밭이에요 🥔",
  "2027년 봄 수미·조풍 품종 봄감자 실증을 준비 중이에요",
  "고랑 A-01~A-40까지 40팀이 각각 담당 구역을 갖게 돼요",
  "감자가 발아하고 꽃이 피는 과정을 함께 지켜봐요!",
  "파란 마커를 클릭하면 현장 정보를 볼 수 있어요 📍",
];

interface DeoksanSceneProps {
  onHotspotSelect: (label: string, info: string) => void;
  walkMode?: boolean;
}

function PotatoRow({ position, length = 18 }: { position: [number, number, number]; length?: number }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[0.75, 0.18, length]} />
        <meshStandardMaterial color="#6b4c20" roughness={0.95} />
      </mesh>
      {Array.from({ length: Math.floor(length / 1.4) }).map((_, i) => (
        <group key={i} position={[0, 0.22, -length / 2 + 0.7 + i * 1.4]}>
          <mesh>
            <sphereGeometry args={[0.14, 6, 6]} />
            <meshStandardMaterial color="#4a7a28" roughness={0.8} />
          </mesh>
          <mesh position={[0.08, 0.1, 0.05]} rotation={[0.3, 0.2, 0.4]}>
            <boxGeometry args={[0.04, 0.22, 0.04]} />
            <meshStandardMaterial color="#5a9030" roughness={0.7} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.5, -length / 2 + 0.4]}>
        <boxGeometry args={[0.6, 0.6, 0.06]} />
        <meshStandardMaterial color="#8B6914" />
      </mesh>
    </group>
  );
}

// 드론 사진 반영: 왼쪽 상단 붉은 지붕 농업용 창고/휴게소
function FarmBuilding({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* 건물 본체 */}
      <mesh position={[0, 1.3, 0]}>
        <boxGeometry args={[5.5, 2.6, 4.5]} />
        <meshStandardMaterial color="#8a9280" roughness={0.85} />
      </mesh>
      {/* 붉은 슬레이트 지붕 */}
      <mesh position={[0, 2.75, 0]}>
        <boxGeometry args={[6.0, 0.4, 5.0]} />
        <meshStandardMaterial color="#8b1800" roughness={0.72} />
      </mesh>
      {/* 출입구 */}
      <mesh position={[0, 0.9, 2.26]}>
        <boxGeometry args={[1.4, 1.8, 0.1]} />
        <meshStandardMaterial color="#1a1008" />
      </mesh>
      {/* 창문 */}
      <mesh position={[1.8, 1.4, 2.26]}>
        <boxGeometry args={[0.8, 0.7, 0.08]} />
        <meshStandardMaterial color="#c8d8e8" roughness={0.1} metalness={0.1} />
      </mesh>
    </group>
  );
}

// 드론 사진 반영: 위쪽 차광망/방수포 (녹색)
function GreenTarp({ position, w = 4.5, d = 3.5 }: { position: [number, number, number]; w?: number; d?: number }) {
  return (
    <group position={position}>
      {/* 지주 4개 */}
      {([-w / 2, w / 2] as number[]).flatMap((px) =>
        ([-d / 2, d / 2] as number[]).map((pz) => (
          <mesh key={`${px}-${pz}`} position={[px, 0.85, pz]}>
            <cylinderGeometry args={[0.05, 0.06, 1.7, 5]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
          </mesh>
        ))
      )}
      {/* 차광망 */}
      <mesh position={[0, 1.65, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w + 0.3, d + 0.3]} />
        <meshStandardMaterial
          color="#1a5a28"
          transparent
          opacity={0.88}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// 드론 사진 반영: 하단 경운기/트랙터 (오렌지색 소형 장비)
function FarmEquipment({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* 차체 */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[1.2, 0.7, 2.2]} />
        <meshStandardMaterial color="#c2600a" roughness={0.65} />
      </mesh>
      {/* 운전석 */}
      <mesh position={[0, 1.0, -0.4]}>
        <boxGeometry args={[1.1, 0.6, 1.1]} />
        <meshStandardMaterial color="#a84f08" roughness={0.65} />
      </mesh>
      {/* 바퀴 */}
      {([-0.65, 0.65] as number[]).flatMap((x) =>
        ([-0.9, 0.9] as number[]).map((z) => (
          <mesh key={`w-${x}-${z}`} position={[x, 0.22, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.22, 0.22, 0.18, 10]} />
            <meshStandardMaterial color="#111111" roughness={0.95} />
          </mesh>
        ))
      )}
    </group>
  );
}

export default function DeoksanScene({ onHotspotSelect, walkMode = false }: DeoksanSceneProps) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 8, 22]} fov={70} />
      <Sky sunPosition={[80, 60, 20]} turbidity={0.5} rayleigh={0.3} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[20, 30, 10]} intensity={1.4} castShadow />
      <fog attach="fog" args={["#c8e8b0", 40, 90]} />

      {/* 평탄한 감자밭 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[90, 90]} />
        <meshStandardMaterial color="#5d7f3a" roughness={0.95} />
      </mesh>

      {/* 고랑 10개 */}
      {Array.from({ length: 10 }).map((_, i) => (
        <PotatoRow key={i} position={[-8.1 + i * 1.8, 0, 0]} length={18} />
      ))}

      {/* 중앙 농로 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <planeGeometry args={[1.4, 20]} />
        <meshStandardMaterial color="#c8a96e" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-9.8, 0.001, 0]}>
        <planeGeometry args={[1.0, 20]} />
        <meshStandardMaterial color="#c8a96e" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[9.8, 0.001, 0]}>
        <planeGeometry args={[1.0, 20]} />
        <meshStandardMaterial color="#c8a96e" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, -10]}>
        <planeGeometry args={[22, 1.2]} />
        <meshStandardMaterial color="#c8a96e" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 10]}>
        <planeGeometry args={[22, 1.2]} />
        <meshStandardMaterial color="#c8a96e" roughness={0.9} />
      </mesh>

      {/* 경계 나무들 */}
      {([-14, 14] as number[]).flatMap((x) =>
        ([-13, 0, 13] as number[]).map((z) => (
          <group key={`tree-${x}-${z}`} position={[x, 0, z]}>
            <mesh position={[0, 1.2, 0]}>
              <cylinderGeometry args={[0.18, 0.28, 2.4]} />
              <meshStandardMaterial color="#5a3a18" roughness={0.9} />
            </mesh>
            <mesh position={[0, 3.0, 0]}>
              <sphereGeometry args={[1.3, 8, 8]} />
              <meshStandardMaterial color="#2a5e1e" roughness={0.85} />
            </mesh>
          </group>
        ))
      )}

      {/* 입구 아치 */}
      <group position={[0, 0, 12]}>
        <mesh position={[-1.5, 1.5, 0]}>
          <boxGeometry args={[0.3, 3, 0.3]} />
          <meshStandardMaterial color="#5a3a18" roughness={0.9} />
        </mesh>
        <mesh position={[1.5, 1.5, 0]}>
          <boxGeometry args={[0.3, 3, 0.3]} />
          <meshStandardMaterial color="#5a3a18" roughness={0.9} />
        </mesh>
        <mesh position={[0, 3.1, 0]}>
          <boxGeometry args={[3.5, 0.3, 0.3]} />
          <meshStandardMaterial color="#5a3a18" roughness={0.9} />
        </mesh>
      </group>

      {/* ---- 드론 사진 반영 구조물 ---- */}

      {/* 왼쪽 상단: 붉은 지붕 농업 창고/휴게소 */}
      <FarmBuilding position={[-12, 0, -10]} />

      {/* 위쪽 가운데: 차광망 2개 (자재 보관) */}
      <GreenTarp position={[-5.5, 0, -11.5]} w={4.5} d={3.5} />
      <GreenTarp position={[0.5, 0, -11.5]} w={3.5} d={3.0} />

      {/* 하단: 소형 경운기/트랙터 */}
      <FarmEquipment position={[4, 0, 11]} />

      <WorldHotspot
        position={[0, 0, 11]}
        label="🌾 농장 입구"
        info="밀양 덕산농장 입구입니다. 2027 봄감자 실증 중 (시뮬레이션)"
        onSelect={onHotspotSelect}
      />
      <WorldHotspot
        position={[-3.6, 0, 0]}
        label="🥔 A-02 고랑"
        info="A-02 고랑 — 수미 품종 봄감자 재배 구역 (시뮬레이션 초안)"
        onSelect={onHotspotSelect}
      />
      <WorldHotspot
        position={[3.6, 0, -6]}
        label="📸 현장 관측소"
        info="드론·360° 사진 촬영 주요 거점 (실제 자료 준비 중)"
        onSelect={onHotspotSelect}
      />
      <WorldHotspot
        position={[-12, 0.2, -10]}
        label="🏠 농장 창고"
        info="농자재 보관 및 휴게 공간. 차광망·농기구 보관 중. 실제 현장 드론 사진 기반 배치 (덕산리 756번지)"
        onSelect={onHotspotSelect}
      />

      <CharacterSprite
        waypoints={SSUDAMI_WAYPOINTS}
        textureUrl="/assets/brand/ssudami-row.png"
        name="쑤담이"
        dialogLines={SSUDAMI_DIALOG}
        speed={1.1}
        size={[1.3, 1.7]}
      />

      {!walkMode && (
        <OrbitControls
          maxPolarAngle={Math.PI / 2.1}
          minDistance={4}
          maxDistance={35}
          enablePan={true}
          target={[0, 1, 0]}
        />
      )}
    </>
  );
}
