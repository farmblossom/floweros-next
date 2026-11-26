"use client";
import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { PlayerPosition } from "./terrain";

interface WorldHotspotProps {
  position: [number, number, number];
  label: string;
  info: string;
  onSelect: (label: string, info: string) => void;
  /** 3D 월드에서 걸어 다닐 때 가까워지면 강조 표시 */
  playerRef?: React.RefObject<PlayerPosition>;
  /** 추후 실제 구역 사진을 연결할 자리 */
  imageUrl?: string;
}

export default function WorldHotspot({ position, label, info, onSelect, playerRef }: WorldHotspotProps) {
  const [hovered, setHovered] = useState(false);
  const [near, setNear] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "auto";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [hovered]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.8;
      meshRef.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 1.8 + position[0]) * 0.06;
    }
    if (glowRef.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 2.2) * 0.12;
      glowRef.current.scale.setScalar(hovered || near ? s : 0.001);
    }
    if (playerRef?.current && groupRef.current) {
      const p = playerRef.current;
      const dist = Math.hypot(p.x - position[0], p.z - position[2]);
      const isNear = dist < 3.6;
      if (isNear !== near) setNear(isNear);
    }
  });

  const active = hovered || near;

  return (
    <group ref={groupRef} position={position} onClick={() => onSelect(label, info)}>
      <mesh
        ref={glowRef}
        position={[0, 0.05, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={0.001}
      >
        <ringGeometry args={[0.42, 0.55, 32]} />
        <meshBasicMaterial color="#cfe9bb" transparent opacity={0.22} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh
        ref={meshRef}
        position={[0, 0.5, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <octahedronGeometry args={[0.3]} />
        <meshStandardMaterial
          color={active ? "#ffffff" : "#4a6243"}
          emissive={active ? "#b2cea8" : "#2d3e28"}
          emissiveIntensity={active ? 1.15 : 0.4}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
      <Html position={[0, 1.25, 0]} center distanceFactor={16} zIndexRange={[5, 14]}>
        <div
          style={{
            background: active ? "rgba(255,255,255,0.95)" : "rgba(30,40,28,0.7)",
            color: active ? "#1e2b1a" : "#f4f7ee",
            borderRadius: 999,
            padding: "3px 10px",
            fontSize: 11,
            fontWeight: 600,
            whiteSpace: "nowrap",
            pointerEvents: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            border: active ? "1.5px solid #7fae6a" : "1px solid rgba(255,255,255,0.18)",
            fontFamily: "system-ui, -apple-system, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
          }}
        >
          {label}
        </div>
      </Html>
    </group>
  );
}
