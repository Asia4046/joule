"use client";

import { useRef, useState } from "react";
import SimFrame from "@/components/concepts/SimFrame";
import { LabeledSlider, Readout, SimControls, SimToggleGroup, ResetButton } from "@/components/concepts/controls";
import { useCanvas, SIM, clearPanel, label, circle, arrow } from "@/components/concepts/useCanvas";

/** Charged particle in B (into page): circular path with r = mv/qB. */
export default function ChargeInBSim() {
  const [v, setV] = useState(2);
  const [B, setB] = useState(1);
  const [sign, setSign] = useState<"pos" | "neg">("pos");
  const state = useRef({ trail: [] as { x: number; y: number }[], x: 0, y: 0, ang: 0 });

  const q = sign === "pos" ? 1 : -1;
  const r = (1 * v) / (Math.abs(q) * B); // m = 1
  const T = (2 * Math.PI) / (Math.abs(q) * B);
  const f = 1 / T;

  const reset = () => {
    state.current = { trail: [], x: 0, y: 0, ang: 0 };
  };

  const canvasRef = useCanvas((ctx, w, h, _t, dt) => {
    const s = state.current;
    const omega = q * B; // rad/s (m=1); sign flips rotation direction
    s.ang += omega * dt;
    const R = v / (Math.abs(q) * B);
    // circle centred at (0, -R) for +q (so it starts at origin heading +x)
    const cxw = w / 2;
    const cyw = h / 2;
    const px = R * Math.sin(s.ang);
    const py = -R + R * Math.cos(s.ang);
    const SCALE = Math.min(w, h) * 0.38 / Math.max(R, 0.5);
    const sc = Math.min(SCALE, 160);
    s.trail.push({ x: px, y: py });
    if (s.trail.length > 600) s.trail.shift();

    clearPanel(ctx, w, h);

    // B field crosses (into page)
    ctx.save();
    ctx.strokeStyle = "rgba(148,163,184,0.35)";
    ctx.lineWidth = 1.2;
    for (let x = 26; x < w - 10; x += 46) {
      for (let y = 24; y < h - 10; y += 42) {
        ctx.beginPath();
        ctx.moveTo(x - 5, y - 5);
        ctx.lineTo(x + 5, y + 5);
        ctx.moveTo(x + 5, y - 5);
        ctx.lineTo(x - 5, y + 5);
        ctx.stroke();
      }
    }
    ctx.restore();
    label(ctx, "×  B into page", w - 14, 16, SIM.dim, 10, "right");

    // trail
    ctx.save();
    ctx.strokeStyle = SIM.indigo;
    ctx.lineWidth = 2;
    ctx.shadowColor = SIM.indigo;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    s.trail.forEach((p, i) => (i === 0 ? ctx.moveTo(cxw + p.x * sc, cyw + p.y * sc) : ctx.lineTo(cxw + p.x * sc, cyw + p.y * sc)));
    ctx.stroke();
    ctx.restore();

    // particle
    circle(ctx, cxw + px * sc, cyw + py * sc, 8, sign === "pos" ? SIM.red : SIM.sky, true);
    label(ctx, sign === "pos" ? "+" : "−", cxw + px * sc, cyw + py * sc - 1, SIM.white, 12, "center");

    // tangent velocity arrow at the particle
    const tvx = q > 0 ? Math.cos(s.ang) : -Math.cos(s.ang);
    const tvy = q > 0 ? -Math.sin(s.ang) : Math.sin(s.ang);
    arrow(ctx, cxw + px * sc, cyw + py * sc, cxw + px * sc + tvx * 26, cyw + py * sc + tvy * 26, SIM.green, 2);
    label(ctx, "v", cxw + px * sc + tvx * 34, cyw + py * sc + tvy * 34, SIM.green, 11, "center");
    label(ctx, `r = mv/qB = ${r.toFixed(2)} m`, cxw, cyw - Math.max(R, 0.5) * sc * 0.9, SIM.amber, 12, "center");
    label(ctx, `T = 2πm/qB = ${T.toFixed(2)} s (speed-independent)`, cxw, h - 16, SIM.text, 11, "center");
  });

  return (
    <SimFrame
      title="Charged particle in a magnetic field"
      about="B does no work — speed is fixed, direction bends into a circle of radius mv/qB"
      height={330}
      canvas={<canvas ref={canvasRef} />}
      controls={
        <SimControls>
          <LabeledSlider label="Speed v (m/s)" value={v} min={0.5} max={4} step={0.05} onChange={setV} />
          <LabeledSlider label="Field B (T)" value={B} min={0.3} max={3} step={0.05} onChange={setB} color="#fbbf24" />
          <SimToggleGroup
            label="Charge"
            value={sign}
            options={[
              { value: "pos", label: "+q" },
              { value: "neg", label: "−q" },
            ]}
            onChange={(x) => { setSign(x); reset(); }}
          />
          <ResetButton onClick={reset} />
        </SimControls>
      }
      readouts={
        <>
          <Readout label="Radius r = mv/qB" value={`${r.toFixed(2)} m`} color="#fbbf24" />
          <Readout label="Period T" value={`${T.toFixed(2)} s`} />
          <Readout label="Cyclotron freq" value={`${f.toFixed(2)} Hz`} color="#34d399" />
          <Readout label="Work by B" value="0 J — always" color="#f87171" />
        </>
      }
    />
  );
}
