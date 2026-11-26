"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getFaceTexture, type FaceStyle } from "./faceTextures";
import { HeartLeafTopper, PotatoFlowerTopper } from "./Decorations";

export type NpcKind = "putteogi" | "ssudami" | "dangoma" | "kkuloma" | "jjongoma" | "fm";

/** 모델 기본 키 (NpcFigure 가 height/기본키로 배율을 잡는다) */
export const NPC_NATURAL_HEIGHT: Record<NpcKind, number> = {
  putteogi: 1.3,
  ssudami: 1.36,
  dangoma: 1.4,
  kkuloma: 1.4,
  jjongoma: 1.4,
  fm: 1.9,
};

export interface GatherTarget {
  /** 부모 그룹(농장지기 위치) 기준 상대 좌표 */
  x: number;
  z: number;
  /** 바라볼 방향 */
  yaw: number;
}

interface NpcCharacterProps {
  kind: NpcKind;
  scale?: number;
  waving?: boolean;
  walkAxis?: "x" | "z";
  /** 포토존 단체사진 — 지정한 자리로 모여 선다 */
  gather?: GatherTarget | null;
}

export default function NpcCharacter({ kind, scale = 1, waving = false, walkAxis = "x", gather = null }: NpcCharacterProps) {
  return (
    <group scale={[scale, scale, scale]}>
      {kind === "putteogi" || kind === "ssudami" ? (
        <PotatoMascot variant={kind} waving={waving} walkAxis={walkAxis} gather={gather} />
      ) : kind === "fm" ? (
        <FmManager waving={waving} walkAxis={walkAxis} gather={gather} />
      ) : (
        <SweetPotatoMascot variant={kind} waving={waving} walkAxis={walkAxis} gather={gather} />
      )}
    </group>
  );
}

/* ── 애니메이션 ─────────────────────────────────────────────── */
type Action = "water" | "soil" | "walk" | "wave" | "stretch" | "visit";

/**
 * 몇 초마다 행동을 바꿔 가며 일하는 루틴.
 * 밭일(soil) → 물 주기(water) → 다른 곳으로 이동(walk) → 기지개(stretch) → 손 흔들기(wave) 순환.
 */
