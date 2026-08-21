"use client";

import { useState } from "react";
import SimFrame from "@/components/concepts/SimFrame";
import { LabeledSlider, Readout, SimControls, SimToggleGroup } from "@/components/concepts/controls";
import { useCanvas, SIM, clearPanel, label } from "@/components/concepts/useCanvas";

const ELEMENTS = [
  { Z: 1, sym: "H",  group: 1, period: 1, block: "s", radius: 53,  en: 2.20, ie: 13.60, ea: 0.75 },
  { Z: 2, sym: "He", group: 18, period: 1, block: "s", radius: 31,  en: 0,   ie: 24.59, ea: 0 },
  { Z: 3, sym: "Li", group: 1, period: 2, block: "s", radius: 167, en: 0.98, ie: 5.39,  ea: 0.62 },
  { Z: 4, sym: "Be", group: 2, period: 2, block: "s", radius: 112, en: 1.57, ie: 9.32,  ea: 0 },
  { Z: 5, sym: "B",  group: 13, period: 2, block: "p", radius: 87,  en: 2.04, ie: 8.30,  ea: 0.28 },
  { Z: 6, sym: "C",  group: 14, period: 2, block: "p", radius: 67,  en: 2.55, ie: 11.26, ea: 1.26 },
  { Z: 7, sym: "N",  group: 15, period: 2, block: "p", radius: 56,  en: 3.04, ie: 14.53, ea: 0.07 },
  { Z: 8, sym: "O",  group: 16, period: 2, block: "p", radius: 48,  en: 3.44, ie: 13.62, ea: 1.46 },
  { Z: 9, sym: "F",  group: 17, period: 2, block: "p", radius: 42,  en: 3.98, ie: 17.42, ea: 3.40 },
  { Z: 10, sym: "Ne", group: 18, period: 2, block: "p", radius: 38,  en: 0,   ie: 21.56, ea: 0 },
  { Z: 11, sym: "Na", group: 1, period: 3, block: "s", radius: 190, en: 0.93, ie: 5.14,  ea: 0.55 },
  { Z: 12, sym: "Mg", group: 2, period: 3, block: "s", radius: 145, en: 1.31, ie: 7.65,  ea: 0 },
  { Z: 13, sym: "Al", group: 13, period: 3, block: "p", radius: 118, en: 1.61, ie: 5.99,  ea: 0.44 },
  { Z: 14, sym: "Si", group: 14, period: 3, block: "p", radius: 111, en: 1.90, ie: 8.15,  ea: 1.39 },
  { Z: 15, sym: "P",  group: 15, period: 3, block: "p", radius: 106, en: 2.19, ie: 10.49, ea: 0.75 },
  { Z: 16, sym: "S",  group: 16, period: 3, block: "p", radius: 105, en: 2.58, ie: 10.36, ea: 2.08 },
  { Z: 17, sym: "Cl", group: 17, period: 3, block: "p", radius: 99,  en: 3.16, ie: 12.97, ea: 3.61 },
  { Z: 18, sym: "Ar", group: 18, period: 3, block: "p", radius: 94,  en: 0,   ie: 15.76, ea: 0 },
  { Z: 19, sym: "K",  group: 1, period: 4, block: "s", radius: 243, en: 0.82, ie: 4.34,  ea: 0.50 },
  { Z: 20, sym: "Ca", group: 2, period: 4, block: "s", radius: 194, en: 1.00, ie: 6.11,  ea: 0.02 },
  { Z: 31, sym: "Ga", group: 13, period: 4, block: "p", radius: 136, en: 1.81, ie: 5.99,  ea: 0.30 },
  { Z: 32, sym: "Ge", group: 14, period: 4, block: "p", radius: 125, en: 2.01, ie: 7.90,  ea: 1.23 },
  { Z: 35, sym: "Br", group: 17, period: 4, block: "p", radius: 114, en: 2.96, ie: 11.81, ea: 3.36 },
  { Z: 36, sym: "Kr", group: 18, period: 4, block: "p", radius: 116, en: 0,   ie: 14.00, ea: 0 },
  { Z: 37, sym: "Rb", group: 1, period: 5, block: "s", radius: 265, en: 0.82, ie: 4.18,  ea: 0.49 },
  { Z: 53, sym: "I",  group: 17, period: 5, block: "p", radius: 133, en: 2.66, ie: 10.45, ea: 2.95 },
  { Z: 55, sym: "Cs", group: 1, period: 6, block: "s", radius: 298, en: 0.79, ie: 3.89,  ea: 0.47 },
  { Z: 80, sym: "Hg", group: 12, period: 6, block: "d", radius: 149, en: 2.00, ie: 10.44, ea: 0 },
];

type Trend = "radius" | "en" | "ie" | "ea";

