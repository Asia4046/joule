"use client";

import { useRef, useState } from "react";
import SimFrame from "@/components/concepts/SimFrame";
import { LabeledSlider, Readout, SimControls, ResetButton } from "@/components/concepts/controls";
import { useCanvas, SIM, clearPanel, label, arrow } from "@/components/concepts/useCanvas";

const RHO = 1.2; // air density, kg/m³
const N_PART = 170;
const SOUND = 343; // m/s — incompressible model breaks near this

type Particle = { x: number; y: number; vx: number; vy: number; seed: number };

function seedParticles(w: number, y0: number, y1: number): Particle[] {
  return Array.from({ length: N_PART }, (_, i) => ({
    x: (i / N_PART) * (w + 40),
    y: y0 + 6 + Math.random() * (y1 - y0 - 12),
    vx: 0,
    vy: 0,
    seed: Math.random(),
  }));
}

/**
 * Train in a tunnel: the piston effect. Rendered in the TRAIN'S frame, so the flow is
 * steady — air streams in at v and squeezes through the annular gap at u′ = v/(1−β).
 */
export default function TrainTunnelSim() {
  const [vTrain, setVTrain] = useState(33); // m/s
  const [beta, setBeta] = useState(0.7); // blockage ratio A₁/A₂
  const [a2, setA2] = useState(50); // tunnel cross-section, m²

  const uPrime = vTrain / (1 - beta); // gap air speed relative to train
  const uTunnel = uPrime - vTrain; // gap air speed relative to tunnel (backward)
  const dP = 0.5 * RHO * (uPrime * uPrime - vTrain * vTrain);
  const a1 = beta * a2;
  const qFlow = vTrain * a1;

  const state = useRef<{ t: number; ps: Particle[] }>({ t: 0, ps: [] });

  const canvasRef = useCanvas((ctx, w, h, _t, dt) => {
    const s = state.current;
    s.t += dt;

    // ── layout — the drawn bore scales with A₂: absolute size scales the flow
    // volume, never the speeds (those depend only on β) ──
    const iTop = 36;
    const iBot = h - 66;
    const midY = (iTop + iBot) / 2;
    const boreFrac = 0.55 + 0.45 * ((a2 - 30) / 50); // A₂ 30..80 m² → 55..100% of the interior
    const boreH = (iBot - iTop) * boreFrac;
    const y0 = midY - boreH / 2; // bore top
    const y1 = midY + boreH / 2; // bore bottom
    const trainH = beta * (y1 - y0);
    const trainTop = midY - trainH / 2;
    const trainBot = midY + trainH / 2;
    const cTop = (y0 + trainTop) / 2; // gap centrelines
    const cBot = (trainBot + y1) / 2;
    const L = Math.max(200, w * 0.36); // train length, px
    const nose = w * 0.72;
    const tail = nose - L;

    // px speed scale — keeps the u′/v RATIO exact, clamps absolute speed when u′ explodes
    const sPx = 2.1 * Math.min(1, 300 / Math.max(uPrime, 1));
    const vPx = vTrain * sPx;
    const uPx = uPrime * sPx;
    const free = -vPx;
    const gap = -uPx;

    if (s.ps.length !== N_PART) s.ps = seedParticles(w, y0, y1);

    clearPanel(ctx, w, h, false);

    // ── tunnel interior ──
    ctx.save();
    ctx.fillStyle = "#0a0f1c";
    ctx.fillRect(0, y0 - 14, w, y1 - y0 + 28);
    ctx.restore();

    // ── walls (stream left at v — we ride with the train) ──
    const off = (s.t * vPx) % 90;
    [
      [22, y0 - 14],
      [y1, y1 + 14],
    ].forEach(([wy, wy2]) => {
      ctx.save();
      ctx.fillStyle = "#151d31";
      ctx.fillRect(0, wy, w, wy2 - wy);
      ctx.strokeStyle = SIM.panelEdge;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, wy + 0.5);
      ctx.lineTo(w, wy + 0.5);
      ctx.moveTo(0, wy2 - 0.5);
      ctx.lineTo(w, wy2 - 0.5);
      ctx.stroke();
      ctx.strokeStyle = "rgba(161,161,170,0.14)";
      for (let x = -off; x < w; x += 90) {
        ctx.beginPath();
        ctx.moveTo(x, wy + 2);
        ctx.lineTo(x, wy2 - 2);
        ctx.stroke();
      }
      ctx.restore();
    });

    // track (rail + sleepers) in the bottom of the bore
    ctx.save();
    ctx.strokeStyle = "rgba(161,161,170,0.22)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, y1 - 8);
    ctx.lineTo(w, y1 - 8);
    ctx.stroke();
    ctx.fillStyle = "rgba(30,42,69,0.9)";
    const offS = (s.t * vPx) % 46;
    for (let x = -offS; x < w; x += 46) ctx.fillRect(x, y1 - 6, 15, 3);
    ctx.restore();

    // ── air particles: advect through the prescribed field ──
    // Drawn BEFORE the train so streaks never render on top of the solid body.
    const lead = 120;
    const trail = 150;
    const k = 1 - Math.exp(-7 * dt);
    const denom = Math.max(1, uPx - vPx * 0.85);
    ctx.save();
    ctx.lineCap = "round";
    for (const p of s.ps) {
      // target velocity by region
      let tx = free;
      let ty = 0;
      const corridorTop = p.y < trainTop - 2;
      const corridorBot = p.y > trainBot + 2;
      const inCorridor = corridorTop || corridorBot;
      const cY = corridorTop ? cTop : cBot;
      // per-particle "lane" inside its gap — keeps the jet filling the annulus
      // instead of collapsing onto the centreline or hugging the walls
      const gapW = corridorTop ? trainTop - y0 : y1 - trainBot;
      let lane = cY + (p.seed - 0.5) * 0.7 * Math.max(4, gapW);
      lane = Math.max(y0 + 4, Math.min(trainTop - 4, lane));
      if (corridorBot) lane = Math.max(trainBot + 4, Math.min(y1 - 4, lane));
      if (p.x >= nose + lead) {
        tx = free;
      } else if (p.x > nose) {
        // approach: gap-height air accelerates into the annulus; body-height air
        // stagnates against the nose face while deflecting around it
        const f = (nose + lead - p.x) / lead;
        if (inCorridor) {
          tx = free + (gap - free) * f;
          ty = (lane - p.y) * 0.5;
        } else {
          tx = free * (1 - f);
          ty = (p.y < midY ? cTop - p.y : cBot - p.y) * 1.4;
        }
      } else if (p.x > tail) {
        // alongside: full jet speed through the annulus; evict anything inside the body
        if (inCorridor) {
          tx = gap;
          ty = (lane - p.y) * 1.6;
        } else {
          tx = gap * 0.55;
          ty = (p.y < midY ? -1 : 1) * 150;
        }
      } else {
        // behind: relax the jet back to the free stream + wake wiggle
        const g = Math.min(1, (tail - p.x) / trail);
        tx = gap + (free - gap) * g;
        ty = Math.sin(s.t * 2.3 + p.seed * 7) * 12;
      }
      p.vx += (tx - p.vx) * k;
      p.vy += (ty - p.vy) * k;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.y < y0 + 3) {
        p.y = y0 + 3;
        p.vy = Math.abs(p.vy) * 0.5;
      } else if (p.y > y1 - 3) {
        p.y = y1 - 3;
        p.vy = -Math.abs(p.vy) * 0.5;
      }
      if (p.x < -12) {
        p.x = w + 8 + Math.random() * 24;
        p.y = y0 + 6 + Math.random() * (y1 - y0 - 12);
        p.vx = free;
        p.vy = 0;
      }

      // colour by how much faster than the free stream
      const r = Math.max(0, Math.min(1, (Math.abs(p.vx) - vPx * 0.85) / denom));
      const len = Math.max(3, Math.min(26, Math.abs(p.vx) * 0.045));
      const nx = p.vx === 0 ? 1 : p.vx / Math.abs(p.vx);
      ctx.strokeStyle = `hsl(${205 - 180 * r}, 85%, ${60 + 8 * r}%)`;
      ctx.lineWidth = 1.3 + r * 0.9;
      if (r > 0.75) {
        ctx.shadowColor = ctx.strokeStyle;
        ctx.shadowBlur = 5;
      } else {
        ctx.shadowBlur = 0;
      }
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - nx * len, p.y - p.vy * 0.04);
      ctx.stroke();
    }
    ctx.restore();

    // ── the train (fixed at centre of frame) ──
    ctx.save();
    const grad = ctx.createLinearGradient(0, trainTop, 0, trainBot);
    grad.addColorStop(0, "#46566f");
    grad.addColorStop(0.5, "#38465c");
    grad.addColorStop(1, "#2a3547");
    ctx.fillStyle = grad;
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(tail, trainTop + 7);
    ctx.lineTo(nose - 30, trainTop);
    ctx.quadraticCurveTo(nose, trainTop + 6, nose, midY);
    ctx.quadraticCurveTo(nose, trainBot - 6, nose - 30, trainBot);
    ctx.lineTo(tail, trainBot - 7);
    ctx.quadraticCurveTo(tail - 10, midY, tail, trainTop + 7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // roof highlight
    ctx.strokeStyle = "rgba(248,250,252,0.14)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(tail + 6, trainTop + 3);
    ctx.lineTo(nose - 36, trainTop + 2);
    ctx.stroke();
    ctx.restore();

    // windows
    const wy = trainTop + trainH * 0.2;
    for (let x = tail + 18; x < nose - 48; x += 27) {
      ctx.save();
      ctx.fillStyle = "rgba(56,189,248,0.7)";
      ctx.shadowColor = "rgba(56,189,248,0.5)";
      ctx.shadowBlur = 4;
      ctx.fillRect(x, wy, 14, Math.max(7, trainH * 0.16));
      ctx.restore();
    }
    // headlight + tail lights
    ctx.save();
    ctx.fillStyle = SIM.amber;
    ctx.shadowColor = SIM.amber;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(nose - 4, midY - trainH * 0.18, 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = SIM.red;
    ctx.shadowColor = SIM.red;
    [-8, 8].forEach((dy) => {
      ctx.beginPath();
      ctx.arc(tail + 4, midY + dy * (trainH / 90), 2, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // ── probe arrows: v in the undisturbed stream well ahead, u′ inside the gap ──
    const vAx = Math.min(w - 56, nose + lead + 60);
    const vLen = Math.max(18, vPx * 0.6);
    arrow(ctx, vAx + vLen / 2, y0 + 14, vAx - vLen / 2, y0 + 14, SIM.sky, 1.8);
    label(ctx, `v = ${vTrain} m/s`, vAx, y0 + 26, SIM.sky, 9, "center");
    // same px-per-(m/s) scale as the v arrow, clamped so β→1 can't run off the panel
    const gapLen = Math.min(120, uPx * 0.6);
    const gapAX = (tail + nose) / 2;
    arrow(ctx, gapAX + gapLen / 2, cTop, gapAX - gapLen / 2, cTop, SIM.amber, 2.2);
    const uLabel = `u′ = ${(1 / (1 - beta)).toFixed(1)}·v`;
    if (cTop - 9 >= y0 + 5) label(ctx, uLabel, gapAX, cTop - 9, SIM.amber, 9, "center");
    else label(ctx, uLabel, gapAX, 11, SIM.amber, 9, "center");

    // ── captions ──
    label(ctx, "TRAIN'S FRAME — tunnel & far-field air stream left at v", 14, 11, SIM.dim, 9);
    label(ctx, `β = A₁/A₂ = ${beta.toFixed(2)}`, w - 14, 11, SIM.bright, 9, "right");
    label(ctx, "annular gap · (1−β)·A₂", tail + 12, y0 + 9, SIM.dim, 8);
    label(ctx, `A₂ = ${a2} m²`, w - 14, y1 + 8, SIM.dim, 8, "right");

    // ── pressure profile strip ──
    const yP = h - 26;
    const amp = 5 + 15 * Math.min(1, dP / 8000);
    const xP0 = 34;
    const xP1 = w - 14;
    const P = (x: number) => {
      if (x > nose) return amp * Math.exp(-(x - nose) / 120);
      if (x > tail) {
        const sN = (x - tail) / (nose - tail);
        // suction along the annulus, blending continuously into the tail wake and
        // rising through the stagnation zone into the nose compression peak
        const along = 0.45 * Math.sin(Math.PI * sN) + 0.85 * (1 - sN);
        return amp * (Math.exp(-(nose - x) / 26) - along);
      }
      return -amp * 0.85 * Math.exp(-(tail - x) / 140);
    };
    label(ctx, "static pressure along tunnel", 14, h - 42, SIM.dim, 9);
    ctx.save();
    ctx.strokeStyle = "rgba(161,161,170,0.35)";
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.moveTo(xP0, yP);
    ctx.lineTo(xP1, yP);
    ctx.stroke();
    ctx.setLineDash([]);
    for (let x = xP0; x < xP1; x += 4) {
      const p = P(x);
      if (Math.abs(p) < 0.4) continue;
      ctx.fillStyle = p > 0 ? "rgba(228,104,118,0.32)" : "rgba(56,189,248,0.3)";
      ctx.fillRect(x, Math.min(yP, yP - p), 4, Math.abs(p));
    }
    ctx.strokeStyle = "rgba(241,245,249,0.75)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let i = 0; i <= 120; i++) {
      const x = xP0 + (i / 120) * (xP1 - xP0);
      const y = yP - P(x);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
    if (w > 700) {
      label(ctx, "compression", nose + 8, yP - amp - 6, SIM.red, 9);
      label(ctx, "suction", tail - 46, yP + amp * 0.85 + 7, SIM.sky, 9);
    }
  });

  return (
    <SimFrame
      title="Train in a tunnel — the piston effect"
      about="Train's frame: air the 'piston' displaces must squeeze through the annular gap — u′ = v/(1−β), blasting backward past the train"
      height={320}
      canvas={<canvas ref={canvasRef} />}
      controls={
        <SimControls>
          <LabeledSlider label="Train speed v (m/s)" value={vTrain} min={10} max={60} step={1} decimals={0} onChange={setVTrain} color="#E6C384" />
          <LabeledSlider label="Blockage β = A₁/A₂" value={beta} min={0.3} max={0.9} step={0.01} decimals={2} onChange={setBeta} color="#7FB4CA" />
          <LabeledSlider label="Tunnel area A₂ (m²)" value={a2} min={30} max={80} step={1} decimals={0} onChange={setA2} color="#D27E99" />
          <ResetButton
            onClick={() => {
              state.current.t = 0;
              state.current.ps = [];
            }}
          />
        </SimControls>
      }
      readouts={
        <>
          <Readout
            label="Gap air · rel. train u′ = v/(1−β)"
            value={`${uPrime.toFixed(0)} m/s${uPrime > SOUND ? " · ⚠ >Mach 1" : ""}`}
            color="#E6C384"
          />
          <Readout label="Gap air · rel. tunnel (backward)" value={`${uTunnel.toFixed(0)} m/s`} color="#7FB4CA" />
          <Readout label="Speed-up u′/v = 1/(1−β)" value={`${(1 / (1 - beta)).toFixed(2)}×`} color="#98BB6C" />
          <Readout
            label="Bernoulli drop ½ρ(u′²−v²)"
            value={dP >= 1000 ? `${(dP / 1000).toFixed(2)} kPa` : `${dP.toFixed(0)} Pa`}
            color="#E46876"
          />
          <Readout label="Displaced flow Q = v·A₁" value={`${qFlow.toFixed(0)} m³/s`} color="#D27E99" />
        </>
      }
    />
  );
}
