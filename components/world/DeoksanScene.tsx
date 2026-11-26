"use client";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Html, OrbitControls, PerspectiveCamera, Text } from "@react-three/drei";
import * as THREE from "three";
import WorldHotspot from "./WorldHotspot";
import NpcFigure from "./NpcFigure";
import FarmDog from "./FarmDog";
import { FARM_NPCS } from "./farm-npcs";
import type { PlayerPosition } from "./terrain";
import { BroadleafTree, GrassTufts, HorizonGround, LampPost, MountainRidge } from "./Scenery";
import { PhotoSpotSign } from "./Decorations";
import { spotsFor, type PhotoSpot } from "./photo-spots";

interface DeoksanSceneProps {
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
        <meshStandardMaterial color="#7d5730" roughness={0.96} />
      </instancedMesh>
      {/* 감자 싹 */}
      <instancedMesh ref={plantRef} args={[undefined, undefined, ROW_COUNT * 2 * 8]} castShadow>
        <sphereGeometry args={[0.19, 8, 7]} />
        <meshStandardMaterial color="#5b9330" roughness={0.85} />
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
        .filter((plot) => plot.z > 0 && plot.index % 2 === 1)
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


// ── 빨간 트랙터 (창고 옆 공터) ─────────────────────────────────
function Tractor({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  const [open, setOpen] = useState(false);
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <group
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        {/* 차체 */}
        <mesh position={[0, 0.95, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.05, 0.85, 2.9]} />
          <meshStandardMaterial color="#b8231f" roughness={0.42} metalness={0.22} />
        </mesh>
        {/* 보닛 */}
        <mesh position={[0, 1.0, 1.35]} castShadow>
          <boxGeometry args={[1.0, 0.8, 1.1]} />
          <meshStandardMaterial color="#c92a24" roughness={0.4} metalness={0.25} />
        </mesh>
        <mesh position={[0, 0.98, 1.92]}>
          <boxGeometry args={[0.9, 0.5, 0.06]} />
          <meshStandardMaterial color="#3a3a3a" roughness={0.5} metalness={0.4} />
        </mesh>
        {/* 운전석 · 캐빈 */}
        <mesh position={[0, 1.85, -0.55]} castShadow>
          <boxGeometry args={[1.0, 1.15, 1.0]} />
          <meshStandardMaterial color="#1e4a6b" transparent opacity={0.55} roughness={0.15} metalness={0.1} />
        </mesh>
        <mesh position={[0, 2.46, -0.55]} castShadow>
          <boxGeometry args={[1.2, 0.12, 1.2]} />
          <meshStandardMaterial color="#b8231f" roughness={0.45} metalness={0.2} />
        </mesh>
        {/* 좌석 · 핸들 */}
        <mesh position={[0, 1.55, -0.55]}>
          <boxGeometry args={[0.45, 0.16, 0.4]} />
          <meshStandardMaterial color="#2b2b2b" roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.78, -0.12]} rotation={[0.5, 0, 0]}>
          <torusGeometry args={[0.16, 0.025, 8, 16]} />
          <meshStandardMaterial color="#1b1b1b" roughness={0.6} />
        </mesh>
        {/* 굴뚝 */}
        <mesh position={[0.32, 1.75, 1.55]} castShadow>
          <cylinderGeometry args={[0.05, 0.06, 0.9, 8]} />
          <meshStandardMaterial color="#2b2b2b" metalness={0.5} roughness={0.5} />
        </mesh>
        <mesh position={[0.32, 2.22, 1.55]}>
          <cylinderGeometry args={[0.075, 0.06, 0.12, 8]} />
          <meshStandardMaterial color="#c92a24" metalness={0.4} roughness={0.5} />
        </mesh>
        {/* 뒷바퀴 (큰 것) */}
        {[-0.62, 0.62].map((x) => (
          <mesh key={`rw-${x}`} position={[x, 0.78, -0.85]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.78, 0.78, 0.42, 20]} />
            <meshStandardMaterial color="#1c1c1c" roughness={0.95} />
          </mesh>
        ))}
        {[-0.62, 0.62].map((x) => (
          <mesh key={`rh-${x}`} position={[x, 0.78, -0.85]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.34, 0.34, 0.45, 16]} />
            <meshStandardMaterial color="#d8c37a" roughness={0.6} metalness={0.2} />
          </mesh>
        ))}
        {/* 앞바퀴 (작은 것) */}
        {[-0.55, 0.55].map((x) => (
          <mesh key={`fw-${x}`} position={[x, 0.42, 1.35]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.42, 0.42, 0.3, 18]} />
            <meshStandardMaterial color="#1c1c1c" roughness={0.95} />
          </mesh>
        ))}
        {/* 로터리 작업기 */}
        <mesh position={[0, 0.35, -2.05]} castShadow>
          <boxGeometry args={[1.5, 0.35, 0.3]} />
          <meshStandardMaterial color="#8a1f1b" roughness={0.55} metalness={0.25} />
        </mesh>
        {[-0.5, -0.17, 0.17, 0.5].map((x) => (
          <mesh key={`blade-${x}`} position={[x, 0.18, -2.05]} rotation={[0.4, 0, 0]}>
            <boxGeometry args={[0.16, 0.2, 0.08]} />
            <meshStandardMaterial color="#b9c0c6" metalness={0.6} roughness={0.4} />
          </mesh>
        ))}
      </group>

      {open ? (
        <Html position={[0, 3.1, 0]} center pointerEvents="none" zIndexRange={[8, 20]}>
          <div
            style={{
              background: "rgba(255,255,255,0.97)",
              border: "2px solid #b8231f",
              borderRadius: 14,
              padding: "8px 12px",
              width: 210,
              boxSizing: "border-box",
              fontSize: 11,
              lineHeight: 1.55,
              color: "#1e1b18",
              textAlign: "left",
              wordBreak: "keep-all",
              boxShadow: "0 4px 16px rgba(0,0,0,0.22)",
              pointerEvents: "none",
              fontFamily: "system-ui, -apple-system, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
            }}
          >
            🚜 <b>덕산농장 트랙터</b>
            <div style={{ marginTop: 3 }}>
              로터리로 흙을 곱게 갈고, 경운 작업으로 고랑을 만듭니다. 봄감자 심기 전 밭 준비는 이 친구가 맡아요.
            </div>
          </div>
        </Html>
      ) : null}
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

