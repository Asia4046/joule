"use client";

import { useRef, useState } from "react";
import SimFrame from "@/components/concepts/SimFrame";
import { LabeledSlider, Readout, SimControls, ResetButton } from "@/components/concepts/controls";
import { useCanvas, SIM, clearPanel, label, arrow } from "@/components/concepts/useCanvas";

/** Block on a rough floor pushed by F: FBD arrows, static→kinetic friction transition. */
export default function FrictionSim() {
  const [F, setF] = useState(20);
  const [m, setM] = useState(4);
  const [mu, setMu] = useState(0.35);
  const g = 9.8;
  const state = useRef({ x: 0.12, v: 0 });

  const W = m * g;
  const N = W;
  const fsMax = mu * N;
  const fk = 0.8 * mu * N;
  const moving = state.current.v > 0.001;
  const friction = F > fsMax ? fk : F;
  const a = F > fsMax ? (F - fk) / m : 0;

  const canvasRef = useCanvas((ctx, w, h, _t, dt) => {
    const s = state.current;
    const fkNow = 0.8 * mu * N;
    const applied = F;
    const fsM = mu * N;
    let acc = 0;
    if (applied > fsM) acc = (applied - fkNow) / m;
    else if (s.v > 0) acc = -fkNow / m;
    s.v = Math.max(0, s.v + acc * dt);
    if (s.v === 0 && applied <= fsM) s.x = 0.12;
    s.x += s.v * dt;
    if (s.x > 0.86) {
      s.x = 0.12;
      s.v = 0;
    }

    clearPanel(ctx, w, h);
    const floorY = h * 0.62;
    const bw = 76;
    const bh = 56;
    const bx = 40 + s.x * (w - 120);
    const by = floorY - bh;

    // floor + hatching
    ctx.save();
    ctx.strokeStyle = SIM.axis;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(20, floorY);
    ctx.lineTo(w - 20, floorY);
    ctx.stroke();
    ctx.lineWidth = 1;
    for (let x = 24; x < w - 20; x += 14) {
      ctx.beginPath();
      ctx.moveTo(x, floorY);
      ctx.lineTo(x - 8, floorY + 9);
      ctx.stroke();
    }
    ctx.restore();

    // block
    ctx.save();
    ctx.fillStyle = SIM.indigo;
    ctx.shadowColor = SIM.indigo;
    ctx.shadowBlur = 10;
    ctx.fillRect(bx, by, bw, bh);
    ctx.restore();
    label(ctx, `${m.toFixed(1)} kg`, bx + bw / 2, by + bh / 2, SIM.white, 12, "center");

    const cx = bx + bw / 2;
    // FBD arrows
    arrow(ctx, bx + bw, by + bh / 2, bx + bw + 18 + (F / 60) * 70, by + bh / 2, SIM.green, 3);
    label(ctx, `F = ${F.toFixed(0)} N`, bx + bw + 24 + (F / 60) * 70, by + bh / 2 - 12, SIM.green, 11, "left");
    arrow(ctx, bx - 18 - (friction / 60) * 70, by + bh / 2, bx, by + bh / 2, friction > 0 ? SIM.red : SIM.dim, 2);
    label(ctx, `f = ${friction.toFixed(1)} N`, bx - 24 - (friction / 60) * 70, by + bh / 2 - 12, friction > 0 ? SIM.red : SIM.dim, 11, "right");
    arrow(ctx, cx, by, cx, by - 26 - (N / 60) * 26, SIM.sky, 2);
    label(ctx, `N = ${N.toFixed(0)} N`, cx + 8, by - 30 - (N / 60) * 26, SIM.sky, 11);
    arrow(ctx, cx, by + bh, cx, by + bh + 26 + (W / 60) * 26, SIM.amber, 2);
    label(ctx, `mg = ${W.toFixed(0)} N`, cx + 8, by + bh + 30 + (W / 60) * 26, SIM.amber, 11);

    // status banner
    const status = F > fsMax ? `SLIDING — kinetic friction ${fk.toFixed(1)} N, a = ${((F - fk) / m).toFixed(2)} m/s²` : `STATIC — friction matches F = ${F.toFixed(0)} N (limit ${fsMax.toFixed(1)} N)`;
    label(ctx, status, w / 2, 26, F > fsM ? SIM.red : SIM.green, 12, "center");

    // velocity readout bar
    label(ctx, `v = ${s.v.toFixed(2)} m/s`, w / 2, h - 24, SIM.bright, 12, "center");
  });

  return (
    <SimFrame
      title="Friction & FBD sandbox"
      about="Static friction self-adjusts until F exceeds μₛN, then kinetic friction takes over"
      height={330}
      canvas={<canvas ref={canvasRef} />}
      controls={
        <SimControls>
          <LabeledSlider label="Applied force F (N)" value={F} min={0} max={60} step={0.5} decimals={1} onChange={setF} color="#34d399" />
          <LabeledSlider label="Mass m (kg)" value={m} min={1} max={10} step={0.1} decimals={1} onChange={setM} />
          <LabeledSlider label="Coefficient μₛ" value={mu} min={0.05} max={0.8} step={0.01} onChange={setMu} color="#f87171" />
          <ResetButton onClick={() => { state.current = { x: 0.12, v: 0 }; }} />
        </SimControls>
      }
      readouts={
        <>
          <Readout label="Friction limit μₛN" value={`${fsMax.toFixed(1)} N`} color="#f87171" />
          <Readout label="Kinetic μₖN (μₖ = 0.8μₛ)" value={`${fk.toFixed(1)} N`} />
          <Readout label="Acceleration" value={moving || F > fsMax ? `${a.toFixed(2)} m/s²` : "0 (static)"} color={F > fsMax ? "#34d399" : undefined} />
        </>
      }
    />
  );
}
