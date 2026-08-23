"use client";

import { useRef, useState } from "react";
import SimFrame from "@/components/concepts/SimFrame";
import { LabeledSlider, Readout, SimControls } from "@/components/concepts/controls";
import { useCanvas, SIM, clearPanel, label, circle, arrow } from "@/components/concepts/useCanvas";

/* Daniell cell: Zn | Zn²⁺ (aq) ‖ Cu²⁺ (aq) | Cu
 * E°cell = 0.34 − (−0.76) = 1.10 V;  Nernst at any T:
 *   E = E° − (RT/2F) ln([Zn²⁺]/[Cu²⁺]) */
const E0_CELL = 1.1;
const R = 8.314;
const F = 96485;

const pointOnPath = (pts: [number, number][], u: number): [number, number] => {
  const segs: number[] = [];
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const d = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
    segs.push(d);
    total += d;
  }
  let target = u * total;
  for (let i = 0; i < pts.length - 1; i++) {
    if (target <= segs[i] || i === pts.length - 2) {
      const f = segs[i] === 0 ? 0 : Math.min(1, target / segs[i]);
      return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f];
    }
    target -= segs[i];
  }
  return pts[pts.length - 1];
};

function GalvanicCellSim() {
  const [cZn, setCZn] = useState(0.1);
  const [cCu, setCCu] = useState(0.1);
  const [T, setT] = useState(298);

  const ePhases = useRef<number[]>(Array.from({ length: 9 }, (_, i) => i / 9));
  const kPhases = useRef<number[]>(Array.from({ length: 5 }, (_, i) => i / 5));

  const E = E0_CELL - ((R * T) / (2 * F)) * Math.log(cZn / cCu);
  const dG = (-2 * F * E) / 1000;

  const canvasRef = useCanvas((ctx, w, h, t, dt) => {
    clearPanel(ctx, w, h, false);

    const bkY0 = 108;
    const bkY1 = h - 78; // room below for three label rows plus the Nernst footer
    const lx0 = 30;
    const lx1 = w * 0.36;
    const rx0 = w * 0.64;
    const rx1 = w - 30;
    const solY = 148;
    const exL = (lx0 + lx1) / 2;
    const exR = (rx0 + rx1) / 2;

    // ── beakers + solutions ────────────────────────────────────────
    const beaker = (x0: number, x1: number) => {
      ctx.save();
      ctx.strokeStyle = SIM.axis;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x0, bkY0);
      ctx.lineTo(x0, bkY1);
      ctx.lineTo(x1, bkY1);
      ctx.lineTo(x1, bkY0);
      ctx.stroke();
      ctx.restore();
    };
    beaker(lx0, lx1);
    beaker(rx0, rx1);

    ctx.fillStyle = "rgba(160,170,185,0.1)"; // ZnSO₄ ≈ colourless (faint so the beaker reads as full)
    ctx.fillRect(lx0 + 2, solY, lx1 - lx0 - 4, bkY1 - solY - 2);
    const blue = Math.min(0.42, 0.07 + 0.35 * cCu); // Cu²⁺ tint
    ctx.fillStyle = `rgba(72, 140, 205, ${blue})`;
    ctx.fillRect(rx0 + 2, solY, rx1 - rx0 - 4, bkY1 - solY - 2);
    // solution surface line on both beakers
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.28)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(lx0 + 2, solY);
    ctx.lineTo(lx1 - 2, solY);
    ctx.moveTo(rx0 + 2, solY);
    ctx.lineTo(rx1 - 2, solY);
    ctx.stroke();
    ctx.restore();

    label(ctx, "ZnSO₄ (aq) — anode (−)", (lx0 + lx1) / 2, bkY1 + 16, SIM.dim, 9.5, "center");
    label(ctx, "CuSO₄ (aq) — cathode (+)", (rx0 + rx1) / 2, bkY1 + 16, SIM.dim, 9.5, "center");
    label(ctx, `[Zn²⁺] = ${cZn.toFixed(3)} M`, (lx0 + lx1) / 2, bkY1 + 30, SIM.text, 9.5, "center");
    label(ctx, `[Cu²⁺] = ${cCu.toFixed(3)} M`, (rx0 + rx1) / 2, bkY1 + 30, SIM.text, 9.5, "center");
    label(ctx, "Zn → Zn²⁺ + 2e⁻ · E° = −0.76 V", (lx0 + lx1) / 2, bkY1 + 44, SIM.dim, 9, "center");
    label(ctx, "Cu²⁺ + 2e⁻ → Cu · E° = +0.34 V", (rx0 + rx1) / 2, bkY1 + 44, SIM.dim, 9, "center");

    // ── electrodes ─────────────────────────────────────────────────
    const elTop = 78;
    const elBot = solY + 78;
    ctx.fillStyle = "#A7ABB4"; // zinc
    ctx.fillRect(exL - 7, elTop, 14, elBot - elTop);
    ctx.fillStyle = "#C98A4B"; // copper
    ctx.fillRect(exR - 7, elTop, 14, elBot - elTop);
    label(ctx, "Zn", exL - 12, elTop + 10, "#A7ABB4", 11, "right");
    label(ctx, "Cu", exR + 12, elTop + 10, "#C98A4B", 11, "left");
    // terminal badges where the wire meets each electrode — in a galvanic
    // cell the anode is negative and the cathode positive
    const badge = (x: number, y: number, sign: string) => {
      circle(ctx, x, y, 7, SIM.panel);
      ctx.save();
      ctx.strokeStyle = SIM.bright;
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      label(ctx, sign, x, y, SIM.bright, 10, "center");
    };
    badge(exL, elTop, "−");
    badge(exR, elTop, "+");

    // ── external wire + voltmeter ──────────────────────────────────
    const wireY = 52;
    const vw = 118;
    const vh = 46;
    ctx.save();
    ctx.strokeStyle = SIM.text;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(exL, elTop);
    ctx.lineTo(exL, wireY);
    ctx.lineTo(exR, wireY);
    ctx.lineTo(exR, elTop);
    ctx.stroke();
    ctx.restore();

    // electrons drift anode → cathode at a speed tied to the driving force
    const wirePts: [number, number][] = [
      [exL, elTop],
      [exL, wireY],
      [exR, wireY],
      [exR, elTop],
    ];
    const eSpeed = 0.05 + 0.1 * Math.abs(E);
    ePhases.current = ePhases.current.map((p) => (p + eSpeed * dt) % 1);
    ePhases.current.forEach((p) => {
      const [px, py] = pointOnPath(wirePts, p);
      circle(ctx, px, py, 3.2, SIM.bright, true);
    });
    label(ctx, "e⁻ →", (exL + (w / 2 - vw / 2)) / 2, wireY - 8, SIM.dim, 8.5, "center");

    // voltmeter drawn last so the wire and electrons pass behind it
    ctx.fillStyle = SIM.panel;
    ctx.strokeStyle = SIM.bright;
    ctx.lineWidth = 1.5;
    ctx.fillRect(w / 2 - vw / 2, wireY - vh / 2 - 22, vw, vh);
    ctx.strokeRect(w / 2 - vw / 2, wireY - vh / 2 - 22, vw, vh);
    label(ctx, `${E.toFixed(3)} V`, w / 2, wireY - 22, E > 0 ? SIM.green : SIM.red, 16, "center");
    label(ctx, "E_cell", w / 2, wireY - 4, SIM.dim, 8.5, "center");

    // ── salt bridge ────────────────────────────────────────────────
    const bridgeL = lx1 - 26;
    const bridgeR = rx0 + 26;
    const bridgeTop = 86;
    ctx.save();
    ctx.strokeStyle = SIM.axis;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(bridgeL, solY + 10);
    ctx.lineTo(bridgeL, bridgeTop);
    ctx.lineTo(bridgeR, bridgeTop);
    ctx.lineTo(bridgeR, solY + 10);
    ctx.stroke();
    ctx.strokeStyle = SIM.panel;
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.restore();
    label(ctx, "salt bridge — KNO₃", (bridgeL + bridgeR) / 2, bridgeTop - 12, SIM.dim, 9, "center");

    // K⁺ → cathode (right), NO₃⁻ → anode (left)
    const kSpeed = 0.03 + 0.06 * Math.abs(E);
    kPhases.current = kPhases.current.map((p) => (p + kSpeed * dt) % 1);
    const bridgePts: [number, number][] = [
      [bridgeL, bridgeTop],
      [bridgeR, bridgeTop],
    ];
    kPhases.current.forEach((p, i) => {
      const u = i % 2 === 0 ? p : 1 - p; // two lanes, opposite directions
      const [px, py] = pointOnPath(bridgePts, u);
      circle(ctx, px, py - (i % 2 === 0 ? 1.5 : -1.5), 2.4, i % 2 === 0 ? SIM.amber : SIM.sky);
    });
    label(ctx, "K⁺ →", bridgeL + 8, bridgeTop - 24, SIM.amber, 8.5);
    label(ctx, "← NO₃⁻", bridgeR - 8, bridgeTop + 16, SIM.sky, 8.5, "right");

    // ── ion drift hints in the solutions ───────────────────────────
    for (let i = 0; i < 3; i++) {
      const pulse = 0.35 + 0.3 * Math.sin(t * 2 + i * 2.1);
      ctx.save();
      ctx.globalAlpha = pulse;
      const ay = solY + 22 + i * 22;
      // Zn²⁺ leaves the dissolving anode; Cu²⁺ approaches the plating cathode
      arrow(ctx, exL + 12, ay, exL + 32, ay, SIM.text, 1.4);
      arrow(ctx, exL - 12, ay, exL - 32, ay, SIM.text, 1.4);
      arrow(ctx, exR + 32, ay, exR + 12, ay, SIM.text, 1.4);
      arrow(ctx, exR - 32, ay, exR - 12, ay, SIM.text, 1.4);
      ctx.restore();
    }
    label(ctx, "Zn²⁺ out", exL - 44, solY + 6, SIM.dim, 8.5);
    label(ctx, "Cu²⁺ in", exR + 40, solY + 6, SIM.dim, 8.5, "right");

    label(ctx, `Q = [Zn²⁺]/[Cu²⁺] = ${(cZn / cCu).toFixed(1)}   ·   E = E° − (RT/2F)·ln Q`, w / 2, h - 10, SIM.dim, 9.5, "center");
  });

  return (
    <SimFrame
      title="Daniell cell — Nernst equation"
      about="Slide the ion concentrations and temperature; the meter, electron flow and ion drift all follow the Nernst equation exactly."
      height={360}
      canvas={<canvas ref={canvasRef} />}
      controls={
        <SimControls>
          <LabeledSlider label="[Zn²⁺] (anode)" value={cZn} min={0.001} max={1} step={0.001} decimals={3} unit=" M" onChange={setCZn} color="#A7ABB4" />
          <LabeledSlider label="[Cu²⁺] (cathode)" value={cCu} min={0.001} max={1} step={0.001} decimals={3} unit=" M" onChange={setCCu} color="#7FB4CA" />
          <LabeledSlider label="Temperature" value={T} min={273} max={373} step={1} decimals={0} unit=" K" onChange={setT} color="#E46876" />
        </SimControls>
      }
      readouts={
        <>
          <Readout label="E°cell" value="1.100 V" />
          <Readout label="E cell (Nernst)" value={`${E.toFixed(3)} V`} color={SIM.green} />
          <Readout label="Reaction quotient Q" value={(cZn / cCu).toFixed(1)} />
          <Readout label="ΔG = −nFE" value={`${dG.toFixed(0)} kJ/mol`} color={E > 0 ? SIM.green : SIM.red} />
          <Readout label="Cell notation" value="Zn | Zn²⁺ ‖ Cu²⁺ | Cu" />
        </>
      }
    />
  );
}

export default GalvanicCellSim;
