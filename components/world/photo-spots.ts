"use client";
import { terrainHeight, type FarmId } from "./terrain";

export interface CameraView {
  eye: [number, number, number];
  target: [number, number, number];
}

export interface PhotoSpot {
  id: string;
  farm: FarmId;
  /** 버튼·표지판에 쓰는 이름 */
  label: string;
  /** 짧은 설명 */
  hint: string;
  /** 표지판 위치 (지면 기준) */
  sign: { x: number; z: number; rotY: number };
  /** 방문자 아바타가 서는 자리 */
  avatarAt: [number, number];
  /** 지기 두 명이 서는 자리 */
  stands: [[number, number], [number, number]];
  /** 카메라 시점 */
  view: CameraView;
  /** 사람들이 바라볼 방향 (라디안, +Z 기준) */
  yaw: number;
}

const h = (farm: FarmId, x: number, z: number) => terrainHeight(farm, x, z);

function standSpots(farm: FarmId, center: [number, number], eye: [number, number]) {
  const dx = eye[0] - center[0];
  const dz = eye[1] - center[1];
  const len = Math.hypot(dx, dz) || 1;
  // 시선 방향의 수직축으로 좌우 한 걸음씩
  const px = -dz / len;
  const pz = dx / len;
  const gap = 1.25;
  const a: [number, number] = [center[0] + px * gap, center[1] + pz * gap];
  const b: [number, number] = [center[0] - px * gap, center[1] - pz * gap];
  const yaw = Math.atan2(dx, dz);
  return { stands: [a, b] as [[number, number], [number, number]], yaw };
}

function spot(
  farm: FarmId,
  id: string,
  label: string,
  hint: string,
  opts: {
    center: [number, number];
    eye: [number, number];
    eyeHeight: number;
    targetHeight: number;
    sign?: { x: number; z: number; rotY: number };
  }
): PhotoSpot {
  const { stands, yaw } = standSpots(farm, opts.center, opts.eye);
  const eyeY = h(farm, opts.eye[0], opts.eye[1]) + opts.eyeHeight;
  const targetY = h(farm, opts.center[0], opts.center[1]) + opts.targetHeight;
  return {
    id,
    farm,
    label,
    hint,
    sign:
      opts.sign ?? {
        x: opts.center[0] + (opts.eye[0] - opts.center[0]) * 0.28 - (opts.center[1] - opts.eye[1]) * 0.05,
        z: opts.center[1] + (opts.eye[1] - opts.center[1]) * 0.28,
        rotY: yaw + Math.PI,
      },
    avatarAt: opts.center,
    stands,
    view: {
      eye: [opts.eye[0], eyeY, opts.eye[1]],
      target: [opts.center[0], targetY, opts.center[1]],
    },
    yaw,
  };
}

export const PHOTO_SPOTS: PhotoSpot[] = [
  /* ── 신월리 농장 ─────────────────────────────────────────── */
  spot("sinwol", "sinwol-cleared", "🌱 개간지 밭길", "새로 일군 밭길과 산자락이 배경", {
    center: [-3.0, 4.6],
    eye: [-5.06, 2.78],
    eyeHeight: 1.35,
    targetHeight: 0.8,
    sign: { x: -3.9, z: 7.8, rotY: 2.5 },
  }),
  spot("sinwol", "sinwol-plum", "🍑 자두 유목밭", "어린 자두나무 사이에서", {
    center: [-3.0, -6.6],
    eye: [-3.0, -3.85],
    eyeHeight: 1.33,
    targetHeight: 0.8,
    sign: { x: 0.3, z: -8.2, rotY: -0.6 },
  }),
  /* ── 덕산농장 ────────────────────────────────────────────── */
  spot("deoksan", "deoksan-arch", "🚪 덕산농장 입구 아치", "‘꽃폈네 덕산농장’ 아치 간판 배경", {
    center: [0, 9.4],
    eye: [0, 6.65],
    eyeHeight: 1.35,
    targetHeight: 0.8,
    sign: { x: -3.0, z: 10.8, rotY: 2.5 },
  }),
  spot("deoksan", "deoksan-field", "🥔 감자밭 고랑길", "고랑이 길게 뻗은 감자밭 배경", {
    center: [0, 4.6],
    eye: [1.75, 2.48],
    eyeHeight: 1.35,
    targetHeight: 0.8,
    sign: { x: -3.2, z: 3.8, rotY: 1.8 },
  }),
];

export const DEFAULT_VIEW: Record<FarmId, CameraView> = {
  sinwol: { eye: [13, 10, 23], target: [0, 1, 2] },
  deoksan: { eye: [0, 13.5, 25], target: [0, 0.5, 2.5] },
};

export function spotsFor(farm: FarmId): PhotoSpot[] {
  return PHOTO_SPOTS.filter((s) => s.farm === farm);
}

export function spotById(farm: FarmId, id: string | null): PhotoSpot | null {
  if (!id) return null;
  return PHOTO_SPOTS.find((s) => s.farm === farm && s.id === id) ?? null;
}

/** 세로 화면(모바일)에서는 같은 구도가 잘리지 않도록 카메라를 뒤로 물린다 */
export function scaledView(view: CameraView, k: number): CameraView {
  if (k === 1) return view;
  const [ex, ey, ez] = view.eye;
  const [tx, ty, tz] = view.target;
  return {
    eye: [tx + (ex - tx) * k, ty + (ey - ty) * k, tz + (ez - tz) * k],
    target: view.target,
  };
}
