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
import { alpha } from "@mui/material/styles";

export type CalendarEventKind = "study" | "test" | "revision" | "journal" | "goal";

export type CalendarEvent = {
  kind: CalendarEventKind;
  date: string; // yyyy-mm-dd
  label: string;
};

const KIND_COLOR: Record<CalendarEventKind, string> = {
  study: "#C05C3C", // rust
  test: "#BF4B4B", // error
  revision: "#C77D2E", // ochre
  journal: "#8A7CA8", // muted violet
  goal: "#43806B", // sage
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
}: {
  year: number;
  month: number; // 0-indexed
  events: CalendarEvent[];
}) {
  const router = useRouter();

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
    const lead = first.getDay();
    const out: ({ day: number; key: string } | null)[] = Array.from({ length: lead }, () => null);
    for (let d = 1; d <= daysInMonth; d++) {
      out.push({ day: d, key: `${iso(year, month)}-${String(d).padStart(2, "0")}` });
    }
    while (out.length % 7 !== 0) out.push(null);
    return out;
  }, [year, month]);

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
          {(Object.keys(KIND_COLOR) as CalendarEventKind[]).map((k) => (
            <Stack key={k} direction="row" spacing={0.5} alignItems="center">
              <Box sx={{ width: 8, height: 8, bgcolor: KIND_COLOR[k] }} />
              <Typography variant="caption" color="text.secondary">
                {KIND_LABEL[k]}
              </Typography>
            </Stack>
          ))}
        </Stack>

        {/* weekday header */}
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
          {WEEKDAYS.map((w) => (
            <Typography key={w} variant="caption" color="text.secondary" sx={{ textAlign: "center", fontWeight: 600, py: 0.5 }}>
              {w}
            </Typography>
          ))}
          {cells.map((cell, i) => {
            if (cell == null) return <Box key={`empty-${i}`} />;
            const dayEvents = byDate.get(cell.key) ?? [];
            const isToday = cell.key === todayKey;
            return (
              <Box
                key={cell.key}
                sx={{
                  minHeight: { xs: 52, sm: 72 },
                  border: "1px solid",
                  borderColor: isToday ? "primary.main" : "divider",
                  borderRadius: 0,
                  p: 0.75,
                  bgcolor: isToday ? alpha("#D97757", 0.1) : "transparent",
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
                      <Box sx={{ width: 7, height: 7, bgcolor: KIND_COLOR[e.kind] }} />
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
      </CardContent>
    </Card>
  );
}
