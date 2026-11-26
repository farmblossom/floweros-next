"use client";
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Sky, Stars } from "@react-three/drei";
import * as THREE from "three";
import type { MoodPreset } from "./world-mood";

interface WeatherEnvironmentProps {
  mood: MoodPreset;
  /** 그림자 범위를 넓혀야 하는 농장(신월리)은 조금 크게 */
  shadowRadius?: number;
}

/** 하늘·안개·해/달·구름·비/눈을 실제 밀양 날씨와 시간대에 맞춰 그리는 환경 */
export default function WeatherEnvironment({ mood, shadowRadius = 30 }: WeatherEnvironmentProps) {
  const { scene } = useThree();

  useEffect(() => {
    scene.background = new THREE.Color(mood.background);
    scene.fog = new THREE.Fog(mood.fog, mood.fogNear, mood.fogFar);
    return () => {
      scene.fog = null;
    };
  }, [scene, mood.background, mood.fog, mood.fogNear, mood.fogFar]);

  return (
    <>
      {mood.useSky ? (
        <Sky
          distance={450000}
          sunPosition={mood.sunPosition}
          rayleigh={mood.rayleigh}
          turbidity={mood.turbidity}
          mieCoefficient={0.008}
          mieDirectionalG={0.8}
        />
      ) : null}
      {mood.stars ? <Stars radius={140} depth={40} count={1400} factor={3} saturation={0} fade speed={0.4} /> : null}

      <hemisphereLight args={[mood.ambientColor, mood.groundColor, mood.ambientIntensity]} />
      <ambientLight color={mood.ambientColor} intensity={mood.ambientIntensity * 0.55} />
      <directionalLight
        position={[-mood.sunPosition[0] * 0.6, 24, -mood.sunPosition[2] * 0.6]}
        color={mood.ambientColor}
        intensity={mood.sunIntensity * 0.35}
      />
      <directionalLight
        position={mood.sunPosition}
        color={mood.sunColor}
        intensity={mood.sunIntensity}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-shadowRadius}
        shadow-camera-right={shadowRadius}
        shadow-camera-top={shadowRadius}
        shadow-camera-bottom={-shadowRadius}
        shadow-bias={-0.0008}
      />
      {mood.phase === "night" ? (
        <>
          <mesh position={[62, 46, -34]}>
            <sphereGeometry args={[3.2, 20, 16]} />
            <meshBasicMaterial color="#f4f1e2" toneMapped={false} />
          </mesh>
          <mesh position={[62, 46, -34]}>
            <sphereGeometry args={[6.4, 20, 16]} />
            <meshBasicMaterial color="#cdd8ef" transparent opacity={0.16} depthWrite={false} />
          </mesh>
        </>
      ) : null}

      {mood.phase === "night" ? (
        <pointLight position={[-8, 4, 6]} color="#ffd9a0" intensity={6} distance={16} decay={2} />
      ) : null}

      <Clouds count={mood.cloudCount} color={mood.cloudColor} opacity={mood.cloudOpacity} />
      {mood.precipitation !== "none" ? <Precipitation mode={mood.precipitation} /> : null}
    </>
  );
}

function Clouds({ count, color, opacity }: { count: number; color: string; opacity: number }) {
  const groupRef = useRef<THREE.Group>(null);

  const puffs = useMemo(() => {
    return Array.from({ length: Math.max(count, 1) }, (_, i) => {
      const angle = (i / Math.max(count, 1)) * Math.PI * 2 + (i % 3) * 0.31;
      const radius = 38 + ((i * 13) % 26);
      const scale = 4.2 + ((i * 7) % 5) * 0.9;
      return {
        key: `cloud-${i}`,
        position: [Math.cos(angle) * radius, 20 + ((i * 5) % 9), Math.sin(angle) * radius] as [number, number, number],
        scale,
        drift: 0.02 + (i % 4) * 0.006,
      };
    });
  }, [count]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.006;
  });

  return (
    <group ref={groupRef}>
      {puffs.map((puff) => (
        <group key={puff.key} position={puff.position} scale={[puff.scale, puff.scale * 0.52, puff.scale * 0.8]}>
          <mesh>
            <sphereGeometry args={[1, 10, 8]} />
            <meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
          </mesh>
          <mesh position={[1.1, -0.1, 0.2]}>
            <sphereGeometry args={[0.72, 9, 7]} />
            <meshBasicMaterial color={color} transparent opacity={opacity * 0.9} depthWrite={false} />
          </mesh>
          <mesh position={[-1.05, -0.15, -0.25]}>
            <sphereGeometry args={[0.66, 9, 7]} />
            <meshBasicMaterial color={color} transparent opacity={opacity * 0.85} depthWrite={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Precipitation({ mode }: { mode: "rain" | "snow" }) {
  const geomRef = useRef<THREE.BufferGeometry>(null);
  const count = mode === "rain" ? 1500 : 800;

  const { positions, speeds } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 70;
      pos[i * 3 + 1] = Math.random() * 28;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 70;
      spd[i] = mode === "rain" ? 14 + Math.random() * 8 : 1.6 + Math.random() * 1.4;
    }
    return { positions: pos, speeds: spd };
  }, [count, mode]);

  useFrame((_, delta) => {
    const geom = geomRef.current;
    if (!geom) return;
    const attr = geom.getAttribute("position") as THREE.BufferAttribute | undefined;
    if (!attr) return;
    const arr = attr.array as Float32Array;
    const dt = Math.min(delta, 0.05);

    for (let i = 0; i < count; i++) {
      const yIdx = i * 3 + 1;
      arr[yIdx] -= speeds[i] * dt;
      if (mode === "snow") {
        arr[i * 3] += Math.sin((arr[yIdx] + i) * 0.6) * dt * 0.35;
      }
      if (arr[yIdx] < 0.1) {
        arr[yIdx] = 26 + Math.random() * 4;
        arr[i * 3] = (Math.random() - 0.5) * 70;
        arr[i * 3 + 2] = (Math.random() - 0.5) * 70;
      }
    }
    attr.needsUpdate = true;
  });

  return (
    <points>
      <bufferGeometry ref={geomRef}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={mode === "rain" ? 0.13 : 0.24}
        color={mode === "rain" ? "#cfe3f5" : "#ffffff"}
        transparent
        opacity={mode === "rain" ? 0.55 : 0.85}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
