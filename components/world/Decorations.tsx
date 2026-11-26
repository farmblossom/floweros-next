"use client";
import { useMemo } from "react";
import * as THREE from "three";

/* ────────────────────────────────────────────────────────────────
   퍼뜨기 · 쑤담이 머리장식 — 원본 3D 기준 이미지를 그대로 옮긴 입체 모델
   · 퍼뜨기: 짧은 초록 줄기 위에 잎맥이 살아 있는 하트형 진초록 고구마잎 1장
   · 쑤담이: 꽃잎 끝이 뾰족한 흰색 5잎 감자꽃 + 노란 별 모양 꽃술
──────────────────────────────────────────────────────────────── */

/** 잎/꽃잎 공통 — 가운데가 살짝 오목하게 젖혀진 판(plate) 지오메트리 */
function cupGeometry(
  shape: THREE.Shape,
  opts: { depth: number; bevel: number; cup: number; curveSegments?: number }
) {
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: opts.depth,
    bevelEnabled: true,
    bevelThickness: opts.bevel,
    bevelSize: opts.bevel * 0.85,
    bevelSegments: 4,
    curveSegments: opts.curveSegments ?? 26,
    steps: 1,
  });
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const clip = 1.02; // 도형 폭 기준
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const t = Math.min(1, Math.abs(x) / clip);
    // 가장자리로 갈수록 앞으로 말려 올라가 잎다운 곡면이 된다
    pos.setZ(i, pos.getZ(i) + Math.pow(t, 1.7) * opts.cup);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

/* ── 퍼뜨기 · 하트 고구마잎 ─────────────────────────────────── */

function useHeartLeafGeometry() {
  return useMemo(() => {
    const s = new THREE.Shape();
    // 아래 뾰족한 끝을 원점에 두고 위로 두 갈래 하트 잎
    s.moveTo(0, 0.04);
    s.bezierCurveTo(-0.3, 0.4, -1.0, 0.55, -1.0, 1.26);
    s.bezierCurveTo(-1.0, 1.8, -0.36, 1.96, 0, 1.46);
    s.bezierCurveTo(0.36, 1.96, 1.0, 1.8, 1.0, 1.26);
    s.bezierCurveTo(1.0, 0.55, 0.3, 0.4, 0, 0.04);
    return cupGeometry(s, { depth: 0.16, bevel: 0.12, cup: 0.3 });
  }, []);
}

function useVeinGeometry() {
  return useMemo(() => {
    // 잎맥 한 가닥(가느다란 원기둥) — 여러 방향으로 돌려 쓴다
    const g = new THREE.CylinderGeometry(0.022, 0.028, 1, 6, 1);
    g.translate(0, 0.5, 0);
    return g;
  }, []);
}

const VEINS: { x: number; y: number; rot: number; len: number }[] = [
  { x: -0.02, y: 0.42, rot: 1.08, len: 0.34 },
  { x: 0.02, y: 0.42, rot: -1.08, len: 0.34 },
  { x: -0.02, y: 0.72, rot: 1.0, len: 0.3 },
  { x: 0.02, y: 0.72, rot: -1.0, len: 0.3 },
  { x: -0.02, y: 1.0, rot: 0.82, len: 0.24 },
  { x: 0.02, y: 1.0, rot: -0.82, len: 0.24 },
];

