"use client";
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/** 카메라가 보는 방위(북=0°, 동=90°)를 ref에 기록 */
export function CameraCompassTracker({ yawRef }: { yawRef: React.RefObject<number> }) {
  const { camera } = useThree();
  const dir = useRef(new THREE.Vector3());

  useFrame(() => {
    camera.getWorldDirection(dir.current);
    const deg = (Math.atan2(dir.current.x, -dir.current.z) * 180) / Math.PI;
    if (yawRef.current !== undefined) yawRef.current = (deg + 360) % 360;
  });

  return null;
}

/** 동서남북 나침반 오버레이 — 신월리 지형 방위(-Z=북, +X=동)와 같은 기준 */
export default function Compass({ yawRef }: { yawRef: React.RefObject<number> }) {
  const roseRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const yaw = yawRef.current ?? 0;
      if (roseRef.current) roseRef.current.style.transform = `rotate(${-yaw}deg)`;
      if (labelRef.current) labelRef.current.textContent = `${Math.round(yaw)}°`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [yawRef]);

  return (
    <div
      className="absolute bottom-5 left-4 z-20 select-none"
      aria-label="농장 방위 나침반"
      title="신월리 농장 기준 방위 · 해는 동쪽에서 떠서 서쪽으로 집니다"
    >
      <div className="relative w-16 h-16 rounded-full bg-black/45 backdrop-blur-sm border border-white/25 shadow-lg">
        <div ref={roseRef} className="absolute inset-0 transition-none">
          <span className="absolute left-1/2 top-[3px] -translate-x-1/2 text-[9px] font-bold text-[#ff8a7a]">N</span>
          <span className="absolute right-[4px] top-1/2 -translate-y-1/2 text-[8px] font-semibold text-white/75">E</span>
          <span className="absolute left-1/2 bottom-[3px] -translate-x-1/2 text-[8px] font-semibold text-white/75">S</span>
          <span className="absolute left-[4px] top-1/2 -translate-y-1/2 text-[8px] font-semibold text-white/75">W</span>
          <div className="absolute left-1/2 top-1/2 w-[1px] h-[18px] -translate-x-1/2 -translate-y-full bg-gradient-to-t from-transparent to-[#ff8a7a]/90" />
          <div className="absolute left-1/2 top-1/2 w-[1px] h-[12px] -translate-x-1/2 bg-white/40" />
        </div>
        <span
          ref={labelRef}
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] text-white/70 whitespace-nowrap"
        >
          0°
        </span>
      </div>
    </div>
  );
}
