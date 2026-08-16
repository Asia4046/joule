"use client";

import { useRef, useState } from "react";
import SimFrame from "@/components/concepts/SimFrame";
import { LabeledSlider, Readout, SimControls, ResetButton } from "@/components/concepts/controls";
import { useCanvas, SIM, clearPanel, label } from "@/components/concepts/useCanvas";

/** Measurement error lab: sample a rod with chosen least count; histogram + mean ± σ. */
export default function ErrorSim() {
  const [leastCount, setLeastCount] = useState(0.1); // mm
  const [n, setN] = useState(20);
  const TRUE = 50.0; // mm
  const state = useRef({ samples: [] as number[], acc: 0 });

  const samples = state.current.samples;
  const mean = samples.length ? samples.reduce((a, b) => a + b, 0) / samples.length : 0;
  const std = samples.length > 1
    ? Math.sqrt(samples.reduce((a, b) => a + (b - mean) ** 2, 0) / (samples.length - 1))
    : 0;
  const sem = samples.length ? std / Math.sqrt(samples.length) : 0;

  const takeSamples = () => {
    const out: number[] = [];
    for (let i = 0; i < n; i++) {
      const noise = (Math.random() - 0.5) * 2 * 0.25; // random error ±0.25mm
      const raw = TRUE + noise;
      out.push(Math.round(raw / leastCount) * leastCount);
    }
    state.current.samples = out;
  };
  if (state.current.samples.length !== n) takeSamples();

  const canvasRef = useCanvas((ctx, w, h) => {
    clearPanel(ctx, w, h, false);
    const pad = 34;
    const s = state.current.samples;
    const meanL = s.length ? s.reduce((a, b) => a + b, 0) / s.length : 0;

    // histogram
    const x0 = pad;
    const x1 = w * 0.62;
    const y0 = pad + 8;
    const y1 = h - pad - 16;
    const lo = TRUE - 0.9;
    const hi = TRUE + 0.9;
    const bins = 18;
    const counts = new Array(bins).fill(0);
    s.forEach((v) => {
      const bi = Math.floor(((v - lo) / (hi - lo)) * bins);
      if (bi >= 0 && bi < bins) counts[bi]++;
    });
    const maxC = Math.max(1, ...counts);

    // axes
    ctx.save();
    ctx.strokeStyle = SIM.axis;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x0, y1);
    ctx.lineTo(x1, y1);
    ctx.moveTo(x0, y0);
    ctx.lineTo(x0, y1);
    ctx.stroke();
    ctx.restore();
    label(ctx, "frequency", x0 - 6, y0 - 8, SIM.dim, 10);
    label(ctx, `reading (mm) — true value ${TRUE.toFixed(1)}`, (x0 + x1) / 2, h - 14, SIM.dim, 10, "center");

    // bars
    const bw = (x1 - x0) / bins;
    counts.forEach((c, i) => {
      if (!c) return;
      const bh = (c / maxC) * (y1 - y0 - 10);
      ctx.save();
      ctx.fillStyle = "rgba(129,140,248,0.75)";
      ctx.shadowColor = SIM.indigo;
      ctx.shadowBlur = 5;
      ctx.fillRect(x0 + i * bw + 1, y1 - bh, bw - 2, bh);
      ctx.restore();
    });

    // mean ± σ markers
    const mx = x0 + ((meanL - lo) / (hi - lo)) * (x1 - x0);
    ctx.save();
    ctx.strokeStyle = SIM.amber;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(mx, y0);
    ctx.lineTo(mx, y1);
    ctx.stroke();
    ctx.restore();
    label(ctx, `x̄ = ${meanL.toFixed(2)}`, mx + 4, y0 + 10, SIM.amber, 10);

    const sd = s.length > 1 ? Math.sqrt(s.reduce((a, b) => a + (b - meanL) ** 2, 0) / (s.length - 1)) : 0;
    ctx.save();
    ctx.strokeStyle = "rgba(248,113,113,0.8)";
    ctx.setLineDash([4, 4]);
    [meanL - sd, meanL + sd].forEach((v) => {
      const xx = x0 + ((v - lo) / (hi - lo)) * (x1 - x0);
      ctx.beginPath();
      ctx.moveTo(xx, y0 + 14);
      ctx.lineTo(xx, y1);
      ctx.stroke();
    });
    ctx.restore();
    label(ctx, `±σ`, x0 + ((meanL + sd - lo) / (hi - lo)) * (x1 - x0) + 4, y0 + 26, "rgba(248,113,113,0.8)", 10);

    // true value line
    ctx.save();
    ctx.strokeStyle = "rgba(52,211,153,0.7)";
    ctx.setLineDash([2, 3]);
    const tx = x0 + ((TRUE - lo) / (hi - lo)) * (x1 - x0);
    ctx.beginPath();
    ctx.moveTo(tx, y0);
    ctx.lineTo(tx, y1);
    ctx.stroke();
    ctx.restore();
    label(ctx, "true", tx - 6, y0 + 10, "rgba(52,211,153,0.9)", 9, "right");

    // info panel (right)
    const pxx = w * 0.66;
    label(ctx, `n = ${s.length} readings`, pxx, y0 + 6, SIM.text, 11);
    label(ctx, `least count = ${leastCount.toFixed(2)} mm`, pxx, y0 + 26, SIM.text, 11);
    label(ctx, `mean x̄ = ${meanL.toFixed(3)} mm`, pxx, y0 + 46, SIM.amber, 11);
    label(ctx, `σ = ${sd.toFixed(3)} mm`, pxx, y0 + 66, SIM.red, 11);
    label(ctx, `σ/√n = ${(sd / Math.sqrt(Math.max(1, s.length))).toFixed(3)} mm`, pxx, y0 + 86, SIM.sky, 11);
    label(ctx, `result = ${meanL.toFixed(2)} ± ${(sd / Math.sqrt(Math.max(1, s.length))).toFixed(2)} mm`, pxx, y0 + 112, SIM.bright, 12);
    label(ctx, "relative error =", pxx, y0 + 136, SIM.dim, 10);
    label(ctx, `${((sd / Math.sqrt(Math.max(1, s.length)) / TRUE) * 100).toFixed(2)} %`, pxx + 96, y0 + 136, SIM.green, 11);
  });

  return (
    <SimFrame
      title="Precision & error propagation lab"
      about="Coarser instruments quantise readings; averaging shrinks σ/√n"
      height={320}
      canvas={<canvas ref={canvasRef} />}
      controls={
        <SimControls>
          <LabeledSlider label="Least count (mm)" value={leastCount} min={0.01} max={0.5} step={0.01} onChange={setLeastCount} />
          <LabeledSlider label="Number of readings n" value={n} min={5} max={100} step={1} decimals={0} onChange={(v) => { setN(v); }} color="#34d399" />
          <ResetButton onClick={() => takeSamples()} />
        </SimControls>
      }
      readouts={
        <>
          <Readout label="Mean x̄" value={`${mean.toFixed(3)} mm`} color="#fbbf24" />
          <Readout label="Std dev σ" value={`${std.toFixed(3)} mm`} />
          <Readout label="Standard error σ/√n" value={`${sem.toFixed(3)} mm`} color="#38bdf8" />
          <Readout label="Quadruple n →" value="error halves (1/√n)" color="#34d399" />
        </>
      }
    />
  );
}
