"use client";
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import VisitorAvatar, { AvatarPresetId } from "./VisitorAvatar";
import { terrainHeight, type FarmId, type PlayerPosition, type WalkBounds } from "./terrain";

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
  avatar: AvatarPresetId;
  playerRef: React.RefObject<PlayerPosition>;
  startPosition: [number, number, number];
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
  avatar,
  playerRef,
  startPosition,
}: WalkControllerProps) {
  const { camera, gl } = useThree();
  const avatarRef = useRef<THREE.Group>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const isPointerDownRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const yawRef = useRef(0.35);
  const pitchRef = useRef(0.24);
  const initializedRef = useRef(false);
  const movingStateRef = useRef<{ moving: boolean }>({ moving: false });

  const posRef = useRef(new THREE.Vector3(...startPosition));
  const headingRef = useRef(Math.PI);
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
      const dist = 5.4;
      const horiz = Math.cos(pitchRef.current) * dist;
      const desired = new THREE.Vector3(
        pos.x + Math.sin(yawRef.current) * horiz,
        pos.y + 1.35 + Math.sin(pitchRef.current) * dist,
        pos.z + Math.cos(yawRef.current) * horiz
      );
      const groundY = terrainHeight(farm, desired.x, desired.z);
      desired.y = Math.max(desired.y, groundY + 0.8);

      const smooth = 1 - Math.exp(-9 * dt);
      camera.position.lerp(desired, smooth);
      camTargetRef.current.lerp(new THREE.Vector3(pos.x, pos.y + 1.15, pos.z), Math.min(1, smooth * 1.4));
      camera.lookAt(camTargetRef.current);

      // 아바타 위치·방향
      if (avatarRef.current) {
        avatarRef.current.position.set(pos.x, pos.y, pos.z);
        avatarRef.current.rotation.y = headingRef.current;
      }
    } else {
      pos.y = terrainHeight(farm, pos.x, pos.z);
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
      <VisitorAvatar preset={avatar} movingState={movingStateRef} />
    </group>
  );
}
