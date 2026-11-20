"use client";
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface WalkBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

interface JoystickState {
  x: number;
  y: number;
}

interface WalkControllerProps {
  enabled: boolean;
  speed?: number;
  bounds: WalkBounds;
  joystickRef: React.MutableRefObject<JoystickState>;
}

export default function WalkController({
  enabled,
  speed = 5,
  bounds,
  joystickRef,
}: WalkControllerProps) {
  const { camera, gl } = useThree();
  const keysRef = useRef<Set<string>>(new Set());
  const isPointerDownRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const yawRef = useRef(0);
  const pitchRef = useRef(-0.25);
  const initializedRef = useRef(false);

  // 키보드 이벤트
  useEffect(() => {
    if (!enabled) {
      keysRef.current.clear();
      return;
    }

    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase());
      if (["arrowup", "arrowdown", "arrowleft", "arrowright"].includes(e.key.toLowerCase())) {
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

  // 마우스/터치 드래그로 시점 회전
  useEffect(() => {
    if (!enabled) {
      initializedRef.current = false;
      return;
    }

    const canvas = gl.domElement;

    const onPointerDown = (e: PointerEvent) => {
      isPointerDownRef.current = true;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
    };
    const onPointerUp = () => { isPointerDownRef.current = false; };
    const onPointerMove = (e: PointerEvent) => {
      if (!isPointerDownRef.current) return;
      const dx = e.clientX - lastPointerRef.current.x;
      const dy = e.clientY - lastPointerRef.current.y;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
      yawRef.current -= dx * 0.003;
      pitchRef.current = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 5, pitchRef.current - dy * 0.003));
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointermove", onPointerMove);

    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointermove", onPointerMove);
    };
  }, [enabled, gl]);

  useFrame((_, delta) => {
    if (!enabled) return;

    // 최초 활성화 시 현재 카메라 방향에서 yaw/pitch 초기화
    if (!initializedRef.current) {
      const euler = new THREE.Euler().setFromQuaternion(camera.quaternion, "YXZ");
      yawRef.current = euler.y;
      pitchRef.current = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 5, euler.x));
      // 하늘 위에서 시작했을 때 눈높이로 내려옴
      if (camera.position.y > 4) {
        camera.position.y = 1.8;
      }
      initializedRef.current = true;
    }

    // 회전 적용
    const euler = new THREE.Euler(pitchRef.current, yawRef.current, 0, "YXZ");
    camera.quaternion.setFromEuler(euler);

    // 이동 방향 계산 (수평면만)
    const sinY = Math.sin(yawRef.current);
    const cosY = Math.cos(yawRef.current);
    const forward = new THREE.Vector3(-sinY, 0, -cosY);
    const right = new THREE.Vector3(cosY, 0, -sinY);

    const keys = keysRef.current;
    const joy = joystickRef.current;
    const moveSpeed = speed * delta;

    const fwd =
      (keys.has("w") || keys.has("arrowup") ? 1 : 0) -
      (keys.has("s") || keys.has("arrowdown") ? 1 : 0) -
      Math.round(joy.y * 10) / 10;

    const rgt =
      (keys.has("d") || keys.has("arrowright") ? 1 : 0) -
      (keys.has("a") || keys.has("arrowleft") ? 1 : 0) +
      Math.round(joy.x * 10) / 10;

    if (fwd !== 0 || rgt !== 0) {
      camera.position.addScaledVector(forward, fwd * moveSpeed);
      camera.position.addScaledVector(right, rgt * moveSpeed);
      camera.position.x = Math.max(bounds.minX, Math.min(bounds.maxX, camera.position.x));
      camera.position.z = Math.max(bounds.minZ, Math.min(bounds.maxZ, camera.position.z));
      camera.position.y = Math.max(1.5, Math.min(5, camera.position.y));
    }
  });

  return null;
}
