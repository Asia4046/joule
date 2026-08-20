"use client";

import { useRef, useState } from "react";
import SimFrame from "@/components/concepts/SimFrame";
import { LabeledSlider, Readout, SimControls, ResetButton } from "@/components/concepts/controls";
import { useCanvas, SIM, clearPanel, label, circle } from "@/components/concepts/useCanvas";

const V_SOUND = 343; // m/s in air
const SLOWMO = 240; // visual slow-motion factor
const V_PX = 120; // visual wave speed, px/s

/** Doppler effect: a source racing toward an observer, emitting circular wavefronts that pile up ahead. */
export default function DopplerSim() {
  const [f, setF] = useState(500);
  const [vs, setVs] = useState(120); // source toward observer
  const [vo, setVo] = useState(0); // observer toward source

  const fPrime = (f * (V_SOUND + vo)) / (V_SOUND - vs);
  const lambdaAhead = (V_SOUND - vs) / f;
  const lambdaBehind = (V_SOUND + vs) / f;

  const state = useRef({ srcX: 0.12, fronts: [] as { x: number; r: number }[], emit: 0 });
  const params = useRef({ f, vs });
  if (params.current.f !== f || params.current.vs !== vs) {
    params.current = { f, vs };
    state.current = { srcX: 0.12, fronts: [], emit: 0 };
  }

  const canvasRef = useCanvas((ctx, w, h, _t, dt) => {
    const s = state.current;
    const obsX = w - 46;
    const midY = h / 2;
    const srcPx = (V_PX * vs) / V_SOUND; // preserves vs/v ratio → same compression
    const T_vis = (1 / f) * SLOWMO;

    s.srcX += (srcPx * dt) / w;
    if (s.srcX * w > obsX - 20) {
      s.srcX = 0.12;
      s.fronts = [];
    }
    s.emit += dt;
    if (s.emit >= T_vis) {
      s.emit = 0;
      s.fronts.push({ x: s.srcX * w, r: 2 });
    }
    s.fronts.forEach((fr) => (fr.r += V_PX * dt));
    s.fronts = s.fronts.filter((fr) => fr.r < w * 1.1);

    clearPanel(ctx, w, h, false);
    // medium line
    ctx.save();
    ctx.strokeStyle = "rgba(148,163,184,0.15)";
    ctx.setLineDash([2, 6]);
    ctx.beginPath();
    ctx.moveTo(10, midY);
    ctx.lineTo(w - 10, midY);
    ctx.stroke();
    ctx.restore();

    // wavefronts
    s.fronts.forEach((fr, i) => {
      const alpha = Math.max(0.05, 0.55 - i * 0.02);
      ctx.save();
      ctx.strokeStyle = `rgba(56,189,248,${alpha})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(fr.x, midY, fr.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });

    // source
    const px = s.srcX * w;
    circle(ctx, px, midY, 7, SIM.red, true);
    label(ctx, "S", px, midY - 16, SIM.red, 11, "center");
    label(ctx, `${vs.toFixed(0)} m/s →`, px, midY + 20, SIM.dim, 8, "center");

    // observer (+ motion arrow when moving)
    circle(ctx, obsX, midY, 6, SIM.green, true);
    label(ctx, "O", obsX, midY - 16, SIM.green, 11, "center");
    if (vo > 0) label(ctx, `← ${vo.toFixed(0)} m/s`, obsX, midY + 20, SIM.dim, 8, "center");

    // wavelength annotations
    label(ctx, `λ ahead = ${lambdaAhead.toFixed(3)} m (compressed)`, 12, 18, SIM.sky, 9);
    label(ctx, `λ behind = ${lambdaBehind.toFixed(3)} m (stretched)`, 12, 32, SIM.dim, 9);

    if (vs > 0) {
      label(
        ctx,
        vs >= V_SOUND ? "vs ≥ v — shock wave (not in JEE syllabus, but now you see why)" : "wavefronts bunch up ahead of the source → higher pitch heard by O",
        w / 2, h - 12, SIM.dim, 9, "center"
      );
    }
  });

  return (
    <SimFrame
      title="Doppler effect"
      about="Rings leave the source where it was emitted — that memory of position is the whole doppler shift"
      height={310}
      canvas={<canvas ref={canvasRef} />}
      controls={
        <SimControls>
          <LabeledSlider label="Source freq f (Hz)" value={f} min={300} max={900} step={10} decimals={0} onChange={setF} />
          <LabeledSlider label="Source speed vs (m/s)" value={vs} min={0} max={300} step={5} decimals={0} onChange={setVs} color="#f87171" />
          <LabeledSlider label="Observer speed vo (m/s)" value={vo} min={0} max={100} step={5} decimals={0} onChange={setVo} color="#34d399" />
          <ResetButton onClick={() => { state.current = { srcX: 0.12, fronts: [], emit: 0 }; }} />
        </SimControls>
      }
      readouts={
        <>
          <Readout label="Apparent f′" value={`${fPrime.toFixed(0)} Hz`} color="#34d399" />
          <Readout label="f′ formula" value="f·(v+vo)/(v−vs)" />
          <Readout label="λ ahead" value={`${lambdaAhead.toFixed(3)} m`} color="#38bdf8" />
          <Readout label="λ behind" value={`${lambdaBehind.toFixed(3)} m`} color="#e879f9" />
        </>
      }
    />
  );
}
