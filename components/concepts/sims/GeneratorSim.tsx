"use client";

import { useRef, useState } from "react";
import SimFrame from "@/components/concepts/SimFrame";
import { LabeledSlider, Readout, SimControls, ResetButton } from "@/components/concepts/controls";
import { useCanvas, SIM, clearPanel, label, circle } from "@/components/concepts/useCanvas";

/** AC generator: coil rotates in B; emf sinusoid traced with RMS markers. */
export default function GeneratorSim() {
  const [omega, setOmega] = useState(2);
  const [B, setB] = useState(1);
  const state = useRef({ ang: 0, trace: [] as { t: number; emf: number }[], t: 0 });
  const params = useRef({ omega, B });
  if (params.current.omega !== omega || params.current.B !== B) {
    params.current = { omega, B };
    state.current = { ang: state.current.ang, trace: [], t: 0 };
  }

  const eps0 = B * omega; // NBAω with NA=1

  const canvasRef = useCanvas((ctx, w, h, _t, dt) => {
    const s = state.current;
    s.ang += omega * dt;
    s.t += dt;
    const emf = eps0 * Math.sin(s.ang);
    s.trace.push({ t: s.t, emf });
    if (s.trace.length > 700) s.trace.shift();
    const T_MAX = 12;

    clearPanel(ctx, w, h);
    const pad = 26;

    // ---- coil view (left) ----
    const vw = w * 0.36;
    const cx = vw / 2 + 10;
    const cy = h / 2;
    const R = Math.min(vw, h) * 0.3;

    // field lines
    ctx.save();
    ctx.strokeStyle = "rgba(251,191,36,0.4)";
    ctx.lineWidth = 1.2;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(cx - R - 50, cy + i * 26);
      ctx.lineTo(cx + R + 50, cy + i * 26);
      ctx.stroke();
    }
    ctx.restore();
    label(ctx, "B →", cx + R + 30, cy - 64, SIM.amber, 11);

    // rotating coil (projected ellipse), tilt = angle from normal... use sin for spin
    const sq = Math.abs(Math.cos(s.ang));
    ctx.save();
    ctx.translate(cx, cy);
    ctx.strokeStyle = SIM.indigo;
    ctx.lineWidth = 2.4;
    ctx.shadowColor = SIM.indigo;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.ellipse(0, 0, R, R * (0.18 + 0.82 * sq), s.ang, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // current direction dots
    const iDir = Math.cos(s.ang) > 0 ? 1 : -1;
    void iDir;
    circle(ctx, cx, cy - R * (0.18 + 0.82 * sq), 5, SIM.red, true);
    circle(ctx, cx, cy + R * (0.18 + 0.82 * sq), 5, SIM.sky, true);
    label(ctx, "θ = ωt", cx, cy + R + 28, SIM.dim, 10, "center");
    label(ctx, "flux Φ = NBA·cos ωt", cx, 24, SIM.text, 11, "center");

    // divider
    ctx.save();
    ctx.strokeStyle = SIM.panelEdge;
    ctx.beginPath();
    ctx.moveTo(w * 0.4, 12);
    ctx.lineTo(w * 0.4, h - 12);
    ctx.stroke();
    ctx.restore();

    // ---- emf plot (right) ----
    const px0 = w * 0.4 + 24;
    const px1 = w - pad;
    const py0 = pad + 14;
    const py1 = h - pad - 14;
    ctx.save();
    ctx.strokeStyle = SIM.axis;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px0, (py0 + py1) / 2);
    ctx.lineTo(px1, (py0 + py1) / 2);
    ctx.moveTo(px0, py0);
    ctx.lineTo(px0, py1);
    ctx.stroke();
    ctx.restore();
    label(ctx, "ε(t)", px0 + 4, py0 - 6, SIM.dim, 10);

    const tMin = Math.max(0, s.t - T_MAX);
    // RMS band
    const rms = eps0 / Math.SQRT2;
    const yOf = (v: number) => (py0 + py1) / 2 - (v / Math.max(eps0, 0.01)) * ((py1 - py0) / 2 - 6);
    ctx.save();
    ctx.strokeStyle = "rgba(52,211,153,0.5)";
    ctx.setLineDash([4, 4]);
    [rms, -rms].forEach((v) => {
      ctx.beginPath();
      ctx.moveTo(px0, yOf(v));
      ctx.lineTo(px1, yOf(v));
      ctx.stroke();
    });
    ctx.restore();
    label(ctx, `ε_rms = ε₀/√2 = ${rms.toFixed(2)} V`, px1 - 4, yOf(rms) - 9, SIM.green, 10, "right");

    // sine trace
    ctx.save();
    ctx.strokeStyle = SIM.green;
    ctx.lineWidth = 2;
    ctx.shadowColor = SIM.green;
    ctx.shadowBlur = 5;
    ctx.beginPath();
    s.trace.forEach((p, i) => {
      if (p.t < tMin) return;
      const xx = px0 + ((p.t - tMin) / T_MAX) * (px1 - px0);
      i === 0 ? ctx.moveTo(xx, yOf(p.emf)) : ctx.lineTo(xx, yOf(p.emf));
    });
    ctx.stroke();
    ctx.restore();
    label(ctx, `ε₀ = NBAω = ${eps0.toFixed(2)} V`, px0 + 8, py0 + 12, SIM.green, 10);
  });

  return (
    <SimFrame
      title="AC generator & sinusoid"
      about="Rotating coil sweeps flux cos ωt → emf ε₀ sin ωt. RMS sits at ε₀/√2."
      height={320}
      canvas={<canvas ref={canvasRef} />}
      controls={
        <SimControls>
          <LabeledSlider label="Rotation ω (rad/s)" value={omega} min={0.5} max={6} step={0.05} onChange={setOmega} />
          <LabeledSlider label="Field B (T)" value={B} min={0.5} max={3} step={0.05} onChange={setB} color="#E6C384" />
          <ResetButton onClick={() => { state.current = { ang: 0, trace: [], t: 0 }; }} />
        </SimControls>
      }
      readouts={
        <>
          <Readout label="Peak emf ε₀ = NBAω" value={`${eps0.toFixed(2)} V`} color="#98BB6C" />
          <Readout label="RMS emf" value={`${(eps0 / Math.SQRT2).toFixed(2)} V`} />
          <Readout label="Frequency f = ω/2π" value={`${(omega / (2 * Math.PI)).toFixed(2)} Hz`} />
        </>
      }
    />
  );
}
