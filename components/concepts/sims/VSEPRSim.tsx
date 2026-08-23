"use client";

import { useRef, useState } from "react";
import SimFrame from "@/components/concepts/SimFrame";
import { Readout, SimControls, SimToggleGroup } from "@/components/concepts/controls";
import { useCanvas, SIM, clearPanel, label } from "@/components/concepts/useCanvas";

type Vec3 = [number, number, number];

/** Unit direction sets for each idealised electron geometry. */
const TETRA: Vec3[] = [
  [1, 1, 1],
  [-1, -1, 1],
  [-1, 1, -1],
  [1, -1, -1],
].map(([x, y, z]) => [x / Math.sqrt(3), y / Math.sqrt(3), z / Math.sqrt(3)] as Vec3);
const TBP_EQ: Vec3[] = [
  [1, 0, 0],
  [-0.5, 0, 0.866],
  [-0.5, 0, -0.866],
];
const OCTA: Vec3[] = [
  [0, 1, 0],
  [0, -1, 0],
  [1, 0, 0],
  [-1, 0, 0],
  [0, 0, 1],
  [0, 0, -1],
];

type Species = {
  formula: string;
  central: string;
  attached: string;
  bonds: Vec3[];
  lonePairs: Vec3[];
  vsepr: string;
  eGeom: string;
  mGeom: string;
  hyb: string;
  angle: string;
  dipole: string;
  note: string;
  /** Angle arc between bonds[i] and bonds[j] drawn on the canvas (projected). */
  arc?: { i: number; j: number; text: string };
};

const SPECIES: Species[] = [
  {
    formula: "BeF₂", central: "Be", attached: "F",
    bonds: [[0, 1, 0], [0, -1, 0]], lonePairs: [],
    vsepr: "AX₂", eGeom: "Linear", mGeom: "Linear", hyb: "sp", angle: "180°",
    dipole: "0 (symmetric)", note: "Incomplete octet on Be — only 2 bond pairs, no lone pairs to bend anything.",
    arc: { i: 0, j: 1, text: "180°" },
  },
  {
    formula: "BF₃", central: "B", attached: "F",
    bonds: [[0, 1, 0], [0.866, -0.5, 0], [-0.866, -0.5, 0]], lonePairs: [],
    vsepr: "AX₃", eGeom: "Trigonal planar", mGeom: "Trigonal planar", hyb: "sp²", angle: "120°",
    dipole: "0 (symmetric)", note: "Back-bonding from F to the empty p orbital on B shortens the B–F bonds.",
    arc: { i: 1, j: 2, text: "120°" },
  },
  {
    formula: "CH₄", central: "C", attached: "H",
    bonds: TETRA, lonePairs: [],
    vsepr: "AX₄", eGeom: "Tetrahedral", mGeom: "Tetrahedral", hyb: "sp³", angle: "109.5°",
    dipole: "0 (symmetric)", note: "The reference geometry: every lone-pair shape below is a tetrahedron with corners removed.",
    arc: { i: 0, j: 1, text: "109.5°" },
  },
  {
    formula: "NH₃", central: "N", attached: "H",
    bonds: [TETRA[0], TETRA[1], TETRA[2]], lonePairs: [TETRA[3]],
    vsepr: "AX₃E", eGeom: "Tetrahedral", mGeom: "Trigonal pyramidal", hyb: "sp³", angle: "107°",
    dipole: "≠ 0", note: "The lone pair hugs the nucleus tighter than bond pairs, squeezing H–N–H below 109.5°.",
    arc: { i: 0, j: 1, text: "107°" },
  },
  {
    formula: "H₂O", central: "O", attached: "H",
    bonds: [TETRA[0], TETRA[1]], lonePairs: [TETRA[2], TETRA[3]],
    vsepr: "AX₂E₂", eGeom: "Tetrahedral", mGeom: "Bent (V-shape)", hyb: "sp³", angle: "104.5°",
    dipole: "≠ 0", note: "Two lone pairs compress the angle further — lp–lp repulsion is the strongest of all.",
    arc: { i: 0, j: 1, text: "104.5°" },
  },
  {
    formula: "PF₅", central: "P", attached: "F",
    bonds: [[0, 1, 0], [0, -1, 0], ...TBP_EQ], lonePairs: [],
    vsepr: "AX₅", eGeom: "Trigonal bipyramidal", mGeom: "Trigonal bipyramidal", hyb: "sp³d", angle: "120° eq · 90° ax–eq",
    dipole: "0 (symmetric)", note: "The two axial bonds are longer and weaker than the three equatorial ones.",
    arc: { i: 0, j: 2, text: "90°" },
  },
  {
    formula: "SF₄", central: "S", attached: "F",
    bonds: [[0, 1, 0], [0, -1, 0], TBP_EQ[0], TBP_EQ[1]], lonePairs: [TBP_EQ[2]],
    vsepr: "AX₄E", eGeom: "Trigonal bipyramidal", mGeom: "See-saw", hyb: "sp³d", angle: "≈102° eq · <90° ax",
    dipole: "≠ 0", note: "The lone pair takes an equatorial slot (only 2 neighbours at 90° there instead of 3).",
  },
  {
    formula: "ClF₃", central: "Cl", attached: "F",
    bonds: [[0, 1, 0], [0, -1, 0], TBP_EQ[0]], lonePairs: [TBP_EQ[1], TBP_EQ[2]],
    vsepr: "AX₃E₂", eGeom: "Trigonal bipyramidal", mGeom: "T-shaped", hyb: "sp³d", angle: "< 90°",
    dipole: "≠ 0", note: "Both lone pairs equatorial → the three bonds form a T. Famously fits nothing else.",
  },
  {
    formula: "XeF₄", central: "Xe", attached: "F",
    bonds: [OCTA[2], OCTA[3], OCTA[4], OCTA[5]], lonePairs: [OCTA[0], OCTA[1]],
    vsepr: "AX₄E₂", eGeom: "Octahedral", mGeom: "Square planar", hyb: "sp³d²", angle: "90°",
    dipole: "0 (symmetric)", note: "The lone pairs sit trans (180° apart) — placing them cis would cost much more repulsion.",
    arc: { i: 0, j: 2, text: "90°" },
  },
  {
    formula: "SF₆", central: "S", attached: "F",
    bonds: OCTA, lonePairs: [],
    vsepr: "AX₆", eGeom: "Octahedral", mGeom: "Octahedral", hyb: "sp³d²", angle: "90°",
    dipole: "0 (symmetric)", note: "Expanded octet — 12 electrons around S. All six positions equivalent.",
    arc: { i: 0, j: 2, text: "90°" },
  },
];