/** 퍼뜨기 정수리 장식: 줄기 + 입체 하트 잎 + 잎맥 */
export function HeartLeafTopper({ scale = 1 }: { scale?: number }) {
  const geo = useHeartLeafGeometry();
  const vein = useVeinGeometry();

  const leafQuat = useMemo(() => {
    // 잎 면이 정면 살짝 위쪽을 향하고, 오른쪽으로 비스듬히 기울어진 자세
    const n = new THREE.Vector3(-0.22, 0.5, 0.84).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
    const roll = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -0.42);
    return q.multiply(roll);
  }, []);

  return (
    <group scale={[scale, scale, scale]}>
      {/* 짧은 초록 줄기 */}
      <mesh position={[0, 0.06, 0]} castShadow>
        <cylinderGeometry args={[0.032, 0.042, 0.15, 12]} />
        <meshStandardMaterial color="#4f9636" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.13, 0]} scale={[1.1, 0.5, 1.1]}>
        <sphereGeometry args={[0.045, 10, 8]} />
        <meshStandardMaterial color="#57a33c" roughness={0.55} />
      </mesh>

      <group position={[0, 0.145, 0]} quaternion={leafQuat}>
        {/* 잎 · 잎맥은 같은 배율로 묶어 크기가 어긋나지 않게 한다 */}
        <group scale={[0.315, 0.315, 0.315]}>
          <mesh geometry={geo} castShadow receiveShadow>
            <meshStandardMaterial color="#368b2c" roughness={0.56} metalness={0.02} />
          </mesh>
          {/* 가운데 잎맥 */}
          <mesh geometry={vein} position={[0, 0.06, 0.315]} rotation={[0.06, 0, 0]} scale={[0.9, 0.46, 0.9]}>
            <meshStandardMaterial color="#4aa338" roughness={0.46} />
          </mesh>
          {/* 좌우 잎맥 */}
          {VEINS.map((v, i) => (
            <mesh
              key={i}
              geometry={vein}
              position={[v.x, v.y, 0.312 + Math.abs(v.x) * 0.05]}
              rotation={[0.04, 0, v.rot]}
              scale={[0.55, v.len, 0.55]}
            >
              <meshStandardMaterial color="#4aa338" roughness={0.46} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}

/* ── 쑤담이 · 감자꽃 ───────────────────────────────────────── */

function usePetalGeometry() {
  return useMemo(() => {
    const s = new THREE.Shape();
    // 뾰족한 끝의 감자꽃 잎 — 밑동에서 좁아졌다가 끝에서 뾰족하게
    s.moveTo(0, 0.02);
    s.bezierCurveTo(0.2, 0.12, 0.36, 0.5, 0.2, 0.82);
    s.quadraticCurveTo(0.08, 0.98, 0, 1.04);
    s.quadraticCurveTo(-0.08, 0.98, -0.2, 0.82);
    s.bezierCurveTo(-0.36, 0.5, -0.2, 0.12, 0, 0.02);
    return cupGeometry(s, { depth: 0.035, bevel: 0.028, cup: 0.1, curveSegments: 22 });
  }, []);
}

function useStarGeometry() {
  return useMemo(() => {
    const s = new THREE.Shape();
    const outer = 1;
    const inner = 0.44;
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const r = i % 2 === 0 ? outer : inner;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) s.moveTo(x, y);
      else s.lineTo(x, y);
    }
    s.closePath();
    return new THREE.ExtrudeGeometry(s, {
      depth: 0.28,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.09,
      bevelSegments: 3,
      curveSegments: 8,
    });
  }, []);
}

