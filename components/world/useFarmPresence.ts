"use client";
import { useEffect, useRef, useState } from "react";
import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import type { PlayerPosition } from "./terrain";
import {
  safePose,
  safeShirt,
  safeType,
  type VisitorLook,
  type VisitorPose,
} from "./VisitorAvatar";

export type PresenceStatus = "off" | "connecting" | "live" | "error";

export interface Peer {
  id: string;
  name: string;
  /** 닉네임 · 타입 · 옷 색 · 밀짚모자 */
  look: VisitorLook;
  /** 서기 · 앉기 · 구부리기 */
  pose: VisitorPose;
  /** 현재 렌더 위치 (수신 즉시 목표값으로) */
  x: number;
  y: number;
  z: number;
  ry: number;
  moving: boolean;
  seenAt: number;
}

interface PosPayload {
  s?: string;
  n?: string;
  /** 아바타 타입 */
  t?: string;
  /** 옷 색 id */
  c?: string;
  /** 밀짚모자 (1/0) */
  h?: number;
  /** 자세 */
  p?: string;
  x?: number;
  y?: number;
  z?: number;
  r?: number;
  m?: boolean;
}

export const DEFAULT_VISITOR_NAME = "방문객";

/** 닉네임이 비어 있으면 기본 이름으로 */
export function fallbackName(name: string) {
  const trimmed = (name ?? "").trim();
  return trimmed ? trimmed.slice(0, 12) : DEFAULT_VISITOR_NAME;
}

export function realtimeEnv(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes("YOUR_PROJECT_REF")) return null;
  return { url, key };
}

/**
 * 같은 농장에 동시에 접속한 방문자들의 위치·아바타·자세를 Supabase Realtime Presence/Broadcast 로 주고받는다.
 * 환경변수나 연결이 없으면 조용히 꺼지고(단독 모드) 3D 농장은 그대로 동작한다.
 */
