"use client";

import { useRef, useState } from "react";
import SimFrame from "@/components/concepts/SimFrame";
import { LabeledSlider, Readout, SimControls, SimToggleGroup, ResetButton } from "@/components/concepts/controls";
import { useCanvas, SIM, clearPanel, label, circle } from "@/components/concepts/useCanvas";

/** Piston compresses a gas isothermally or adiabatically; PV curve + work/heat/ΔU accumulate. */
export default function PistonSim() {
  const [mode, setMode] = useState<"iso" | "adiabatic">("adiabatic");
  const [gamma, setGamma] = useState(1.67);
  const [targetV, setTargetV] = useState(0.5); // fraction of initial volume
  const state = useRef({ V: 1, P: 1, W: 0, Q: 0, path: [] as { V: number; P: number }[], done: false });

  const params = useRef({ mode, gamma, targetV });
  if (params.current.mode !== mode || params.current.gamma !== gamma || params.current.targetV !== targetV) {
    params.current = { mode, gamma, targetV };
    state.current = { V: 1, P: 1, W: 0, Q: 0, path: [{ V: 1, P: 1 }], done: false };
  }

  const Cv = 1 / (gamma - 1);
  const nRT = 1; // PV at start (isotherm anchor)

  const canvasRef = useCanvas((ctx, w, h, _t, dt) => {
    const s = state.current;
    // integrate compression
    const speed = 0.35;
    if (s.V > targetV + 0.005) {
      const dV = -speed * dt;
      const P0 = s.P;
      const V0 = s.V;
      const P1 =
        mode === "adiabatic"
          ? s.P * Math.pow(s.V / (s.V + dV), gamma)
          : nRT / (s.V + dV);
      const Pavg = (P0 + P1) / 2;
      s.W += -Pavg * dV; // work BY gas (negative when compressed)
      s.V += dV;
      s.P = P1;
      s.path.push({ V: s.V, P: s.P });
    } else if (!s.done) {
      // finalize bookkeeping
      if (mode === "adiabatic") {
        s.Q = 0;
      } else {
        s.Q = s.W; // ΔU = 0 for isothermal
      }
      s.done = true;
    }

    // temperature from state (U = nCvT, PV = nRT)
    const T = s.P * s.V;

    clearPanel(ctx, w, h);
    const pad = 26;

    // cylinder (left)
    const cyW = w * 0.3;
    const cyX = pad + 20;
    const cyY0 = pad + 6;
    const cyY1 = h - pad;
    const vMin = 0.25, vMax = 1.15;
    const gasTop = cyY0 + 30 + (1 - (s.V - vMin) / (vMax - vMin)) * (cyY1 - cyY0 - 60);
    // walls
    ctx.save();
    ctx.strokeStyle = SIM.axis;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cyX, cyY0);
    ctx.lineTo(cyX, cyY1);
    ctx.moveTo(cyX + cyW, cyY0);
    ctx.lineTo(cyX + cyW, cyY1);
    ctx.moveTo(cyX, cyY1);
    ctx.lineTo(cyX + cyW, cyY1);
    ctx.stroke();
    ctx.restore();
    // gas
    const heat = Math.min(1, (T - 0.6) / 1.4);
    ctx.save();
    ctx.fillStyle = `rgba(${Math.round(120 + 135 * heat)}, ${Math.round(120 - 60 * heat)}, ${Math.round(200 - 120 * heat)}, 0.35)`;
    ctx.fillRect(cyX + 2, gasTop, cyW - 4, cyY1 - gasTop - 3);
    ctx.restore();
    // molecules
    for (let i = 0; i < 14; i++) {
      const mx = cyX + 12 + ((i * 37) % (cyW - 24));
      const my = gasTop + 12 + ((i * 53) % Math.max(12, cyY1 - gasTop - 16));
      circle(ctx, mx, my, 2 + heat, SIM.sky);
    }
    // piston
    ctx.save();
    ctx.fillStyle = SIM.text;
    ctx.fillRect(cyX + 2, gasTop - 10, cyW - 4, 10);
    ctx.restore();
    // force arrow
    const fA = ctx.createLinearGradient(0, 0, 0, 1);
    void fA;
    label(ctx, "F ↓ (push)", cyX + cyW / 2, gasTop - 24, SIM.bright, 11, "center");
    label(ctx, `V = ${s.V.toFixed(2)}`, cyX + cyW / 2, cyY1 - 14, SIM.bright, 11, "center");
    label(ctx, `T ∝ ${T.toFixed(2)}`, cyX + cyW / 2, cyY1 - 28, heat > 0.5 ? SIM.red : SIM.sky, 10, "center");

    // PV plot (right)
    const px0 = w * 0.4 + 16;
    const px1 = w - pad;
    const py0 = pad + 16;
    const py1 = h - pad - 16;
    const P_MAX = 4.5;
    ctx.save();
    ctx.strokeStyle = SIM.axis;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px0, py1);
    ctx.lineTo(px1, py1);
    ctx.moveTo(px0, py0);
    ctx.lineTo(px0, py1);
    ctx.stroke();
    ctx.restore();
    label(ctx, "P", px0 - 10, py0 + 4, SIM.dim, 10);
    label(ctx, "V →", px1 - 6, py1 + 10, SIM.dim, 10);

    const vx = (V: number) => px0 + ((V - vMin) / (vMax - vMin)) * (px1 - px0);
    const py = (P: number) => py1 - (Math.min(P, P_MAX) / P_MAX) * (py1 - py0);

    // reference isotherm
    ctx.save();
    ctx.strokeStyle = "rgba(52,211,153,0.4)";
    ctx.setLineDash([4, 5]);
    ctx.beginPath();
    for (let i = 0; i <= 60; i++) {
      const V = vMin + ((vMax - vMin) * i) / 60;
      ctx.lineTo(vx(V), py(nRT / V));
    }
    ctx.stroke();
    ctx.restore();
    label(ctx, "isotherm PV=1", vx(vMax) - 4, py(nRT / vMax) - 10, "rgba(52,211,153,0.8)", 9, "right");

    // traced path + filled work area
    ctx.save();
    ctx.beginPath();
    s.path.forEach((p, i) => (i === 0 ? ctx.moveTo(vx(p.V), py(p.P)) : ctx.lineTo(vx(p.V), py(p.P))));
    ctx.strokeStyle = mode === "adiabatic" ? SIM.red : SIM.green;
    ctx.lineWidth = 2.2;
    ctx.shadowColor = mode === "adiabatic" ? SIM.red : SIM.green;
    ctx.shadowBlur = 6;
    ctx.stroke();
    // area under curve back to start
    ctx.lineTo(vx(s.path[s.path.length - 1]?.V ?? 1), py1);
    ctx.lineTo(vx(1), py1);
    ctx.closePath();
    ctx.fillStyle = mode === "adiabatic" ? "rgba(228,104,118,0.12)" : "rgba(52,211,153,0.12)";
    ctx.fill();
    ctx.restore();

    label(ctx, mode === "adiabatic" ? `PV^γ (γ = ${gamma.toFixed(2)})` : "isothermal", px0 + 8, py0 + 10, mode === "adiabatic" ? SIM.red : SIM.green, 10);
  });

  const T2 = Math.pow(targetV, 1 - gamma); // TV^(γ−1) = const → T rises on compression
  return (
    <SimFrame
      title="Piston & PV diagram"
      about="Compress from V to target: work is the live-swept area under the PV curve"
      height={330}
      canvas={<canvas ref={canvasRef} />}
      controls={
        <SimControls>
          <LabeledSlider label="Final volume (× V₀)" value={targetV} min={0.3} max={0.95} step={0.01} onChange={setTargetV} />
          {mode === "adiabatic" && (
            <LabeledSlider label="γ = Cp/Cv" value={gamma} min={1.3} max={1.7} step={0.01} onChange={setGamma} color="#E46876" />
          )}
          <SimToggleGroup
            label="Process"
            value={mode}
            options={[
              { value: "iso", label: "Isothermal" },
              { value: "adiabatic", label: "Adiabatic" },
            ]}
            onChange={(v) => setMode(v)}
          />
          <ResetButton onClick={() => { state.current = { V: 1, P: 1, W: 0, Q: 0, path: [{ V: 1, P: 1 }], done: false }; }} />
        </SimControls>
      }
      readouts={
        <>
          <Readout label="Work done on gas" value={`${Math.max(0, state.current.W).toFixed(2)} J`} color="#E6C384" />
          <Readout label="ΔU = nCvΔT" value={`${(Cv * (T2 - 1)).toFixed(2)} J`} color={mode === "adiabatic" ? "#E46876" : "#7FB4CA"} />
          <Readout label="Heat Q" value={mode === "adiabatic" ? "0 (fast/insulated)" : `${Math.max(0, state.current.W).toFixed(2)} J rejected`} />
        </>
      }
    />
  );
}
