"use client";

import { useRef, useState } from "react";
import Button from "@mui/material/Button";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SimFrame from "@/components/concepts/SimFrame";
import { LabeledSlider, Readout, SimControls, SimToggleGroup, ResetButton } from "@/components/concepts/controls";
import { useCanvas, SIM, clearPanel, label } from "@/components/concepts/useCanvas";

/** A → B with an exact integrated rate law for order 0, 1 or 2. */
const concAt = (order: number, k: number, A0: number, t: number) => {
  if (order === 0) return Math.max(0, A0 - k * t);
  if (order === 1) return A0 * Math.exp(-k * t);
  return A0 / (1 + k * A0 * t);
};
const halfLife = (order: number, k: number, A0: number) => {
  if (order === 0) return A0 / (2 * k);
  if (order === 1) return Math.LN2 / k;
  return 1 / (k * A0);
};
const K_UNITS = ["M/min", "min⁻¹", "M⁻¹·min⁻¹"];

function KineticsSim() {
  const [orderKey, setOrderKey] = useState<"0" | "1" | "2">("1");
  const [k, setK] = useState(0.2);
  const [A0, setA0] = useState(0.8);
  const [playing, setPlaying] = useState(true);
  const order = Number(orderKey);

  const tRef = useRef(0);
  const playingRef = useRef(true);
  playingRef.current = playing;
  // readouts live in React state; nudge a tick ~4×/s from the draw loop
  const [, setTick] = useState(0);
  const tickRef = useRef(-1);

  // frozen random thresholds: molecule i flips A→B when the converted
  // fraction crosses its value, so the ensemble matches the exact curve
  const [thresholds] = useState(() => Array.from({ length: 80 }, () => Math.random()));

  const reset = () => {
    tRef.current = 0;
  };
  const pickOrder = (v: "0" | "1" | "2") => {
    setOrderKey(v);
    reset();
  };
  const pickK = (v: number) => {
    setK(v);
    reset();
  };
  const pickA0 = (v: number) => {
    setA0(v);
    reset();
  };

  const tHalf = halfLife(order, k, A0);
  const tEnd = order === 0 ? (A0 / k) * 1.04 : 4 * tHalf;

  const canvasRef = useCanvas((ctx, w, h, _t, dt) => {
    clearPanel(ctx, w, h, false);
    if (playingRef.current) tRef.current = Math.min(tEnd, tRef.current + dt);
    const tNow = tRef.current;
    const tk = Math.round(tNow * 4);
    if (tk !== tickRef.current) {
      tickRef.current = tk;
      setTick(tk);
    }
    const A = concAt(order, k, A0, tNow);

    // ── left: molecules flipping A (green) → B (amber) ──────────────
    const mX0 = 26;
    const mX1 = w * 0.34;
    const mY0 = 58;
    const mY1 = h - 58;
    const cols = w < 480 ? 8 : 10;
    const rows = w < 480 ? 10 : 8;
    const sx = (mX1 - mX0) / cols;
    const sy = (mY1 - mY0) / rows;
    const rad = Math.min(sx, sy) * 0.32;
    const converted = 1 - A / A0;

    label(ctx, "A → B", (mX0 + mX1) / 2, 42, SIM.text, 11, "center");
    for (let i = 0; i < thresholds.length; i++) {
      const c = i % cols;
      const r = Math.floor(i / cols);
      const x = mX0 + sx * (c + 0.5);
      const y = mY0 + sy * (r + 0.5);
      if (thresholds[i] < converted) {
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.strokeStyle = SIM.amber;
        ctx.lineWidth = 1.6;
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fillStyle = SIM.green;
        ctx.fill();
      }
    }
    ctx.beginPath();
    ctx.arc(mX0 + 6, h - 40, 4, 0, Math.PI * 2);
    ctx.fillStyle = SIM.green;
    ctx.fill();
    label(ctx, `[A] ${(converted * 100).toFixed(0)}% reacted`, mX0 + 14, h - 40, SIM.dim, 9);

    // ── right: [A] vs t with half-life markers ──────────────────────
    const pX0 = w * 0.4;
    const pX1 = w - 24;
    const pY0 = 58;
    const pY1 = h - 52;
    const px = (tt: number) => pX0 + (tt / tEnd) * (pX1 - pX0);
    const py = (a: number) => pY1 - (a / (A0 * 1.08)) * (pY1 - pY0);

    ctx.save();
    ctx.strokeStyle = SIM.axis;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pX0, pY0 - 8);
    ctx.lineTo(pX0, pY1);
    ctx.lineTo(pX1, pY1);
    ctx.stroke();
    ctx.restore();

    label(ctx, "[A] / M", pX0, pY0 - 16, SIM.text, 10);
    label(ctx, "t / min", (pX0 + pX1) / 2, h - 20, SIM.dim, 9, "center");
    label(ctx, (A0).toFixed(2), pX0 - 6, py(A0), SIM.dim, 9, "right");
    label(ctx, (A0 / 2).toFixed(2), pX0 - 6, py(A0 / 2), SIM.dim, 9, "right");
    label(ctx, "0", pX0 - 6, pY1, SIM.dim, 9, "right");

    // half-life markers (first order: equally spaced — the classic signature)
    const marks = order === 1 ? [1, 2, 3] : [1];
    marks.forEach((m) => {
      const tx = px(tHalf * m);
      if (tx > pX1) return;
      ctx.save();
      ctx.strokeStyle = SIM.amber;
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(tx, pY0);
      ctx.lineTo(tx, py(concAt(order, k, A0, tHalf * m)));
      ctx.stroke();
      ctx.restore();
      label(ctx, `${m}·t½`, tx, pY0 + 6, SIM.amber, 9, "center");
    });

    // the curve
    ctx.save();
    ctx.strokeStyle = SIM.green;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    for (let i = 0; i <= 140; i++) {
      const tt = (i / 140) * tEnd;
      const yy = py(concAt(order, k, A0, tt));
      if (i === 0) ctx.moveTo(px(tt), yy);
      else ctx.lineTo(px(tt), yy);
    }
    ctx.stroke();
    ctx.restore();

    // time cursor
    ctx.save();
    ctx.strokeStyle = SIM.bright;
    ctx.setLineDash([2, 3]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px(tNow), pY1);
    ctx.lineTo(px(tNow), py(A));
    ctx.lineTo(pX0, py(A));
    ctx.stroke();
    ctx.restore();
    ctx.beginPath();
    ctx.arc(px(tNow), py(A), 4, 0, Math.PI * 2);
    ctx.fillStyle = SIM.bright;
    ctx.fill();

    // ── inset: the straight-line test for this order ────────────────
    const iX0 = w - 178;
    const iY0 = h - 118;
    const iW = 154;
    const iH = 86;
    ctx.save();
    ctx.fillStyle = "rgba(10,10,13,0.94)";
    ctx.fillRect(iX0, iY0, iW, iH);
    ctx.strokeStyle = SIM.panelEdge;
    ctx.strokeRect(iX0, iY0, iW, iH);
    ctx.beginPath();
    ctx.rect(iX0, iY0, iW, iH);
    ctx.clip();
    const transform =
      order === 0
        ? (a: number) => a
        : order === 1
          ? (a: number) => Math.log(Math.max(a, 1e-6))
          : (a: number) => 1 / Math.max(a, 1e-6);
    const vEnd = transform(concAt(order, k, A0, tEnd));
    const v0 = transform(A0);
    const vNow = transform(A);
    const lo = Math.min(v0, vEnd);
    const hi = Math.max(v0, vEnd);
    const span = hi - lo || 1;
    const ix = (tt: number) => iX0 + 8 + (tt / tEnd) * (iW - 16);
    const iy = (v: number) => iY0 + iH - 8 - ((v - lo) / span) * (iH - 16);
    ctx.strokeStyle = order === 0 ? SIM.green : order === 1 ? SIM.sky : SIM.fuchsia;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(ix(0), iy(v0));
    ctx.lineTo(ix(tEnd), iy(vEnd));
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(ix(tNow), iy(vNow), 3, 0, Math.PI * 2);
    ctx.fillStyle = SIM.bright;
    ctx.fill();
    ctx.restore();
    const insetTitle =
      order === 0 ? "[A] vs t — straight" : order === 1 ? "ln[A] vs t — straight" : "1/[A] vs t — straight";
    label(ctx, insetTitle, iX0 + iW / 2, iY0 - 8, SIM.dim, 9, "center");

    label(
      ctx,
      order === 0
        ? "zero order: constant rate, [A] hits zero at t = [A]₀/k"
        : order === 1
          ? "first order: t½ = ln2/k is independent of [A]₀"
          : "second order: each halving of [A] takes twice as long",
      w * 0.4 + (pX1 - pX0) / 2,
      26,
      SIM.dim,
      10,
      "center"
    );
  });

  const A = concAt(order, k, A0, tRef.current);
  const rate = order === 0 ? (A > 0 ? k : 0) : k * A ** order;

  return (
    <SimFrame
      title="Rate-law explorer"
      about="Integrated rate laws for zero, first and second order — watch the ensemble, the curve and the straight-line test together."
      height={350}
      canvas={<canvas ref={canvasRef} />}
      controls={
        <SimControls>
          <SimToggleGroup
            label="Order of reaction"
            value={orderKey}
            options={[
              { value: "0", label: "0" },
              { value: "1", label: "1" },
              { value: "2", label: "2" },
            ]}
            onChange={pickOrder}
          />
          <LabeledSlider label={`Rate constant k (${K_UNITS[order]})`} value={k} min={0.02} max={0.5} step={0.01} decimals={2} onChange={pickK} color="#98BB6C" />
          <LabeledSlider label="Initial [A]₀" value={A0} min={0.2} max={1} step={0.05} decimals={2} unit=" M" onChange={pickA0} color="#7FB4CA" />
          <Button size="small" variant="outlined" startIcon={playing ? <PauseIcon /> : <PlayArrowIcon />} onClick={() => setPlaying((p) => !p)}>
            {playing ? "Pause" : "Play"}
          </Button>
          <ResetButton onClick={reset} />
        </SimControls>
      }
      readouts={
        <>
          <Readout label="Time" value={`${tRef.current.toFixed(1)} min`} />
          <Readout label="[A] remaining" value={`${A.toFixed(3)} M`} color="#98BB6C" />
          <Readout label="Rate  k[A]ⁿ" value={`${rate.toFixed(3)} M/min`} color="#E6C384" />
          <Readout label="Half-life t½" value={`${tHalf.toFixed(1)} min`} color="#7FB4CA" />
          <Readout
            label="t½ signature"
            value={order === 0 ? "t½ ∝ [A]₀" : order === 1 ? "t½ constant" : "t½ ∝ 1/[A]₀"}
            color={order === 1 ? SIM.green : SIM.text}
          />
        </>
      }
    />
  );
}

export default KineticsSim;
