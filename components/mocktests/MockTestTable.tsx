"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme, alpha } from "@mui/material/styles";
import Link from "next/link";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { deleteMockTestAction } from "@/app/actions/data";
import { EmptyState } from "@/components/ui";
import MockTestFormDialog from "./MockTestFormDialog";

export type TestRow = {
  id: string;
  name: string;
  date: string;
  examType: string;
  source: string | null;
  totalMarks: number;
  marksObtained: number;
  physicsMarks: number | null;
  chemistryMarks: number | null;
  mathsMarks: number | null;
  attempted: number;
  correct: number;
  incorrect: number;
  skipped: number;
  percentile: number | null;
};

const pct = (t: TestRow) => Math.round((t.marksObtained / t.totalMarks) * 1000) / 10;
const acc = (t: TestRow) => (t.attempted ? Math.round((t.correct / t.attempted) * 1000) / 10 : null);

export default function MockTestTable({ tests }: { tests: TestRow[] }) {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6">All tests</Typography>
            <Button component={Link} href="/mock-tests/analytics" size="small">
              Analytics
            </Button>
            <Button component={Link} href="/mock-tests/compare" size="small">
              Compare
            </Button>
          </Stack>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
            Add test
          </Button>
        </Stack>

        {tests.length === 0 ? (
          <EmptyState
            title="Your mock-test history starts here."
            description="Record your first mock test to unlock score progression, subject analytics and trends."
            action={
              <Button variant="contained" onClick={() => setOpen(true)}>
                Add your first test
              </Button>
            }
          />
        ) : isDesktop ? (
          <Table size="small">
            <TableHead>
              <TableRow sx={{ "& th": { fontWeight: 600, color: "text.secondary", whiteSpace: "nowrap" } }}>
                <TableCell>Test</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Score</TableCell>
                <TableCell align="right">%</TableCell>
                <TableCell align="right">Phy</TableCell>
                <TableCell align="right">Chem</TableCell>
                <TableCell align="right">Math</TableCell>
                <TableCell align="right">Att</TableCell>
                <TableCell align="right">Cor</TableCell>
                <TableCell align="right">Inc</TableCell>
                <TableCell align="right">Acc</TableCell>
                <TableCell align="right">%ile</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {tests.map((t) => (
                <TableRow key={t.id} hover>
                  <TableCell sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>{t.name}</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap", color: "text.secondary" }}>
                    {new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
                  </TableCell>
                  <TableCell>
                    <Chip label={t.examType === "main" ? "Main" : "Adv"} size="small" variant="outlined" color={t.examType === "main" ? "primary" : "secondary"} />
                  </TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>{t.marksObtained}/{t.totalMarks}</TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{pct(t)}%</TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>{t.physicsMarks ?? "—"}</TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>{t.chemistryMarks ?? "—"}</TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>{t.mathsMarks ?? "—"}</TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>{t.attempted}</TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums", color: "success.main" }}>{t.correct}</TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums", color: "error.main" }}>{t.incorrect}</TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>{acc(t) ?? "—"}%</TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>{t.percentile?.toFixed(2) ?? "—"}</TableCell>
                  <TableCell padding="checkbox">
                    <form action={deleteMockTestAction}>
                      <input type="hidden" name="id" value={t.id} />
                      <IconButton size="small" aria-label={`Delete ${t.name}`} type="submit">
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Stack spacing={1.5}>
            {tests.map((t) => (
              <Box key={t.id} sx={{ p: 1.5, border: `1px solid ${theme.palette.divider}` }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle2">{t.name}</Typography>
                  <form action={deleteMockTestAction}>
                    <input type="hidden" name="id" value={t.id} />
                    <IconButton size="small" aria-label={`Delete ${t.name}`} type="submit">
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </form>
                </Stack>
                <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: "wrap", gap: 0.5 }} useFlexGap>
                  <Chip label={t.examType === "main" ? "Main" : "Adv"} size="small" variant="outlined" />
                  <Chip label={`${t.marksObtained}/${t.totalMarks} · ${pct(t)}%`} size="small" />
                  {acc(t) != null && <Chip label={`${acc(t)}% acc`} size="small" />}
                  {t.percentile != null && <Chip label={`${t.percentile.toFixed(2)} %ile`} size="small" />}
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                  {new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · P {t.physicsMarks ?? "—"} / C {t.chemistryMarks ?? "—"} / M {t.mathsMarks ?? "—"}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}
      </CardContent>
      <MockTestFormDialog open={open} onClose={() => setOpen(false)} />
    </Card>
  );
}
