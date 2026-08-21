"use client";

import { useState } from "react";
import SimFrame from "@/components/concepts/SimFrame";
import { LabeledSlider, Readout, SimControls, SimToggleGroup } from "@/components/concepts/controls";
import { useCanvas, SIM, clearPanel, label } from "@/components/concepts/useCanvas";

/** Diode rectifier: compare input AC with half/full-wave rectified output. */
export default function RectifierSim() {
  const [mode, setMode] = useState<"half" | "full">("full");
  const [vpk, setVpk] = useState(5);
  const [f, setF] = useState(1);
  const [smoothing, setSmoothing] = useState(0);

  const canvasRef = useCanvas((ctx, w, h, _t, dt) => {
    clearPanel(ctx, w, h);
    const pad = 30;
    const t = (performance.now() / 1000) * f;
    const T_SHOWN = 3; // cycles
    const px0 = pad;
    const px1 = w - pad;
    const mid = h / 2;

    // split panes
    const topY0 = pad + 6;
    const topY1 = mid - 8;
    const botY0 = mid + 20;
    const botY1 = h - pad - 6;

    const xOf = (tt: number) => px0 + (tt / T_SHOWN) * (px1 - px0);
    const ph = (tt: number) => vpk * Math.sin(2 * Math.PI * tt);

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

    // input sine
    ctx.save();
    ctx.strokeStyle = SIM.amber;
    ctx.lineWidth = 2;
    ctx.shadowColor = SIM.amber;
    ctx.shadowBlur = 5;
    ctx.beginPath();
    for (let i = 0; i <= 300; i++) {
      const tt = (i / 300) * T_SHOWN;
      const y = topY0 + (topY1 - topY0) / 2 - (ph(tt) / vpk) * ((topY1 - topY0) / 2 - 4);
      i === 0 ? ctx.moveTo(xOf(tt), y) : ctx.lineTo(xOf(tt), y);
    }
    ctx.stroke();
    ctx.restore();
    label(ctx, `V₀ = ${vpk.toFixed(1)} V`, px1 - 4, topY0 + 10, SIM.amber, 10, "right");

    // output
    ctx.save();
    ctx.strokeStyle = SIM.green;
    ctx.lineWidth = 2.2;
    ctx.shadowColor = SIM.green;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    let lastY: number | null = null;
    for (let i = 0; i <= 300; i++) {
      const tt = (i / 300) * T_SHOWN;
      const raw = ph(tt);
      let out = mode === "half" ? Math.max(0, raw) : Math.abs(raw);
      // smoothing: RC low-pass blend
      if (lastY != null) out = lastY + (out - lastY) * Math.max(0.08, 1 - smoothing * 0.97);
      lastY = out;
      const y = botY0 + (botY1 - botY0) / 2 - (out / vpk) * ((botY1 - botY0) / 2 - 4);
      i === 0 ? ctx.moveTo(xOf(tt), y) : ctx.lineTo(xOf(tt), y);
    }
    ctx.stroke();
    ctx.restore();

    // diode conduction shading on input (shows which halves conduct)
    ctx.save();
    ctx.fillStyle = "rgba(52,211,153,0.08)";
    for (let i = 0; i <= 300; i += 1) {
      const tt = (i / 300) * T_SHOWN;
      const raw = ph(tt);
      const conducts = mode === "half" ? raw > 0 : true;
      if (conducts) ctx.fillRect(xOf(tt), topY0, (px1 - px0) / 300 + 1, topY1 - topY0);
    }
    ctx.restore();

    label(ctx, smoothing > 0.2 ? "capacitor smooths the ripple toward DC" : "ripple frequency: half = f, full = 2f", w / 2, h - 12, SIM.dim, 10, "center");
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
          <Readout label="DC average" value={mode === "half" ? `${(vpk / Math.PI).toFixed(2)} V` : `${((2 * vpk) / Math.PI).toFixed(2)} V`} />
          <Readout label="Efficiency cap" value={mode === "half" ? "40.6%" : "81.2%"} />
        </>
      }
    />
  );
}
