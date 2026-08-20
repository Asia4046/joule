"use client";

import { useRef, useState } from "react";
import SimFrame from "@/components/concepts/SimFrame";
import { LabeledSlider, Readout, SimControls, SimToggleGroup, ResetButton } from "@/components/concepts/controls";
import { useCanvas, SIM, clearPanel, label, arrow } from "@/components/concepts/useCanvas";

/** RC transient: charging/discharging capacitor — exponential curves, τ, and the 63.2% landmark. */
export default function RCCircuitSim() {
  const [emf, setEmf] = useState(12);
  const [rK, setRK] = useState(2); // kΩ
  const [cU, setCU] = useState(100); // µF
  const [mode, setMode] = useState<"charge" | "discharge">("charge");

  const tau = rK * 1e3 * cU * 1e-6; // seconds
  const half = tau * Math.LN2;
  const Vc = (t: number) => (mode === "charge" ? emf * (1 - Math.exp(-t / tau)) : emf * Math.exp(-t / tau));
  const I = (t: number) => (mode === "charge" ? (emf / (rK * 1e3)) * Math.exp(-t / tau) : -(emf / (rK * 1e3)) * Math.exp(-t / tau));

  const state = useRef({ t: 0, hold: 0 });
  const params = useRef({ mode, tau });
  if (params.current.mode !== mode || Math.abs(params.current.tau - tau) > 1e-9) {
    params.current = { mode, tau };
    state.current = { t: 0, hold: 0 };
  }

  const canvasRef = useCanvas((ctx, w, h, _t, dt) => {
    const s = state.current;
    const T_END = tau * 5;
    if (s.t < T_END) {
      s.t += dt;
    } else {
      s.hold += dt;
      if (s.hold > 1.4) {
        s.t = 0;
        s.hold = 0;
      }
    }

    clearPanel(ctx, w, h, false);
    const t = Math.min(s.t, T_END);
    const vc = Vc(t);
    const cur = I(t);
    const frac = Math.min(vc / emf, 1);

    // ── circuit diagram (top band) ──
    const cy = 56;
    const bx = 40, rw = w - 80;
    ctx.save();
    ctx.strokeStyle = SIM.text;
    ctx.lineWidth = 1.6;
    // wires
    ctx.beginPath();
    ctx.moveTo(bx, cy);
    ctx.lineTo(bx + rw * 0.32, cy);
    ctx.moveTo(bx + rw * 0.42, cy);
    ctx.lineTo(bx + rw * 0.8, cy);
    ctx.moveTo(bx + rw * 0.88, cy);
    ctx.lineTo(bx + rw, cy);
    ctx.moveTo(bx + rw, cy);
    ctx.lineTo(bx + rw, cy + 44);
    ctx.moveTo(bx + rw, cy + 44);
    ctx.lineTo(bx, cy + 44);
    ctx.moveTo(bx + rw * 0.42, cy + 44);
    ctx.lineTo(bx + rw * 0.58, cy + 44);
    ctx.stroke();
    // resistor (zigzag)
    const rx0 = bx + rw * 0.32, rx1 = bx + rw * 0.42;
    ctx.beginPath();
    ctx.moveTo(rx0, cy);
    const segs = 6;
    for (let i = 0; i < segs; i++) {
      const xa = rx0 + ((i + 0.5) / segs) * (rx1 - rx0);
      ctx.lineTo(xa, cy + (i % 2 === 0 ? -9 : 9));
    }
    ctx.lineTo(rx1, cy);
    ctx.stroke();
    // battery (two bars) — only in charge mode path
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(bx + rw * 0.58, cy + 44);
    ctx.lineTo(bx + rw * 0.58, cy + 44 - 14);
    ctx.stroke();
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(bx + rw * 0.42 + 8, cy + 44);
    ctx.lineTo(bx + rw * 0.42 + 8, cy + 44 - 7);
    ctx.stroke();
    // capacitor plates at right (gap at rw*0.8..0.88)
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(bx + rw * 0.8, cy - 16);
    ctx.lineTo(bx + rw * 0.8, cy + 16);
    ctx.moveTo(bx + rw * 0.88, cy - 16);
    ctx.lineTo(bx + rw * 0.88, cy + 16);
    ctx.stroke();
    ctx.restore();
    label(ctx, `R = ${rK.toFixed(1)} kΩ`, (rx0 + rx1) / 2, cy - 20, SIM.text, 9, "center");
    if (mode === "charge") label(ctx, `ε = ${emf.toFixed(0)} V`, bx + rw * 0.5, cy + 62, SIM.text, 9, "center");
    else label(ctx, "switch → discharge", bx + rw * 0.5, cy + 62, SIM.dim, 9, "center");
    // charge on plates
    const qMarks = Math.round(frac * 4);
    for (let i = 0; i < qMarks; i++) {
      const yy = cy - 12 + i * 8;
      label(ctx, "+", bx + rw * 0.78, yy, SIM.red, 10, "right");
      label(ctx, "−", bx + rw * 0.9, yy, SIM.sky, 10, "left");
    }
    // current arrow (direction flips with mode)
    const iLen = 10 + Math.min(Math.abs(cur) * 1800, 28);
    if (Math.abs(cur) > 1e-6) {
      const dir = mode === "charge" ? 1 : -1;
      arrow(ctx, bx + rw * 0.12, cy, bx + rw * 0.12 + dir * iLen, cy, SIM.amber, 2);
      label(ctx, "I", bx + rw * 0.12 + dir * (iLen + 6), cy, SIM.amber, 10, dir > 0 ? "left" : "right");
    }

    // ── plot (bottom band) ──
    const px0 = 40, px1 = w - 34;
    const py0 = 108, py1 = h - 30;
    ctx.save();
    ctx.strokeStyle = SIM.axis;
    ctx.beginPath();
    ctx.moveTo(px0, py1);
    ctx.lineTo(px1, py1);
    ctx.moveTo(px0, py0);
    ctx.lineTo(px0, py1);
    ctx.stroke();
    // τ gridlines at 1τ..5τ
    ctx.strokeStyle = "rgba(148,163,184,0.12)";
    ctx.setLineDash([2, 4]);
    for (let n = 1; n <= 5; n++) {
      const x = px0 + (n / 5) * (px1 - px0);
      ctx.beginPath();
      ctx.moveTo(x, py0);
      ctx.lineTo(x, py1);
      ctx.stroke();
    }
    // 63.2% landmark (charging) or 36.8% (discharging)
    const markY = mode === "charge" ? py1 - 0.632 * (py1 - py0) : py1 - 0.368 * (py1 - py0);
    ctx.strokeStyle = "rgba(52,211,153,0.4)";
    ctx.beginPath();
    ctx.moveTo(px0, markY);
    ctx.lineTo(px0 + 0.2 * (px1 - px0), markY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    label(ctx, mode === "charge" ? "63.2% at t = τ" : "36.8% at t = τ", px0 + 4, markY - 8, SIM.green, 9);
    [1, 2, 3, 4, 5].forEach((n) => label(ctx, `${n}τ`, px0 + (n / 5) * (px1 - px0), py1 + 12, SIM.dim, 8, "center"));

    // curves
    const yV = (v: number) => py1 - (v / emf) * (py1 - py0);
    ctx.save();
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = SIM.green;
    ctx.shadowColor = SIM.green;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    for (let i = 0; i <= 120; i++) {
      const tt = (i / 120) * t;
      const x = px0 + (tt / T_END) * (px1 - px0);
      i === 0 ? ctx.moveTo(x, yV(Vc(tt))) : ctx.lineTo(x, yV(Vc(tt)));
    }
    ctx.stroke();
    // current (amber), scaled |I| to full height
    ctx.strokeStyle = SIM.amber;
    ctx.shadowColor = SIM.amber;
    const yI = (ii: number) => py1 - (Math.abs(ii) / (emf / (rK * 1e3))) * (py1 - py0) * 0.92;
    ctx.beginPath();
    for (let i = 0; i <= 120; i++) {
      const tt = (i / 120) * t;
      const x = px0 + (tt / T_END) * (px1 - px0);
      i === 0 ? ctx.moveTo(x, yI(I(tt))) : ctx.lineTo(x, yI(I(tt)));
    }
    ctx.stroke();
    ctx.restore();
    label(ctx, "Vc(t)", px1 - 4, yV(vc) - 10, SIM.green, 10, "right");
    label(ctx, "|I(t)|", px1 - 4, yI(cur) + 12, SIM.amber, 10, "right");
  });

  return (
    <SimFrame
      title="RC transient lab"
      about="Charge and discharge a capacitor through R — every curve is an exponential stamped by the same τ"
      height={330}
      canvas={<canvas ref={canvasRef} />}
      controls={
        <SimControls>
          <SimToggleGroup
            label="Mode"
            value={mode}
            options={[{ value: "charge", label: "Charging" }, { value: "discharge", label: "Discharging" }]}
            onChange={(v) => setMode(v)}
          />
          <LabeledSlider label="EMF ε (V)" value={emf} min={4} max={24} step={1} decimals={0} onChange={setEmf} color="#fbbf24" />
          <LabeledSlider label="Resistance R (kΩ)" value={rK} min={0.5} max={10} step={0.1} decimals={1} onChange={setRK} />
          <LabeledSlider label="Capacitance C (µF)" value={cU} min={10} max={300} step={10} decimals={0} onChange={setCU} color="#34d399" />
          <ResetButton onClick={() => { state.current = { t: 0, hold: 0 }; }} />
        </SimControls>
      }
      readouts={
        <>
          <Readout label="Time constant τ = RC" value={`${(tau * 1000).toFixed(0)} ms`} color="#818cf8" />
          <Readout label="Half-value t½ = τ ln2" value={`${(half * 1000).toFixed(0)} ms`} color="#e879f9" />
          <Readout label="Vc at t = τ" value={`${Vc(tau).toFixed(2)} V (${mode === "charge" ? "63.2" : "36.8"}%)`} color="#34d399" />
          <Readout label="I₀ = ε/R" value={`${((emf / (rK * 1e3)) * 1000).toFixed(2)} mA`} color="#fbbf24" />
        </>
      }
    />
  );
}
