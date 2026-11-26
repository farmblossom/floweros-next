"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type PhotoFrameStyle = "polaroid" | "clean" | "stamp";

const FRAMES: { id: PhotoFrameStyle; label: string; icon: string }[] = [
  { id: "polaroid", label: "폴라로이드", icon: "photo_size_select_large" },
  { id: "clean", label: "깔끔 워터마크", icon: "branding_watermark" },
  { id: "stamp", label: "로고 스탬프", icon: "verified" },
];

const FONT = "'Apple SD Gothic Neo', 'Malgun Gothic', system-ui, sans-serif";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("이미지를 읽지 못했습니다"));
    img.src = src;
  });
}

function dateLabel(d = new Date()) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function fileLabel(farmName: string, d = new Date()) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `꽃폈네_${farmName.replace(/\s+/g, "")}_${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}_${p(
    d.getHours()
  )}${p(d.getMinutes())}.png`;
}

/** 캡처한 화면에 프레임·워터마크를 입혀 최종 PNG 로 만든다 */
export async function composePhoto(
  raw: string,
  opts: { style: PhotoFrameStyle; farmName: string; spotLabel?: string | null }
): Promise<string> {
  const img = await loadImage(raw);
  const W = img.naturalWidth;
  const H = img.naturalHeight;
  const when = dateLabel();
  const line2 = opts.spotLabel ? `${opts.farmName} · ${opts.spotLabel}` : opts.farmName;

  if (opts.style === "polaroid") {
    const pad = Math.round(W * 0.016);
    const bottom = Math.round(W * 0.07) + pad;
    const canvas = document.createElement("canvas");
    canvas.width = W + pad * 2;
    canvas.height = H + pad + bottom;
    const ctx = canvas.getContext("2d");
    if (!ctx) return raw;
    ctx.fillStyle = "#fdfbf5";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.shadowColor = "rgba(60,45,25,0.18)";
    ctx.shadowBlur = Math.round(W * 0.012);
    ctx.drawImage(img, pad, pad, W, H);
    ctx.shadowBlur = 0;

    const baseY = pad + H;
    ctx.fillStyle = "#2c2a22";
    ctx.textAlign = "left";
    ctx.font = `700 ${Math.round(W * 0.021)}px ${FONT}`;
    ctx.fillText(`꽃폈네 · ${opts.farmName}`, pad + Math.round(W * 0.006), baseY + Math.round(W * 0.03));
    ctx.fillStyle = "#7a7568";
    ctx.font = `500 ${Math.round(W * 0.0155)}px ${FONT}`;
    ctx.fillText(when, pad + Math.round(W * 0.006), baseY + Math.round(W * 0.052));
    ctx.textAlign = "right";
    ctx.fillStyle = "#3f6b34";
    ctx.font = `700 ${Math.round(W * 0.0165)}px ${FONT}`;
    ctx.fillText("farmblossom.kr", canvas.width - pad - Math.round(W * 0.006), baseY + Math.round(W * 0.037));
    return canvas.toDataURL("image/png");
  }

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return raw;
  ctx.drawImage(img, 0, 0, W, H);

  if (opts.style === "clean") {
    const barH = Math.round(H * 0.075) + Math.round(H * 0.02);
    const grad = ctx.createLinearGradient(0, H - barH, 0, H);
    grad.addColorStop(0, "rgba(12,18,10,0)");
    grad.addColorStop(1, "rgba(12,18,10,0.62)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, H - barH, W, barH);

    const fs = Math.round(W * 0.0185);
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(255,255,255,0.96)";
    ctx.font = `700 ${fs}px ${FONT}`;
    ctx.fillText("꽃폈네", Math.round(W * 0.028), H - Math.round(H * 0.038));
    ctx.fillStyle = "rgba(255,255,255,0.72)";
    ctx.font = `500 ${Math.round(fs * 0.78)}px ${FONT}`;
    ctx.fillText(`${line2} · ${when}`, Math.round(W * 0.028) + ctx.measureText("꽃폈네").width + fs * 0.9, H - Math.round(H * 0.038));
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.font = `600 ${Math.round(fs * 0.8)}px ${FONT}`;
    ctx.fillText("farmblossom.kr", W - Math.round(W * 0.028), H - Math.round(H * 0.038));
    return canvas.toDataURL("image/png");
  }

  // stamp — 오른쪽 아래 로고 배지
  const pad = Math.round(W * 0.024);
  const fs = Math.round(W * 0.0165);
  const text = `꽃폈네 · farmblossom.kr · ${when}`;
  ctx.font = `700 ${fs}px ${FONT}`;
  const tw = ctx.measureText(text).width;
  const bw = tw + fs * 2.1;
  const bh = fs * 2.1;
  const x = W - pad - bw;
  const y = H - pad - bh;

  ctx.fillStyle = "rgba(12,18,10,0.52)";
  const r = bh / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + bw - r, y);
  ctx.arc(x + bw - r, y + r, r, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(x + r, y + bh);
  ctx.arc(x + r, y + r, r, Math.PI / 2, (Math.PI * 3) / 2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.94)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + bw / 2, y + bh / 2 + fs * 0.04);
  return canvas.toDataURL("image/png");
}