function useMascotMotion(
  waving: boolean,
  actions: Action[] = ["soil", "walk", "wave"],
  walkAxis: "x" | "z" = "x",
  gather: GatherTarget | null = null
) {
  const rootRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const armLRef = useRef<THREE.Group>(null);
  const armRRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const seed = useRef(Math.random() * 8);
  const waveRef = useRef(0);
  const actionIdxRef = useRef(0);
  const actionStartRef = useRef(0);
  const actionDurRef = useRef(5);
  const offsetRef = useRef(new THREE.Vector3(0, 0, 0));
  const startedRef = useRef(false);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime + seed.current;
    const dt = Math.min(delta, 0.05);

    if (!startedRef.current) {
      startedRef.current = true;
      actionStartRef.current = t;
      actionDurRef.current = 4 + Math.random() * 3;
    }
    if (t - actionStartRef.current > actionDurRef.current) {
      actionStartRef.current = t;
      actionIdxRef.current = (actionIdxRef.current + 1) % actions.length;
      actionDurRef.current = 4.5 + Math.random() * 4;
    }

    const action: Action = waving || gather ? "wave" : actions[actionIdxRef.current];
    const local = t - actionStartRef.current;

    let bend = 0;
    let armX = 0;
    let targetX = 0;
    let targetZ = 0;

    switch (action) {
      case "water":
        bend = 0.24 + Math.sin(local * 3) * 0.07;
        armX = -0.95;
        break;
      case "soil":
        bend = 0.28 + Math.max(0, Math.sin(local * 2.4)) * 0.18;
        armX = -0.45 + Math.sin(local * 4) * 0.3;
        break;
      case "walk":
        // 작물을 밟지 않도록 통로 방향으로만 오간다
        if (walkAxis === "x") {
          targetX = Math.sin(local * 0.55) * 1.4;
        } else {
          targetZ = Math.sin(local * 0.5) * 1.4;
        }
        break;
      case "stretch":
        bend = -0.07;
        armX = -1.15 + Math.sin(local * 1.6) * 0.15;
        break;
      case "visit":
        targetX = 1.9;
        targetZ = -1.9;
        bend = local > 2.6 ? 0.42 : 0.05;
        armX = local > 2.6 ? -0.75 : 0;
        break;
      case "wave":
      default:
        bend = 0;
        armX = -0.2;
        break;
    }

    offsetRef.current.x = THREE.MathUtils.lerp(offsetRef.current.x, targetX, Math.min(1, dt * 0.8));
    offsetRef.current.z = THREE.MathUtils.lerp(offsetRef.current.z, targetZ, Math.min(1, dt * 0.8));
    const moving = action === "walk" || action === "visit";

    if (rootRef.current) {
      const destX = gather ? gather.x : offsetRef.current.x;
      const destZ = gather ? gather.z : offsetRef.current.z;
      const posK = Math.min(1, dt * (gather ? 1.9 : 3.4));
      rootRef.current.position.x += (destX - rootRef.current.position.x) * posK;
      rootRef.current.position.z += (destZ - rootRef.current.position.z) * posK;

      const heading = gather
        ? gather.yaw
        : moving
          ? Math.atan2(targetX - offsetRef.current.x, targetZ - offsetRef.current.z)
          : Math.sin(t * 0.16) * 0.45;
      rootRef.current.rotation.y = THREE.MathUtils.lerp(rootRef.current.rotation.y, heading, Math.min(1, dt * 2.6));
    }

    if (bodyRef.current) {
      const breath = Math.sin(t * 2.1) * 0.028;
      // 포토존으로 걸어오는 중에는 통통 튀는 걸음
      const traveling = gather && rootRef.current
        ? Math.min(1, Math.hypot(gather.x - rootRef.current.position.x, gather.z - rootRef.current.position.z) * 0.8)
        : 0;
      bodyRef.current.scale.set(1 + breath * 0.5, 1 - breath * 0.4, 1 + breath * 0.5);
      bodyRef.current.position.y =
        Math.abs(Math.sin(t * (moving || traveling > 0.1 ? 7 : 1.25))) * (moving || traveling > 0.1 ? 0.045 * Math.max(0.4, traveling) : 0.028);
      bodyRef.current.rotation.z = Math.sin(t * 0.9) * 0.015;
      bodyRef.current.rotation.x = THREE.MathUtils.lerp(bodyRef.current.rotation.x, bend, Math.min(1, dt * 3));
    }
    if (headRef.current) {
      headRef.current.rotation.z = Math.sin(t * 1.05) * 0.04;
      headRef.current.rotation.x = Math.sin(t * 0.75) * 0.025;
    }

    waveRef.current += ((waving ? 1 : 0) - waveRef.current) * Math.min(1, dt * 4);
    const wave = Math.sin(t * 9) * 0.6 * waveRef.current;

    if (armRRef.current) {
      armRRef.current.rotation.z = THREE.MathUtils.lerp(armRRef.current.rotation.z, -0.5 * waveRef.current + wave, Math.min(1, dt * 4));
      armRRef.current.rotation.x = THREE.MathUtils.lerp(armRRef.current.rotation.x, armX, Math.min(1, dt * 3));
    }
    if (armLRef.current) {
      armLRef.current.rotation.z = THREE.MathUtils.lerp(armLRef.current.rotation.z, 0.5 * waveRef.current - wave * 0.3, Math.min(1, dt * 4));
      armLRef.current.rotation.x = THREE.MathUtils.lerp(armLRef.current.rotation.x, armX * 0.5, Math.min(1, dt * 3));
    }
  });

  return { rootRef, bodyRef, armLRef, armRRef, headRef };
}

