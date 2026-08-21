"use client";

import { useState } from "react";
import SimFrame from "@/components/concepts/SimFrame";
import { LabeledSlider, Readout, SimControls } from "@/components/concepts/controls";
import { useCanvas, SIM, clearPanel, label, arrow } from "@/components/concepts/useCanvas";

const WAVE_COLOR = (nm: number) => {
  // approximate visible spectrum colour
  if (nm > 640) return "#ef4444";
  if (nm > 590) return "#f97316";
  if (nm > 560) return "#eab308";
  if (nm > 500) return "#22c55e";
  if (nm > 470) return "#06b6d4";
  return "#6366f1";
};

/** Young's double slit: fringe pattern + intensity curve. */
export default function YDSESIm() {
  const [lambda, setLambda] = useState(550);
  const [d, setD] = useState(0.3); // mm
  const [screenD, setScreenD] = useState(1.2); // m

  const beta = ((lambda * 1e-9 * screenD) / (d * 1e-3) * 1000).toFixed(2); // mm

  const canvasRef = useCanvas((ctx, w, h) => {
    clearPanel(ctx, w, h, false);
    const pad = 26;
    const axisY = h / 2;

    // fringes band (top)
    const bandY = pad;
    const bandH = 64;
    const color = WAVE_COLOR(lambda);
    const betaPx = ((lambda * 1e-9 * screenD) / (d * 1e-3)) * 9000;

    ctx.save();
    for (let x = 0; x < w; x++) {
      const phase = ((x - w / 2) / betaPx) * Math.PI;
      const I = Math.pow(Math.cos(phase / 2), 2);
      // envelope from single-slit
      const env = Math.pow(Math.sinc(((x - w / 2) / (betaPx * 6)) * Math.PI), 2);
      const a = I * env;
      ctx.fillStyle = color;
      ctx.globalAlpha = a;
      ctx.fillRect(x, bandY, 1, bandH);
    }
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = SIM.panelEdge;
    ctx.strokeRect(0, bandY, w, bandH);
    ctx.restore();
    label(ctx, "screen intensity pattern", 10, bandY + bandH + 12, SIM.dim, 9);

    // intensity graph (bottom)
    const py0 = bandY + bandH + 40;
    const py1 = h - pad - 8;
    const px0 = pad;
    const px1 = w - pad;
    ctx.save();
    ctx.strokeStyle = SIM.axis;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px0, py1);
    ctx.lineTo(px1, py1);
    ctx.stroke();
    ctx.restore();

    // central maximum + orders markers
    const orderXs: number[] = [];
    for (let n = -4; n <= 4; n++) orderXs.push(w / 2 + n * betaPx);
    ctx.save();
    ctx.strokeStyle = "rgba(161,161,170,0.25)";
    orderXs.forEach((x) => {
      if (x < px0 || x > px1) return;
      ctx.beginPath();
      ctx.moveTo(x, py0 - 6);
      ctx.lineTo(x, py1);
      ctx.stroke();
    });
    ctx.restore();

    // intensity curve
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.shadowColor = color;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    for (let x = px0; x <= px1; x += 2) {
      const phase = ((x - w / 2) / betaPx) * Math.PI;
      const I = Math.pow(Math.cos(phase / 2), 2);
      const env = Math.pow(Math.sinc(((x - w / 2) / (betaPx * 6)) * Math.PI), 2);
      const y = py1 - I * env * (py1 - py0);
      x === px0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();

    // labels
    label(ctx, "I(y)", px0 + 2, py0 - 12, SIM.dim, 10);
    [-2, -1, 0, 1, 2].forEach((n) => {
      const x = w / 2 + n * betaPx;
      if (x > px0 + 8 && x < px1 - 8) label(ctx, n === 0 ? "n=0" : `n=${n > 0 ? "+" : ""}${n}`, x, py1 + 12, SIM.dim, 9, "center");
    });
    // fringe width bracket between n=0 and n=1, inside the plot
    if (betaPx > 24) {
      const byy = py0 + 14;
      arrow(ctx, w / 2, byy, w / 2 + betaPx, byy, SIM.bright, 1.6);
      arrow(ctx, w / 2 + betaPx, byy, w / 2, byy, SIM.bright, 1.6);
      label(ctx, `β = ${beta} mm`, w / 2 + betaPx / 2, byy - 9, SIM.bright, 10, "center");
    }
  });

  return (
    <SimFrame
      title="Young's double slit"
      about="Fringes at Δ = nλ · brighter central band · β = λD/d — try red vs blue light"
      height={300}
      canvas={<canvas ref={canvasRef} />}
      controls={
        <SimControls>
          <LabeledSlider label="Wavelength λ (nm)" value={lambda} min={400} max={700} step={5} decimals={0} onChange={setLambda} color={WAVE_COLOR(lambda)} />
          <LabeledSlider label="Slit separation d (mm)" value={d} min={0.1} max={0.8} step={0.01} onChange={setD} />
          <LabeledSlider label="Screen distance D (m)" value={screenD} min={0.5} max={2.5} step={0.05} onChange={setScreenD} color="#98BB6C" />
        </SimControls>
      }
      readouts={
        <>
          <Readout label="Fringe width β" value={`${beta} mm`} color={WAVE_COLOR(lambda)} />
          <Readout label="Path diff rule" value="bright: nλ · dark: (n+½)λ" />
          <Readout label="Water immersion" value="β shrinks ×1/n" color="#7FB4CA" />
        </>
      }
    />
  );
}

// Math.sinc polyfill
declare global {
  interface Math {
    sinc(x: number): number;
  }
}
Math.sinc = (x: number) => (x === 0 ? 1 : Math.sin(x) / x);