// 개집 · 와이어(트롤리) 라인 자리 — 실제 드론샷 배치 반영
const DOG_HOUSE: [number, number, number] = [-7.4, 0, -9.9];
// 이오: 창고·비닐하우스 뒤쪽(북쪽 -Z 가장자리)을 가로(X축)로
const IO_LINE = { from: [-4.6, -8.8] as [number, number], to: [6.2, -8.8] as [number, number], height: 2.5 };
// 이륙이: 밭 오른쪽 가장자리(+X)를 세로(Z축)로
const IRYUK_LINE = { from: [11.7, -6.8] as [number, number], to: [11.7, 7.6] as [number, number], height: 2.5 };

export default function DeoksanScene({
  onHotspotSelect,
  walkMode = false,
  playerRef,
  activeId,
  onTalk,
  photoSpot = null,
  photoMode = false,
  orbitTarget = [0, 0.5, 2.5],
  onPhotoSpotSelect,
  portrait = false,
}: DeoksanSceneProps) {
  const npcs = FARM_NPCS.deoksan;
  const mainNpcs = useMemo(() => npcs.filter((n) => n.main), [npcs]);
  const spots = useMemo(() => spotsFor("deoksan"), []);

  const gatherFor = (id: string): { x: number; z: number; yaw: number; groundY?: number } | null => {
    if (!photoSpot) return null;
    const idx = mainNpcs.findIndex((m) => m.id === id);
    const stand = idx >= 0 ? photoSpot.stands[idx] : null;
    if (!stand) return null;
    return { x: stand[0], z: stand[1], yaw: photoSpot.yaw, groundY: 0 };
  };

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={portrait ? [0, 20, 37] : [0, 13.5, 25]}
        fov={portrait ? 60 : 58}
      />

      <HorizonGround y={-0.4} color="#547331" />
      <MountainRidge radiusBase={70} heightBase={12} />

      {/* 평탄한 감자밭 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#5d7f3a" roughness={0.96} />
      </mesh>

      <PotatoField onHotspotSelect={onHotspotSelect} />
      <GrassTufts count={1200} area={120} avoid={{ minX: -13.5, maxX: 13.5, minZ: -10.5, maxZ: 10.5 }} />

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
        <Html position={[0, 3.55, 0]} center pointerEvents="none" zIndexRange={[4, 12]}>
          <div
            style={{
              background: "rgba(74,98,67,0.94)",
              color: "#fff8ec",
              borderRadius: 8,
              padding: "2px 10px",
              fontSize: 11,
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

      {/* 포토존 표지판 — 클릭하면 그 자리 시점으로 */}
      {spots.map((sp) => (
        <PhotoSpotSign
          key={sp.id}
          position={[sp.sign.x, 0, sp.sign.z]}
          rotationY={sp.sign.rotY}
          onSelect={() => onPhotoSpotSelect?.(sp.id)}
        />
      ))}

      <FarmBuilding position={[-13, 0, -11]} />
      <GreenTarp position={[-5.5, 0, -12]} w={4.5} d={3.5} />
      <GreenTarp position={[0.5, 0, -12]} w={3.5} d={3.0} />
      <Greenhouse position={[10.5, 0, -11.5]} />
      <Tools position={[-9.6, 0, -8.4]} />
      <DogHouse position={DOG_HOUSE} />
      <Tractor position={[-9.4, 0, 12.9]} rotation={0.35} />
      <LampPost position={[-4.2, 0, 11.4]} />
      <LampPost position={[-11.9, 0, -8.2]} />

      {/* 농장 지킴이 — 이오 · 이륙이 */}
      <FarmDog
        id="io"
        activeId={activeId}
        onTalk={onTalk}
        name="이오"
        role="농장 지킴이"
        coat="#d9a85a"
        socks="#f3e3c4"
        size={0.62}
        line={IO_LINE}
        speed={1.7}
        playerRef={playerRef}
        accent="#a9762b"
        lines={[
          "왈! 나는 이오예요. 덕산리 밭을 지키는 지킴이 🐕",
          "창고 뒤쪽 북쪽 가장자리를 와이어 따라 가로로 쭉 순찰해요",
          "두더지랑 족제비가 고랑을 파헤치면 내가 제일 먼저 달려가요",
        ]}
      />
      <FarmDog
        id="iryuk"
        activeId={activeId}
        onTalk={onTalk}
        name="이륙이"
        role="농장 지킴이"
        coat="#6b5b4a"
        socks="#f8f4ec"
        size={0.7}
        line={IRYUK_LINE}
        speed={1.1}
        timid
        playerRef={playerRef}
        accent="#5b4a3a"
        lines={[
          "…크게 짖진 못하지만 여기 잘 지키고 있어요. 이륙이에요 🐾",
          "밭 오른쪽 가장자리를 따라 세로로 왔다 갔다 하고 있어요",
          "덩치는 이오보다 큰데… 가끔 무서우면 개집 쪽으로 숨기도 해요",
        ]}
      />

      <WorldHotspot
        position={[0, 0, 11]}
        label="🌾 농장 입구"
        info="밀양 덕산농장 입구입니다. 2027 봄감자 실증 중 (시뮬레이션)"
        onSelect={onHotspotSelect}
        hidden={photoMode}
        playerRef={playerRef}
      />
      <WorldHotspot
        position={[-3.6, 0, 0]}
        label="🥔 A-02 고랑"
        info="A-02 고랑 — 수미 품종 봄감자 재배 구역 (시뮬레이션 초안)"
        onSelect={onHotspotSelect}
        hidden={photoMode}
        playerRef={playerRef}
      />
      <WorldHotspot
        position={[3.6, 0, -6]}
        label="📸 현장 관측소"
        info="드론·360° 사진 촬영 주요 거점 (실제 자료 준비 중)"
        onSelect={onHotspotSelect}
        hidden={photoMode}
        playerRef={playerRef}
      />
      <WorldHotspot
        position={[-13, 0.2, -11]}
        label="🏠 농장 창고"
        info="농자재 보관 및 휴게 공간. 차광망·농기구 보관 중. 실제 현장 드론 사진 기반 배치 (덕산리 756번지)"
        onSelect={onHotspotSelect}
        hidden={photoMode}
        playerRef={playerRef}
      />
      <WorldHotspot
        position={[-8.6, 0.3, -10.4]}
        label="🐕 이오·이륙이 개집"
        info="덕산리 농장을 지키는 두 마리. 이오는 창고·비닐하우스 뒤쪽 북쪽 가장자리를 와이어 따라 가로로, 이륙이는 밭 오른쪽 가장자리를 세로로 순찰합니다. 이오는 두더지·족제비를 쫓는 용맹한 지킴이, 이륙이는 덩치는 크지만 순박하고 겁이 많은 지킴이입니다."
        onSelect={onHotspotSelect}
        hidden={photoMode}
        playerRef={playerRef}
      />
      <WorldHotspot
        position={[10.5, 0.6, -11.5]}
        label="🌱 비닐하우스"
        info="묘 자람과 자재 보관용 비닐하우스. 봄감자 실증 준비 구역입니다."
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
          position={[npc.xz[0], 0, npc.xz[1]]}
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
          maxPolarAngle={Math.PI / 2.05}
          minDistance={portrait ? 3.5 : 4}
          maxDistance={portrait ? 80 : 40}
          enablePan
          target={orbitTarget}
          enableDamping
          dampingFactor={0.08}
        />
      )}
    </>
  );
}
