"use client";

import { useRef, useState } from "react";
import SimFrame from "@/components/concepts/SimFrame";
import { LabeledSlider, Readout, SimControls, SimToggleGroup, ResetButton } from "@/components/concepts/controls";
import { useCanvas, SIM, clearPanel, label, circle } from "@/components/concepts/useCanvas";

const COLS = 12;
const ROWS = 8;
const N0 = COLS * ROWS;

type Mode = "single" | "chain";
type Pt = { t: number; a: number; b: number; s: number };

/** Radioactive decay: stochastic nuclei; in chain mode a radioactive daughter grows, peaks and dies (Bateman). */
export default function DecaySim() {
  const [mode, setMode] = useState<Mode>("single");
  const [halfLife, setHalfLife] = useState(5);
  const [ratio, setRatio] = useState(3); // λ_B / λ_A

  const lamA = Math.LN2 / halfLife;
  const lamB = ratio * lamA;
  const tStar = lamB !== lamA ? Math.log(lamB / lamA) / (lamB - lamA) : 1 / lamA; // daughter peak time
  const bPeak = N0 * ((lamA / (lamB - lamA)) * (Math.exp(-lamA * tStar) - Math.exp(-lamB * tStar))); // Bateman at t*
  const tMax = Math.min(90, 5 * Math.max(halfLife, ratio >= 1 ? halfLife : halfLife / ratio));

  const state = useRef({ t: 0, cells: new Uint8Array(N0), pts: [] as Pt[], hold: 0 });
  const params = useRef({ mode, halfLife, ratio });
  const reinit = () => {
    state.current = { t: 0, cells: new Uint8Array(N0), pts: [], hold: 0 };
  };
  if (params.current.mode !== mode || params.current.halfLife !== halfLife || params.current.ratio !== ratio) {
    params.current = { mode, halfLife, ratio };
    reinit();
  }

  const canvasRef = useCanvas((ctx, w, h, _t, dt) => {
    const s = state.current;
    const counts = { a: 0, b: 0, s: 0 };
    for (let i = 0; i < N0; i++) {
      if (s.cells[i] === 0) counts.a++;
      else if (s.cells[i] === 1) counts.b++;
      else counts.s++;
    }

    const running = s.t < tMax && counts.a + (mode === "chain" ? counts.b : 0) > 2;
    if (running) {
      s.t += dt;
      const pA = 1 - Math.exp(-lamA * dt);
      const pB = mode === "chain" ? 1 - Math.exp(-lamB * dt) : 0;
      for (let i = 0; i < N0; i++) {
        if (s.cells[i] === 0 && Math.random() < pA) s.cells[i] = mode === "chain" ? 1 : 2;
        else if (s.cells[i] === 1 && Math.random() < pB) s.cells[i] = 2;
      }
      const c2 = { a: 0, b: 0, s: 0 };
      for (let i = 0; i < N0; i++) c2[s.cells[i] === 0 ? "a" : s.cells[i] === 1 ? "b" : "s"]++;
      s.pts.push({ t: s.t, ...c2 });
    } else {
      s.hold += dt;
      if (s.hold > 2.2) reinit();
    }

    clearPanel(ctx, w, h, false);

    // ── nuclei grid (left) ──
    const gx = 30, gy = 34;
    const cell = Math.min(22, (h - 70) / ROWS);
    for (let i = 0; i < N0; i++) {
      const x = gx + (i % COLS) * cell;
      const y = gy + Math.floor(i / COLS) * cell;
      const st = s.cells[i];
      if (st === 0) circle(ctx, x, y, cell * 0.28, SIM.green, true);
      else if (st === 1) circle(ctx, x, y, cell * 0.28, SIM.amber, true);
      else {
        ctx.save();
        ctx.strokeStyle = "rgba(228,104,118,0.5)";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(x, y, cell * 0.28, 0, Math.PI * 2);
        ctx.moveTo(x - 3, y - 3);
        ctx.lineTo(x + 3, y + 3);
        ctx.moveTo(x + 3, y - 3);
        ctx.lineTo(x - 3, y + 3);
        ctx.stroke();
        ctx.restore();
      }
    }
    label(
      ctx,
      mode === "single" ? "parent nuclei — each decays without memory" : "parent (green) → daughter (amber) → stable (✕)",
      gx, 18, SIM.dim, 9
    );
    label(ctx, `parent ${counts.a} · ${mode === "chain" ? `daughter ${counts.b} · ` : ""}stable ${counts.s}`, gx + COLS * cell, h - 26, SIM.text, 10, "right");

    // ── plot (right) ──
    const px0 = gx + COLS * cell + 30;
    const px1 = w - 30;
    const py0 = 34, py1 = h - 44;
    if (px1 - px0 > 90) {
      ctx.save();
      ctx.strokeStyle = SIM.axis;
      ctx.beginPath();
      ctx.moveTo(px0, py1);
      ctx.lineTo(px1, py1);
      ctx.moveTo(px0, py0);
      ctx.lineTo(px0, py1);
      ctx.stroke();
      ctx.strokeStyle = "rgba(161,161,170,0.14)";
      ctx.setLineDash([2, 4]);
      for (let n = 1; n <= 4; n++) {
        const y = py1 - Math.pow(2, -n) * (py1 - py0);
        ctx.beginPath();
        ctx.moveTo(px0, y);
        ctx.lineTo(px1, y);
        ctx.stroke();
        label(ctx, `N₀/${2 ** n}`, px0 - 2, y, SIM.dim, 8, "right");
      }
      ctx.restore();

      const xT = (tt: number) => px0 + (tt / tMax) * (px1 - px0);
      const yN = (n: number) => py1 - (n / N0) * (py1 - py0);
      const plot = (get: (p: Pt) => number, color: string, width: number) => {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.shadowColor = color;
        ctx.shadowBlur = width > 1.5 ? 5 : 0;
        ctx.beginPath();
        let started = false;
        s.pts.forEach((p) => {
          const x = xT(p.t), y = yN(get(p));
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else ctx.lineTo(x, y);
        });
        ctx.stroke();
        ctx.restore();
      };

      if (mode === "single") {
        // analytic guide + mean-life marker
        ctx.save();
        ctx.strokeStyle = "rgba(129,140,248,0.5)";
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        for (let i = 0; i <= 100; i++) {
          const tt = (i / 100) * Math.min(s.t + 1, tMax);
          const x = xT(tt), y = yN(N0 * Math.exp(-lamA * tt));
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        const tm = 1 / lamA;
        if (tm < tMax) {
          ctx.strokeStyle = "rgba(232,121,249,0.55)";
          ctx.beginPath();
          ctx.moveTo(xT(tm), py0);
          ctx.lineTo(xT(tm), py1);
          ctx.stroke();
          label(ctx, `τ_mean = 1/λ → 37%`, xT(tm) + 4, py0 + 8, SIM.fuchsia, 8);
        }
        ctx.restore();
        plot((p) => p.a, SIM.green, 2);
        label(ctx, "N(t) — dashed: N₀e^(−λt)", px1, py0 - 12, SIM.dim, 9, "right");
      } else {
        // Bateman guides for both populations
        ctx.save();
        ctx.setLineDash([3, 4]);
        ctx.strokeStyle = "rgba(52,211,153,0.45)";
        ctx.beginPath();
        for (let i = 0; i <= 100; i++) {
          const tt = (i / 100) * Math.min(s.t + 0.5, tMax);
          const x = xT(tt), y = yN(N0 * Math.exp(-lamA * tt));
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.strokeStyle = "rgba(251,191,36,0.45)";
        ctx.beginPath();
        for (let i = 0; i <= 100; i++) {
          const tt = (i / 100) * Math.min(s.t + 0.5, tMax);
          const nb = lamB !== lamA ? N0 * (lamA / (lamB - lamA)) * (Math.exp(-lamA * tt) - Math.exp(-lamB * tt)) : N0 * lamA * tt * Math.exp(-lamA * tt);
          const x = xT(tt), y = yN(nb);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        if (tStar < tMax) {
          ctx.strokeStyle = "rgba(251,191,36,0.6)";
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.moveTo(xT(tStar), py0);
          ctx.lineTo(xT(tStar), py1);
          ctx.stroke();
          label(ctx, `t* = ln(λ_B/λ_A)/(λ_B−λ_A)`, xT(tStar) + 4, py0 + 8, SIM.amber, 8);
        }
        ctx.restore();
        plot((p) => p.a, SIM.green, 2);
        plot((p) => p.b, SIM.amber, 2);
        plot((p) => p.s, "rgba(161,161,170,0.5)", 1.2);
        label(ctx, "parent (green) · daughter (amber) · stable (grey)", px1, py0 - 12, SIM.dim, 9, "right");
      }
      label(ctx, "t →", px1, py1 + 12, SIM.dim, 9, "right");
    }
  });

  return (
    <SimFrame
      title="Radioactive decay & decay chains"
      about="96 stochastic nuclei — or a parent feeding a radioactive daughter that grows, peaks at t*, then dies"
      height={320}
      canvas={<canvas ref={canvasRef} />}
      controls={
        <SimControls>
          <SimToggleGroup
            label="Scenario"
            value={mode}
            options={[
              { value: "single", label: "Single isotope" },
              { value: "chain", label: "Decay chain A→B→stable" },
            ]}
            onChange={(v) => setMode(v)}
          />
          <LabeledSlider label="Parent half-life T½A (s)" value={halfLife} min={1} max={12} step={0.5} decimals={1} onChange={setHalfLife} color="#98BB6C" />
          {mode === "chain" && (
            <LabeledSlider label="λ_B / λ_A" value={ratio} min={0.3} max={10} step={0.1} decimals={1} onChange={setRatio} color="#E6C384" />
          )}
          <ResetButton onClick={reinit} />
        </SimControls>
      }
      readouts={
        <>
          <Readout label="Parent λ_A" value={`${lamA.toFixed(3)} s⁻¹`} color="#98BB6C" />
          {mode === "chain" ? (
            <>
              <Readout label="Daughter λ_B" value={`${lamB.toFixed(3)} s⁻¹`} color="#E6C384" />
              <Readout label="Daughter peaks at t*" value={`${tStar.toFixed(1)} s · N ≈ ${bPeak.toFixed(0)}`} color="#D27E99" />
              <Readout label="λ_A ≪ λ_B limit" value="secular equilibrium" color="#7FB4CA" />
            </>
          ) : (
            <>
              <Readout label="Mean life τ = 1/λ" value={`${(1 / lamA).toFixed(1)} s = 1.44·T½`} color="#D27E99" />
              <Readout label="Activity A" value="λN — falls with N" color="#E6C384" />
              <Readout label="Rule" value="after n half-lives: N₀/2ⁿ" color="#7FB4CA" />
            </>
          )}
        </>
      }
    />
  );
}
