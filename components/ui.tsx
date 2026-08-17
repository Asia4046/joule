"use client";

import Link from "next/link";
import Button, { type ButtonProps } from "@mui/material/Button";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import { useTheme, alpha, type Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

/** Shared Recharts tooltip contentStyle — Paper & Ink hard-shadow tile. */
export function chartTooltipStyle(theme: Theme) {
  return {
    background: theme.palette.background.paper,
    border: `1.5px solid ${theme.palette.text.primary}`,
    boxShadow: `3px 3px 0 ${theme.palette.text.primary}`,
    borderRadius: 0,
    fontSize: 12,
  };
}

/** Button that navigates — safe to render from Server Components (no function props cross the boundary). */
export function LinkButton({ href, children, ...rest }: { href: string; children: ReactNode } & ButtonProps) {
  return (
    <Button component={Link} href={href} {...rest}>
      {children}
    </Button>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", sm: "center" }}
      spacing={1.5}
      sx={{ mb: 3 }}
    >
      <Box>
        <Box sx={{ width: 12, height: 12, bgcolor: "#D97757", border: "1.5px solid currentColor", color: "text.primary", mb: 1.25 }} aria-hidden />
        <Typography variant="h4" component="h1">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action}
    </Stack>
  );
}

export function StatCard({
  label,
  value,
  sub,
  icon,
  color,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  icon?: ReactNode;
  color?: string;
}) {
  const theme = useTheme();
  const c = color ?? (theme.palette.mode === "dark" ? "#DE8468" : "#C05C3C");
  return (
    <Card
      sx={{
        height: "100%",
        position: "relative",
        overflow: "hidden",
        "&:hover": {
          transform: "translate(-2px,-2px)",
          boxShadow:
            theme.palette.mode === "dark"
              ? "6px 6px 0 #000"
              : "5px 5px 0 rgba(31,30,29,0.16)",
        },
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Stack direction="row" alignItems="flex-start" spacing={1.5}>
          {icon && (
            <Box
              sx={{
                width: 38,
                height: 38,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: alpha(c, theme.palette.mode === "dark" ? 0.22 : 0.14),
                border: `1.5px solid ${c}`,
                color: c,
                flexShrink: 0,
              }}
            >
              {icon}
            </Box>
          )}
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: "block", letterSpacing: "0.08em", textTransform: "uppercase", fontSize: "0.66rem" }}>
              {label}
            </Typography>
            <Typography
              variant="h5"
              className="jee-num"
              sx={{ mt: 0.25, fontSize: "1.4rem", fontWeight: 600, letterSpacing: "-0.02em" }}
            >
              {value}
            </Typography>
            {sub && (
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
                {sub}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export function ProgressRing({
  value,
  size = 56,
  thickness = 6,
  label,
}: {
  value: number;
  size?: number;
  thickness?: number;
  label?: ReactNode;
}) {
  const theme = useTheme();
  return (
    <Box sx={{ position: "relative", display: "inline-flex" }}>
      <CircularProgress
        variant="determinate"
        value={100}
        size={size}
        thickness={thickness}
        sx={{ position: "absolute", left: 0, color: theme.palette.action.hover }}
      />
      <CircularProgress
        variant="determinate"
        value={Math.min(100, Math.max(0, value))}
        size={size}
        thickness={thickness}
        sx={{ color: theme.palette.primary.main, "& .MuiCircularProgress-circle": { strokeLinecap: "butt" } }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 700 }}>
          {label ?? `${Math.round(value)}%`}
        </Typography>
      </Box>
    </Box>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  const theme = useTheme();
  return (
    <Card>
      <CardContent sx={{ py: 6, textAlign: "center" }}>
        {icon && (
          <Box
            sx={{
              width: 56,
              height: 56,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 1.5,
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              border: `1.5px solid ${theme.palette.primary.main}`,
              color: theme.palette.mode === "dark" ? theme.palette.primary.light : theme.palette.primary.dark,
            }}
          >
            {icon}
          </Box>
        )}
        <Typography variant="h6">{title}</Typography>
        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 420, mx: "auto" }}>
            {description}
          </Typography>
        )}
        {action && <Box sx={{ mt: 2.5 }}>{action}</Box>}
      </CardContent>
    </Card>
  );
}

export function LoadingGrid({ rows = 3 }: { rows?: number }) {
  return (
    <Stack spacing={2}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} variant="rectangular" height={90} />
      ))}
    </Stack>
  );
}

/** GitHub-style study consistency heatmap in terracotta steps. Data: [{date: yyyy-mm-dd, minutes}] */
export function StudyHeatmap({ data }: { data: { date: string; minutes: number }[] }) {
  const levels = ["#EADFD7", "#E0BFAE", "#D97757", "#B4552F", "#7F3A1F"];
  const levelFor = (m: number) => (m === 0 ? 0 : m < 60 ? 1 : m < 150 ? 2 : m < 270 ? 3 : 4);

  // group into weeks (columns)
  const weeks: { date: string; minutes: number }[][] = [];
  let week: { date: string; minutes: number }[] = [];
  data.forEach((d, i) => {
    const dow = new Date(d.date + "T00:00:00").getDay();
    if (i === 0 && dow > 0) for (let k = 0; k < dow; k++) week.push({ date: "", minutes: -1 });
    week.push(d);
    if (dow === 6) {
      weeks.push(week);
      week = [];
    }
  });
  if (week.length) weeks.push(week);

  return (
    <Box sx={{ overflowX: "auto", pb: 0.5 }}>
      <Stack direction="row" spacing="3px" sx={{ width: "max-content" }}>
        {weeks.map((w, wi) => (
          <Stack key={wi} spacing="3px">
            {w.map((d, di) =>
              d.minutes < 0 ? (
                <Box key={di} sx={{ width: 11, height: 11 }} />
              ) : (
                <Tooltip
                  key={di}
                  title={`${new Date(d.date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}: ${d.minutes ? `${Math.round(d.minutes / 6) / 10}h` : "no study"}`}
                >
                  <Box
                    sx={{
                      width: 11,
                      height: 11,
                      bgcolor: levels[levelFor(d.minutes)],
                      outline: "0.5px solid rgba(31,30,29,0.18)",
                      outlineOffset: "-0.5px",
                      transition: "transform .12s ease",
                      "&:hover": { transform: "scale(1.35)" },
                    }}
                  />
                </Tooltip>
              )
            )}
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
