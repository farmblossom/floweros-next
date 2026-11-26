"use client";
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { CameraView } from "./photo-spots";

/**
 * 포토존 시점 이동 — 카메라를 지정한 구도로 부드럽게 옮긴다.
 * 이동이 끝난 뒤에는 그 자리에 그대로 머물러, 드래그로 각도를 다듬을 수 있다.
 */
export default function CameraDirector({
  view,
  requestId,
  duration = 0.95,
  onAnimating,
}: {
  view: CameraView | null;
  requestId: string;
  duration?: number;
  onAnimating?: (busy: boolean) => void;
}) {
  const { camera } = useThree();
  const animRef = useRef<{
    fromPos: THREE.Vector3;
    toPos: THREE.Vector3;
    fromLook: THREE.Vector3;
    toLook: THREE.Vector3;
    t: number;
  } | null>(null);
  const lastIdRef = useRef<string>("");

  useEffect(() => {
    const id = `${requestId}`;
    if (lastIdRef.current === id) return;
    lastIdRef.current = id;

    if (!view) return;

    const currentLook = new THREE.Vector3();
    camera.getWorldDirection(currentLook);
    currentLook.multiplyScalar(12).add(camera.position);

    animRef.current = {
      fromPos: camera.position.clone(),
      toPos: new THREE.Vector3(...view.eye),
      fromLook: currentLook,
      toLook: new THREE.Vector3(...view.target),
      t: 0,
    };
    onAnimating?.(true);
  }, [requestId, view, camera, onAnimating]);

  useFrame((_, delta) => {
    const anim = animRef.current;
    if (!anim) return;
    anim.t = Math.min(1, anim.t + delta / duration);
    const e = anim.t < 0.5 ? 2 * anim.t * anim.t : 1 - Math.pow(-2 * anim.t + 2, 2) / 2; // easeInOutQuad

    camera.position.lerpVectors(anim.fromPos, anim.toPos, e);
    const look = new THREE.Vector3().lerpVectors(anim.fromLook, anim.toLook, e);
    camera.lookAt(look);

    if (anim.t >= 1) {
      animRef.current = null;
      onAnimating?.(false);
    }
  }, -2);

  return null;
}

/** 캔버스 프레임을 PNG dataURL 로 넘겨주는 다리 — 검은 화면 없이 현재 프레임을 다시 그린 뒤 읽는다 */
export function CaptureBridge({
  captureRef,
}: {
  captureRef: React.RefObject<(() => string | null) | null>;
}) {
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    captureRef.current = () => {
      try {
        gl.render(scene, camera); // 캡처 직전 한 프레임 확실히 그린다
        return gl.domElement.toDataURL("image/png");
      } catch {
        return null;
      }
    };
    return () => {
      captureRef.current = null;
    };
  }, [gl, scene, camera, captureRef]);

  return null;
}
