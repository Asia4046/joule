"use client";

import { useRef, useState } from "react";
import SimFrame from "@/components/concepts/SimFrame";
import { LabeledSlider, Readout, SimControls, ResetButton } from "@/components/concepts/controls";
import { useCanvas, SIM, clearPanel, label } from "@/components/concepts/useCanvas";

const g = 9.8;
const L = 8; // incline length (m)

const BODIES = [
  { name: "Ring", k: 1.0, color: SIM.red, shape: "ring" as const },
  { name: "Hollow sphere", k: 2 / 3, color: SIM.fuchsia, shape: "sphere" as const },
  { name: "Disc", k: 0.5, color: SIM.sky, shape: "disc" as const },
  { name: "Solid sphere", k: 0.4, color: SIM.green, shape: "sphere" as const },
];

/** Rolling race: ring vs hollow sphere vs disc vs solid sphere down one incline. Only shape matters. */
export default function RollingSim() {
  const [angle, setAngle] = useState(25);

  const th = (angle * Math.PI) / 180;
  const acc = BODIES.map((b) => g * Math.sin(th) / (1 + b.k));
  const muMin = BODIES.map((b) => (b.k * Math.tan(th)) / (1 + b.k));

  const state = useRef({ t: 0, finished: false, holdTimer: 0, order: [] as string[] });
  const params = useRef({ angle });
  if (params.current.angle !== angle) {
    params.current = { angle };
    state.current = { t: 0, finished: false, holdTimer: 0, order: [] };
  }

  const canvasRef = useCanvas((ctx, w, h, _t, dt) => {
    const s = state.current;
    const pad = 26;
    // incline geometry: apex top-left, base bottom-right
    const x0 = pad + 20, y0 = pad + 14;
    const x1 = w - pad, y1 = h - pad - 34;
    const inclineLen = Math.hypot(x1 - x0, y1 - y0);
    const ux = (x1 - x0) / inclineLen;
    const uy = (y1 - y0) / inclineLen;

    if (!s.finished) {
      s.t += dt;
      s.order = BODIES.map((b, i) => ({ n: b.name, x: 0.5 * acc[i] * s.t * s.t }))
        .sort((a, b) => b.x - a.x)
        .map((o) => o.n);
      if (0.5 * acc[3] * s.t * s.t >= L) s.finished = true;
    } else {
      s.holdTimer += dt;
      if (s.holdTimer > 2.4) {
        s.t = 0; s.finished = false; s.holdTimer = 0; s.order = [];
      }
    }

    clearPanel(ctx, w, h);
    // incline
    ctx.save();
    ctx.fillStyle = "rgba(30,42,68,0.55)";
    ctx.strokeStyle = SIM.panelEdge;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x0, y1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    // angle arc
    ctx.save();
    ctx.strokeStyle = SIM.amber;
    ctx.beginPath();
    ctx.arc(x0, y1, 44, -th, 0);
    ctx.stroke();
    ctx.restore();
    label(ctx, `θ = ${angle.toFixed(0)}°`, x0 + 50, y1 - 12, SIM.amber, 10);

    // bodies
    BODIES.forEach((b, i) => {
      const dist = Math.min(0.5 * acc[i] * s.t * s.t, L);
      const fr = dist / L;
      const px = x0 + ux * (fr * inclineLen);
      const py = y0 + uy * (fr * inclineLen);
      const r = 13;
      const cx = px - uy * (r + 1.5); // offset perpendicular off the slope
      const cy = py + ux * (r + 1.5);

      // rotation: visual radius fixed so spin differences are visible (physical radius cancels in a)
      const phi = (dist / 0.09) % (Math.PI * 2);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(phi);
      ctx.strokeStyle = b.color;
      ctx.lineWidth = 2.4;
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
      // shape hint: ring thick, disc filled, sphere with latitude line
      if (b.shape === "ring") {
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.72, 0, Math.PI * 2);
        ctx.lineWidth = 4;
        ctx.stroke();
      } else if (b.shape === "disc") {
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = b.color;
        ctx.fill();
        ctx.globalAlpha = 1;
      } else {
        ctx.beginPath();
        ctx.ellipse(0, 0, r, r * 0.4, 0, 0, Math.PI * 2);
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }
      // spoke to show spin
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(r, 0);
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.restore();

      label(ctx, b.name, cx, cy + r + 12, b.color, 9, "center");
      label(ctx, `a=${acc[i].toFixed(2)}`, cx, cy - r - 9, SIM.dim, 8, "center");
    });

    // leaderboard
    const lb = s.order.length ? s.order : BODIES.map((b) => b.name);
    label(ctx, s.finished ? "FINISH ORDER" : "LEADER", w - pad - 4, pad + 2, SIM.dim, 9, "right");
    lb.slice(0, 4).forEach((n, i) => {
      const color = BODIES.find((b) => b.name === n)!.color;
      label(ctx, `${i + 1}. ${n}`, w - pad - 4, pad + 16 + i * 13, color, 9, "right");
    });

    // lesson line
    label(ctx, "finish order depends on shape only — mass and radius cancel", w / 2, h - 12, SIM.dim, 9, "center");
  });

  return (
    <SimFrame
      title="Rolling race"
      about="Four bodies roll without slipping down the same incline — a = g·sinθ/(1 + k/R²) ranks them every time"
      height={330}
      canvas={<canvas ref={canvasRef} />}
      controls={
        <SimControls>
          <LabeledSlider label="Incline θ (°)" value={angle} min={10} max={40} step={1} decimals={0} onChange={setAngle} color="#fbbf24" />
          <ResetButton onClick={() => { state.current = { t: 0, finished: false, holdTimer: 0, order: [] }; }} />
        </SimControls>
      }
      readouts={
        <>
          <Readout label="Solid sphere a" value={`${acc[3].toFixed(2)} m/s²`} color="#34d399" />
          <Readout label="Disc a" value={`${acc[2].toFixed(2)} m/s²`} color="#38bdf8" />
          <Readout label="Hollow sphere a" value={`${acc[1].toFixed(2)} m/s²`} color="#e879f9" />
          <Readout label="Ring a" value={`${acc[0].toFixed(2)} m/s²`} color="#f87171" />
          <Readout label="μ needed (worst: ring)" value={`≥ ${Math.max(...muMin).toFixed(3)}`} color="#fbbf24" />
        </>
      }
    />
  );
}
