"use client";
import { useState, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Text } from "@react-three/drei";
import * as THREE from "three";

interface WorldHotspotProps {
  position: [number, number, number];
  label: string;
  info: string;
  onSelect: (label: string, info: string) => void;
}

export default function WorldHotspot({ position, label, info, onSelect }: WorldHotspotProps) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "auto";
    return () => { document.body.style.cursor = "auto"; };
  }, [hovered]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.8;
    }
  });

  return (
    <group position={position} onClick={() => onSelect(label, info)}>
      <mesh
        ref={meshRef}
        position={[0, 0.5, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <octahedronGeometry args={[0.3]} />
        <meshStandardMaterial
          color={hovered ? "#ffffff" : "#4a6243"}
          emissive={hovered ? "#b2cea8" : "#2d3e28"}
          emissiveIntensity={hovered ? 1.0 : 0.4}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
      <Billboard position={[0, 1.3, 0]}>
        <Text
          fontSize={0.28}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.04}
          outlineColor="#000000"
        >
          {label}
        </Text>
      </Billboard>
    </group>
  );
}
