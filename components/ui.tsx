"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Button, { type ButtonProps } from "@mui/material/Button";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import LinearProgress from "@mui/material/LinearProgress";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import { useTheme, alpha, type Theme } from "@mui/material/styles";
import { useEffect, useState, type ReactNode } from "react";
import { J, HEAT_LIGHT, HEAT_DARK, withA, type Bean } from "@/lib/jellybeans";
import { sectionIndexFor } from "@/lib/nav";

/** Shared Recharts tooltip contentStyle — dossier tile. */
export function chartTooltipStyle(theme: Theme) {
  return {
    background: theme.palette.mode === "dark" ? J.railDark : J.cardLight,
    border: `1px solid ${theme.palette.mode === "dark" ? J.hairDarkStrong : J.inkLight}`,
    boxShadow: "none",
    borderRadius: 2,
    fontSize: 12,
  };
}

/** Shared Recharts axis tick styling. */
export function chartAxisTick(theme: Theme) {
  return { fontSize: 12, fill: theme.palette.text.secondary };
}

/** Shared Recharts CartesianGrid props — hairline horizontal rules. */
export function chartGridProps(theme: Theme) {
  return { strokeDasharray: "3 3", stroke: theme.palette.divider, vertical: false };
}

/**
 * Eased count from 0 to `to` on mount (rAF, easeOutExpo). Under
 * prefers-reduced-motion it lands on the value immediately. Only numbers —
 * formatting stays with the caller.
 */
export function useCountUp(to: number, duration = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot sync: skip animation entirely
      setV(to);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setV(to * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);
  return v;
}

const fmtCountDuration = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m ? `${h}h ${m}m` : `${h}h`;
};

/**
 * Stat value that prints its number like a meter reading — 0 → value on mount.
 * Server-Component friendly: props are serializable only.
 */
export function CountUp({
  to,
  decimals = 0,
  maxDecimals,
  prefix = "",
  suffix = "",
  /** "duration" renders minutes as "3h 20m" while counting. */
  mode = "number",
}: {
  to: number;
  /** Minimum fraction digits (keeps a fixed "87.50" percentile reading). */
  decimals?: number;
  /** Maximum fraction digits — defaults to `decimals`. */
  maxDecimals?: number;
  prefix?: string;
  suffix?: string;
  mode?: "number" | "duration";
}) {
  const v = useCountUp(to);
  const text =
    mode === "duration"
      ? fmtCountDuration(v)
      : v.toLocaleString("en-IN", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: maxDecimals ?? decimals,
        });
  return <span className="jee-num">{`${prefix}${text}${suffix}`}</span>;
}

/**
 * Determinate progress bar that fills from 0 on mount instead of rendering
 * at its final width. Same candy pill as the theme's MuiLinearProgress.
 */
export function Bar({
  value,
  height = 6,
  color,
  sx,
}: {
  value: number;
  height?: number;
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info" | "inherit";
  sx?: object;
}) {
  const v = useCountUp(Math.min(100, Math.max(0, value)), 1100);
  return <LinearProgress variant="determinate" value={v} color={color} sx={{ height, ...sx }} />;
}

/** Button that navigates — safe to render from Server Components (no function props cross the boundary). */
export function LinkButton({ href, children, ...rest }: { href: string; children: ReactNode } & ButtonProps) {
  return (
    <Button component={Link} href={href} {...rest}>
      {children}
    </Button>
  );
}

/**
 * Dossier page header — mono section index ("03 // PRACTICE") with the
 * section's bean, a Space Grotesk title, and a ghosted outlined sheet
 * numeral floating right; a dashed perforation tears the header off from
 * the content below.
 */
export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  const pathname = usePathname();
  const theme = useTheme();
  const dark = theme.palette.mode === "dark";
  const meta = sectionIndexFor(pathname);
  const bean = meta ? J.bean[meta.bean] : J.bean.bubblegum;
  const beanColor = dark ? bean.fill : bean.deep;
  const ink = dark ? J.boneDark : J.inkLight;

  return (
    <Box sx={{ position: "relative", mb: 3.5 }}>
      {meta && (
        <Typography
          aria-hidden
          sx={{
            position: "absolute",
            top: "-0.35em",
            right: 0,
            zIndex: 0,
            fontFamily: "var(--font-display), sans-serif",
            fontWeight: 700,
            fontSize: { xs: "4.5rem", md: "7rem" },
            lineHeight: 1,
            letterSpacing: "-0.04em",
            color: "transparent",
            WebkitTextStroke: `1.5px ${withA(ink, dark ? 0.14 : 0.2)}`,
            userSelect: "none",
            pointerEvents: "none",
          }}
        >
          {meta.index}
        </Typography>
      )}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={1.5}
        sx={{ position: "relative", zIndex: 1, pb: 2.5, borderBottom: "1px dashed", borderBottomColor: "divider" }}
      >
        <Box>
          {meta && (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
              <Box
                sx={{ width: 9, height: 9, borderRadius: 999, bgcolor: beanColor }}
                aria-hidden
              />
              <Typography
                className="jee-mono"
                sx={{ fontSize: "0.64rem", fontWeight: 700, letterSpacing: "0.16em", color: beanColor, textTransform: "uppercase" }}
              >
                {`${meta.index} // ${meta.section}`}
              </Typography>
            </Stack>
          )}
          <Typography variant="h4" component="h1" sx={{ fontSize: { xs: "1.4rem", sm: "1.65rem" }, letterSpacing: "-0.03em" }}>
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
    </Box>
  );
}

