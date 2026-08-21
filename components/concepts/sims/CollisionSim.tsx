"use client";

import { useRef, useState } from "react";
import SimFrame from "@/components/concepts/SimFrame";
import { LabeledSlider, Readout, SimControls, SimToggleGroup, ResetButton } from "@/components/concepts/controls";
import { useCanvas, SIM, clearPanel, label, arrow, circle } from "@/components/concepts/useCanvas";

const g = 9.8;
const TRACK = 6; // metres of world space on the track

type Mode = "headon" | "bounces" | "chain";

/** Three collision archetypes: head-on 1-D, bouncing-ball geometric series, and the wall–block "hidden π" chain. */
export default function CollisionSim() {
  const [mode, setMode] = useState<Mode>("headon");
  // head-on
  const [m1, setM1] = useState(2);
  const [m2, setM2] = useState(1);
  const [e, setE] = useState(1);
  const [u1, setU1] = useState(4);
  const [u2, setU2] = useState(0.5);
  // bounces
  const [h0, setH0] = useState(3);
  // chain
  const [ratio, setRatio] = useState(100); // M/m
  const [vBlock, setVBlock] = useState(2.4); // m/s toward the ball

  const M = m1 + m2;
  const v1 = ((m1 - e * m2) * u1 + (1 + e) * m2 * u2) / M;
  const v2 = ((m2 - e * m1) * u2 + (1 + e) * m1 * u1) / M;
  const mu = (m1 * m2) / M;
  const keI = 0.5 * m1 * u1 * u1 + 0.5 * m2 * u2 * u2;
  const keLoss = 0.5 * mu * (1 - e * e) * Math.pow(u1 - u2, 2);
  const lossPct = keI > 0 ? (keLoss / keI) * 100 : 0;
  const r1 = 0.1 * Math.cbrt(m1) + 0.06;
  const r2 = 0.1 * Math.cbrt(m2) + 0.06;

  // bounces analytics
  const totalH = (h0 * (1 + e * e)) / (1 - e * e);
  const totalT = Math.sqrt((2 * h0) / g) * ((1 + e) / (1 - e));
  // chain analytics — the famous count ≈ π√(M/m)
  const piTheory = Math.PI * Math.sqrt(ratio);

  const state = useRef<Record<string, number | boolean | unknown[]>>({});
  const params = useRef({ mode, m1, m2, e, u1, u2, h0, ratio, vBlock });
  const reinit = () => {
    if (mode === "headon") state.current = { x1: 1, x2: 4.6, vx1: u1, vx2: u2, hit: false, rest: 0 };
    else if (mode === "bounces") state.current = { y: h0, vy: 0, bounces: 0, dist: 0, t: 0, hold: 0, pts: [], done: false };
    else state.current = { xb: 1.4, vb: 0, xB: 4.2, vB: -Math.abs(vBlock), hits: 0, wallHits: 0, done: false, hold: 0 };
  };
  if (
    params.current.mode !== mode || params.current.m1 !== m1 || params.current.m2 !== m2 ||
    params.current.e !== e || params.current.u1 !== u1 || params.current.u2 !== u2 ||
    params.current.h0 !== h0 || params.current.ratio !== ratio || params.current.vBlock !== vBlock
  ) {
    params.current = { mode, m1, m2, e, u1, u2, h0, ratio, vBlock };
    reinit();
  }

  const canvasRef = useCanvas((ctx, w, h, _t, dt) => {
    clearPanel(ctx, w, h);
    const pad = 30;

    // ════ MODE 1: head-on collision ════
    if (mode === "headon") {
      const s = state.current as { x1: number; x2: number; vx1: number; vx2: number; hit: boolean; rest: number };
      const trackY = h / 2 - 10;
      const sx = (x: number) => pad + (x / TRACK) * (w - 2 * pad);
      const sy = (y: number) => trackY - y;

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
        if (s.rest > 3.2) reinit();
      }

      // track + ruler
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

      // balls + CM marker
      const drawBall = (x: number, r: number, m: number, vx: number, color: string) => {
        const px = sx(x);
        const py = sy(r);
        const pr = (r / TRACK) * (w - 2 * pad);
        circle(ctx, px, py, pr, color, true);
        label(ctx, `${m.toFixed(1)}kg`, px, py, SIM.bright, 9, "center");
        arrow(ctx, px, py - pr - 10, px + vx * 16, py - pr - 10, SIM.amber, 2);
        label(ctx, `${Math.abs(vx).toFixed(2)}`, px + vx * 16 + (vx >= 0 ? 4 : -4), py - pr - 22, SIM.amber, 9, vx >= 0 ? "left" : "right");
      };
      drawBall(s.x1, r1, m1, s.vx1, SIM.indigo);
      drawBall(s.x2, r2, m2, s.vx2, SIM.green);
      const vCm = (m1 * s.vx1 + m2 * s.vx2) / M;
      const xCm = (m1 * s.x1 + m2 * s.x2) / M;
      ctx.save();
      ctx.fillStyle = SIM.fuchsia;
      ctx.shadowColor = SIM.fuchsia;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(sx(xCm), trackY + 22);
      ctx.lineTo(sx(xCm) - 5, trackY + 32);
      ctx.lineTo(sx(xCm) + 5, trackY + 32);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      arrow(ctx, sx(xCm), trackY + 27, sx(xCm) + vCm * 14, trackY + 27, SIM.fuchsia, 1.6);
      label(ctx, `v_cm = ${vCm.toFixed(2)} m/s — never changes`, sx(xCm), trackY + 44, SIM.fuchsia, 9, "center");

      if (s.hit && s.rest < 1) {
        label(ctx, "COLLISION", w / 2, h / 2 - 46, e === 1 ? SIM.sky : SIM.red, 14, "center");
        label(ctx, e < 1 ? `energy lost: ${lossPct.toFixed(1)}%` : "kinetic energy conserved", w / 2, h / 2 - 30, e < 1 ? SIM.red : SIM.sky, 10, "center");
      }
      if (e === 1 && Math.abs(m1 - m2) < 1e-9) {
        label(ctx, "equal masses, e = 1 → velocities are exchanged", w / 2, 18, SIM.dim, 9, "center");
      }

      // ── momentum & KE audit strip ──
      const ay = h - 74;
      label(ctx, "momentum (total) — identical before & after", pad, ay - 10, SIM.dim, 9);
      const pTot = m1 * u1 + m2 * u2;
      const pScale = 110 / Math.max(Math.abs(pTot), 0.001);
      ctx.save();
      const pDir = pTot >= 0 ? 1 : -1;
      ctx.fillStyle = SIM.sky;
      ctx.fillRect(w / 2 - 110, ay, pDir * Math.abs(pTot) * pScale, 10);
      ctx.strokeStyle = "rgba(148,163,184,0.35)";
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(w / 2 - 110, ay - 2);
      ctx.lineTo(w / 2 - 110, ay + 46);
      ctx.stroke();
      ctx.restore();
      label(ctx, `${pTot.toFixed(2)} kg·m/s`, w / 2 - 116, ay + 5, SIM.sky, 9, "right");

      const ky = ay + 24;
      label(ctx, "kinetic energy", pad, ky - 10, SIM.dim, 9);
      const kScale = 220 / Math.max(keI, 0.001);
      const keAfter = keI - keLoss;
      ctx.save();
      ctx.fillStyle = SIM.green;
      ctx.fillRect(w / 2 - 110, ky, keAfter * kScale, 10);
      if (keLoss > 1e-6) {
        ctx.fillStyle = SIM.red;
        ctx.fillRect(w / 2 - 110 + keAfter * kScale, ky, keLoss * kScale, 10);
      }
      ctx.restore();
      label(ctx, `KE ${keAfter.toFixed(2)} J`, w / 2 - 116, ky + 5, SIM.green, 9, "right");
      if (keLoss > 1e-6) label(ctx, `heat ${keLoss.toFixed(2)} J`, w / 2 - 110 + Math.max(keAfter * kScale, 0) + 6, ky + 5, SIM.red, 9, "left");
    }

    // ════ MODE 2: bouncing ball — geometric series ════
    else if (mode === "bounces") {
      const s = state.current as { y: number; vy: number; bounces: number; dist: number; t: number; hold: number; pts: unknown[]; done: boolean };
      type Pt = { t: number; y: number };
      const pts = s.pts as Pt[];
      const floorY = h - 46;
      const yScale = (floorY - 46) / (h0 * 1.05);
      const tMax = Math.min(totalT * 1.05, 60);
      const px = (t: number) => pad + (t / tMax) * (w - 2 * pad);
      const py = (y: number) => floorY - y * yScale;

      if (!s.done) {
        const sub = 4;
        for (let i = 0; i < sub; i++) {
          const dtt = dt / sub;
          const vy0 = s.vy;
          s.vy -= g * dtt;
          s.y += ((vy0 + s.vy) / 2) * dtt;
          s.dist += Math.abs(((vy0 + s.vy) / 2) * dtt);
          if (s.y <= 0 && s.vy < 0) {
            s.y = 0;
            s.vy = -s.vy * e;
            s.bounces += 1;
          }
        }
        s.t += dt;
        pts.push({ t: s.t, y: s.y });
        if ((s.bounces >= 1 && s.vy < 0.12 && s.y <= 0.001) || s.t > tMax) {
          s.done = true;
          s.hold = 0;
        }
      } else {
        s.hold += dt;
        if (s.hold > 2.2) reinit();
      }

      // floor
      ctx.save();
      ctx.strokeStyle = SIM.axis;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pad - 10, floorY);
      ctx.lineTo(w - pad + 10, floorY);
      ctx.stroke();
      for (let x = pad - 10; x < w - pad + 10; x += 16) {
        ctx.strokeStyle = "rgba(148,163,184,0.18)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, floorY);
        ctx.lineTo(x - 8, floorY + 8);
        ctx.stroke();
      }
      ctx.restore();

      // trajectory trace
      ctx.save();
      ctx.strokeStyle = "rgba(129,140,248,0.6)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      pts.forEach((p, i) => {
        if (i === 0) ctx.moveTo(px(p.t), py(p.y));
        else ctx.lineTo(px(p.t), py(p.y));
      });
      ctx.stroke();
      ctx.restore();

      // the ball
      circle(ctx, Math.min(px(s.t), w - pad), py(s.y), 9, SIM.amber, true);
      arrow(ctx, px(s.t), py(s.y) - 16, px(s.t), py(s.y) - 16 - s.vy * 4, s.vy > 0 ? SIM.green : SIM.red, 1.8);

      // peak annotations: apex of bounce n happens at t₀(1 + e + … + eⁿ), height h₀e²ⁿ
      const t0 = Math.sqrt((2 * h0) / g);
      const peakT = (n: number) => t0 * (1 + (e * (1 - Math.pow(e, n))) / (1 - e));
      for (let n = 1; n <= 3; n++) {
        const hp = h0 * Math.pow(e, 2 * n);
        if (hp < h0 * 0.03) break;
        label(ctx, `e^${2 * n}h₀`, px(peakT(n)), py(hp) - 8, SIM.dim, 8, "center");
      }
      label(ctx, `bounce ${s.bounces} · distance ${s.dist.toFixed(1)} m`, pad, 18, SIM.text, 10);
      label(ctx, `Σh = h₀(1+e²)/(1−e²) = ${totalH.toFixed(2)} m · Σt = √(2h₀/g)·(1+e)/(1−e) = ${totalT.toFixed(2)} s`, w / 2, h - 16, SIM.dim, 9, "center");
    }

    // ════ MODE 3: wall–block–ball chain — the hidden π ════
    else {
      const s = state.current as { xb: number; vb: number; xB: number; vB: number; hits: number; wallHits: number; done: boolean; hold: number };
      const rb = 0.14;
      const rB = Math.min(0.3 + 0.18 * Math.cbrt(ratio), 0.6);
      const trackY = h / 2 - 10;
      const sx = (x: number) => pad + 26 + (x / TRACK) * (w - 2 * pad - 40);
      const sy = (y: number) => trackY - y;
      const m = 1;

      if (!s.done) {
        const sub = 3;
        for (let i = 0; i < sub; i++) {
          const dtt = (dt / sub) * 0.55;
          s.xb += s.vb * dtt;
          s.xB += s.vB * dtt;
          if (s.xb - rb <= 0.05 && s.vb < 0) {
            s.vb = -s.vb;
            s.xb = 0.05 + rb;
            s.hits += 1;
            s.wallHits += 1;
          }
          if (s.xb + rb >= s.xB - rB && s.vb > s.vB) {
            const vb0 = s.vb;
            const vB0 = s.vB;
            s.vb = ((m - ratio) * vb0 + 2 * ratio * vB0) / (m + ratio);
            s.vB = ((ratio - m) * vB0 + 2 * m * vb0) / (m + ratio);
            s.xb = s.xB - rB - rb;
            s.hits += 1;
          }
          if (s.vb >= 0 && s.vB > s.vb && s.xb < s.xB - rB - rb - 0.01) {
            s.done = true;
            s.hold = 0;
          }
        }
      } else {
        s.hold += dt;
        if (s.hold > 2.6) reinit();
      }

      // wall
      ctx.save();
      ctx.fillStyle = "#1c2740";
      ctx.fillRect(pad, trackY - 70, 14, 140);
      ctx.strokeStyle = SIM.panelEdge;
      ctx.strokeRect(pad, trackY - 70, 14, 140);
      for (let y = trackY - 64; y < trackY + 66; y += 14) {
        ctx.strokeStyle = "rgba(148,163,184,0.2)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pad + 14, y);
        ctx.lineTo(pad + 22, y - 8);
        ctx.stroke();
      }
      ctx.restore();

      // ground
      ctx.save();
      ctx.strokeStyle = SIM.axis;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(pad, trackY + 46);
      ctx.lineTo(w - pad, trackY + 46);
      ctx.stroke();
      ctx.restore();

      // ball
      circle(ctx, sx(s.xb), sy(rb + 3), (rb / TRACK) * (w - 2 * pad - 40), SIM.red, true);
      label(ctx, "m", sx(s.xb), sy(rb + 3) - 16, SIM.red, 10, "center");
      arrow(ctx, sx(s.xb), sy(rb * 3), sx(s.xb) + s.vb * 22, sy(rb * 3), SIM.amber, 1.6);

      // block
      const bw = (rB * 2 / TRACK) * (w - 2 * pad - 40);
      const bh = Math.min(24 + ratio * 0.16, 56);
      ctx.save();
      ctx.fillStyle = "rgba(129,140,248,0.28)";
      ctx.strokeStyle = SIM.indigo;
      ctx.lineWidth = 2;
      ctx.fillRect(sx(s.xB) - bw / 2, trackY + 46 - bh - 14, bw, bh + 14);
      ctx.strokeRect(sx(s.xB) - bw / 2, trackY + 46 - bh - 14, bw, bh + 14);
      ctx.restore();
      label(ctx, `M = ${ratio}m`, sx(s.xB), trackY + 46 - bh / 2 - 14, SIM.indigo, 10, "center");
      arrow(ctx, sx(s.xB), trackY + 46 - bh - 26, sx(s.xB) + s.vB * 22, trackY + 46 - bh - 26, SIM.amber, 1.6);

      // counter
      label(ctx, `collisions: ${s.hits}`, w - pad - 4, 20, SIM.bright, 15, "right");
      label(ctx, `(ball–wall: ${s.wallHits} · ball–block: ${s.hits - s.wallHits})`, w - pad - 4, 36, SIM.dim, 9, "right");
      label(ctx, `theory ≈ π√(M/m) = ${piTheory.toFixed(1)}`, w - pad - 4, 52, SIM.sky, 10, "right");
      if (s.done) label(ctx, "block escapes — no more collisions possible", w / 2, h - 34, SIM.green, 10, "center");
      label(ctx, "all collisions elastic (e = 1) · every pair preserves KE and momentum", w / 2, h - 16, SIM.dim, 9, "center");
    }
  });

  return (
    <SimFrame
      title="Collision & restitution lab"
      about="Head-on impacts with energy audit · bouncing-ball geometric series · the wall–block chain that hides π"
      height={340}
      canvas={<canvas ref={canvasRef} />}
      controls={
        <SimControls>
          <SimToggleGroup
            label="Scenario"
            value={mode}
            options={[
              { value: "headon", label: "Head-on" },
              { value: "bounces", label: "Bouncing ball" },
              { value: "chain", label: "Wall–block chain" },
            ]}
            onChange={(v) => setMode(v)}
          />
          {mode === "headon" && (
            <>
              <LabeledSlider label="Mass m₁ (kg)" value={m1} min={0.5} max={5} step={0.1} decimals={1} onChange={setM1} color="#818cf8" />
              <LabeledSlider label="Mass m₂ (kg)" value={m2} min={0.5} max={5} step={0.1} decimals={1} onChange={setM2} color="#34d399" />
              <LabeledSlider label="Restitution e" value={e} min={0} max={1} step={0.05} onChange={setE} color="#f87171" />
              <LabeledSlider label="Initial u₁ (m/s)" value={u1} min={1} max={6} step={0.1} decimals={1} onChange={setU1} />
              <LabeledSlider label="Initial u₂ (m/s)" value={u2} min={0} max={3} step={0.1} decimals={1} onChange={setU2} color="#fbbf24" />
            </>
          )}
          {mode === "bounces" && (
            <>
              <LabeledSlider label="Drop height h₀ (m)" value={h0} min={1} max={4} step={0.1} decimals={1} onChange={setH0} color="#fbbf24" />
              <LabeledSlider label="Restitution e" value={e} min={0.1} max={0.95} step={0.05} onChange={setE} color="#f87171" />
            </>
          )}
          {mode === "chain" && (
            <>
              <LabeledSlider label="Mass ratio M/m" value={ratio} min={1} max={200} step={1} decimals={0} onChange={setRatio} color="#818cf8" />
              <LabeledSlider label="Block speed (m/s)" value={vBlock} min={1} max={4} step={0.2} decimals={1} onChange={setVBlock} />
            </>
          )}
          <ResetButton onClick={reinit} />
        </SimControls>
      }
      readouts={
        <>
          {mode === "headon" && (
            <>
              <Readout label="v₁ after" value={`${v1.toFixed(2)} m/s`} color="#818cf8" />
              <Readout label="v₂ after" value={`${v2.toFixed(2)} m/s`} color="#34d399" />
              <Readout label="KE lost" value={`${lossPct.toFixed(1)}%`} color="#f87171" />
              <Readout label="Momentum" value="always conserved" color="#38bdf8" />
            </>
          )}
          {mode === "bounces" && (
            <>
              <Readout label="Total height Σh" value={`${totalH.toFixed(2)} m`} color="#fbbf24" />
              <Readout label="Total time Σt" value={`${totalT.toFixed(2)} s`} color="#34d399" />
              <Readout label="Bounces (to rest)" value="count on canvas" color="#e879f9" />
              <Readout label="Energy after n bounces" value="e²ⁿ of original" color="#f87171" />
            </>
          )}
          {mode === "chain" && (
            <>
              <Readout label="Predicted collisions" value={`≈ ${piTheory.toFixed(0)}`} color="#38bdf8" />
              <Readout label="π√(M/m)" value={`${piTheory.toFixed(2)}`} color="#818cf8" />
              <Readout label="Final block speed" value="≈ initial (M ≫ m)" color="#34d399" />
              <Readout label="All collisions" value="e = 1, momentum + KE" color="#fbbf24" />
            </>
          )}
        </>
      }
    />
  );
}
