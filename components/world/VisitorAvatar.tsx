"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export type AvatarPresetId = "farmer" | "farmerette" | "kid";

export interface AvatarPreset {
  id: AvatarPresetId;
  /** 선택 UI에 보이는 이름 — 성별·스타일이 한눈에 구분되게 */
  label: string;
  description: string;
  icon: string;
  gender: "male" | "female" | "child";
  hairStyle: "short" | "ponytail" | "bob";
  lower: "pants" | "skirt" | "shorts";
  hat: "ball" | "straw" | "bucket";
  shirt: string;
  shirtAlt: string;
  pants: string;
  hatColor: string;
  hair: string;
  skin: string;
  apron?: string;
  scale: number;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: "farmer",
    label: "남성 · 작업복 농부",
    description: "짧은 머리 + 볼캡, 넓은 어깨 작업셔츠",
    icon: "man",
    gender: "male",
    hairStyle: "short",
    lower: "pants",
    hat: "ball",
    shirt: "#3f6fa8",
    shirtAlt: "#2e5480",
    pants: "#39485a",
    hatColor: "#2f6b3f",
    hair: "#2a211c",
    skin: "#f0c69c",
    scale: 1,
  },
  {
    id: "farmerette",
    label: "여성 · 앞치마 방문객",
    description: "긴 머리 묶음 + 밀짚모자, A라인 치마",
    icon: "woman",
    gender: "female",
    hairStyle: "ponytail",
    lower: "skirt",
    hat: "straw",
    shirt: "#c96a58",
    shirtAlt: "#a8523f",
    pants: "#e7dcc6",
    hatColor: "#d9b878",
    hair: "#3b2a22",
    skin: "#f4cfae",
    apron: "#efe7d6",
    scale: 0.97,
  },
  {
    id: "kid",
    label: "어린이 · 꼬마 방문객",
    description: "단발머리 + 버킷햇, 반바지",
    icon: "child_care",
    gender: "child",
    hairStyle: "bob",
    lower: "shorts",
    hat: "bucket",
    shirt: "#e8b93a",
    shirtAlt: "#c99a22",
    pants: "#4a6b8a",
    hatColor: "#7fae5a",
    hair: "#241b16",
    skin: "#f7d3b0",
    scale: 0.72,
  },
];

interface VisitorAvatarProps {
  preset: AvatarPresetId;
  /** 컨트롤러가 공유하는 이동 상태 (걷기 애니메이션 트리거) */
  movingState: React.RefObject<{ moving: boolean }>;
}

