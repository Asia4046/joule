"use client";

import { useRef, useState } from "react";
import SimFrame from "@/components/concepts/SimFrame";
import { LabeledSlider, Readout, SimControls, ResetButton } from "@/components/concepts/controls";
import { useCanvas, SIM, clearPanel, label, arrow } from "@/components/concepts/useCanvas";

const g = 9.8;
const rho = 2500; // ball density kg/m³
const SIGMA = 950; // fluid density (buoyancy) kg/m³
/** Plot window in sim seconds: wide enough to show the full exponential approach (v is within 0.25%
 *  of v_t at 6τ), clamped so extreme slider combos stay readable. PLAYBACK_S / T_WINDOW is the
 *  slow-motion factor — real Stokes settles in milliseconds, so sim time is stretched to keep the
 *  whole cycle (ball fall + curve draw) at a watchable ~4 s of wall-clock time. */
const TAU_MIN = 0.05, TAU_MAX = 4, PLAYBACK_S = 4;
const windowFor = (tau: number) => Math.min(Math.max(6 * tau, TAU_MIN), TAU_MAX);

/** Stokes drag: ball falls through fluid, velocity → terminal value exponentially. All visuals scale with v_t. */
export default function ViscositySim() {
  const [eta, setEta] = useState(0.6); // viscosity Pa·s
  const [r, setR] = useState(2); // radius mm
  const state = useRef({ y: 0, v: 0, t: 0 });
  const params = useRef({ eta, r });
  if (params.current.eta !== eta || params.current.r !== r) {
    params.current = { eta, r };
    state.current = { y: 0, v: 0, t: 0 };
  }

  const rm = r / 1000;
  const vt = (2 * rm * rm * (rho - SIGMA) * g) / (9 * eta);
  const gPrime = g * (1 - SIGMA / rho); // buoyancy-reduced gravity
  const tau = vt / gPrime; // time constant of the approach
  const T_WINDOW = windowFor(tau);
  const slowmo = Math.max(1, PLAYBACK_S / T_WINDOW); // sim seconds run this many× slower
  const stokesAtVt = 6 * Math.PI * eta * rm * vt;

  const canvasRef = useCanvas((ctx, w, h, _t, dt) => {
    const s = state.current;
    // Exact solution of dv/dt = g′(1 − v/v_t): v(t) = v_t(1 − e^(−t/τ)), y(t) = v_t(t − τ(1 − e^(−t/τ))).
    // Closed form — frame-rate independent, unlike the explicit-Euler stepping that oscillated when dt ≳ τ.
    const decay = Math.exp(-s.t / tau);
    s.v = vt * (1 - decay);
    s.y = vt * (s.t - tau * (1 - decay));
    s.t += dt / slowmo;
    if (s.t > T_WINDOW) {
      s.y = 0;
      s.v = 0;
      s.t = 0;
    }

    clearPanel(ctx, w, h);
    const pad = 30;

    // ---- fluid tank (left) ----
    const tankX0 = pad + 8;
    const tankW = w * 0.34;
    const tankY0 = pad;
    const tankY1 = h - pad;
    ctx.save();
    const grad = ctx.createLinearGradient(0, tankY0, 0, tankY1);
    grad.addColorStop(0, "rgba(56,189,248,0.10)");
    grad.addColorStop(1, "rgba(56,189,248,0.03)");
    ctx.fillStyle = grad;
    ctx.fillRect(tankX0, tankY0, tankW, tankY1 - tankY0);
    ctx.strokeStyle = SIM.panelEdge;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(tankX0, tankY0, tankW, tankY1 - tankY0);
    ctx.restore();
    label(ctx, `fluid  η = ${eta.toFixed(2)} Pa·s`, tankX0 + 10, tankY0 + 16, SIM.sky, 10);
    label(ctx, `σ = ${SIGMA} kg/m³`, tankX0 + 10, tankY0 + 32, SIM.dim, 9);

    // ball — position synced to the plot window (covers the tank depth in T_WINDOW at v_t)
    const frac = Math.min(1, s.y / Math.max(vt * T_WINDOW, 1e-9));
    const bx = tankX0 + tankW / 2;
    const by = tankY0 + 30 + frac * (tankY1 - tankY0 - 70);
    const rPx = 5 + (r / 4) * 8;
    ctx.save();
    ctx.fillStyle = SIM.amber;
    ctx.shadowColor = SIM.amber;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(bx, by, rPx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // force arrows (scaled by v/vt — drag grows to meet weight)
    const vFrac = Math.min(1, s.v / Math.max(vt, 1e-9));
    arrow(ctx, bx, by, bx, by + 30, SIM.red, 2); // weight (constant)
    label(ctx, "mg", bx + 7, by + 30, SIM.red, 10);
    const dragLen = 10 + vFrac * 20;
    arrow(ctx, bx, by, bx, by - dragLen, SIM.green, 2); // Stokes drag (+ buoyancy)
    label(ctx, "6πηrv", bx + 7, by - dragLen - 4, SIM.green, 10);

    // velocity vector
    const vArrowLen = Math.max(6, vFrac * 40);
    arrow(ctx, bx + rPx + 22, by, bx + rPx + 22, by + vArrowLen, SIM.sky, 2);
    label(ctx, `v = ${s.v.toFixed(3)} m/s`, bx + rPx + 28, by + vArrowLen + 12, SIM.sky, 10);

    // ---- v–t plot (right) — y normalised to the CURRENT v_t ----
    const px0 = w * 0.42 + 20;
    const px1 = w - pad;
    const py0 = pad + 18;
    const py1 = h - pad - 18;
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
    label(ctx, "v(t)", px0 + 6, py0 - 8, SIM.dim, 10);
    label(ctx, `t (s) · ${T_WINDOW < 1 ? T_WINDOW.toFixed(2) : T_WINDOW.toFixed(1)} s →`, (px0 + px1) / 2, py1 + 12, SIM.dim, 9, "center");
    if (slowmo > 1.05) label(ctx, `slow-motion ×${slowmo >= 100 ? Math.round(slowmo) : slowmo.toFixed(1)}`, px1 - 6, py1 + 12, SIM.dim, 9, "right");

    // terminal velocity line at ~80% height
    const vtY = py1 - 0.8 * (py1 - py0);
    ctx.save();
    ctx.strokeStyle = "rgba(228,104,118,0.6)";
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(px0, vtY);
    ctx.lineTo(px1, vtY);
    ctx.stroke();
    ctx.restore();
    label(ctx, `v_t = ${vt.toFixed(3)} m/s`, px1 - 6, vtY - 9, SIM.red, 10, "right");

    // time-constant marker (τ): v reaches ~63% of v_t
    const tauT = tau;
    const tauX = px0 + (Math.min(tauT, T_WINDOW) / T_WINDOW) * (px1 - px0);
    ctx.save();
    ctx.strokeStyle = "rgba(161,161,170,0.3)";
    ctx.setLineDash([2, 4]);
    ctx.beginPath();
    ctx.moveTo(tauX, py1);
    ctx.lineTo(tauX, py0 + 6);
    ctx.stroke();
    ctx.restore();
    label(ctx, `τ = v_t/g′ ≈ ${tauT.toFixed(3)} s`, tauX + 4, py0 + 12, SIM.dim, 9);

    // trace — the exact curve, drawn from t = 0 to now (y normalised to v_t), clipped to the plot rect
    ctx.save();
    ctx.beginPath();
    ctx.rect(px0, py0, px1 - px0, py1 - py0);
    ctx.clip();
    ctx.strokeStyle = SIM.green;
    ctx.lineWidth = 2;
    ctx.shadowColor = SIM.green;
    ctx.shadowBlur = 5;
    ctx.beginPath();
    for (let i = 0; i <= 120; i++) {
      const tt = (i / 120) * s.t;
      const vv = vt * (1 - Math.exp(-tt / tau));
      const xx = px0 + (tt / T_WINDOW) * (px1 - px0);
      const vy = Math.min(1.1, vv / Math.max(vt, 1e-9)) * 0.8; // 80% of plot at v_t
      const yy = py1 - vy * (py1 - py0);
      i === 0 ? ctx.moveTo(xx, yy) : ctx.lineTo(xx, yy);
    }
    ctx.stroke();
    ctx.restore();

    label(ctx, `v_t ∝ r²/η — halve η, double v_t`, w * 0.62, h - 12, SIM.dim, 10);
  });

  return (
    <SimFrame
      title="Viscous drag: terminal velocity"
      about="dv/dt = g′(1 − v/v_t) — exponential approach; v_t = 2r²(ρ−σ)g/9η (Stokes)"
      height={330}
      canvas={<canvas ref={canvasRef} />}
      controls={
        <SimControls>
          <LabeledSlider label="Viscosity η (Pa·s)" value={eta} min={0.05} max={3} step={0.05} onChange={setEta} color="#7FB4CA" />
          <LabeledSlider label="Ball radius r (mm)" value={r} min={0.5} max={4} step={0.1} decimals={1} onChange={setR} color="#E6C384" />
          <ResetButton onClick={() => { state.current = { y: 0, v: 0, t: 0 }; }} />
        </SimControls>
      }
      readouts={
        <>
          <Readout label="Terminal velocity v_t" value={`${vt.toFixed(3)} m/s`} color="#E46876" />
          <Readout label="Time constant τ = v_t/g′" value={`${tau.toFixed(3)} s`} />
          <Readout label="Stokes drag at v_t" value={`${stokesAtVt.toExponential(2)} N`} />
          <Readout label="Scaling" value="v_t ∝ r² · (ρ−σ) / η" color="#98BB6C" />
        </>
      }
    />
  );
}
