"use client";

import { useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import SimFrame from "@/components/concepts/SimFrame";
import { LabeledSlider, Readout, SimControls, SimToggleGroup, ResetButton } from "@/components/concepts/controls";
import { useCanvas, SIM, clearPanel, label, arrow } from "@/components/concepts/useCanvas";

/**
 * Damped & forced harmonic oscillator — the flagship sim.
 * Left: spring–mass animation. Right: x(t) trace with decaying envelope,
 * plus the regime label, Q factor and (forced) steady-state amplitude.
 */
export default function DampedOscillatorSim() {
  const [zeta, setZeta] = useState(0.15);
  const [omega0, setOmega0] = useState(2.0);
  const [driven, setDriven] = useState<"free" | "forced">("free");
  const [drive, setDrive] = useState(2.0);

  const state = useRef({ x: 1, v: 0, trace: [] as { t: number; x: number }[], t: 0 });

  // reset on any param change
  const params = useRef({ zeta, omega0, driven, drive });
  if (
    params.current.zeta !== zeta ||
    params.current.omega0 !== omega0 ||
    params.current.driven !== driven ||
    params.current.drive !== drive
  ) {
    params.current = { zeta, omega0, driven, drive };
    state.current = { x: 1, v: 0, trace: [], t: 0 };
  }

  const omegaD = omega0 * Math.sqrt(Math.max(0, 1 - zeta * zeta));
  const regime = zeta < 0.999 ? "UNDERDAMPED" : zeta < 1.001 ? "CRITICALLY DAMPED" : "OVERDAMPED";
  const Q = 1 / (2 * Math.max(zeta, 1e-6));
  const steadyAmp = driven === "forced" && zeta > 0.02
    ? 1 / Math.sqrt(Math.pow(omega0 * omega0 - drive * drive, 2) + Math.pow(2 * zeta * omega0 * drive, 2))
    : null;

  const canvasRef = useCanvas((ctx, w, h, _t, dt) => {
    const s = state.current;
    // physics: x'' = -ω₀²x - 2ζω₀ x' + F₀cos(Ωt)
    const sub = 4;
    const ddt = dt / sub;
    for (let i = 0; i < sub; i++) {
      const a =
        -omega0 * omega0 * s.x -
        2 * zeta * omega0 * s.v +
        (driven === "forced" ? 1.0 * Math.cos(drive * s.t) : 0);
      s.v += a * ddt;
      s.x += s.v * ddt;
      s.t += ddt;
    }
    s.trace.push({ t: s.t, x: s.x });
    const T_MAX = 20;
    while (s.trace.length > 2 && s.trace[1].t < s.t - T_MAX) s.trace.shift();

    clearPanel(ctx, w, h);
    const pad = 14;

    // ---- left half: spring + mass ----
    const lw = w * 0.42;
    const anchorY = h / 2;
    const xPix = lw / 2 + s.x * (lw / 2 - 50);
    // wall
    ctx.save();
    ctx.strokeStyle = SIM.axis;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pad, anchorY - 46);
    ctx.lineTo(pad, anchorY + 46);
    ctx.stroke();
    ctx.restore();
    // equilibrium marker
    ctx.save();
    ctx.strokeStyle = "rgba(148,163,184,0.3)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(lw / 2, pad + 14);
    ctx.lineTo(lw / 2, h - pad - 14);
    ctx.stroke();
    ctx.restore();
    label(ctx, "x = 0", lw / 2 + 4, pad + 16, SIM.dim, 10);

    // spring (zigzag)
    ctx.save();
    ctx.strokeStyle = SIM.sky;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    const sx0 = pad;
    const sx1 = xPix - 20;
    const coils = 9;
    ctx.moveTo(sx0, anchorY);
    for (let i = 1; i <= coils * 2; i++) {
      const p = sx0 + ((sx1 - sx0) * i) / (coils * 2);
      ctx.lineTo(p, anchorY + (i % 2 === 0 ? 0 : i % 4 === 1 ? -16 : 16));
    }
    ctx.lineTo(sx1, anchorY);
    ctx.stroke();
    ctx.restore();

    // mass
    ctx.save();
    ctx.fillStyle = SIM.indigo;
    ctx.shadowColor = SIM.indigo;
    ctx.shadowBlur = 14;
    ctx.fillRect(xPix - 20, anchorY - 20, 40, 40);
    ctx.restore();
    label(ctx, "m", xPix, anchorY, SIM.white, 12, "center");

    // x arrow
    arrow(ctx, lw / 2, h - 34, lw / 2 + s.x * 60, h - 34, SIM.amber, 2);
    label(ctx, `x = ${s.x.toFixed(2)}`, lw / 2, h - 50, SIM.amber, 10, "center");

    // driving force indicator
    if (driven === "forced") {
      const f = Math.cos(drive * s.t);
      arrow(ctx, xPix, anchorY - 34, xPix, anchorY - 34 - f * 26, SIM.red, 2);
      label(ctx, "F(t)", xPix + 6, anchorY - 48, SIM.red, 10);
    }

    // divider
    ctx.save();
    ctx.strokeStyle = SIM.panelEdge;
    ctx.beginPath();
    ctx.moveTo(w * 0.46, 10);
    ctx.lineTo(w * 0.46, h - 10);
    ctx.stroke();
    ctx.restore();

    // ---- right half: x(t) plot ----
    const px0 = w * 0.46 + 26;
    const px1 = w - pad;
    const py0 = pad + 20;
    const py1 = h - pad - 16;
    const plotW = px1 - px0;
    const plotH = py1 - py0;
    const tMin = Math.max(0, s.t - T_MAX);
    const X_MAX = 1.6;

    // axes
    ctx.save();
    ctx.strokeStyle = SIM.axis;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px0, py0 + plotH / 2);
    ctx.lineTo(px1, py0 + plotH / 2);
    ctx.stroke();
    ctx.restore();
    label(ctx, "x(t)", px0, py0 - 8, SIM.dim, 10);

    // envelope e^{-ζω₀t}
    ctx.save();
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = "rgba(251,191,36,0.55)";
    ctx.beginPath();
    for (let i = 0; i <= 100; i++) {
      const tt = tMin + (T_MAX * i) / 100;
      const env = Math.exp(-zeta * omega0 * tt) * 1;
      const xx = px0 + ((tt - tMin) / T_MAX) * plotW;
      ctx.lineTo(xx, py0 + plotH / 2 - (env / X_MAX) * (plotH / 2));
    }
    ctx.stroke();
    ctx.beginPath();
    for (let i = 0; i <= 100; i++) {
      const tt = tMin + (T_MAX * i) / 100;
      const env = Math.exp(-zeta * omega0 * tt);
      const xx = px0 + ((tt - tMin) / T_MAX) * plotW;
      ctx.lineTo(xx, py0 + plotH / 2 + (env / X_MAX) * (plotH / 2));
    }
    ctx.stroke();
    ctx.restore();
    label(ctx, "±A·e^(−ζω₀t)", px1 - 4, py0 + 6, "rgba(251,191,36,0.8)", 10, "right");

    // steady-state amplitude band (forced)
    if (steadyAmp) {
      ctx.save();
      ctx.fillStyle = "rgba(248,113,113,0.10)";
      ctx.fillRect(px0, py0 + plotH / 2 - (steadyAmp / X_MAX) * (plotH / 2), plotW, (steadyAmp / X_MAX) * plotH);
      ctx.restore();
    }

    // trace
    ctx.save();
    ctx.strokeStyle = SIM.indigo;
    ctx.lineWidth = 2;
    ctx.shadowColor = SIM.indigo;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    let started = false;
    for (const p of s.trace) {
      if (p.t < tMin) continue;
      const xx = px0 + ((p.t - tMin) / T_MAX) * plotW;
      const yy = py0 + plotH / 2 - (Math.max(-X_MAX, Math.min(X_MAX, p.x)) / X_MAX) * (plotH / 2);
      if (!started) {
        ctx.moveTo(xx, yy);
        started = true;
      } else ctx.lineTo(xx, yy);
    }
    ctx.stroke();
    ctx.restore();
  });

  return (
    <SimFrame
      title="Damped & forced oscillator"
      about="Mass–spring with adjustable damping ζ and optional sinusoidal drive"
      height={330}
      canvas={<canvas ref={canvasRef} />}
      controls={
        <SimControls>
          <LabeledSlider label="Damping ratio ζ" value={zeta} min={0.02} max={2.5} step={0.01} onChange={setZeta} />
          <LabeledSlider label="Natural ω₀ (rad/s)" value={omega0} min={0.5} max={5} step={0.05} onChange={setOmega0} color="#38bdf8" />
          {driven === "forced" && (
            <LabeledSlider label="Drive Ω (rad/s)" value={drive} min={0.2} max={6} step={0.05} onChange={setDrive} color="#f87171" />
          )}
          <Box sx={{ minWidth: 160 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mb: 0.25 }}>
              Excitation
            </Typography>
            <SimToggleGroup
              label=""
              value={driven}
              options={[
                { value: "free", label: "Free" },
                { value: "forced", label: "Forced" },
              ]}
              onChange={(v) => setDriven(v)}
            />
          </Box>
          <ResetButton onClick={() => { state.current = { x: 1, v: 0, trace: [], t: 0 }; }} />
        </SimControls>
      }
      readouts={
        <>
          <Readout label="Regime" value={regime} color={zeta < 0.999 ? "#34d399" : zeta < 1.001 ? "#fbbf24" : "#f87171"} />
          <Readout label="ω_d (rad/s)" value={zeta < 1 ? omegaD.toFixed(3) : "—"} />
          <Readout label="Q factor" value={zeta < 1 ? Q.toFixed(2) : "—"} />
          {driven === "forced" && <Readout label="Steady amplitude" value={steadyAmp ? steadyAmp.toFixed(3) : "—"} color="#f87171" />}
        </>
      }
    />
  );
}
