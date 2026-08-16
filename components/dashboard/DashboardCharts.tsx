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
          <defs>
            <linearGradient id="jeeBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity={1} />
              <stop offset="100%" stopColor={theme.palette.primary.main} stopOpacity={0.35} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 6" stroke={theme.palette.divider} vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: theme.palette.text.secondary }} interval={4} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} unit="h" />
          <Tooltip
            cursor={{ fill: theme.palette.action.hover, radius: 4 }}
            formatter={(v) => [`${v}h`, "Studied"]}
            labelFormatter={(label) => `Day ${label}`}
            contentStyle={{
              background: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 10,
              fontSize: 12,
              boxShadow: "0 8px 24px rgba(0,0,0,.12)",
            }}
          />
          <Bar dataKey="hours" fill="url(#jeeBarGrad)" radius={[4, 4, 0, 0]} maxBarSize={16} />
        </BarChart>
      </ResponsiveContainer>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center" }}>
        Daily study hours — last 30 days
      </Typography>
    </div>
  );
}