/** 쑤담이 오른쪽 머리 위 장식: 흰 5잎 감자꽃 + 노란 별 꽃술 */
export function PotatoFlowerTopper({ scale = 1 }: { scale?: number }) {
  const petal = usePetalGeometry();
  const star = useStarGeometry();

  const flowerQuat = useMemo(() => {
    // 꽃이 머리 오른쪽 위에 누워 하늘 쪽으로 살짝 들린 자세
    const n = new THREE.Vector3(0.3, 0.66, 0.7).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
    const roll = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -0.35);
    return q.multiply(roll);
  }, []);

  return (
    <group scale={[scale, scale, scale]}>
      {/* 꽃이 머리에 붙는 짧은 초록 꽃자루 */}
      <mesh position={[0, 0.02, 0]} rotation={[0.2, 0, -0.24]} castShadow>
        <cylinderGeometry args={[0.026, 0.036, 0.15, 10]} />
        <meshStandardMaterial color="#54913c" roughness={0.65} />
      </mesh>
      <mesh position={[0.012, 0.075, 0]} rotation={[0.1, 0, -0.2]} scale={[1.35, 0.42, 1.35]}>
        <sphereGeometry args={[0.05, 12, 8]} />
        <meshStandardMaterial color="#5a9c42" roughness={0.6} />
      </mesh>

      <group position={[0.01, 0.085, 0]} quaternion={flowerQuat}>
        {[0, 1, 2, 3, 4].map((i) => {
          const a = -Math.PI / 2 + (i * Math.PI * 2) / 5;
          return (
            <group key={i} rotation={[0, 0, a]}>
              <mesh geometry={petal} scale={[0.255, 0.25, 0.24]} rotation={[0.2, 0, 0]} castShadow>
                <meshStandardMaterial color="#fdfdf7" roughness={0.42} metalness={0.01} />
              </mesh>
            </group>
          );
        })}

        {/* 노란 꽃술 — 별 모양 5각 + 둥근 심 */}
        <mesh position={[0, 0, 0.048]} rotation={[Math.PI / 2, 0, 0]} scale={[0.076, 0.076, 0.076]}>
          <cylinderGeometry args={[0.95, 1, 1, 14]} />
          <meshStandardMaterial color="#f6ce3c" roughness={0.38} />
        </mesh>
        <mesh geometry={star} position={[0, 0, 0.058]} scale={[0.062, 0.062, 0.06]} castShadow>
          <meshStandardMaterial color="#f0bb23" roughness={0.35} />
        </mesh>
        <mesh position={[0, 0, 0.095]} scale={[0.018, 0.018, 0.018]}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshStandardMaterial color="#ffe89a" roughness={0.3} emissive="#f7d769" emissiveIntensity={0.25} />
        </mesh>
      </group>
    </group>
  );
}

/* ── 포토존 표지판 ─────────────────────────────────────────── */

function makeSignTexture(title: string, sub: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // 나무판 바탕
  ctx.fillStyle = "#f5ecd8";
  ctx.fillRect(0, 0, 512, 256);
  ctx.strokeStyle = "#3f6b34";
  ctx.lineWidth = 14;
  ctx.strokeRect(9, 9, 494, 238);

  ctx.fillStyle = "#3f6b34";
  ctx.fillRect(24, 196, 464, 6);

  ctx.textAlign = "center";
  ctx.fillStyle = "#22301c";
  ctx.font = "bold 74px system-ui, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif";
  ctx.fillText(title, 256, 118);

  ctx.fillStyle = "#5c6b4f";
  ctx.font = "600 40px system-ui, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif";
  ctx.fillText(sub, 256, 172);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** 3D 포토존 표지판 — 클릭하면 그 자리 시점으로 이동 */
export function PhotoSpotSign({
  position,
  rotationY = 0,
  title = "포토존",
  sub = "여기서 사진 한 장",
  onSelect,
}: {
  position: [number, number, number];
  rotationY?: number;
  title?: string;
  sub?: string;
  onSelect?: () => void;
}) {
  const tex = useMemo(() => (typeof document === "undefined" ? null : makeSignTexture(title, sub)), [title, sub]);

  return (
    <group position={position} rotation={[0, rotationY, 0]} onClick={onSelect}>
      {/* 기둥 */}
      {[-0.42, 0.42].map((x) => (
        <mesh key={x} position={[x, 0.42, 0]} castShadow>
          <boxGeometry args={[0.07, 0.84, 0.07]} />
          <meshStandardMaterial color="#8a6640" roughness={0.92} />
        </mesh>
      ))}
      {/* 판 */}
      <mesh position={[0, 1.02, 0]} castShadow>
        <boxGeometry args={[1.14, 0.62, 0.06]} />
        {tex ? (
          <meshStandardMaterial map={tex} roughness={0.78} />
        ) : (
          <meshStandardMaterial color="#f5ecd8" roughness={0.8} />
        )}
      </mesh>
      {/* 판 테두리 */}
      <mesh position={[0, 1.02, -0.045]}>
        <boxGeometry args={[1.2, 0.68, 0.04]} />
        <meshStandardMaterial color="#6b4a2a" roughness={0.9} />
      </mesh>
    </group>
  );
}
