"use client";

import { useRef, useState } from "react";
import SimFrame from "@/components/concepts/SimFrame";
import { LabeledSlider, Readout, SimControls } from "@/components/concepts/controls";
import { useCanvas, SIM, clearPanel, label, circle, arrow } from "@/components/concepts/useCanvas";

const h = 4.136e-15; // eV·s
const C = 3e8;

const LIGHT_COLOR = (nm: number) => (nm > 640 ? "#ef4444" : nm > 590 ? "#f97316" : nm > 560 ? "#eab308" : nm > 500 ? "#22c55e" : nm > 470 ? "#06b6d4" : "#6366f1");

/** Photoelectric effect: frequency vs threshold, KEmax, stopping voltage, emission animation. */
export default function PhotoelectricSim() {
  const [lambda, setLambda] = useState(450);
  const [intensity, setIntensity] = useState(1);
  const [phi, setPhi] = useState(2.0); // work function eV
  const state = useRef({ electrons: [] as { x: number; y: number; v: number; vx: number; vy: number }[], emitAcc: 0 });

  const E = (h * C) / (lambda * 1e-9);
  const KEmax = E - phi;
  const V0 = Math.max(0, KEmax);
  const emitting = KEmax > 0;
  const lambda0 = (h * C) / phi; // threshold wavelength nm

  const canvasRef = useCanvas((ctx, w, hpx, _t, dt) => {
    const s = state.current;
    clearPanel(ctx, w, hpx, false);
    const pad = 26;
    const color = LIGHT_COLOR(lambda);

    // photon beam (left → metal plate)
    ctx.save();
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.25 + 0.75 * intensity;
    ctx.lineWidth = 1.4;
    const beamY = hpx / 2;
    const t = performance.now() / 1000;
    for (let i = 0; i < 5; i++) {
      const y = beamY - 36 + i * 18;
      const off = ((t * 220 * (0.5 + 0.5 * intensity)) % 90);
      ctx.setLineDash([12, 78]);
      ctx.lineDashOffset = -off;
      ctx.beginPath();
      ctx.moveTo(pad, y);
      ctx.lineTo(w * 0.34, y);
      ctx.stroke();
    }
    ctx.restore();
    label(ctx, `photons  E = ${E.toFixed(2)} eV`, pad + 4, beamY - 52, color, 10);
    label(ctx, `intensity ${(intensity * 100).toFixed(0)}%`, pad + 4, beamY - 38, SIM.dim, 10);

    // metal plate
    const plateX = w * 0.36;
    ctx.save();
    const grad = ctx.createLinearGradient(plateX, 0, plateX + 14, 0);
    grad.addColorStop(0, "#64748b");
    grad.addColorStop(1, "#334155");
    ctx.fillStyle = grad;
    ctx.fillRect(plateX, hpx * 0.2, 12, hpx * 0.6);
    ctx.restore();
    label(ctx, `metal  φ = ${phi.toFixed(1)} eV`, plateX + 6, hpx * 0.2 - 12, SIM.text, 10, "center");

    // collector plate
    const colX = w * 0.86;
    ctx.save();
    ctx.fillStyle = "#64748b";
    ctx.fillRect(colX, hpx * 0.2, 8, hpx * 0.6);
    ctx.restore();
    label(ctx, "collector (+)", colX + 4, hpx * 0.2 - 12, SIM.text, 10, "center");

    // emitted electrons
    if (emitting) {
      s.emitAcc += dt * intensity * 3;
      while (s.emitAcc > 1) {
        s.emitAcc -= 1;
        const speed = 40 + Math.random() * Math.sqrt(KEmax) * 60;
        s.electrons.push({
          x: plateX + 14,
          y: hpx * 0.3 + Math.random() * hpx * 0.4,
          v: speed,
          vx: speed,
          vy: (Math.random() - 0.5) * 18,
        });
      }
    }
    s.electrons = s.electrons.filter((e) => e.x < colX - 6 && e.x > 0);
    s.electrons.forEach((e) => {
      e.x += e.vx * dt;
      e.y += e.vy * dt;
      circle(ctx, e.x, e.y, 3, "#38bdf8", true);
    });

    // status
    label(
      ctx,
      emitting
        ? `emission ON — KEmax = ${KEmax.toFixed(2)} eV, stopping voltage V₀ = ${V0.toFixed(2)} V`
        : `NO emission — E = ${E.toFixed(2)} eV < φ = ${phi.toFixed(2)} eV (need λ < ${lambda0.toFixed(0)} nm)`,
      w / 2,
      hpx - 14,
      emitting ? SIM.green : SIM.red,
      11,
      "center"
    );

    // I-V inset (top right)
    const ivX = w * 0.56;
    const ivY = hpx * 0.12;
    const ivW = w * 0.24;
    const ivH = hpx * 0.26;
    ctx.save();
    ctx.strokeStyle = SIM.axis;
    ctx.lineWidth = 1;
    ctx.strokeRect(ivX, ivY, ivW, ivH);
    ctx.beginPath();
    ctx.moveTo(ivX + (ivW * V0) / 4, ivY + ivH);
    ctx.lineTo(ivX + (ivW * V0) / 4, ivY + ivH - intensity * ivH * 0.7);
    ctx.lineTo(ivX + ivW - 4, ivY + ivH - intensity * ivH * 0.7);
    ctx.strokeStyle = SIM.green;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
    label(ctx, "I–V curve", ivX + 4, ivY - 6, SIM.dim, 9);
    label(ctx, "−V₀", ivX + (ivW * V0) / 4, ivY + ivH + 10, SIM.red, 9, "center");
  });

  return (
    <SimFrame
      title="Photoelectric effect"
      about="Only frequency matters for KEmax; intensity sets photocurrent — test it yourself"
      height={320}
      canvas={<canvas ref={canvasRef} />}
      controls={
        <SimControls>
          <LabeledSlider label="Wavelength λ (nm)" value={lambda} min={200} max={750} step={5} decimals={0} onChange={setLambda} color={LIGHT_COLOR(lambda)} />
          <LabeledSlider label="Intensity" value={intensity} min={0.05} max={1} step={0.05} onChange={setIntensity} color="#fbbf24" />
          <LabeledSlider label="Work function φ (eV)" value={phi} min={1} max={4.5} step={0.1} decimals={1} onChange={setPhi} color="#f87171" />
        </SimControls>
      }
      readouts={
        <>
          <Readout label="Photon energy E = hc/λ" value={`${E.toFixed(2)} eV`} color={LIGHT_COLOR(lambda)} />
          <Readout label="KEmax = hν − φ" value={KEmax > 0 ? `${KEmax.toFixed(2)} eV` : "no emission"} color={KEmax > 0 ? "#34d399" : "#f87171"} />
          <Readout label="Stopping voltage" value={`${V0.toFixed(2)} V`} />
          <Readout label="Threshold λ₀ = hc/φ" value={`${lambda0.toFixed(0)} nm`} color="#fbbf24" />
        </>
      }
    />
  );
}
