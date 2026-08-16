"use client";

import { useState } from "react";
import SimFrame from "@/components/concepts/SimFrame";
import { LabeledSlider, Readout, SimControls, SimToggleGroup } from "@/components/concepts/controls";
import { useCanvas, SIM, clearPanel, label, arrow } from "@/components/concepts/useCanvas";

/** Thin-lens ray tracer: principal rays construct the image for convex/concave lenses. */
export default function LensSim() {
  const [u, setU] = useState(2.2); // object distance (×f units, negative in Cartesian)
  const [f, setF] = useState(1); // focal length multiplier
  const [kind, setKind] = useState<"convex" | "concave">("convex");

  const F = kind === "convex" ? f : -f; // sign convention
  const uCart = -u;
  // lens formula 1/v - 1/u = 1/f
  const v = 1 / (1 / F + 1 / uCart);
  const m = v / uCart; // magnification (for lens: m = v/u)
  const real = v > 0;

  const canvasRef = useCanvas((ctx, w, h) => {
    clearPanel(ctx, w, h);
    const pad = 30;
    const cx = w / 2;
    const axisY = h / 2;
    const scale = Math.min((w / 2 - 60) / 4.2, 70); // px per unit

    // optical axis
    ctx.save();
    ctx.strokeStyle = SIM.axis;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, axisY);
    ctx.lineTo(w - pad, axisY);
    ctx.stroke();
    ctx.restore();

    // lens
    const lensH = h / 2 - 40;
    ctx.save();
    ctx.strokeStyle = SIM.sky;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = SIM.sky;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    if (kind === "convex") {
      ctx.moveTo(cx, axisY - lensH);
      ctx.quadraticCurveTo(cx + 18, axisY, cx, axisY + lensH);
      ctx.moveTo(cx, axisY - lensH);
      ctx.quadraticCurveTo(cx - 18, axisY, cx, axisY + lensH);
    } else {
      ctx.moveTo(cx + 12, axisY - lensH);
      ctx.quadraticCurveTo(cx - 6, axisY, cx + 12, axisY + lensH);
      ctx.moveTo(cx - 12, axisY - lensH);
      ctx.quadraticCurveTo(cx + 6, axisY, cx - 12, axisY + lensH);
    }
    ctx.stroke();
    ctx.restore();

    // foci
    [-1, 1].forEach((s) => {
      const fx = cx + s * Math.abs(F) * scale;
      ctx.save();
      ctx.fillStyle = SIM.amber;
      ctx.beginPath();
      ctx.arc(fx, axisY, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      label(ctx, s < 0 ? "F" : "F'", fx, axisY + 14, SIM.amber, 10, "center");
    });

    // object
    const ox = cx + uCart * scale;
    const objH = 60;
    arrow(ctx, ox, axisY, ox, axisY - objH, SIM.green, 2.5);
    label(ctx, "object", ox, axisY - objH - 10, SIM.green, 10, "center");

    // image
    const ix = cx + v * scale;
    const imH = objH * m;
    if (Math.abs(imH) < h && Math.abs(v) < 5) {
      arrow(ctx, ix, axisY, ix, axisY - imH, real ? SIM.red : "rgba(248,113,113,0.55)", 2.5);
      label(ctx, real ? "real image" : "virtual image", ix, axisY - imH - (imH > 0 ? 10 : -16), SIM.red, 10, "center");
    }

    // principal rays from object tip
    const oy = axisY - objH;
    const ray = (x1: number, y1: number, x2: number, y2: number, dashed = false) => {
      ctx.save();
      ctx.strokeStyle = SIM.indigo;
      ctx.globalAlpha = dashed ? 0.5 : 0.9;
      ctx.lineWidth = 1.5;
      if (dashed) ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.restore();
    };

    if (Math.abs(v) < 5 && Math.abs(imH) < h) {
      const iy = axisY - imH;
      if (real) {
        // ray 1: parallel → through F'
        ray(ox, oy, cx, oy);
        ray(cx, oy, ix, iy);
        // ray 2: through centre undeviated
        ray(ox, oy, ix, iy);
        // ray 3: through F → emerges parallel
        ray(ox, oy, cx, iy);
        ray(cx, iy, ix, iy);
      } else {
        // virtual: rays diverge; construction lines dashed
        ray(ox, oy, cx, oy);
        // parallel ray leaves as if from image: extend backwards
        const slope = (oy - iy) / (cx - ix);
        ray(cx, oy, w - pad, oy + slope * (w - pad - cx));
        ray(ox, oy, cx, oy, true);
        // centre ray
        const slopeC = (iy - oy) / (ix - ox);
        ray(ox, oy, w - pad, oy + slopeC * (w - pad - ox));
        // dashed back-extensions to image
        ray(cx, oy, ix, iy, true);
        ray(w - pad, oy + slopeC * (w - pad - ox), ix, iy, true);
      }
    }

    label(
      ctx,
      real
        ? `real, ${m < 0 ? "inverted" : "erect"} · |m| = ${Math.abs(m).toFixed(2)}`
        : `virtual, erect · |m| = ${Math.abs(m).toFixed(2)} (magnifying glass)`,
      w / 2,
      24,
      SIM.bright,
      11,
      "center"
    );
    label(ctx, `u = ${u.toFixed(2)}f · v = ${v.toFixed(2)}f`, w - pad, h - 14, SIM.text, 10, "right");
  });

  return (
    <SimFrame
      title="Lens ray tracer"
      about="1/v − 1/u = 1/f with principal rays — bring the object inside F for the magnifying-glass case"
      height={340}
      canvas={<canvas ref={canvasRef} />}
      controls={
        <SimControls>
          <LabeledSlider label="Object distance u (×f)" value={u} min={0.3} max={4} step={0.05} onChange={setU} color="#34d399" />
          <LabeledSlider label="Focal length |f|" value={f} min={0.5} max={1.5} step={0.05} onChange={setF} color="#fbbf24" />
          <SimToggleGroup
            label="Lens"
            value={kind}
            options={[
              { value: "convex", label: "Convex" },
              { value: "concave", label: "Concave" },
            ]}
            onChange={(x) => setKind(x)}
          />
        </SimControls>
      }
      readouts={
        <>
          <Readout label="Image distance v" value={`${v.toFixed(2)} f`} color={real ? "#34d399" : "#f87171"} />
          <Readout label="Magnification m" value={`${m.toFixed(2)}×`} />
          <Readout label="Nature" value={real ? "Real — can be projected" : "Virtual — seen through lens"} color={real ? "#34d399" : "#fbbf24"} />
        </>
      }
    />
  );
}