/** 반구 — 모자 챙/머리 위 곡면에 쓴다 */
function Dome({
  r,
  color,
  position,
  scale,
}: {
  r: number;
  color: string;
  position: [number, number, number];
  scale?: [number, number, number];
}) {
  return (
    <mesh position={position} scale={scale ?? [1, 1, 1]} castShadow>
      <sphereGeometry args={[r, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color={color} roughness={0.82} />
    </mesh>
  );
}

/**
 * 방문자(플레이어) — 사람 형태 3D 아바타.
 * 남성·여성·어린이가 실루엣(머리·모자·하의)으로 확실히 구분되고, 걸을 때 팔다리가 흔들린다.
 */
export default function VisitorAvatar({ preset, movingState }: VisitorAvatarProps) {
  const config = useMemo(
    () => AVATAR_PRESETS.find((p) => p.id === preset) ?? AVATAR_PRESETS[0],
    [preset]
  );

  const bodyRef = useRef<THREE.Group>(null);
  const legLRef = useRef<THREE.Group>(null);
  const legRRef = useRef<THREE.Group>(null);
  const armLRef = useRef<THREE.Group>(null);
  const armRRef = useRef<THREE.Group>(null);
  const skirtRef = useRef<THREE.Group>(null);
  const phaseRef = useRef(0);

  useFrame((_, delta) => {
    const moving = movingState.current?.moving ?? false;
    const speed = moving ? 9 : 1.6;
    phaseRef.current += delta * speed;
    const swing = moving ? 0.6 : 0.04;

    const sin = Math.sin(phaseRef.current);
    if (legLRef.current) legLRef.current.rotation.x = sin * swing;
    if (legRRef.current) legRRef.current.rotation.x = -sin * swing;
    if (armLRef.current) armLRef.current.rotation.x = -sin * swing * 0.8;
    if (armRRef.current) armRRef.current.rotation.x = sin * swing * 0.8;
    if (skirtRef.current) {
      skirtRef.current.rotation.z = Math.sin(phaseRef.current * 0.9) * (moving ? 0.07 : 0.02);
      skirtRef.current.scale.x = 1 + Math.sin(phaseRef.current * 1.8) * (moving ? 0.04 : 0.012);
    }
    if (bodyRef.current) {
      bodyRef.current.position.y = moving ? Math.abs(Math.sin(phaseRef.current)) * 0.045 : 0;
    }
  });

  const s = config.scale;
  const isFemale = config.gender === "female";
  const isChild = config.gender === "child";
  const shoulder = isFemale ? 0.2 : isChild ? 0.17 : 0.245;
  const waist = isFemale ? 0.19 : isChild ? 0.18 : 0.215;
  const hip = isFemale ? 0.225 : isChild ? 0.19 : 0.21;
  const legTop = isFemale ? 0.66 : isChild ? 0.5 : 0.58;

  return (
    <group scale={[s, s, s]}>
      <group ref={bodyRef}>
        {/* ── 다리 ───────────────────────────────── */}
        <group ref={legLRef} position={[isFemale ? -0.085 : -0.1, legTop, 0]}>
          {config.lower === "pants" ? (
            <>
              <mesh position={[0, -0.28, 0]} castShadow>
                <cylinderGeometry args={[0.082, 0.07, 0.56, 8]} />
                <meshStandardMaterial color={config.pants} roughness={0.88} />
              </mesh>
              <mesh position={[0, -0.58, 0.035]} castShadow>
                <boxGeometry args={[0.16, 0.1, 0.27]} />
                <meshStandardMaterial color="#2c2a28" roughness={0.9} />
              </mesh>
            </>
          ) : (
            <>
              {/* 치마·반바지 아래 드러나는 다리 */}
              <mesh position={[0, -0.2, 0]} castShadow>
                <cylinderGeometry args={[0.055, 0.045, 0.4, 8]} />
                <meshStandardMaterial color={config.skin} roughness={0.7} />
              </mesh>
              <mesh position={[0, -0.44, 0.03]} castShadow>
                <boxGeometry args={[0.12, 0.08, 0.22]} />
                <meshStandardMaterial color={isChild ? "#3f4a55" : "#b8846a"} roughness={0.85} />
              </mesh>
            </>
          )}
        </group>
        <group ref={legRRef} position={[isFemale ? 0.085 : 0.1, legTop, 0]}>
          {config.lower === "pants" ? (
            <>
              <mesh position={[0, -0.28, 0]} castShadow>
                <cylinderGeometry args={[0.082, 0.07, 0.56, 8]} />
                <meshStandardMaterial color={config.pants} roughness={0.88} />
              </mesh>
              <mesh position={[0, -0.58, 0.035]} castShadow>
                <boxGeometry args={[0.16, 0.1, 0.27]} />
                <meshStandardMaterial color="#2c2a28" roughness={0.9} />
              </mesh>
            </>
          ) : (
            <>
              <mesh position={[0, -0.2, 0]} castShadow>
                <cylinderGeometry args={[0.055, 0.045, 0.4, 8]} />
                <meshStandardMaterial color={config.skin} roughness={0.7} />
              </mesh>
              <mesh position={[0, -0.44, 0.03]} castShadow>
                <boxGeometry args={[0.12, 0.08, 0.22]} />
                <meshStandardMaterial color={isChild ? "#3f4a55" : "#b8846a"} roughness={0.85} />
              </mesh>
            </>
          )}
        </group>

        {/* ── 하의 실루엣 ─────────────────────────── */}
        {config.lower === "skirt" ? (
          <group ref={skirtRef} position={[0, 0.92, 0]}>
            {/* A라인 치마 — 허리에서 밑으로 퍼지는 여성 실루엣 */}
            <mesh position={[0, -0.2, 0]} castShadow>
              <cylinderGeometry args={[hip, 0.33, 0.46, 16, 1, true]} />
              <meshStandardMaterial color={config.pants} roughness={0.86} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, 0.02, 0]} castShadow>
              <cylinderGeometry args={[waist * 0.99, hip, 0.1, 16]} />
              <meshStandardMaterial color={config.pants} roughness={0.86} />
            </mesh>
          </group>
        ) : config.lower === "shorts" ? (
          <mesh position={[0, 0.64, 0]} castShadow>
            <cylinderGeometry args={[hip, hip * 1.02, 0.26, 12]} />
            <meshStandardMaterial color={config.pants} roughness={0.88} />
          </mesh>
        ) : null}

        {/* ── 몸통 ───────────────────────────────── */}
        <mesh position={[0, isChild ? 0.95 : 1.02, 0]} castShadow>
          {config.lower === "pants" ? (
            <cylinderGeometry args={[hip * 0.96, waist * 1.06, isChild ? 0.34 : 0.42, 14]} />
          ) : (
            <cylinderGeometry args={[shoulder * 0.9, waist, isChild ? 0.3 : 0.36, 14]} />
          )}
          <meshStandardMaterial color={config.shirt} roughness={0.82} />
        </mesh>

        {/* 셔츠 깃·단추 라인 — 남성 작업복 느낌 */}
        {config.gender === "male" ? (
          <>
            <mesh position={[0, 1.14, 0.19]} rotation={[0.08, 0, 0]}>
              <boxGeometry args={[0.075, 0.24, 0.03]} />
              <meshStandardMaterial color={config.shirtAlt} roughness={0.8} />
            </mesh>
            {[1.06, 0.98, 0.9].map((y) => (
              <mesh key={y} position={[0, y, 0.205]}>
                <sphereGeometry args={[0.014, 6, 6]} />
                <meshStandardMaterial color="#f1e9d6" roughness={0.6} />
              </mesh>
            ))}
          </>
        ) : null}

        {/* 앞치마 — 여성 방문객 */}
        {config.apron ? (
          <mesh position={[0, 0.86, 0.16]} rotation={[0.06, 0, 0]}>
            <boxGeometry args={[0.29, 0.46, 0.03]} />
            <meshStandardMaterial color={config.apron} roughness={0.92} />
          </mesh>
        ) : null}

        {/* ── 어깨 ───────────────────────────────── */}
        {config.gender === "male" ? (
          <mesh position={[0, 1.22, 0]} castShadow>
            <sphereGeometry args={[0.235, 12, 10]} />
            <meshStandardMaterial color={config.shirtAlt} roughness={0.82} />
          </mesh>
        ) : (
          <mesh position={[0, 1.18, 0]} castShadow>
            <sphereGeometry args={[shoulder, 12, 10]} />
            <meshStandardMaterial color={config.shirt} roughness={0.82} />
          </mesh>
        )}

        {/* ── 팔 ─────────────────────────────────── */}
        <group ref={armLRef} position={[-(shoulder + 0.045), 1.16, 0]}>
          <mesh position={[0, -0.22, 0]} castShadow>
            <cylinderGeometry args={[0.052, 0.046, 0.44, 8]} />
            <meshStandardMaterial color={config.shirt} roughness={0.85} />
          </mesh>
          <mesh position={[0, -0.46, 0]}>
            <sphereGeometry args={[0.058, 8, 6]} />
            <meshStandardMaterial color={config.skin} roughness={0.7} />
          </mesh>
        </group>
        <group ref={armRRef} position={[shoulder + 0.045, 1.16, 0]}>
          <mesh position={[0, -0.22, 0]} castShadow>
            <cylinderGeometry args={[0.052, 0.046, 0.44, 8]} />
            <meshStandardMaterial color={config.shirt} roughness={0.85} />
          </mesh>
          <mesh position={[0, -0.46, 0]}>
            <sphereGeometry args={[0.058, 8, 6]} />
            <meshStandardMaterial color={config.skin} roughness={0.7} />
          </mesh>
        </group>

        {/* ── 목 + 머리 ───────────────────────────── */}
        <mesh position={[0, 1.33, 0]}>
          <cylinderGeometry args={[0.068, 0.078, 0.1, 8]} />
          <meshStandardMaterial color={config.skin} roughness={0.7} />
        </mesh>
        <mesh position={[0, 1.48, 0]} castShadow>
          <sphereGeometry args={[0.168, 18, 14]} />
          <meshStandardMaterial color={config.skin} roughness={0.65} />
        </mesh>
        {/* 눈 */}
        <mesh position={[-0.058, 1.5, 0.152]}>
          <sphereGeometry args={[0.021, 8, 8]} />
          <meshStandardMaterial color="#2b2622" />
        </mesh>
        <mesh position={[0.058, 1.5, 0.152]}>
          <sphereGeometry args={[0.021, 8, 8]} />
          <meshStandardMaterial color="#2b2622" />
        </mesh>

        {/* ── 헤어 ───────────────────────────────── */}
        {config.hairStyle === "short" ? (
          <>
            <Dome r={0.178} color={config.hair} position={[0, 1.5, 0]} scale={[1, 0.92, 1.02]} />
            <mesh position={[0, 1.445, -0.055]} scale={[0.17, 0.1, 0.16]}>
              <sphereGeometry args={[1, 14, 10]} />
              <meshStandardMaterial color={config.hair} roughness={0.85} />
            </mesh>
          </>
        ) : null}

        {config.hairStyle === "ponytail" ? (
          <>
            {/* 앞머리 + 긴 뒷머리 */}
            <Dome r={0.176} color={config.hair} position={[0, 1.49, -0.008]} scale={[1.02, 0.96, 1.03]} />
            <mesh position={[0, 1.36, -0.11]} scale={[0.165, 0.22, 0.135]}>
              <sphereGeometry args={[1, 16, 12]} />
              <meshStandardMaterial color={config.hair} roughness={0.82} />
            </mesh>
            {/* 묶은 포니테일 — 뒤로 흘러내리는 실루엣 */}
            <mesh position={[0, 1.16, -0.2]} rotation={[0.42, 0, 0]} scale={[0.082, 0.2, 0.09]}>
              <sphereGeometry args={[1, 14, 12]} />
              <meshStandardMaterial color={config.hair} roughness={0.82} />
            </mesh>
            <mesh position={[0, 1.35, -0.16]}>
              <torusGeometry args={[0.052, 0.016, 8, 14]} />
              <meshStandardMaterial color="#b8663f" roughness={0.7} />
            </mesh>
          </>
        ) : null}

        {config.hairStyle === "bob" ? (
          <>
            <Dome r={0.19} color={config.hair} position={[0, 1.49, -0.005]} scale={[1.05, 0.95, 1.06]} />
            <mesh position={[0, 1.4, -0.02]} scale={[0.19, 0.12, 0.19]}>
              <sphereGeometry args={[1, 14, 10]} />
              <meshStandardMaterial color={config.hair} roughness={0.85} />
            </mesh>
          </>
        ) : null}

        {/* ── 모자 ───────────────────────────────── */}
        {config.hat === "ball" ? (
          <>
            <Dome r={0.175} color={config.hatColor} position={[0, 1.5, -0.005]} scale={[1.1, 0.85, 1.1]} />
            <mesh position={[0, 1.585, 0.15]} rotation={[0.12, 0, 0]} castShadow>
              <boxGeometry args={[0.3, 0.028, 0.2]} />
              <meshStandardMaterial color={config.hatColor} roughness={0.85} />
            </mesh>
            <mesh position={[0, 1.63, 0.02]}>
              <sphereGeometry args={[0.02, 8, 6]} />
              <meshStandardMaterial color="#d8d2c4" roughness={0.6} />
            </mesh>
          </>
        ) : null}

        {config.hat === "straw" ? (
          <>
            <mesh position={[0, 1.6, 0]} castShadow>
              <cylinderGeometry args={[0.36, 0.36, 0.022, 22]} />
              <meshStandardMaterial color={config.hatColor} roughness={0.92} />
            </mesh>
            <Dome r={0.165} color={config.hatColor} position={[0, 1.6, 0]} scale={[1, 0.78, 1]} />
            <mesh position={[0, 1.625, 0]}>
              <torusGeometry args={[0.163, 0.022, 8, 20]} />
              <meshStandardMaterial color="#a8563a" roughness={0.75} />
            </mesh>
          </>
        ) : null}

        {config.hat === "bucket" ? (
          <>
            <mesh position={[0, 1.57, 0]} castShadow>
              <cylinderGeometry args={[0.235, 0.255, 0.02, 18]} />
              <meshStandardMaterial color={config.hatColor} roughness={0.9} />
            </mesh>
            <mesh position={[0, 1.64, 0]} castShadow>
              <cylinderGeometry args={[0.155, 0.19, 0.14, 16]} />
              <meshStandardMaterial color={config.hatColor} roughness={0.9} />
            </mesh>
          </>
        ) : null}

        {/* 어린이 — 등에 작은 가방 */}
        {isChild ? (
          <mesh position={[0, 1.02, -0.19]} castShadow>
            <boxGeometry args={[0.24, 0.24, 0.12]} />
            <meshStandardMaterial color="#4f7fa8" roughness={0.85} />
          </mesh>
        ) : null}
      </group>
    </group>
  );
}
