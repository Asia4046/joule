"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import { subjectColor } from "@/lib/constants";
import { chartAxisTick, chartGridProps, chartTooltipStyle } from "@/components/ui";

export default function PerformanceView({
  dailyMinutes,
  subjectDist,
  scoreTrendData,
  completedChapters,
}: {
  dailyMinutes: { label: string; hours: number }[];
  subjectDist: Record<string, number>;
  scoreTrendData: { name: string; scorePct: number; percentile?: number | null }[];
  completedChapters: number;
}) {
  const theme = useTheme();
  const dark = theme.palette.mode === "dark";
  const tooltipProps = {
    contentStyle: chartTooltipStyle(theme),
  };
  const pie = Object.entries(subjectDist)
    .filter(([, v]) => v > 0)
    .map(([name, minutes]) => ({ name, value: Math.round((minutes / 60) * 10) / 10 }));
  const pieTotal = pie.reduce((s, p) => s + p.value, 0);

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <Card sx={{ flex: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>Daily study hours</Typography>
            <div style={{ width: "100%", height: 240 }}>
              <ResponsiveContainer>
                <BarChart data={dailyMinutes} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid {...chartGridProps(theme)} />
                  <XAxis dataKey="label" tick={chartAxisTick(theme)} interval={Math.max(0, Math.floor(dailyMinutes.length / 10) - 1)} axisLine={false} tickLine={false} />
                  <YAxis tick={chartAxisTick(theme)} axisLine={false} tickLine={false} unit="h" />
                  <Tooltip {...tooltipProps} />
                  <Bar dataKey="hours" fill={theme.palette.success.main} radius={[0, 0, 0, 0]} maxBarSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>Subject balance (hours)</Typography>
            {pie.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No sessions in this range.</Typography>
            ) : (
              <div style={{ width: "100%", height: 240 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={pie} dataKey="value" nameKey="name" innerRadius={50} outerRadius={75} paddingAngle={3}>
                      {pie.map((d) => (
                        <Cell key={d.name} fill={subjectColor(d.name, dark)} />
                      ))}
                    </Pie>
                    <Tooltip {...tooltipProps} />
                    <Legend wrapperStyle={{ fontSize: 12 }} formatter={(v) => `${v} — ${Math.round(((pie.find((p) => p.name === v)?.value ?? 0) / pieTotal) * 100)}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </Stack>

      <Card>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Mock score progression</Typography>
            <Typography variant="caption" color="text.secondary">{completedChapters} chapters completed</Typography>
          </Stack>
          {scoreTrendData.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              No mock tests recorded yet.
            </Typography>
          ) : (
            <div style={{ width: "100%", height: 240, marginTop: 12 }}>
              <ResponsiveContainer>
                <LineChart data={scoreTrendData.map((t, i) => ({ ...t, label: `Test ${i + 1}` }))} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid {...chartGridProps(theme)} />
                  <XAxis dataKey="label" tick={chartAxisTick(theme)} axisLine={false} tickLine={false} />
                  <YAxis tick={chartAxisTick(theme)} axisLine={false} tickLine={false} />
                  <Tooltip {...tooltipProps} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="scorePct" name="Score %" stroke={theme.palette.secondary.main} strokeWidth={2} dot={{ r: 3 }} />
                  {scoreTrendData.some((t) => t.percentile != null) && (
                    <Line type="monotone" dataKey="percentile" name="Percentile" stroke={theme.palette.success.main} strokeWidth={2} dot={{ r: 3 }} />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
