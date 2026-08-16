"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useTheme } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import { SUBJECT_COLORS } from "@/lib/constants";

type TrendPoint = {
  name: string;
  scorePct: number;
  percentile?: number | null;
  accuracy?: number | null;
  physics?: number | null;
  chemistry?: number | null;
  maths?: number | null;
};

const tooltipStyle = (theme: Theme) => ({
  background: theme.palette.background.paper,
  border: `1.5px solid ${theme.palette.text.primary}`,
  boxShadow: `3px 3px 0 ${theme.palette.text.primary}`,
  borderRadius: 0,
  fontSize: 12,
});

export default function MockAnalyticsCharts({
  trend,
  attempts,
  negatives,
}: {
  trend: TrendPoint[];
  attempts: { name: string; correct: number; incorrect: number; skipped: number }[];
  negatives: { name: string; negative: number }[];
}) {
  const theme = useTheme();
  const hasNegatives = negatives.some((n) => n.negative > 0);

  const labelFor = (i: number) => `Test ${i + 1}`;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} lg={8}>
        <Card>
          <CardContent>
            <Typography variant="h6">Score & percentile progression</Typography>
            <div style={{ width: "100%", height: 280, marginTop: 12 }}>
              <ResponsiveContainer>
                <LineChart data={trend.map((t, i) => ({ ...t, label: labelFor(i) }))} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle(theme)} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="scorePct" name="Score %" stroke={theme.palette.primary.main} strokeWidth={2} dot={{ r: 3 }} />
                  {trend.some((t) => t.percentile != null) && (
                    <Line type="monotone" dataKey="percentile" name="Percentile" stroke={theme.palette.success.main} strokeWidth={2} dot={{ r: 3 }} />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} lg={4}>
        <Card>
          <CardContent>
            <Typography variant="h6">Accuracy trend</Typography>
            <div style={{ width: "100%", height: 280, marginTop: 12 }}>
              <ResponsiveContainer>
                <LineChart data={trend.map((t, i) => ({ ...t, label: labelFor(i) }))} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={tooltipStyle(theme)} />
                  <Line type="monotone" dataKey="accuracy" name="Accuracy %" stroke={theme.palette.warning.main} strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} lg={7}>
        <Card>
          <CardContent>
            <Typography variant="h6">Subject performance (per-test %)</Typography>
            <div style={{ width: "100%", height: 280, marginTop: 12 }}>
              <ResponsiveContainer>
                <LineChart data={trend.map((t, i) => ({ ...t, label: labelFor(i) }))} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle(theme)} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="physics" name="Physics" stroke={SUBJECT_COLORS.Physics} strokeWidth={2} dot={{ r: 2 }} connectNulls />
                  <Line type="monotone" dataKey="chemistry" name="Chemistry" stroke={SUBJECT_COLORS.Chemistry} strokeWidth={2} dot={{ r: 2 }} connectNulls />
                  <Line type="monotone" dataKey="maths" name="Maths" stroke={SUBJECT_COLORS.Mathematics} strokeWidth={2} dot={{ r: 2 }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} lg={5}>
        <Card>
          <CardContent>
            <Typography variant="h6">Attempt breakdown</Typography>
            <div style={{ width: "100%", height: 280, marginTop: 12 }}>
              <ResponsiveContainer>
                <BarChart data={attempts.map((a, i) => ({ ...a, label: labelFor(i) }))} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle(theme)} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="correct" name="Correct" stackId="a" fill={theme.palette.success.main} radius={[0, 0, 0, 0]} maxBarSize={26} />
                  <Bar dataKey="incorrect" name="Incorrect" stackId="a" fill={theme.palette.error.main} maxBarSize={26} />
                  <Bar dataKey="skipped" name="Skipped" stackId="a" fill={theme.palette.action.disabled} radius={[0, 0, 0, 0]} maxBarSize={26} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {hasNegatives && (
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                Negative marks total: {negatives.reduce((s, n) => s + n.negative, 0).toFixed(0)} across {negatives.length} tests
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
