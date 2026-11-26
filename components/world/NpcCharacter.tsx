"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export type NpcKind = "putteogi" | "ssudami" | "dangoma" | "kkuloma" | "jjongoma" | "fm";

/** 모델 기본 키 (NpcFigure 가 height/기본키로 배율을 잡는다) */
export const NPC_NATURAL_HEIGHT: Record<NpcKind, number> = {
  putteogi: 1.25,
  ssudami: 1.3,
  dangoma: 1.35,
  kkuloma: 1.35,
  jjongoma: 1.35,
  fm: 1.8,
};

interface NpcCharacterProps {
  kind: NpcKind;
  scale?: number;
  waving?: boolean;
}

export default function NpcCharacter({ kind, scale = 1, waving = false }: NpcCharacterProps) {
  return (
    <group scale={[scale, scale, scale]}>
      {kind === "putteogi" || kind === "ssudami" ? (
        <PotatoMascot variant={kind} waving={waving} />
      ) : kind === "fm" ? (
        <FmManager waving={waving} />
      ) : (
        <SweetPotatoMascot variant={kind} waving={waving} />
      )}
    </group>
  );
}

/* ── 애니메이션 헬퍼 ─────────────────────────────────────────── */
function useMascotMotion(waving: boolean) {
  const bodyRef = useRef<THREE.Group>(null);
  const armLRef = useRef<THREE.Group>(null);
  const armRRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const seed = useRef(Math.random() * 8);
  const waveRef = useRef(0);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime + seed.current;
    const breath = Math.sin(t * 2.1) * 0.03;

    if (bodyRef.current) {
      bodyRef.current.scale.set(1 + breath * 0.5, 1 - breath * 0.4, 1 + breath * 0.5);
      bodyRef.current.position.y = Math.abs(Math.sin(t * 1.25)) * 0.055;
      bodyRef.current.rotation.z = Math.sin(t * 0.9) * 0.02;
    }
    if (headRef.current) {
      headRef.current.rotation.z = Math.sin(t * 1.05) * 0.05;
      headRef.current.rotation.x = Math.sin(t * 0.75) * 0.03;
    }
    waveRef.current += ((waving ? 1 : 0) - waveRef.current) * Math.min(1, delta * 4);
    const wave = Math.sin(t * 8) * 0.6 * waveRef.current;

    if (armRRef.current) {
      armRRef.current.rotation.z = -0.45 * waveRef.current + wave;
      armRRef.current.rotation.x = Math.sin(t * 2) * 0.07;
    }
    if (armLRef.current) {
      armLRef.current.rotation.z = 0.45 * waveRef.current - wave * 0.3;
      armLRef.current.rotation.x = -Math.sin(t * 2) * 0.07;
    }
  });

  return { bodyRef, armLRef, armRRef, headRef };
}

