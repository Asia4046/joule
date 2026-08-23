"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useTheme } from "@mui/material/styles";
import { J } from "@/lib/jellybeans";

export type CalendarEventKind = "study" | "test" | "revision" | "journal" | "goal";

export type CalendarEvent = {
  kind: CalendarEventKind;
  date: string; // yyyy-mm-dd
  label: string;
};

const KIND_BEAN: Record<CalendarEventKind, { fill: string; deep: string }> = {
  study: J.bean.sky,
  test: J.bean.cherry,
  revision: J.bean.lemon,
  journal: J.bean.lavender,
  goal: J.bean.mint,
};

const KIND_LABEL: Record<CalendarEventKind, string> = {
  study: "Study",
  test: "Mock test",
  revision: "Revision due",
  journal: "Journal",
  goal: "Goal deadline",
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const monthTitle = (year: number, month: number) =>
  new Date(year, month, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

const iso = (year: number, month: number) => `${String(year).padStart(4, "0")}-${String(month + 1).padStart(2, "0")}`;

export default function MonthView({
  year,
  month,
  events,
  weekStartsOn = 0,
}: {
  year: number;
  month: number; // 0-indexed
  events: CalendarEvent[];
  weekStartsOn?: 0 | 1; // 0 = Sunday, 1 = Monday
}) {
  const router = useRouter();
  const theme = useTheme();
  const dark = theme.palette.mode === "dark";
  const kindColor = (k: CalendarEventKind) => (dark ? KIND_BEAN[k].fill : KIND_BEAN[k].deep);

  const byDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of events) {
      const list = map.get(e.date);
      if (list) list.push(e);
      else map.set(e.date, [e]);
    }
    return map;
  }, [events]);

  const cells = useMemo(() => {
    const first = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const lead = (first.getDay() - weekStartsOn + 7) % 7;
    const out: ({ day: number; key: string } | null)[] = Array.from({ length: lead }, () => null);
    for (let d = 1; d <= daysInMonth; d++) {
      out.push({ day: d, key: `${iso(year, month)}-${String(d).padStart(2, "0")}` });
    }
    while (out.length % 7 !== 0) out.push(null);
    return out;
  }, [year, month, weekStartsOn]);

  const go = (delta: number) => {
    const d = new Date(year, month + delta, 1);
    router.push(`/calendar?month=${iso(d.getFullYear(), d.getMonth())}`);
  };

  const todayKey = (() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
  })();

  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}>
          <Typography variant="h6">{monthTitle(year, month)}</Typography>
          <Stack direction="row" spacing={0.5}>
            <IconButton size="small" aria-label="Previous month" onClick={() => go(-1)}>
              <ChevronLeftIcon />
            </IconButton>
            <Button size="small" onClick={() => router.push("/calendar")}>
              Today
            </Button>
            <IconButton size="small" aria-label="Next month" onClick={() => go(1)}>
              <ChevronRightIcon />
            </IconButton>
          </Stack>
        </Stack>

        {/* legend */}
        <Stack direction="row" spacing={1.5} sx={{ mb: 1.5, flexWrap: "wrap", gap: 1 }}>
          {(Object.keys(KIND_BEAN) as CalendarEventKind[]).map((k) => (
            <Stack key={k} direction="row" spacing={0.5} alignItems="center">
              <Box sx={{ width: 8, height: 8, borderRadius: 999, bgcolor: kindColor(k) }} />
              <Typography variant="caption" color="text.secondary">
                {KIND_LABEL[k]}
              </Typography>
            </Stack>
          ))}
        </Stack>

        {/* weekday header + day grid */}
        <Box
          role="grid"
          aria-label={`${monthTitle(year, month)} calendar`}
          sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}
        >
          {[...WEEKDAYS.slice(weekStartsOn), ...WEEKDAYS.slice(0, weekStartsOn)].map((w) => (
            <Typography key={w} variant="caption" color="text.secondary" sx={{ textAlign: "center", fontWeight: 600, py: 0.5 }} component="div" role="columnheader">
              {w}
            </Typography>
          ))}
          {cells.map((cell, i) => {
            if (cell == null) return <Box key={`empty-${i}`} role="gridcell" aria-hidden />;
            const dayEvents = byDate.get(cell.key) ?? [];
            const isToday = cell.key === todayKey;
            return (
              <Box
                key={cell.key}
                role="gridcell"
                aria-label={`${cell.day} ${monthTitle(year, month)}${dayEvents.length ? ` — ${dayEvents.length} event${dayEvents.length > 1 ? "s" : ""}` : ""}`}
                sx={{
                  minHeight: { xs: 52, sm: 72 },
                  border: "1px solid",
                  borderColor: isToday ? "primary.main" : "divider",
                  borderRadius: 0,
                  p: 0.75,
                  bgcolor: isToday ? "rgba(255,255,255,0.08)" : "transparent",
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.5,
                  overflow: "hidden",
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: isToday ? 700 : 500, textAlign: "right" }}>
                  {cell.day}
                </Typography>
                <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap", gap: 0.5 }}>
                  {dayEvents.slice(0, 3).map((e, j) => (
                    <Tooltip key={`${e.label}-${j}`} title={`${KIND_LABEL[e.kind]} · ${e.label}`}>
                      <Box sx={{ width: 7, height: 7, borderRadius: 999, bgcolor: kindColor(e.kind) }} />
                    </Tooltip>
                  ))}
                  {dayEvents.length > 3 && (
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.625rem", lineHeight: 1 }}>
                      +{dayEvents.length - 3}
                    </Typography>
                  )}
                </Stack>
              </Box>
            );
          })}
        </Box>

        {events.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 3 }}>
            Nothing scheduled this month. Log sessions, tests or journal entries and they&apos;ll show up here.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
