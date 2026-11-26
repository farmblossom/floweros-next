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
  spot("sinwol", "sinwol-zelkova", "🌳 팽나무 그늘 쉼터", "큰 팽나무와 나무 평상이 배경", {
    center: [13.2, 12.0],
    eye: [9.9, 7.9],
    eyeHeight: 2.5,
    targetHeight: 1.05,
    sign: { x: 11.6, z: 10.2, rotY: 0.9 },
  }),
  spot("sinwol", "sinwol-rye", "🌾 호밀밭 물결", "초록 호밀밭을 뒤로 한 사진", {
    center: [6.6, 8.9],
    eye: [5.2, 4.6],
    eyeHeight: 2.3,
    targetHeight: 1.0,
    sign: { x: 4.2, z: 6.6, rotY: 0.35 },
  }),
  /* ── 덕산농장 ────────────────────────────────────────────── */
  spot("deoksan", "deoksan-arch", "🚪 덕산농장 입구 아치", "‘꽃폈네 덕산농장’ 아치 간판 배경", {
    center: [0, 9.4],
    eye: [0, 5.7],
    eyeHeight: 2.4,
    targetHeight: 1.0,
    sign: { x: -2.6, z: 8.0, rotY: 0.55 },
  }),
  spot("deoksan", "deoksan-field", "🥔 감자밭 고랑길", "고랑이 길게 뻗은 감자밭 배경", {
    center: [0, 4.6],
    eye: [2.9, 1.1],
    eyeHeight: 2.2,
    targetHeight: 0.95,
    sign: { x: 2.6, z: 3.2, rotY: -0.5 },
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
