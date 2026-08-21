"use client";

import { useRef, useState } from "react";
import SimFrame from "@/components/concepts/SimFrame";
import { LabeledSlider, Readout, SimControls, SimToggleGroup, ResetButton } from "@/components/concepts/controls";
import { useCanvas, SIM, clearPanel, label } from "@/components/concepts/useCanvas";

const ORBITALS = [
  { n: 1, l: 0, m: 0, name: "1s" },
  { n: 2, l: 0, m: 0, name: "2s" },
  { n: 2, l: 1, m: -1, name: "2pₓ" },
  { n: 2, l: 1, m: 0, name: "2pᵧ" },
  { n: 2, l: 1, m: 1, name: "2p_z" },
  { n: 3, l: 0, m: 0, name: "3s" },
  { n: 3, l: 1, m: -1, name: "3pₓ" },
  { n: 3, l: 1, m: 0, name: "3pᵧ" },
  { n: 3, l: 1, m: 1, name: "3p_z" },
  { n: 3, l: 2, m: -2, name: "3d_xy" },
  { n: 3, l: 2, m: -1, name: "3d_yz" },
  { n: 3, l: 2, m: 0, name: "3d_z²" },
  { n: 3, l: 2, m: 1, name: "3d_xz" },
  { n: 3, l: 2, m: 2, name: "3d_x²-y²" },
];

