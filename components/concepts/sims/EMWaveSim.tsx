"use client";

import { useState } from "react";
import SimFrame from "@/components/concepts/SimFrame";
import { LabeledSlider, Readout, SimControls } from "@/components/concepts/controls";
import { useCanvas, SIM, clearPanel, label, arrow, circle } from "@/components/concepts/useCanvas";

/** EM wave: coupled E (vertical, red) and B (horizontal, blue) oscillations travelling right. */
export default function EMWaveSim() {
  const [lambda, setLambda] = useState(140);
  const [amp, setAmp] = useState(40);
  const [speed, setSpeed] = useState(1);
  const [pause, setPause] = useState(false);
  const tRef = { current: 0 };

  const f = 1 / lambda; // arbitrary units with v=1

  const canvasRef = useCanvas((ctx, w, h, _t, dt) => {
    if (!pause) tRef.current += dt * speed * 60;
    const t = tRef.current;
    clearPanel(ctx, w, h);
    const cx = w / 2;
    const cy = h / 2;
    const k = (2 * Math.PI) / lambda;
    const x0 = 40;
    const x1 = w - 30;

    // propagation axis
    ctx.save();
    ctx.strokeStyle = SIM.axis;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x0, cy);
    ctx.lineTo(x1, cy);
    ctx.stroke();
    ctx.restore();
    arrow(ctx, x1 - 46, cy, x1, cy, SIM.text, 1.6);
    label(ctx, "c", x1 - 20, cy - 12, SIM.text, 11, "center");

    // E field (vertical)
    ctx.save();
    ctx.strokeStyle = SIM.red;
    ctx.lineWidth = 2;
    ctx.shadowColor = SIM.red;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    for (let x = x0; x <= x1 - 50; x += 3) {
      const y = cy - amp * Math.sin(k * (x - x0) - t * 0.08);
      x === x0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
    label(ctx, "E (electric)", x0 + 6, cy - amp - 14, SIM.red, 11);

    // B field (horizontal, drawn as depth-projected diagonals)
    ctx.save();
    ctx.strokeStyle = SIM.sky;
    ctx.lineWidth = 2;
    ctx.shadowColor = SIM.sky;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    for (let x = x0; x <= x1 - 50; x += 3) {
      const b = amp * 0.7 * Math.sin(k * (x - x0) - t * 0.08);
      // project depth onto 45° so B appears perpendicular to both E and propagation
      const dx = b * 0.5;
      const dy = -b * 0.5;
      x === x0 ? ctx.moveTo(x + dx, cy + dy) : ctx.lineTo(x + dx, cy + dy);
    }
    ctx.stroke();
    ctx.restore();
    label(ctx, "B (magnetic, in phase)", x0 + 6, cy + amp * 0.7 + 18, SIM.sky, 11);

    // sample field vectors along the axis
    for (let i = 0; i < 8; i++) {
      const x = x0 + 30 + i * ((x1 - 60 - x0) / 7);
      const ph = Math.sin(k * (x - x0) - t * 0.08);
      const ey = cy - ph * amp * 0.55;
      arrow(ctx, x, cy, x, ey, "rgba(248,113,113,0.6)", 1.4);
      const b = ph * amp * 0.4;
      arrow(ctx, x, cy, x + b * 0.5, cy - b * 0.5, "rgba(56,189,248,0.6)", 1.4);
      void ey;
    }
    circle(ctx, x0 + 30 + 3 * ((x1 - 60 - x0) / 7), cy, 2, SIM.white);

    label(ctx, "E ⊥ B ⊥ c — transverse, in phase, E₀ = cB₀", w / 2, h - 14, SIM.dim, 10, "center");
    label(ctx, `λ = ${lambda.toFixed(0)} px   ·   c = fλ (fixed c ⇒ f ∝ 1/λ)`, w / 2, 24, SIM.text, 11, "center");
  });

  return (
    <SimFrame
      title="EM wave propagator"
      about="Self-sustaining perpendicular E and B fields racing along at c"
      height={320}
      canvas={<canvas ref={canvasRef} />}
      controls={
        <SimControls>
          <LabeledSlider label="Wavelength λ" value={lambda} min={60} max={300} step={5} decimals={0} onChange={setLambda} />
          <LabeledSlider label="Amplitude" value={amp} min={15} max={55} step={1} decimals={0} onChange={setAmp} color="#f87171" />
          <LabeledSlider label="Animation speed" value={speed} min={0} max={3} step={0.1} decimals={1} onChange={setSpeed} color="#34d399" />
          <Readout label="State" value={pause ? "Paused" : "Running"} color={pause ? "#fbbf24" : "#34d399"} />
        </SimControls>
      }
      readouts={
        <>
          <Readout label="Frequency (v = 1)" value={f.toFixed(4)} />
          <Readout label="Speed" value="c = 3×10⁸ m/s in vacuum" />
          <Readout label="Relation" value="E₀ = c·B₀" color="#34d399" />
        </>
      }
    />
  );
}