export default function PeriodicTrendsSim() {
  const [trend, setTrend] = useState<Trend>("radius");
  const [highlightGroup, setHighlightGroup] = useState(1);
  const [highlightPeriod, setHighlightPeriod] = useState(1);

  const trendInfo: Record<Trend, { label: string; unit: string; color: string; desc: string }> = {
    radius: { label: "Atomic radius", unit: "pm", color: SIM.sky, desc: "↓ down group, → across period" },
    en:     { label: "Electronegativity (Pauling)", unit: "", color: SIM.green, desc: "↑ across period, ↓ down group" },
    ie:     { label: "Ionisation energy", unit: "eV", color: SIM.amber, desc: "↑ across period, ↓ down group" },
    ea:     { label: "Electron affinity", unit: "eV", color: SIM.fuchsia, desc: "→ more negative across period" },
  };

  const info = trendInfo[trend];
  const vals = ELEMENTS.map((e) => e[trend] as number).filter((v) => v > 0);
  const vMin = Math.min(...vals);
  const vMax = Math.max(...vals);

  const canvasRef = useCanvas((ctx, w, h) => {
    clearPanel(ctx, w, h, false);
    const pad = 30;
    const cellW = (w - 2 * pad - 20 - 300) / 18;
    const cellH = 42;
    const startY = pad + 80;

    // periodic table grid
    ELEMENTS.forEach((el) => {
      const col = el.group === 18 ? 17 : el.group - 1;
      const row = el.period - 1;
      const x = pad + col * cellW + (el.period >= 4 && el.group <= 2 ? 0 : 0);
      const y = startY + row * cellH;

      const val = el[trend] as number;
      const norm = val > 0 ? (val - vMin) / (vMax - vMin) : 0;
      // 0 means "no filter": keep the heat colormap everywhere, stroke only the chosen group/period
      const inGroup = el.group === highlightGroup || highlightGroup === 0;
      const inPeriod = el.period === highlightPeriod || highlightPeriod === 0;
      const highlighted = inGroup && inPeriod && (highlightGroup !== 0 || highlightPeriod !== 0);

      ctx.save();
      ctx.fillStyle = highlighted ? info.color : `hsl(${200 - 200 * norm}, 60%, ${40 + 30 * norm}%)`;
      ctx.fillRect(x, y, cellW - 2, cellH - 2);
      if (highlighted) {
        ctx.strokeStyle = SIM.white;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, cellW - 2, cellH - 2);
      }
      ctx.fillStyle = val > 0 ? SIM.white : SIM.dim;
      ctx.font = "bold 12px ui-monospace";
      ctx.textAlign = "center";
      ctx.fillText(el.sym, x + cellW / 2, y + cellH / 2 + 4);
      if (val > 0) {
        ctx.font = "9px ui-monospace";
        ctx.fillText(val.toFixed(val < 10 ? 2 : 0), x + cellW / 2, y + cellH - 4);
      }
      ctx.restore();
    });

    // trend plot (right side)
    const plotX = w - 280;
    const plotY = pad + 80;
    const plotW = 240;
    const plotH = 280;

    ctx.save();
    ctx.strokeStyle = SIM.axis;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(plotX, plotY + plotH);
    ctx.lineTo(plotX + plotW, plotY + plotH);
    ctx.moveTo(plotX, plotY);
    ctx.lineTo(plotX, plotY + plotH);
    ctx.stroke();
    ctx.restore();

    label(ctx, info.label, plotX + plotW / 2, plotY - 10, info.color, 11, "center");

    // group trend lines
    const groups = [1, 2, 13, 14, 15, 16, 17, 18];
    groups.forEach((g) => {
      const pts = ELEMENTS.filter((e) => e.group === g && (e[trend] as number) > 0)
        .sort((a, b) => a.period - b.period);
      if (pts.length < 2) return;

      ctx.save();
      ctx.strokeStyle = g === highlightGroup ? SIM.white : "rgba(161,161,170,0.4)";
      ctx.lineWidth = g === highlightGroup ? 2.5 : 1.5;
      ctx.beginPath();
      pts.forEach((e, i) => {
        const px = plotX + (i / (pts.length - 1)) * plotW;
        const py = plotY + plotH - ((e[trend] as number - vMin) / (vMax - vMin)) * plotH;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      });
      ctx.stroke();
      if (g === highlightGroup) {
        ctx.fillStyle = SIM.white;
        ctx.font = "9px ui-monospace";
        ctx.textAlign = "left";
        ctx.fillText(`Group ${g}`, plotX + plotW + 6, plotY + 10);
      }
      ctx.restore();
    });

    label(ctx, "Period →", plotX + plotW / 2, plotY + plotH + 20, SIM.dim, 9, "center");
    label(ctx, info.unit ? `${info.unit} ↑` : "Value ↑", plotX - 10, plotY + plotH / 2, SIM.dim, 9, "center");
    label(ctx, info.desc, w / 2, h - 14, SIM.dim, 10, "center");
  });

  return (
    <SimFrame
      title="Periodic trends explorer"
      about="Visualise atomic radius, electronegativity, IE and EA across the periodic table"
      height={420}
      canvas={<canvas ref={canvasRef} />}
      controls={
        <SimControls>
          <SimToggleGroup
            label="Property"
            value={trend}
            options={[
              { value: "radius", label: "Radius" },
              { value: "en", label: "EN" },
              { value: "ie", label: "IE" },
              { value: "ea", label: "EA" },
            ]}
            onChange={(v) => setTrend(v as Trend)}
          />
          <LabeledSlider label="Highlight group (0=all)" value={highlightGroup} min={0} max={18} step={1} decimals={0} onChange={setHighlightGroup} color="#E6C384" />
          <LabeledSlider label="Highlight period (0=all)" value={highlightPeriod} min={0} max={7} step={1} decimals={0} onChange={setHighlightPeriod} color="#7FB4CA" />
        </SimControls>
      }
      readouts={
        <>
          <Readout label="Trend" value={info.label} color={info.color} />
          <Readout label="Range" value={`${vMin.toFixed(1)} – ${vMax.toFixed(1)} ${info.unit}`} />
        </>
      }
    />
  );
}