"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import VisitorAvatar, { AVATAR_LABEL_HEIGHT } from "./VisitorAvatar";
import { terrainHeight, type FarmId } from "./terrain";
import type { Peer } from "./useFarmPresence";

function PeerAvatar({ peer, farm }: { peer: Peer; farm: FarmId }) {
  const groupRef = useRef<THREE.Group>(null);
  const posRef = useRef(new THREE.Vector3(peer.x, 0, peer.z));
  const yawRef = useRef(peer.ry);
  const movingRef = useRef({ moving: peer.moving });

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.06);
    movingRef.current.moving = peer.moving;

    // 수신 좌표로 부드럽게 보간 (끊김 없이 따라오게)
    const k = 1 - Math.exp(-9 * dt);
    posRef.current.x += (peer.x - posRef.current.x) * k;
    posRef.current.z += (peer.z - posRef.current.z) * k;

    let diff = ((peer.ry - yawRef.current + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
    yawRef.current += diff * k;

    const g = groupRef.current;
    if (g) {
      const y = terrainHeight(farm, posRef.current.x, posRef.current.z);
      const bob = peer.moving ? Math.abs(Math.sin(state.clock.elapsedTime * 6)) * 0.02 : 0;
      g.position.set(posRef.current.x, y + bob, posRef.current.z);
      g.rotation.y = yawRef.current;
    }
  });

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
}: {
  farm: FarmId;
  peerIds: string[];
  peersRef: React.RefObject<Map<string, Peer>>;
}) {
  return (
    <>
      {peerIds.map((id) => {
        const peer = peersRef.current?.get(id);
        if (!peer) return null;
        return <PeerAvatar key={id} peer={peer} farm={farm} />;
      })}
    </>
  );
}
