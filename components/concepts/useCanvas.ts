"use client";

import { useEffect, useRef } from "react";

export type DrawFn = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  dt: number
) => void;

/**
 * Sets up a DPR-aware, auto-resizing canvas with a requestAnimationFrame loop.
 * The draw function is kept in a ref so state updates (sliders) never restart the loop.
 */
export function useCanvas(draw: DrawFn) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawRef = useRef(draw);
  drawRef.current = draw;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    let last = performance.now();
    const start = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      drawRef.current(ctx, w, h, (now - start) / 1000, dt);
      raf = requestAnimationFrame(loop);
    };

    // Skip drawing while the canvas is offscreen — sims below the fold
    // shouldn't burn rAF budget. `last` resets on resume so dt never jumps
    // past its clamp after a long pause.
    const stopLoop = () => {
      if (raf !== 0) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    const startLoop = () => {
      if (raf === 0) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? startLoop() : stopLoop()),
      { rootMargin: "120px" }
    );
    io.observe(canvas);
    startLoop();

    return () => {
      stopLoop();
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  return canvasRef;
}

/** Simulation color tokens — reference-grade: near-black panel, neutral text,
 *  Kanagawa jewel hues reserved for rays and data. */
export const SIM = {
  panel: "#0A0A0D",
  panelEdge: "rgba(255,255,255,0.12)",
  grid: "rgba(255,255,255,0.05)",
  axis: "rgba(255,255,255,0.28)",
  text: "#B9B9C2",
  bright: "#F4F4F5",
  dim: "#6F6F78",
  indigo: "#7E9CD8",
  green: "#98BB6C",
  amber: "#E6C384",
  red: "#E46876",
  sky: "#7FB4CA",
  fuchsia: "#D27E99",
  white: "#F4F4F5",
};

export function drawGrid(ctx: CanvasRenderingContext2D, w: number, h: number, step = 32) {
  ctx.save();
  ctx.strokeStyle = SIM.grid;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = step; x < w; x += step) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  for (let y = step; y < h; y += step) {
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  ctx.stroke();
  ctx.restore();
}

export function label(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color = SIM.text,
  size = 11,
  align: CanvasTextAlign = "left"
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = `${size}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
  ctx.restore();
}

export function circle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, fill: string, glow = false) {
  ctx.save();
  if (glow) {
    ctx.shadowColor = fill;
    ctx.shadowBlur = 12;
  }
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function arrow(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  width = 2
) {
  const head = 6 + width * 1.5;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 2) return;
  const ux = dx / len;
  const uy = dy / len;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2 - ux * head * 0.6, y2 - uy * head * 0.6);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - ux * head - uy * head * 0.35, y2 - uy * head * 0.35 + ux * head * 0.35);
  ctx.lineTo(x2 - ux * head + uy * head * 0.35, y2 - uy * head * 0.35 - ux * head * 0.35);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function roundPanel(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  ctx.fillStyle = SIM.panel;
  ctx.strokeStyle = SIM.panelEdge;
  ctx.lineWidth = 1;
  const r = 12;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.arcTo(w, 0, w, h, r);
  ctx.arcTo(w, h, 0, h, r);
  ctx.arcTo(0, h, 0, 0, r);
  ctx.arcTo(0, 0, w, 0, r);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

/** Fills the whole canvas with the sim panel color. Call first in every draw pass. */
export function clearPanel(ctx: CanvasRenderingContext2D, w: number, h: number, grid = true) {
  ctx.clearRect(0, 0, w, h);
  roundPanel(ctx, w, h);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, w, h);
  ctx.clip();
  if (grid) drawGrid(ctx, w, h);
  ctx.restore();
}
