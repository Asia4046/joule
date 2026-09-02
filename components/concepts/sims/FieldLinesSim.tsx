"use client";

import { useRef, useState } from "react";
import SimFrame from "@/components/concepts/SimFrame";
import { LabeledSlider, Readout, SimControls, ResetButton } from "@/components/concepts/controls";
import { useCanvas, SIM, clearPanel, label, circle } from "@/components/concepts/useCanvas";

/** Two adjustable charges: field-line tracing + drifting test charges. */
export default function FieldLinesSim() {
  const [q1, setQ1] = useState(1);
  const [q2, setQ2] = useState(-1);
  const state = useRef({ probes: [] as { x: number; y: number; life: number }[] });

  const canvasRef = useCanvas((ctx, w, h, _t, dt) => {
    const s = state.current;
    const p1 = { x: w * 0.32, y: h / 2 };
    const p2 = { x: w * 0.68, y: h / 2 };
    const Q1 = q1 * 60;
    const Q2 = q2 * 60;
    const charges = [
      { p: p1, Q: Q1, q: q1 },
      { p: p2, Q: Q2, q: q2 },
    ] as const;

    const Efield = (x: number, y: number) => {
      let ex = 0, ey = 0;
      const softening = 16; // px² softening to avoid singularity
      for (const { p, Q } of charges) {
        const dx = x - p.x;
        const dy = y - p.y;
        const r2 = dx * dx + dy * dy;
        const r = Math.sqrt(r2 + softening);
        const e = Q / r2;
        ex += (e * dx) / r;
        ey += (e * dy) / r;
      }
      return { ex, ey };
    };

    clearPanel(ctx, w, h);

    // Field lines: traced outward from positive charges along E (or inward-to-E from negatives
    // when no positive exists). Line count per charge scales with |q| — "density ∝ strength".
    const fromPositive = Q1 > 0 || Q2 > 0;
    const dir = fromPositive ? 1 : -1;
    const seeds: { x: number; y: number }[] = [];
    for (const { p, Q } of charges) {
      const mag = Math.abs(Q);
      if ((fromPositive ? Q > 0 : Q < 0) && mag > 0) {
        const n = Math.max(6, Math.round((8 * mag) / 60)); // 8 lines per unit charge
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2;
          seeds.push({ x: p.x + Math.cos(a) * 12, y: p.y + Math.sin(a) * 12 });
        }
      }
    }

    ctx.save();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = "rgba(129,140,248,0.55)";
    const trace = (seed: { x: number; y: number }) => {
      let { x, y } = seed;
      let px = 0, py = 0; // previous unit step, to detect stalls at neutral points
      const pts: { x: number; y: number }[] = [{ x, y }];
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let i = 0; i < 400; i++) {
        const { ex, ey } = Efield(x, y);
        const m = Math.hypot(ex, ey);
        if (m < 1e-5) break;
        const sx = (dir * ex) / m;
        const sy = (dir * ey) / m;
        // A field line cannot reverse — a sign flip means we hit a neutral point;
        // stop instead of jittering in place (old code drew a stuck 3px blob there).
        if (i > 0 && sx * px + sy * py < 0) break;
        px = sx;
        py = sy;
        x += sx * 2.5;
        y += sy * 2.5;
        if (x < 0 || x > w || y < 0 || y > h) break;
        // Lines terminate only on the opposite sign of the tracing direction:
        // outward from + they end on −, inward-to-E from − they end on +.
        let hitSink = false;
        for (const { p, Q } of charges) {
          if ((dir === 1 && Q < 0) || (dir === -1 && Q > 0)) {
            if (Math.hypot(x - p.x, y - p.y) < 12) { hitSink = true; break; }
          }
        }
        if (hitSink) {
          ctx.lineTo(x, y);
          pts.push({ x, y });
          break;
        }
        ctx.lineTo(x, y);
        if (i % 4 === 0) pts.push({ x, y });
      }
      ctx.stroke();
      // direction chevron at the midpoint — lines leave + and enter −
      if (pts.length > 4) {
        const mid = pts[Math.floor(pts.length / 2)];
        const prev = pts[Math.floor(pts.length / 2) - 1];
        const next = pts[Math.floor(pts.length / 2) + 1];
        const a = Math.atan2(next.y - prev.y, next.x - prev.x);
        ctx.beginPath();
        ctx.moveTo(mid.x - 4 * Math.cos(a - 0.45), mid.y - 4 * Math.sin(a - 0.45));
        ctx.lineTo(mid.x, mid.y);
        ctx.lineTo(mid.x - 4 * Math.cos(a + 0.45), mid.y - 4 * Math.sin(a + 0.45));
        ctx.stroke();
      }
    };
    seeds.forEach(trace);
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

    // test charges: positive probes accelerating along E, speed ∝ |E| (clamped),
    // recirculating so they don't all pile up on the negative charge
    if (s.probes.length === 0) {
      for (let i = 0; i < 34; i++) {
        s.probes.push({ x: Math.random() * w, y: Math.random() * h, life: Math.random() * 8 });
      }
    }
    s.probes.forEach((pr) => {
      const { ex, ey } = Efield(pr.x, pr.y);
      const m = Math.hypot(ex, ey);
      pr.life -= dt;
      if (m > 1e-6) {
        // px/s: |E| ≈ 0.003 at mid-range → ~15 px/s; clamped so slingshots stay readable
        const speed = Math.min(150, Math.max(7, m * 5000));
        pr.x += ((ex / m) * speed) * dt;
        pr.y += ((ey / m) * speed) * dt;
      }
      const nearCharge = charges.some(({ p }) => Math.hypot(pr.x - p.x, pr.y - p.y) < 18);
      if (pr.life <= 0 || pr.x < 0 || pr.x > w || pr.y < 0 || pr.y > h || nearCharge) {
        pr.x = Math.random() * w;
        pr.y = Math.random() * h;
        pr.life = 5 + Math.random() * 7;
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
          <LabeledSlider label="Charge q₁" value={q1} min={-3} max={3} step={0.1} decimals={1} onChange={setQ1} color="#E46876" />
          <LabeledSlider label="Charge q₂" value={q2} min={-3} max={3} step={0.1} decimals={1} onChange={setQ2} color="#7FB4CA" />
          <ResetButton onClick={() => { state.current.probes = []; }} />
        </SimControls>
      }
      readouts={
        <>
          <Readout label="Configuration" value={q1 * q2 < 0 ? "Dipole — lines flow + → −" : q1 * q2 > 0 ? "Like charges — neutral point between" : "Single charge"} />
          <Readout label="Field ∝" value="1/r² from each charge" color="#98BB6C" />
        </>
      }
    />
  );
}
