"use client";

import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Button from "@mui/material/Button";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useTheme, alpha } from "@mui/material/styles";
import type { ReactNode } from "react";

/** Compact labelled slider used by every simulation's control strip. */
export function LabeledSlider({
  label,
  value,
  min,
  max,
  step = 0.01,
  unit = "",
  decimals = 2,
  onChange,
  color,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  decimals?: number;
  onChange: (v: number) => void;
  color?: string;
}) {
  const theme = useTheme();
  const c = color ?? theme.palette.primary.main;
  return (
    <Box sx={{ minWidth: 170, flex: "1 1 170px" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 0.25 }}>
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            fontFamily: "ui-monospace, Menlo, monospace",
            fontWeight: 700,
            color: c,
            bgcolor: alpha(c, 0.1),
            px: 0.75,
            borderRadius: 0,
          }}
        >
          {value.toFixed(decimals)}
          {unit}
        </Typography>
      </Stack>
      <Slider
        size="small"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(_, v) => onChange(Array.isArray(v) ? v[0] : v)}
        sx={{
          color: c,
          "& .MuiSlider-thumb": { width: 12, height: 12 },
          "& .MuiSlider-track": { border: "none" },
          mr: 0.5,
        }}
      />
    </Box>
  );
}

/** Live value chip shown under the sim panel. */
export function Readout({ label, value, color }: { label: string; value: ReactNode; color?: string }) {
  const theme = useTheme();
  const c = color ?? theme.palette.text.primary;
  return (
    <Box
      sx={{
        borderRadius: 0,
        border: `1px solid ${alpha(c, 0.35)}`,
        bgcolor: alpha(c, 0.06),
        px: 1.5,
        py: 1,
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
        {label}
      </Typography>
      <Typography sx={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: "0.85rem", fontWeight: 700, color: c }}>
        {value}
      </Typography>
    </Box>
  );
}

export function SimControls({ children }: { children: ReactNode }) {
  return (
    <Stack direction="row" flexWrap="wrap" gap={2.5} sx={{ alignItems: "flex-end" }}>
      {children}
    </Stack>
  );
}

export function SimToggleGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <Box>
      <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mb: 0.25 }}>
        {label}
      </Typography>
      <ToggleButtonGroup
        size="small"
        exclusive
        value={value}
        onChange={(_, v) => v && onChange(v)}
      >
        {options.map((o) => (
          <ToggleButton key={o.value} value={o.value} sx={{ px: 1.5, py: 0.25, fontSize: "0.72rem" }}>
            {o.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
}

export function ResetButton({ onClick }: { onClick: () => void }) {
  return (
    <Button size="small" variant="outlined" startIcon={<RestartAltIcon />} onClick={onClick}>
      Reset
    </Button>
  );
}
