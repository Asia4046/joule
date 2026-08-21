"use client";

import { useRef, useState } from "react";
import SimFrame from "@/components/concepts/SimFrame";
import { LabeledSlider, Readout, SimControls, ResetButton } from "@/components/concepts/controls";
import { useCanvas, SIM, clearPanel, label, arrow } from "@/components/concepts/useCanvas";

const g = 9.8;
const L = 8; // incline length (m)
const R = 0.09; // physical radius used for ω (visual radius differs; physics of a is unchanged)

const BODIES = [
  { name: "Ring", k: 1.0, color: SIM.red, shape: "ring" as const },
  { name: "Hollow sph", k: 2 / 3, color: SIM.fuchsia, shape: "sphere" as const },
  { name: "Disc", k: 0.5, color: SIM.sky, shape: "disc" as const },
  { name: "Solid sph", k: 0.4, color: SIM.green, shape: "sphere" as const },
];
const FOCUS = 3; // solid sphere gets the velocity-field spotlight

/** Rolling race with real friction: enough μ → pure rolling; too little → everyone slides at g(sinθ − μcosθ). */
export default function RollingSim() {
  const [angle, setAngle] = useState(25);
  const [mu, setMu] = useState(0.45);

  const th = (angle * Math.PI) / 180;
  const muMin = BODIES.map((b) => (b.k * Math.tan(th)) / (1 + b.k));
  const rolling = muMin.map((m) => mu >= m);
  // pure rolling: a = g sinθ/(1+k) · slipping: translation only at g(sinθ − μcosθ), ω from kinetic friction
  const acc = BODIES.map((b, i) => (rolling[i] ? g * Math.sin(th) / (1 + b.k) : g * (Math.sin(th) - mu * Math.cos(th))));
  const alpha = BODIES.map((b, i) => (rolling[i] ? acc[i] / R : (mu * g * Math.cos(th)) / (b.k * R)));
  const allSlipping = rolling.every((r) => !r);

  const state = useRef({ t: 0, finished: false, holdTimer: 0, om: [0, 0, 0, 0] });
  const params = useRef({ angle, mu });
  if (params.current.angle !== angle || params.current.mu !== mu) {
    params.current = { angle, mu };
    state.current = { t: 0, finished: false, holdTimer: 0, om: [0, 0, 0, 0] };
  }

  const canvasRef = useCanvas((ctx, w, h, _t, dt) => {
    const s = state.current;
    const pad = 26;
    const x0 = pad + 20, y0 = pad + 14;
    const x1 = w - pad - 148, y1 = h - pad - 30; // keep right column for energy bars
    const inclineLen = Math.hypot(x1 - x0, y1 - y0);
    const ux = (x1 - x0) / inclineLen;
    const uy = (y1 - y0) / inclineLen;

    if (!s.finished) {
      s.t += dt;
      for (let i = 0; i < 4; i++) s.om[i] += alpha[i] * dt;
      if (0.5 * acc[3] * s.t * s.t >= L) s.finished = true;
    } else {
      s.holdTimer += dt;
      if (s.holdTimer > 2.6) {
        state.current = { t: 0, finished: false, holdTimer: 0, om: [0, 0, 0, 0] };
      }
    }

    clearPanel(ctx, w, h);
    // incline wedge
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
    ctx.save();
    ctx.strokeStyle = SIM.amber;
    ctx.beginPath();
    ctx.arc(x0, y1, 40, -th, 0);
    ctx.stroke();
    ctx.restore();
    label(ctx, `θ = ${angle.toFixed(0)}°`, x0 + 46, y1 - 11, SIM.amber, 10);

    // ── bodies ──
    const geoms = BODIES.map((b, i) => {
      const dist = Math.min(0.5 * acc[i] * s.t * s.t, L);
      const fr = dist / L;
      const px = x0 + ux * (fr * inclineLen);
      const py = y0 + uy * (fr * inclineLen);
      const r = 13;
      const cx = px - uy * (r + 1.5);
      const cy = py + ux * (r + 1.5);
      const phi = rolling[i] ? dist / R : s.om[i];
      const v = acc[i] * s.t;
      const vContact = v - (rolling[i] ? v : s.om[i] * R);
      return { px, py, cx, cy, r, phi: phi % (Math.PI * 2), v, vContact, dist, i };
    });

    geoms.forEach((gm) => {
      const b = BODIES[gm.i];
      ctx.save();
      ctx.translate(gm.cx, gm.cy);
      ctx.rotate(gm.phi);
      ctx.strokeStyle = b.color;
      ctx.lineWidth = 2.4;
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(0, 0, gm.r, 0, Math.PI * 2);
      ctx.stroke();
      if (b.shape === "ring") {
        ctx.beginPath();
        ctx.arc(0, 0, gm.r * 0.72, 0, Math.PI * 2);
        ctx.lineWidth = 4;
        ctx.stroke();
      } else if (b.shape === "disc") {
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = b.color;
        ctx.fill();
        ctx.globalAlpha = 1;
      } else {
        ctx.beginPath();
        ctx.ellipse(0, 0, gm.r, gm.r * 0.4, 0, 0, Math.PI * 2);
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(gm.r, 0);
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.restore();

      // friction arrow along the slope (up-slope in BOTH regimes — it is what spins the body up)
      const fx = gm.cx + ux * 16, fy = gm.cy + uy * 16;
      arrow(ctx, fx, fy, fx - ux * (rolling[gm.i] ? 14 : 20), fy - uy * (rolling[gm.i] ? 14 : 20), rolling[gm.i] ? "rgba(52,211,153,0.8)" : SIM.red, 1.6);

      label(ctx, b.name, gm.cx, gm.cy + gm.r + 12, b.color, 9, "center");
      label(ctx, `a=${acc[gm.i].toFixed(2)}`, gm.cx, gm.cy - gm.r - 8, SIM.dim, 8, "center");
      if (!rolling[gm.i]) label(ctx, "SLIPS", gm.cx, gm.cy + gm.r + 23, SIM.red, 8, "center");
    });

    // ── velocity field on the focus body: contact 0 · centre v · top 2v ──
    const f = geoms[FOCUS];
    const vScale = 9;
    const topX = f.cx + (f.cx - f.px), topY = f.cy + (f.cy - f.py);
    arrow(ctx, f.px, f.py + 3, f.px + ux * f.vContact * vScale, f.py + uy * f.vContact * vScale + 3, rolling[FOCUS] ? SIM.dim : SIM.red, 1.6);
    arrow(ctx, f.cx - ux * 20, f.cy - uy * 20, f.cx - ux * 20 + ux * f.v * vScale, f.cy - uy * 20 + uy * f.v * vScale, SIM.green, 1.8);
    arrow(ctx, topX - ux * 20, topY - uy * 20, topX - ux * 20 + ux * (f.v + (rolling[FOCUS] ? f.v : s.om[FOCUS] * R)) * vScale, topY - uy * 20 + uy * (f.v + (rolling[FOCUS] ? f.v : s.om[FOCUS] * R)) * vScale, SIM.sky, 1.8);
    label(ctx, rolling[FOCUS] ? "0" : `v−ωR=${f.vContact.toFixed(1)}`, f.px + 6, f.py + 10, rolling[FOCUS] ? SIM.dim : SIM.red, 8);
    label(ctx, `v=${f.v.toFixed(1)}`, f.cx - ux * 34, f.cy - uy * 34, SIM.green, 8);
    label(ctx, rolling[FOCUS] ? "2v" : `v+ωR`, topX - ux * 34, topY - uy * 34, SIM.sky, 8);

    // ── right column: KE partition + status ──
    const bx = w - pad - 138;
    label(ctx, "KE split (trans | rot)", bx, 18, SIM.dim, 9);
    const keT = geoms.map((_, i) => 0.5 * (acc[i] * s.t) ** 2); // m = 1 kg
    const keR = geoms.map((_, i) => 0.5 * BODIES[i].k * (s.om[i] ** 2) * R * R);
    const keMax = Math.max(...keT.map((k, i) => k + keR[i]), 1e-6);
    BODIES.forEach((b, i) => {
      const y = 34 + i * 30;
      const bw = 118;
      const tW = (keT[i] / keMax) * bw;
      const rW = (keR[i] / keMax) * bw;
      ctx.save();
      ctx.fillStyle = "rgba(148,163,184,0.12)";
      ctx.fillRect(bx, y, bw, 9);
      ctx.fillStyle = b.color;
      ctx.fillRect(bx, y, tW, 9);
      ctx.fillStyle = "rgba(241,245,249,0.55)";
      ctx.fillRect(bx + tW, y, rW, 9);
      ctx.restore();
      label(ctx, b.name, bx, y + 17, b.color, 8);
      label(ctx, rolling[i] ? "rolls" : `needs μ≥${muMin[i].toFixed(2)}`, bx + bw, y + 17, rolling[i] ? SIM.green : SIM.red, 8, "right");
    });

    // leaderboard
    const order = BODIES.map((b, i) => ({ n: b.name, x: 0.5 * acc[i] * s.t * s.t })).sort((a, b) => b.x - a.x).map((o) => o.n);
    label(ctx, s.finished ? "FINISH ORDER" : "LEADER", w - pad - 4, pad + 2, SIM.dim, 9, "right");
    order.forEach((n, i) => {
      const color = BODIES.find((b) => b.name === n)!.color;
      label(ctx, `${i + 1}. ${n}`, w - pad - 4, pad + 16 + i * 13, color, 9, "right");
    });

    // lesson line reacts to the regime
    label(
      ctx,
      allSlipping
        ? "μ too small: everyone slides at g(sinθ − μcosθ) — a dead heat; only spin rates differ"
        : "order depends on shape only — mass and radius cancel (friction is static: zero work)",
      w / 2 - 60, h - 12, SIM.dim, 9, "center"
    );
  });

  return (
    <SimFrame
      title="Rolling race — with friction that can fail"
      about="Pure rolling needs μ ≥ k·tanθ/(1+k); below that the body slips and the race collapses into a tie"
      height={330}
      canvas={<canvas ref={canvasRef} />}
      controls={
        <SimControls>
          <LabeledSlider label="Incline θ (°)" value={angle} min={10} max={40} step={1} decimals={0} onChange={setAngle} color="#fbbf24" />
          <LabeledSlider label="Friction μ" value={mu} min={0} max={0.8} step={0.05} decimals={2} onChange={setMu} color="#f87171" />
          <ResetButton onClick={() => { state.current = { t: 0, finished: false, holdTimer: 0, om: [0, 0, 0, 0] }; }} />
        </SimControls>
      }
      readouts={
        <>
          <Readout label="Solid sphere a" value={`${acc[3].toFixed(2)} m/s² · ${rolling[3] ? "rolls" : "slips"}`} color="#34d399" />
          <Readout label="Disc a" value={`${acc[2].toFixed(2)} m/s² · ${rolling[2] ? "rolls" : "slips"}`} color="#38bdf8" />
          <Readout label="Hollow sphere a" value={`${acc[1].toFixed(2)} m/s² · ${rolling[1] ? "rolls" : "slips"}`} color="#e879f9" />
          <Readout label="Ring a" value={`${acc[0].toFixed(2)} m/s² · ${rolling[0] ? "rolls" : "slips"}`} color="#f87171" />
          <Readout label="Worst μ needed (ring)" value={`≥ ${Math.max(...muMin).toFixed(3)}`} color="#fbbf24" />
          <Readout label="Free-slide a = g(sinθ−μcosθ)" value={`${(g * (Math.sin(th) - mu * Math.cos(th))).toFixed(2)} m/s²`} color="#cbd5e1" />
        </>
      }
    />
  );
}
