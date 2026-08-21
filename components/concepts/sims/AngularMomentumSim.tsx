"use client";

import { useRef, useState } from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import SimFrame from "@/components/concepts/SimFrame";
import { LabeledSlider, Readout, SimControls, ResetButton } from "@/components/concepts/controls";
import { useCanvas, SIM, clearPanel, label, circle, arrow } from "@/components/concepts/useCanvas";

/**
 * Angular momentum lab — the classic "spinning skater":
 * two masses slide on a rotating rod. With no external torque, L = Iω is conserved,
 * so pulling the masses in (smaller I) spins the system up and RAISES its kinetic
 * energy (your arms did work). Buttons add ± torque impulses (external τ = dL/dt).
 */
export default function AngularMomentumSim() {
  const [r, setR] = useState(0.8); // mass distance from pivot (m)
  const [rodM, setRodM] = useState(2); // rod mass (kg)
  const state = useRef({
    L: 6, // angular momentum (kg m²/s) — conserved between torque pulses
    omega: 0,
    ang: 0,
    trace: [] as { t: number; w: number }[],
    t: 0,
    torque: 0, // current applied torque (impulse pulse)
    torqueT: 0,
  });

  const mBall = 2; // each sliding mass
  const I = (rr: number) => rodM * 0.2 + 2 * mBall * rr * rr; // rod ≈ thin bar about centre (small) + 2 point masses
  const I_now = I(r);

  const pulse = (sign: 1 | -1) => {
    state.current.torque = sign * 8;
    state.current.torqueT = 0.7;
  };
  const reset = () => {
    state.current = { L: 6, omega: 0, ang: 0, trace: [], t: 0, torque: 0, torqueT: 0 };
  };

  const canvasRef = useCanvas((ctx, w, h, _t, dt) => {
    const s = state.current;
    // external torque pulse changes L
    if (s.torqueT > 0) {
      s.torqueT -= dt;
      s.L += s.torque * dt;
    } else {
      s.torque = 0;
    }
    // skater pulls masses in/out — r comes from the slider; L conserved → ω = L/I
    const wTarget = s.L / I(r);
    s.omega += (wTarget - s.omega) * Math.min(1, dt * 8);
    s.ang += s.omega * dt;
    s.t += dt;
    s.trace.push({ t: s.t, w: s.omega });
    while (s.trace.length > 2 && s.trace[1].t < s.t - 10) s.trace.shift();

    clearPanel(ctx, w, h);
    const pad = 28;
    const cx = w * 0.27;
    const cy = h / 2;
    const RMAX = Math.min(w * 0.2, h * 0.36);
    const rPx = (r / 1.2) * RMAX;

    // reference orbits at min/max r
    [0.3, 1.2].forEach((rr) => {
      ctx.save();
      ctx.strokeStyle = "rgba(148,163,184,0.15)";
      ctx.setLineDash([3, 6]);
      ctx.beginPath();
      ctx.arc(cx, cy, (rr / 1.2) * RMAX, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });
    label(ctx, "r min", cx, cy - (0.3 / 1.2) * RMAX - 8, SIM.dim, 9, "center");
    label(ctx, "r max", cx, cy - RMAX - 8, SIM.dim, 9, "center");

    // rotating rod with masses
    const ca = Math.cos(s.ang);
    const sa = Math.sin(s.ang);
    ctx.save();
    ctx.strokeStyle = SIM.text;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx - ca * rPx, cy - sa * rPx);
    ctx.lineTo(cx + ca * rPx, cy + sa * rPx);
    ctx.stroke();
    ctx.restore();
    // masses
    [1, -1].forEach((s2) => {
      circle(ctx, cx + s2 * ca * rPx, cy + s2 * sa * rPx, 11, SIM.indigo, true);
    });
    // pivot
    circle(ctx, cx, cy, 5, SIM.red, true);
    label(ctx, "pivot (τ = 0)", cx, cy + RMAX + 18, SIM.dim, 9, "center");

    // rotation direction indicator
    if (Math.abs(s.omega) > 0.05) {
      const dir = Math.sign(s.omega);
      ctx.save();
      ctx.strokeStyle = SIM.green;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, RMAX + 26, s.ang, s.ang + dir * 1.1, dir < 0);
      ctx.stroke();
      ctx.restore();
      const midA = s.ang + dir * 0.55;
      arrow(
        ctx,
        cx + Math.cos(midA) * (RMAX + 26),
        cy + Math.sin(midA) * (RMAX + 26),
        cx + Math.cos(midA + dir * 0.25) * (RMAX + 26),
        cy + Math.sin(midA + dir * 0.25) * (RMAX + 26),
        SIM.green,
        2
      );
    }

    // divider
    ctx.save();
    ctx.strokeStyle = SIM.panelEdge;
    ctx.beginPath();
    ctx.moveTo(w * 0.52, 12);
    ctx.lineTo(w * 0.52, h - 12);
    ctx.stroke();
    ctx.restore();

    // ---- ω(t) plot ----
    const px0 = w * 0.52 + 24;
    const px1 = w - pad;
    const py0 = pad + 16;
    const py1 = h - pad - 14;
    ctx.save();
    ctx.strokeStyle = SIM.axis;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px0, py1);
    ctx.lineTo(px1, py1);
    ctx.moveTo(px0, py0);
    ctx.lineTo(px0, py1);
    ctx.stroke();
    ctx.restore();
    label(ctx, "ω(t)  (rad/s)", px0 + 4, py0 - 6, SIM.dim, 10);

    const W_MAX = Math.max(4, ...s.trace.map((p) => Math.abs(p.w)));
    const tMin = Math.max(0, s.t - 10);
    const xOf = (tt: number) => px0 + ((tt - tMin) / 10) * (px1 - px0);
    const yOf = (ww: number) => py1 - ((ww + W_MAX * 0.15) / (W_MAX * 1.25)) * (py1 - py0);

    // r-slider ghost: what ω would be at other r (horizontal guide)
    const wNow = s.L / I(r);
    ctx.save();
    ctx.strokeStyle = "rgba(251,191,36,0.4)";
    ctx.setLineDash([4, 5]);
    ctx.beginPath();
    ctx.moveTo(px0, yOf(wNow));
    ctx.lineTo(px1, yOf(wNow));
    ctx.stroke();
    ctx.restore();
    label(ctx, `ω = L/I = ${wNow.toFixed(2)}`, px1 - 4, yOf(wNow) - 8, SIM.amber, 10, "right");

    // trace
    ctx.save();
    ctx.strokeStyle = SIM.green;
    ctx.lineWidth = 2;
    ctx.shadowColor = SIM.green;
    ctx.shadowBlur = 5;
    ctx.beginPath();
    s.trace.forEach((p, i) => {
      if (p.t < tMin) return;
      i === 0 ? ctx.moveTo(xOf(p.t), yOf(p.w)) : ctx.lineTo(xOf(p.t), yOf(p.w));
    });
    ctx.stroke();
    ctx.restore();

    if (s.torque !== 0) {
      label(ctx, `external τ = ${s.torque.toFixed(0)} N·m applied — L changing`, w / 2, h - 12, SIM.red, 10, "center");
    } else {
      label(ctx, "no external torque → L = Iω constant · pull masses in to spin up", w / 2, h - 12, SIM.dim, 10, "center");
    }
  });

  // Read ref values once for render (refs are mutated in animation loop, safe to read here)
  // eslint-disable-next-line react-hooks/rules-of-hooks -- reading ref.current in render is the intended pattern
  const I0 = I(r);
  // eslint-disable-next-line react-hooks/rules-of-hooks -- reading ref.current in render is the intended pattern
  const wNow = state.current.L / I0;
  const KE = 0.5 * I0 * wNow * wNow;
  // eslint-disable-next-line react-hooks/rules-of-hooks -- reading ref.current in render is the intended pattern
  const LNow = state.current.L;

  return (
    <SimFrame
      title="Angular momentum skater"
      about="Slide the masses: I changes, ω follows from L = Iω; kinetic energy shows the work your arms did"
      height={340}
      canvas={<canvas ref={canvasRef} />}
      action={
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" onClick={() => pulse(1)}>
            + Torque
          </Button>
          <Button size="small" variant="outlined" color="error" onClick={() => pulse(-1)}>
            − Torque
          </Button>
        </Stack>
      }
      controls={
        <SimControls>
          <LabeledSlider label="Mass distance r (m)" value={r} min={0.3} max={1.2} step={0.01} onChange={setR} />
          <LabeledSlider label="Rod mass (kg)" value={rodM} min={1} max={6} step={0.1} decimals={1} onChange={setRodM} color="#38bdf8" />
          <ResetButton onClick={reset} />
        </SimControls>
      }
      readouts={
        <>
          <Readout label="I = 2mr² + I_rod" value={`${I0.toFixed(2)} kg·m²`} />
          <Readout label="ω = L/I" value={`${wNow.toFixed(2)} rad/s`} color="#34d399" />
          <Readout label="L = Iω" value={`${LNow.toFixed(2)} kg·m²/s`} color="#fbbf24" />
          <Readout label="KE = ½Iω²" value={`${KE.toFixed(1)} J`} color="#f87171" />
        </>
      }
    />
  );
}
