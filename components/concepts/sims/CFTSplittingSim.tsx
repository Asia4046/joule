"use client";

import { useState } from "react";
import SimFrame from "@/components/concepts/SimFrame";
import { LabeledSlider, Readout, SimControls, SimToggleGroup } from "@/components/concepts/controls";
import { useCanvas, SIM, clearPanel, label } from "@/components/concepts/useCanvas";

/** Spectrochemical-series stand-ins (illustrative Δo values for a 3d³⁺ centre, cm⁻¹). */
const LIGANDS: { value: string; label: string; d: number }[] = [
  { value: "I", label: "I⁻", d: 9000 },
  { value: "Br", label: "Br⁻", d: 10500 },
  { value: "Cl", label: "Cl⁻", d: 12000 },
  { value: "F", label: "F⁻", d: 13500 },
  { value: "H2O", label: "H₂O", d: 17500 },
  { value: "NH3", label: "NH₃", d: 22500 },
  { value: "en", label: "en", d: 24000 },
  { value: "CN", label: "CN⁻", d: 33000 },
];
const P_PAIRING = 15000; // cm⁻¹, illustrative pairing energy

const IONS = ["—", "Ti³⁺ (d¹)", "Ti²⁺ / V³⁺ (d²)", "Cr³⁺ / V²⁺ (d³)", "Cr²⁺ / Mn³⁺ (d⁴)", "Mn²⁺ / Fe³⁺ (d⁵)", "Co³⁺ (d⁶)", "Co²⁺ (d⁷)", "Ni²⁺ (d⁸)", "Cu²⁺ (d⁹)", "Zn²⁺ (d¹⁰)"];

/** Fill orbitals with electrons, honouring Hund's rule within each degenerate group.
 *  High spin: one electron in every orbital (bottom group up) before any pairing.
 *  Low spin: each group is completed (singles, then pairs) before the next opens. */
function fillGroups(groupSizes: number[], n: number, highSpin: boolean): number[][] {
  const occ = groupSizes.map((s) => new Array<number>(s).fill(0));
  let left = n;
  const singles = (gi: number) => {
    for (let j = 0; j < occ[gi].length && left > 0; j++)
      if (occ[gi][j] === 0) { occ[gi][j] = 1; left--; }
  };
  const pairs = (gi: number) => {
    for (let j = 0; j < occ[gi].length && left > 0; j++)
      while (occ[gi][j] < 2 && left > 0) { occ[gi][j]++; left--; }
  };
  if (highSpin) {
    for (let gi = 0; gi < groupSizes.length; gi++) singles(gi);
    for (let gi = 0; gi < groupSizes.length; gi++) pairs(gi);
  } else {
    for (let gi = 0; gi < groupSizes.length && left > 0; gi++) { singles(gi); pairs(gi); }
  }
  return occ;
}

