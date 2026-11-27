"use client";
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import VisitorAvatar, { avatarLabelY, type VisitorLook, type VisitorPose } from "./VisitorAvatar";
import { Html } from "@react-three/drei";
import { sinwolHeight, terrainHeight, type FarmId, type PlayerPosition, type WalkBounds } from "./terrain";

/**
 * 포토존에 설 때의 발밑 높이 — 몸통 반경 안에서 가장 높은 지형.
 * 경사면이 발·몸통 아래를 스쳐 가리지 않도록 그만큼 올려 세운다 (신월리).
 */
function stagedGroundY(farm: FarmId, x: number, z: number): number {
  const base = terrainHeight(farm, x, z);
  if (farm !== "sinwol") return base;
  let y = base;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    y = Math.max(y, sinwolHeight(x + Math.cos(a) * 0.3, z + Math.sin(a) * 0.3));
  }
  return y + 0.02;
}

interface JoystickState {
  x: number;
  y: number;
}

interface WalkControllerProps {
  enabled: boolean;
  speed?: number;
  bounds: WalkBounds;
  joystickRef: React.RefObject<JoystickState>;
  farm: FarmId;
  /** 방문자가 고른 모습 (타입·옷 색·밀짚모자) */
  look: VisitorLook;
  /** 서기 · 앉기 · 구부리기 */
  pose: VisitorPose;
  /** 아바타 머리 위에 띄우는 닉네임 */
  name: string;
  playerRef: React.RefObject<PlayerPosition>;
  startPosition: [number, number, number];
  /** 바라보는 방향 공유 (실시간 접속자 동기화용) */
  headingOutRef?: React.RefObject<number>;
  /** 이동 여부 공유 (실시간 접속자 동기화용) */
  movingOutRef?: React.RefObject<{ moving: boolean }>;
  /** 포토존 — 이 자리에 서서 카메라를 바라본다 */
  stageAt?: { x: number; z: number; yaw: number } | null;
}

/**
 * 방문자 아바타를 3인칭으로 조작한다.
 * WASD/방향키/모바일 조이스틱으로 걷고, 드래그로 시점을 돌린다.
 */
