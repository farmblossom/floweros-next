"use client";
import { useMemo, useRef, useState } from "react";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { PlayerPosition } from "./terrain";

/** 기둥 2개 사이 와이어(트롤리 라인) — 개는 목줄이 연결된 trolley 를 따라 왕복한다 */
export interface TrolleyLine {
  from: [number, number];
  to: [number, number];
  /** 와이어 높이 */
  height?: number;
}

interface FarmDogProps {
  name: string;
  role: string;
  coat: string;
  socks?: string;
  size?: number;
  line: TrolleyLine;
  speed?: number;
  /** 겁 많은 아이라 자주 멈추고 두리번거림 */
  timid?: boolean;
  lines: string[];
  playerRef?: React.RefObject<PlayerPosition>;
  accent?: string;
}

/**
 * 덕산리 농장 지킴이 — 이오 · 이륙이.
 * 양끝 기둥 사이에 걸린 와이어에 trolley 가 달리고, 그 trolley 에서 내려온 목줄이
 * 목걸이에 연결되어 와이어를 따라 길게 왕복한다.
 */
export default function FarmDog({
  name,
  role,
  coat,
  socks = "#f6f2ea",
  size = 1,
  line,
  speed = 1.3,
  timid = false,
  lines,
  playerRef,
  accent = "#7a5a2a",
}: FarmDogProps) {
  const [lineIdx, setLineIdx] = useState<number | null>(null);
  const [hint, setHint] = useState(false);

  const rootRef = useRef<THREE.Group>(null);
  const trolleyRef = useRef<THREE.Group>(null);
  const legRefs = useRef<(THREE.Group | null)[]>([]);
  const tailRef = useRef<THREE.Group>(null);
  const leashGeomRef = useRef<THREE.BufferGeometry>(null);

  const wireHeight = line.height ?? 2.5;
  const A = useMemo(() => new THREE.Vector3(line.from[0], 0, line.from[1]), [line]);
  const B = useMemo(() => new THREE.Vector3(line.to[0], 0, line.to[1]), [line]);
  const length = useMemo(() => A.distanceTo(B), [A, B]);
  const dirV = useMemo(() => B.clone().sub(A).normalize(), [A, B]);

  const tRef = useRef(0);
  const dirRef = useRef(1);
  const stateRef = useRef<"walk" | "pause">("walk");
  const pauseRef = useRef(0);
  const pauseDurRef = useRef(1.6 + Math.random() * 1.6);
  const phaseRef = useRef(Math.random() * 6);
  const nearRef = useRef(false);
  const posRef = useRef(A.clone());

  // 와이어 기둥 방향(실린더 축 정렬)
  const wireTransform = useMemo(() => {
    const mid = A.clone().add(B).multiplyScalar(0.5);
    mid.y = wireHeight;
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dirV);
    return { mid, q };
  }, [A, B, dirV, wireHeight]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.06);
    const root = rootRef.current;
    if (!root) return;

    if (stateRef.current === "pause") {
      pauseRef.current += dt;
      if (pauseRef.current >= pauseDurRef.current) {
        pauseRef.current = 0;
        pauseDurRef.current = (timid ? 1.8 : 1.0) + Math.random() * 1.8;
        stateRef.current = "walk";
      }
    } else {
      const p = playerRef?.current;
      const nearPlayer = p ? Math.hypot(p.x - posRef.current.x, p.z - posRef.current.z) < 2.4 : false;
      const factor = nearPlayer && timid ? 0.15 : nearPlayer ? 0.6 : 1;
      tRef.current += (dirRef.current * speed * factor * dt) / Math.max(length, 0.001);

      if (tRef.current >= 1) {
        tRef.current = 1;
        dirRef.current = -1;
        stateRef.current = "pause";
        pauseRef.current = 0;
      } else if (tRef.current <= 0) {
        tRef.current = 0;
        dirRef.current = 1;
        stateRef.current = "pause";
        pauseRef.current = 0;
      }
    }

    posRef.current.copy(A).lerp(B, tRef.current);
    root.position.set(posRef.current.x, 0, posRef.current.z);

    // 진행 방향으로 몸 돌리기
    const heading = Math.atan2(dirV.x * dirRef.current, dirV.z * dirRef.current);
    root.rotation.y = THREE.MathUtils.lerp(root.rotation.y, heading, Math.min(1, dt * 6));

    const walking = stateRef.current === "walk";
    phaseRef.current += dt * (walking ? 9 * speed : 2.2);
    legRefs.current.forEach((leg, i) => {
      if (!leg) return;
      const offset = i === 0 || i === 3 ? 0 : Math.PI;
      leg.rotation.x = walking ? Math.sin(phaseRef.current + offset) * 0.5 : 0;
    });

    if (tailRef.current) {
      tailRef.current.rotation.z = Math.sin(state.clock.elapsedTime * (timid ? 3 : 7)) * (timid ? 0.18 : 0.4);
      tailRef.current.rotation.x = timid ? 0.9 : 0.4;
    }

    // trolley 위치 = 와이어 위, 개 머리 바로 위
    if (trolleyRef.current) {
      trolleyRef.current.position.set(posRef.current.x, wireHeight, posRef.current.z);
      trolleyRef.current.rotation.y = Math.atan2(dirV.x, dirV.z);
    }

    // 목줄 — trolley 에서 목걸이까지
    const leash = leashGeomRef.current;
    if (leash) {
      const attr = leash.getAttribute("position") as THREE.BufferAttribute | undefined;
      if (attr) {
        const arr = attr.array as Float32Array;
        arr[0] = posRef.current.x;
        arr[1] = wireHeight - 0.12;
        arr[2] = posRef.current.z;
        arr[3] = posRef.current.x;
        arr[4] = 0.55 * size;
        arr[5] = posRef.current.z - 0.22 * size;
        attr.needsUpdate = true;
        leash.computeBoundingSphere();
      }
    }

    // 근접 반응
    const p = playerRef?.current;
    if (p) {
      const dist = Math.hypot(p.x - posRef.current.x, p.z - posRef.current.z);
      const near = dist < 3.6;
      if (near !== nearRef.current) {
        nearRef.current = near;
        if (near && lineIdx === null) setLineIdx(0);
        if (!near) setLineIdx(null);
        setHint(near && lineIdx === null);
      }
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setLineIdx((prev) => {
      if (prev === null) return 0;
      const next = prev + 1;
      return next >= lines.length ? null : next;
    });
    setHint(false);
  };

  const s = size;

  return (
    <group>
      {/* 양끝 기둥 */}
      {[A, B].map((point, i) => (
        <group key={`post-${i}`} position={[point.x, 0, point.z]}>
          <mesh position={[0, wireHeight / 2, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.1, wireHeight + 0.2, 10]} />
            <meshStandardMaterial color="#c8a86a" roughness={0.85} />
          </mesh>
          <mesh position={[0, wireHeight + 0.14, 0]}>
            <sphereGeometry args={[0.1, 10, 8]} />
            <meshStandardMaterial color="#8a6a34" roughness={0.8} />
          </mesh>
          {/* 버팀대 */}
          <mesh position={[0.18, wireHeight * 0.42, 0]} rotation={[0, 0, -0.5]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 0.7, 6]} />
            <meshStandardMaterial color="#a8865a" roughness={0.9} />
          </mesh>
        </group>
      ))}

      {/* 공중 와이어 */}
      <mesh position={wireTransform.mid} quaternion={wireTransform.q} castShadow>
        <cylinderGeometry args={[0.018, 0.018, Math.max(length, 0.1), 6]} />
        <meshStandardMaterial color="#5a5148" metalness={0.45} roughness={0.55} />
      </mesh>

      {/* trolley + 목줄 */}
      <group ref={trolleyRef} position={[A.x, wireHeight, A.z]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.055, 0.055, 0.1, 10]} />
          <meshStandardMaterial color="#8f8f96" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.06, 0]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color="#6b6b72" metalness={0.5} roughness={0.5} />
        </mesh>
      </group>
      <line>
        <bufferGeometry ref={leashGeomRef}>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([A.x, wireHeight - 0.12, A.z, A.x, 0.66 * s, A.z]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#3a2e22" transparent opacity={0.95} />
      </line>

      <group ref={rootRef} position={[A.x, 0, A.z]}>
        <group scale={[s, s, s]} onClick={handleClick}>
          {/* 그림자 */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <circleGeometry args={[0.62, 16]} />
            <meshBasicMaterial color="#141a10" transparent opacity={0.24} depthWrite={false} />
          </mesh>

          <mesh position={[0, 0.42, 0]} castShadow>
            <capsuleGeometry args={[0.21, 0.38, 6, 12]} />
            <meshStandardMaterial color={coat} roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.42, 0.22]} castShadow>
            <sphereGeometry args={[0.2, 10, 9]} />
            <meshStandardMaterial color={coat} roughness={0.85} />
          </mesh>

          {/* 목걸이 */}
          <mesh position={[0, 0.55, 0.26]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.15, 0.018, 6, 14]} />
            <meshStandardMaterial color="#b03030" roughness={0.6} />
          </mesh>

          {/* 머리 */}
          <group position={[0, 0.66, 0.3]}>
            <mesh castShadow>
              <sphereGeometry args={[0.22, 14, 12]} />
              <meshStandardMaterial color={coat} roughness={0.85} />
            </mesh>
            <mesh position={[0, -0.06, 0.2]} castShadow>
              <capsuleGeometry args={[0.09, 0.12, 4, 10]} />
              <meshStandardMaterial color="#e8d8c4" roughness={0.8} />
            </mesh>
            <mesh position={[0, -0.04, 0.31]}>
              <sphereGeometry args={[0.045, 8, 8]} />
              <meshStandardMaterial color="#2a211c" roughness={0.5} />
            </mesh>
            <mesh position={[-0.09, 0.06, 0.19]}>
              <sphereGeometry args={[0.032, 8, 8]} />
              <meshStandardMaterial color="#201a16" />
            </mesh>
            <mesh position={[0.09, 0.06, 0.19]}>
              <sphereGeometry args={[0.032, 8, 8]} />
              <meshStandardMaterial color="#201a16" />
            </mesh>
            <mesh position={[-0.17, 0.14, 0]} rotation={[0, 0, 0.5]} castShadow>
              <coneGeometry args={[0.085, 0.2, 6]} />
              <meshStandardMaterial color={coat} roughness={0.9} />
            </mesh>
            <mesh position={[0.17, 0.14, 0]} rotation={[0, 0, -0.5]} castShadow>
              <coneGeometry args={[0.085, 0.2, 6]} />
              <meshStandardMaterial color={coat} roughness={0.9} />
            </mesh>
          </group>

          {[
            [-0.13, 0.22, -0.18],
            [0.13, 0.22, -0.18],
            [-0.13, 0.22, 0.2],
            [0.13, 0.22, 0.2],
          ].map((p, i) => (
            <group
              key={i}
              ref={(el) => {
                legRefs.current[i] = el;
              }}
              position={[p[0], p[1], p[2]]}
            >
              <mesh position={[0, -0.1, 0]} castShadow>
                <capsuleGeometry args={[0.055, 0.16, 4, 8]} />
                <meshStandardMaterial color={coat} roughness={0.9} />
              </mesh>
              <mesh position={[0, -0.19, 0.01]}>
                <sphereGeometry args={[0.062, 8, 6]} />
                <meshStandardMaterial color={socks} roughness={0.85} />
              </mesh>
            </group>
          ))}

          <group ref={tailRef} position={[0, 0.48, -0.34]}>
            <mesh position={[0, 0.15, -0.05]} rotation={[0.5, 0, 0]} castShadow>
              <capsuleGeometry args={[0.055, 0.3, 4, 8]} />
              <meshStandardMaterial color={coat} roughness={0.9} />
            </mesh>
          </group>
        </group>

        <Html position={[0, 1.35 * s, 0]} center distanceFactor={20} zIndexRange={[6, 16]}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
              pointerEvents: "none",
              whiteSpace: "nowrap",
              fontFamily: "system-ui, -apple-system, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
            }}
          >
            <span
              style={{
                background: "rgba(255,255,255,0.94)",
                border: `1.5px solid ${accent}`,
                borderRadius: 999,
                padding: "1px 8px",
                fontSize: 11,
                fontWeight: 700,
                color: "#2b241c",
                boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
              }}
            >
              🐕 {name}
            </span>
            <span style={{ fontSize: 8.5, color: "#fff", background: "rgba(40,32,20,0.6)", borderRadius: 999, padding: "0 6px" }}>
              {role}
            </span>
          </div>
        </Html>

        {lineIdx !== null ? (
          <Html position={[0, 1.9 * s, 0]} center distanceFactor={17} zIndexRange={[8, 20]}>
            <div
              style={{
                background: "rgba(255,255,255,0.97)",
                border: `2px solid ${accent}`,
                borderRadius: 14,
                padding: "7px 11px",
                width: 190,
                boxSizing: "border-box",
                fontSize: 11,
                lineHeight: 1.5,
                color: "#1e1b18",
                textAlign: "center",
                whiteSpace: "pre-wrap",
                wordBreak: "keep-all",
                boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
                pointerEvents: "none",
                fontFamily: "system-ui, -apple-system, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
              }}
            >
              {lines[lineIdx]}
              <div style={{ fontSize: 8.5, color: "#8a8a8a", marginTop: 3 }}>
                {lineIdx + 1}/{lines.length} · 클릭해서 다음
              </div>
            </div>
          </Html>
        ) : null}

        {hint && lineIdx === null ? (
          <Html position={[0, 1.05 * s, 0]} center distanceFactor={22} zIndexRange={[5, 14]}>
            <div
              style={{
                background: "rgba(255,255,255,0.9)",
                color: "#5a4525",
                borderRadius: 999,
                padding: "2px 8px",
                fontSize: 9.5,
                whiteSpace: "nowrap",
                pointerEvents: "none",
              }}
            >
              멍! 클릭해봐요
            </div>
          </Html>
        ) : null}
      </group>
    </group>
  );
}
