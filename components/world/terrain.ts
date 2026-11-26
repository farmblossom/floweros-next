import { PlaneGeometry } from "three";

export type FarmId = "sinwol" | "deoksan";

export interface PlayerPosition {
  x: number;
  y: number;
  z: number;
}

export interface WalkBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export const FARM_BOUNDS: Record<FarmId, WalkBounds> = {
  deoksan: { minX: -13, maxX: 13, minZ: -13, maxZ: 13 },
  sinwol: { minX: -18, maxX: 18, minZ: -18, maxZ: 18 },
};

/**
 * 신월리 농장 지형 높이 (남서향 경사 10~15도 + 기복).
 * SinwolScene 의 PlaneGeometry(회전 -90°)와 같은 식을 쓴다.
 */
export function sinwolHeight(x: number, z: number): number {
  const lz = -z; // 평면 로컬 y = 월드 -z
  const baseSlope = lz * 0.07 + x * 0.04;
  const noise =
    Math.sin(x * 0.28) * 0.55 +
    Math.cos(lz * 0.22) * 0.45 +
    Math.sin(x * 0.65 + lz * 0.38) * 0.28 +
    Math.cos(x * 0.15 + lz * 0.6) * 0.18;
  return baseSlope + noise;
}

export function terrainHeight(farm: FarmId, x: number, z: number): number {
  return farm === "sinwol" ? sinwolHeight(x, z) : 0;
}

/**
 * 신월리 경사 지형에 딱 붙는 바닥 조각(개간지·호밀밭·농로)을 만든다.
 * PlaneGeometry(회전 -90°)의 로컬 좌표를 월드 좌표로 바꿔 높이를 맞춘다.
 */
export function terrainPatchGeometry(
  width: number,
  depth: number,
  centerX: number,
  centerZ: number,
  lift = 0.05,
  segments = 24
): PlaneGeometry {
  const geo = new PlaneGeometry(width, depth, segments, segments);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const lx = pos.getX(i);
    const ly = pos.getY(i);
    pos.setZ(i, sinwolHeight(centerX + lx, centerZ - ly) + lift);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}
