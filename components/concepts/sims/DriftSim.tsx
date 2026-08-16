"use client";

import { useRef, useState } from "react";
import SimFrame from "@/components/concepts/SimFrame";
import { LabeledSlider, Readout, SimControls, ResetButton } from "@/components/concepts/controls";
import { useCanvas, SIM, clearPanel, label, circle } from "@/components/concepts/useCanvas";

/** Drift velocity: wire with electron dots, battery and bulb; V and R set current. */
export default function DriftSim() {
  const [V, setV] = useState(6);
  const [R, setR] = useState(4);
  const state = useRef<{ offsets: number[]; phase?: number }>({ offsets: Array.from({ length: 64 }, () => Math.random()) });

  const I = V / R;
  const P = (I * I * R);

  const canvasRef = useCanvas((ctx, w, h, _t, dt) => {
    const s = state.current;
    const drift = I * 26; // px/s

    clearPanel(ctx, w, h, false);
    const wireY = h / 2;
    const wx0 = w * 0.18;
    const wx1 = w * 0.82;

    // circuit rectangle
    ctx.save();
    ctx.strokeStyle = SIM.axis;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(wx0, wireY - 60);
    ctx.lineTo(wx0, wireY + 60);
    ctx.moveTo(wx1, wireY - 60);
    ctx.lineTo(wx1, wireY + 60);
    ctx.moveTo(wx0, wireY - 60);
    ctx.lineTo(wx1, wireY - 60);
    ctx.moveTo(wx0, wireY + 60);
    ctx.lineTo(wx1, wireY + 60);
    ctx.stroke();
    ctx.restore();

    // battery (left)
    ctx.save();
    ctx.strokeStyle = SIM.amber;
    ctx.lineWidth = 3;
    const bx = wx0 + 2;
    ctx.beginPath();
    ctx.moveTo(bx, wireY - 26);
    ctx.lineTo(bx, wireY + 26);
    ctx.stroke();
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(bx + 10, wireY - 14);
    ctx.lineTo(bx + 10, wireY + 14);
    ctx.stroke();
    ctx.restore();
    label(ctx, `ε = ${V.toFixed(1)} V`, bx - 6, wireY + 46, SIM.amber, 11, "center");

    // resistor (right) — zigzag
    ctx.save();
    ctx.strokeStyle = I > 0.5 ? SIM.green : SIM.dim;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    const rz = wx1 - 64;
    ctx.moveTo(rz, wireY - 60);
    for (let i = 0; i < 6; i++) {
      ctx.lineTo(rz - 8 + (i % 2 === 0 ? 0 : 0), wireY - 60 + (i % 2 === 0 ? -10 : 10) - (i > 0 ? 0 : 0));
      ctx.lineTo(rz - 8, wireY - 60);
    }
    ctx.stroke();
    ctx.restore();
    label(ctx, `R = ${R.toFixed(1)} Ω`, wx1 - 34, wireY - 84, SIM.text, 11, "center");

    // bulb (top center)
    const cx = (wx0 + wx1) / 2;
    const bright = Math.min(1, P / 20);
    const grad = ctx.createRadialGradient(cx, wireY - 60, 2, cx, wireY - 60, 34);
    grad.addColorStop(0, `rgba(251,191,36,${0.85 * bright + 0.1})`);
    grad.addColorStop(1, "rgba(251,191,36,0)");
    ctx.save();
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, wireY - 60, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    circle(ctx, cx, wireY - 60, 9, bright > 0.15 ? "#fde68a" : "#475569", bright > 0.15);
    label(ctx, `P = ${P.toFixed(1)} W`, cx, wireY - 108, bright > 0.4 ? "#fbbf24" : SIM.dim, 11, "center");

    // electrons in wires (top and bottom runs)
    s.phase = ((s.phase ?? 0) + (drift * dt) / (wx1 - wx0)) % 1;
    const drawRun = (y: number, dir: 1 | -1) => {
      const span = wx1 - wx0;
      s.offsets.forEach((o, i) => {
        let f = (o + s.phase!) % 1;
        if (f < 0) f += 1;
        const xx = dir === 1 ? wx0 + f * span : wx1 - f * span;
        const jit = ((i * 37) % 9) - 4;
        circle(ctx, xx, y + jit, 2, "rgba(56,189,248,0.85)");
      });
    };
    drawRun(wireY - 60, -1); // electrons oppose conventional current
    drawRun(wireY + 60, 1);

    label(ctx, `I = ε/R = ${I.toFixed(2)} A   ·   electron drift (blue dots) opposes conventional current`, w / 2, h - 18, SIM.sky, 11, "center");
    label(ctx, "electrons actually drift mm/s — the field propagates near c", w / 2, 26, SIM.dim, 10, "center");
  });

  return (
    <SimFrame
      title="Drift velocity circuit"
      about="I = nAe·v_d: tune EMF and R; watch current, drift speed and brightness"
      height={320}
      canvas={<canvas ref={canvasRef} />}
      controls={
        <SimControls>
          <LabeledSlider label="EMF ε (V)" value={V} min={1} max={12} step={0.1} decimals={1} onChange={setV} color="#fbbf24" />
          <LabeledSlider label="Resistance R (Ω)" value={R} min={1} max={20} step={0.1} decimals={1} onChange={setR} color="#34d399" />
          <ResetButton onClick={() => { state.current = { offsets: Array.from({ length: 64 }, () => Math.random()), phase: 0 }; }} />        </SimControls>
      }
      readouts={
        <>
          <Readout label="Current I" value={`${I.toFixed(2)} A`} color="#38bdf8" />
          <Readout label="Power P = I²R" value={`${P.toFixed(1)} W`} color="#fbbf24" />
          <Readout label="Drift speed" value="∝ I (fixed wire)" />
        </>
      }
    />
  );
}
