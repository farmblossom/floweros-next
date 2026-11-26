"use client";
import { useEffect, useRef, useState } from "react";
import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import type { PlayerPosition } from "./terrain";
import type { AvatarPresetId } from "./VisitorAvatar";

export type PresenceStatus = "off" | "connecting" | "live" | "error";

export interface Peer {
  id: string;
  name: string;
  avatar: AvatarPresetId;
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
  a?: string;
  x?: number;
  y?: number;
  z?: number;
  r?: number;
  m?: boolean;
}

const AVATAR_IDS: AvatarPresetId[] = ["farmer", "farmerette", "kid"];

function safeAvatar(v: unknown): AvatarPresetId {
  return AVATAR_IDS.includes(v as AvatarPresetId) ? (v as AvatarPresetId) : "farmer";
}

function readOrCreateNickname() {
  const fallback = `방문객 ${Math.floor(Math.random() * 89) + 10}`;
  try {
    const saved = window.localStorage.getItem("floweros:visitor-name");
    if (saved && saved.trim()) return saved.trim().slice(0, 12);
    window.localStorage.setItem("floweros:visitor-name", fallback);
  } catch {
    /* 저장 못 해도 이번 방문은 그대로 진행 */
  }
  return fallback;
}

export function realtimeEnv(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes("YOUR_PROJECT_REF")) return null;
  return { url, key };
}

/**
 * 같은 농장에 동시에 접속한 방문자들의 위치·아바타를 Supabase Realtime Presence/Broadcast 로 주고받는다.
 * 환경변수나 연결이 없으면 조용히 꺼지고(단독 모드) 3D 농장은 그대로 동작한다.
 */
export default function useFarmPresence({
  farmId,
  avatar,
  playerRef,
  headingRef,
  movingRef,
  enabled = true,
}: {
  farmId: string;
  avatar: AvatarPresetId;
  playerRef: React.RefObject<PlayerPosition>;
  headingRef: React.RefObject<number>;
  movingRef: React.RefObject<{ moving: boolean }>;
  enabled?: boolean;
}) {
  const peersRef = useRef<Map<string, Peer>>(new Map());
  const [peerIds, setPeerIds] = useState<string[]>([]);
  const [online, setOnline] = useState(1);
  const [status, setStatus] = useState<PresenceStatus>("off");
  const [selfName, setSelfName] = useState("방문객");
  const selfIdRef = useRef<string>("");
  const avatarRef = useRef<AvatarPresetId>(avatar);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    avatarRef.current = avatar;
  }, [avatar]);

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
    let disposed = false;

    const syncPeerIds = () => {
      setPeerIds(Array.from(peersRef.current.keys()));
    };

    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `v-${Math.random().toString(36).slice(2, 10)}`;
    selfIdRef.current = id;
    const name = readOrCreateNickname();
    setSelfName(name);

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
          const peer: Peer = {
            id: p.s,
            name: (p.n ?? "방문객").toString().slice(0, 12),
            avatar: safeAvatar(p.a),
            x: typeof p.x === "number" ? p.x : (prev?.x ?? 0),
            y: typeof p.y === "number" ? p.y : (prev?.y ?? 0),
            z: typeof p.z === "number" ? p.z : (prev?.z ?? 0),
            ry: typeof p.r === "number" ? p.r : (prev?.ry ?? 0),
            moving: !!p.m,
            seenAt: Date.now(),
          };
          const isNew = !prev;
          peersRef.current.set(p.s, peer);
          if (isNew) syncPeerIds();
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

        channel.subscribe((state) => {
          if (disposed) return;
          if (state === "SUBSCRIBED") {
            setStatus("live");
            void channel?.track({ name, avatar: avatarRef.current });
            // 연결되면 바로 한 번 알리고, 이후 100ms 주기로 위치를 보낸다
            const send = () => {
              const p = playerRef.current;
              if (!p || !channel) return;
              void channel.send({
                type: "broadcast",
                event: "pos",
                payload: {
                  s: id,
                  n: name,
                  a: avatarRef.current,
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
          } else if (state === "CHANNEL_ERROR" || state === "TIMED_OUT") {
            setStatus("error");
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
      peersRef.current.clear();
      try {
        if (channel) void channel.unsubscribe();
      } catch {
        /* 이미 끊겼으면 그대로 */
      }
      channelRef.current = null;
    };
  }, [farmId, enabled, playerRef, headingRef, movingRef]);

  return { peersRef, peerIds, online, status, selfName, selfId: selfIdRef.current };
}
