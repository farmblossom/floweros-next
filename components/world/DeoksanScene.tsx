"use client";
import { useLayoutEffect, useMemo, useRef } from "react";
import { Html, OrbitControls, PerspectiveCamera, Text } from "@react-three/drei";
import * as THREE from "three";
import WorldHotspot from "./WorldHotspot";
import NpcFigure from "./NpcFigure";
import FarmDog from "./FarmDog";
import { FARM_NPCS } from "./farm-npcs";
import type { PlayerPosition } from "./terrain";
import { BroadleafTree, HorizonGround, MountainRidge } from "./Scenery";

interface DeoksanSceneProps {
  onHotspotSelect: (label: string, info: string) => void;
  walkMode?: boolean;
  playerRef: React.RefObject<PlayerPosition>;
}

const ROW_COUNT = 20;
const ROW_SPACING = 1.2;
const ROW_LENGTH = 17;

// ── 봄감자 40구획 (20이랑 × 좌우 2구획) ────────────────────────────
function PotatoField({ onHotspotSelect }: { onHotspotSelect: (label: string, info: string) => void }) {
  const moundRef = useRef<THREE.InstancedMesh>(null);
  const plantRef = useRef<THREE.InstancedMesh>(null);

  const plots = useMemo(() => {
    const list: { id: string; x: number; z: number; index: number }[] = [];
    for (let row = 0; row < ROW_COUNT; row++) {
      const x = (row - (ROW_COUNT - 1) / 2) * ROW_SPACING;
      for (let side = 0; side < 2; side++) {
        const index = row * 2 + side + 1;
        list.push({
          id: `A-${String(index).padStart(2, "0")}`,
          x,
          z: side === 0 ? -4.4 : 4.4,
          index,
        });
      }
    }
    return list;
  }, []);

  useLayoutEffect(() => {
    const mounds = moundRef.current;
    const plants = plantRef.current;
    if (!mounds || !plants) return;
    const dummy = new THREE.Object3D();

    plots.forEach((plot, i) => {
      dummy.position.set(plot.x, 0.09, plot.z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      mounds.setMatrixAt(i, dummy.matrix);

      for (let p = 0; p < 8; p++) {
        const pz = plot.z - 3.6 + p * 1.05;
        dummy.position.set(plot.x + (Math.random() - 0.5) * 0.18, 0.24, pz);
        dummy.rotation.set(0, Math.random() * Math.PI, 0);
        const s = 0.85 + Math.random() * 0.35;
        dummy.scale.set(s, s * (0.9 + Math.random() * 0.4), s);
        dummy.updateMatrix();
        plants.setMatrixAt(i * 8 + p, dummy.matrix);
      }
    });

    mounds.instanceMatrix.needsUpdate = true;
    plants.instanceMatrix.needsUpdate = true;
  }, [plots]);

  return (
    <group>
      {/* 고랑 두둑 */}
      <instancedMesh ref={moundRef} args={[undefined, undefined, ROW_COUNT * 2]} castShadow receiveShadow>
        <boxGeometry args={[0.72, 0.2, 8.3]} />
        <meshStandardMaterial color="#6b4c20" roughness={0.96} />
      </instancedMesh>
      {/* 감자 싹 */}
      <instancedMesh ref={plantRef} args={[undefined, undefined, ROW_COUNT * 2 * 8]} castShadow>
        <sphereGeometry args={[0.15, 6, 6]} />
        <meshStandardMaterial color="#4d7d2a" roughness={0.85} />
      </instancedMesh>

      {/* 구획 클릭 → 현장 확인 패널 */}
      {plots.map((plot) => (
        <mesh
          key={plot.id}
          position={[plot.x, 0.3, plot.z]}
          onClick={(e) => {
            e.stopPropagation();
            onHotspotSelect(
              `🥔 고랑 ${plot.id}`,
              `덕산리 756번지 봄감자 40구획 중 ${plot.id} 구획입니다. 2027년 봄 수미·조풍 품종 실증 예정 구역으로, 두둑·싹 상태를 확인할 수 있어요. (시뮬레이션 초안 — 실제 작물 상태는 현장 점검 후 반영)`
            );
          }}
        >
          <boxGeometry args={[0.78, 0.5, 8.4]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}

      {/* 이랑 명판 */}
      {plots
        .filter((plot) => plot.z > 0)
        .map((plot) => (
          <group key={`sign-${plot.id}`} position={[plot.x, 0.62, 9.1]}>
            <mesh castShadow>
              <boxGeometry args={[0.5, 0.26, 0.04]} />
              <meshStandardMaterial color="#f3ead6" roughness={0.8} />
            </mesh>
            <mesh position={[0, -0.2, 0]}>
              <boxGeometry args={[0.05, 0.4, 0.05]} />
              <meshStandardMaterial color="#7a5a34" roughness={0.9} />
            </mesh>
            <Text position={[0, 0, 0.03]} fontSize={0.16} color="#3d2f1c" anchorX="center" anchorY="middle">
              {`A-${String(plot.index).padStart(2, "0")}`}
            </Text>
          </group>
        ))}
    </group>
  );
}

// ── 농업용 창고/휴게소 (붉은 지붕) ─────────────────────────────────
function FarmBuilding({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[5.5, 2.6, 4.5]} />
        <meshStandardMaterial color="#9a9f8c" roughness={0.88} />
      </mesh>
      <mesh position={[0, 2.75, 0]} castShadow>
        <boxGeometry args={[6.0, 0.4, 5.0]} />
        <meshStandardMaterial color="#8b1800" roughness={0.72} />
      </mesh>
      <mesh position={[0, 3.0, 0]}>
        <boxGeometry args={[5.2, 0.14, 4.3]} />
        <meshStandardMaterial color="#6f1200" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.9, 2.26]}>
        <boxGeometry args={[1.4, 1.8, 0.1]} />
        <meshStandardMaterial color="#1a1008" />
      </mesh>
      <mesh position={[1.8, 1.4, 2.26]}>
        <boxGeometry args={[0.8, 0.7, 0.08]} />
        <meshStandardMaterial color="#c8d8e8" roughness={0.1} metalness={0.1} />
      </mesh>
    </group>
  );
}

// ── 차광망 ────────────────────────────────────────────────────────
function GreenTarp({ position, w = 4.5, d = 3.5 }: { position: [number, number, number]; w?: number; d?: number }) {
  return (
    <group position={position}>
      {([-w / 2, w / 2] as number[]).flatMap((px) =>
        ([-d / 2, d / 2] as number[]).map((pz) => (
          <mesh key={`${px}-${pz}`} position={[px, 0.85, pz]} castShadow>
            <cylinderGeometry args={[0.05, 0.06, 1.7, 5]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
          </mesh>
        ))
      )}
      <mesh position={[0, 1.65, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <planeGeometry args={[w + 0.3, d + 0.3]} />
        <meshStandardMaterial color="#1a5a28" transparent opacity={0.88} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ── 비닐하우스 ────────────────────────────────────────────────────
function Greenhouse({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={i} position={[-3 + i, 0, 0]} rotation={[0, 0, 0]} castShadow>
          <torusGeometry args={[1.3, 0.04, 6, 16, Math.PI]} />
          <meshStandardMaterial color="#9aa7b0" roughness={0.5} metalness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 1.3, 0]} castShadow>
        <boxGeometry args={[6.4, 2.6, 2.8]} />
        <meshStandardMaterial color="#eaf3f5" transparent opacity={0.42} roughness={0.25} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[6.6, 0.12, 3.0]} />
        <meshStandardMaterial color="#7d6a4e" roughness={0.95} />
      </mesh>
    </group>
  );
}

// ── 경운기 ────────────────────────────────────────────────────────
function FarmEquipment({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[1.2, 0.7, 2.2]} />
        <meshStandardMaterial color="#c2600a" roughness={0.65} />
      </mesh>
      <mesh position={[0, 1.0, -0.4]} castShadow>
        <boxGeometry args={[1.1, 0.6, 1.1]} />
        <meshStandardMaterial color="#a84f08" roughness={0.65} />
      </mesh>
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

// ── 개집 ──────────────────────────────────────────────────────────
function DogHouse({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.9, 1.3]} />
        <meshStandardMaterial color="#8a6238" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.02, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <boxGeometry args={[1.25, 1.25, 1.45]} />
        <meshStandardMaterial color="#7b2f1c" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.42, 0.66]}>
        <circleGeometry args={[0.3, 16]} />
        <meshStandardMaterial color="#241a12" roughness={1} />
      </mesh>
      {/* 밥그릇 */}
      <mesh position={[0.9, 0.06, 0.7]}>
        <cylinderGeometry args={[0.18, 0.14, 0.1, 12]} />
        <meshStandardMaterial color="#3b6fa0" roughness={0.6} />
      </mesh>
      <mesh position={[-0.85, 0.06, 0.66]}>
        <cylinderGeometry args={[0.16, 0.13, 0.09, 12]} />
        <meshStandardMaterial color="#c96a58" roughness={0.6} />
      </mesh>
    </group>
  );
}

