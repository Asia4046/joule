"use client";

import { useRef, useState } from "react";
import SimFrame from "@/components/concepts/SimFrame";
import { LabeledSlider, Readout, SimControls, ResetButton } from "@/components/concepts/controls";
import { useCanvas, SIM, clearPanel, label, arrow, circle } from "@/components/concepts/useCanvas";

const TRACK = 6; // metres of world space shown on the track

/** Head-on 1-D collision with tunable restitution — the engine behind a family of JEE Advanced problems. */
export default function CollisionSim() {
  const [m1, setM1] = useState(2);
  const [m2, setM2] = useState(1);
  const [e, setE] = useState(1);
  const [u1, setU1] = useState(4);
  const [u2, setU2] = useState(0.5);

  const M = m1 + m2;
  const v1 = ((m1 - e * m2) * u1 + (1 + e) * m2 * u2) / M;
  const v2 = ((m2 - e * m1) * u2 + (1 + e) * m1 * u1) / M;
  const mu = (m1 * m2) / M;
  const keI = 0.5 * m1 * u1 * u1 + 0.5 * m2 * u2 * u2;
  const keLoss = 0.5 * mu * (1 - e * e) * Math.pow(u1 - u2, 2);
  const lossPct = keI > 0 ? (keLoss / keI) * 100 : 0;

  const r1 = 0.1 * Math.cbrt(m1) + 0.06;
  const r2 = 0.1 * Math.cbrt(m2) + 0.06;

  const state = useRef({ x1: 1, x2: 4.6, vx1: u1, vx2: u2, hit: false, rest: 0 });
  const params = useRef({ m1, m2, e, u1, u2 });
  if (
    params.current.m1 !== m1 || params.current.m2 !== m2 ||
    params.current.e !== e || params.current.u1 !== u1 || params.current.u2 !== u2
  ) {
    params.current = { m1, m2, e, u1, u2 };
    state.current = { x1: 1, x2: 4.6, vx1: u1, vx2: u2, hit: false, rest: 0 };
  }

  const canvasRef = useCanvas((ctx, w, h, _t, dt) => {
    const s = state.current;
    const pad = 30;
    const trackY = h / 2 - 10;
    const sx = (x: number) => pad + (x / TRACK) * (w - 2 * pad);
    const sy = (y: number) => trackY - y;

    // physics
    s.rest += dt;
    if (!s.hit) {
      s.x1 += s.vx1 * dt;
      s.x2 += s.vx2 * dt;
      if (s.x2 - s.x1 <= r1 + r2) {
        s.hit = true;
        s.rest = 0;
        s.x1 = s.x2 - (r1 + r2);
        s.vx1 = v1;
        s.vx2 = v2;
      }
    } else {
      s.x1 += s.vx1 * dt;
      s.x2 += s.vx2 * dt;
      if (s.rest > 3.2) {
        s.x1 = 1; s.x2 = 4.6; s.vx1 = u1; s.vx2 = u2; s.hit = false; s.rest = 0;
      }
    }

    clearPanel(ctx, w, h);
    // track
    ctx.save();
    ctx.strokeStyle = SIM.axis;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(pad, trackY);
    ctx.lineTo(w - pad, trackY);
    ctx.stroke();
    for (let m = 0; m <= TRACK; m++) {
      ctx.beginPath();
      ctx.moveTo(sx(m), trackY);
      ctx.lineTo(sx(m), trackY + 5);
      ctx.stroke();
      label(ctx, `${m}m`, sx(m), trackY + 14, SIM.dim, 8, "center");
    }
    ctx.restore();

    // velocity–time style mini strip under the track
    const stripY = h - 58;
    label(ctx, "v before → after", pad, stripY - 10, SIM.dim, 9);
    const bar = (frac: number, color: string, name: string, y: number) => {
      const bw = Math.abs(frac) * 60;
      const x0 = frac >= 0 ? w / 2 - 130 : w / 2 - 130 - bw;
      ctx.fillStyle = color;
      ctx.fillRect(x0, y, bw, 9);
      label(ctx, name, w / 2 - 130 - 46, y + 4, color, 9);
    };
    bar(s.hit ? v1 : u1, SIM.indigo, `v₁ ${s.hit ? "after" : "before"}`, stripY);
    bar(s.hit ? v2 : u2, SIM.green, `v₂ ${s.hit ? "after" : "before"}`, stripY + 16);
    // zero axis for the strip
    ctx.save();
    ctx.strokeStyle = "rgba(148,163,184,0.3)";
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.moveTo(w / 2 - 130, stripY - 2);
    ctx.lineTo(w / 2 - 130, stripY + 30);
    ctx.stroke();
    ctx.restore();

    // balls
    const drawBall = (x: number, r: number, m: number, vx: number, color: string) => {
      const px = sx(x);
      const py = sy(r);
      circle(ctx, px, py, r / TRACK * (w - 2 * pad), color, true);
      label(ctx, `${m.toFixed(1)}kg`, px, py, SIM.bright, 9, "center");
      arrow(ctx, px, py - r / TRACK * (w - 2 * pad) - 10, px + vx * 16, py - r / TRACK * (w - 2 * pad) - 10, SIM.amber, 2);
      label(ctx, `${Math.abs(vx).toFixed(2)} m/s`, px + vx * 16 + (vx >= 0 ? 4 : -4), py - r / TRACK * (w - 2 * pad) - 22, SIM.amber, 9, vx >= 0 ? "left" : "right");
    };
    drawBall(s.x1, r1, m1, s.vx1, SIM.indigo);
    drawBall(s.x2, r2, m2, s.vx2, SIM.green);

    if (s.hit && s.rest < 1) {
      label(ctx, "COLLISION", w / 2, h / 2 - 40, e === 1 ? SIM.sky : SIM.red, 14, "center");
      if (e < 1) label(ctx, `energy lost: ${lossPct.toFixed(1)}%`, w / 2, h / 2 - 24, SIM.red, 10, "center");
      else label(ctx, "kinetic energy conserved", w / 2, h / 2 - 24, SIM.sky, 10, "center");
    }
    if (e === 1 && Math.abs(m1 - m2) < 1e-9) {
      label(ctx, "equal masses, e = 1 → velocities are exchanged", w / 2, 18, SIM.dim, 9, "center");
    }
  });

  return (
    <SimFrame
      title="Collision & restitution lab"
      about="Head-on 1-D collision — set masses, speeds and e; watch momentum conserve itself while KE betrays you"
      height={320}
      canvas={<canvas ref={canvasRef} />}
      controls={
        <SimControls>
          <LabeledSlider label="Mass m₁ (kg)" value={m1} min={0.5} max={5} step={0.1} decimals={1} onChange={setM1} color="#818cf8" />
          <LabeledSlider label="Mass m₂ (kg)" value={m2} min={0.5} max={5} step={0.1} decimals={1} onChange={setM2} color="#34d399" />
          <LabeledSlider label="Restitution e" value={e} min={0} max={1} step={0.05} onChange={setE} color="#f87171" />
          <LabeledSlider label="Initial u₁ (m/s)" value={u1} min={1} max={6} step={0.1} decimals={1} onChange={setU1} />
          <LabeledSlider label="Initial u₂ (m/s)" value={u2} min={0} max={3} step={0.1} decimals={1} onChange={setU2} color="#fbbf24" />
          <ResetButton onClick={() => { state.current = { x1: 1, x2: 4.6, vx1: u1, vx2: u2, hit: false, rest: 0 }; }} />
        </SimControls>
      }
      readouts={
        <>
          <Readout label="v₁ after" value={`${v1.toFixed(2)} m/s`} color="#818cf8" />
          <Readout label="v₂ after" value={`${v2.toFixed(2)} m/s`} color="#34d399" />
          <Readout label="KE lost" value={`${lossPct.toFixed(1)}%`} color="#f87171" />
          <Readout label="Momentum" value="always conserved" color="#38bdf8" />
        </>
      }
    />
  );
}
