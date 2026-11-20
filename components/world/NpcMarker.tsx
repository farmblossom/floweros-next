"use client";
import { useState } from "react";
import { Billboard, Text } from "@react-three/drei";

interface NpcMarkerProps {
  position: [number, number, number];
  name: string;
  message: string;
  color?: string;
}

export default function NpcMarker({ position, name, message, color = "#4a6243" }: NpcMarkerProps) {
  const [showMsg, setShowMsg] = useState(false);
  return (
    <group position={position} onClick={() => setShowMsg((v) => !v)}>
      <mesh position={[0, 0.9, 0]}>
        <capsuleGeometry args={[0.3, 0.6, 4, 8]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.28, 8, 8]} />
        <meshStandardMaterial color="#f5d79e" roughness={0.5} />
      </mesh>
      <Billboard position={[0, 2.2, 0]}>
        <Text fontSize={0.25} color={color} outlineWidth={0.03} outlineColor="#000">
          {name}
        </Text>
      </Billboard>
      {showMsg && (
        <Billboard position={[0, 3.0, 0]}>
          <Text fontSize={0.22} color="#1e1b18" maxWidth={3} textAlign="center" outlineWidth={0.03} outlineColor="#ffffff">
            {message}
          </Text>
        </Billboard>
      )}
    </group>
  );
}