const ATOM_COLORS: Record<string, string> = {
  Be: SIM.sky, B: SIM.sky, C: SIM.text, N: SIM.indigo, O: SIM.red,
  P: SIM.amber, S: SIM.amber, Cl: SIM.green, F: SIM.green, Xe: SIM.fuchsia, H: SIM.text,
};

function VSEPRSim() {
  const [key, setKey] = useState("CH₄");
  const sp = SPECIES.find((s) => s.formula === key) ?? SPECIES[2];

  // rotation state lives in refs so dragging never re-renders the tree
  const yawRef = useRef(0.7);
  const pitchRef = useRef(0.42);
  const dragRef = useRef<{ x: number; y: number } | null>(null);

  const canvasRef = useCanvas((ctx, w, h, _t, dt) => {
    clearPanel(ctx, w, h, false);
    if (!dragRef.current) yawRef.current += dt * 0.35;

    // yaw (drag x) spins around the vertical axis, pitch (drag y) tilts it —
    // a proper orthonormal rotation, so bond lengths stay true in perspective
    const cyaw = Math.cos(yawRef.current);
    const syaw = Math.sin(yawRef.current);
    const cosP = Math.cos(pitchRef.current);
    const sinP = Math.sin(pitchRef.current);
    const F = 3.4; // perspective distance (unit-sphere coordinates)

    const project = (v: Vec3) => {
      const x1 = v[0] * cyaw + v[2] * syaw;
      const z1 = -v[0] * syaw + v[2] * cyaw;
      const y2 = v[1] * cosP - z1 * sinP;
      const z2 = v[1] * sinP + z1 * cosP;
      return { x: x1, y: y2, z: z2, s: F / (F - z2) };
    };

    const cx = w * 0.5;
    const cyc = h * 0.53;
    const L = Math.min(w, h) * 0.3; // bond length in px

    type Item = { z: number; draw: () => void };
    const items: Item[] = [];
    const depth = (z: number) => 0.55 + 0.45 * (z + 1) / 2; // far → near alpha

    const center = project([0, 0, 0]);
    const centerXY = { x: cx + center.x * center.s * L, y: cyc - center.y * center.s * L };

    // central atom
    items.push({
      z: 0,
      draw: () => {
        ctx.save();
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(centerXY.x, centerXY.y, 19, 0, Math.PI * 2);
        ctx.fillStyle = ATOM_COLORS[sp.central] ?? SIM.bright;
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 14;
        ctx.fill();
        ctx.restore();
        label(ctx, sp.central, centerXY.x, centerXY.y, SIM.panel, 13, "center");
      },
    });

    sp.bonds.forEach((v) => {
      const p = project(v);
      const ax = cx + p.x * p.s * L;
      const ay = cyc - p.y * p.s * L;
      const a = depth(p.z);
      items.push({
        z: p.z - 0.01,
        draw: () => {
          ctx.save();
          ctx.globalAlpha = a;
          ctx.strokeStyle = SIM.text;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(centerXY.x, centerXY.y);
          ctx.lineTo(ax, ay);
          ctx.stroke();
          ctx.restore();
        },
      });
      items.push({
        z: p.z,
        draw: () => {
          ctx.save();
          ctx.globalAlpha = a;
          ctx.beginPath();
          ctx.arc(ax, ay, 13 * p.s, 0, Math.PI * 2);
          ctx.fillStyle = ATOM_COLORS[sp.attached] ?? SIM.bright;
          ctx.fill();
          ctx.restore();
          label(ctx, sp.attached, ax, ay, SIM.panel, 11, "center");
        },
      });
    });

    sp.lonePairs.forEach((v) => {
      const p = project(v);
      const lx = cx + p.x * p.s * L * 0.62;
      const ly = cyc - p.y * p.s * L * 0.62;
      items.push({
        z: p.z,
        draw: () => {
          ctx.save();
          ctx.globalAlpha = 0.9 * depth(p.z);
          ctx.setLineDash([3, 3]);
          ctx.strokeStyle = SIM.dim;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.ellipse(lx, ly, 13 * p.s, 10 * p.s, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = SIM.bright;
          ctx.beginPath();
          ctx.arc(lx - 3, ly, 1.6, 0, Math.PI * 2);
          ctx.arc(lx + 3, ly, 1.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        },
      });
    });

    items.sort((a, b) => a.z - b.z); // painter's algorithm: far first
    items.forEach((it) => it.draw());

    // angle arc between two chosen bonds — angles measured from the projected
    // bond directions relative to the central atom, taking the short way round
    if (sp.arc) {
      const { i, j, text } = sp.arc;
      const pi = project(sp.bonds[i]);
      const pj = project(sp.bonds[j]);
      const ang = (p: { x: number; y: number; s: number }) => Math.atan2(p.y * p.s * L, p.x * p.s * L);
      const a0 = ang(pi);
      let d = ang(pj) - a0;
      while (d > Math.PI) d -= 2 * Math.PI;
      while (d < -Math.PI) d += 2 * Math.PI;
      const r = 46;
      ctx.save();
      ctx.strokeStyle = SIM.amber;
      ctx.lineWidth = 1.4;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.arc(centerXY.x, centerXY.y, r, -a0, -(a0 + d), d < 0);
      ctx.stroke();
      ctx.setLineDash([]);
      const mid = a0 + d / 2;
      label(ctx, text, centerXY.x + Math.cos(mid) * (r + 18), centerXY.y - Math.sin(mid) * (r + 18), SIM.amber, 11, "center");
      ctx.restore();
    }

    label(ctx, sp.formula, 18, 22, SIM.bright, 15);
    label(ctx, `${sp.vsepr} · ${sp.mGeom}`, 18, 42, SIM.dim, 10);
    label(ctx, "drag to rotate · dashed lobes = lone pairs", w - 16, 22, SIM.dim, 9, "right");
    label(ctx, sp.note, w / 2, h - 14, SIM.dim, 9.5, "center");
  });

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    dragRef.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const d = dragRef.current;
    if (!d) return;
    yawRef.current += (e.clientX - d.x) * 0.01;
    pitchRef.current = Math.max(-1.2, Math.min(1.2, pitchRef.current + (e.clientY - d.y) * 0.01));
    dragRef.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };

  return (
    <SimFrame
      title="VSEPR geometry workbench"
      about="Steric number → electron geometry → molecular shape. Drag the model to see it in 3D."
      height={360}
      canvas={
        <canvas
          ref={canvasRef}
          style={{ touchAction: "none", cursor: "grab" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        />
      }
      controls={
        <SimControls>
          <SimToggleGroup
            label="Steric number 2–4"
            value={key}
            options={SPECIES.slice(0, 5).map((s) => ({ value: s.formula, label: s.formula }))}
            onChange={setKey}
          />
          <SimToggleGroup
            label="Steric number 5–6"
            value={key}
            options={SPECIES.slice(5).map((s) => ({ value: s.formula, label: s.formula }))}
            onChange={setKey}
          />
        </SimControls>
      }
      readouts={
        <>
          <Readout label="Shape" value={`${sp.mGeom} (${sp.vsepr})`} color={SIM.indigo} />
          <Readout label="Electron geometry" value={sp.eGeom} />
          <Readout label="Hybridisation" value={sp.hyb} color={SIM.green} />
          <Readout label="Bond angle(s)" value={sp.angle} color={SIM.amber} />
          <Readout label="Dipole" value={sp.dipole} color={sp.dipole === "0 (symmetric)" ? SIM.dim : SIM.red} />
        </>
      }
    />
  );
}

export default VSEPRSim;
