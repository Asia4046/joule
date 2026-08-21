"use client";

import { useRef, useState } from "react";
import SimFrame from "@/components/concepts/SimFrame";
import { LabeledSlider, Readout, SimControls, SimToggleGroup, ResetButton } from "@/components/concepts/controls";
import { useCanvas, SIM, clearPanel, label, circle } from "@/components/concepts/useCanvas";

const V_SOUND = 343; // m/s in air
const SLOWMO = 240; // visual slow-motion factor
const V_PX = 120; // visual wave speed, px/s

type Mode = "passby" | "circle" | "echo";
type Front = { x: number; y: number; r: number; kind: 0 | 1 }; // 0 incident, 1 reflected

/** Three Doppler archetypes: pass-by step, circling source (JEE 2016-style), and the two-shift moving-wall echo. */
export default function DopplerSim() {
  const [mode, setMode] = useState<Mode>("passby");
  const [f, setF] = useState(500);
  const [vs, setVs] = useState(120); // source speed (toward observer / orbital)
  const [vw, setVw] = useState(40); // wall speed toward source (echo mode)

  // pass-by
  const fApp = (f * V_SOUND) / (V_SOUND - vs);
  const fRec = (f * V_SOUND) / (V_SOUND + vs);
  // echo: wall receives f₁, re-emits; source hears f₂ — two shifts in sequence
  const fWall = (f * (V_SOUND + vw)) / V_SOUND;
  const fEcho = (f * (V_SOUND + vw)) / (V_SOUND - vw);
  // circle geometry: observer at 1.6R from centre on +x; radial speed varies around the lap
  const radial = (th: number) => (-1.6 * vs * Math.sin(th)) / Math.sqrt(3.56 - 3.2 * Math.cos(th));
  const fCircle = (th: number) => (f * V_SOUND) / (V_SOUND - radial(th));

  const state = useRef({ t: 0, srcX: 0.06, theta: Math.PI, fronts: [] as Front[], emit: 0, emitW: 0, hist: [] as { t: number; fp: number }[] });
  const params = useRef({ mode, f, vs, vw });
  const reinit = () => {
    state.current = { t: 0, srcX: 0.06, theta: Math.PI, fronts: [], emit: 0, emitW: 0, hist: [] };
  };
  if (params.current.mode !== mode || params.current.f !== f || params.current.vs !== vs || params.current.vw !== vw) {
    params.current = { mode, f, vs, vw };
    reinit();
  }

  const canvasRef = useCanvas((ctx, w, h, _t, dt) => {
    const s = state.current;
    const arenaH = h - 92;
    const midY = arenaH / 2 + 6;
    const T_vis = (1 / f) * SLOWMO;
    s.t += dt;
    s.emit += dt;
    s.emitW += dt;

    // geometry per mode
    let fp = f; // frequency heard now (for the chart)
    let srcPx = 0, srcPy = 0;
    let obsX = w - 60, obsY = midY;
    const Rpx = Math.min(80, arenaH / 2 - 24);
    const cCx = w / 2 - 50, cCy = midY;

    if (mode === "passby") {
      srcPx = (V_PX * vs) / V_SOUND; // preserves vs/v ratio
      s.srcX += (srcPx * dt) / w;
      if (s.srcX > 1.08) reinit();
      srcPx = s.srcX * w;
      srcPy = midY;
      obsY = midY;
      fp = s.srcX * w < obsX ? fApp : fRec;
      if (s.emit >= T_vis) {
        s.emit = 0;
        s.fronts.push({ x: srcPx, y: srcPy, r: 2, kind: 0 });
      }
    } else if (mode === "circle") {
      const omega = ((V_PX * vs) / V_SOUND) / Rpx;
      s.theta += omega * dt;
      if (s.theta > Math.PI * 4) reinit();
      srcPx = cCx + Rpx * Math.cos(s.theta);
      srcPy = cCy + Rpx * Math.sin(s.theta);
      obsX = cCx + 1.6 * Rpx;
      obsY = cCy;
      fp = fCircle(s.theta);
      if (s.emit >= T_vis) {
        s.emit = 0;
        s.fronts.push({ x: srcPx, y: srcPy, r: 2, kind: 0 });
      }
    } else {
      // echo: stationary source (left), wall approaching (right)
      srcPx = 60;
      srcPy = midY;
      const wallPx = (V_PX * vw) / V_SOUND;
      const wallX = w - 70 - (wallPx * s.t) % Math.max(w - 220, 60);
      obsX = wallX; // "observer" is the wall itself
      obsY = midY;
      fp = fEcho;
      if (s.emit >= T_vis) {
        s.emit = 0;
        s.fronts.push({ x: srcPx, y: srcPy, r: 2, kind: 0 });
      }
      // incident fronts reflect at the wall: reborn there as a new (amber) wavefront
      s.fronts.forEach((fr) => {
        if (fr.kind === 0 && fr.x + fr.r >= wallX) {
          fr.kind = 1;
          fr.x = wallX;
          fr.r = 2;
        }
      });
      if (wallX - srcPx < 90) reinit();
    }

    s.fronts.forEach((fr) => (fr.r += V_PX * dt));
    s.fronts = s.fronts.filter((fr) => fr.r < w * 1.15);
    s.hist.push({ t: s.t, fp });
    if (s.hist.length > 900) s.hist.shift();

    // ── arena ──
    clearPanel(ctx, w, h, false);
    ctx.save();
    ctx.strokeStyle = "rgba(161,161,170,0.12)";
    ctx.setLineDash([2, 6]);
    ctx.beginPath();
    ctx.moveTo(10, midY);
    ctx.lineTo(w - 10, midY);
    ctx.stroke();
    ctx.restore();

    s.fronts.forEach((fr, i) => {
      const alpha = Math.max(0.05, 0.55 - i * 0.02);
      ctx.save();
      ctx.strokeStyle = fr.kind === 0 ? `rgba(56,189,248,${alpha})` : `rgba(251,191,36,${alpha})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(fr.x, fr.y, fr.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });

    if (mode === "circle") {
      ctx.save();
      ctx.strokeStyle = "rgba(161,161,170,0.25)";
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.arc(cCx, cCy, Rpx, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      label(ctx, "source orbits — f′ varies smoothly, = f twice per lap", w / 2, 14, SIM.dim, 9, "center");
    }

    // source & observer
    circle(ctx, srcPx, srcPy, 7, SIM.red, true);
    label(ctx, "S", srcPx, srcPy - 16, SIM.red, 11, "center");
    circle(ctx, obsX, obsY, 6, SIM.green, true);
    label(ctx, mode === "echo" ? "wall" : "O", obsX, obsY - 16, SIM.green, 11, "center");
    if (mode === "passby") label(ctx, `${vs.toFixed(0)} m/s →`, srcPx, srcPy + 20, SIM.dim, 8, "center");
    if (mode === "echo") label(ctx, `← ${vw.toFixed(0)} m/s`, obsX, obsY + 22, SIM.green, 8, "center");

    // ── f′(t) chart ──
    const cx0 = 44, cx1 = w - 20;
    const cy0 = arenaH + 12, cy1 = h - 16;
    const band = (mode === "echo" ? Math.max((fEcho - f) * 1.25, 40) : ((f * vs) / V_SOUND) * 1.6) || 60;
    const yF = (fr: number) => {
      const mid = (cy0 + cy1) / 2;
      const scale = (cy1 - cy0) / 2 / band;
      return mid - (fr - f) * scale;
    };
    ctx.save();
    ctx.strokeStyle = SIM.axis;
    ctx.beginPath();
    ctx.moveTo(cx0, cy0);
    ctx.lineTo(cx0, cy1);
    ctx.lineTo(cx1, cy1);
    ctx.stroke();
    ctx.strokeStyle = "rgba(161,161,170,0.3)";
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.moveTo(cx0, yF(f));
    ctx.lineTo(cx1, yF(f));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    label(ctx, `f = ${f.toFixed(0)} Hz`, cx1, yF(f) - 7, SIM.dim, 8, "right");

    if (mode === "echo") {
      // static spectrum: f, f_wall, f_echo
      label(ctx, "heard at wall", cx0 + 8, yF(fWall), SIM.sky, 10);
      ctx.save();
      ctx.strokeStyle = SIM.sky;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(cx0, yF(fWall));
      ctx.lineTo(cx1, yF(fWall));
      ctx.stroke();
      ctx.strokeStyle = SIM.amber;
      ctx.beginPath();
      ctx.moveTo(cx0, yF(fEcho));
      ctx.lineTo(cx1, yF(fEcho));
      ctx.stroke();
      ctx.restore();
      label(ctx, `echo heard at source: f(v+v_w)/(v−v_w) = ${fEcho.toFixed(0)} Hz`, cx0 + 8, yF(fEcho), SIM.amber, 10);
      label(ctx, "two shifts in sequence: wall = moving observer, then moving source", cx0 + 8, cy0 + 10, SIM.dim, 9);
    } else {
      const tSpan = 10;
      const xT = (tt: number) => cx0 + ((tt % tSpan) / tSpan) * (cx1 - cx0);
      ctx.save();
      ctx.strokeStyle = SIM.green;
      ctx.lineWidth = 2;
      ctx.shadowColor = SIM.green;
      ctx.shadowBlur = 4;
      ctx.beginPath();
      let started = false;
      const t0 = Math.max(0, s.t - tSpan);
      s.hist.forEach((p) => {
        if (p.t < t0) return;
        const x = xT(p.t);
        const y = yF(p.fp);
        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.restore();
      label(ctx, "f′(t) heard by observer", cx0 + 8, cy0 + 10, SIM.green, 9);
      if (mode === "passby") {
        label(ctx, `${fApp.toFixed(0)} Hz`, cx0 + 6, yF(fApp) - 7, SIM.green, 9);
        label(ctx, `${fRec.toFixed(0)} Hz`, cx1 - 6, yF(fRec) - 7, SIM.green, 9);
        label(ctx, "sharp step as the source passes — no gradual glide", w / 2, cy1 - 8, SIM.dim, 9, "center");
      } else {
        label(ctx, `max ${fCircle(-Math.PI / 2).toFixed(0)} Hz · min ${fCircle(Math.PI / 2).toFixed(0)} Hz · = f when v ⊥ line of sight`, cx1 - 6, cy0 + 10, SIM.dim, 9, "right");
      }
    }
  });

  return (
    <SimFrame
      title="Doppler effect — three interrogations"
      about="Pass-by step · circling source with offset observer (smooth f′ swing) · moving-wall echo (two shifts in a row)"
      height={360}
      canvas={<canvas ref={canvasRef} />}
      controls={
        <SimControls>
          <SimToggleGroup
            label="Scenario"
            value={mode}
            options={[
              { value: "passby", label: "Pass-by" },
              { value: "circle", label: "Circling source" },
              { value: "echo", label: "Wall echo" },
            ]}
            onChange={(v) => setMode(v)}
          />
          <LabeledSlider label="Source freq f (Hz)" value={f} min={300} max={900} step={10} decimals={0} onChange={setF} />
          {mode !== "echo" && (
            <LabeledSlider label="Source speed vs (m/s)" value={vs} min={10} max={300} step={5} decimals={0} onChange={setVs} color="#E46876" />
          )}
          {mode === "echo" && (
            <LabeledSlider label="Wall speed vw (m/s)" value={vw} min={0} max={100} step={5} decimals={0} onChange={setVw} color="#98BB6C" />
          )}
          <ResetButton onClick={reinit} />
        </SimControls>
      }
      readouts={
        <>
          {mode === "passby" && (
            <>
              <Readout label="f′ approaching" value={`${fApp.toFixed(0)} Hz`} color="#98BB6C" />
              <Readout label="f′ receding" value={`${fRec.toFixed(0)} Hz`} color="#E46876" />
              <Readout label="Drop at pass" value={`${(fApp - fRec).toFixed(0)} Hz`} color="#E6C384" />
              <Readout label="λ ahead" value={`${((V_SOUND - vs) / f).toFixed(3)} m`} color="#7FB4CA" />
            </>
          )}
          {mode === "circle" && (
            <>
              <Readout label="f′ max (closest approach)" value={`${fCircle(-Math.PI / 2).toFixed(0)} Hz`} color="#98BB6C" />
              <Readout label="f′ min (pulling away)" value={`${fCircle(Math.PI / 2).toFixed(0)} Hz`} color="#E46876" />
              <Readout label="f′ when v ⊥ sight-line" value={`${f} Hz — no shift`} color="#7FB4CA" />
              <Readout label="Observer at centre?" value="constant f — trap!" color="#D27E99" />
            </>
          )}
          {mode === "echo" && (
            <>
              <Readout label="f at wall (mov. observer)" value={`${fWall.toFixed(0)} Hz`} color="#7FB4CA" />
              <Readout label="Echo f′′ (two shifts)" value={`${fEcho.toFixed(0)} Hz`} color="#E6C384" />
              <Readout label="Ratio f′′/f" value={`${(fEcho / f).toFixed(3)}`} color="#98BB6C" />
              <Readout label="Sequence" value="obs. shift → source shift" color="#D27E99" />
            </>
          )}
        </>
      }
    />
  );
}
