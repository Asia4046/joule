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
          <CartesianGrid strokeDasharray="3 6" stroke={theme.palette.divider} vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: theme.palette.text.secondary }} interval={4} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} unit="h" />
          <Tooltip
            cursor={{ fill: theme.palette.action.hover }}
            formatter={(v) => [`${v}h`, "Studied"]}
            labelFormatter={(label) => `Day ${label}`}
            contentStyle={{
              background: theme.palette.background.paper,
              border: `1.5px solid ${theme.palette.text.primary}`,
              boxShadow: `3px 3px 0 ${theme.palette.text.primary}`,
              borderRadius: 0,
              fontSize: 12,
            }}
          />
          <Bar dataKey="hours" fill={theme.palette.primary.main} radius={[0, 0, 0, 0]} maxBarSize={16} />
        </BarChart>
      </ResponsiveContainer>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center" }}>
        Daily study hours — last 30 days
      </Typography>
    </div>
  );
}
