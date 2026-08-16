"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import { STUDY_TYPES, SUBJECTS, SUBJECT_COLORS, labelFor } from "@/lib/constants";
import { deleteSessionAction } from "@/app/actions/study";
import SessionFormDialog from "./SessionFormDialog";
import { EmptyState } from "@/components/ui";

type SessionItem = {
  id: string;
  subject: string;
  chapterName: string | null;
  topic: string | null;
  type: string;
  startedAt: string;
  durationMinutes: number;
};

const fmt = (m: number) => `${Math.floor(m / 60)}h ${m % 60}m`;

export default function SessionsList({
  sessions,
  stats,
  chapters,
}: {
  sessions: SessionItem[];
  stats: { weekMinutes: number; monthMinutes: number; bySubject: Record<string, number> };
  chapters: { id: string; name: string; subject: string }[];
}) {
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(
    () =>
      sessions.filter(
        (s) =>
          (subjectFilter === "all" || s.subject === subjectFilter) &&
          (typeFilter === "all" || s.type === typeFilter)
      ),
    [sessions, subjectFilter, typeFilter]
  );

  const totalSubject = Object.values(stats.bySubject).reduce((a, b) => a + b, 0) || 1;

  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}>
          <Typography variant="h6">History ({filtered.length})</Typography>
          <Stack direction="row" spacing={1}>
            <TextField
              select
              size="small"
              label="Subject"
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="all">All</MenuItem>
              {SUBJECTS.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">All</MenuItem>
              {STUDY_TYPES.map((t) => (
                <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
              ))}
            </TextField>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
              Add session
            </Button>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}>
          <Chip label={`7 days: ${fmt(stats.weekMinutes)}`} variant="outlined" />
          <Chip label={`30 days: ${fmt(stats.monthMinutes)}`} variant="outlined" />
          {SUBJECTS.filter((s) => stats.bySubject[s]).map((s) => (
            <Chip
              key={s}
              label={`${s}: ${fmt(stats.bySubject[s])} (${Math.round((stats.bySubject[s] / totalSubject) * 100)}%)`}
              variant="outlined"
              sx={{ borderColor: SUBJECT_COLORS[s] }}
            />
          ))}
        </Stack>

        {filtered.length === 0 ? (
          <EmptyState
            title="No sessions recorded yet."
            description="Start the focus timer above, or manually add a study session."
            action={<Button variant="contained" onClick={() => setOpen(true)}>Add session</Button>}
          />
        ) : (
          <Stack divider={<Box sx={{ borderBottom: 1, borderColor: "divider" }} />} spacing={0}>
            {filtered.map((s) => (
              <Stack key={s.id} direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1.25 }}>
                <Box sx={{ minWidth: 0 }}>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <Box sx={{ width: 8, height: 8, bgcolor: SUBJECT_COLORS[s.subject] ?? "#999" }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {s.chapterName ?? s.topic ?? s.subject}
                    </Typography>
                    <Chip label={labelFor(STUDY_TYPES, s.type)} size="small" variant="outlined" />
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(s.startedAt).toLocaleString("en-IN", {
                      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                    })}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Typography variant="body2" sx={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                    {fmt(s.durationMinutes)}
                  </Typography>
                  <form action={deleteSessionAction}>
                    <input type="hidden" name="id" value={s.id} />
                    <IconButton size="small" aria-label="Delete session" type="submit">
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </form>
                </Stack>
              </Stack>
            ))}
          </Stack>
        )}
      </CardContent>
      <SessionFormDialog chapters={chapters} open={open} onClose={() => setOpen(false)} />
    </Card>
  );
}
