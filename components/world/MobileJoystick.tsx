"use client";
import { useEffect, useRef } from "react";

interface JoystickState {
  x: number;
  y: number;
}

interface MobileJoystickProps {
  joystickRef: React.MutableRefObject<JoystickState>;
}

const RADIUS = 48;

export default function MobileJoystick({ joystickRef }: MobileJoystickProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(false);
  const startRef = useRef({ x: 0, y: 0 });
  const touchIdRef = useRef<number | null>(null);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const reset = () => {
      activeRef.current = false;
      touchIdRef.current = null;
      inner.style.transform = "translate(0px, 0px)";
      joystickRef.current = { x: 0, y: 0 };
    };

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      if (touchIdRef.current !== null) return;
      const t = e.changedTouches[0];
      touchIdRef.current = t.identifier;
      activeRef.current = true;
      startRef.current = { x: t.clientX, y: t.clientY };
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (!activeRef.current || touchIdRef.current === null) return;
      let t: Touch | null = null;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchIdRef.current) {
          t = e.changedTouches[i];
          break;
        }
      }
      if (!t) return;

      const dx = t.clientX - startRef.current.x;
      const dy = t.clientY - startRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const clamp = Math.min(dist, RADIUS);
      const angle = Math.atan2(dy, dx);
      const nx = Math.cos(angle) * clamp;
      const ny = Math.sin(angle) * clamp;

      inner.style.transform = `translate(${nx}px, ${ny}px)`;
      joystickRef.current = {
        x: parseFloat((nx / RADIUS).toFixed(2)),
        y: parseFloat((ny / RADIUS).toFixed(2)),
      };
    };

    const onTouchEnd = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchIdRef.current) {
          reset();
          break;
        }
      }
    };

    outer.addEventListener("touchstart", onTouchStart, { passive: false });
    outer.addEventListener("touchmove", onTouchMove, { passive: false });
    outer.addEventListener("touchend", onTouchEnd, { passive: false });
    outer.addEventListener("touchcancel", onTouchEnd, { passive: false });

    return () => {
      outer.removeEventListener("touchstart", onTouchStart);
      outer.removeEventListener("touchmove", onTouchMove);
      outer.removeEventListener("touchend", onTouchEnd);
      outer.removeEventListener("touchcancel", onTouchEnd);
      reset();
    };
  }, [joystickRef]);

  return (
    <div
      ref={outerRef}
      style={{
        position: "fixed",
        bottom: "88px",
        left: "24px",
        zIndex: 30,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: `${RADIUS * 2 + 16}px`,
        height: `${RADIUS * 2 + 16}px`,
        borderRadius: "50%",
        background: "rgba(0,0,0,0.28)",
        border: "2px solid rgba(255,255,255,0.35)",
        touchAction: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      <div
        ref={innerRef}
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.75)",
          border: "2px solid rgba(255,255,255,0.95)",
          pointerEvents: "none",
          transition: "none",
          flexShrink: 0,
        }}
      />
    </div>
  );
}
