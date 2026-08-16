"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { SUBJECTS, SUBJECT_COLORS } from "@/lib/constants";
import { deleteQuestionLogAction } from "@/app/actions/study";
import { EmptyState } from "@/components/ui";
import QuestionLogDialog from "./QuestionLogDialog";

type LogItem = {
  id: string;
  subject: string;
  chapterName: string | null;
  topic: string | null;
  total: number;
  correct: number;
  incorrect: number;
  difficulty: string;
  date: string;
};

const dayKey = (iso: string) => iso.slice(0, 10);

export default function QuestionsView({
  logs,
  chapters,
}: {
  logs: LogItem[];
  chapters: { id: string; name: string; subject: string }[];
}) {
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  const daily = useMemo(() => {
    const byDay = new Map<string, number>();
    for (const l of logs) byDay.set(dayKey(l.date), (byDay.get(dayKey(l.date)) ?? 0) + l.total);
    const out: { label: string; questions: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      out.push({
        label: d.toLocaleDateString("en-IN", { day: "numeric" }),
        questions: byDay.get(d.toISOString().slice(0, 10)) ?? 0,
      });
    }
    return out;
  }, [logs]);

  const accuracyTrend = useMemo(() => {
    const out: { label: string; accuracy: number | null }[] = [];
    const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
    const window: LogItem[] = [];
    for (const l of sorted) {
      window.push(l);
      while (window.length > 10) window.shift();
      const attempted = window.reduce((s, x) => s + x.correct + x.incorrect, 0);
      out.push({
        label: new Date(l.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        accuracy: attempted ? Math.round((window.reduce((s, x) => s + x.correct, 0) / attempted) * 1000) / 10 : null,
      });
    }
    return out.slice(-30);
  }, [logs]);

  const subjectDist = useMemo(
    () =>
      SUBJECTS.map((s) => ({
        name: s,
        value: logs.filter((l) => l.subject === s).reduce((sum, l) => sum + l.total, 0),
      })).filter((d) => d.value > 0),
    [logs]
  );

  const tooltipProps = {
    contentStyle: {
      background: theme.palette.background.paper,
      border: `1.5px solid ${theme.palette.text.primary}`,
      boxShadow: `3px 3px 0 ${theme.palette.text.primary}`,
      borderRadius: 0,
      fontSize: 12,
    },
  };

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <Card sx={{ flex: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>Daily questions — last 30 days</Typography>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <BarChart data={daily} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: theme.palette.text.secondary }} interval={4} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} />
                  <Tooltip {...tooltipProps} />
                  <Bar dataKey="questions" fill={theme.palette.primary.main} radius={[0, 0, 0, 0]} maxBarSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>Subject distribution</Typography>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={subjectDist} dataKey="value" nameKey="name" innerRadius={50} outerRadius={75} paddingAngle={3}>
                    {subjectDist.map((d) => (
                      <Cell key={d.name} fill={SUBJECT_COLORS[d.name]} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipProps} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </Stack>

      <Card sx={{ flex: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1 }}>Accuracy trend (10-log rolling)</Typography>
          <div style={{ width: "100%", height: 200 }}>
            <ResponsiveContainer>
              <LineChart data={accuracyTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip {...tooltipProps} />
                <Line type="monotone" dataKey="accuracy" stroke={theme.palette.success.main} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
            <Typography variant="h6">Recent logs ({logs.length})</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
              Log questions
            </Button>
          </Stack>
          {logs.length === 0 ? (
            <EmptyState
              title="Log your daily question count."
              description="Track solving volume and accuracy per subject to see real progress over time."
              action={<Button variant="contained" onClick={() => setOpen(true)}>Log questions</Button>}
            />
          ) : (
            <Stack divider={<Box sx={{ borderBottom: 1, borderColor: "divider" }} />} spacing={0}>
              {logs.slice(0, 50).map((l) => (
                <Stack key={l.id} direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1.25 }}>
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box sx={{ width: 8, height: 8, bgcolor: SUBJECT_COLORS[l.subject] ?? "#999" }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{l.chapterName ?? l.topic ?? l.subject}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {l.total} Q · {l.correct}✓ {l.incorrect}✗ · {Math.round((l.correct / Math.max(1, l.correct + l.incorrect)) * 100)}%
                      </Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(l.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · {l.difficulty}
                    </Typography>
                  </Box>
                  <form action={deleteQuestionLogAction}>
                    <input type="hidden" name="id" value={l.id} />
                    <IconButton size="small" aria-label="Delete log" type="submit">
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </form>
                </Stack>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      <QuestionLogDialog open={open} onClose={() => setOpen(false)} chapters={chapters} />
    </Stack>
  );
}
