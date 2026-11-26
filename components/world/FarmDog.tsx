"use client";
import { useRef, useState } from "react";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { PlayerPosition } from "./terrain";

interface Tether {
  x: number;
  z: number;
  rx: number;
  rz: number;
}

interface FarmDogProps {
  name: string;
  role: string;
  coat: string;
  socks?: string;
  size?: number;
  /** 목줄 말뚝 위치와 가로·세로 이동 반경 */
  tether: Tether;
  speed?: number;
  /** 겁 많은 아이라 자주 멈추고 두리번거림 */
  timid?: boolean;
  lines: string[];
  playerRef?: React.RefObject<PlayerPosition>;
  accent?: string;
}

function buildTetherPath({ x, z, rx, rz }: Tether): [number, number, number][] {
  return [
    [x - rx, 0, z - rz],
    [x + rx, 0, z - rz],
    [x + rx, 0, z + rz],
    [x - rx, 0, z + rz],
    [x - rx, 0, z - rz],
  ];
}

/**
 * 덕산리 농장 지킴이 — 이오(황구, 용맹) · 이륙이(재구, 순박).
 * 개집 앞 말뚝에 목줄로 묶여 그 반경 안에서 가로·세로로 왔다 갔다 한다.
 */
export default function FarmDog({
  name,
  role,
  coat,
  socks = "#f6f2ea",
  size = 1,
  tether,
  speed = 1.4,
  timid = false,
  lines,
  playerRef,
  accent = "#7a5a2a",
}: FarmDogProps) {
  const [lineIdx, setLineIdx] = useState<number | null>(null);
  const [hint, setHint] = useState(false);

  const rootRef = useRef<THREE.Group>(null);
  const legRefs = useRef<(THREE.Group | null)[]>([]);
  const tailRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leashGeomRef = useRef<THREE.BufferGeometry>(null);

  const waypoints = useRef(buildTetherPath(tether)).current;
  const posRef = useRef(new THREE.Vector3(...waypoints[0]));
  const targetIdxRef = useRef(1 % waypoints.length);
  const stateRef = useRef<"walk" | "pause">("walk");
  const pauseRef = useRef(0);
  const pauseDurRef = useRef(1.4 + Math.random() * 1.6);
  const phaseRef = useRef(Math.random() * 6);
  const nearRef = useRef(false);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.06);
    const root = rootRef.current;
    if (!root) return;

    if (stateRef.current === "pause") {
      pauseRef.current += dt;
      if (pauseRef.current >= pauseDurRef.current) {
        pauseRef.current = 0;
        pauseDurRef.current = (timid ? 1.6 : 0.8) + Math.random() * 1.6;
        stateRef.current = "walk";
        targetIdxRef.current = (targetIdxRef.current + 1) % waypoints.length;
      }
    } else {
      const target = new THREE.Vector3(...waypoints[targetIdxRef.current]);
      const toTarget = target.clone().sub(posRef.current);
      const dist = toTarget.length();

      if (dist < 0.12) {
        stateRef.current = "pause";
        pauseRef.current = 0;
        pauseDurRef.current = (timid ? 1.8 : 0.9) + Math.random() * 2;
      } else {
        const dir = toTarget.normalize();
        const p = playerRef?.current;
        const nearPlayer = p ? Math.hypot(p.x - posRef.current.x, p.z - posRef.current.z) < 2.2 : false;
        const factor = nearPlayer && timid ? 0.2 : nearPlayer ? 0.7 : 1;
        const step = speed * factor * dt;
        posRef.current.addScaledVector(dir, Math.min(step, dist));

        const heading = Math.atan2(dir.x, dir.z);
        root.rotation.y = THREE.MathUtils.lerp(root.rotation.y, heading, Math.min(1, dt * 6));
      }
    }

    root.position.set(posRef.current.x, 0, posRef.current.z);
    const walking = stateRef.current === "walk";
    phaseRef.current += dt * (walking ? 9 * speed : 2.2);

    // 네 발 걸음
    legRefs.current.forEach((leg, i) => {
      if (!leg) return;
      const offset = i === 0 || i === 3 ? 0 : Math.PI;
      leg.rotation.x = walking ? Math.sin(phaseRef.current + offset) * 0.5 : 0;
    });

    // 꼬리 — 이오는 힘차게, 이륙이는 조심스럽게
    if (tailRef.current) {
      tailRef.current.rotation.z = Math.sin(state.clock.elapsedTime * (timid ? 3 : 7)) * (timid ? 0.18 : 0.4);
      tailRef.current.rotation.x = timid ? 0.9 : 0.4;
    }

    // 목줄 — 말뚝에서 목걸이까지
    const leash = leashGeomRef.current;
    if (leash) {
      const attr = leash.getAttribute("position") as THREE.BufferAttribute | undefined;
      if (attr) {
        const arr = attr.array as Float32Array;
        arr[0] = tether.x;
        arr[1] = 0.34;
        arr[2] = tether.z;
        arr[3] = posRef.current.x;
        arr[4] = 0.62;
        arr[5] = posRef.current.z - 0.2 * size;
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
      {/* 말뚝 */}
      <group position={[tether.x, 0, tether.z]}>
        <mesh position={[0, 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.07, 0.7, 8]} />
          <meshStandardMaterial color="#7a5a34" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.66, 0]}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial color="#4a3a22" roughness={0.85} />
        </mesh>
      </group>

      {/* 목줄 */}
      <line>
        <bufferGeometry ref={leashGeomRef}>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([tether.x, 0.34, tether.z, tether.x, 0.62, tether.z]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#3a2e22" linewidth={1} transparent opacity={0.9} />
      </line>

      <group ref={rootRef} position={waypoints[0]}>
        <group scale={[s, s, s]} onClick={handleClick}>
          {/* 그림자 */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <circleGeometry args={[0.62, 16]} />
            <meshBasicMaterial color="#141a10" transparent opacity={0.24} depthWrite={false} />
          </mesh>

          {/* 몸통 */}
          <mesh position={[0, 0.52, 0]} castShadow>
            <capsuleGeometry args={[0.24, 0.5, 6, 12]} />
            <meshStandardMaterial color={coat} roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.5, 0.26]} castShadow>
            <sphereGeometry args={[0.23, 10, 9]} />
            <meshStandardMaterial color={coat} roughness={0.85} />
          </mesh>

          {/* 목줄 목걸이 */}
          <mesh position={[0, 0.66, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.16, 0.02, 6, 14]} />
            <meshStandardMaterial color="#b03030" roughness={0.6} />
          </mesh>

          {/* 머리 */}
          <group ref={headRef} position={[0, 0.82, 0.36]}>
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

          {/* 네 발 */}
          {[
            [-0.15, 0.3, -0.22],
            [0.15, 0.3, -0.22],
            [-0.15, 0.3, 0.26],
            [0.15, 0.3, 0.26],
          ].map((p, i) => (
            <group
              key={i}
              ref={(el) => {
                legRefs.current[i] = el;
              }}
              position={[p[0], p[1], p[2]]}
            >
              <mesh position={[0, -0.14, 0]} castShadow>
                <capsuleGeometry args={[0.065, 0.22, 4, 8]} />
                <meshStandardMaterial color={coat} roughness={0.9} />
              </mesh>
              <mesh position={[0, -0.27, 0.01]}>
                <sphereGeometry args={[0.07, 8, 6]} />
                <meshStandardMaterial color={socks} roughness={0.85} />
              </mesh>
            </group>
          ))}

          {/* 꼬리 */}
          <group ref={tailRef} position={[0, 0.66, -0.42]}>
            <mesh position={[0, 0.15, -0.05]} rotation={[0.5, 0, 0]} castShadow>
              <capsuleGeometry args={[0.055, 0.3, 4, 8]} />
              <meshStandardMaterial color={coat} roughness={0.9} />
            </mesh>
          </group>
        </group>

        {/* 이름표 */}
        <Html position={[0, 1.35 * s, 0]} center distanceFactor={14} zIndexRange={[6, 16]}>
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

        {/* 말풍선 */}
        {lineIdx !== null ? (
          <Html position={[0, 1.9 * s, 0]} center distanceFactor={12} zIndexRange={[8, 20]}>
            <div
              style={{
                background: "rgba(255,255,255,0.97)",
                border: `2px solid ${accent}`,
                borderRadius: 14,
                padding: "7px 11px",
                maxWidth: 190,
                fontSize: 11,
                lineHeight: 1.5,
                color: "#1e1b18",
                textAlign: "center",
                whiteSpace: "pre-wrap",
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
          <Html position={[0, 1.05 * s, 0]} center distanceFactor={14} zIndexRange={[5, 14]}>
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
