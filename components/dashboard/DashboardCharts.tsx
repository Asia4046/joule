"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { chartAxisTick, chartGridProps, chartTooltipStyle } from "@/components/ui";

type SessionLite = { startedAt: string; durationMinutes: number; subject: string };

const dayKey = (d: string) => d.slice(0, 10);

export default function DashboardCharts({ sessions }: { sessions: SessionLite[] }) {
  const theme = useTheme();

  const byDay = new Map<string, number>();
  for (const s of sessions) byDay.set(dayKey(s.startedAt), (byDay.get(dayKey(s.startedAt)) ?? 0) + s.durationMinutes);

  const data: { label: string; hours: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    data.push({
      label: d.toLocaleDateString("en-IN", { day: "numeric" }),
      hours: Math.round(((byDay.get(key) ?? 0) / 60) * 10) / 10,
    });
  }

  return (
    <div style={{ width: "100%", height: 220 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <CartesianGrid {...chartGridProps(theme)} />
          <XAxis dataKey="label" tick={chartAxisTick(theme)} interval={4} axisLine={false} tickLine={false} />
          <YAxis tick={chartAxisTick(theme)} axisLine={false} tickLine={false} unit="h" />
          <Tooltip
            cursor={{ fill: theme.palette.action.hover }}
            formatter={(v) => [`${v}h`, "Studied"]}
            labelFormatter={(label) => `Day ${label}`}
            contentStyle={chartTooltipStyle(theme)}
          />
          <Bar dataKey="hours" fill={theme.palette.success.main} radius={[0, 0, 0, 0]} maxBarSize={16} />
        </BarChart>
      </ResponsiveContainer>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center" }}>
        Daily study hours — last 30 days
      </Typography>
    </div>
  );
}
