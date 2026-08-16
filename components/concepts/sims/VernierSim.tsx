"use client";

import { useRef, useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import SimFrame from "@/components/concepts/SimFrame";
import { Readout, SimControls, ResetButton } from "@/components/concepts/controls";
import { useCanvas, SIM, clearPanel, label } from "@/components/concepts/useCanvas";

/** Vernier calipers: drag the jaw onto the object, read MSR + VSD, check yourself. */
export default function VernierSim() {
  const [jaw, setJaw] = useState(50); // object width in 0.1mm steps... actual hidden target
  const [target, setTarget] = useState(() => 30 + Math.floor(Math.random() * 60)); // 0.1mm units
  const [showAnswer, setShowAnswer] = useState(false);
  const drag = useRef(false);

  const LC = 0.1; // mm
  const msd = Math.floor(target / 10); // main scale divisions (1mm each)
  const vsd = target % 10; // coinciding vernier division
  const reading = msd + vsd * LC;

  const canvasRef = useCanvas((ctx, w, h) => {
    clearPanel(ctx, w, h, false);
    const pad = 30;
    const y = h * 0.55;
    const scaleH = 26;

    // main scale (0 .. 100 mm mapped over width)
    const sx0 = pad + 40;
    const sx1 = w - pad - 60;
    const mmPx = (sx1 - sx0) / 100;

    ctx.save();
    ctx.strokeStyle = SIM.axis;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx0, y);
    ctx.lineTo(sx1, y);
    ctx.stroke();
    ctx.restore();

    // mm ticks + labels every 10
    ctx.save();
    ctx.strokeStyle = SIM.text;
    ctx.lineWidth = 1;
    for (let m = 0; m <= 100; m += 1) {
      const x = sx0 + m * mmPx;
      const big = m % 10 === 0;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y - (big ? 12 : 6));
      ctx.stroke();
      if (big) label(ctx, `${m}`, x, y + 14, SIM.dim, 9, "center");
    }
    ctx.restore();
    label(ctx, "mm", sx1 + 10, y - 10, SIM.dim, 10);

    // object (the thing measured)
    const objX = sx0;
    const objW = jaw * mmPx;
    ctx.save();
    ctx.fillStyle = "rgba(251,191,36,0.25)";
    ctx.strokeStyle = SIM.amber;
    ctx.lineWidth = 1.5;
    ctx.fillRect(objX, y - 54, objW, 30);
    ctx.strokeRect(objX, y - 54, objW, 30);
    ctx.restore();
    label(ctx, "object", objX + objW / 2, y - 62, SIM.amber, 10, "center");

    // fixed jaw at 0
    ctx.save();
    ctx.fillStyle = SIM.sky;
    ctx.fillRect(sx0 - 5, y - 58, 5, 64);
    ctx.restore();

    // vernier scale slides with jaw
    const vx = sx0 + jaw * mmPx;
    ctx.save();
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(vx, y - 4, 110, scaleH + 8);
    ctx.strokeStyle = SIM.panelEdge;
    ctx.strokeRect(vx, y - 4, 110, scaleH + 8);
    ctx.restore();
    // sliding jaw
    ctx.save();
    ctx.fillStyle = SIM.sky;
    ctx.fillRect(vx, y - 58, 5, 64);
    ctx.restore();
    // vernier ticks: 10 divisions spanning 9mm
    ctx.save();
    ctx.strokeStyle = SIM.green;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const x = vx + 5 + (i * 9 * mmPx) / 10;
      ctx.beginPath();
      ctx.moveTo(x, y + scaleH);
      ctx.lineTo(x, y + scaleH - (i % 5 === 0 ? 9 : 5));
      ctx.stroke();
    }
    ctx.restore();
    label(ctx, "vernier (9 mm / 10 div)", vx + 8, y + scaleH + 14, SIM.green, 9);

    if (showAnswer) {
      label(ctx, `Reading = MSR + (VSD × LC) = ${msd} + (${vsd} × 0.1) = ${reading.toFixed(1)} mm`, w / 2, 22, SIM.bright, 12, "center");
      const ok = Math.abs(jaw - target) <= 1;
      label(ctx, ok ? "✓ jaw matches the object" : "align the jaw to the object edge", w / 2, h - 14, ok ? SIM.green : SIM.red, 11, "center");
    } else {
      label(ctx, "drag the vernier jaw (slider) to touch the object's right edge", w / 2, 22, SIM.dim, 10, "center");
    }
  });

  const reveal = () => {
    setJaw(target);
    setShowAnswer(true);
  };
  const nextQ = () => {
    setTarget(30 + Math.floor(Math.random() * 60));
    setJaw(40);
    setShowAnswer(false);
  };

  return (
    <SimFrame
      title="Vernier calipers practice"
      about="LC = 1 MSD − 1 VSD = 0.1 mm · reading = MSR + coinciding VSD × LC"
      height={280}
      canvas={<canvas ref={canvasRef} />}
      action={
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="contained" onClick={reveal}>
            Check reading
          </Button>
          <Button size="small" variant="outlined" onClick={nextQ}>
            New object
          </Button>
        </Stack>
      }
      controls={
        <SimControls>
          <Box sx={{ flex: "1 1 260px" }}>
            <Readout label="Jaw position (your reading)" value={`${(jaw / 10).toFixed(1)} mm`} color="#38bdf8" />
          </Box>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={jaw}
            onChange={(e) => {
              setJaw(Number(e.target.value));
              setShowAnswer(false);
            }}
            style={{ flex: "2 1 200px", accentColor: "#38bdf8" }}
          />
          <ResetButton onClick={nextQ} />
        </SimControls>
      }
      readouts={
        <>
          <Readout label="Least count" value="0.1 mm" />
          {showAnswer ? (
            <>
              <Readout label="Main scale (MSR)" value={`${msd} mm`} />
              <Readout label="Coinciding VSD" value={`${vsd}`} color="#34d399" />
              <Readout label="True reading" value={`${reading.toFixed(1)} mm`} color="#34d399" />
            </>
          ) : (
            <Readout label="Hidden" value="check to reveal" color="#fbbf24" />
          )}
        </>
      }
    />
  );
}
