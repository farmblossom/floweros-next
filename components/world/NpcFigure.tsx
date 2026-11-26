"use client";
import { useMemo, useRef, useState } from "react";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { PlayerPosition } from "./terrain";
import NpcCharacter, { NPC_NATURAL_HEIGHT, type NpcKind } from "./NpcCharacter";

interface NpcFigureProps {
  id: string;
  activeId: string | null;
  onTalk: (id: string | null) => void;
  kind: NpcKind;
  name: string;
  role: string;
  /** 원본 일러스트 — 말풍선 썸네일로 함께 보여준다 */
  textureUrl: string;
  position: [number, number, number];
  lines: string[];
  playerRef: React.RefObject<PlayerPosition>;
  /** 캐릭터 키(월드 단위) */
  height?: number;
  greetRadius?: number;
  accent?: string;
  /** 걷기 모드일 때만 다가가면 인사 */
  greetEnabled?: boolean;
  walkAxis?: "x" | "z";
  /** 포토존 단체사진 — 이 자리로 모여 선다 (월드 좌표) */
  gatherTo?: { x: number; z: number; yaw: number } | null;
}

/**
 * 농장지기 — 3D 입체 캐릭터 + 원본 일러스트 썸네일.
 * 원본 이미지의 인상(둥근 감자 몸통·잎·감자꽃·고구마 톤·앞치마 쓴 FM)을 살린 메쉬에
 * 숨쉬기·통통 뛰기·손 흔들기 애니메이션을 넣고, 클릭하면 원본 그림과 함께 대사를 띄운다.
 */
export default function NpcFigure({
  id,
  activeId,
  onTalk,
  kind,
  name,
  role,
  textureUrl,
  position,
  lines,
  playerRef,
  height = 2.1,
  greetRadius = 3.6,
  accent = "#4a6243",
  greetEnabled = true,
  walkAxis = "x",
  gatherTo = null,
}: NpcFigureProps) {
  const [lineIdx, setLineIdx] = useState(0);
  const [hint, setHint] = useState(false);
  const [waving, setWaving] = useState(false);
  const [showName, setShowName] = useState(true);
  const hintRef = useRef(false);
  const active = activeId === id;

  const scale = height / NPC_NATURAL_HEIGHT[kind];
  const width = Math.max(1, height * 0.62);

  const gather = useMemo(() => {
    if (!gatherTo) return null;
    return { x: gatherTo.x - position[0], z: gatherTo.z - position[2], yaw: gatherTo.yaw };
  }, [gatherTo, position]);

  useFrame((state) => {
    // 카메라가 멀면 이름표를 숨겨 글씨 겹침을 줄인다
    const camDist = state.camera.position.distanceTo(state.camera.position.clone().set(position[0], position[1] + height * 0.7, position[2]));
    const shouldShow = camDist < 30;
    if (shouldShow !== showName) setShowName(shouldShow);

    const p = playerRef.current;
    if (!p) return;
    const dist = Math.hypot(p.x - position[0], p.z - position[2]);
    const near = greetEnabled && dist < greetRadius;

    if (near !== waving) setWaving(near);

    const nextHint = near && !active;
    if (nextHint !== hintRef.current) {
      hintRef.current = nextHint;
      setHint(nextHint);
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!active) {
      onTalk(id);
      setLineIdx(0);
    } else {
      const next = lineIdx + 1;
      if (next >= lines.length) {
        onTalk(null);
        setLineIdx(0);
      } else {
        setLineIdx(next);
      }
    }
    setHint(false);
  };

  return (
    <group position={position}>
      {/* 바닥 그림자 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[width * 0.46, 24]} />
        <meshBasicMaterial color="#1b2416" transparent opacity={0.26} depthWrite={false} />
      </mesh>

      {/* 클릭 영역 */}
      <mesh position={[0, height * 0.5, 0]} onClick={handleClick}>
        <boxGeometry args={[width, height, width]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <group onClick={handleClick}>
        <NpcCharacter kind={kind} scale={scale} waving={waving || !!gather} walkAxis={walkAxis} gather={gather} />
      </group>

      {/* 이름 · 역할 */}
      {showName ? (
      <Html position={[0, height + 0.34, 0]} center distanceFactor={26} zIndexRange={[8, 20]}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            pointerEvents: "none",
            whiteSpace: "nowrap",
            fontFamily: "system-ui, -apple-system, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
          }}
        >
          <span
            style={{
              background: "rgba(255,255,255,0.94)",
              border: `1.5px solid ${accent}`,
              color: "#1e2b1a",
              borderRadius: 999,
              padding: "2px 9px",
              fontSize: 12,
              fontWeight: 700,
              boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
            }}
          >
            {name}
          </span>
          <span
            style={{
              background: "rgba(30,43,26,0.72)",
              color: "#f2f7ee",
              borderRadius: 999,
              padding: "1px 7px",
              fontSize: 9.5,
              letterSpacing: "0.02em",
            }}
          >
            {role}
          </span>
        </div>
      </Html>

      ) : null}

      {/* 근접 안내 */}
      {hint ? (
        <Html position={[0, height * 0.55, 0]} center distanceFactor={22} zIndexRange={[6, 18]}>
          <div
            style={{
              background: "rgba(255,255,255,0.9)",
              color: "#3d5236",
              borderRadius: 999,
              padding: "3px 9px",
              fontSize: 10,
              fontWeight: 600,
              whiteSpace: "nowrap",
              pointerEvents: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.16)",
            }}
          >
            클릭하면 인사해요
          </div>
        </Html>
      ) : null}

      {/* 대사 말풍선 — 원본 일러스트 썸네일 함께 */}
      {active ? (
        <Html position={[0, height + 1.1, 0]} center distanceFactor={17} zIndexRange={[9, 22]}>
          <div
            style={{
              background: "rgba(255,255,255,0.97)",
              border: `2px solid ${accent}`,
              borderRadius: 14,
              padding: "8px 11px",
              width: 236,
              boxSizing: "border-box",
              display: "flex",
              gap: 8,
              alignItems: "flex-start",
              color: "#1e1b18",
              boxShadow: "0 4px 16px rgba(0,0,0,0.22)",
              pointerEvents: "none",
              fontFamily: "system-ui, -apple-system, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
            }}
          >
            <img
              src={textureUrl}
              alt={name}
              style={{
                width: 40,
                height: 40,
                objectFit: "contain",
                flexShrink: 0,
                borderRadius: 8,
                background: "rgba(240,236,224,0.6)",
              }}
            />
            <div style={{ fontSize: 11.5, lineHeight: 1.55, textAlign: "left", wordBreak: "keep-all" }}>
              {lines[lineIdx]}
              <div style={{ fontSize: 9, color: "#8a8a8a", marginTop: 4 }}>
                {lineIdx + 1}/{lines.length} · 클릭해서 다음
              </div>
            </div>
          </div>
        </Html>
      ) : null}
    </group>
  );
}
