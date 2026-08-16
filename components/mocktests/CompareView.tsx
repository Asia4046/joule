"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { SUBJECT_COLORS } from "@/lib/constants";
import { EmptyState } from "@/components/ui";

type TestItem = {
  id: string;
  name: string;
  date: string;
  totalMarks: number;
  marksObtained: number;
  physicsMarks: number | null;
  chemistryMarks: number | null;
  mathsMarks: number | null;
  attempted: number;
  correct: number;
  incorrect: number;
  percentile: number | null;
};

export default function CompareView({ tests }: { tests: TestItem[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>(tests.slice(0, 2).map((t) => t.id));
  const theme = useTheme();

  const selected = useMemo(
    () => tests.filter((t) => selectedIds.includes(t.id)),
    [tests, selectedIds]
  );

  const rows = useMemo(() => {
    if (selected.length === 0) return [];
    const scorePct = (t: TestItem) => Math.round((t.marksObtained / t.totalMarks) * 1000) / 10;
    const acc = (t: TestItem) => (t.attempted ? Math.round((t.correct / t.attempted) * 1000) / 10 : null);
    const mk = (label: string, get: (t: TestItem) => number | null, fmt: (v: number) => string = (v) => String(v), higherBetter = true) => {
      const values = selected.map(get);
      const valid = values.filter((v): v is number => v != null);
      const best = valid.length ? (higherBetter ? Math.max(...valid) : Math.min(...valid)) : null;
      return { label, cells: values.map((v) => (v == null ? "—" : fmt(v))), raw: values, best };
    };
    return [
      mk("Score", (t) => t.marksObtained),
      mk("Score %", (t) => scorePct(t), (v) => `${v}%`),
      mk("Accuracy", (t) => acc(t), (v) => `${v}%`),
      mk("Physics", (t) => t.physicsMarks),
      mk("Chemistry", (t) => t.chemistryMarks),
      mk("Mathematics", (t) => t.mathsMarks),
      mk("Attempted", (t) => t.attempted),
      mk("Correct", (t) => t.correct),
      mk("Incorrect", (t) => t.incorrect, (v) => String(v), false),
      mk("Percentile", (t) => t.percentile, (v) => v.toFixed(2)),
    ];
  }, [selected]);

  const chartData = selected.map((t) => ({
    name: t.name,
    Physics: t.physicsMarks != null ? Math.round((t.physicsMarks / (t.totalMarks / 3)) * 100) : 0,
    Chemistry: t.chemistryMarks != null ? Math.round((t.chemistryMarks / (t.totalMarks / 3)) * 100) : 0,
    Maths: t.mathsMarks != null ? Math.round((t.mathsMarks / (t.totalMarks / 3)) * 100) : 0,
  }));

  if (tests.length === 0) {
    return (
      <EmptyState
        title="Nothing to compare yet."
        description="Add at least two mock tests, then compare them side by side."
      />
    );
  }

  return (
    <Stack spacing={2}>
      <Card>
        <CardContent>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
            <TextField
              select
              label="Tests to compare (up to 4)"
              value={selectedIds}
              onChange={(e) => {
                const v = e.target.value as unknown as string[];
                setSelectedIds(v.slice(-4));
              }}
              SelectProps={{ multiple: true }}
              size="small"
              sx={{ minWidth: 320 }}
            >
              {tests.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.name} ({new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })})
                </MenuItem>
              ))}
            </TextField>
            <Chip label={`${selected.length} selected`} variant="outlined" />
          </Stack>
        </CardContent>
      </Card>

      {selected.length >= 2 && (
        <>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1.5 }}>Metric comparison</Typography>
              <Box sx={{ overflowX: "auto" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, color: "text.secondary" }}>Metric</TableCell>
                      {selected.map((t) => (
                        <TableCell key={t.id} align="right" sx={{ fontWeight: 600 }}>{t.name}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((r) => (
                      <TableRow key={r.label} hover>
                        <TableCell sx={{ color: "text.secondary" }}>{r.label}</TableCell>
                        {r.cells.map((c, i) => (
                          <TableCell
                            key={i}
                            align="right"
                            sx={{
                              fontVariantNumeric: "tabular-nums",
                              ...(r.best != null && r.raw[i] === r.best ? { color: "success.main", fontWeight: 700 } : {}),
                            }}
                          >
                            {c}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 0.5 }}>Subject performance (relative %)</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
                Best value per metric is highlighted green. Inorrect is lower-is-better.
              </Typography>
              <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer>
                  <BarChart data={chartData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: theme.palette.background.paper,
                        border: `1.5px solid ${theme.palette.text.primary}`,
                        boxShadow: `3px 3px 0 ${theme.palette.text.primary}`,
                        borderRadius: 0,
                        fontSize: 12,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="Physics" fill={SUBJECT_COLORS.Physics} radius={[0, 0, 0, 0]} maxBarSize={28} />
                    <Bar dataKey="Chemistry" fill={SUBJECT_COLORS.Chemistry} radius={[0, 0, 0, 0]} maxBarSize={28} />
                    <Bar dataKey="Maths" fill={SUBJECT_COLORS.Mathematics} radius={[0, 0, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </Stack>
  );
}
