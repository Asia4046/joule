"use client";

import { useRef, useState } from "react";
import SimFrame from "@/components/concepts/SimFrame";
import { LabeledSlider, Readout, SimControls, ResetButton } from "@/components/concepts/controls";
import { useCanvas, SIM, clearPanel, label, circle } from "@/components/concepts/useCanvas";

/** Two adjustable charges: field-line tracing + drifting test charges. */
export default function FieldLinesSim() {
  const [q1, setQ1] = useState(1);
  const [q2, setQ2] = useState(-1);
  const state = useRef({ probes: [] as { x: number; y: number; vx: number; vy: number }[] });

  const canvasRef = useCanvas((ctx, w, h, _t, dt) => {
    const s = state.current;
    const p1 = { x: w * 0.32, y: h / 2 };
    const p2 = { x: w * 0.68, y: h / 2 };
    const Q1 = q1 * 60;
    const Q2 = q2 * 60;

    const Efield = (x: number, y: number) => {
      let ex = 0, ey = 0;
      for (const [p, Q] of [[p1, Q1], [p2, Q2]] as const) {
        const dx = x - p.x;
        const dy = y - p.y;
        const r2 = dx * dx + dy * dy;
        const r = Math.sqrt(r2) + 4;
        const e = Q / r2;
        ex += (e * dx) / r;
        ey += (e * dy) / r;
      }
      return { ex, ey };
    };

    clearPanel(ctx, w, h);

    // field lines: from positive charges (or inward to negatives if no positive)
    const seeds: { x: number; y: number }[] = [];
    if (Q1 > 0 || Q2 > 0) {
      if (Q1 > 0) for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) seeds.push({ x: p1.x + Math.cos(a) * 12, y: p1.y + Math.sin(a) * 12 });
      if (Q2 > 0) for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) seeds.push({ x: p2.x + Math.cos(a) * 12, y: p2.y + Math.sin(a) * 12 });
    } else {
      if (Q1 < 0) for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) seeds.push({ x: p1.x + Math.cos(a) * 12, y: p1.y + Math.sin(a) * 12 });
      if (Q2 < 0) for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) seeds.push({ x: p2.x + Math.cos(a) * 12, y: p2.y + Math.sin(a) * 12 });
    }

    ctx.save();
    ctx.lineWidth = 1.2;
    seeds.forEach((seed) => {
      const dir = Q1 > 0 || Q2 > 0 ? 1 : -1;
      let { x, y } = seed;
      ctx.strokeStyle = "rgba(129,140,248,0.55)";
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let i = 0; i < 220; i++) {
        const { ex, ey } = Efield(x, y);
        const m = Math.hypot(ex, ey);
        if (m < 1e-4) break;
        x += (dir * ex * 3) / m;
        y += (dir * ey * 3) / m;
        if (x < 0 || x > w || y < 0 || y > h) break;
        if (Math.hypot(x - p1.x, y - p1.y) < 11 && dir === 1 && Q1 < 0) break;
        if (Math.hypot(x - p2.x, y - p2.y) < 11 && dir === 1 && Q2 < 0) break;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    });
    ctx.restore();

    // charges
    const drawQ = (p: { x: number; y: number }, q: number) => {
      const pos = q >= 0;
      circle(ctx, p.x, p.y, 13, pos ? SIM.red : SIM.sky, true);
      label(ctx, pos ? "+" : "−", p.x, p.y - 1, SIM.white, 15, "center");
      label(ctx, `${q.toFixed(1)}q`, p.x, p.y + 24, pos ? SIM.red : SIM.sky, 10, "center");
    };
    drawQ(p1, q1);
    drawQ(p2, q2);

    // test charges drifting along E
    if (s.probes.length === 0) {
      for (let i = 0; i < 26; i++) {
        s.probes.push({ x: Math.random() * w, y: Math.random() * h, vx: 0, vy: 0 });
      }
    }
    s.probes.forEach((pr) => {
      const { ex, ey } = Efield(pr.x, pr.y);
      pr.vx = ex * 14;
      pr.vy = ey * 14;
      pr.x += pr.vx * dt;
      pr.y += pr.vy * dt;
      if (pr.x < 0 || pr.x > w || pr.y < 0 || pr.y > h || Math.hypot(pr.vx, pr.vy) < 0.05) {
        pr.x = Math.random() * w;
        pr.y = Math.random() * h;
      }
      circle(ctx, pr.x, pr.y, 1.6, "rgba(241,245,249,0.75)");
    });

    label(ctx, "lines: red +q source, blue −q sink · dots drift along E (test charges)", w / 2, h - 12, SIM.dim, 10, "center");
  });

  return (
    <SimFrame
      title="Electric field explorer"
      about="Field lines leave + and enter −; density ∝ strength. Try like charges vs dipole."
      height={340}
      canvas={<canvas ref={canvasRef} />}
      controls={
        <SimControls>
          <LabeledSlider label="Charge q₁ (+ right)" value={q1} min={-3} max={3} step={0.1} decimals={1} onChange={setQ1} color="#f87171" />
          <LabeledSlider label="Charge q₂ (+ right)" value={q2} min={-3} max={3} step={0.1} decimals={1} onChange={setQ2} color="#38bdf8" />
          <ResetButton onClick={() => { state.current.probes = []; }} />
        </SimControls>
      }
      readouts={
        <>
          <Readout label="Configuration" value={q1 * q2 < 0 ? "Dipole — lines flow + → −" : q1 * q2 > 0 ? "Like charges — neutral point between" : "Single charge"} />
          <Readout label="Field ∝" value="1/r² from each charge" color="#34d399" />
        </>
      }
    />
  );
}
