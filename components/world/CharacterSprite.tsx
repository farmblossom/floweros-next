"use client";
import { useRef, useState } from "react";
import { useTexture, Billboard, Html, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";

type Waypoint = [number, number, number];

interface CharacterSpriteProps {
  waypoints: Waypoint[];
  textureUrl: string;
  name: string;
  dialogLines: string[];
  speed?: number;
  size?: [number, number];
}

export default function CharacterSprite({
  waypoints,
  textureUrl,
  name,
  dialogLines,
  speed = 1.2,
  size = [1.2, 1.6],
}: CharacterSpriteProps) {
  const texture = useTexture(textureUrl);
  const [dialogIdx, setDialogIdx] = useState(0);
  const [showDialog, setShowDialog] = useState(false);

  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  // 애니메이션 상태 — useFrame 내에서 setState 없이 DOM 조작
  const posRef = useRef(new THREE.Vector3(...waypoints[0]));
  const targetIdxRef = useRef(1);
  const stateRef = useRef<"walking" | "idle">("walking");
  const idleTimerRef = useRef(0);
  const idleDurRef = useRef(1.8 + Math.random() * 1.5);

  useFrame((_, delta) => {
    if (!groupRef.current || !meshRef.current) return;

    if (stateRef.current === "idle") {
      idleTimerRef.current += delta;
      if (idleTimerRef.current >= idleDurRef.current) {
        idleTimerRef.current = 0;
        idleDurRef.current = 1.8 + Math.random() * 2.8;
        stateRef.current = "walking";
        targetIdxRef.current = (targetIdxRef.current + 1) % waypoints.length;
      }
    } else {
      const target = new THREE.Vector3(...waypoints[targetIdxRef.current]);
      const dist = posRef.current.distanceTo(target);

      if (dist < 0.08) {
        posRef.current.copy(target);
        stateRef.current = "idle";
        idleTimerRef.current = 0;
        idleDurRef.current = 1.8 + Math.random() * 3.2;
      } else {
        const dir = target.clone().sub(posRef.current).normalize();
        posRef.current.addScaledVector(dir, Math.min(speed * delta, dist));
        // 이동 방향에 따라 스프라이트 좌우 반전
        if (dir.x < 0) {
          meshRef.current.scale.x = -Math.abs(meshRef.current.scale.x);
        } else {
          meshRef.current.scale.x = Math.abs(meshRef.current.scale.x);
        }
      }
    }

    groupRef.current.position.copy(posRef.current);
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!showDialog) {
      setDialogIdx(0);
      setShowDialog(true);
    } else {
      const next = (dialogIdx + 1) % dialogLines.length;
      if (next === 0) {
        setShowDialog(false);
      } else {
        setDialogIdx(next);
      }
    }
  };

  return (
    <group ref={groupRef} position={waypoints[0]}>
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        {/* 캐릭터 스프라이트 메시 — RGBA 투명 PNG 텍스처 */}
        <mesh
          ref={meshRef}
          scale={[size[0], size[1], 1]}
          onClick={handleClick}
        >
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            map={texture}
            transparent
            alphaTest={0.05}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* 이름 라벨 */}
        <Text
          position={[0, size[1] / 2 + 0.22, 0.01]}
          fontSize={0.22}
          color="white"
          outlineWidth={0.04}
          outlineColor="#000000"
          anchorX="center"
          anchorY="bottom"
        >
          {name}
        </Text>

        {/* 대화 말풍선 */}
        {showDialog && (
          <Html
            position={[0, size[1] / 2 + 0.9, 0]}
            center
            distanceFactor={10}
            zIndexRange={[6, 20]}
            style={{ pointerEvents: "none" }}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.97)",
                border: "2px solid #4a6243",
                borderRadius: "12px",
                padding: "9px 13px",
                maxWidth: "200px",
                fontSize: "11.5px",
                color: "#1e1b18",
                textAlign: "center",
                lineHeight: 1.55,
                boxShadow: "0 3px 12px rgba(0,0,0,0.25)",
                fontFamily: "sans-serif",
                whiteSpace: "pre-wrap",
              }}
            >
              {dialogLines[dialogIdx]}
              <div
                style={{
                  fontSize: "9px",
                  color: "#888",
                  marginTop: "5px",
                }}
              >
                {dialogIdx + 1}/{dialogLines.length} · 클릭해서 다음
              </div>
            </div>
          </Html>
        )}
      </Billboard>
    </group>
  );
}