/** 만화풍 외곽선이 있는 둥근 몸통 */
function ToonEllipsoid({
  scale,
  color,
  roughness,
  outline = 0.035,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}: {
  scale: [number, number, number];
  color: string;
  roughness: number;
  outline?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[1, 30, 24]} />
        <meshStandardMaterial color={color} roughness={roughness} metalness={0.02} />
      </mesh>
      <mesh scale={1 + outline}>
        <sphereGeometry args={[1, 24, 18]} />
        <meshBasicMaterial color="#2f2419" side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

/** 원본 얼굴을 그린 캔버스 텍스처를 얼굴 앞에 얹는다 */
function FacePlane({ style, position, size }: { style: FaceStyle; position: [number, number, number]; size: number }) {
  const texture = getFaceTexture(style);
  return (
    <mesh position={position} renderOrder={2}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial map={texture} transparent alphaTest={0.02} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

/* ── 퍼뜨기 · 쑤담이 ─────────────────────────────────────────── */
function PotatoMascot({
  variant,
  waving,
  walkAxis = "x",
  gather = null,
}: {
  variant: "putteogi" | "ssudami";
  waving: boolean;
  walkAxis?: "x" | "z";
  gather?: GatherTarget | null;
}) {
  const { rootRef, bodyRef, armLRef, armRRef, headRef } = useMascotMotion(
    waving,
    variant === "putteogi"
      ? ["water", "walk", "soil", "wave", "stretch"]
      : ["soil", "walk", "water", "wave", "stretch"],
    walkAxis,
    gather
  );

  return (
    <group ref={rootRef}>
    <group ref={bodyRef}>
      <ToonEllipsoid scale={[0.5, 0.47, 0.48]} color="#fdf6e3" roughness={0.72} position={[0, 0.6, 0]} />

      {/* 발 */}
      <ToonEllipsoid scale={[0.15, 0.11, 0.18]} color="#faf0d2" roughness={0.8} outline={0.06} position={[-0.2, 0.14, 0.2]} />
      <ToonEllipsoid scale={[0.15, 0.11, 0.18]} color="#faf0d2" roughness={0.8} outline={0.06} position={[0.2, 0.14, 0.2]} />

      <group ref={headRef}>
        <FacePlane style="potato" position={[0, 0.63, 0.44]} size={0.78} />
      </group>

      {/* 팔 */}
      <group ref={armLRef} position={[-0.46, 0.62, 0.05]}>
        <ToonEllipsoid scale={[0.11, 0.09, 0.09]} color="#fdf6e3" roughness={0.78} outline={0.1} />
      </group>
      <group ref={armRRef} position={[0.46, 0.62, 0.05]}>
        <ToonEllipsoid scale={[0.11, 0.09, 0.09]} color="#fdf6e3" roughness={0.78} outline={0.1} />
      </group>

      {variant === "putteogi" ? (
        /* 퍼뜨기 — 정수리에서 올라온 짧은 줄기 위, 입체 하트 고구마잎 */
        <group position={[0, 1.03, -0.03]}>
          <HeartLeafTopper />
        </group>
      ) : (
        /* 쑤담이 — 오른쪽 머리 위, 뾰족한 흰색 5잎 감자꽃 + 노란 별 꽃술 */
        <group position={[0.2, 1.02, 0.06]}>
          <PotatoFlowerTopper />
        </group>
      )}

      {/* 일 도구 — 퍼뜨기는 물뿌리개, 쑤담이는 작은 호미 */}
      {variant === "putteogi" ? (
        <group position={[0.42, 0.42, 0.28]} rotation={[0, -0.5, 0.15]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.1, 0.12, 0.16, 12]} />
            <meshStandardMaterial color="#6e9bb5" roughness={0.6} metalness={0.25} />
          </mesh>
          <mesh position={[0.14, 0.02, 0]} rotation={[0, 0, -0.6]}>
            <cylinderGeometry args={[0.02, 0.025, 0.2, 8]} />
            <meshStandardMaterial color="#6e9bb5" roughness={0.6} metalness={0.25} />
          </mesh>
          <mesh position={[-0.12, 0.05, 0]} rotation={[0, 0, 0.5]}>
            <torusGeometry args={[0.07, 0.014, 6, 12, Math.PI]} />
            <meshStandardMaterial color="#6e9bb5" roughness={0.6} metalness={0.25} />
          </mesh>
        </group>
      ) : (
        <group position={[0.4, 0.3, 0.3]} rotation={[0.3, -0.4, 0.35]}>
          <mesh>
            <cylinderGeometry args={[0.018, 0.022, 0.3, 8]} />
            <meshStandardMaterial color="#8a6238" roughness={0.9} />
          </mesh>
          <mesh position={[0, -0.19, 0]} rotation={[0, 0, 0]}>
            <boxGeometry args={[0.09, 0.03, 0.16]} />
            <meshStandardMaterial color="#a9b0b6" metalness={0.55} roughness={0.45} />
          </mesh>
        </group>
      )}
    </group>
    </group>
  );
}

/* ── 고구마 3종 ─────────────────────────────────────────────── */
function SweetPotatoMascot({
  variant,
  waving,
  walkAxis = "x",
  gather = null,
}: {
  variant: "dangoma" | "kkuloma" | "jjongoma";
  waving: boolean;
  walkAxis?: "x" | "z";
  gather?: GatherTarget | null;
}) {
  const { rootRef, bodyRef, armLRef, armRRef, headRef } = useMascotMotion(waving, ["walk", "soil", "stretch", "wave"], walkAxis, gather);

  const config =
    variant === "dangoma"
      ? { body: [0.36, 0.58, 0.34] as [number, number, number], color: "#b0747f", belly: "#cf9aa4", rot: 0.18, rough: 0.9 }
      : variant === "kkuloma"
        ? { body: [0.42, 0.54, 0.38] as [number, number, number], color: "#f4c64e", belly: "#f9d979", rot: -0.12, rough: 0.34 }
        : { body: [0.28, 0.72, 0.28] as [number, number, number], color: "#eab730", belly: "#f8dc8c", rot: 0.22, rough: 0.3 };

  return (
    <group ref={rootRef}>
    <group ref={bodyRef}>
      <group position={[0, 0.72, 0]} rotation={[0, 0, config.rot]}>
        {/* 당고매: 자줏빛 껍질 + 흙 묻은 결 */}
        {variant === "dangoma" ? (
          <ToonEllipsoid scale={config.body} color={config.color} roughness={config.rough} />
        ) : null}

        {/* 꿀고매: 노릇한 껍질 테두리 위에 노란 속살 */}
        {variant === "kkuloma" ? (
          <>
            <ToonEllipsoid scale={[0.44, 0.56, 0.4]} color="#8a451a" roughness={0.7} position={[-0.05, 0, -0.03]} />
            <group position={[0, 0, 0.03]}>
              <ToonEllipsoid scale={[0.37, 0.5, 0.34]} color={config.color} roughness={config.rough} outline={0.02} />
              {/* 윤기 나는 하이라이트 */}
              <mesh position={[0.12, 0.22, 0.28]} scale={[0.1, 0.16, 0.03]} rotation={[0, 0, -0.4]}>
                <sphereGeometry args={[1, 12, 10]} />
                <meshBasicMaterial color="#fff3c4" transparent opacity={0.55} toneMapped={false} />
              </mesh>
            </group>
          </>
        ) : null}

        {/* 쫀고매: 노란 말랭이 스틱 */}
        {variant === "jjongoma" ? (
          <>
            <ToonEllipsoid scale={config.body} color={config.color} roughness={config.rough} />
            {/* 말린 결 */}
            {[-0.16, 0.02, 0.18].map((x, i) => (
              <mesh key={i} position={[x, 0.05, 0.22]} scale={[0.03, 0.34, 0.02]}>
                <sphereGeometry args={[1, 8, 8]} />
                <meshStandardMaterial color="#f8dc8c" roughness={0.4} />
              </mesh>
            ))}
            {/* 묶인 꼭지 */}
            <mesh position={[0, 0.66, 0]} scale={[0.13, 0.1, 0.13]}>
              <sphereGeometry args={[1, 12, 10]} />
              <meshStandardMaterial color="#c98a22" roughness={0.5} />
            </mesh>
          </>
        ) : null}

        {/* 속살 하이라이트 */}
        {(variant === "kkuloma" || variant === "jjongoma" || variant === "dangoma") ? (
          <mesh position={[0, 0.02, 0.24]} scale={[config.body[0] * 0.7, config.body[1] * 0.62, 0.06]}>
            <sphereGeometry args={[1, 18, 14]} />
            <meshStandardMaterial
              color={config.belly}
              roughness={0.5}
              transparent
              opacity={variant === "dangoma" ? 0.75 : 0.9}
            />
          </mesh>
        ) : null}

        {/* 꼭지 · 머리 장식 — 원본 고유 포인트 */}
        {variant === "dangoma" ? (
          /* 당고매: 가는 덩굴이 말려 올라가고 작은 잎이 달린 꼭지 */
          <group position={[0.04, config.body[1] * 0.96, 0]} rotation={[0.15, 0, 0.3]}>
            <mesh rotation={[0, 0, 0.2]}>
              <cylinderGeometry args={[0.014, 0.02, 0.2, 6]} />
              <meshStandardMaterial color="#5f8036" roughness={0.9} />
            </mesh>
            <mesh position={[0.07, 0.16, 0]} rotation={[0, 0, 1.2]}>
              <torusGeometry args={[0.055, 0.012, 6, 12, Math.PI * 1.4]} />
              <meshStandardMaterial color="#6b8f3a" roughness={0.85} />
            </mesh>
            <mesh position={[0.13, 0.24, 0]} rotation={[0, 0, -0.6]} scale={[0.09, 0.06, 0.03]} castShadow>
              <sphereGeometry args={[1, 12, 10]} />
              <meshStandardMaterial color="#77a040" roughness={0.8} />
            </mesh>
          </group>
        ) : null}

        {variant === "kkuloma" ? (
          /* 꿀고매: 꼬마 꼭지 + 반짝이 */
          <>
            <mesh position={[0.02, config.body[1] * 0.98, 0]} rotation={[0, 0, 0.3]}>
              <coneGeometry args={[0.05, 0.14, 8]} />
              <meshStandardMaterial color="#8f4f22" roughness={0.7} />
            </mesh>
            {[
              [0.42, 0.3, 0.12, 0.055],
              [-0.4, 0.42, 0.05, 0.045],
              [0.3, 0.6, -0.1, 0.04],
              [-0.26, -0.2, 0.24, 0.035],
            ].map(([x, y, z, size], i) => (
              <mesh key={i} position={[x, y, z]} rotation={[0, 0, Math.PI / 4]} scale={[size, size, size]}>
                <octahedronGeometry args={[1, 0]} />
                <meshBasicMaterial color="#ffe9a6" toneMapped={false} />
              </mesh>
            ))}
          </>
        ) : null}

        {variant === "jjongoma" ? (
          /* 쫀고매: 묶어 말린 꼭지 (끈) */
          <>
            <mesh position={[0, config.body[1] * 0.95, 0]} rotation={[0, 0, 0.2]}>
              <coneGeometry args={[0.07, 0.16, 10]} />
              <meshStandardMaterial color="#c98a22" roughness={0.55} />
            </mesh>
            <mesh position={[0, config.body[1] * 0.95 - 0.02, 0]} rotation={[0, 0, 0.2]}>
              <torusGeometry args={[0.062, 0.014, 6, 14]} />
              <meshStandardMaterial color="#7d4f16" roughness={0.7} />
            </mesh>
           </>
        ) : null}

        <group ref={headRef}>
          <FacePlane
            style={variant}
            position={[0, variant === "jjongoma" ? 0.12 : 0.06, config.body[2] + 0.03]}
            size={variant === "jjongoma" ? 0.5 : 0.56}
          />
        </group>
      </group>

      {/* 팔 */}
      <group ref={armLRef} position={[-0.4, 0.7, 0.05]}>
        <ToonEllipsoid scale={[0.08, 0.13, 0.08]} color={config.color} roughness={0.85} outline={0.1} />
      </group>
      <group ref={armRRef} position={[0.4, 0.7, 0.05]}>
        <ToonEllipsoid scale={[0.08, 0.13, 0.08]} color={config.color} roughness={0.85} outline={0.1} />
      </group>

      {/* 발 */}
      <ToonEllipsoid scale={[0.085, 0.06, 0.12]} color="#6b4a2c" roughness={0.9} outline={0.08} position={[-0.13, 0.07, 0.1]} />
      <ToonEllipsoid scale={[0.085, 0.06, 0.12]} color="#6b4a2c" roughness={0.9} outline={0.08} position={[0.13, 0.07, 0.1]} />
    </group>
    </group>
  );
}

/* ── FM 쩡이 ────────────────────────────────────────────────── */
function FmManager({ waving, walkAxis = "x", gather = null }: { waving: boolean; walkAxis?: "x" | "z"; gather?: GatherTarget | null }) {
  const { rootRef, bodyRef, armLRef, armRRef, headRef } = useMascotMotion(waving, ["wave", "visit", "walk", "soil"], walkAxis, gather);

  return (
    <group ref={rootRef}>
    <group ref={bodyRef}>
      <mesh position={[-0.1, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.075, 0.07, 0.7, 10]} />
        <meshStandardMaterial color="#3c4a5c" roughness={0.85} />
      </mesh>
      <mesh position={[0.1, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.075, 0.07, 0.7, 10]} />
        <meshStandardMaterial color="#3c4a5c" roughness={0.85} />
      </mesh>
      <mesh position={[-0.1, 0.06, 0.04]} castShadow>
        <boxGeometry args={[0.16, 0.11, 0.26]} />
        <meshStandardMaterial color="#2b2a28" roughness={0.9} />
      </mesh>
      <mesh position={[0.1, 0.06, 0.04]} castShadow>
        <boxGeometry args={[0.16, 0.11, 0.26]} />
        <meshStandardMaterial color="#2b2a28" roughness={0.9} />
      </mesh>

      <mesh position={[0, 1.02, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.29, 0.66, 16]} />
        <meshStandardMaterial color="#5b6f9a" roughness={0.82} />
      </mesh>
      <mesh position={[0, 0.95, 0.22]}>
        <boxGeometry args={[0.36, 0.5, 0.03]} />
        <meshStandardMaterial color="#e8d9bd" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.72, 0.235]}>
        <boxGeometry args={[0.36, 0.05, 0.035]} />
        <meshStandardMaterial color="#b98d5a" roughness={0.9} />
      </mesh>

      <mesh position={[0, 1.36, 0]}>
        <sphereGeometry args={[0.22, 14, 12]} />
        <meshStandardMaterial color="#5b6f9a" roughness={0.82} />
      </mesh>

      <group ref={armLRef} position={[-0.26, 1.32, 0]}>
        <mesh position={[0, -0.24, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.055, 0.48, 10]} />
          <meshStandardMaterial color="#5b6f9a" roughness={0.85} />
        </mesh>
        <mesh position={[0, -0.5, 0]}>
          <sphereGeometry args={[0.06, 10, 8]} />
          <meshStandardMaterial color="#f0c69c" roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.64, 0.07]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.11, 0.028, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#a87a42" roughness={0.85} />
        </mesh>
        <mesh position={[0, -0.7, 0.07]} scale={[0.12, 0.08, 0.1]}>
          <sphereGeometry args={[1, 12, 10]} />
          <meshStandardMaterial color="#8a5f2f" roughness={0.9} />
        </mesh>
      </group>

      <group ref={armRRef} position={[0.26, 1.32, 0]}>
        <mesh position={[0, -0.24, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.055, 0.48, 10]} />
          <meshStandardMaterial color="#5b6f9a" roughness={0.85} />
        </mesh>
        <mesh position={[0, -0.5, 0]}>
          <sphereGeometry args={[0.06, 10, 8]} />
          <meshStandardMaterial color="#f0c69c" roughness={0.7} />
        </mesh>
      </group>

      <mesh position={[0, 1.46, 0]}>
        <cylinderGeometry args={[0.075, 0.085, 0.1, 8]} />
        <meshStandardMaterial color="#f0c69c" roughness={0.7} />
      </mesh>

      <group ref={headRef}>
        <mesh position={[0, 1.62, 0]} castShadow>
          <sphereGeometry args={[0.18, 20, 16]} />
          <meshStandardMaterial color="#f2cba3" roughness={0.66} />
        </mesh>
        <mesh position={[-0.065, 1.64, 0.155]}>
          <sphereGeometry args={[0.024, 10, 8]} />
          <meshStandardMaterial color="#2b2622" />
        </mesh>
        <mesh position={[0.065, 1.64, 0.155]}>
          <sphereGeometry args={[0.024, 10, 8]} />
          <meshStandardMaterial color="#2b2622" />
        </mesh>
        <mesh position={[-0.13, 1.58, 0.13]} rotation={[0, 0.5, 0]}>
          <circleGeometry args={[0.045, 12]} />
          <meshStandardMaterial color="#e89b93" roughness={0.9} />
        </mesh>
        <mesh position={[0.13, 1.58, 0.13]} rotation={[0, -0.5, 0]}>
          <circleGeometry args={[0.045, 12]} />
          <meshStandardMaterial color="#e89b93" roughness={0.9} />
        </mesh>
        <mesh position={[0, 1.57, 0.165]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.032, 0.009, 6, 14, Math.PI]} />
          <meshStandardMaterial color="#9c5a4a" roughness={0.7} />
        </mesh>

        {/* 꽃무늬 챙모자 */}
        <mesh position={[0, 1.74, 0]} castShadow>
          <cylinderGeometry args={[0.36, 0.36, 0.03, 22]} />
          <meshStandardMaterial color="#4a7ea8" roughness={0.85} />
        </mesh>
        <mesh position={[0, 1.81, 0]} castShadow>
          <cylinderGeometry args={[0.17, 0.19, 0.14, 18]} />
          <meshStandardMaterial color="#4a7ea8" roughness={0.85} />
        </mesh>
        <mesh position={[0, 1.755, 0]}>
          <cylinderGeometry args={[0.195, 0.195, 0.035, 18]} />
          <meshStandardMaterial color="#e9e2cf" roughness={0.9} />
        </mesh>
      </group>
    </group>
    </group>
  );
}
