"use client";

import { useRef, useState } from "react";
import SimFrame from "@/components/concepts/SimFrame";
import { LabeledSlider, Readout, SimControls, ResetButton } from "@/components/concepts/controls";
import { useCanvas, SIM, clearPanel, label, arrow } from "@/components/concepts/useCanvas";

/** Stokes drag: ball falls through a fluid, velocity approaches terminal value exponentially. */
export default function ViscositySim() {
  const [eta, setEta] = useState(0.6); // viscosity
  const [r, setR] = useState(2); // radius (mm)
  const g = 9.8;
  const rho = 2.5e3; // ball density (arbitrary units scaled)
  const state = useRef({ y: 0, v: 0, t: 0, trace: [] as { t: number; v: number }[] });

  // scale: r mm → factor
  const rFactor = (r / 1000) * (r / 1000);
  const vt = (2 * rFactor * rho * g) / (9 * eta);

  const canvasRef = useCanvas((ctx, w, h, _t, dt) => {
    const s = state.current;
    const k = 9 * eta;
    const termV = (2 * rFactor * rho * g) / (9 * eta);
    // dv/dt = g(1 - v/vt)
    const acc = g * (1 - s.v / Math.max(termV, 1e-9));
    s.v += acc * dt;
    s.y += s.v * dt;
    s.t += dt;
    s.trace.push({ t: s.t, v: s.v });
    while (s.trace.length > 2 && s.trace[1].t < s.t - 3.9) s.trace.shift();
    if (s.y > 4) {
      s.y = 0;
      s.v = 0;
      s.t = 0;
      s.trace = [];
    }

    clearPanel(ctx, w, h);
    const pad = 30;

    // fluid tank (left)
    const tankX0 = pad + 10;
    const tankW = w * 0.34;
    const tankY0 = pad;
    const tankY1 = h - pad;
    ctx.save();
    ctx.strokeStyle = SIM.panelEdge;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(tankX0, tankY0, tankW, tankY1 - tankY0);
    // fluid tint
    const grad = ctx.createLinearGradient(0, tankY0, 0, tankY1);
    grad.addColorStop(0, "rgba(56,189,248,0.10)");
    grad.addColorStop(1, "rgba(56,189,248,0.03)");
    ctx.fillStyle = grad;
    ctx.fillRect(tankX0, tankY0, tankW, tankY1 - tankY0);
    ctx.restore();
    label(ctx, `fluid  η = ${eta.toFixed(2)} Pa·s`, tankX0 + 8, tankY0 + 14, SIM.sky, 10);

    // ball
    const by = tankY0 + 16 + (s.y / 4) * (tankY1 - tankY0 - 40);
    const bx = tankX0 + tankW / 2;
    ctx.save();
    ctx.fillStyle = SIM.amber;
    ctx.shadowColor = SIM.amber;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(bx, by, 6 + (r / 4) * 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // forces on ball
    arrow(ctx, bx, by, bx, by + 26, SIM.red, 2); // weight
    label(ctx, "mg", bx + 8, by + 26, SIM.red, 10);
    arrow(ctx, bx, by, bx, by - 26 * Math.min(1, (s.v / Math.max(termV, 1e-9)) + 0.3), SIM.green, 2); // drag+buoyancy
    label(ctx, "6πηrv", bx + 8, by - 30, SIM.green, 10);

    // velocity vector
    arrow(ctx, bx + 40, by, bx + 40, by + Math.min(50, s.v * 22), SIM.sky, 2);
    label(ctx, `v = ${s.v.toFixed(2)} m/s`, bx + 46, by + 30, SIM.sky, 10);

    // v-t plot (right)
    const px0 = w * 0.42 + 20;
    const px1 = w - pad;
    const py0 = pad + 16;
    const py1 = h - pad - 16;
    ctx.save();
    ctx.strokeStyle = SIM.axis;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px0, py1);
    ctx.lineTo(px1, py1);
    ctx.moveTo(px0, py0);
    ctx.lineTo(px0, py1);
    ctx.stroke();
    ctx.restore();
    label(ctx, "v(t)", px0 + 4, py0 - 6, SIM.dim, 10);

    // terminal velocity line
    ctx.save();
    ctx.strokeStyle = "rgba(248,113,113,0.6)";
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(px0, py1 - Math.min(1, termV / 4) * (py1 - py0));
    ctx.lineTo(px1, py1 - Math.min(1, termV / 4) * (py1 - py0));
    ctx.stroke();
    ctx.restore();
    label(ctx, `v_t = ${termV.toFixed(2)} m/s`, px1 - 4, py1 - Math.min(1, termV / 4) * (py1 - py0) - 8, SIM.red, 10, "right");

    // trace
    ctx.save();
    ctx.strokeStyle = SIM.green;
    ctx.lineWidth = 2;
    ctx.shadowColor = SIM.green;
    ctx.shadowBlur = 5;
    ctx.beginPath();
    s.trace.forEach((p, i) => {
      const xx = px0 + (p.t / 4) * (px1 - px0);
      const yy = py1 - Math.min(1, p.v / 4) * (py1 - py0);
      i === 0 ? ctx.moveTo(xx, yy) : ctx.lineTo(xx, yy);
    });
    ctx.stroke();
    ctx.restore();
    label(ctx, "t (s) →", (px0 + px1) / 2, py1 + 10, SIM.dim, 9, "center");
  });

  return (
    <SimFrame
      title="Viscous drag: terminal velocity"
      about="dv/dt = g(1 − v/v_t): exponential approach to v_t = 2r²(ρ−σ)g/9η"
      height={330}
      canvas={<canvas ref={canvasRef} />}
      controls={
        <SimControls>
          <LabeledSlider label="Viscosity η (Pa·s)" value={eta} min={0.1} max={3} step={0.05} onChange={setEta} color="#38bdf8" />
          <LabeledSlider label="Ball radius r (mm)" value={r} min={0.5} max={4} step={0.1} decimals={1} onChange={setR} color="#fbbf24" />
          <ResetButton onClick={() => { state.current = { y: 0, v: 0, t: 0, trace: [] }; }} />
        </SimControls>
      }
      readouts={
        <>
          <Readout label="Terminal velocity v_t" value={`${vt.toFixed(2)} m/s`} color="#f87171" />
          <Readout label="Stokes drag at v_t" value={`6πηrv = ${(6 * Math.PI * eta * (r / 1000) * vt).toExponential(2)} N`} />
          <Readout label="Scaling" value="v_t ∝ r² / η" color="#34d399" />
        </>
      }
    />
  );
}
