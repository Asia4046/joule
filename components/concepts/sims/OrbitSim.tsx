"use client";

import { useRef, useState } from "react";
import SimFrame from "@/components/concepts/SimFrame";
import { LabeledSlider, Readout, SimControls, ResetButton } from "@/components/concepts/controls";
import { useCanvas, SIM, clearPanel, label, circle } from "@/components/concepts/useCanvas";

/** Satellite launch sandbox: v slider spans sub-orbital → circular → elliptical → escape. */
export default function OrbitSim() {
  const [vFactor, setVFactor] = useState(1.0); // × circular speed
  const GM = 1;
  const R = 70; // planet radius in px-ish units
  const state = useRef({ trail: [] as { x: number; y: number }[], x: 0, y: -160, vx: 0, vy: 0, t: 0, escaped: false, crashed: false, restart: 0 });

  const vc = Math.sqrt(GM / 160);
  const v = vFactor * vc;
  const ve = Math.SQRT2 * vc;

  const reset = (vv: number) => {
    state.current = { trail: [], x: 0, y: -160, vx: vv, vy: 0, t: 0, escaped: false, crashed: false, restart: 0 };
  };
  const lastFactor = useRef(vFactor);
  if (lastFactor.current !== vFactor) {
    lastFactor.current = vFactor;
    reset(v);
  }

  const canvasRef = useCanvas((ctx, w, h, _t, dt) => {
    const s = state.current;
    // physics — semi-implicit Euler substeps on a sped-up clock so orbits complete in seconds
    const sub = 8;
    const timeScale = 1500;
    for (let i = 0; i < sub; i++) {
      const r = Math.hypot(s.x, s.y);
      if (r < R * 0.72) {
        s.crashed = true;
        break;
      }
      if (r > 1400) {
        s.escaped = true;
      }
      const acc = GM / (r * r * r);
      const step = (dt / sub) * timeScale;
      s.vx += -acc * s.x * step;
      s.vy += -acc * s.y * step;
      s.x += s.vx * step;
      s.y += s.vy * step;
    }
    s.t += dt * timeScale;
    if (!s.crashed) s.trail.push({ x: s.x, y: s.y });
    if (s.trail.length > 900) s.trail.shift();
    // restarts: crash/escape → pause 1.5 real seconds; otherwise cap at ~5 circular periods
    const T0 = 2 * Math.PI * Math.sqrt((160 * 160 * 160) / GM);
    if (s.crashed || s.escaped) s.restart += dt;
    if ((s.crashed || s.escaped) && s.restart > 1.5) reset(v);
    else if (s.t > 5 * T0 && !s.escaped) reset(v);

    clearPanel(ctx, w, h);
    const cx = w / 2;
    const cy = h / 2;

    // planet
    const grad = ctx.createRadialGradient(cx - 20, cy - 20, 10, cx, cy, R);
    grad.addColorStop(0, "#3b82f6");
    grad.addColorStop(1, "#1d4ed8");
    ctx.save();
    ctx.fillStyle = grad;
    ctx.shadowColor = "#3b82f6";
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    label(ctx, "planet  M", cx, cy, SIM.white, 10, "center");

    // launch altitude marker
    label(ctx, "r₀", cx + 12, cy - 160 - 8, SIM.dim, 10);

    // orbit trail
    ctx.save();
    ctx.strokeStyle = SIM.indigo;
    ctx.lineWidth = 1.6;
    ctx.shadowColor = SIM.indigo;
    ctx.shadowBlur = 5;
    ctx.beginPath();
    s.trail.forEach((p, i) => (i === 0 ? ctx.moveTo(cx + p.x, cy + p.y) : ctx.lineTo(cx + p.x, cy + p.y)));
    ctx.stroke();
    ctx.restore();

    // satellite
    if (!s.crashed) {
      circle(ctx, cx + s.x, cy + s.y, 5, SIM.white, true);
    } else {
      label(ctx, "CRASHED into the planet", cx, cy + R + 24, SIM.red, 12, "center");
    }

    // regime label
    const regime =
      vFactor < 0.95 ? "sub-orbital / crash" :
      Math.abs(vFactor - 1) < 0.03 ? "CIRCULAR orbit" :
      vFactor < Math.SQRT2 - 0.02 ? "ELLIPTICAL orbit" :
      Math.abs(vFactor - Math.SQRT2) < 0.03 ? "PARABOLIC escape" : "HYPERBOLIC escape";
    label(ctx, regime, w - 16, 24, SIM.bright, 12, "right");
    label(ctx, `v/v_c = ${vFactor.toFixed(2)}   (escape at ${Math.SQRT2.toFixed(3)})`, w - 16, 42, SIM.dim, 10, "right");
  });

  return (
    <SimFrame
      title="Orbital mechanics sandbox"
      about="Speed ratio v/v_c picks the conic: circle, ellipse, parabola or hyperbola"
      height={340}
      canvas={<canvas ref={canvasRef} />}
      controls={
        <SimControls>
          <LabeledSlider label="Launch speed ÷ v_circular" value={vFactor} min={0.5} max={1.8} step={0.01} onChange={setVFactor} />
          <ResetButton onClick={() => reset(v)} />
        </SimControls>
      }
      readouts={
        <>
          <Readout label="v (units)" value={v.toFixed(3)} />
          <Readout label="Escape speed √2·v_c" value={ve.toFixed(3)} color="#E46876" />
          <Readout label="Kepler area law" value="L conserved ✓" color="#98BB6C" />
        </>
      }
    />
  );
}