function CFTSplittingSim() {
  const [geo, setGeo] = useState<"oct" | "tet">("oct");
  // F⁻ default keeps the mounted state consistent: Δo < P → weak field →
  // high spin, exactly what the readout claims for d⁴–d⁷ configurations
  const [ligand, setLigand] = useState("F");
  const [dCount, setDCount] = useState(6);
  const [spin, setSpin] = useState<"high" | "low">("high");

  const lig = LIGANDS.find((l) => l.value === ligand) ?? LIGANDS[3];
  const delta = geo === "oct" ? lig.d : (lig.d * 4) / 9;
  const strong = lig.d > P_PAIRING;

  const pickLigand = (v: string) => {
    setLigand(v);
    const d = LIGANDS.find((l) => l.value === v)?.d ?? 0;
    // Δo vs P decides the spin state wherever a choice exists (d⁴–d⁷)
    setSpin(d > P_PAIRING && dCount >= 4 && dCount <= 7 ? "low" : "high");
  };
  const pickGeo = (v: "oct" | "tet") => {
    setGeo(v);
    if (v === "tet") setSpin("high"); // Δt ≈ 4/9 Δo is always too small to pair early
  };

  // octahedral: t₂g (3, lower, −0.4Δo) then e_g (2, upper, +0.6Δo)
  // tetrahedral: e (2, lower, −0.6Δt) then t₂ (3, upper, +0.4Δt)
  const isOct = geo === "oct";
  const groups = isOct
    ? { sizes: [3, 2], weights: [-0.4, 0.6], names: ["t₂g", "eg"], orbs: [["dxy", "dyz", "dzx"], ["dz²", "dx²−y²"]], unit: "Δo" }
    : { sizes: [2, 3], weights: [-0.6, 0.4], names: ["e", "t₂"], orbs: [["dz²", "dx²−y²"], ["dxy", "dyz", "dzx"]], unit: "Δt" };

  const occ = fillGroups(groups.sizes, dCount, isOct ? spin === "high" : true);
  let cfseUnits = 0;
  let unpaired = 0;
  occ.forEach((g, gi) => {
    cfseUnits += g.reduce((s, e) => s + e, 0) * groups.weights[gi];
    unpaired += g.filter((e) => e === 1).length;
  });
  const cfse = cfseUnits === 0 ? "0" : `${cfseUnits.toFixed(1)} ${groups.unit}`;
  const mu = Math.sqrt(unpaired * (unpaired + 2));

  const canvasRef = useCanvas((ctx, w, h) => {
    clearPanel(ctx, w, h, false);

    // ── d-orbital energy ladder ─────────────────────────────────────
    const narrow = w < 640;
    const baryY = h * 0.52;
    const maxGap = 170; // px for Δo = 33,000 cm⁻¹
    const gapPx = (delta / 33000) * maxGap;
    const lowY = baryY + (isOct ? 0.4 : 0.6) * gapPx;
    const highY = baryY - (isOct ? 0.6 : 0.4) * gapPx;
    const barW = narrow ? 128 : 168;
    const lx = narrow ? 58 : Math.max(150, w * 0.27) - barW / 2;

    // barycentre
    ctx.save();
    ctx.strokeStyle = SIM.dim;
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(lx - (narrow ? 40 : 70), baryY);
    ctx.lineTo(lx + barW + (narrow ? 30 : 70), baryY);
    ctx.stroke();
    ctx.restore();
    label(ctx, narrow ? "barycentre" : "barycentre (free-ion d)", lx + barW + (narrow ? 34 : 74), baryY, SIM.dim, 9, "left");

    const groupYs = [lowY, highY];
    groups.names.forEach((name, gi) => {
      const y = groupYs[gi];
      ctx.strokeStyle = SIM.axis;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(lx, y);
      ctx.lineTo(lx + barW, y);
      ctx.stroke();
      label(ctx, name, lx - 46, y, gi === 0 ? SIM.green : SIM.red, 13, "left");
      const nOrb = groups.sizes[gi];
      const boxW = barW / nOrb;
      for (let j = 0; j < nOrb; j++) {
        const bx = lx + j * boxW;
        ctx.strokeStyle = SIM.panelEdge;
        ctx.lineWidth = 1;
        ctx.strokeRect(bx + 4, y - 13, boxW - 8, 26);
        label(ctx, groups.orbs[gi][j], bx + boxW / 2, y + 26, SIM.dim, 8.5, "center");
        // electron arrows
        const e = occ[gi][j];
        const drawArrow = (dir: 1 | -1, dx: number) => {
          ctx.save();
          ctx.strokeStyle = dir === 1 ? SIM.sky : SIM.amber;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(bx + boxW / 2 + dx, y + dir * 9);
          ctx.lineTo(bx + boxW / 2 + dx, y - dir * 9);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(bx + boxW / 2 + dx, y - dir * 9);
          ctx.lineTo(bx + boxW / 2 + dx - 3, y - dir * 9 + dir * 5);
          ctx.lineTo(bx + boxW / 2 + dx + 3, y - dir * 9 + dir * 5);
          ctx.closePath();
          ctx.fillStyle = dir === 1 ? SIM.sky : SIM.amber;
          ctx.fill();
          ctx.restore();
        };
        if (e >= 1) drawArrow(1, -7);
        if (e === 2) drawArrow(-1, 7);
      }
    });

    // Δ bracket with P marker
    const bX = lx + barW + (narrow ? 26 : 34);
    ctx.save();
    ctx.strokeStyle = SIM.bright;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(bX, lowY);
    ctx.lineTo(bX, highY);
    ctx.moveTo(bX - 5, lowY);
    ctx.lineTo(bX + 5, lowY);
    ctx.moveTo(bX - 5, highY);
    ctx.lineTo(bX + 5, highY);
    ctx.stroke();
    ctx.restore();
    const dLabel = isOct ? `Δo = ${lig.d.toLocaleString("en-IN")} cm⁻¹` : `Δt = ${delta.toLocaleString("en-IN")} cm⁻¹`;
    label(ctx, dLabel, bX + 8, (lowY + highY) / 2, SIM.bright, 10.5);
    if (isOct) {
      const pY = Math.max(highY - 18, Math.min(lowY - 18, lowY - (P_PAIRING / 33000) * maxGap));
      ctx.save();
      ctx.strokeStyle = SIM.fuchsia;
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(bX - 6, pY);
      ctx.lineTo(bX + 26, pY);
      ctx.stroke();
      ctx.restore();
      label(ctx, "P", bX + 30, pY, SIM.fuchsia, 10);
    }

    label(
      ctx,
      isOct
        ? strong
          ? "Δo > P → strong field → electrons pair before entering e_g"
          : "Δo < P → weak field → electrons spread out (high spin)"
        : "tetrahedral: Δt = 4/9 Δo — always high spin",
      w / 2,
      h - 40,
      strong && isOct ? SIM.green : SIM.dim,
      narrow ? 9 : 10,
      "center"
    );
    label(ctx, `d${dCount} configuration · ${unpaired} unpaired · CFSE = ${cfse}`, w / 2, h - 22, SIM.text, narrow ? 9.5 : 10.5, "center");

    // ── right: why the levels split (top-right corner on narrow canvases) ──
    const cx = narrow ? w - 82 : w * 0.74;
    const cy = narrow ? 102 : h * 0.44;
    const arm = narrow ? 44 : 64;
    label(ctx, isOct ? "octahedral field" : "tetrahedral field", cx, narrow ? 42 : 46, SIM.text, narrow ? 9.5 : 11, "center");
    if (isOct) {
      ctx.save();
      ctx.strokeStyle = SIM.grid;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 3]);
      [-arm, arm].forEach((d) => {
        ctx.beginPath(); ctx.moveTo(cx + d, cy); ctx.lineTo(cx - d, cy);
        ctx.moveTo(cx, cy + d); ctx.lineTo(cx, cy - d); ctx.stroke();
      });
      ctx.restore();
      [[cx + arm, cy], [cx - arm, cy], [cx, cy + arm], [cx, cy - arm]].forEach(([px2, py2]) => {
        ctx.beginPath();
        ctx.arc(px2, py2, 5, 0, Math.PI * 2);
        ctx.fillStyle = SIM.red;
        ctx.fill();
      });
      // eg orbitals lie along the axes (at the ligands) — high energy
      [-arm, arm].forEach((d) => {
        label(ctx, "e_g", cx + d + (d > 0 ? 8 : -8), cy - 4, SIM.red, 9, d > 0 ? "left" : "right");
      });
      // t2g lobes sit between the axes (avoid the ligands) — low energy
      const r = arm * 0.72;
      [45, 135, 225, 315].forEach((deg) => {
        const a = (deg * Math.PI) / 180;
        ctx.beginPath();
        ctx.ellipse(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 10, 6, a, 0, Math.PI * 2);
        ctx.strokeStyle = SIM.green;
        ctx.lineWidth = 1.4;
        ctx.stroke();
      });
      if (!narrow) {
        label(ctx, "e_g → at ligands (repelled ↑)", cx, h - 78, SIM.red, 9.5, "center");
        label(ctx, "t₂g → between ligands (shielded ↓)", cx, h - 62, SIM.green, 9.5, "center");
      }
    } else {
      const TET: [number, number, number][] = [
        [1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1],
      ];
      ctx.beginPath();
      ctx.arc(cx, cy, 7, 0, Math.PI * 2);
      ctx.fillStyle = SIM.text;
      ctx.fill();
      TET.forEach(([x, y, z]) => {
        const px2 = cx + x * arm * 0.75;
        const py2 = cy - y * arm * 0.6 + z * 4;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(px2, py2);
        ctx.strokeStyle = SIM.grid;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(px2, py2, 5, 0, Math.PI * 2);
        ctx.fillStyle = SIM.red;
        ctx.fill();
      });
      if (!narrow) {
        label(ctx, "4 ligands, none on the axes —", cx, h - 78, SIM.dim, 9.5, "center");
        label(ctx, "e orbitals escape better than t₂", cx, h - 62, SIM.dim, 9.5, "center");
      }
    }
  });

  return (
    <SimFrame
      title="Crystal-field splitting lab"
      about="Ligand strength sets Δ; Δ vs the pairing energy P decides high or low spin, the CFSE and the magnetic moment."
      height={380}
      canvas={<canvas ref={canvasRef} />}
      controls={
        <SimControls>
          <SimToggleGroup
            label="Geometry"
            value={geo}
            options={[
              { value: "oct", label: "Octahedral" },
              { value: "tet", label: "Tetrahedral" },
            ]}
            onChange={pickGeo}
          />
          <SimToggleGroup label="Ligand (spectrochemical series)" value={ligand} options={LIGANDS} onChange={pickLigand} />
          <LabeledSlider label="d-electron count" value={dCount} min={0} max={10} step={1} decimals={0} onChange={setDCount} color="#D27E99" />
          {isOct && (
            <SimToggleGroup
              label="Spin state"
              value={spin}
              options={[
                { value: "high", label: "High spin" },
                { value: "low", label: "Low spin" },
              ]}
              onChange={setSpin}
            />
          )}
        </SimControls>
      }
      readouts={
        <>
          <Readout label="CFSE" value={`${cfse} (${(cfseUnits * delta).toLocaleString("en-IN", { maximumFractionDigits: 0 })} cm⁻¹)`} color={SIM.green} />
          <Readout label="Unpaired electrons" value={`${unpaired}`} color={SIM.amber} />
          <Readout label="Spin-only moment μ" value={`${mu.toFixed(2)} BM`} color={SIM.sky} />
          <Readout label="Field" value={isOct ? (strong ? "Strong (Δo > P)" : "Weak (Δo < P)") : "Always weak (Δt = 4/9 Δo)"} color={strong && isOct ? SIM.green : SIM.dim} />
          <Readout label="Typical ions" value={IONS[dCount]} />
        </>
      }
    />
  );
}

export default CFTSplittingSim;
