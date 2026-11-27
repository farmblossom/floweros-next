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
    eye: [-5.7, 2.22],
    eyeHeight: 1.5,
    targetHeight: 0.85,
    sign: { x: -3.9, z: 7.8, rotY: 2.5 },
  }),
  spot("sinwol", "sinwol-plum", "🍑 자두 유목밭", "자두 유목이 자리할 밭에서", {
    center: [-3.0, -6.6],
    eye: [-3.0, -3.0],
    eyeHeight: 1.48,
    targetHeight: 0.85,
    sign: { x: 0.3, z: -8.2, rotY: -0.6 },
  }),
  spot("sinwol", "sinwol-zelkova", "🌳 팽나무 그늘쉼터", "큰 팽나무 그늘과 평상을 배경으로", {
    center: [13.4, 16.1],
    eye: [9.9, 20.1],
    eyeHeight: 1.62,
    targetHeight: 0.9,
    sign: { x: 10.4, z: 14.6, rotY: 2.4 },
  }),
  /* ── 덕산농장 ────────────────────────────────────────────── */
  spot("deoksan", "deoksan-arch", "🚪 덕산농장 입구 아치", "‘꽃폈네 덕산농장’ 아치 간판 배경", {
    center: [0, 9.4],
    eye: [0, 5.8],
    eyeHeight: 1.5,
    targetHeight: 0.85,
    sign: { x: -3.0, z: 10.8, rotY: 2.5 },
  }),
  spot("deoksan", "deoksan-field", "🥔 감자밭 고랑길", "고랑이 길게 뻗은 감자밭 배경", {
    center: [0, 4.6],
    eye: [2.29, 1.82],
    eyeHeight: 1.5,
    targetHeight: 0.85,
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

/** 포토존에서 함께 찍을 수 있는 추가 캐릭터 (퍼뜨기·쑤담이는 기본 고정) */
export type PhotoExtraId = "dangoma" | "kkuloma" | "jjongoma" | "fm";

export const PHOTO_EXTRAS: { id: PhotoExtraId; npcId: string; label: string; emoji: string }[] = [
  { id: "dangoma", npcId: "dangoma", label: "당고매", emoji: "🍠" },
  { id: "kkuloma", npcId: "kkuloma", label: "꿀고매", emoji: "🍯" },
  { id: "jjongoma", npcId: "jjongoma", label: "쫀고매", emoji: "🍢" },
  { id: "fm", npcId: "fm-jjeongi", label: "FM 쩡이", emoji: "👒" },
];

/**
 * 추가 캐릭터가 서는 자리 — [좌우 위치, 방문자 뒤쪽 거리] (카메라 기준).
 * 지기 둘(±1.25) 사이사이로 엇갈리게 세워 누구도 앞사람 몸에 가리지 않고,
 * 바깥쪽으로 갈수록 조금 앞에 서는 반원 대형을 만든다.
 */
const EXTRA_SLOT: Record<PhotoExtraId, [number, number]> = {
  dangoma: [0.85, 1.55],
  kkuloma: [-0.85, 1.55],
  jjongoma: [1.72, 1.2],
  fm: [-1.72, 1.2],
};

export function extraGatherSlots(
  spot: PhotoSpot,
  ids: PhotoExtraId[]
): Record<string, { x: number; z: number; yaw: number }> {
  const dx = spot.view.eye[0] - spot.avatarAt[0];
  const dz = spot.view.eye[2] - spot.avatarAt[1];
  const len = Math.hypot(dx, dz) || 1;
  // back: 카메라 반대(방문자 뒤쪽), right: 화면 기준 오른쪽
  const bx = -dx / len;
  const bz = -dz / len;
  const rx = -bz;
  const rz = bx;
  const out: Record<string, { x: number; z: number; yaw: number }> = {};
  for (const id of ids) {
    const slot = EXTRA_SLOT[id];
    if (!slot) continue;
    const [side, back] = slot;
    out[id] = {
      x: spot.avatarAt[0] + rx * side + bx * back,
      z: spot.avatarAt[1] + rz * side + bz * back,
      yaw: spot.yaw,
    };
  }
  return out;
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