export default function WalkController({
  enabled,
  speed = 4.2,
  bounds,
  joystickRef,
  farm,
  look,
  pose,
  name,
  playerRef,
  startPosition,
  headingOutRef,
  movingOutRef,
  stageAt = null,
}: WalkControllerProps) {
  const { camera, gl } = useThree();
  const avatarRef = useRef<THREE.Group>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const isPointerDownRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const yawRef = useRef(0.35);
  const pitchRef = useRef(0.24);
  const initializedRef = useRef(false);
  const innerMovingRef = useRef<{ moving: boolean }>({ moving: false });
  const innerHeadingRef = useRef(Math.PI);
  const movingStateRef = movingOutRef ?? innerMovingRef;
  const headingRef = headingOutRef ?? innerHeadingRef;
  const stagedRef = useRef(false);

  const posRef = useRef(new THREE.Vector3(...startPosition));
  const camTargetRef = useRef(new THREE.Vector3());

  // 키보드
  useEffect(() => {
    if (!enabled) {
      keysRef.current.clear();
      movingStateRef.current.moving = false;
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase());
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => keysRef.current.delete(e.key.toLowerCase());

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      keysRef.current.clear();
    };
  }, [enabled]);

  // 드래그로 시점 회전
  useEffect(() => {
    if (!enabled) {
      initializedRef.current = false;
      isPointerDownRef.current = false;
      return;
    }
    const canvas = gl.domElement;

    const onPointerDown = (e: PointerEvent) => {
      isPointerDownRef.current = true;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
    };
    const onPointerUp = () => {
      isPointerDownRef.current = false;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isPointerDownRef.current) return;
      const dx = e.clientX - lastPointerRef.current.x;
      const dy = e.clientY - lastPointerRef.current.y;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
      yawRef.current -= dx * 0.004;
      pitchRef.current = Math.max(0.02, Math.min(0.85, pitchRef.current + dy * 0.003));
    };
    const onWheel = (e: WheelEvent) => {
      pitchRef.current = Math.max(0.02, Math.min(0.85, pitchRef.current + e.deltaY * 0.0006));
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("wheel", onWheel, { passive: true });

    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("wheel", onWheel);
    };
  }, [enabled, gl]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.06);
    const pos = posRef.current;

    if (enabled) {
      if (!initializedRef.current) {
        // 현재 카메라가 보는 방향을 시점으로 이어받는다
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);
        yawRef.current = Math.atan2(-dir.x, -dir.z);
        initializedRef.current = true;
      }

      const sinY = Math.sin(yawRef.current);
      const cosY = Math.cos(yawRef.current);
      const forward = new THREE.Vector3(-sinY, 0, -cosY);
      const right = new THREE.Vector3(cosY, 0, -sinY);

      const keys = keysRef.current;
      const joy = joystickRef.current ?? { x: 0, y: 0 };

      const fwd =
        (keys.has("w") || keys.has("arrowup") ? 1 : 0) -
        (keys.has("s") || keys.has("arrowdown") ? 1 : 0) -
        joy.y;
      const rgt =
        (keys.has("d") || keys.has("arrowright") ? 1 : 0) -
        (keys.has("a") || keys.has("arrowleft") ? 1 : 0) +
        joy.x;

      const move = new THREE.Vector3().addScaledVector(forward, fwd).addScaledVector(right, rgt);
      const len = move.length();
      const running = keys.has("shift");

      if (len > 0.02) {
        move.normalize();
        const step = speed * (running ? 1.7 : 1) * dt;
        pos.x = Math.max(bounds.minX, Math.min(bounds.maxX, pos.x + move.x * step));
        pos.z = Math.max(bounds.minZ, Math.min(bounds.maxZ, pos.z + move.z * step));
        movingStateRef.current.moving = true;

        const targetHeading = Math.atan2(move.x, move.z);
        let diff = targetHeading - headingRef.current;
        diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        headingRef.current += diff * Math.min(1, dt * 12);
      } else {
        movingStateRef.current.moving = false;
      }

      pos.y = terrainHeight(farm, pos.x, pos.z);

      // 3인칭 카메라
      const dist = 6.6;
      const horiz = Math.cos(pitchRef.current) * dist;
      const desired = new THREE.Vector3(
        pos.x + Math.sin(yawRef.current) * horiz,
        pos.y + 1.75 + Math.sin(pitchRef.current) * dist,
        pos.z + Math.cos(yawRef.current) * horiz
      );
      const groundY = terrainHeight(farm, desired.x, desired.z);
      desired.y = Math.max(desired.y, groundY + 0.8);

      const smooth = 1 - Math.exp(-9 * dt);
      camera.position.lerp(desired, smooth);
      camTargetRef.current.lerp(new THREE.Vector3(pos.x, pos.y + 1.35, pos.z), Math.min(1, smooth * 1.4));
      camera.lookAt(camTargetRef.current);

      // 아바타 위치·방향
      if (avatarRef.current) {
        avatarRef.current.position.set(pos.x, pos.y, pos.z);
        avatarRef.current.rotation.y = headingRef.current;
      }
    } else {
      if (stageAt) {
        // 포토존 — 사람들 사이 자기 자리로 걸어가 카메라 쪽을 바라본다
        const k = 1 - Math.exp(-6 * dt);
        pos.x += (stageAt.x - pos.x) * k;
        pos.z += (stageAt.z - pos.z) * k;
        let diff = stageAt.yaw - headingRef.current;
        diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        headingRef.current += diff * Math.min(1, dt * 5);
        movingStateRef.current.moving = Math.hypot(stageAt.x - pos.x, stageAt.z - pos.z) > 0.08;
        stagedRef.current = true;
      } else if (stagedRef.current) {
        // 포토존에서 돌아오면 원래 서 있던 자리로
        const k = 1 - Math.exp(-4 * dt);
        pos.x += (startPosition[0] - pos.x) * k;
        pos.z += (startPosition[2] - pos.z) * k;
        movingStateRef.current.moving = Math.hypot(startPosition[0] - pos.x, startPosition[2] - pos.z) > 0.1;
        if (Math.hypot(startPosition[0] - pos.x, startPosition[2] - pos.z) < 0.12) {
          stagedRef.current = false;
          movingStateRef.current.moving = false;
        }
      }
      pos.y = stagedRef.current ? stagedGroundY(farm, pos.x, pos.z) : terrainHeight(farm, pos.x, pos.z);
      if (avatarRef.current) {
        avatarRef.current.position.set(pos.x, pos.y, pos.z);
        avatarRef.current.rotation.y = headingRef.current;
      }
    }

    // 방문자 위치 공유 (NPC 근접 인사용)
    if (playerRef.current) {
      playerRef.current.x = pos.x;
      playerRef.current.y = pos.y;
      playerRef.current.z = pos.z;
    }

    // 유휴 시 아바타가 살짝 숨쉬듯
    if (!movingStateRef.current.moving && avatarRef.current) {
      avatarRef.current.position.y = pos.y + Math.sin(state.clock.elapsedTime * 1.2) * 0.008;
    }
  });

  return (
    <group ref={avatarRef} position={startPosition}>
      <VisitorAvatar look={look} pose={pose} movingState={movingStateRef} />
      <Html
        position={[0, avatarLabelY(look, pose), 0]}
        center
        pointerEvents="none"
        zIndexRange={[7, 16]}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            background: "rgba(255,255,255,0.9)",
            color: "#22301b",
            border: "1.5px solid rgba(63,107,52,0.85)",
            borderRadius: 999,
            padding: "1px 7px",
            fontSize: 10,
            fontWeight: 800,
            whiteSpace: "nowrap",
            pointerEvents: "none",
            boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
            fontFamily: "system-ui, -apple-system, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
          }}
        >
          {name}
        </div>
      </Html>
    </group>
  );
}
