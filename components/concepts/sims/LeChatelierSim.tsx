"use client";

import { useRef, useState } from "react";
import SimFrame from "@/components/concepts/SimFrame";
import { LabeledSlider, Readout, SimControls } from "@/components/concepts/controls";
import { useCanvas, SIM, clearPanel, label } from "@/components/concepts/useCanvas";

/* N₂O₄ (g) ⇌ 2 NO₂ (g) — ΔH° = +57.2 kJ/mol (endothermic forward),
 * Kp(298 K) = 0.147 atm. Kp(T) from the van't Hoff equation.
 * A sealed syringe starts with n₀ mol N₂O₄; solving
 * Kp = (RT/V)·4x²/(n₀−x) gives the dissociation x each frame. */
const DH = 57200; // J/mol
const R_GAS = 8.314; // J/(mol·K) — van't Hoff
const R_ATM = 0.0821; // L·atm/(mol·K) — partial pressures
const KP298 = 0.147;
const N0 = 0.04; // mol N₂O₄ charged into the syringe

const kpAt = (T: number) => KP298 * Math.exp((-DH / R_GAS) * (1 / T - 1 / 298));

/** Positive root of (4RT/V)x² + Kp·x − Kp·n₀ = 0. */
function solveX(T: number, V: number) {
  const K = kpAt(T);
  const a = (4 * R_ATM * T) / V;
  const disc = K * K + 4 * a * K * N0;
  return (-K + Math.sqrt(disc)) / (2 * a);
}

const fmtPrec = (v: number) => Number(v.toPrecision(3)).toString();

type Dot = { x: number; y: number; vx: number; vy: number };

