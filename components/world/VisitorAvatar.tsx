"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** 방문자 아바타 종류 — 실루엣이 확실히 구분되는 세 가지 */
export type AvatarType = "female" | "male" | "child";

/** 방문자 자세 — 서기 · 앉기 · 구부리기 */
export type VisitorPose = "stand" | "sit" | "bend";

/**
 * 방문자가 입장 카드에서 고른 모습.
 * 닉네임 · 타입 · 옷 색 · 밀짚모자만 저장하고, 3D 메쉬는 여기서 만들어 낸다.
 */
export interface VisitorLook {
  name: string;
  type: AvatarType;
  /** SHIRT_COLORS 의 id */
  shirt: string;
  strawHat: boolean;
}

export const DEFAULT_LOOK: VisitorLook = {
  name: "",
  type: "female",
  shirt: "coral",
  strawHat: true,
};

export const AVATAR_TYPES: { id: AvatarType; label: string; emoji: string; hint: string }[] = [
  { id: "female", label: "여성", emoji: "👩", hint: "긴 머리 · 치마 · 앞치마" },
  { id: "male", label: "남성", emoji: "👨", hint: "짧은 머리 · 작업바지" },
  { id: "child", label: "어린이", emoji: "🧒", hint: "단발 · 반바지 · 작은 키" },
];

/** 상의 색 팔레트 5종 — 밭에서 잘 보이는 톤으로 */
export const SHIRT_COLORS: { id: string; label: string; color: string }[] = [
  { id: "coral", label: "코랄", color: "#c96a58" },
  { id: "sky", label: "하늘", color: "#5b8fc9" },
  { id: "olive", label: "올리브", color: "#6f8f43" },
  { id: "lavender", label: "라벤더", color: "#9a86c4" },
  { id: "cream", label: "크림", color: "#e3d6bb" },
];

export const POSES: { id: VisitorPose; label: string; emoji: string }[] = [
  { id: "stand", label: "서기", emoji: "🧍" },
  { id: "sit", label: "앉기", emoji: "🪑" },
  { id: "bend", label: "구부리기", emoji: "🌱" },
];

/** 이름표를 머리 위 어디에 띄울지 (월드 좌표) — 앉거나 숙이면 그만큼 내린다 */
export function avatarLabelY(look: VisitorLook, pose: VisitorPose): number {
  const base = AVATAR_LABEL_HEIGHT[safeType(look.type)];
  if (pose === "sit") return base - 0.5;
  if (pose === "bend") return base - 0.34;
  return base;
}

export const AVATAR_LABEL_HEIGHT: Record<AvatarType, number> = {
  female: 2.02,
  male: 2.02,
  child: 1.72,
};
const AVATAR_TYPE_IDS: AvatarType[] = ["female", "male", "child"];
const POSE_IDS: VisitorPose[] = ["stand", "sit", "bend"];

export function safeType(v: unknown): AvatarType {
  return AVATAR_TYPE_IDS.includes(v as AvatarType) ? (v as AvatarType) : "female";
}

export function safeShirt(v: unknown): string {
  return SHIRT_COLORS.some((c) => c.id === v) ? (v as string) : SHIRT_COLORS[0].id;
}

export function safePose(v: unknown): VisitorPose {
  return POSE_IDS.includes(v as VisitorPose) ? (v as VisitorPose) : "stand";
}

/** 실시간 접속 정보로 넘어온 값(문자열·불리언)을 안전한 모습으로 */
export function safeLook(raw: unknown): VisitorLook {
  const r = (raw ?? {}) as Partial<VisitorLook>;
  return {
    name: typeof r.name === "string" ? r.name.slice(0, 12) : "",
    type: safeType(r.type),
    shirt: safeShirt(r.shirt),
    strawHat: r.strawHat !== false,
  };
}

interface AvatarConfig {
  type: AvatarType;
  gender: "male" | "female" | "child";
  hairStyle: "short" | "ponytail" | "bob";
  lower: "pants" | "skirt" | "shorts";
  hat: "straw" | "none";
  shirt: string;
  shirtAlt: string;
  pants: string;
  hatColor: string;
  hair: string;
  skin: string;
  apron?: string;
  scale: number;
}

function shade(hex: string, amount: number) {
  const c = new THREE.Color(hex);
  c.offsetHSL(0, 0, amount);
  return `#${c.getHexString()}`;
}

