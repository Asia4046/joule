"use client";

import { useRef, useState } from "react";
import SimFrame from "@/components/concepts/SimFrame";
import { LabeledSlider, Readout, SimControls, ResetButton } from "@/components/concepts/controls";
import { useCanvas, SIM, clearPanel, label } from "@/components/concepts/useCanvas";

/** Block slides down a rough incline; energy bars show PE → KE + heat. */
export default function EnergyRampSim() {
  const [theta, setTheta] = useState(30);
  const [mu, setMu] = useState(0.15);
  const g = 9.8;
  const L = 10; // ramp length (m)
  const m = 2;
  const state = useRef<{ s: number; v: number; restartTimer: number }>({ s: 0, v: 0, restartTimer: 0 });

  const th = (theta * Math.PI) / 180;
  const a = g * (Math.sin(th) - mu * Math.cos(th));
  const PE0 = m * g * L * Math.sin(th);

  const canvasRef = useCanvas((ctx, w, h, _t, dt) => {
    const s = state.current;
    const acc = g * (Math.sin(th) - mu * Math.cos(th));
    if (acc > 0) {
      s.v += acc * dt;
      s.s = Math.min(L, s.s + s.v * dt);
    }
    if (s.s >= L) {
      s.restartTimer += dt;
      if (s.restartTimer > 1.6) {
        s.s = 0;
        s.v = 0;
        s.restartTimer = 0;
      }
    }

    clearPanel(ctx, w, h);
    const pad = 30;
    const rampTop = { x: w * 0.58, y: pad + 10 };
    const rampBot = { x: pad, y: h * 0.6 };
    const len = Math.hypot(rampTop.x - rampBot.x, rampBot.y - rampTop.y);
    const ux = (rampTop.x - rampBot.x) / len;
    const uy = (rampTop.y - rampBot.y) / len;

    // ramp
    ctx.save();
    ctx.strokeStyle = SIM.axis;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(rampBot.x, rampBot.y);
    ctx.lineTo(rampTop.x, rampTop.y);
    ctx.stroke();
    ctx.lineWidth = 1;
    for (let i = 0; i < 1; i += 0.035) {
      const x = rampBot.x + ux * len * i;
      const y = rampBot.y + uy * len * i;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 9, y + 9);
      ctx.stroke();
    }
    // angle arc
    ctx.beginPath();
    ctx.strokeStyle = SIM.dim;
    ctx.arc(rampBot.x, rampBot.y, 44, Math.PI, Math.PI + th);
    ctx.stroke();
    ctx.restore();
    label(ctx, `θ = ${theta.toFixed(0)}°`, rampBot.x + 58, rampBot.y - 20, SIM.dim, 11);

    // height lines
    const heightNow = (L - s.s) * Math.sin(th);
    ctx.save();
    ctx.strokeStyle = "rgba(148,163,184,0.25)";
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.moveTo(rampTop.x, rampTop.y);
    ctx.lineTo(rampBot.x, rampTop.y);
    ctx.stroke();
    ctx.restore();
    label(ctx, `h = ${(L * Math.sin(th)).toFixed(1)} m`, rampBot.x - 4, rampTop.y - 10, SIM.dim, 10, "left");

    // block
    const bx = rampBot.x + ux * (L - s.s) / L * len;
    const by = rampBot.y + uy * (L - s.s) / L * len;
    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(-th);
    ctx.fillStyle = SIM.indigo;
    ctx.shadowColor = SIM.indigo;
    ctx.shadowBlur = 10;
    ctx.fillRect(-16, -30, 32, 30);
    ctx.restore();
    label(ctx, "2 kg", bx - uy * 20, by + ux * -20 - 6, SIM.white, 10, "center");

    // energy bars
    const KE = 0.5 * m * s.v * s.v;
    const heat = mu * m * g * Math.cos(th) * s.s;
    const PE = PE0 - KE - heat;
    const barX = w - 150;
    const barMaxH = h - 2 * pad - 30;
    const barW = 30;
    const bars = [
      { name: "PE", val: Math.max(0, PE), color: SIM.amber },
      { name: "KE", val: KE, color: SIM.green },
      { name: "Heat", val: heat, color: SIM.red },
    ];
    bars.forEach((b, i) => {
      const x = barX + i * (barW + 26);
      const bh = Math.max(0, (b.val / PE0) * barMaxH);
      ctx.save();
      ctx.fillStyle = "rgba(148,163,184,0.12)";
      ctx.fillRect(x, pad + 20, barW, barMaxH);
      ctx.fillStyle = b.color;
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 8;
      ctx.fillRect(x, pad + 20 + barMaxH - bh, barW, bh);
      ctx.restore();
      label(ctx, b.name, x + barW / 2, pad + 8, b.color, 10, "center");
      label(ctx, `${b.val.toFixed(0)} J`, x + barW / 2, h - 14, b.color, 10, "center");
    });
    label(ctx, `total = ${PE0.toFixed(0)} J`, barX + 2 * (barW + 26) + barW / 2, h - 30, SIM.text, 10, "center");

    label(ctx, s.s >= L ? "reached the bottom — restarting" : `a = g(sinθ − μcosθ) = ${a.toFixed(2)} m/s²`, w * 0.3, h - 14, SIM.text, 11, "center");
    void heightNow;
  });

  return (
    <SimFrame
      title="Energy transformation ramp"
      about="Watch gravitational PE split into kinetic energy and frictional heat"
      height={330}
      canvas={<canvas ref={canvasRef} />}
      controls={
        <SimControls>
          <LabeledSlider label="Incline angle θ (°)" value={theta} min={5} max={60} step={1} decimals={0} onChange={setTheta} color="#fbbf24" />
          <LabeledSlider label="Friction μ" value={mu} min={0} max={0.6} step={0.01} onChange={setMu} color="#f87171" />
          <ResetButton onClick={() => { state.current = { s: 0, v: 0, restartTimer: 0 }; }} />
        </SimControls>
      }
      readouts={
        <>
          <Readout label="Acceleration" value={`${a.toFixed(2)} m/s²`} color={a > 0 ? "#34d399" : "#f87171"} />
          <Readout label="Initial PE = mgh" value={`${PE0.toFixed(0)} J`} />
          <Readout label="Slides?" value={a > 0 ? "Yes" : "No — static friction holds"} color={a > 0 ? "#34d399" : "#f87171"} />
        </>
      }
    />
  );
}
