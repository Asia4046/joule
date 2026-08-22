"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { SUBJECTS, subjectColor } from "@/lib/constants";
import { chartTooltipStyle } from "@/components/ui";

type ChapterW = {
  id: string;
  name: string;
  subject: string;
  branch: string | null;
  avgQuestionsMain: number;
  avgQuestionsAdv: number;
  weightageMain: number;
  weightageAdv: number;
};

/** Word-wrap a chapter name into short lines for the chart's category axis. */
function wrapName(name: string, maxChars: number): string[] {
  const words = name.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if (cur && `${cur} ${w}`.length > maxChars) {
      lines.push(cur);
      cur = w;
    } else {
      cur = cur ? `${cur} ${w}` : w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

/** Chart tick that renders a chapter name word-wrapped onto 2–3 lines. */
function NameTick({
  x = 0,
  y = 0,
  payload,
  maxChars,
  fontSize,
  fill,
}: {
  x?: number;
  y?: number;
  payload?: { value?: string | number };
  maxChars: number;
  fontSize: number;
  fill: string;
}) {
  const lines = wrapName(String(payload?.value ?? ""), maxChars);
  const startDy = `${-((lines.length - 1) / 2) * 1.15}em`;
  return (
    <text x={x} y={y} textAnchor="end" fontSize={fontSize} fill={fill}>
      {lines.map((l, i) => (
        <tspan key={i} x={x} dy={i === 0 ? startDy : "1.15em"}>
          {l}
        </tspan>
      ))}
    </text>
  );
}

export default function WeightageView({ chapters }: { chapters: ChapterW[] }) {
  const [exam, setExam] = useState<"main" | "advanced">("main");
  const [subject, setSubject] = useState<number>(0); // 0 = All
  const theme = useTheme();
  const dark = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const tooltipProps = {
    contentStyle: chartTooltipStyle(theme),
  };

  const tableRows = useMemo(
    () =>
      chapters
        .filter((c) => subject === 0 || c.subject === SUBJECTS[subject - 1])
        .map((c) => ({
          ...c,
          w: exam === "main" ? c.weightageMain : c.weightageAdv,
          q: exam === "main" ? c.avgQuestionsMain : c.avgQuestionsAdv,
        }))
        .sort((a, b) => b.w - a.w),
    [chapters, subject, exam]
  );

  const chartData = useMemo(() => {
    const top = tableRows.filter((r) => r.w > 0).slice(0, 15);
    return top.map((c) => ({
      name: c.name,
      weightage: c.w,
      fill: subjectColor(c.subject, dark),
    }));
  }, [tableRows, dark]);

  const priorityFor = (w: number) => (w >= 5 ? "Very High" : w >= 3.5 ? "High" : w >= 2.5 ? "Medium" : w > 0 ? "Low" : "Not in syllabus");

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }} useFlexGap>
        <Chip label="JEE Main" onClick={() => setExam("main")} color={exam === "main" ? "primary" : "default"} variant={exam === "main" ? "filled" : "outlined"} />
        <Chip label="JEE Advanced" onClick={() => setExam("advanced")} color={exam === "advanced" ? "secondary" : "default"} variant={exam === "advanced" ? "filled" : "outlined"} />
      </Stack>

      <Tabs value={subject} onChange={(_, v: number) => setSubject(v)}>
        <Tab label="All" />
        {SUBJECTS.map((s) => (
          <Tab key={s} label={s} />
        ))}
      </Tabs>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Top chapters by weightage — {exam === "main" ? "JEE Main" : "JEE Advanced"} 2026
          </Typography>
          <div style={{ width: "100%", height: Math.max(96, chartData.length * (isMobile ? 48 : 30) + 12) }}>
            <ResponsiveContainer>
              <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} unit="%" />
                <YAxis type="category" dataKey="name" width={isMobile ? 132 : 200} interval={0} axisLine={false} tickLine={false} tick={<NameTick maxChars={isMobile ? 15 : 24} fontSize={isMobile ? 10.5 : 12} fill={theme.palette.text.secondary} />} />
                <Tooltip formatter={(v) => [`${v}%`, "Weightage"]} {...tooltipProps} />
                <Bar dataKey="weightage" radius={[0, 0, 0, 0]} maxBarSize={16}>
                  {chartData.map((d, i) => (
                    <Cell key={i} fill={d.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1.5 }}>
            All chapters — {exam === "main" ? "JEE Main" : "JEE Advanced"} 2026
          </Typography>
          <Box sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ "& th": { fontWeight: 600, color: "text.secondary" } }}>
                  <TableCell>Chapter</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell align="right">Avg Qs / paper</TableCell>
                  <TableCell align="right">Weightage</TableCell>
                  <TableCell>Priority</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tableRows.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{c.name}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ width: 8, height: 8, bgcolor: subjectColor(c.subject, dark) }} />
                        <Typography variant="body2">{c.subject}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>{c.q}</TableCell>
                    <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>{c.w}%</TableCell>
                    <TableCell>
                      <Chip
                        label={priorityFor(c.w)}
                        size="small"
                        variant="outlined"
                        color={
                          c.w === 0 ? "default"
                          : priorityFor(c.w) === "Very High" || priorityFor(c.w) === "High" ? "error"
                          : priorityFor(c.w) === "Medium" ? "warning"
                          : "default"
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </CardContent>
      </Card>
    </Stack>
  );
}