export function StatCard({
  label,
  value,
  sub,
  icon,
  color,
  bean,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  icon?: ReactNode;
  color?: string;
  /** Bean pair (e.g. a subject) — resolved mode-aware; overrides `color`. */
  bean?: Bean;
}) {
  const theme = useTheme();
  const dark = theme.palette.mode === "dark";
  const c = bean
    ? dark
      ? bean.fill
      : bean.deep
    : color ?? (dark ? J.bean.bubblegum.fill : J.bean.bubblegum.deep);
  return (
    <Card
      sx={{
        height: "100%",
        position: "relative",
        overflow: "hidden",
        "&:hover": {
          transform: "translate(-2px,-2px)",
          boxShadow: dark ? "4px 4px 0 rgba(0,0,0,0.85)" : "4px 4px 0 rgba(34,31,26,0.16)",
          borderColor: dark ? J.hairDarkStrong : "#CFC7B4",
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
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: alpha(c, dark ? 0.2 : 0.14),
                border: `1.5px solid ${c}`,
                color: c,
                flexShrink: 0,
              }}
            >
              {icon}
            </Box>
          )}
          <Box sx={{ minWidth: 0 }}>
            <Typography
              className="jee-mono"
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 700, display: "block", letterSpacing: "0.14em", textTransform: "uppercase", fontSize: "0.62rem" }}
            >
              {label}
            </Typography>
            <Typography
              variant="h5"
              className="jee-display jee-num"
              sx={{ mt: 0.25, fontSize: "1.4rem", fontWeight: 700, letterSpacing: "-0.02em" }}
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
  // sweep in from zero on mount — the needle winds up like a gauge
  const v = useCountUp(Math.min(100, Math.max(0, value)), 1000);
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
        value={v}
        size={size}
        thickness={thickness}
        sx={{ color: theme.palette.secondary.main, "& .MuiCircularProgress-circle": { strokeLinecap: "butt" } }}
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
          {label ?? `${Math.round(v)}%`}
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
  const dark = theme.palette.mode === "dark";
  const accent = dark ? J.bean.bubblegum.fill : J.bean.bubblegum.deep;
  return (
    <Card sx={{ outline: "1px dashed", outlineColor: "divider", outlineOffset: -8 }}>
      <CardContent sx={{ py: 6, textAlign: "center" }}>
        {icon && (
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 1.5,
              bgcolor: alpha(accent, 0.12),
              border: `1.5px solid ${accent}`,
              color: accent,
            }}
          >
            {icon}
          </Box>
        )}
        <Typography
          className="jee-mono"
          sx={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.18em", color: "text.secondary", textTransform: "uppercase" }}
        >
          No records on file
        </Typography>
        <Typography variant="h6" sx={{ mt: 0.5 }}>{title}</Typography>
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
        <Skeleton key={i} variant="rectangular" height={90} sx={{ borderRadius: 2 }} />
      ))}
    </Stack>
  );
}

/** Heatmap ramp legend — mint bean scale, mode-aware. */
export function HeatLegend() {
  const theme = useTheme();
  const levels = theme.palette.mode === "dark" ? HEAT_DARK : HEAT_LIGHT;
  return (
    <Stack direction="row" spacing={0.75} alignItems="center">
      <Typography variant="caption" color="text.secondary">Less</Typography>
      {levels.map((c) => (
        <Box key={c} sx={{ width: 11, height: 11, borderRadius: 1, bgcolor: c, outline: "0.5px solid rgba(34,31,26,0.14)", outlineOffset: "-0.5px" }} />
      ))}
      <Typography variant="caption" color="text.secondary">More</Typography>
    </Stack>
  );
}

/** GitHub-style study consistency heatmap on the mint-bean ramp. Data: [{date: yyyy-mm-dd, minutes}] */
export function StudyHeatmap({ data }: { data: { date: string; minutes: number }[] }) {
  const theme = useTheme();
  const levels = theme.palette.mode === "dark" ? HEAT_DARK : HEAT_LIGHT;
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
                      borderRadius: 1,
                      bgcolor: levels[levelFor(d.minutes)],
                      outline: "0.5px solid rgba(34,31,26,0.16)",
                      outlineOffset: "-0.5px",
                      transition: "transform .12s ease",
                      "&:hover": { transform: "scale(1.35)" },
                      // print-in: weeks stamp onto the paper column by column
                      animation: "jee-print .4s cubic-bezier(0.22, 1, 0.36, 1) both",
                      animationDelay: `${wi * 24}ms`,
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
