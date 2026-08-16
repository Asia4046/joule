"use client";

import { useRef, useState } from "react";
import SimFrame from "@/components/concepts/SimFrame";
import { LabeledSlider, Readout, SimControls, ResetButton } from "@/components/concepts/controls";
import { useCanvas, SIM, clearPanel, label, circle } from "@/components/concepts/useCanvas";

/** Ring, disk and sphere race down an incline — shape decides the order. */
export default function RollingRaceSim() {
  const [theta, setTheta] = useState(25);
  const g = 9.8;
  const th = (theta * Math.PI) / 180;
  const L = 10;
  const bodies = [
    { name: "Ring", k: 1, color: SIM.red },
    { name: "Disk", k: 0.5, color: SIM.green },
    { name: "Sphere", k: 0.4, color: SIM.sky },
  ];
  const state = useRef({ s: [0, 0, 0], v: [0, 0, 0], timer: 0 });

  const canvasRef = useCanvas((ctx, w, h, _t, dt) => {
    const s = state.current;
    bodies.forEach((b, i) => {
      const a = (g * Math.sin(th)) / (1 + b.k);
      s.v[i] += a * dt;
      s.s[i] = Math.min(L, s.s[i] + s.v[i] * dt);
    });
    if (s.s[2] >= L) {
      s.timer += dt;
      if (s.timer > 2) {
        state.current = { s: [0, 0, 0], v: [0, 0, 0], timer: 0 };
      }
    }

    clearPanel(ctx, w, h);
    const pad = 36;
    const bot = { x: pad, y: h * 0.68 };
    const top = { x: w * 0.55, y: pad };
    const dx = top.x - bot.x;
    const dy = bot.y - top.y;
    const len = Math.hypot(dx, dy);
    const ux = dx / len;
    const uy = dy / len;

    // incline
    ctx.save();
    ctx.strokeStyle = SIM.axis;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(bot.x, bot.y);
    ctx.lineTo(top.x, top.y);
    ctx.stroke();
    ctx.lineWidth = 1;
    for (let f = 0.04; f < 1; f += 0.04) {
      const x = bot.x + ux * len * f;
      const y = bot.y + uy * len * f;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 8, y + 8);
      ctx.stroke();
    }
    ctx.restore();
    label(ctx, `θ = ${theta.toFixed(0)}°`, bot.x + 62, bot.y - 16, SIM.dim, 11);

    // bodies
    const r = 14;
    bodies.forEach((b, i) => {
      const d = s.s[i];
      const px = bot.x + ux * ((d / L) * len);
      const py = bot.y + uy * ((d / L) * len) - r - 2;
      const rot = (d / (2 * Math.PI * r)) * Math.PI * 2 * 6;

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(-rot);
      ctx.strokeStyle = b.color;
      ctx.lineWidth = 2.4;
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 8;
      if (b.name === "Ring") {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
      } else if (b.name === "Disk") {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-r, 0);
        ctx.lineTo(r, 0);
        ctx.moveTo(0, -r);
        ctx.lineTo(0, r);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(0, 0, r, r * 0.4, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // spoke to show rotation
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(-rot);
      ctx.strokeStyle = b.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(r - 3, 0);
      ctx.stroke();
      ctx.restore();

      circle(ctx, px - uy * 26, py + ux * -26 - 4, 2, b.color);
      label(ctx, b.name, px - uy * 48, py + ux * -48 - 6, b.color, 10, "center");
      label(ctx, `v = ${s.v[i].toFixed(1)}`, px + ux * 30, py + uy * 30, b.color, 9, "left");
    });

    // ranking banner
    const order = [...bodies].sort((a, b) => s.v[bodies.indexOf(b)] - s.v[bodies.indexOf(a)]);
    label(ctx, `a = g·sinθ/(1+k)  —  sphere > disk > ring, independent of mass & radius`, w / 2, h - 18, SIM.text, 11, "center");
    label(ctx, `leader: ${order[0].name}`, w - pad, 26, order[0].color, 12, "right");
  });

  return (
    <SimFrame
      title="Rolling race: ring vs disk vs sphere"
      about="Less rotational inertia per mass (smaller k = I/mR²) → more acceleration"
      height={330}
      canvas={<canvas ref={canvasRef} />}
      controls={
        <SimControls>
          <LabeledSlider label="Incline angle θ (°)" value={theta} min={10} max={45} step={1} decimals={0} onChange={setTheta} color="#fbbf24" />
          <ResetButton onClick={() => { state.current = { s: [0, 0, 0], v: [0, 0, 0], timer: 0 }; }} />
        </SimControls>
      }
      readouts={
        <>
          {bodies.map((b) => (
            <Readout key={b.name} label={`${b.name} a (k = ${b.k})`} value={`${((g * Math.sin(th)) / (1 + b.k)).toFixed(2)} m/s²`} color={b.color} />
          ))}
        </>
      }
    />
  );
}