export default function useFarmPresence({
  farmId,
  look,
  pose,
  playerRef,
  headingRef,
  movingRef,
  enabled = true,
}: {
  farmId: string;
  look: VisitorLook;
  pose: VisitorPose;
  playerRef: React.RefObject<PlayerPosition>;
  headingRef: React.RefObject<number>;
  movingRef: React.RefObject<{ moving: boolean }>;
  enabled?: boolean;
}) {
  const peersRef = useRef<Map<string, Peer>>(new Map());
  const [peerIds, setPeerIds] = useState<string[]>([]);
  /** 닉네임·모습·자세가 바뀔 때만 올라가는 버전 (위치는 매 프레임 ref에서 읽는다) */
  const [peerLookVersion, setPeerLookVersion] = useState(0);
  const [online, setOnline] = useState(1);
  const [status, setStatus] = useState<PresenceStatus>("off");
  const selfIdRef = useRef<string>("");
  const lookRef = useRef<VisitorLook>(look);
  const poseRef = useRef<VisitorPose>(pose);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const name = fallbackName(look.name);

  useEffect(() => {
    lookRef.current = look;
    poseRef.current = pose;
  }, [look, pose]);

  useEffect(() => {
    if (!enabled) return;
    const env = realtimeEnv();
    if (!env) {
      setStatus("off");
      return;
    }
    setStatus("connecting");

    let client: SupabaseClient | null = null;
    let channel: RealtimeChannel | null = null;
    let sendTimer: number | null = null;
    let pruneTimer: number | null = null;
    let reconnectTimer: number | null = null;
    let disposed = false;

    const syncPeerIds = () => {
      setPeerIds(Array.from(peersRef.current.keys()));
    };

    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `v-${Math.random().toString(36).slice(2, 10)}`;
    selfIdRef.current = id;
    const nickname = fallbackName(lookRef.current.name);

    const trackSelf = () => {
      if (!channel) return;
      void channel.track({
        name: nickname,
        type: lookRef.current.type,
        shirt: lookRef.current.shirt,
        strawHat: lookRef.current.strawHat,
        pose: poseRef.current,
      });
    };

    (async () => {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        client = createClient(env.url, env.key, {
          auth: { persistSession: false, autoRefreshToken: false },
          realtime: { params: { eventsPerSecond: 20 } },
        });
        if (disposed) return;

        channel = client.channel(`world:${farmId}`, {
          config: {
            presence: { key: id },
            broadcast: { self: false, ack: false },
          },
        });
        channelRef.current = channel;

        channel.on("broadcast", { event: "pos" }, (msg) => {
          const p = (msg.payload ?? {}) as PosPayload;
          if (!p.s || p.s === selfIdRef.current) return;
          const prev = peersRef.current.get(p.s);
          const peerLook = {
            name: (p.n ?? DEFAULT_VISITOR_NAME).toString().slice(0, 12),
            type: safeType(p.t),
            shirt: safeShirt(p.c),
            strawHat: p.h !== 0,
          };
          const peer: Peer = {
            id: p.s,
            name: peerLook.name,
            look: peerLook,
            pose: safePose(p.p),
            // 옷 색·모자·자세가 바뀌면 즉시 반영 (위치는 부드럽게 보간)
            x: typeof p.x === "number" ? p.x : (prev?.x ?? 0),
            y: typeof p.y === "number" ? p.y : (prev?.y ?? 0),
            z: typeof p.z === "number" ? p.z : (prev?.z ?? 0),
            ry: typeof p.r === "number" ? p.r : (prev?.ry ?? 0),
            moving: !!p.m,
            seenAt: Date.now(),
          };
          const isNew = !prev;
          peersRef.current.set(p.s, peer);
          if (isNew) {
            syncPeerIds();
          } else if (
            prev &&
            (prev.look.type !== peer.look.type ||
              prev.look.shirt !== peer.look.shirt ||
              prev.look.strawHat !== peer.look.strawHat ||
              prev.name !== peer.name ||
              prev.pose !== peer.pose)
          ) {
            // 옷·모자·자세·이름이 바뀌면 그려 주는 쪽도 다시 그린다
            setPeerLookVersion((v) => v + 1);
          }
        });

        const recount = () => {
          if (!channel) return;
          const state = channel.presenceState() as Record<string, unknown[]>;
          const count = Object.keys(state).length;
          setOnline(Math.max(1, count));
        };

        channel.on("presence", { event: "sync" }, () => {
          if (channel) {
            const state = channel.presenceState() as Record<string, unknown[]>;
            const alive = new Set(Object.keys(state));
            let changed = false;
            for (const key of Array.from(peersRef.current.keys())) {
              if (!alive.has(key)) {
                peersRef.current.delete(key);
                changed = true;
              }
            }
            if (changed) syncPeerIds();
          }
          recount();
        });
        channel.on("presence", { event: "leave" }, () => recount());

        channel.subscribe(function onState(state) {
          if (disposed) return;
          if (state === "SUBSCRIBED") {
            setStatus("live");
            trackSelf();
            // 연결되면 바로 한 번 알리고, 이후 100ms 주기로 위치·모습을 보낸다
            const send = () => {
              const p = playerRef.current;
              if (!p || !channel) return;
              const l = lookRef.current;
              void channel.send({
                type: "broadcast",
                event: "pos",
                payload: {
                  s: id,
                  n: fallbackName(l.name),
                  t: l.type,
                  c: l.shirt,
                  h: l.strawHat ? 1 : 0,
                  p: poseRef.current,
                  x: Number(p.x.toFixed(2)),
                  y: Number((p.y ?? 0).toFixed(2)),
                  z: Number(p.z.toFixed(2)),
                  r: Number((headingRef.current ?? 0).toFixed(2)),
                  m: !!movingRef.current?.moving,
                } satisfies PosPayload,
              });
            };
            send();
            if (sendTimer === null) sendTimer = window.setInterval(send, 100);
          } else if (state === "CHANNEL_ERROR" || state === "TIMED_OUT" || state === "CLOSED") {
            // 끊겼으면 조용히 다시 붙는다 (잠깐의 오류로 혼자 보는 상태가 남지 않게)
            if (sendTimer !== null) {
              window.clearInterval(sendTimer);
              sendTimer = null;
            }
            setStatus((prev) => (prev === "live" ? "error" : prev));
            if (reconnectTimer === null && !disposed) {
              reconnectTimer = window.setTimeout(() => {
                reconnectTimer = null;
                if (disposed || !channel) return;
                try {
                  void channel.subscribe(onState);
                } catch {
                  /* 다음 자동 재시도에서 */
                }
              }, 3000);
            }
          }
        });

        // 6초 넘게 소식이 없는 사람은 화면에서 내린다
        if (pruneTimer === null) {
          pruneTimer = window.setInterval(() => {
            const now = Date.now();
            let changed = false;
            for (const [key, peer] of peersRef.current) {
              if (now - peer.seenAt > 6000) {
                peersRef.current.delete(key);
                changed = true;
              }
            }
            if (changed) syncPeerIds();
          }, 2000);
        }
      } catch {
        if (!disposed) setStatus("error");
      }
    })();

    return () => {
      disposed = true;
      if (sendTimer !== null) window.clearInterval(sendTimer);
      if (pruneTimer !== null) window.clearInterval(pruneTimer);
      if (reconnectTimer !== null) window.clearTimeout(reconnectTimer);
      peersRef.current.clear();
      try {
        if (channel) void channel.unsubscribe();
      } catch {
        /* 이미 끊겼으면 그대로 */
      }
      channelRef.current = null;
    };
  }, [farmId, enabled, playerRef, headingRef, movingRef]);

  // 이름·모습이 바뀌면 presence 정보도 갱신 (같은 농장 방문자 목록)
  useEffect(() => {
    const channel = channelRef.current;
    if (!channel) return;
    void channel.track({
      name,
      type: look.type,
      shirt: look.shirt,
      strawHat: look.strawHat,
      pose,
    });
  }, [name, look.type, look.shirt, look.strawHat, pose]);

  return { peersRef, peerIds, peerLookVersion, online, status, selfName: name, selfId: selfIdRef.current };
}