// ── 삽·수레 등 소품 ──────────────────────────────────────────────
function Tools({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.55, 0]} rotation={[0, 0, 0.24]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 1.1, 6]} />
        <meshStandardMaterial color="#8a6238" roughness={0.9} />
      </mesh>
      <mesh position={[0.14, 0.05, 0]} rotation={[0, 0, 0.1]} castShadow>
        <boxGeometry args={[0.24, 0.04, 0.3]} />
        <meshStandardMaterial color="#b9c0c6" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0.55, 0.24, 0.15]} castShadow>
        <boxGeometry args={[0.7, 0.08, 0.5]} />
        <meshStandardMaterial color="#2f6b8f" roughness={0.6} />
      </mesh>
    </group>
  );
}

const boundaryTrees: [number, number, number][] = [
  [-14, 0, -13], [-14, 0, 0], [-14, 0, 13],
  [14, 0, -13], [14, 0, 0], [14, 0, 13],
];

// 개집 · 목줄 말뚝 자리 (창고 앞)
const DOG_HOUSE: [number, number, number] = [-8.6, 0, -10.4];
const IO_TETHER = { x: -5.2, z: -8.6, rx: 2.6, rz: 1.6 };
const IRYUK_TETHER = { x: -9.6, z: -7.6, rx: 1.5, rz: 1.2 };

