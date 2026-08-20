"use client";

import { useRef, useState } from "react";
import SimFrame from "@/components/concepts/SimFrame";
import { LabeledSlider, Readout, SimControls, ResetButton } from "@/components/concepts/controls";
import { useCanvas, SIM, clearPanel, label, circle } from "@/components/concepts/useCanvas";

const COLS = 12;
const ROWS = 8;
const N0 = COLS * ROWS;

/** Radioactive decay: individual nuclei flip stochastically while the smooth N(t) curve emerges. */
export default function DecaySim() {
  const [halfLife, setHalfLife] = useState(5);

  const lam = Math.LN2 / halfLife;

  const state = useRef({ t: 0, alive: Array<boolean>(N0).fill(true), pts: [] as { t: number; n: number }[], hold: 0 });
  const params = useRef({ halfLife });
  if (params.current.halfLife !== halfLife) {
    params.current = { halfLife };
    state.current = { t: 0, alive: Array<boolean>(N0).fill(true), pts: [], hold: 0 };
  }

  const canvasRef = useCanvas((ctx, w, h, _t, dt) => {
    const s = state.current;
    const tMax = halfLife * 5;
    const alive = s.alive.filter(Boolean).length;

    if (s.t < tMax && alive > 2) {
      s.t += dt;
      const pDecay = 1 - Math.exp(-lam * dt);
      for (let i = 0; i < N0; i++) {
        if (s.alive[i] && Math.random() < pDecay) s.alive[i] = false;
      }
      s.pts.push({ t: s.t, n: s.alive.filter(Boolean).length });
    } else {
      s.hold += dt;
      if (s.hold > 2.2) {
        state.current = { t: 0, alive: Array<boolean>(N0).fill(true), pts: [], hold: 0 };
      }
    }

    clearPanel(ctx, w, h, false);

    // ── nuclei grid (left) ──
    const gx = 30, gy = 34;
    const cell = Math.min(22, (h - 70) / ROWS);
    const nowAlive = s.alive.filter(Boolean).length;
    for (let i = 0; i < N0; i++) {
      const x = gx + (i % COLS) * cell;
      const y = gy + Math.floor(i / COLS) * cell;
      if (s.alive[i]) circle(ctx, x, y, cell * 0.28, SIM.green, true);
      else {
        ctx.save();
        ctx.strokeStyle = "rgba(248,113,113,0.55)";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(x, y, cell * 0.28, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - 3, y - 3);
        ctx.lineTo(x + 3, y + 3);
        ctx.moveTo(x + 3, y - 3);
        ctx.lineTo(x - 3, y + 3);
        ctx.stroke();
        ctx.restore();
      }
    }
    label(ctx, "parent nuclei — decay is random per nucleus", gx, 18, SIM.dim, 9);
    label(ctx, `${nowAlive} alive / ${N0}`, gx + COLS * cell, h - 26, SIM.text, 10, "right");

    // ── N(t) plot (right) ──
    const px0 = gx + COLS * cell + 30;
    const px1 = w - 30;
    const py0 = 34, py1 = h - 44;
    if (px1 - px0 > 80) {
      ctx.save();
      ctx.strokeStyle = SIM.axis;
      ctx.beginPath();
      ctx.moveTo(px0, py1);
      ctx.lineTo(px1, py1);
      ctx.moveTo(px0, py0);
      ctx.lineTo(px0, py1);
      ctx.stroke();
      // half-life gridlines: N halves every T½
      ctx.strokeStyle = "rgba(148,163,184,0.14)";
      ctx.setLineDash([2, 4]);
      for (let n = 1; n <= 4; n++) {
        const y = py1 - Math.pow(2, -n) * (py1 - py0);
        ctx.beginPath();
        ctx.moveTo(px0, y);
        ctx.lineTo(px1, y);
        ctx.stroke();
        label(ctx, `N₀/${2 ** n}`, px0 - 2, y, SIM.dim, 8, "right");
      }
      ctx.restore();
      // analytic curve
      ctx.save();
      ctx.strokeStyle = "rgba(129,140,248,0.5)";
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      for (let i = 0; i <= 100; i++) {
        const tt = (i / 100) * Math.min(s.t + 1, tMax);
        const x = px0 + (tt / tMax) * (px1 - px0);
        const y = py1 - Math.exp(-lam * tt) * (py1 - py0);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
      // simulated points
      ctx.save();
      ctx.strokeStyle = SIM.green;
      ctx.lineWidth = 2;
      ctx.shadowColor = SIM.green;
      ctx.shadowBlur = 5;
      ctx.beginPath();
      s.pts.forEach((p, i) => {
        const x = px0 + (p.t / tMax) * (px1 - px0);
        const y = py1 - (p.n / N0) * (py1 - py0);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.restore();
      label(ctx, "N(t)  — dashed: N₀e^(−λt)", px1, py0 - 12, SIM.dim, 9, "right");
      label(ctx, "t →", px1, py1 + 12, SIM.dim, 9, "right");
    }
  });

  return (
    <SimFrame
      title="Radioactive decay"
      about="96 nuclei, one coin-flip each per instant — individual randomness, collective exponential"
      height={320}
      canvas={<canvas ref={canvasRef} />}
      controls={
        <SimControls>
          <LabeledSlider label="Half-life T½ (s)" value={halfLife} min={1} max={12} step={0.5} decimals={1} onChange={setHalfLife} color="#34d399" />
          <ResetButton onClick={() => { state.current = { t: 0, alive: Array<boolean>(N0).fill(true), pts: [], hold: 0 }; }} />
        </SimControls>
      }
      readouts={
        <>
          <Readout label="Decay constant λ" value={`${lam.toFixed(3)} s⁻¹`} color="#818cf8" />
          <Readout label="N(t)" value={`${N0}·2^(−t/T½)`} />
          <Readout label="Activity A" value="λN — falls with N" color="#fbbf24" />
          <Readout label="Rule" value="after n half-lives: N₀/2ⁿ" color="#38bdf8" />
        </>
      }
    />
  );
}