/* 얼굴 — 눈·볼터치·웃는 입 */
function Face({ y = 0.7, z = 0.44, spread = 0.16, scale = 1 }: { y?: number; z?: number; spread?: number; scale?: number }) {
  return (
    <group scale={[scale, scale, scale]}>
      <mesh position={[-spread, y, z]}>
        <sphereGeometry args={[0.055, 12, 10]} />
        <meshStandardMaterial color="#2a221c" roughness={0.35} />
      </mesh>
      <mesh position={[spread, y, z]}>
        <sphereGeometry args={[0.055, 12, 10]} />
        <meshStandardMaterial color="#2a221c" roughness={0.35} />
      </mesh>
      <mesh position={[-spread - 0.11, y - 0.1, z - 0.02]} rotation={[0, 0.4, 0]}>
        <circleGeometry args={[0.085, 16]} />
        <meshStandardMaterial color="#f2b1ac" roughness={0.9} />
      </mesh>
      <mesh position={[spread + 0.11, y - 0.1, z - 0.02]} rotation={[0, -0.4, 0]}>
        <circleGeometry args={[0.085, 16]} />
        <meshStandardMaterial color="#f2b1ac" roughness={0.9} />
      </mesh>
      <mesh position={[0, y - 0.12, z + 0.02]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.055, 0.012, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#4a3a30" roughness={0.6} />
      </mesh>
    </group>
  );
}

/* ── 퍼뜨기 · 쑤담이 — 둥근 감자 몸통 ─────────────────────────── */
function PotatoMascot({ variant, waving }: { variant: "putteogi" | "ssudami"; waving: boolean }) {
  const { bodyRef, armLRef, armRRef, headRef } = useMascotMotion(waving);

  return (
    <group ref={bodyRef}>
      <mesh position={[0, 0.62, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.5, 26, 20]} />
        <meshStandardMaterial color="#fdf4dd" roughness={0.76} />
      </mesh>
      {/* 발 */}
      <mesh position={[-0.2, 0.16, 0.22]} scale={[0.16, 0.12, 0.2]} castShadow>
        <sphereGeometry args={[1, 12, 10]} />
        <meshStandardMaterial color="#f6e6c2" roughness={0.82} />
      </mesh>
      <mesh position={[0.2, 0.16, 0.22]} scale={[0.16, 0.12, 0.2]} castShadow>
        <sphereGeometry args={[1, 12, 10]} />
        <meshStandardMaterial color="#f6e6c2" roughness={0.82} />
      </mesh>

      <group ref={headRef}>
        <Face y={0.7} z={0.45} />
      </group>

      {/* 팔 */}
      <group ref={armLRef} position={[-0.44, 0.66, 0.08]}>
        <mesh scale={[0.15, 0.11, 0.11]} castShadow>
          <sphereGeometry args={[1, 12, 10]} />
          <meshStandardMaterial color="#fdf4dd" roughness={0.8} />
        </mesh>
      </group>
      <group ref={armRRef} position={[0.44, 0.66, 0.08]}>
        <mesh scale={[0.15, 0.11, 0.11]} castShadow>
          <sphereGeometry args={[1, 12, 10]} />
          <meshStandardMaterial color="#fdf4dd" roughness={0.8} />
        </mesh>
      </group>

      {variant === "putteogi" ? (
        <group position={[0.02, 1.06, 0]} rotation={[0.15, 0, 0.18]}>
          {/* 하트 모양 잎 */}
          <mesh position={[-0.1, 0.04, 0]} rotation={[0, 0, 0.55]} scale={[0.21, 0.14, 0.1]} castShadow>
            <sphereGeometry args={[1, 14, 10]} />
            <meshStandardMaterial color="#3f8c33" roughness={0.8} />
          </mesh>
          <mesh position={[0.1, 0.04, 0]} rotation={[0, 0, -0.55]} scale={[0.21, 0.14, 0.1]} castShadow>
            <sphereGeometry args={[1, 14, 10]} />
            <meshStandardMaterial color="#4ea33d" roughness={0.8} />
          </mesh>
          <mesh position={[0, -0.06, 0]} rotation={[0, 0, 0.5]}>
            <cylinderGeometry args={[0.02, 0.022, 0.2, 6]} />
            <meshStandardMaterial color="#2f6b28" roughness={0.9} />
          </mesh>
        </group>
      ) : (
        <group position={[0.17, 1.02, 0]} rotation={[0.25, 0, -0.3]}>
          {/* 흰 감자꽃 */}
          {[0, 1, 2, 3, 4].map((i) => {
            const a = (i / 5) * Math.PI * 2;
            return (
              <mesh
                key={i}
                position={[Math.cos(a) * 0.15, Math.sin(a) * 0.15, 0]}
                rotation={[0, 0, a]}
                scale={[0.16, 0.09, 0.05]}
                castShadow
              >
                <sphereGeometry args={[1, 12, 8]} />
                <meshStandardMaterial color="#ffffff" roughness={0.7} />
              </mesh>
            );
          })}
          <mesh position={[0, 0, 0.03]}>
            <sphereGeometry args={[0.06, 12, 10]} />
            <meshStandardMaterial color="#f4c63c" roughness={0.55} />
          </mesh>
          <mesh position={[0, -0.16, 0]} rotation={[0, 0, 0.15]}>
            <cylinderGeometry args={[0.018, 0.02, 0.22, 6]} />
            <meshStandardMaterial color="#4f8a3a" roughness={0.9} />
          </mesh>
        </group>
      )}
    </group>
  );
}

/* ── 고구마 3종 ───────────────────────────────────────────────── */
const SWEET_POTATO_STYLE: Record<
  "dangoma" | "kkuloma" | "jjongoma",
  { skin: string; flesh: string; roughness: number; body: [number, number, number]; rotate: number; glaze?: number }
> = {
  // 당고매 — 밭에서 갓 캐낸 자줏빛 원물
  dangoma: { skin: "#9c5a63", flesh: "#d99a86", roughness: 0.92, body: [0.42, 0.66, 0.42], rotate: 0.16 },
  // 꿀고매 — 군고구마/찐고구마, 노란 속살 + 구운 껍질 투톤
  kkuloma: { skin: "#c98a2f", flesh: "#f6c95a", roughness: 0.55, body: [0.44, 0.62, 0.44], rotate: -0.12, glaze: 0.35 },
  // 쫀고매 — 쫀득한 말랭이, 결이 살아있는 노란 스틱
  jjongoma: { skin: "#e0a92e", flesh: "#f7cf63", roughness: 0.38, body: [0.34, 0.72, 0.34], rotate: 0.22, glaze: 0.55 },
};

function SweetPotatoMascot({
  variant,
  waving,
}: {
  variant: "dangoma" | "kkuloma" | "jjongoma";
  waving: boolean;
}) {
  const { bodyRef, armLRef, armRRef, headRef } = useMascotMotion(waving);
  const style = SWEET_POTATO_STYLE[variant];

  return (
    <group ref={bodyRef}>
      <group position={[0, 0.68, 0]} rotation={[0, 0, style.rotate]}>
        {/* 껍질 몸통 */}
        <mesh scale={style.body} castShadow receiveShadow>
          <sphereGeometry args={[1, 26, 20]} />
          <meshStandardMaterial
            color={style.skin}
            roughness={style.roughness}
            metalness={style.glaze ? 0.08 : 0}
          />
        </mesh>
        {/* 속살 톤 (배 쪽) */}
        <mesh position={[0, 0, 0.12]} scale={[style.body[0] * 0.82, style.body[1] * 0.86, style.body[2] * 0.7]}>
          <sphereGeometry args={[1, 22, 18]} />
          <meshStandardMaterial color={style.flesh} roughness={0.6} />
        </mesh>
        {/* 말랭이 결 */}
        {variant === "jjongoma"
          ? [-0.2, 0, 0.2].map((x, i) => (
              <mesh key={i} position={[x, 0, 0.3]} scale={[0.05, 0.42, 0.04]}>
                <sphereGeometry args={[1, 10, 8]} />
                <meshStandardMaterial color="#c98d22" roughness={0.5} />
              </mesh>
            ))
          : null}
        {/* 구운 자국 (꿀고매) */}
        {variant === "kkuloma" ? (
          <mesh position={[0, 0.28, -0.14]} scale={[0.3, 0.18, 0.2]}>
            <sphereGeometry args={[1, 16, 12]} />
            <meshStandardMaterial color="#7d4a18" roughness={0.7} />
          </mesh>
        ) : null}
        {/* 흙 묻은 자국 (당고매) */}
        {variant === "dangoma"
          ? [
              [-0.24, 0.2, 0.32],
              [0.18, -0.28, 0.3],
              [0.28, 0.34, 0.1],
            ].map((p, i) => (
              <mesh key={i} position={p as [number, number, number]} scale={[0.05, 0.04, 0.02]}>
                <sphereGeometry args={[1, 8, 6]} />
                <meshStandardMaterial color="#5a3f2a" roughness={1} />
              </mesh>
            ))
          : null}
        {/* 꼭지/덩굴 */}
        <mesh position={[0, 0.72, 0]} rotation={[0, 0, 0.4]}>
          <cylinderGeometry args={[0.02, 0.03, 0.22, 6]} />
          <meshStandardMaterial color="#5c7a36" roughness={0.9} />
        </mesh>
        {variant !== "jjongoma" ? (
          <mesh position={[0.12, 0.84, 0]} rotation={[0.3, 0, 0.9]} scale={[0.14, 0.06, 0.05]}>
            <sphereGeometry args={[1, 10, 8]} />
            <meshStandardMaterial color="#5f8f3a" roughness={0.85} />
          </mesh>
        ) : null}

        {/* 눈·입 — 몸통 앞면 */}
        <group ref={headRef} position={[0, 0.1, 0]}>
          <Face y={0.06} z={0.42} spread={0.13} scale={0.9} />
        </group>
      </group>

      {/* 팔 */}
      <group ref={armLRef} position={[-0.42, 0.66, 0.06]}>
        <mesh scale={[0.1, 0.16, 0.09]} castShadow>
          <sphereGeometry args={[1, 10, 8]} />
          <meshStandardMaterial color={style.skin} roughness={0.85} />
        </mesh>
      </group>
      <group ref={armRRef} position={[0.42, 0.66, 0.06]}>
        <mesh scale={[0.1, 0.16, 0.09]} castShadow>
          <sphereGeometry args={[1, 10, 8]} />
          <meshStandardMaterial color={style.skin} roughness={0.85} />
        </mesh>
      </group>

      {/* 발 */}
      <mesh position={[-0.14, 0.08, 0.12]} scale={[0.1, 0.07, 0.14]} castShadow>
        <sphereGeometry args={[1, 10, 8]} />
        <meshStandardMaterial color="#6b4a2c" roughness={0.9} />
      </mesh>
      <mesh position={[0.14, 0.08, 0.12]} scale={[0.1, 0.07, 0.14]} castShadow>
        <sphereGeometry args={[1, 10, 8]} />
        <meshStandardMaterial color="#6b4a2c" roughness={0.9} />
      </mesh>
    </group>
  );
}

/* ── FM 쩡이 — 사람 형태 3D ─────────────────────────────────────── */
function FmManager({ waving }: { waving: boolean }) {
  const { bodyRef, armLRef, armRRef, headRef } = useMascotMotion(waving);

  return (
    <group ref={bodyRef}>
      {/* 다리 */}
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

      {/* 몸통 — 꽃무늬 작업복 */}
      <mesh position={[0, 1.02, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.29, 0.66, 14]} />
        <meshStandardMaterial color="#5b6f9a" roughness={0.82} />
      </mesh>
      {/* 체크 앞치마 */}
      <mesh position={[0, 0.95, 0.22]}>
        <boxGeometry args={[0.36, 0.5, 0.03]} />
        <meshStandardMaterial color="#e8d9bd" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.72, 0.235]}>
        <boxGeometry args={[0.36, 0.05, 0.035]} />
        <meshStandardMaterial color="#b98d5a" roughness={0.9} />
      </mesh>

      {/* 어깨·팔 */}
      <mesh position={[0, 1.36, 0]}>
        <sphereGeometry args={[0.22, 12, 10]} />
        <meshStandardMaterial color="#5b6f9a" roughness={0.82} />
      </mesh>
      <group ref={armLRef} position={[-0.26, 1.32, 0]}>
        <mesh position={[0, -0.24, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.055, 0.48, 10]} />
          <meshStandardMaterial color="#5b6f9a" roughness={0.85} />
        </mesh>
        <mesh position={[0, -0.5, 0]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#f0c69c" roughness={0.7} />
        </mesh>
        {/* 바구니 */}
        <mesh position={[0, -0.62, 0.06]}>
          <torusGeometry args={[0.11, 0.03, 8, 14, Math.PI]} />
          <meshStandardMaterial color="#a87a42" roughness={0.85} />
        </mesh>
        <mesh position={[0, -0.68, 0.06]} scale={[0.12, 0.08, 0.1]}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshStandardMaterial color="#8a5f2f" roughness={0.9} />
        </mesh>
      </group>
      <group ref={armRRef} position={[0.26, 1.32, 0]}>
        <mesh position={[0, -0.24, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.055, 0.48, 10]} />
          <meshStandardMaterial color="#5b6f9a" roughness={0.85} />
        </mesh>
        <mesh position={[0, -0.5, 0]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#f0c69c" roughness={0.7} />
        </mesh>
      </group>

      {/* 목·얼굴 */}
      <mesh position={[0, 1.46, 0]}>
        <cylinderGeometry args={[0.075, 0.085, 0.1, 8]} />
        <meshStandardMaterial color="#f0c69c" roughness={0.7} />
      </mesh>
      <group ref={headRef}>
        <mesh position={[0, 1.62, 0]} castShadow>
          <sphereGeometry args={[0.18, 18, 14]} />
          <meshStandardMaterial color="#f2cba3" roughness={0.66} />
        </mesh>
        <mesh position={[-0.065, 1.64, 0.16]}>
          <sphereGeometry args={[0.022, 8, 8]} />
          <meshStandardMaterial color="#2b2622" />
        </mesh>
        <mesh position={[0.065, 1.64, 0.16]}>
          <sphereGeometry args={[0.022, 8, 8]} />
          <meshStandardMaterial color="#2b2622" />
        </mesh>
        <mesh position={[0, 1.57, 0.17]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.03, 0.008, 6, 12, Math.PI]} />
          <meshStandardMaterial color="#9c5a4a" roughness={0.7} />
        </mesh>
        {/* 꽃무늬 챙모자 */}
        <mesh position={[0, 1.74, 0]} castShadow>
          <cylinderGeometry args={[0.36, 0.36, 0.03, 20]} />
          <meshStandardMaterial color="#4a7ea8" roughness={0.85} />
        </mesh>
        <mesh position={[0, 1.81, 0]} castShadow>
          <cylinderGeometry args={[0.17, 0.19, 0.14, 16]} />
          <meshStandardMaterial color="#4a7ea8" roughness={0.85} />
        </mesh>
        <mesh position={[0, 1.755, 0]}>
          <cylinderGeometry args={[0.195, 0.195, 0.035, 16]} />
          <meshStandardMaterial color="#e9e2cf" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}