/** 고른 모습 → 3D 메쉬 설정. 타입(여성·남성·어린이)이 머리·하의 실루엣을 정한다. */
export function avatarConfig(look: VisitorLook): AvatarConfig {
  const color = SHIRT_COLORS.find((c) => c.id === look.shirt) ?? SHIRT_COLORS[0];
  const shirt = color.color;
  const shirtAlt = shade(shirt, -0.09);

  if (look.type === "male") {
    return {
      type: "male",
      gender: "male",
      hairStyle: "short",
      lower: "pants",
      hat: look.strawHat ? "straw" : "none",
      shirt,
      shirtAlt,
      pants: "#39485a",
      hatColor: "#d9b878",
      hair: "#2a211c",
      skin: "#f0c69c",
      scale: 1,
    };
  }
  if (look.type === "child") {
    return {
      type: "child",
      gender: "child",
      hairStyle: "bob",
      lower: "shorts",
      hat: look.strawHat ? "straw" : "none",
      shirt,
      shirtAlt,
      pants: "#4a6b8a",
      hatColor: "#d9b878",
      hair: "#241b16",
      skin: "#f7d3b0",
      scale: 0.72,
    };
  }
  return {
    type: "female",
    gender: "female",
    hairStyle: "ponytail",
    lower: "skirt",
    hat: look.strawHat ? "straw" : "none",
    shirt,
    shirtAlt,
    pants: "#e7dcc6",
    hatColor: "#d9b878",
    hair: "#3b2a22",
    skin: "#f4cfae",
    apron: "#efe7d6",
    scale: 0.97,
  };
}

/** 관절 목표값 — 자세마다 무릎·허리·몸통이 어디까지 굽는지 */
interface PoseTarget {
  thigh: number;
  knee: number;
  /** 발밑 기준 몸통을 얼마나 내릴지 (음수 = 아래로) */
  drop: number;
  torso: number;
  arm: number;
}

