"use client";

import { useRef, useState } from "react";
import Box from "@mui/material/Box";
import SimFrame from "@/components/concepts/SimFrame";
import { LabeledSlider, Readout, SimControls, ResetButton } from "@/components/concepts/controls";
import { useCanvas, SIM, clearPanel, label, circle, arrow } from "@/components/concepts/useCanvas";

/** Bar magnet dipole field lines + a compass needle that aligns with the local net field. */
export default function BarMagnetSim() {
  const [strength, setStrength] = useState(1);
  const state = useRef({ compass: { x: 0.62, y: 0.3 }, ang: 0 });

  const canvasRef = useCanvas((ctx, w, h, _t, dt) => {
    const s = state.current;
    const mx = w / 2;
    const my = h / 2;
    const mL = w * 0.16;
    const m = strength * 60;

    const Bfield = (x: number, y: number) => {
      // dipole at origin pointing +x (N to the right)
      const dx = x - mx;
      const dy = y - my;
      const r2 = dx * dx + dy * dy;
      const r = Math.sqrt(r2) + 6;
      const r5 = r2 * r2 * r;
      const bx = m * (2 * dx * dx - r2) / r5;
      const by = m * (2 * dx * dy) / r5;
      return { bx, by };
    };

    clearPanel(ctx, w, h);

    // field lines: start near N pole in a fan
    ctx.save();
    ctx.strokeStyle = "rgba(129,140,248,0.5)";
    ctx.lineWidth = 1.2;
    for (let a = -1.4; a <= 1.4; a += 0.28) {
      let x = mx + mL / 2 + Math.cos(a) * 8;
      let y = my + Math.sin(a) * 8;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let i = 0; i < 300; i++) {
        const { bx, by } = Bfield(x, y);
        const mag = Math.hypot(bx, by);
        if (mag < 1e-6) break;
        x += (bx * 2.2) / mag;
        y += (by * 2.2) / mag;
        if (x < 0 || x > w || y < 0 || y > h) break;
        // stop if re-entered S pole
        if (Math.abs(y - my) < 10 && x < mx - mL / 2 + 6 && x > mx - mL / 2 - 4) break;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();

    // magnet body
    ctx.save();
    ctx.fillStyle = SIM.red;
    ctx.fillRect(mx, my - 16, mL / 2, 32);
    ctx.fillStyle = SIM.sky;
    ctx.fillRect(mx - mL / 2, my - 16, mL / 2, 32);
    ctx.strokeStyle = SIM.panelEdge;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(mx - mL / 2, my - 16, mL, 32);
    ctx.restore();
    label(ctx, "N", mx + mL / 4, my, SIM.white, 14, "center");
    label(ctx, "S", mx - mL / 4, my, SIM.white, 14, "center");
    label(ctx, `M = ${strength.toFixed(1)} (arb.)`, mx, my + 34, SIM.dim, 10, "center");

    // compass — draggable via arrow keys? for now orbits on a path set by sliders; place fixed draggable via mouse handled below
    const c = s.compass;
    const cx = c.x * w;
    const cy = c.y * h;
    const { bx, by } = Bfield(cx, cy);
    const target = Math.atan2(by, bx);
    // smooth align
    let d = target - s.ang;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    s.ang += d * Math.min(1, dt * 6);

    ctx.save();
    ctx.fillStyle = "rgba(148,163,184,0.12)";
    ctx.beginPath();
    ctx.arc(cx, cy, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = SIM.panelEdge;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
    // needle: red toward field
    arrow(ctx, cx - Math.cos(s.ang) * 16, cy - Math.sin(s.ang) * 16, cx + Math.cos(s.ang) * 16, cy + Math.sin(s.ang) * 16, SIM.red, 2.5);
    circle(ctx, cx, cy, 2.5, SIM.text);
    label(ctx, "compass", cx, cy + 36, SIM.dim, 9, "center");

    label(ctx, "needle aligns with net local field B — north-seeking end points along B", w / 2, h - 12, SIM.dim, 10, "center");
  });

  return (
    <SimFrame
      title="Bar magnet field & compass"
      about="Dipole field lines N→S outside the magnet; a compass aligns with the local B"
      height={330}
      canvas={
        <BarMagnetCanvasWithDrag
          draw={canvasRef}
          onCompass={(p) => {
            state.current.compass = p;
          }}
        />
      }
      controls={
        <SimControls>
          <LabeledSlider label="Magnetic moment M" value={strength} min={0.3} max={3} step={0.05} onChange={setStrength} />
          <ResetButton onClick={() => { state.current.compass = { x: 0.62, y: 0.3 }; state.current.ang = 0; }} />
        </SimControls>
      }
      readouts={
        <>
          <Readout label="On-axis field" value="B = μ₀2M/4πr³" />
          <Readout label="Equatorial field" value="B = μ₀M/4πr³ (half, reversed)" color="#38bdf8" />
          <Readout label="Field lines" value="closed loops — no monopoles" color="#34d399" />
        </>
      }
    />
  );
}

/** Wraps the physics canvas with a pointer-drag layer for the compass. */
function BarMagnetCanvasWithDrag({
  draw,
  onCompass,
}: {
  draw: React.RefObject<HTMLCanvasElement | null>;
  onCompass: (p: { x: number; y: number }) => void;
}) {
  return (
    <Box
      sx={{ position: "absolute", inset: 0, cursor: "crosshair" }}
      onPointerDown={(e) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        onCompass({
          x: Math.min(0.97, Math.max(0.03, (e.clientX - rect.left) / rect.width)),
          y: Math.min(0.97, Math.max(0.03, (e.clientY - rect.top) / rect.height)),
        });
      }}
    >
      <canvas ref={draw} />
    </Box>
  );
}
