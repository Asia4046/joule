"use client";

import { useRef, useState } from "react";
import SimFrame from "@/components/concepts/SimFrame";
import { LabeledSlider, Readout, SimControls, SimToggleGroup, ResetButton } from "@/components/concepts/controls";
import { useCanvas, SIM, clearPanel, label, arrow } from "@/components/concepts/useCanvas";

type Mode = "charge" | "discharge" | "square";
type HistPt = { t: number; vc: number; i: number; src: number };

/** RC transients: single charge/discharge exponentials, a square-wave driven loop, and a live energy audit. */
export default function RCCircuitSim() {
  const [emf, setEmf] = useState(12);
  const [rK, setRK] = useState(2); // kΩ
  const [cU, setCU] = useState(100); // µF
  const [mode, setMode] = useState<Mode>("charge");

  const tau = rK * 1e3 * cU * 1e-6; // seconds
  const half = tau * Math.LN2;
  const i0 = emf / (rK * 1e3);

  const state = useRef({ t: 0, vc: 0, src: emf, lastFlip: 0, hold: 0, eBat: 0, eCap: 0, eRes: 0, hist: [] as HistPt[] });
  const params = useRef({ mode, emf, tau });
  const reinit = () => {
    state.current = { t: 0, vc: 0, src: mode === "discharge" ? 0 : emf, lastFlip: 0, hold: 0, eBat: 0, eCap: 0, eRes: 0, hist: [] };
  };
  if (params.current.mode !== mode || params.current.emf !== emf || Math.abs(params.current.tau - tau) > 1e-9) {
    params.current = { mode, emf, tau };
    reinit();
  }

  const canvasRef = useCanvas((ctx, w, h, _t, dt) => {
    const s = state.current;
    const R = rK * 1e3;
    const C = cU * 1e-6;
    const T_END = tau * 5;
    const looping = mode !== "square";

    // ── integrate with sub-stepping (τ can be a few ms) ──
    let running = true;
    if (looping && s.t >= T_END) {
      running = false;
      s.hold += dt;
      if (s.hold > 1.4) reinit();
    }
    if (running) {
      // ensure at least 20 steps per tau for numerical stability
      const sub = Math.max(1, Math.ceil(dt * 20 / Math.max(tau, 1e-6)));
      const dtt = dt / sub;
      for (let k = 0; k < sub; k++) {
        if (mode === "square" && s.t - s.lastFlip >= T_END) {
          s.src = -s.src;
          s.lastFlip = s.t;
        }
        const i = (s.src - s.vc) / R;
        s.vc += (i / C) * dtt;
        const i2 = (s.src - s.vc) / R;
        const iAvg = (i + i2) / 2;
        s.eBat += s.src * iAvg * dtt;
        s.eCap += s.vc * iAvg * dtt;
        s.eRes += iAvg * iAvg * R * dtt;
        s.t += dtt;
      }
      s.hist.push({ t: s.t, vc: s.vc, i: (s.src - s.vc) / R, src: s.src });
      const window = mode === "square" ? tau * 12 : T_END;
      while (s.hist.length > 0 && s.hist[0].t < s.t - window) s.hist.shift();
    }

    clearPanel(ctx, w, h, false);
    const frac = Math.max(0, Math.min(1, s.vc / emf));

    // ── circuit diagram (top band) ──
    const cy = 52;
    const bx = 40, rw = w - 300;
    ctx.save();
    ctx.strokeStyle = SIM.text;
    ctx.lineWidth = 1.6;
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
    if (mode !== "discharge") {
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(bx + rw * 0.58, cy + 44);
      ctx.lineTo(bx + rw * 0.58, cy + 30);
      ctx.stroke();
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(bx + rw * 0.42 + 8, cy + 44);
      ctx.lineTo(bx + rw * 0.42 + 8, cy + 37);
      ctx.stroke();
    }
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
    else if (mode === "square") label(ctx, `square ±${emf.toFixed(0)} V, T = 10τ`, bx + rw * 0.5, cy + 62, SIM.text, 9, "center");
    else label(ctx, "switch → discharge through R", bx + rw * 0.5, cy + 62, SIM.dim, 9, "center");
    const qMarks = Math.round(frac * 4);
    for (let i = 0; i < qMarks; i++) {
      const yy = cy - 12 + i * 8;
      label(ctx, "+", bx + rw * 0.78, yy, SIM.red, 10, "right");
      label(ctx, "−", bx + rw * 0.9, yy, SIM.sky, 10, "left");
    }
    const cur = s.hist.length ? s.hist[s.hist.length - 1].i : 0;
    const iLen = 10 + Math.min(Math.abs(cur) * 1800, 28);
    if (Math.abs(cur) > 1e-7) {
      const dir = cur >= 0 ? 1 : -1;
      arrow(ctx, bx + rw * 0.12, cy, bx + rw * 0.12 + dir * iLen, cy, SIM.amber, 2);
      label(ctx, "I", bx + rw * 0.12 + dir * (iLen + 6), cy, SIM.amber, 10, dir > 0 ? "left" : "right");
    }

    // ── energy audit (top right) ──
    const ex = w - 250, ew = 190;
    label(ctx, "energy audit (live)", ex, 22, SIM.dim, 9);
    const eMax = Math.max(s.eBat, s.eCap, s.eRes, 1e-9);
    const eBar = (name: string, val: number, color: string, y: number) => {
      ctx.save();
      ctx.fillStyle = "rgba(161,161,170,0.12)";
      ctx.fillRect(ex, y, ew, 8);
      ctx.fillStyle = color;
      ctx.fillRect(ex, y, (val / eMax) * ew, 8);
      ctx.restore();
      label(ctx, `${name} ${(val * 1000).toFixed(1)} mJ`, ex + ew + 4, y + 4, color, 8);
    };
    eBar("battery →", s.eBat, SIM.amber, 32);
    eBar("C stored", s.eCap, SIM.green, 46);
    eBar("R heat", s.eRes, SIM.red, 60);
    const eff = s.eBat > 1e-9 ? (s.eCap / s.eBat) * 100 : 0;
    label(
      ctx,
      mode === "square" ? `R heat / battery = ${(100 - Math.min(100, eff)).toFixed(0)}% — all wave energy dies in R` : `charging efficiency = E_C/E_bat → ${eff.toFixed(1)}%`,
      ex, 78, mode === "square" ? SIM.red : SIM.fuchsia, 8
    );

    // ── plot (bottom band) ──
    const px0 = 40, px1 = w - 34;
    const py0 = 104, py1 = h - 30;
    const square = mode === "square";
    const winT = square ? tau * 12 : T_END;
    const tHi = square ? s.t : T_END;
    const tLo = square ? s.t - winT : 0;
    const vMax = square ? emf * 1.15 : emf;
    const vMin = square ? -emf * 1.15 : 0;
    ctx.save();
    ctx.strokeStyle = SIM.axis;
    ctx.beginPath();
    ctx.moveTo(px0, py1);
    ctx.lineTo(px1, py1);
    ctx.moveTo(px0, py0);
    ctx.lineTo(px0, py1);
    ctx.stroke();
    // τ gridlines
    ctx.strokeStyle = "rgba(161,161,170,0.12)";
    ctx.setLineDash([2, 4]);
    const firstTau = Math.ceil(tLo / tau);
    const lastTau = Math.floor(tHi / tau);
    for (let n = Math.max(1, firstTau); n <= lastTau; n++) {
      const x = px0 + ((n * tau - tLo) / winT) * (px1 - px0);
      ctx.beginPath();
      ctx.moveTo(x, py0);
      ctx.lineTo(x, py1);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    // zero line for square mode
    if (square) {
      const y0 = py1 - ((0 - vMin) / (vMax - vMin)) * (py1 - py0);
      ctx.strokeStyle = "rgba(161,161,170,0.3)";
      ctx.beginPath();
      ctx.moveTo(px0, y0);
      ctx.lineTo(px1, y0);
      ctx.stroke();
    }
    ctx.restore();
    if (!square) {
      const markY = py1 - (mode === "charge" ? 0.632 : 0.368) * (py1 - py0);
      label(ctx, mode === "charge" ? "63.2% at t = τ" : "36.8% at t = τ", px0 + 4, markY - 8, SIM.green, 9);
    }
    [1, 2, 3, 4, 5].forEach((n) => {
      if (!square) label(ctx, `${n}τ`, px0 + (n / 5) * (px1 - px0), py1 + 12, SIM.dim, 8, "center");
    });
    if (square) label(ctx, `window: last 12τ (flip every 5τ)`, px0 + 4, py1 + 12, SIM.dim, 8);

    const yV = (v: number) => py1 - ((v - vMin) / (vMax - vMin)) * (py1 - py0);
    const xT = (tt: number) => px0 + ((tt - tLo) / winT) * (px1 - px0);
    const trace = (get: (p: HistPt) => number, color: string, width: number) => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.shadowColor = color;
      ctx.shadowBlur = width > 1.5 ? 5 : 0;
      ctx.beginPath();
      let started = false;
      s.hist.forEach((p) => {
        if (p.t < tLo) return;
        const x = xT(p.t);
        const y = yV(get(p));
        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.restore();
    };
    trace((p) => p.src, "rgba(161,161,170,0.5)", 1);
    trace((p) => p.vc, SIM.green, 2.2);
    trace((p) => Math.abs(p.i) / (i0 || 1) * emf * 0.92, SIM.amber, 1.8);
    label(ctx, "Vc(t)", px1 - 4, yV(s.vc) - 10, SIM.green, 10, "right");
    label(ctx, "|I(t)|", px1 - 4, yV((Math.abs(cur) / (i0 || 1)) * emf * 0.92) + 12, SIM.amber, 10, "right");
    if (square) label(ctx, "source", px1 - 4, yV(s.src) - 10, SIM.dim, 9, "right");
  });

  return (
    <SimFrame
      title="RC transient lab"
      about="Single exponentials, a square-wave drive hunting steady state, and the 50%-charging-efficiency energy audit"
      height={340}
      canvas={<canvas ref={canvasRef} />}
      controls={
        <SimControls>
          <SimToggleGroup
            label="Mode"
            value={mode}
            options={[
              { value: "charge", label: "Charging" },
              { value: "discharge", label: "Discharging" },
              { value: "square", label: "Square wave" },
            ]}
            onChange={(v) => setMode(v)}
          />
          <LabeledSlider label="EMF ε (V)" value={emf} min={4} max={24} step={1} decimals={0} onChange={setEmf} color="#E6C384" />
          <LabeledSlider label="Resistance R (kΩ)" value={rK} min={0.5} max={10} step={0.1} decimals={1} onChange={setRK} />
          <LabeledSlider label="Capacitance C (µF)" value={cU} min={10} max={300} step={10} decimals={0} onChange={setCU} color="#98BB6C" />
          <ResetButton onClick={reinit} />
        </SimControls>
      }
      readouts={
        <>
          <Readout label="Time constant τ = RC" value={`${(tau * 1000).toFixed(0)} ms`} color="#7E9CD8" />
          <Readout label="Half-value t½ = τ ln2" value={`${(half * 1000).toFixed(0)} ms`} color="#D27E99" />
          <Readout label="I₀ = ε/R" value={`${(i0 * 1000).toFixed(2)} mA`} color="#E6C384" />
          <Readout
            label={mode === "square" ? "Steady-state ripple" : "Charging efficiency →"}
            value={mode === "square" ? "≈ 2ε·e^(−5)" : "50%"}
            color="#E46876"
          />
        </>
      }
    />
  );
}
