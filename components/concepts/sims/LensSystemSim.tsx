"use client";

import { useState } from "react";
import SimFrame from "@/components/concepts/SimFrame";
import { LabeledSlider, Readout, SimControls, SimToggleGroup, ResetButton } from "@/components/concepts/controls";
import { useCanvas, SIM, clearPanel, label, arrow } from "@/components/concepts/useCanvas";

type Kind = "off" | "biconvex" | "planoconvex" | "biconcave" | "planoconcave" | "ccvMirror" | "cvxMirror";
type Elem = { kind: Kind; f: number; x: number };

const WORLD = 30; // cm of optical bench
const OBJ_X = 2;
const OBJ_H = 1.4; // cm, upright
const GAP = 1.5; // min spacing between elements, cm
const MAX_CROSSINGS = 12;
const FAN = [-1.1, -0.55, 0, 0.55, 1.1]; // ray fan heights at the first element
const FAN_CLAMP = 2.6; // keep every ray inside this half-height
const MAX_DRAW_H = 3.6; // cap on drawn element half-height

const KINDS: { value: Kind; label: string; short: string; mirror: boolean; sign: 1 | -1 }[] = [
  { value: "biconvex", label: "Bi-convex", short: "bi-convex", mirror: false, sign: 1 },
  { value: "planoconvex", label: "Plano-conv", short: "plano-conv", mirror: false, sign: 1 },
  { value: "biconcave", label: "Bi-concave", short: "bi-concave", mirror: false, sign: -1 },
  { value: "planoconcave", label: "Plano-cncv", short: "plano-cncv", mirror: false, sign: -1 },
  { value: "ccvMirror", label: "Mirror ccv", short: "mirror ccv", mirror: true, sign: 1 },
  { value: "cvxMirror", label: "Mirror cvx", short: "mirror cvx", mirror: true, sign: -1 },
];
const kindInfo = (k: Kind) => KINDS.find((d) => d.value === k)!;
const isMirror = (k: Kind) => kindInfo(k).mirror;
const fOf = (e: Elem) => kindInfo(e.kind).sign * e.f; // signed focal length (mirror: R/2)

type Mat = [number, number, number, number]; // [A,B,C,D] acting on (height y, lab slope θ)
const mul = (m: Mat, n: Mat): Mat => [
  m[0] * n[0] + m[1] * n[2],
  m[0] * n[1] + m[1] * n[3],
  m[2] * n[0] + m[3] * n[2],
  m[2] * n[1] + m[3] * n[3],
];
// propagation over a SIGNED Δx (negative when light travels left after a mirror)
const trans = (d: number): Mat => [1, d, 0, 1];
const elemMat = (e: Elem): Mat => {
  const f = fOf(e);
  // lens: θ' = θ − y/f ; mirror (reflection): θ' = −θ + y/f  (f > 0 concave)
  return isMirror(e.kind) ? [1, 0, 1 / f, -1] : [1, 0, -1 / f, 1];
};
const det = (m: Mat) => m[0] * m[3] - m[1] * m[2];

type Crossing = { x: number; elemIdx: number; dir: 1 | -1; gapAhead: number; S: Mat };
type Ray = { y: number; th: number; pts: { x: number; y: number }[] };
type Mark = { x: number; h: number; mag: number; final: boolean };
type FinalImage =
  | { kind: "collimated" }
  | { kind: "real"; x: number; mag: number; onBench: boolean }
  | { kind: "virtual"; x: number; mag: number };

const DEFAULTS: Elem[] = [
  { kind: "biconvex", f: 4, x: 10 },
  { kind: "biconvex", f: 4, x: 16 },
  { kind: "off", f: 4, x: 23 },
];

/**
 * Lens & mirror combination bench. Elements sit on a 30 cm rail; rays are
 * traced along the folded optical path (mirrors fold it back through earlier
 * elements). Images are located from the cumulative ray-transfer matrix:
 * rays leave the object tip at fixed height with varying slope, so an image
 * forms where B + d·D = 0 → d = −B/D, magnification det/D (collimated when D = 0).
 */
