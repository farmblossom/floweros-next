"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import VisitorAvatar, { AVATAR_LABEL_HEIGHT } from "./VisitorAvatar";
import { terrainHeight, type FarmId } from "./terrain";
import type { Peer } from "./useFarmPresence";

/**
 * 다른 방문자 한 명 — 위치·방향은 매 프레임 ref에서 최신 값을 읽어 부드럽게 따라가고,
 * 옷·모자·자세·이름이 바뀌면 부모가 다시 그려 준다.
 */
function PeerAvatar({
  peerId,
  farm,
  peersRef,
}: {
  peerId: string;
  farm: FarmId;
  peersRef: React.RefObject<Map<string, Peer>>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const posRef = useRef<THREE.Vector3 | null>(null);
  const yawRef = useRef<number | null>(null);
  const movingRef = useRef({ moving: false });

  const peer = peersRef.current?.get(peerId);

  useFrame((state, delta) => {
    const live = peersRef.current?.get(peerId);
    if (!live) return;
    if (!posRef.current) {
      posRef.current = new THREE.Vector3(live.x, 0, live.z);
      yawRef.current = live.ry;
    }
    const dt = Math.min(delta, 0.06);
    const k = 1 - Math.exp(-9 * dt);
    const pos = posRef.current;
    pos.x += (live.x - pos.x) * k;
    pos.z += (live.z - pos.z) * k;
    movingRef.current.moving = live.moving;

    let diff = ((live.ry - (yawRef.current ?? 0) + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
    yawRef.current = (yawRef.current ?? 0) + diff * k;

    const g = groupRef.current;
    if (g) {
      const y = terrainHeight(farm, pos.x, pos.z);
      const bob = live.moving ? Math.abs(Math.sin(state.clock.elapsedTime * 6)) * 0.02 : 0;
      g.position.set(pos.x, y + bob, pos.z);
      g.rotation.y = yawRef.current;
    }
  });

  if (!peer) return null;

  return (
    <group ref={groupRef} position={[peer.x, 0, peer.z]}>
      <VisitorAvatar look={peer.look} pose={peer.pose} movingState={movingRef} />
      <Html
        position={[0, AVATAR_LABEL_HEIGHT[peer.look.type], 0]}
        center
        pointerEvents="none"
        zIndexRange={[7, 16]}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            background: "rgba(38,58,32,0.86)",
            color: "#f4f8ee",
            border: "1px solid rgba(255,255,255,0.35)",
            borderRadius: 999,
            padding: "1px 7px",
            fontSize: 9.5,
            fontWeight: 700,
            whiteSpace: "nowrap",
            pointerEvents: "none",
            fontFamily: "system-ui, -apple-system, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
          }}
        >
          <span style={{ fontSize: 8 }}>👥</span>
          {peer.name}
        </div>
      </Html>
    </group>
  );
}

/** 같은 농장에 접속한 다른 방문자들의 아바타 — 위치·방향·아바타·자세를 실시간으로 따라간다 */
export default function RemoteVisitors({
  farm,
  peerIds,
  peersRef,
  version = 0,
}: {
  farm: FarmId;
  peerIds: string[];
  peersRef: React.RefObject<Map<string, Peer>>;
  /** 닉네임·옷·모자·자세가 바뀌면 올라가는 값 (다시 그리기 트리거) */
  version?: number;
}) {
  return (
    <group key={version}>
      {peerIds.map((id) => (
        <PeerAvatar key={id} peerId={id} farm={farm} peersRef={peersRef} />
      ))}
    </group>
  );
}
