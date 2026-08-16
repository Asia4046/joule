"use client";

import { useRef, useState } from "react";
import SimFrame from "@/components/concepts/SimFrame";
import { LabeledSlider, Readout, SimControls, ResetButton } from "@/components/concepts/controls";
import { useCanvas, SIM, clearPanel, label, arrow, circle } from "@/components/concepts/useCanvas";

export default function ProjectileSim() {
  const [u, setU] = useState(25);
  const [angle, setAngle] = useState(45);
  const g = 9.8;
  const state = useRef({ t: 0, trail: [] as { x: number; y: number }[], done: false });
  const params = useRef({ u, angle });
  if (params.current.u !== u || params.current.angle !== angle) {
    params.current = { u, angle };
    state.current = { t: 0, trail: [], done: false };
  }

  const th = (angle * Math.PI) / 180;
  const ux = u * Math.cos(th);
  const uy = u * Math.sin(th);
  const T = (2 * uy) / g;
  const R = ux * T;
  const H = (uy * uy) / (2 * g);
  const optimal = (u * u) / g;
  const compAngle = 90 - angle;

  const canvasRef = useCanvas((ctx, w, h, _t, dt) => {
    const s = state.current;
    const pad = 34;
    const world = { w: optimal * 1.12, h: Math.max(H * 1.45 + 4, optimal * 0.45) };
    const sx = (x: number) => pad + (x / world.w) * (w - 2 * pad);
    const sy = (y: number) => h - pad - (y / world.h) * (h - 2 * pad);

    if (!s.done) {
      s.t += dt;
      const x = ux * s.t;
      const y = uy * s.t - 0.5 * g * s.t * s.t;
      if (y < 0 && s.t > 0.1) {
        s.done = true;
      } else {
        s.trail.push({ x, y });
      }
    } else if (s.t > T + 1.8) {
      s.t = 0;
      s.trail = [];
      s.done = false;
    } else {
      s.t += dt;
    }

    clearPanel(ctx, w, h);
    // ground
    ctx.save();
    ctx.strokeStyle = SIM.axis;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(pad, sy(0));
    ctx.lineTo(w - pad / 2, sy(0));
    ctx.stroke();
    ctx.restore();

    // optimal 45° arc (faded reference)
    ctx.save();
    ctx.strokeStyle = "rgba(52,211,153,0.35)";
    ctx.setLineDash([4, 5]);
    ctx.beginPath();
    for (let i = 0; i <= 80; i++) {
      const tt = (i / 80) * ((2 * (u / Math.SQRT2)) / g);
      ctx.lineTo(sx((u / Math.SQRT2) * tt), sy((u / Math.SQRT2) * tt - 0.5 * g * tt * tt));
    }
    ctx.stroke();
    ctx.restore();
    label(ctx, `45° optimum  R = ${optimal.toFixed(1)} m`, w - pad, sy(0) + 18, "rgba(52,211,153,0.8)", 10, "right");

    // launcher
    arrow(ctx, sx(0), sy(0), sx(0) + 34 * Math.cos(th), sy(0) - 34 * Math.sin(th), SIM.amber, 3);
    label(ctx, `θ = ${angle.toFixed(0)}°`, sx(0) + 40 * Math.cos(th), sy(0) - 44 * Math.sin(th), SIM.amber, 11);

    // trajectory
    ctx.save();
    ctx.strokeStyle = SIM.indigo;
    ctx.lineWidth = 2.2;
    ctx.shadowColor = SIM.indigo;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    s.trail.forEach((p, i) => (i === 0 ? ctx.moveTo(sx(p.x), sy(p.y)) : ctx.lineTo(sx(p.x), sy(p.y))));
    ctx.stroke();
    ctx.restore();

    // ball + velocity vectors
    if (s.trail.length && !s.done) {
      const p = s.trail[s.trail.length - 1];
      const vx = ux;
      const vy = uy - g * s.t;
      circle(ctx, sx(p.x), sy(p.y), 6, SIM.white, true);
      arrow(ctx, sx(p.x), sy(p.y), sx(p.x) + vx * 1.6, sy(p.y) - vy * 1.6, SIM.sky, 1.6);
      // gravity arrow (down)
      arrow(ctx, sx(p.x), sy(p.y), sx(p.x), sy(p.y) + 18, SIM.red, 1.4);
    }

    // max height marker
    ctx.save();
    ctx.strokeStyle = "rgba(148,163,184,0.35)";
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.moveTo(sx(R / 2), sy(0));
    ctx.lineTo(sx(R / 2), sy(H));
    ctx.stroke();
    ctx.restore();
    label(ctx, `H = ${H.toFixed(1)} m`, sx(R / 2) + 6, sy(H) - 8, SIM.text, 10);

    // range marker
    arrow(ctx, sx(0), sy(0) + 26, sx(R), sy(0) + 26, SIM.green, 1.6);
    label(ctx, `R = ${R.toFixed(1)} m`, sx(R / 2), sy(0) + 42, SIM.green, 11, "center");
  });

  return (
    <SimFrame
      title="Projectile range lab"
      about="u and θ are yours; the 45° ghost curve shows the maximum possible range"
      height={340}
      canvas={<canvas ref={canvasRef} />}
      controls={
        <SimControls>
          <LabeledSlider label="Launch speed u (m/s)" value={u} min={5} max={45} step={0.5} decimals={1} onChange={setU} />
          <LabeledSlider label="Angle θ (°)" value={angle} min={10} max={80} step={1} decimals={0} onChange={setAngle} color="#fbbf24" />
          <ResetButton onClick={() => { state.current = { t: 0, trail: [], done: false }; }} />
        </SimControls>
      }
      readouts={
        <>
          <Readout label="Range R" value={`${R.toFixed(1)} m`} color="#34d399" />
          <Readout label="Max height H" value={`${H.toFixed(1)} m`} />
          <Readout label="Time of flight T" value={`${T.toFixed(2)} s`} />
          <Readout label={`R at ${compAngle.toFixed(0)}° (complement)`} value={`${((u * u * Math.sin(2 * ((compAngle * Math.PI) / 180))) / g).toFixed(1)} m`} color="#fbbf24" />
        </>
      }
    />
  );
}
