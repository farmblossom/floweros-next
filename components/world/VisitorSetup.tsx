"use client";
import { useEffect, useState } from "react";
import {
  AVATAR_TYPES,
  DEFAULT_LOOK,
  SHIRT_COLORS,
  type AvatarType,
  type VisitorLook,
} from "./VisitorAvatar";

interface VisitorSetupProps {
  open: boolean;
  /** entry — 처음 입장 카드 · edit — 다시 꾸미기 */
  mode: "entry" | "edit";
  initial: VisitorLook;
  onSave: (look: VisitorLook) => void;
  onClose: () => void;
}

/**
 * 입장 카드 — 닉네임 · 아바타 타입 · 옷 색 · 밀짚모자만 고르는 가벼운 카드.
 * 3D 화면 오른쪽 아래 '내 캐릭터' 버튼으로 언제든 다시 연다.
 */
export default function VisitorSetup({ open, mode, initial, onSave, onClose }: VisitorSetupProps) {
  const [name, setName] = useState(initial.name);
  const [type, setType] = useState<AvatarType>(initial.type);
  const [shirt, setShirt] = useState(initial.shirt);
  const [strawHat, setStrawHat] = useState(initial.strawHat);

  // 카드가 열릴 때마다 현재 모습으로 맞춘다
  useEffect(() => {
    if (!open) return;
    setName(initial.name);
    setType(initial.type);
    setShirt(initial.shirt);
    setStrawHat(initial.strawHat);
  }, [open, initial]);

  if (!open) return null;

  const submit = () => {
    onSave({
      ...DEFAULT_LOOK,
      name: name.trim().slice(0, 12),
      type,
      shirt,
      strawHat,
    });
  };

  return (
    <div
      className="absolute inset-0 z-[60] flex items-end justify-center bg-black/45 backdrop-blur-[2px] px-2 pb-2 sm:items-center sm:pb-0"
      role="dialog"
      aria-modal="true"
      aria-label="방문자 입장 카드"
    >
      <div className="w-full max-w-[420px] max-h-[92vh] overflow-y-auto rounded-3xl bg-[#1b2018]/97 border border-white/14 shadow-2xl">
        <div className="flex items-start justify-between gap-2 px-4 pt-4">
          <div>
            <p className="text-[10.5px] font-semibold tracking-[0.18em] text-[#b8e08a]">꽃폈네 농장</p>
            <h2 className="mt-0.5 text-[17px] font-extrabold text-white">
              {mode === "entry" ? "어떻게 불러 드릴까요?" : "내 캐릭터 꾸미기"}
            </h2>
            <p className="mt-1 text-[11px] leading-relaxed text-white/60" style={{ wordBreak: "keep-all" }}>
              닉네임은 아바타 머리 위 이름표로, 함께 접속한 방문자에게도 보여요.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 -mr-1 rounded-full text-white/60 hover:bg-white/10"
            aria-label="입장 카드 닫기"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="px-4 pt-3">
          {/* 닉네임 */}
          <label className="block">
            <span className="text-[11px] font-bold text-white/75">닉네임</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 12))}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
              placeholder="예: 초코송이"
              maxLength={12}
              className="mt-1 w-full rounded-xl bg-white/8 border border-white/15 px-3 py-2.5 text-[14px] font-semibold text-white placeholder:text-white/35 outline-none focus:border-[#8cbd57] focus:bg-white/12"
            />
          </label>

          {/* 타입 */}
          <div className="mt-3">
            <span className="text-[11px] font-bold text-white/75">캐릭터</span>
            <div className="mt-1 grid grid-cols-3 gap-1.5">
              {AVATAR_TYPES.map((t) => {
                const on = type === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setType(t.id)}
                    aria-pressed={on}
                    className={`flex flex-col items-center gap-0.5 rounded-xl px-1 py-2 border transition-colors ${
                      on
                        ? "bg-[#8cbd57]/22 border-[#8cbd57] text-white"
                        : "bg-white/6 border-white/12 text-white/75 hover:bg-white/12"
                    }`}
                  >
                    <span className="text-[20px] leading-none">{t.emoji}</span>
                    <span className="text-[11.5px] font-bold">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 옷 색 */}
          <div className="mt-3">
            <span className="text-[11px] font-bold text-white/75">옷 색깔</span>
            <div className="mt-1 flex items-start justify-between gap-1">
              {SHIRT_COLORS.map((c) => {
                const on = shirt === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setShirt(c.id)}
                    aria-pressed={on}
                    aria-label={`${c.label} 옷`}
                    className="flex flex-col items-center gap-1 flex-1"
                  >
                    <span
                      className={`block w-8 h-8 rounded-full transition-transform ${
                        on ? "ring-2 ring-white ring-offset-2 ring-offset-[#1b2018] scale-105" : "ring-1 ring-white/25"
                      }`}
                      style={{ background: c.color }}
                    />
                    <span className={`text-[9.5px] ${on ? "text-white font-bold" : "text-white/55"}`}>{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 밀짚모자 */}
          <button
            onClick={() => setStrawHat((v) => !v)}
            aria-pressed={strawHat}
            className="mt-3.5 w-full flex items-center justify-between rounded-xl bg-white/6 border border-white/12 px-3 py-2.5 hover:bg-white/10 transition-colors"
          >
            <span className="flex items-center gap-1.5 text-[12.5px] font-bold text-white">
              <span className="text-[15px]">👒</span> 밀짚모자
            </span>
            <span
              className={`relative w-11 h-6 rounded-full transition-colors ${
                strawHat ? "bg-[#8cbd57]" : "bg-white/20"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                  strawHat ? "left-[22px]" : "left-0.5"
                }`}
              />
            </span>
          </button>
        </div>

        <div className="px-4 pt-3.5 pb-4 flex items-center gap-2">
          <button
            onClick={onClose}
            className="px-3 py-2.5 rounded-xl bg-white/8 text-white/75 text-[12px] font-semibold hover:bg-white/14"
          >
            {mode === "entry" ? "그냥 둘러보기" : "닫기"}
          </button>
          <button
            onClick={submit}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#7fb04d] text-[#12200c] text-[14px] font-extrabold hover:bg-[#8cbd57]"
          >
            <span className="material-symbols-outlined text-[16px]">check</span>
            {mode === "entry" ? "이 모습으로 입장" : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