function LeChatelierSim() {
  const [T, setT] = useState(298);
  const [V, setV] = useState(4);

  const dotsRef = useRef<Dot[] | null>(null);
  const pistonRef = useRef(4); // animated volume (L)
  const xAnimRef = useRef<number | null>(null); // relaxed dissociation for drawing
  const shiftRef = useRef<{ text: string; color: string; until: number } | null>(null);
  const lastRef = useRef<{ T: number; V: number; x: number } | null>(null);

  // equilibrium values for the current settings (readouts show exact values)
  const K = kpAt(T);
  const x = solveX(T, V);

  const canvasRef = useCanvas((ctx, w, h, t, dt) => {
    clearPanel(ctx, w, h, false);

    // ── geometry of the syringe ─────────────────────────────────────
    const bx0 = 36;
    const bx1 = w - 104; // barrel body
    const by0 = h * 0.34;
    const by1 = h * 0.86;
    const usable = bx1 - bx0 - 26;

    pistonRef.current += (V - pistonRef.current) * Math.min(1, 8 * dt);
    const gasEnd = bx0 + 13 + usable * (pistonRef.current / 6);

    const xTarget = x;
    if (xAnimRef.current == null) xAnimRef.current = xTarget;
    xAnimRef.current += (xTarget - xAnimRef.current) * Math.min(1, 5 * dt);
    const xa = xAnimRef.current;

    // Le Chatelier verdict: freeze the OLD equilibrium in the NEW conditions,
    // compare that Q against the NEW K.
    const last = lastRef.current;
    if (last && (last.T !== T || last.V !== V)) {
      const Q = ((R_ATM * T) / V) * ((2 * last.x) ** 2 / (N0 - last.x));
      const K2 = kpAt(T);
      if (Math.abs(K2 - Q) > 1e-9) {
        shiftRef.current = {
          text: Q < K2 ? "Q < K → equilibrium shifts FORWARD (→ NO₂)" : "Q > K → equilibrium shifts REVERSE (→ N₂O₄)",
          color: Q < K2 ? SIM.green : SIM.sky,
          until: t + 3,
        };
      }
    }
    lastRef.current = { T, V, x: xTarget };

    const nNO2 = 2 * xa;
    const nN2O4 = N0 - xa;
    const cNO2 = nNO2 / pistonRef.current; // mol/L for colour depth

    // ── gas fill (brown ∝ [NO₂]) ───────────────────────────────────
    const alpha = Math.min(0.6, 0.04 + 9 * cNO2);
    ctx.save();
    ctx.beginPath();
    ctx.rect(bx0 + 12, by0, gasEnd - bx0 - 12, by1 - by0);
    const grad = ctx.createLinearGradient(0, by0, 0, by1);
    grad.addColorStop(0, `rgba(198, 93, 42, ${alpha * 0.75})`);
    grad.addColorStop(0.5, `rgba(198, 93, 42, ${alpha})`);
    grad.addColorStop(1, `rgba(150, 60, 24, ${alpha * 0.8})`);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();

    // ── molecules ───────────────────────────────────────────────────
    if (!dotsRef.current) {
      dotsRef.current = Array.from({ length: 84 }, () => {
        const ang = Math.random() * Math.PI * 2;
        return {
          x: bx0 + 20 + Math.random() * Math.max(1, gasEnd - bx0 - 40),
          y: by0 + 10 + Math.random() * (by1 - by0 - 20),
          vx: Math.cos(ang),
          vy: Math.sin(ang),
        };
      });
    }
    const speed = 42 * Math.sqrt(T / 298);
    // dot counts follow the true mole numbers (1000 dots per mol)
    const nNO2Dots = Math.min(84, Math.round(nNO2 * 1000));
    const totalDots = Math.min(84, Math.round((nNO2 + nN2O4) * 1000));
    dotsRef.current.forEach((d, i) => {
      if (i >= totalDots) return;
      d.x += d.vx * speed * dt;
      d.y += d.vy * speed * dt;
      if (d.x < bx0 + 20) { d.x = bx0 + 20; d.vx *= -1; }
      if (d.x > gasEnd - 12) { d.x = gasEnd - 12; d.vx *= -1; }
      if (d.y < by0 + 10) { d.y = by0 + 10; d.vy *= -1; }
      if (d.y > by1 - 10) { d.y = by1 - 10; d.vy *= -1; }

      if (i < nNO2Dots) {
        // NO₂ — single brown molecule
        ctx.beginPath();
        ctx.arc(d.x, d.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#E6A158";
        ctx.fill();
      } else {
        // N₂O₄ — pale dimer (two bonded circles)
        ctx.strokeStyle = "#8A97A8";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(d.x - 4, d.y);
        ctx.lineTo(d.x + 4, d.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(d.x - 5, d.y, 3, 0, Math.PI * 2);
        ctx.arc(d.x + 5, d.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#9BA8B8";
        ctx.fill();
      }
    });

    // ── barrel, piston, plunger ────────────────────────────────────
    ctx.save();
    ctx.strokeStyle = SIM.axis;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(bx0, by0 - 6, bx1 - bx0, by1 - by0 + 12); // barrel walls
    ctx.beginPath(); // nozzle
    ctx.moveTo(bx0, by0 + (by1 - by0) / 2 - 10);
    ctx.lineTo(bx0 - 14, by0 + (by1 - by0) / 2);
    ctx.lineTo(bx0, by0 + (by1 - by0) / 2 + 10);
    ctx.stroke();
    // piston face + rod + handle
    ctx.fillStyle = "#C9C9D2";
    ctx.fillRect(gasEnd - 6, by0 - 4, 10, by1 - by0 + 8);
    ctx.fillRect(gasEnd + 4, by0 + (by1 - by0) / 2 - 3, w - 60 - gasEnd, 6);
    ctx.fillRect(w - 64, by0 + (by1 - by0) / 2 - 26, 8, 52);
    ctx.restore();

    // volume ticks under the barrel
    for (let vL = 2; vL <= 6; vL++) {
      const tx = bx0 + 13 + usable * (vL / 6);
      ctx.strokeStyle = SIM.dim;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(tx, by1 + 8);
      ctx.lineTo(tx, by1 + 14);
      ctx.stroke();
      label(ctx, `${vL}L`, tx, by1 + 24, SIM.dim, 9, "center");
    }

    // ── header: equation, ΔH and shift verdict stacked — no side-by-side
    // text that could collide on a phone-width canvas
    label(ctx, "N₂O₄ (g)", w * 0.32, 24, "#9BA8B8", 13, "center");
    label(ctx, "⇌", w * 0.46, 24, SIM.bright, 15, "center");
    label(ctx, "2 NO₂ (g)", w * 0.61, 24, "#E6A158", 13, "center");
    label(ctx, "ΔH° = +57.2 kJ (endothermic forward)", w / 2, 42, SIM.dim, 9.5, "center");

    const sh = shiftRef.current;
    if (sh && t < sh.until) {
      label(ctx, sh.text, w / 2, 60, sh.color, 10, "center");
    } else {
      label(ctx, "at equilibrium: Q = K", w / 2, 60, SIM.dim, 10, "center");
    }

    // legend
    ctx.beginPath();
    ctx.arc(42, h - 14, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#E6A158";
    ctx.fill();
    label(ctx, "NO₂", 52, h - 14, SIM.dim, 9);
    ctx.beginPath();
    ctx.arc(96, h - 14, 3, 0, Math.PI * 2);
    ctx.arc(106, h - 14, 3, 0, Math.PI * 2);
    ctx.fillStyle = "#9BA8B8";
    ctx.fill();
    label(ctx, "N₂O₄", 116, h - 14, SIM.dim, 9);
  });

  const alphaDeg = (x / N0) * 100;

  return (
    <SimFrame
      title="Le Chatelier pressure tube"
      about="N₂O₄ ⇌ 2NO₂ in a sealed syringe — squeeze or heat the tube and watch the equilibrium re-solve exactly."
      height={340}
      canvas={<canvas ref={canvasRef} />}
      controls={
        <SimControls>
          <LabeledSlider label="Temperature" value={T} min={260} max={380} step={1} decimals={0} unit=" K" onChange={setT} color="#E46876" />
          <LabeledSlider label="Volume (piston)" value={V} min={2} max={6} step={0.1} decimals={1} unit=" L" onChange={setV} color="#7FB4CA" />
        </SimControls>
      }
      readouts={
        <>
          <Readout label="Kp at this T" value={`${fmtPrec(K)} atm`} color={SIM.amber} />
          <Readout label="Dissociation α" value={`${alphaDeg.toFixed(1)} %`} color={SIM.green} />
          <Readout label="n(NO₂)" value={`${(2 * x * 1000).toFixed(1)} mmol`} color="#E6A158" />
          <Readout label="n(N₂O₄)" value={((N0 - x) * 1000).toFixed(1) + " mmol"} color="#9BA8B8" />
          <Readout label="Total pressure" value={(((N0 + x) * R_ATM * T) / V).toFixed(2) + " atm"} />
        </>
      }
    />
  );
}

export default LeChatelierSim;
