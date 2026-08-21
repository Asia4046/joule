"use client";

import { useRef, useState } from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import SimFrame from "@/components/concepts/SimFrame";
import { Readout } from "@/components/concepts/controls";
import { useCanvas, SIM, clearPanel, label, circle, arrow } from "@/components/concepts/useCanvas";

const RY = 1.097e7; // 1/m
const HC = 1240; // eV·nm

const LEVELS = [1, 2, 3, 4, 5];
const energyOf = (n: number) => -13.6 / (n * n);

/** Bohr atom: click two levels to trigger a transition; photon colour + wavelength computed. */
export default function BohrSim() {
  const [from, setFrom] = useState(3);
  const [to, setTo] = useState(2);
  const state = useRef({ photons: [] as { x: number; y: number; vx: number; life: number }[], flash: 0 });

  const dE = energyOf(from) - energyOf(to);
  const lambda = dE !== 0 ? HC / Math.abs(dE) : 0; // nm; absorption and emission share |ΔE|
  const series = to === 1 ? "Lyman (UV)" : to === 2 ? "Balmer (visible)" : to === 3 ? "Paschen (IR)" : `to n=${to}`;
  const visible = lambda >= 380 && lambda <= 750;
  const color = visible
    ? lambda > 640 ? "#ef4444" : lambda > 590 ? "#f97316" : lambda > 560 ? "#eab308" : lambda > 500 ? "#22c55e" : "#06b6d4"
    : to === 1 ? "#938AA9" : "#938AA9";

  const emit = () => {
    if (dE > 0) {
      state.current.photons.push({ x: 0, y: 0, vx: 130, life: 1 });
      state.current.flash = 1;
    }
  };

  const canvasRef = useCanvas((ctx, w, h, _t, dt) => {
    const s = state.current;
    s.flash = Math.max(0, s.flash - dt * 2);

    clearPanel(ctx, w, h, false);
    const pad = 26;

    // ---- left: atom with orbit + transition ----
    const cx = w * 0.24;
    const cy = h / 2;
    const rBase = Math.min(w * 0.16, h * 0.34);
    // orbits
    LEVELS.forEach((n) => {
      const r = (rBase * n) / 2.4 + rBase * 0.45;
      ctx.save();
      ctx.strokeStyle = n === to || n === from ? "rgba(129,140,248,0.55)" : "rgba(161,161,170,0.18)";
      ctx.lineWidth = n === from || n === to ? 1.6 : 1;
      ctx.setLineDash(n === from ? [4, 4] : []);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      label(ctx, `n=${n}`, cx + r + 4, cy - 6, SIM.dim, 9);
    });
    // nucleus
    circle(ctx, cx, cy, 7, SIM.red, true);
    // electron on inner orbit animating
    const t = performance.now() / 1000;
    const rE = (rBase * from) / 2.4 + rBase * 0.45;
    circle(ctx, cx + Math.cos(t * 1.4) * rE, cy + Math.sin(t * 1.4) * rE, 4.5, SIM.sky, true);
    // transition arrow
    const rF = (rBase * from) / 2.4 + rBase * 0.45;
    const rT = (rBase * to) / 2.4 + rBase * 0.45;
    arrow(ctx, cx + rF * 0.72, cy - rF * 0.72, cx + rT * 0.72, cy - rT * 0.72, dE > 0 ? color : SIM.dim, 2);
    label(ctx, dE > 0 ? "emission" : "absorption", cx, 20, dE > 0 ? color : SIM.dim, 10, "center");

    // emitted photons
    s.photons = s.photons.filter((p) => p.life > 0);
    s.photons.forEach((p) => {
      p.x += p.vx * dt;
      p.life -= dt * 0.8;
      // wavy photon
      ctx.save();
      ctx.strokeStyle = color;
      ctx.globalAlpha = p.life;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let i = 0; i <= 24; i++) {
        const xx = cx + 40 + p.x + i * 3;
        ctx.lineTo(xx, cy + 14 + Math.sin(i * 0.8 + p.x * 0.1) * 5);
      }
      ctx.stroke();
      ctx.restore();
    });
    if (s.flash > 0) {
      ctx.save();
      ctx.globalAlpha = s.flash * 0.25;
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, w * 0.44, h);
      ctx.restore();
    }

    // ---- right: energy level diagram ----
    const ex = w * 0.52;
    const ew = w - ex - pad - 90;
    const eTop = pad + 16;
    const eBot = h - pad - 16;
    const eOf = (E: number) => eBot - ((E + 13.6) / 13.6) * (eBot - eTop);
    LEVELS.forEach((n) => {
      const E = energyOf(n);
      const y = eOf(E);
      const active = n === from || n === to;
      ctx.save();
      ctx.strokeStyle = active ? color : SIM.axis;
      ctx.lineWidth = active ? 3 : 1.5;
      ctx.beginPath();
      ctx.moveTo(ex, y);
      ctx.lineTo(ex + ew, y);
      ctx.stroke();
      ctx.restore();
      label(ctx, `n=${n}  ${E.toFixed(2)} eV`, ex + ew + 8, y, active ? color : SIM.dim, 10);
    });
    // transition arrow on diagram
    arrow(ctx, ex + ew * 0.5, eOf(energyOf(from)), ex + ew * 0.5, eOf(energyOf(to)), color, 2);
    label(ctx, dE > 0 ? `ΔE = ${dE.toFixed(2)} eV → photon` : `ΔE = ${dE.toFixed(2)} eV (needs input)`, ex + ew * 0.5 + 8, (eOf(energyOf(from)) + eOf(energyOf(to))) / 2, color, 10);

    // ground label
    label(
      ctx,
      dE === 0
        ? "pick two different levels to define a transition"
        : `1/λ = R(1/${to}² − 1/${from}²) → λ = ${lambda.toFixed(0)} nm (${series})`,
      w / 2,
      h - 12,
      SIM.text,
      10,
      "center"
    );
  });

  return (
    <SimFrame
      title="Bohr model: photon emission"
      about="Pick starting and ending levels; the photon's energy, colour and series follow"
      height={330}
      canvas={<canvas ref={canvasRef} />}
      action={
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="contained" onClick={emit} disabled={dE <= 0}>
            Emit photon
          </Button>
        </Stack>
      }
      controls={
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ alignItems: "center" }}>
          {LEVELS.map((n) => (
            <Button
              key={n}
              size="small"
              variant={from === n ? "contained" : "outlined"}
              onClick={() => setFrom(n)}
              sx={{ minWidth: 0, px: 1.2 }}
            >
              from n={n}
            </Button>
          ))}
          <span />
          {LEVELS.map((n) => (
            <Button
              key={n}
              size="small"
              variant={to === n ? "contained" : "outlined"}
              color="secondary"
              onClick={() => setTo(n)}
              disabled={n === from}
              sx={{ minWidth: 0, px: 1.2 }}
            >
              to n={n}
            </Button>
          ))}
        </Stack>
      }
      readouts={
        <>
          <Readout label="ΔE = 13.6(1/n_f² − 1/n_i²)" value={dE === 0 ? "—" : `${dE.toFixed(2)} eV`} color={color} />
          <Readout label="Photon λ" value={dE === 0 ? "—" : `${lambda.toFixed(0)} nm`} color={color} />
          <Readout label="Spectral series" value={series} />
          <Readout label="Ionisation (n=1→∞)" value="13.6 eV" />
        </>
      }
    />
  );
}