/** 셔터 소리 — 오디오 파일 없이 짧은 노이즈 두 번 */
export function playShutter() {
  try {
    type AudioCtor = typeof AudioContext;
    const w = window as unknown as { AudioContext?: AudioCtor; webkitAudioContext?: AudioCtor };
    const Ctor = w.AudioContext ?? w.webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    const now = ctx.currentTime;
    const burst = (start: number, len: number, gain: number, freq: number) => {
      const samples = Math.floor(ctx.sampleRate * len);
      const buffer = ctx.createBuffer(1, samples, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < samples; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / samples, 2.6);
      }
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = freq;
      filter.Q.value = 1.1;
      const g = ctx.createGain();
      g.gain.value = gain;
      src.connect(filter).connect(g).connect(ctx.destination);
      src.start(now + start);
    };
    burst(0, 0.05, 0.28, 2400);
    burst(0.075, 0.075, 0.2, 1500);
    window.setTimeout(() => void ctx.close(), 400);
  } catch {
    /* 소리는 실패해도 사진은 그대로 */
  }
}

interface PhotoStudioProps {
  raw: string | null;
  farmName: string;
  spotLabel?: string | null;
  onClose: () => void;
  onRetake: () => void;
}

/** 📷 사진 찍기 결과 미리보기 — 프레임 고르고 PNG 로 저장 */
export default function PhotoStudio({ raw, farmName, spotLabel, onClose, onRetake }: PhotoStudioProps) {
  const [style, setStyle] = useState<PhotoFrameStyle>("polaroid");
  const [composed, setComposed] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const linkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!raw) {
      setComposed(null);
      return;
    }
    let alive = true;
    setBusy(true);
    composePhoto(raw, { style, farmName, spotLabel })
      .then((out) => {
        if (alive) setComposed(out);
      })
      .catch(() => {
        if (alive) setComposed(raw);
      })
      .finally(() => {
        if (alive) setBusy(false);
      });
    return () => {
      alive = false;
    };
  }, [raw, style, farmName, spotLabel]);

  const fileName = useMemo(() => fileLabel(farmName), [farmName]);

  const download = useCallback(() => {
    if (!composed) return;
    const a = linkRef.current;
    if (a) {
      a.href = composed;
      a.download = fileName;
      a.click();
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2200);
    }
  }, [composed, fileName]);

  if (!raw) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center px-3 py-6 bg-black/72 backdrop-blur-sm">
      <a ref={linkRef} className="hidden" aria-hidden />
      <div className="w-full max-w-lg max-h-full flex flex-col rounded-3xl bg-[#1b2018]/95 border border-white/12 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-white">
            <span className="material-symbols-outlined text-[18px] text-[#b8e08a]">photo_camera</span>
            <span className="text-sm font-bold">기념사진 미리보기</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/70 hover:bg-white/10" aria-label="사진 닫기">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-3">
          <div className="relative rounded-2xl overflow-hidden bg-black/40 min-h-[180px] flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {composed ? <img src={composed} alt="농장 기념사진" className="w-full h-auto block" /> : null}
            {busy ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <span className="text-white/80 text-xs">사진 담는 중…</span>
              </div>
            ) : null}
          </div>

          <div className="mt-3 flex items-center gap-1.5">
            {FRAMES.map((f) => (
              <button
                key={f.id}
                onClick={() => setStyle(f.id)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] transition-colors ${
                  style === f.id ? "bg-white text-[#23301d] font-bold" : "bg-white/10 text-white/80 hover:bg-white/20"
                }`}
              >
                <span className="material-symbols-outlined text-[13px]">{f.icon}</span>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-3 pb-3 pt-2 flex items-center gap-2">
          <button
            onClick={onRetake}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/20"
          >
            <span className="material-symbols-outlined text-[15px]">refresh</span>
            다시 찍기
          </button>
          <button
            onClick={download}
            disabled={!composed}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#7fb04d] text-[#12200c] text-sm font-extrabold hover:bg-[#8cbd57] disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            {saved ? "저장했어요!" : "PNG 저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
