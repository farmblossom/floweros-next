"use client";
import * as THREE from "three";

export type FaceStyle = "potato" | "dangoma" | "kkuloma" | "jjongoma" | "fm";

const cache = new Map<FaceStyle, THREE.CanvasTexture>();

/**
 * 원본 일러스트의 얼굴(큰 눈 + 흰 하이라이트 + 홍조 + 입)을
 * 캔버스에 그려 투명 텍스처로 만든다. 3D 얼굴 앞에 얹어 원본 느낌을 살린다.
 */
export function getFaceTexture(style: FaceStyle): THREE.CanvasTexture {
  const cached = cache.get(style);
  if (cached) return cached;

  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    const empty = new THREE.CanvasTexture(canvas);
    cache.set(style, empty);
    return empty;
  }

  ctx.clearRect(0, 0, size, size);

  const ink = "#2b2118";
  const eyeY = 206;
  const gap = style === "potato" ? 102 : 92;
  // 퍼뜨기·쑤담이는 정면에서 또렷한 동그란 눈 (가로·세로 반지름 동일)
  const round = style === "potato";
  const eyeRx = round ? 41 : 32;
  const eyeRy = round ? 41 : 40;

  // 눈 — 큰 검은 타원 + 흰 하이라이트
  [-1, 1].forEach((dir) => {
    const cx = 256 + dir * gap;
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.ellipse(cx, eyeY, eyeRx, eyeRy, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.beginPath();
    ctx.ellipse(cx + eyeRx * 0.32, eyeY - eyeRy * 0.36, eyeRx * 0.3, eyeRy * 0.24, -0.3, 0, Math.PI * 2);
    ctx.fill();
  });

  // 볼터치
  ctx.fillStyle = style === "dangoma" ? "rgba(226,142,150,0.55)" : "rgba(244,166,166,0.5)";
  [-1, 1].forEach((dir) => {
    ctx.beginPath();
    ctx.ellipse(256 + dir * (gap + 62), 268, 40, 24, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  // 입
  ctx.strokeStyle = ink;
  ctx.lineCap = "round";
  if (style === "kkuloma" || style === "jjongoma") {
    // 벌린 웃는 입 + 분홍 혀
    ctx.fillStyle = "#4a2a20";
    ctx.beginPath();
    ctx.ellipse(256, 300, 44, 34, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f19a9a";
    ctx.beginPath();
    ctx.ellipse(256, 316, 26, 15, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.lineWidth = 11;
    ctx.beginPath();
    ctx.moveTo(216, 288);
    ctx.quadraticCurveTo(256, 326, 296, 288);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  cache.set(style, texture);
  return texture;
}
