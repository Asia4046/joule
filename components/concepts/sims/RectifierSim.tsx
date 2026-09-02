"use client";

import { useRef, useState } from "react";
import SimFrame from "@/components/concepts/SimFrame";
import { LabeledSlider, Readout, SimControls, SimToggleGroup } from "@/components/concepts/controls";
import { useCanvas, SIM, clearPanel, label } from "@/components/concepts/useCanvas";

/** Diode rectifier: compare input AC with half/full-wave rectified output; capacitor holds the peaks. */
export default function RectifierSim() {
  const [mode, setMode] = useState<"half" | "full">("full");
  const [vpk, setVpk] = useState(5);
  const [f, setF] = useState(1);
  const [smoothing, setSmoothing] = useState(0);

  const state = useRef({ t: 0 });

  const canvasRef = useCanvas((ctx, w, h, _t, dt) => {
    const s = state.current;
    s.t += dt;
    clearPanel(ctx, w, h);
    const pad = 30;
    const T_SHOWN = 3; // seconds of real time on the x-axis
    const t0 = s.t; // left edge of the scrolling window
    const px0 = pad;
    const px1 = w - pad;
    const mid = h / 2;

    // split panes
    const topY0 = pad + 6;
    const topY1 = mid - 8;
    const botY0 = mid + 20;
    const botY1 = h - pad - 6;

    const xOf = (tt: number) => px0 + ((tt - t0) / T_SHOWN) * (px1 - px0);
    // absolute volts scale shared by both panes — full height = slider max, so V₀ is visible
    const V_MAX = 12;
    const voltsToPx = Math.min((topY1 - topY0) / 2 - 4, (botY1 - botY0) / 2 - 4) / V_MAX;
    const raw = (tt: number) => vpk * Math.sin(2 * Math.PI * f * tt);
    const rectified = (tt: number) => (mode === "half" ? Math.max(0, raw(tt)) : Math.abs(raw(tt)));

    // Peak-detector with capacitor: the cap charges to each rectified peak (ideal diode),
    // then decays as v = V₀·e^(−t/τ) until the rising input catches it again. Solved in
    // closed form per ripple interval, so the steady state is exact and f-dependent:
    // τ is fixed by the slider in seconds, so higher f (shorter gaps) → less ripple.
    const tau = smoothing * 0.8; // s
    const lobeZ = mode === "full" ? 1 / (2 * f) : 1 / f; // spacing of rectified-input zeros
    const outAt = (tt: number) => {
      if (tau < 1e-3) return rectified(tt);
      const k = Math.floor(tt / lobeZ);
      const tz = k * lobeZ; // start of the conducting lobe containing tt
      const tp = tz + 1 / (4 * f); // its peak
      if (tt > tp) return vpk * Math.exp(-(tt - tp) / tau); // discharging from the peak
      // still in the rising part: cap (decayed across the lobe gap) until the input catches it
      const v0 = vpk * Math.exp(-(lobeZ - 1 / (4 * f)) / tau);
      let lo = 0;
      let hi = 1 / (4 * f);
      const r = v0 / vpk;
      for (let i = 0; i < 30; i++) {
        const midU = (lo + hi) / 2;
        // input V₀·sin(2πf·u) rises monotonic vs decaying cap r·e^(−u/τ) — bisect the crossing
        if (Math.sin(2 * Math.PI * f * midU) < r * Math.exp(-midU / tau)) lo = midU;
        else hi = midU;
      }
      const u = tt - tz;
      return u < (lo + hi) / 2 ? v0 * Math.exp(-u / tau) : rectified(tt);
    };

    // axes
    [topY0 + (topY1 - topY0) / 2, botY0 + (botY1 - botY0) / 2].forEach((yy) => {
      ctx.save();
      ctx.strokeStyle = SIM.axis;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px0, yy);
      ctx.lineTo(px1, yy);
      ctx.stroke();
      ctx.restore();
    });
    label(ctx, "input  v(t) = V₀ sin ωt", px0 + 4, topY0 - 2, SIM.dim, 10);
    label(ctx, mode === "half" ? "output — half-wave (one diode)" : "output — full-wave (bridge)", px0 + 4, botY0 - 2, SIM.dim, 10);

    // input sine (scrolling)
    ctx.save();
    ctx.strokeStyle = SIM.amber;
    ctx.lineWidth = 2;
    ctx.shadowColor = SIM.amber;
    ctx.shadowBlur = 5;
    ctx.beginPath();
    for (let i = 0; i <= 300; i++) {
      const tt = t0 + (i / 300) * T_SHOWN;
      const y = topY0 + (topY1 - topY0) / 2 - raw(tt) * voltsToPx;
      i === 0 ? ctx.moveTo(xOf(tt), y) : ctx.lineTo(xOf(tt), y);
    }
    ctx.stroke();
    ctx.restore();
    label(ctx, `V₀ = ${vpk.toFixed(1)} V · axis 0–${V_MAX} V`, px1 - 4, topY0 + 10, SIM.amber, 10, "right");

    // unsmoothed rectified reference (faint) whenever the capacitor is active
    if (smoothing > 0.05) {
      ctx.save();
      ctx.strokeStyle = "rgba(152,187,108,0.3)";
      ctx.setLineDash([3, 4]);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let i = 0; i <= 300; i++) {
        const tt = t0 + (i / 300) * T_SHOWN;
        const y = botY0 + (botY1 - botY0) / 2 - rectified(tt) * voltsToPx;
        i === 0 ? ctx.moveTo(xOf(tt), y) : ctx.lineTo(xOf(tt), y);
      }
      ctx.stroke();
      ctx.restore();
    }

    // output (scrolling)
    ctx.save();
    ctx.strokeStyle = SIM.green;
    ctx.lineWidth = 2.2;
    ctx.shadowColor = SIM.green;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    for (let i = 0; i <= 300; i++) {
      const tt = t0 + (i / 300) * T_SHOWN;
      const out = outAt(tt);
      const y = botY0 + (botY1 - botY0) / 2 - out * voltsToPx;
      i === 0 ? ctx.moveTo(xOf(tt), y) : ctx.lineTo(xOf(tt), y);
    }
    ctx.stroke();
    ctx.restore();

    // diode conduction shading on input (shows which halves conduct)
    ctx.save();
    ctx.fillStyle = "rgba(52,211,153,0.08)";
    for (let i = 0; i <= 300; i += 1) {
      const tt = t0 + (i / 300) * T_SHOWN;
      const conducts = mode === "half" ? raw(tt) > 0 : true;
      if (conducts) ctx.fillRect(xOf(tt), topY0, (px1 - px0) / 300 + 1, topY1 - topY0);
    }
    ctx.restore();

    label(ctx, smoothing > 0.2 ? "capacitor holds the peaks — gap ∝ τ, sag ∝ 1/f" : "ripple frequency: half = f, full = 2f", w / 2, h - 12, SIM.dim, 10, "center");
  });

  const rippleF = mode === "half" ? f : 2 * f;

  return (
    <SimFrame
      title="Diode rectifier"
      about="The diode passes only forward bias; a bridge flips the negative half up"
      height={300}
      canvas={<canvas ref={canvasRef} />}
      controls={
        <SimControls>
          <LabeledSlider label="Peak voltage V₀ (V)" value={vpk} min={1} max={12} step={0.5} decimals={1} onChange={setVpk} color="#E6C384" />
          <LabeledSlider label="Frequency f (Hz)" value={f} min={0.5} max={3} step={0.1} decimals={1} onChange={setF} />
          <LabeledSlider label="Capacitor smoothing" value={smoothing} min={0} max={1} step={0.05} onChange={setSmoothing} color="#7FB4CA" />
          <SimToggleGroup
            label="Circuit"
            value={mode}
            options={[
              { value: "half", label: "Half-wave" },
              { value: "full", label: "Full-wave" },
            ]}
            onChange={(v) => setMode(v)}
          />
        </SimControls>
      }
      readouts={
        <>
          <Readout label="Ripple frequency" value={`${rippleF.toFixed(1)} Hz`} color="#98BB6C" />
          <Readout label="DC average (no cap)" value={mode === "half" ? `${(vpk / Math.PI).toFixed(2)} V` : `${((2 * vpk) / Math.PI).toFixed(2)} V`} />
          <Readout label="Efficiency cap" value={mode === "half" ? "40.6%" : "81.2%"} />
        </>
      }
    />
  );
}