export default function AtomicOrbitalSim() {
  const [orbitalIdx, setOrbitalIdx] = useState(0);
  const [slice, setSlice] = useState<"xy" | "xz" | "yz">("xy");
  const [showPhase, setShowPhase] = useState(true);
  const [resolution, setResolution] = useState(80);
  const state = useRef({ t: 0 });

  const orb = ORBITALS[orbitalIdx];
  const { n, l, m } = orb;

  const canvasRef = useCanvas((ctx, w, h, _t, dt) => {
    const s = state.current;
    s.t += dt;

    clearPanel(ctx, w, h);
    const pad = 30;
    const size = Math.min(w, h) - 2 * pad - 80;
    const cx = w / 2;
    const cy = h / 2 + 20;

    const a0 = size / (2 * n * n); // Bohr radius scaling
    const maxR = 2 * n * n * a0;

    const Ylm = (theta: number, phi: number) => {
      if (l === 0) return 1 / Math.sqrt(4 * Math.PI);
      if (l === 1) {
        if (m === 0) return Math.sqrt(3 / (4 * Math.PI)) * Math.cos(theta);
        if (m === 1) return Math.sqrt(3 / (4 * Math.PI)) * Math.sin(theta) * Math.cos(phi);
        if (m === -1) return Math.sqrt(3 / (4 * Math.PI)) * Math.sin(theta) * Math.sin(phi);
      }
      if (l === 2) {
        const pref = Math.sqrt(15 / (16 * Math.PI));
        if (m === 0) return pref * (3 * Math.cos(theta) ** 2 - 1) * 0.5;
        if (Math.abs(m) === 1) return pref * 3 * Math.sin(theta) * Math.cos(theta) * (m > 0 ? Math.cos(phi) : Math.sin(phi));
        if (Math.abs(m) === 2) return pref * 3 * Math.sin(theta) ** 2 * (m > 0 ? Math.cos(2 * phi) : Math.sin(2 * phi));
      }
      return 0;
    };

    const Rnl = (r: number) => {
      const rho = 2 * r / (n * a0);
      if (n === 1 && l === 0) return 2 * Math.exp(-rho / 2) / a0 ** 1.5;
      if (n === 2 && l === 0) return (1 / (2 * Math.sqrt(2))) * (2 - rho) * Math.exp(-rho / 2) / a0 ** 1.5;
      if (n === 2 && l === 1) return (1 / (2 * Math.sqrt(6))) * rho * Math.exp(-rho / 2) / a0 ** 1.5;
      if (n === 3 && l === 0) return (2 / (3 * Math.sqrt(3))) * (1 - 2 * rho / 3 + 2 * rho ** 2 / 27) * Math.exp(-rho / 2) / a0 ** 1.5;
      if (n === 3 && l === 1) return (8 / (27 * Math.sqrt(6))) * (1 - rho / 6) * rho * Math.exp(-rho / 2) / a0 ** 1.5;
      if (n === 3 && l === 2) return (4 / (81 * Math.sqrt(30))) * rho ** 2 * Math.exp(-rho / 2) / a0 ** 1.5;
      return Math.exp(-rho / 2);
    };

    const ax = slice;
    const view = Math.min(w, h) - 2 * pad - 60;
    const x0 = w / 2;
    const y0 = cy;
    const scl = view / (2 * maxR);

    ctx.save();
    ctx.strokeStyle = SIM.dim;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x0 - view / 2, y0);
    ctx.lineTo(x0 + view / 2, y0);
    ctx.moveTo(x0, y0 - view / 2);
    ctx.lineTo(x0, y0 + view / 2);
    ctx.stroke();
    ctx.restore();

    label(ctx, ax.toUpperCase(), x0 + view / 2 + 4, y0 - 4, SIM.dim, 9);

    // Render ψ² at `resolution` scale on an offscreen canvas, then draw it scaled to the panel
    const buf = document.createElement("canvas");
    buf.width = resolution;
    buf.height = resolution;
    const bctx = buf.getContext("2d");
    if (bctx) {
      const imgData = bctx.createImageData(resolution, resolution);
      const half = resolution / 2;
      for (let i = 0; i < resolution; i++) {
        for (let j = 0; j < resolution; j++) {
          let x: number, y: number, z: number;
          if (ax === "xy") { x = (i - half) / scl; y = (half - j) / scl; z = 0; }
          else if (ax === "xz") { x = (i - half) / scl; y = 0; z = (half - j) / scl; }
          else { x = 0; y = (i - half) / scl; z = (half - j) / scl; }

          const r = Math.sqrt(x * x + y * y + z * z);
          if (r < 0.1 || r > maxR) continue;

          const theta = Math.acos(Math.max(-1, Math.min(1, z / r)));
          const phi = Math.atan2(y, x);

          const ang = Ylm(theta, phi);
          const rad = Rnl(r);
          const psi = ang * rad;
          const prob = psi * psi * r * r;

          const idx = (j * resolution + i) * 4;
          const intensity = Math.min(255, prob * 1e6);
          if (showPhase && psi < 0) {
            imgData.data[idx] = intensity;
            imgData.data[idx + 1] = 0;
            imgData.data[idx + 2] = intensity / 2;
          } else {
            imgData.data[idx] = 0;
            imgData.data[idx + 1] = intensity;
            imgData.data[idx + 2] = intensity;
          }
          imgData.data[idx + 3] = intensity > 1 ? 220 : 0;
        }
      }
      bctx.putImageData(imgData, 0, 0);
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(buf, x0 - view / 2, y0 - view / 2, view, view);
      ctx.restore();
    }

    label(ctx, `${orb.name}  (n=${n}, l=${l}, m=${m})`, w / 2, pad - 4, SIM.bright, 14, "center");
    label(ctx, showPhase ? "red = negative phase, cyan = positive" : "amplitude only", w / 2, h - 12, SIM.dim, 9, "center");
    label(ctx, `l = ${l} → ${l === 0 ? "spherical" : l === 1 ? "dumbbell (p)" : "cloverleaf (d)"} shape`, w / 2, h - 28, SIM.text, 10, "center");
  });

  return (
    <SimFrame
      title="Atomic orbital visualiser"
      about="Probability density |ψ|² for hydrogen-like orbitals. Red = negative phase, cyan = positive."
      height={380}
      canvas={<canvas ref={canvasRef} />}
      controls={
        <SimControls>
          <SimToggleGroup
            label="Orbital"
            value={String(orbitalIdx)}
            options={ORBITALS.map((o, i) => ({ value: String(i), label: o.name }))}
            onChange={(v) => setOrbitalIdx(Number(v))}
          />
          <LabeledSlider label="Resolution" value={resolution} min={40} max={140} step={10} decimals={0} onChange={setResolution} color="#98BB6C" />
          <SimToggleGroup
            label="Slice"
            value={slice}
            options={["xy", "xz", "yz"].map((s) => ({ value: s, label: s.toUpperCase() }))}
            onChange={(v) => setSlice(v as "xy" | "xz" | "yz")}
          />
          <ResetButton onClick={() => { setOrbitalIdx(0); setSlice("xy"); setShowPhase(true); setResolution(80); }} />
        </SimControls>
      }
      readouts={
        <>
          <Readout label="Principal n" value={String(n)} color="#98BB6C" />
          <Readout label="Azimuthal l" value={String(l)} color="#E6C384" />
          <Readout label="Magnetic m" value={String(m)} color="#7FB4CA" />
          <Readout label="Nodes (radial)" value={String(n - l - 1)} color="#D27E99" />
          <Readout label="Nodes (angular)" value={String(l)} color="#E46876" />
        </>
      }
    />
  );
}