export default function LensSystemSim() {
  const [elems, setElems] = useState<Elem[]>(DEFAULTS.map((e) => ({ ...e })));
  const [slot, setSlot] = useState(0);

  const setElem = (i: number, patch: Partial<Elem>) =>
    setElems((prev) => {
      const next = prev.map((e, k) => ({ ...(k === i ? { ...e, ...patch } : e) }));
      for (let pass = 0; pass < 2; pass++) {
        for (let k = 0; k < next.length; k++) {
          const lo = k === 0 ? OBJ_X + 3 : next[k - 1].x + GAP;
          const hi = k === next.length - 1 ? WORLD - 1 : next[k + 1].x - GAP;
          next[k].x = Math.min(Math.max(next[k].x, lo), hi);
        }
      }
      return next;
    });

  const active = elems.map((e, i) => ({ e, i })).filter((a) => a.e.kind !== "off");
  const hasMirror = active.some((a) => isMirror(a.e.kind));

  /** Walk the folded path once, recording each element crossing + cumulative matrix. */
  const walk = () => {
    const crossings: Crossing[] = [];
    let x = OBJ_X;
    let dir: 1 | -1 = 1;
    let S: Mat = [1, 0, 0, 1];
    for (let guard = 0; guard < MAX_CROSSINGS; guard++) {
      let best = -1;
      for (const { e, i } of active) {
        if (dir > 0 ? e.x > x + 1e-6 : e.x < x - 1e-6) {
          if (best < 0 || Math.abs(e.x - x) < Math.abs(elems[best].x - x)) best = i;
        }
      }
      if (best < 0) break;
      const e = elems[best];
      S = mul(elemMat(e), mul(trans(e.x - x), S));
      x = e.x;
      if (isMirror(e.kind)) dir = (dir * -1) as 1 | -1;
      crossings.push({ x, elemIdx: best, dir, gapAhead: 0, S: [...S] as Mat });
    }
    const exit = crossings.length
      ? crossings[crossings.length - 1].dir > 0
        ? WORLD + 3
        : OBJ_X - 9
      : WORLD + 3;
    for (let k = 0; k < crossings.length; k++) {
      const end = k + 1 < crossings.length ? crossings[k + 1].x : exit;
      crossings[k].gapAhead = Math.abs(end - crossings[k].x);
    }
    return { crossings, exit, S };
  };

  /** Piecewise ray trace along the same folded path. */
  const traceRays = (fan: number[], crossings: Crossing[], exit: number): Ray[] => {
    const firstX = crossings.length ? crossings[0].x : WORLD;
    const rays: Ray[] = fan.map((hy) => ({
      y: OBJ_H,
      th: (hy - OBJ_H) / (firstX - OBJ_X),
      pts: [{ x: OBJ_X, y: OBJ_H }],
    }));
    let cx = OBJ_X;
    for (const c of crossings) {
      const e = elems[c.elemIdx];
      rays.forEach((r) => {
        r.y += r.th * (c.x - cx); // signed Δx
        r.pts.push({ x: c.x, y: r.y });
        const f = fOf(e);
        r.th = isMirror(e.kind) ? -r.th + r.y / f : r.th - r.y / f;
      });
      cx = c.x;
    }
    rays.forEach((r) => {
      r.y += r.th * (exit - cx);
      r.pts.push({ x: exit, y: r.y });
    });
    return rays;
  };

  /** Real images inside each gap; final image from the full-system matrix. */
  const analyze = (crossings: Crossing[], Sfinal: Mat) => {
    const marks: Mark[] = [];
    crossings.forEach((c, idx) => {
      const D = c.S[3];
      if (Math.abs(D) < 1e-9) return;
      const d = -c.S[1] / D; // signed: positive along the post-crossing travel direction
      if (d * c.dir >= -1e-9 && Math.abs(d) <= c.gapAhead) {
        const mag = det(c.S) / D;
        marks.push({ x: c.x + d, h: OBJ_H * mag, mag, final: idx === crossings.length - 1 });
      }
    });
    // coincident marks (image in the plane of the next element) are one image — keep the final
    const dedup: Mark[] = [];
    marks.forEach((m) => {
      const dup = dedup.find((d) => Math.abs(d.x - m.x) < 0.2);
      if (dup) dup.final = dup.final || m.final;
      else dedup.push(m);
    });
    const last = crossings[crossings.length - 1];
    let finalImage: FinalImage;
    const D = Sfinal[3];
    if (Math.abs(D) < 1e-9) {
      finalImage = { kind: "collimated" };
    } else {
      const d = -Sfinal[1] / D;
      const mag = det(Sfinal) / D;
      if (d * last.dir >= -1e-9) {
        finalImage = { kind: "real", x: last.x + d, mag, onBench: Math.abs(d) <= last.gapAhead };
      } else {
        finalImage = { kind: "virtual", x: last.x + d, mag };
      }
    }
    return { marks: dedup, finalImage };
  };

  // effective focal length of the lens train (mirrors fold the path — no single EFL)
  const lensEFL = () => {
    const lenses = active.filter((a) => !isMirror(a.e.kind));
    if (!lenses.length || hasMirror) return null;
    let m: Mat = elemMat(lenses[0].e);
    let prevX = lenses[0].e.x;
    for (const { e } of lenses.slice(1)) {
      m = mul(elemMat(e), mul(trans(e.x - prevX), m));
      prevX = e.x;
    }
    return Math.abs(m[2]) > 1e-9 ? -1 / m[2] : null;
  };

  const { crossings, exit, S: Sfinal } = walk();
  const { marks, finalImage } = analyze(crossings, Sfinal);
  const efl = lensEFL();

  const canvasRef = useCanvas((ctx, w, h) => {
    clearPanel(ctx, w, h);
    const pad = 30;
    const axisY = h / 2;
    const scl = (w - 2 * pad) / WORLD;
    const px = (x: number) => pad + x * scl;
    const py = (y: number) => axisY - y * scl;

    // optical axis + cm ruler
    ctx.save();
    ctx.strokeStyle = SIM.axis;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad - 10, axisY);
    ctx.lineTo(w - pad + 10, axisY);
    ctx.stroke();
    ctx.strokeStyle = "rgba(161,161,170,0.35)";
    ctx.fillStyle = "rgba(161,161,170,0.7)";
    ctx.font = "9px ui-monospace, Menlo, monospace";
    ctx.textAlign = "center";
    for (let x = 5; x <= WORLD; x += 5) {
      ctx.beginPath();
      ctx.moveTo(px(x), h - 20);
      ctx.lineTo(px(x), h - 14);
      ctx.stroke();
      ctx.fillText(String(x), px(x), h - 4);
    }
    ctx.restore();

    // object
    arrow(ctx, px(OBJ_X), axisY, px(OBJ_X), py(OBJ_H), SIM.green, 2.5);
    label(ctx, "object", px(OBJ_X), py(OBJ_H) - 12, SIM.green, 10, "center");

    if (!active.length) {
      label(ctx, "switch on at least one element to trace rays", w / 2, 24, SIM.dim, 11, "center");
      return;
    }

    // ---- rays: shrink the fan if it would leave the drawable band ----
    let rays = traceRays(FAN, crossings, exit);
    let maxY = 0;
    rays.forEach((r) => {
      for (let k = 1; k <= crossings.length; k++) maxY = Math.max(maxY, Math.abs(r.pts[k].y)); // crossings only
    });
    if (maxY > FAN_CLAMP) rays = traceRays(FAN.map((v) => (v * FAN_CLAMP) / maxY), crossings, exit);

    // per-element half-height: cover every ray that reaches it (min OBJ fan, max band)
    const halfH = new Map<number, number>();
    crossings.forEach((c, cIdx) => {
      const m = rays.reduce((acc, r) => Math.max(acc, Math.abs(r.pts[cIdx + 1].y)), 0);
      const want = Math.min(Math.max(m + 0.25, 1.15), MAX_DRAW_H);
      halfH.set(c.elemIdx, Math.max(halfH.get(c.elemIdx) ?? 0, want));
    });

    // ---- elements ----
    elems.forEach((e, i) => {
      const hh = e.kind === "off" ? 1.15 : halfH.get(i) ?? 1.15;
      const top = axisY - hh * scl;
      const bot = axisY + hh * scl;
      if (e.kind === "off") {
        ctx.save();
        ctx.strokeStyle = "rgba(100,116,139,0.35)";
        ctx.setLineDash([3, 5]);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(px(e.x), top);
        ctx.lineTo(px(e.x), bot);
        ctx.stroke();
        ctx.restore();
        label(ctx, `E${i + 1} off`, px(e.x), top - 10, SIM.dim, 9, "center");
      } else {
        const info = kindInfo(e.kind);
        const color = info.mirror ? SIM.amber : info.sign > 0 ? SIM.sky : SIM.fuchsia;
        const b = Math.min(20, 6 + hh * scl * 0.14); // bulge grows with element size
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        if (e.kind === "biconvex") {
          ctx.moveTo(px(e.x), top);
          ctx.quadraticCurveTo(px(e.x) + b, axisY, px(e.x), bot);
          ctx.moveTo(px(e.x), top);
          ctx.quadraticCurveTo(px(e.x) - b, axisY, px(e.x), bot);
        } else if (e.kind === "planoconvex") {
          ctx.moveTo(px(e.x) - 6, top);
          ctx.lineTo(px(e.x) - 6, bot);
          ctx.moveTo(px(e.x) - 6, top);
          ctx.quadraticCurveTo(px(e.x) - 6 + 2 * b + 6, axisY, px(e.x) - 6, bot);
        } else if (e.kind === "biconcave") {
          ctx.moveTo(px(e.x) - 7, top);
          ctx.quadraticCurveTo(px(e.x) + b * 0.7, axisY, px(e.x) - 7, bot);
          ctx.moveTo(px(e.x) + 7, top);
          ctx.quadraticCurveTo(px(e.x) - b * 0.7, axisY, px(e.x) + 7, bot);
        } else if (e.kind === "planoconcave") {
          ctx.moveTo(px(e.x) + 6, top);
          ctx.lineTo(px(e.x) + 6, bot);
          ctx.moveTo(px(e.x) + 6, top);
          ctx.quadraticCurveTo(px(e.x) + 6 - 2 * b - 6, axisY, px(e.x) + 6, bot);
        } else if (e.kind === "ccvMirror") {
          // concave: the dish opens toward the object (left), centre deeper than the rim
          ctx.moveTo(px(e.x) + 3, top);
          ctx.quadraticCurveTo(px(e.x) + 3 + 2 * b + 6, axisY, px(e.x) + 3, bot);
        } else {
          // convex: surface bulges out toward the object (left)
          ctx.moveTo(px(e.x) + 3, top);
          ctx.quadraticCurveTo(px(e.x) + 3 - 2 * b - 6, axisY, px(e.x) + 3, bot);
        }
        ctx.stroke();
        ctx.restore();
        if (info.mirror) {
          // hatching on the non-reflective back (right of the surface)
          const hx = px(e.x) + 12;
          ctx.save();
          ctx.strokeStyle = "rgba(161,161,170,0.4)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          for (let y = top + 6; y < bot - 2; y += 12) {
            ctx.moveTo(hx + 8, y);
            ctx.lineTo(hx, y - 7);
          }
          ctx.stroke();
          ctx.restore();
        }
        // focal markers: lenses ±f, concave mirror F in front, convex mirror F behind
        ctx.save();
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.6;
        if (isMirror(e.kind)) {
          ctx.beginPath();
          ctx.arc(px(e.x + (info.sign > 0 ? -e.f : e.f)), axisY, 2.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          [-1, 1].forEach((s) => {
            ctx.beginPath();
            ctx.arc(px(e.x + s * e.f), axisY, 2.5, 0, Math.PI * 2);
            ctx.fill();
          });
        }
        ctx.restore();
        const tag = i === slot ? `▸ ` : "";
        label(
          ctx,
          `${tag}E${i + 1}: ${info.short} ${info.sign > 0 ? "+" : "−"}${e.f.toFixed(1)}`,
          px(e.x),
          top - 10 - (i % 2) * 14,
          color,
          9,
          "center"
        );
      }
      if (i === slot) {
        // highlight the element being edited
        ctx.save();
        ctx.strokeStyle = "rgba(226,232,240,0.5)";
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1;
        ctx.strokeRect(px(e.x) - 24, top - 24, 48, bot - top + 32);
        ctx.restore();
      }
    });

    // ---- rays ----
    rays.forEach((r, i) => {
      ctx.save();
      ctx.strokeStyle = i === 2 ? SIM.bright : SIM.indigo;
      ctx.globalAlpha = i === 2 ? 0.95 : 0.65;
      ctx.lineWidth = i === 2 ? 1.8 : 1.3;
      ctx.beginPath();
      r.pts.forEach((p, k) => (k === 0 ? ctx.moveTo(px(p.x), py(p.y)) : ctx.lineTo(px(p.x), py(p.y))));
      ctx.stroke();
      ctx.restore();
    });

    // ---- image marks ----
    marks.forEach((im, i) => {
      if (im.x < OBJ_X - 8 || im.x > WORLD + 2) return;
      const color = im.final ? SIM.red : SIM.amber;
      const hDraw = Math.max(Math.min(im.h, 4.2), -4.2); // stub if huge, label carries the number
      arrow(ctx, px(im.x), axisY, px(im.x), py(hDraw), color, 2.2);
      label(
        ctx,
        im.final ? `final image m=${im.mag.toFixed(2)}` : `image ${i + 1}`,
        px(im.x),
        py(hDraw) + (hDraw > 0 ? -12 : 12),
        color,
        9,
        "center"
      );
    });
    if (finalImage.kind === "virtual") {
      const im = finalImage;
      // dashed back-extensions of the outgoing rays meet at the virtual image
      const lastC = crossings[crossings.length - 1];
      if (Math.abs(im.x) < WORLD + 4 && Math.abs(im.x - lastC.x) < 14 && Math.abs(im.mag) < 8) {
        rays.forEach((r) => {
          const yAt = r.pts[r.pts.length - 2].y;
          ctx.save();
          ctx.strokeStyle = SIM.red;
          ctx.globalAlpha = 0.4;
          ctx.setLineDash([4, 4]);
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(px(lastC.x), py(yAt));
          ctx.lineTo(px(im.x), py(yAt + r.th * (im.x - lastC.x)));
          ctx.stroke();
          ctx.restore();
        });
        const hDraw = Math.max(Math.min(OBJ_H * im.mag, 4.2), -4.2);
        arrow(ctx, px(im.x), axisY, px(im.x), py(hDraw), "rgba(228,104,118,0.6)", 2.2);
        label(ctx, `virtual image m=${im.mag.toFixed(2)}`, px(im.x), py(hDraw) - 12, SIM.red, 9, "center");
      }
    }

    const status =
      finalImage.kind === "collimated"
        ? hasMirror
          ? "output collimated — image at infinity"
          : "afocal — output collimated, effective f → ∞"
        : finalImage.kind === "real"
          ? `final image real, ${finalImage.mag < 0 ? "inverted" : "erect"} · m = ${finalImage.mag.toFixed(2)}`
          : `final image virtual, ${finalImage.mag < 0 ? "inverted" : "erect"} · m = ${finalImage.mag.toFixed(2)}`;
    label(ctx, status, w / 2, 22, SIM.text, 10, "center");
  });

  // dynamic position bounds so the slider thumb never fights the clamps
  const lo = slot === 0 ? OBJ_X + 3 : elems[slot - 1].x + GAP;
  const hi = slot === elems.length - 1 ? WORLD - 1 : elems[slot + 1].x - GAP;
  const posMin = lo;
  const posMax = Math.max(hi, lo + 0.5);

  const finalReadout =
    finalImage.kind === "collimated"
      ? "∞ (collimated)"
      : finalImage.kind === "real"
        ? `${finalImage.x.toFixed(1)} cm${finalImage.onBench ? "" : " (off-bench)"}`
        : `${finalImage.x.toFixed(1)} cm (virtual)`;

  return (
    <SimFrame
      title="Lens & mirror combination bench"
      about="Mix biconvex, plano-convex, biconcave, plano-concave lenses and concave/convex mirrors on one rail — pick an element slot, set its kind, |f| and position; mirrors fold the path back through earlier elements"
      height={400}
      canvas={<canvas ref={canvasRef} />}
      controls={
        <SimControls>
          <SimToggleGroup
            label="Edit element"
            value={String(slot)}
            options={[
              { value: "0", label: "E1" },
              { value: "1", label: "E2" },
              { value: "2", label: "E3" },
            ]}
            onChange={(v) => setSlot(Number(v))}
          />
          <SimToggleGroup
            label={`E${slot + 1} kind`}
            value={elems[slot].kind}
            options={[{ value: "off", label: "Off" }, ...KINDS.map((k) => ({ value: k.value, label: k.label }))]}
            onChange={(v) => setElem(slot, { kind: v as Kind })}
          />
          <LabeledSlider
            label={`E${slot + 1} |f| cm (mirror: R/2)`}
            value={elems[slot].f}
            min={2}
            max={8}
            step={0.5}
            decimals={1}
            onChange={(v) => setElem(slot, { f: v })}
            color="#E6C384"
          />
          <LabeledSlider
            label={`E${slot + 1} position (cm)`}
            value={elems[slot].x}
            min={posMin}
            max={posMax}
            step={0.5}
            decimals={1}
            onChange={(v) => setElem(slot, { x: v })}
            color="#938AA9"
          />
          <ResetButton
            onClick={() => {
              setElems(DEFAULTS.map((e) => ({ ...e })));
              setSlot(0);
            }}
          />
        </SimControls>
      }
      readouts={
        <>
          <Readout
            label="Final image"
            value={finalReadout}
            color={finalImage.kind === "real" ? "#98BB6C" : finalImage.kind === "virtual" ? "#E46876" : "#E6C384"}
          />
          <Readout
            label="Total magnification"
            value={finalImage.kind === "collimated" ? "—" : `${finalImage.mag.toFixed(2)}×`}
          />
          <Readout
            label="Effective f (lenses only)"
            value={hasMirror ? "n/a with mirrors" : efl === null ? "∞ / collimated" : `${efl.toFixed(1)} cm`}
            color="#98BB6C"
          />
          <Readout
            label="Images on bench"
            value={`${
              marks.filter((m) => m.x >= OBJ_X - 8 && m.x <= WORLD + 2).length +
              (finalImage.kind === "virtual" && finalImage.x >= OBJ_X - 8 && finalImage.x <= WORLD + 2 ? 1 : 0)
            }`}
            color="#D27E99"
          />
        </>
      }
    />
  );
}
