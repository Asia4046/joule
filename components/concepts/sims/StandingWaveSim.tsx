"use client";

import { useRef, useState } from "react";
import SimFrame from "@/components/concepts/SimFrame";
import { LabeledSlider, Readout, SimControls, SimToggleGroup, ResetButton } from "@/components/concepts/controls";
import { useCanvas, SIM, clearPanel, label } from "@/components/concepts/useCanvas";

type Mode = "string" | "closed" | "open";

/** Standing waves under three boundary conditions, with the pressure wave drawn λ/4 out of step and a probe point. */
export default function StandingWaveSim() {
  const [mode, setMode] = useState<Mode>("string");
  const [n, setN] = useState(3); // n-th ALLOWED mode
  const [tension, setTension] = useState(80); // N
  const [muG, setMuG] = useState(2); // g/m
  const [len, setLen] = useState(1.2); // m
  const [probe, setProbe] = useState(0.35); // x/L

  const mu = muG / 1000;
  const v = Math.sqrt(tension / mu);
  // string & open–open: every harmonic, f₁ = v/2L · closed: odd only, f₁ = v/4L
  const odd = mode === "closed";
  const f1 = odd ? v / (4 * len) : v / (2 * len);
  const harmonic = odd ? 2 * n - 1 : n; // physical harmonic number
  const fn = harmonic * f1;
  const lambdaN = odd ? (4 * len) / harmonic : (2 * len) / harmonic;
  // displacement shape S(x) on x ∈ [0,1]: string/closed → sin(kx) · open–open → cos(kx)
  const k = harmonic * Math.PI;
  const shape = (x: number) => (mode === "open" ? Math.cos(k * x) : Math.sin(k * x));
  const dShape = (x: number) => (mode === "open" ? -Math.sin(k * x) : Math.cos(k * x)); // ∝ pressure profile
  const probeAmp = Math.abs(shape(probe));

  const state = useRef({ t: 0 });
  const canvasRef = useCanvas((ctx, w, h, _t, dt) => {
    const s = state.current;
    s.t += dt;

    clearPanel(ctx, w, h, false);
    const px0 = 44, px1 = w - 158;
    const midY = h / 2 - 10;
    const amp = (h / 2 - 58) * 0.72;
    const phase = s.t * 2.6;
    const env = Math.abs(Math.cos(phase)) * 0.35 + 0.65;

    // envelope ±A
    ctx.save();
    ctx.strokeStyle = "rgba(148,163,184,0.3)";
    ctx.setLineDash([3, 5]);
    [1, -1].forEach((sgn) => {
      ctx.beginPath();
      for (let i = 0; i <= 100; i++) {
        const x = px0 + (i / 100) * (px1 - px0);
        const y = midY - sgn * Math.abs(shape(i / 100)) * amp;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    });
    ctx.restore();

    // ── displacement wave ──
    ctx.save();
    ctx.strokeStyle = SIM.indigo;
    ctx.lineWidth = 2.4;
    ctx.shadowColor = SIM.indigo;
    ctx.shadowBlur = 7;
    ctx.beginPath();
    for (let i = 0; i <= 200; i++) {
      const x = px0 + (i / 200) * (px1 - px0);
      const y = midY - shape(i / 200) * amp * env * Math.cos(phase);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();

    // ── pressure wave: spatial derivative of displacement, shifted λ/4 ──
    ctx.save();
    ctx.strokeStyle = SIM.fuchsia;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    for (let i = 0; i <= 200; i++) {
      const x = px0 + (i / 200) * (px1 - px0);
      const y = midY - dShape(i / 200) * amp * 0.55 * env * Math.cos(phase);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();

    // ── boundaries ──
    if (mode === "string") {
      [px0, px1].forEach((x) => {
        ctx.save();
        ctx.strokeStyle = SIM.text;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, midY - 16);
        ctx.lineTo(x, midY + 16);
        ctx.stroke();
        ctx.restore();
      });
      label(ctx, "fixed", px0 + 4, midY + 28, SIM.dim, 8);
      label(ctx, "fixed", px1 - 4, midY + 28, SIM.dim, 8, "right");
    } else {
      // pipe walls
      ctx.save();
      ctx.strokeStyle = SIM.text;
      ctx.lineWidth = 2;
      [midY - amp - 16, midY + amp + 16].forEach((y) => {
        ctx.beginPath();
        ctx.moveTo(px0 - 6, y);
        ctx.lineTo(px1 + 6, y);
        ctx.stroke();
      });
      // closed end: hatched cap · open end: flare
      const closedAt = (x: number, dir: 1 | -1) => {
        ctx.beginPath();
        ctx.moveTo(x, midY - amp - 22);
        ctx.lineTo(x, midY + amp + 22);
        ctx.stroke();
        ctx.strokeStyle = "rgba(148,163,184,0.4)";
        ctx.lineWidth = 1;
        for (let y = midY - amp - 20; y < midY + amp + 22; y += 9) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + dir * 7, y - 7);
          ctx.stroke();
        }
      };
      const openAt = (x: number, dir: 1 | -1) => {
        ctx.strokeStyle = SIM.text;
        ctx.lineWidth = 2;
        [midY - amp - 16, midY + amp + 16].forEach((y) => {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + dir * 9, y + (y < midY ? -8 : 8));
          ctx.stroke();
        });
      };
      if (mode === "closed") {
        closedAt(px0, 1);
        openAt(px1, -1);
        label(ctx, "closed · node", px0 + 6, midY - amp - 26, SIM.dim, 8);
        label(ctx, "open · antinode", px1 - 6, midY - amp - 26, SIM.dim, 8, "right");
      } else {
        openAt(px0, 1);
        openAt(px1, -1);
        label(ctx, "open · antinode", px0 + 6, midY - amp - 26, SIM.dim, 8);
        label(ctx, "open · antinode", px1 - 6, midY - amp - 26, SIM.dim, 8, "right");
      }
      ctx.restore();
    }

    // displacement nodes (N) — pressure antinodes — and antinodes (A)
    const nNodes = mode === "open" ? harmonic - 1 : harmonic + 1;
    for (let j = 0; j < 1e4; j++) {
      const x = mode === "open" ? (j + 0.5) / harmonic : j / harmonic;
      if (x > 1.0001) break;
      ctx.save();
      ctx.fillStyle = SIM.red;
      ctx.beginPath();
      ctx.arc(px0 + x * (px1 - px0), midY, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    for (let j = 0; j < harmonic + 1; j++) {
      const x = mode === "open" ? j / harmonic : (j + 0.5) / harmonic;
      if (x > 1) break;
      label(ctx, "A", px0 + x * (px1 - px0), midY - amp - 10, SIM.green, 9, "center");
    }
    label(
      ctx,
      mode === "string"
        ? `n = ${harmonic}: every harmonic allowed · λₙ = 2L/n`
        : mode === "closed"
          ? `harmonic ${harmonic} (odd only): closed pipes skip the evens · λ = 4L/${harmonic}`
          : `harmonic ${harmonic}: open–open mirrors the string · λₙ = 2L/n`,
      (px0 + px1) / 2, h - 12, SIM.dim, 9, "center"
    );
    label(ctx, "displacement (indigo) · pressure (pink) — locked λ/4 apart", px0, 16, SIM.dim, 9);

    // ── probe ──
    const probeX = px0 + probe * (px1 - px0);
    const probeY = midY - shape(probe) * amp * env * Math.cos(phase);
    ctx.save();
    ctx.strokeStyle = "rgba(56,189,248,0.5)";
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.moveTo(probeX, midY - amp - 8);
    ctx.lineTo(probeX, midY + amp + 8);
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.fillStyle = SIM.sky;
    ctx.shadowColor = SIM.sky;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(probeX, probeY, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    label(ctx, `probe: ${(probeAmp * 100).toFixed(0)}% amplitude${probeAmp < 0.08 ? " — dead spot (node)" : ""}`, probeX, midY + amp + 26, probeAmp < 0.08 ? SIM.red : SIM.sky, 9, "center");

    // ── frequency ladder (right) ──
    const fx = w - 130;
    label(ctx, "allowed modes", fx - 10, 20, SIM.dim, 9);
    const barMax = w - fx - 14;
    for (let i = 1; i <= 6; i++) {
      const hNum = odd ? 2 * i - 1 : i;
      const y = 34 + (i - 1) * 26;
      const active = i === n;
      ctx.save();
      ctx.fillStyle = active ? SIM.green : "rgba(148,163,184,0.35)";
      if (active) {
        ctx.shadowColor = SIM.green;
        ctx.shadowBlur = 8;
      }
      ctx.fillRect(fx, y, (hNum / (odd ? 11 : 6)) * barMax, 12);
      ctx.restore();
      label(ctx, `${hNum}f₁${active ? " ◀" : ""}`, fx - 4, y + 6, active ? SIM.green : SIM.dim, 9, "right");
    }
    label(ctx, `f₁ = ${f1.toFixed(0)} Hz`, fx + barMax * 0.5, 34 + 6 * 26 + 4, SIM.text, 9, "center");
  });

  return (
    <SimFrame
      title="Standing waves — strings & pipes"
      about="Three boundary conditions, the pressure wave drawn λ/4 out of phase, and a probe that finds the dead spots"
      height={320}
      canvas={<canvas ref={canvasRef} />}
      controls={
        <SimControls>
          <SimToggleGroup
            label="System"
            value={mode}
            options={[
              { value: "string", label: "String (fixed)" },
              { value: "closed", label: "Closed pipe" },
              { value: "open", label: "Open pipe" },
            ]}
            onChange={(v) => setMode(v)}
          />
          <LabeledSlider label="Mode n (nth allowed)" value={n} min={1} max={6} step={1} decimals={0} onChange={setN} color="#34d399" />
          <LabeledSlider label="Tension T (N)" value={tension} min={20} max={200} step={5} decimals={0} onChange={setTension} />
          <LabeledSlider label="Linear density µ (g/m)" value={muG} min={0.5} max={5} step={0.1} decimals={1} onChange={setMuG} color="#e879f9" />
          <LabeledSlider label="Length L (m)" value={len} min={0.6} max={2} step={0.05} onChange={setLen} color="#fbbf24" />
          <LabeledSlider label="Probe x/L" value={probe} min={0} max={1} step={0.01} onChange={setProbe} color="#38bdf8" />
          <ResetButton onClick={() => { state.current.t = 0; }} />
        </SimControls>
      }
      readouts={
        <>
          <Readout label="Wave speed v = √(T/µ)" value={`${v.toFixed(0)} m/s`} color="#38bdf8" />
          <Readout label={`Harmonic ${harmonic} frequency`} value={`${fn.toFixed(0)} Hz`} color="#34d399" />
          <Readout label={odd ? "Fundamental v/4L" : "Fundamental v/2L"} value={`${f1.toFixed(1)} Hz`} />
          <Readout label="λ of this mode" value={`${lambdaN.toFixed(2)} m`} color="#fbbf24" />
          <Readout label="Probe amplitude" value={`${(probeAmp * 100).toFixed(0)}% of antinode`} color={probeAmp < 0.08 ? "#f87171" : "#cbd5e1"} />
          <Readout label="Allowed harmonics" value={odd ? "odd only (1,3,5,…)" : "all (1,2,3,…)"} color="#e879f9" />
        </>
      }
    />
  );
}