export default function DeoksanScene({ onHotspotSelect, walkMode = false, playerRef }: DeoksanSceneProps) {
  const npcs = FARM_NPCS.deoksan;

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 10, 26]} fov={62} />

      <HorizonGround y={-0.6} color="#51702f" />
      <MountainRidge radiusBase={70} heightBase={12} />

      {/* 평탄한 감자밭 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[110, 110]} />
        <meshStandardMaterial color="#5d7f3a" roughness={0.96} />
      </mesh>

      <PotatoField onHotspotSelect={onHotspotSelect} />

      {/* 농로 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[0.9, 21]} />
        <meshStandardMaterial color="#c8a96e" roughness={0.92} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -9.4]}>
        <planeGeometry args={[24, 1.3]} />
        <meshStandardMaterial color="#c8a96e" roughness={0.92} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 9.4]}>
        <planeGeometry args={[24, 1.3]} />
        <meshStandardMaterial color="#c8a96e" roughness={0.92} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-12.4, 0.02, 0]}>
        <planeGeometry args={[1.2, 21]} />
        <meshStandardMaterial color="#c8a96e" roughness={0.92} />
      </mesh>

      {/* 경계 나무 */}
      {boundaryTrees.map((pos, i) => (
        <BroadleafTree key={`bt-${i}`} position={pos} scale={1.05} tint={i} />
      ))}

      {/* 입구 아치 */}
      <group position={[0, 0, 12]}>
        <mesh position={[-1.5, 1.5, 0]} castShadow>
          <boxGeometry args={[0.3, 3, 0.3]} />
          <meshStandardMaterial color="#5a3a18" roughness={0.9} />
        </mesh>
        <mesh position={[1.5, 1.5, 0]} castShadow>
          <boxGeometry args={[0.3, 3, 0.3]} />
          <meshStandardMaterial color="#5a3a18" roughness={0.9} />
        </mesh>
        <mesh position={[0, 3.1, 0]} castShadow>
          <boxGeometry args={[3.5, 0.3, 0.3]} />
          <meshStandardMaterial color="#5a3a18" roughness={0.9} />
        </mesh>
        <Html position={[0, 3.55, 0]} center distanceFactor={18} zIndexRange={[4, 12]}>
          <div
            style={{
              background: "rgba(74,98,67,0.94)",
              color: "#fff8ec",
              borderRadius: 8,
              padding: "3px 12px",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.04em",
              whiteSpace: "nowrap",
              boxShadow: "0 3px 10px rgba(0,0,0,0.25)",
              fontFamily: "system-ui, -apple-system, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
            }}
          >
            꽃폈네 덕산농장
          </div>
        </Html>
      </group>

      <FarmBuilding position={[-13, 0, -11]} />
      <GreenTarp position={[-5.5, 0, -12]} w={4.5} d={3.5} />
      <GreenTarp position={[0.5, 0, -12]} w={3.5} d={3.0} />
      <Greenhouse position={[10.5, 0, -11.5]} />
      <FarmEquipment position={[4.5, 0, 11]} />
      <Tools position={[-9.6, 0, -8.4]} />
      <DogHouse position={DOG_HOUSE} />

      {/* 농장 지킴이 — 이오 · 이륙이 */}
      <FarmDog
        name="이오"
        role="농장 지킴이 · 황구"
        coat="#d9a85a"
        socks="#f3e3c4"
        size={1}
        tether={IO_TETHER}
        speed={1.7}
        playerRef={playerRef}
        accent="#a9762b"
        lines={[
          "왈! 나는 이오예요. 덕산리 밭을 지키는 황구 지킴이 🐕",
          "두더지랑 족제비가 고랑을 파헤치면 내가 제일 먼저 달려가요",
          "고랑 사이 농로는 내 순찰 코스 — 따라 걸어볼래요?",
        ]}
      />
      <FarmDog
        name="이륙이"
        role="농장 지킴이 · 재구"
        coat="#6b5b4a"
        socks="#f8f4ec"
        size={1.15}
        tether={IRYUK_TETHER}
        speed={1.1}
        timid
        playerRef={playerRef}
        accent="#5b4a3a"
        lines={[
          "…크게 짖진 못하지만 여기 잘 지키고 있어요. 이륙이에요 🐾",
          "덩치는 이오보다 큰데… 가끔 무서워서 개집에 숨기도 해요",
          "그래도 형아(이오)가 옆에 있으면 든든해요!",
        ]}
      />

      <WorldHotspot
        position={[0, 0, 11]}
        label="🌾 농장 입구"
        info="밀양 덕산농장 입구입니다. 2027 봄감자 실증 중 (시뮬레이션)"
        onSelect={onHotspotSelect}
        playerRef={playerRef}
      />
      <WorldHotspot
        position={[-3.6, 0, 0]}
        label="🥔 A-02 고랑"
        info="A-02 고랑 — 수미 품종 봄감자 재배 구역 (시뮬레이션 초안)"
        onSelect={onHotspotSelect}
        playerRef={playerRef}
      />
      <WorldHotspot
        position={[3.6, 0, -6]}
        label="📸 현장 관측소"
        info="드론·360° 사진 촬영 주요 거점 (실제 자료 준비 중)"
        onSelect={onHotspotSelect}
        playerRef={playerRef}
      />
      <WorldHotspot
        position={[-13, 0.2, -11]}
        label="🏠 농장 창고"
        info="농자재 보관 및 휴게 공간. 차광망·농기구 보관 중. 실제 현장 드론 사진 기반 배치 (덕산리 756번지)"
        onSelect={onHotspotSelect}
        playerRef={playerRef}
      />
      <WorldHotspot
        position={[-8.6, 0.3, -10.4]}
        label="🐕 이오·이륙이 개집"
        info="덕산리 농장을 지키는 진도믹스 모자견 두 마리의 집. 이오(황구·어미)는 두더지·족제비를 쫓는 용맹한 지킴이, 이륙이(재구·아들)는 덩치는 크지만 순박하고 겁이 많은 지킴이입니다."
        onSelect={onHotspotSelect}
        playerRef={playerRef}
      />
      <WorldHotspot
        position={[10.5, 0.6, -11.5]}
        label="🌱 비닐하우스"
        info="묘 자람과 자재 보관용 비닐하우스. 봄감자 실증 준비 구역입니다."
        onSelect={onHotspotSelect}
        playerRef={playerRef}
      />

      {/* 농장지기 — 원본 캐릭터 이미지 그대로 */}
      {npcs.map((npc) => (
        <NpcFigure
          key={npc.id}
          name={npc.name}
          role={npc.role}
          textureUrl={npc.textureUrl}
          position={[npc.xz[0], 0, npc.xz[1]]}
          lines={npc.lines}
          playerRef={playerRef}
          height={npc.height}
          greetRadius={npc.greetRadius}
          accent={npc.accent}
        />
      ))}

      {!walkMode && (
        <OrbitControls
          makeDefault
          maxPolarAngle={Math.PI / 2.05}
          minDistance={4}
          maxDistance={40}
          enablePan
          target={[0, 1, 1]}
          enableDamping
          dampingFactor={0.08}
        />
      )}
    </>
  );
}
