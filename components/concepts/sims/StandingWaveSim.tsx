"use client";

import { useRef, useState } from "react";
import SimFrame from "@/components/concepts/SimFrame";
import { LabeledSlider, Readout, SimControls, ResetButton } from "@/components/concepts/controls";
import { useCanvas, SIM, clearPanel, label } from "@/components/concepts/useCanvas";

/** Standing waves on a string fixed at both ends — harmonics, nodes and the sonometer frequency ladder. */
export default function StandingWaveSim() {
  const [n, setN] = useState(3);
  const [tension, setTension] = useState(80); // N
  const [muG, setMuG] = useState(2); // g/m
  const [len, setLen] = useState(1.2); // m

  const mu = muG / 1000;
  const v = Math.sqrt(tension / mu);
  const f1 = v / (2 * len);
  const fn = n * f1;
  const lambdaN = (2 * len) / n;

  const state = useRef({ t: 0 });
  const canvasRef = useCanvas((ctx, w, h, _t, dt) => {
    const s = state.current;
    s.t += dt;

    clearPanel(ctx, w, h, false);
    const px0 = 36, px1 = w - 150;
    const midY = h / 2 - 8;
    const amp = (h / 2 - 56) * 0.8;

    // oscillation (visual frequency, constant)
    const phase = s.t * 2.6;
    const env = Math.abs(Math.cos(phase)) * 0.35 + 0.65; // gentle breathing so nodes are always visible

    // envelope ±A
    ctx.save();
    ctx.strokeStyle = "rgba(148,163,184,0.3)";
    ctx.setLineDash([3, 5]);
    [1, -1].forEach((sgn) => {
      ctx.beginPath();
      for (let i = 0; i <= 100; i++) {
        const x = px0 + (i / 100) * (px1 - px0);
        const y = midY - sgn * Math.sin((n * Math.PI * i) / 100) * amp;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    });
    ctx.restore();

    // the string
    ctx.save();
    ctx.strokeStyle = SIM.indigo;
    ctx.lineWidth = 2.4;
    ctx.shadowColor = SIM.indigo;
    ctx.shadowBlur = 7;
    ctx.beginPath();
    for (let i = 0; i <= 200; i++) {
      const x = px0 + (i / 200) * (px1 - px0);
      const y = midY - Math.sin((n * Math.PI * i) / 200) * amp * env * Math.cos(phase);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();

    // fixed ends
    [px0, px1].forEach((x) => {
      ctx.save();
      ctx.strokeStyle = SIM.text;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, midY - 14);
      ctx.lineTo(x, midY + 14);
      ctx.stroke();
      ctx.restore();
    });

    // nodes (N) and antinodes (A)
    for (let k = 0; k <= n; k++) {
      const x = px0 + (k / n) * (px1 - px0);
      ctx.save();
      ctx.fillStyle = SIM.red;
      ctx.beginPath();
      ctx.arc(x, midY, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      label(ctx, "N", x, midY + 24, SIM.red, 9, "center");
    }
    for (let k = 0; k < n; k++) {
      const x = px0 + ((k + 0.5) / n) * (px1 - px0);
      label(ctx, "A", x, midY - amp - 12, SIM.green, 9, "center");
    }
    label(ctx, `n = ${n}: ${n} loops · ${n + 1} nodes · ${n} antinodes`, (px0 + px1) / 2, h - 12, SIM.dim, 9, "center");

    // ── frequency ladder (right) ──
    const fx = w - 120;
    label(ctx, "fₙ = n·f₁", fx - 10, 20, SIM.dim, 9);
    const barMax = w - fx - 14;
    for (let i = 1; i <= 6; i++) {
      const y = 34 + (i - 1) * 26;
      const active = i === n;
      ctx.save();
      ctx.fillStyle = active ? SIM.green : "rgba(148,163,184,0.35)";
      if (active) {
        ctx.shadowColor = SIM.green;
        ctx.shadowBlur = 8;
      }
      ctx.fillRect(fx, y, (i / 6) * barMax, 12);
      ctx.restore();
      label(ctx, `${i}f₁${active ? " ◀" : ""}`, fx - 4, y + 6, active ? SIM.green : SIM.dim, 9, "right");
    }
    label(ctx, `f₁ = ${f1.toFixed(0)} Hz`, fx + barMax * 0.5, 34 + 6 * 26 + 4, SIM.text, 9, "center");
  });

  return (
    <SimFrame
      title="Standing waves on a string"
      about="Both ends fixed: λₙ = 2L/n and fₙ = n·f₁ — the harmonic ladder every JEE string question climbs"
      height={300}
      canvas={<canvas ref={canvasRef} />}
      controls={
        <SimControls>
          <LabeledSlider label="Harmonic n" value={n} min={1} max={6} step={1} decimals={0} onChange={setN} color="#34d399" />
          <LabeledSlider label="Tension T (N)" value={tension} min={20} max={200} step={5} decimals={0} onChange={setTension} />
          <LabeledSlider label="Linear density µ (g/m)" value={muG} min={0.5} max={5} step={0.1} decimals={1} onChange={setMuG} color="#e879f9" />
          <LabeledSlider label="Length L (m)" value={len} min={0.6} max={2} step={0.05} onChange={setLen} color="#fbbf24" />
          <ResetButton onClick={() => { state.current.t = 0; }} />
        </SimControls>
      }
      readouts={
        <>
          <Readout label="Wave speed v = √(T/µ)" value={`${v.toFixed(0)} m/s`} color="#38bdf8" />
          <Readout label={`f${n} (n=${n})`} value={`${fn.toFixed(0)} Hz`} color="#34d399" />
          <Readout label="Fundamental f₁" value={`${f1.toFixed(1)} Hz`} />
          <Readout label="λₙ = 2L/n" value={`${lambdaN.toFixed(2)} m`} color="#fbbf24" />
        </>
      }
    />
  );
}
