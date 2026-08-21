"use client";

import { useRef, useState } from "react";
import SimFrame from "@/components/concepts/SimFrame";
import { LabeledSlider, Readout, SimControls, ResetButton } from "@/components/concepts/controls";
import { useCanvas, SIM, clearPanel, label } from "@/components/concepts/useCanvas";

/** Block slides down a rough incline drawn at the TRUE slider angle; energy bars show PE → KE + heat. */
export default function EnergyRampSim() {
  const [theta, setTheta] = useState(30);
  const [mu, setMu] = useState(0.15);
  const g = 9.8;
  const L = 10; // ramp length (m)
  const m = 2;
  const state = useRef<{ s: number; v: number; restartTimer: number }>({ s: 0, v: 0, restartTimer: 0 });
  const params = useRef({ theta, mu });
  if (params.current.theta !== theta || params.current.mu !== mu) {
    params.current = { theta, mu };
    state.current = { s: 0, v: 0, restartTimer: 0 };
  }

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

    // ---- ramp geometry at the TRUE θ ----
    // ramp occupies the left ~62% of the panel; energy bars own the right ~150px
    const barsW = 168;
    const rampBot = { x: pad + 14, y: h * 0.66 };
    const maxRampW = w - barsW - pad - rampBot.x;
    const maxRampH = rampBot.y - (pad + 34);
    // pick the longest ramp that fits at this angle
    const lenPx = Math.min(maxRampW / Math.cos(th), maxRampH / Math.sin(th));
    const rampTop = {
      x: rampBot.x + Math.cos(th) * lenPx,
      y: rampBot.y - Math.sin(th) * lenPx,
    };
    const ux = (rampTop.x - rampBot.x) / lenPx;
    const uy = (rampTop.y - rampBot.y) / lenPx;

    // incline
    ctx.save();
    ctx.strokeStyle = SIM.axis;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(rampBot.x, rampBot.y);
    ctx.lineTo(rampTop.x, rampTop.y);
    ctx.stroke();
    // hatching under the incline (perpendicular ticks)
    ctx.lineWidth = 1;
    const perpX = uy; // rotate direction -90°: (ux,uy) → (uy, -ux)
    const perpY = -ux;
    for (let f = 0.03; f < 1; f += 0.035) {
      const x = rampBot.x + ux * lenPx * f;
      const y = rampBot.y + uy * lenPx * f;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - perpX * 9, y - perpY * 9);
      ctx.stroke();
    }
    // ground under the bottom
    ctx.beginPath();
    ctx.moveTo(rampBot.x - 12, rampBot.y);
    ctx.lineTo(rampBot.x + Math.cos(th) * lenPx + 12, rampBot.y);
    ctx.stroke();
    ctx.restore();

    // angle arc — on the correct side (right of the bottom vertex, inside the wedge)
    ctx.save();
    ctx.strokeStyle = SIM.dim;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(rampBot.x, rampBot.y, 40, -th, 0);
    ctx.stroke();
    ctx.restore();
    label(ctx, `θ = ${theta.toFixed(0)}°`, rampBot.x + 54, rampBot.y - 12, SIM.bright, 11);

    // height reference (dashed) from the top of the incline down to ground level
    ctx.save();
    ctx.strokeStyle = "rgba(148,163,184,0.35)";
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.moveTo(rampTop.x, rampTop.y);
    ctx.lineTo(rampTop.x, rampBot.y);
    ctx.stroke();
    ctx.restore();
    const hMax = L * Math.sin(th);
    label(ctx, `h = ${hMax.toFixed(1)} m`, rampTop.x + 8, (rampTop.y + rampBot.y) / 2, SIM.dim, 10);

    // block at (L − s) along the incline
    const bx = rampBot.x + ux * ((L - s.s) / L) * lenPx;
    const by = rampBot.y + uy * ((L - s.s) / L) * lenPx;
    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(-th);
    // sit the square on the incline surface (incline direction = local +x, surface = local y=0)
    ctx.fillStyle = SIM.indigo;
    ctx.shadowColor = SIM.indigo;
    ctx.shadowBlur = 10;
    ctx.fillRect(-17, -30, 34, 30);
    ctx.restore();
    label(ctx, `${m} kg`, bx - uy * 26, by + ux * -26 - 8, SIM.white, 10, "center");

    // ---- energy bars (right) ----
    const KE = 0.5 * m * s.v * s.v;
    const currentHeight = (L - s.s) * Math.sin(th);
    const PE = m * g * currentHeight;
    const heat = PE0 - PE - KE;
    const barsX0 = w - barsW - 8;
    const barTop = pad + 26;
    const barMaxH = h - barTop - 46;
    const barW = 34;
    const gap = 22;
    const bars = [
      { name: "PE", val: Math.max(0, PE), color: SIM.amber },
      { name: "KE", val: Math.max(0, KE), color: SIM.green },
      { name: "Heat", val: Math.max(0, heat), color: SIM.red },
    ];
    bars.forEach((b, i) => {
      const x = barsX0 + i * (barW + gap);
      const bh = PE0 > 0 ? (b.val / PE0) * barMaxH : 0;
      ctx.save();
      ctx.fillStyle = "rgba(148,163,184,0.12)";
      ctx.fillRect(x, barTop, barW, barMaxH);
      ctx.fillStyle = b.color;
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 8;
      ctx.fillRect(x, barTop + barMaxH - bh, barW, bh);
      ctx.restore();
      label(ctx, b.name, x + barW / 2, barTop - 12, b.color, 10, "center");
      label(ctx, `${b.val.toFixed(0)} J`, x + barW / 2, h - 18, b.color, 10, "center");
    });
    label(ctx, `Σ = ${PE0.toFixed(0)} J`, barsX0 + 2 * (barW + gap) + barW / 2, h - 34, SIM.text, 9, "center");

    // status line
    label(
      ctx,
      s.s >= L
        ? "bottom reached — restarting"
        : acc > 0
          ? `a = g(sinθ − μcosθ) = ${a.toFixed(2)} m/s² · v = ${s.v.toFixed(1)} m/s`
          : `static — need tanθ > μ (tanθ = ${Math.tan(th).toFixed(2)})`,
      rampBot.x + 6,
      h - 18,
      acc > 0 ? SIM.text : SIM.red,
      11
    );
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