function poseTarget(pose: VisitorPose, cfg: AvatarConfig): PoseTarget {
  const legTop = cfg.gender === "female" ? 0.66 : cfg.gender === "child" ? 0.5 : 0.58;
  const legLen = cfg.lower === "pants" ? 0.56 : 0.4;
  const half = legLen / 2;

  if (pose === "sit") {
    // 무릎을 굽혀 앉기 — 허벅지는 앞으로, 정강이는 아래로
    if (cfg.lower === "pants") {
      const thigh = -1.4;
      const knee = 1.4;
      return { thigh, knee, drop: -(legTop - half - 0.05), torso: 0.04, arm: -0.62 };
    }
    // 치마·반바지는 긴 치맛자락이 땅에 깔리듯 앉고, 발은 치맛단 아래로 내린다
    const thigh = -1.25;
    const knee = 1.5;
    return { thigh, knee, drop: -(legTop * 0.6 - half * 0.2), torso: 0.04, arm: -0.5 };
  }
  if (pose === "bend") {
    // 밭작물을 살피듯 살짝 쪼그려 상체를 숙이기
    const thigh = -0.6;
    const knee = 1.2;
    const hip = half * Math.cos(0.6) * 2 + 0.04;
    return { thigh, knee, drop: -(legTop - hip), torso: 0.45, arm: -0.3 };
  }
  return { thigh: 0, knee: 0, drop: 0, torso: 0, arm: 0 };
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

interface VisitorAvatarProps {
  look: VisitorLook;
  /** 서기 · 앉기 · 구부리기 — 걷는 동안에는 잠시 서기로 돌아간다 */
  pose?: VisitorPose;
  /** 컨트롤러가 공유하는 이동 상태 (걷기 애니메이션 트리거) */
  movingState: React.RefObject<{ moving: boolean }>;
}

/**
 * 방문자(플레이어) — 사람 형태 3D 아바타.
 * 고른 타입·옷 색·밀짚모자가 그대로 메쉬에 반영되고,
 * 걸을 때는 팔다리가 흔들리며, 앉기·구부리기 자세로 부드럽게 전환된다.
 */
export default function VisitorAvatar({ look, pose = "stand", movingState }: VisitorAvatarProps) {
  const config = useMemo(() => avatarConfig(safeLook(look)), [look]);

  const bodyRef = useRef<THREE.Group>(null);
  const upperRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const thighLRef = useRef<THREE.Group>(null);
  const thighRRef = useRef<THREE.Group>(null);
  const kneeLRef = useRef<THREE.Group>(null);
  const kneeRRef = useRef<THREE.Group>(null);
  const footLRef = useRef<THREE.Group>(null);
  const footRRef = useRef<THREE.Group>(null);
  const armLRef = useRef<THREE.Group>(null);
  const armRRef = useRef<THREE.Group>(null);
  const skirtRef = useRef<THREE.Group>(null);
  const phaseRef = useRef(0);
  const poseRef = useRef<PoseTarget>({ thigh: 0, knee: 0, drop: 0, torso: 0, arm: 0 });

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const moving = movingState.current?.moving ?? false;
    const speed = moving ? 9 : 1.6;
    phaseRef.current += dt * speed;
    const swing = moving ? 0.6 : 0.04;
    const sin = Math.sin(phaseRef.current);

    // 자세 목표값으로 부드럽게 이동 — 걷는 중에는 서기
    const target = poseTarget(moving ? "stand" : pose, config);
    const cur = poseRef.current;
    const k = 1 - Math.exp(-9 * dt);
    cur.thigh += (target.thigh - cur.thigh) * k;
    cur.knee += (target.knee - cur.knee) * k;
    cur.drop += (target.drop - cur.drop) * k;
    cur.torso += (target.torso - cur.torso) * k;
    cur.arm += (target.arm - cur.arm) * k;

    if (thighLRef.current) thighLRef.current.rotation.x = cur.thigh + sin * swing;
    if (thighRRef.current) thighRRef.current.rotation.x = cur.thigh - sin * swing;
    if (kneeLRef.current) kneeLRef.current.rotation.x = cur.knee;
    if (kneeRRef.current) kneeRRef.current.rotation.x = cur.knee;
    // 발은 바닥을 향해 눕는다 (무릎을 굽혀도 발등이 땅을 향하지 않게)
    const footAngle = -(cur.thigh + cur.knee) * 0.9;
    if (footLRef.current) footLRef.current.rotation.x = footAngle;
    if (footRRef.current) footRRef.current.rotation.x = footAngle;
    if (upperRef.current) upperRef.current.rotation.x = cur.torso;
    // 상체를 숙여도 얼굴은 작물 쪽을 바라본다 (목에서 반대 회전)
    if (headRef.current) headRef.current.rotation.x = -cur.torso * 0.62;
    if (armLRef.current) armLRef.current.rotation.x = -sin * swing * 0.8 + cur.arm;
    if (armRRef.current) armRRef.current.rotation.x = sin * swing * 0.8 + cur.arm;
    if (skirtRef.current) {
      skirtRef.current.rotation.z = Math.sin(phaseRef.current * 0.9) * (moving ? 0.07 : 0.02);
      skirtRef.current.scale.x = 1 + Math.sin(phaseRef.current * 1.8) * (moving ? 0.04 : 0.012);
    }
    if (bodyRef.current) {
      bodyRef.current.position.y = (moving ? Math.abs(sin) * 0.045 : 0) + cur.drop;
    }
  });

  const s = config.scale;
  const isFemale = config.gender === "female";
  const isChild = config.gender === "child";
  const shoulder = isFemale ? 0.2 : isChild ? 0.17 : 0.245;
  const waist = isFemale ? 0.19 : isChild ? 0.18 : 0.215;
  const hip = isFemale ? 0.225 : isChild ? 0.19 : 0.21;
  const legTop = isFemale ? 0.66 : isChild ? 0.5 : 0.58;
  const legLen = config.lower === "pants" ? 0.56 : 0.4;
  const half = legLen / 2;
  const bare = config.lower !== "pants";

  const leg = (side: -1 | 1) => {
    const thighRef = side < 0 ? thighLRef : thighRRef;
    const kneeRef = side < 0 ? kneeLRef : kneeRRef;
    const footRef = side < 0 ? footLRef : footRRef;
    return (
      <group key={side} ref={thighRef} position={[side * (isFemale ? 0.085 : 0.1), legTop, 0]}>
        {/* 허벅지 */}
        <mesh position={[0, -half / 2, 0]} castShadow>
          <cylinderGeometry args={[bare ? 0.055 : 0.082, bare ? 0.052 : 0.078, half, 8]} />
          <meshStandardMaterial color={bare ? config.skin : config.pants} roughness={bare ? 0.7 : 0.88} />
        </mesh>
        {/* 정강이 (무릎 관절) */}
        <group ref={kneeRef} position={[0, -half, 0]}>
          <mesh position={[0, -half / 2, 0]} castShadow>
            <cylinderGeometry args={[bare ? 0.05 : 0.075, bare ? 0.045 : 0.07, half, 8]} />
            <meshStandardMaterial color={bare ? config.skin : config.pants} roughness={bare ? 0.7 : 0.88} />
          </mesh>
          <group ref={footRef} position={[0, -half, 0]}>
            <mesh position={[0, -0.02, bare ? 0.03 : 0.035]} castShadow>
              <boxGeometry args={[bare ? 0.12 : 0.16, bare ? 0.08 : 0.1, bare ? 0.22 : 0.27]} />
              <meshStandardMaterial
                color={bare ? (isChild ? "#3f4a55" : "#b8846a") : "#2c2a28"}
                roughness={0.88}
              />
            </mesh>
          </group>
        </group>
      </group>
    );
  };

  return (
    <group scale={[s, s, s]}>
      <group ref={bodyRef}>
        {/* ── 다리 ───────────────────────────────── */}
        {leg(-1)}
        {leg(1)}

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

        {/* ── 허리에서 굽는 상체 (몸통·팔·머리) ───── */}
        <group ref={upperRef} position={[0, isChild ? 0.8 : 0.92, 0]}>
          <group position={[0, isChild ? -0.8 : -0.92, 0]}>
            {/* ── 몸통 ───────────────────────────── */}
            <mesh position={[0, isChild ? 0.95 : 1.02, 0]} castShadow>
              {config.lower === "pants" ? (
                <cylinderGeometry args={[hip * 0.96, waist * 1.06, isChild ? 0.34 : 0.42, 14]} />
              ) : (
                <cylinderGeometry args={[shoulder * 0.9, waist, isChild ? 0.3 : 0.36, 14]} />
              )}
              <meshStandardMaterial color={config.shirt} roughness={0.82} />
            </mesh>

            {/* 셔츠 깃·단추 라인 — 작업복 느낌 */}
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

            {/* ── 어깨 ───────────────────────────── */}
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

            {/* ── 팔 ─────────────────────────────── */}
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

            {/* ── 목 + 머리 (숙일 때 얼굴이 들리도록 목에서 회전) ── */}
            <group ref={headRef} position={[0, 1.33, 0]}>
              <group position={[0, -1.33, 0]}>
              {/* ── 목 + 머리 ───────────────────────── */}
              <mesh position={[0, 1.33, 0]}>
                <cylinderGeometry args={[0.068, 0.078, 0.1, 8]} />
                <meshStandardMaterial color={config.skin} roughness={0.7} />
              </mesh>
              <mesh position={[0, 1.48, 0]} castShadow>
                <sphereGeometry args={[0.168, 18, 14]} />
                <meshStandardMaterial color={config.skin} roughness={0.65} />
              </mesh>
              {/* 눈 */}
              <mesh position={[-0.058, 1.482, 0.152]}>
                <sphereGeometry args={[0.021, 8, 8]} />
                <meshStandardMaterial color="#2b2622" />
              </mesh>
              <mesh position={[0.058, 1.482, 0.152]}>
                <sphereGeometry args={[0.021, 8, 8]} />
                <meshStandardMaterial color="#2b2622" />
              </mesh>

              {/* ── 헤어 ───────────────────────────── */}
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

              {/* ── 밀짚모자 (ON/OFF) ───────────────── */}
              {config.hat === "straw" ? (
                <>
                  <mesh position={[0, 1.605, 0]} castShadow>
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
              </group>
            </group>

            {/* 어린이 — 등에 작은 가방 */}
            {isChild ? (
              <mesh position={[0, 1.02, -0.19]} castShadow>
                <boxGeometry args={[0.24, 0.24, 0.12]} />
                <meshStandardMaterial color="#4f7fa8" roughness={0.85} />
              </mesh>
            ) : null}
          </group>
        </group>
      </group>
    </group>
  );
}
