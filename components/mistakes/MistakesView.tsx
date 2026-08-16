"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { MISTAKE_TYPES, SUBJECTS, labelFor } from "@/lib/constants";
import { deleteMistakeAction, updateMistakeStatusAction } from "@/app/actions/data";
import { EmptyState } from "@/components/ui";
import MistakeFormDialog from "./MistakeFormDialog";

type MistakeItem = {
  id: string;
  subject: string;
  chapterName: string | null;
  topicName: string | null;
  question: string;
  myReasoning: string | null;
  solution: string | null;
  source: string | null;
  mistakeType: string;
  difficulty: string;
  status: string;
  date: string;
};

type ChapterOpt = {
  id: string;
  name: string;
  subject: string;
  topics: { id: string; name: string }[];
};

const typeColor: Record<string, "error" | "warning" | "info" | "default"> = {
  conceptual: "error",
  calculation: "warning",
  silly: "warning",
  misread: "info",
  formula_forgotten: "error",
  time_pressure: "info",
  guessing: "default",
};

export default function MistakesView({ mistakes, chapters }: { mistakes: MistakeItem[]; chapters: ChapterOpt[] }) {
  const [subject, setSubject] = useState("all");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const monthAgo = Date.now() - 30 * 86400000;
  const monthTypeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of mistakes) {
      if (new Date(m.date).getTime() >= monthAgo) counts[m.mistakeType] = (counts[m.mistakeType] ?? 0) + 1;
    }
    return counts;
  }, [mistakes, monthAgo]);

  const filtered = useMemo(
    () =>
      mistakes.filter(
        (m) =>
          (subject === "all" || m.subject === subject) &&
          (type === "all" || m.mistakeType === type) &&
          (status === "all" || m.status === status) &&
          (search.trim() === "" || m.question.toLowerCase().includes(search.toLowerCase()))
      ),
    [mistakes, subject, type, status, search]
  );

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }} useFlexGap>
        {MISTAKE_TYPES.filter((t) => monthTypeCounts[t.value]).map((t) => (
          <Chip key={t.value} label={`${monthTypeCounts[t.value]} ${t.label.toLowerCase()} mistakes this month`} variant="outlined" size="small" />
        ))}
      </Stack>

      <Card>
        <CardContent>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2 }}>
            <TextField size="small" label="Search" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ minWidth: { sm: 200 } }} />
            <TextField select size="small" label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} sx={{ minWidth: 130 }}>
              <MenuItem value="all">All</MenuItem>
              {SUBJECTS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
            <TextField select size="small" label="Mistake type" value={type} onChange={(e) => setType(e.target.value)} sx={{ minWidth: 160 }}>
              <MenuItem value="all">All</MenuItem>
              {MISTAKE_TYPES.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
            </TextField>
            <TextField select size="small" label="Status" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 130 }}>
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="revisited">Revisited</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
            </TextField>
            <Box sx={{ flexGrow: 1 }} />
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
              Log mistake
            </Button>
          </Stack>

          {filtered.length === 0 ? (
            <EmptyState
              title="No mistakes logged."
              description="When you get a question wrong, log it here — patterns will emerge, and patterns can be fixed."
              action={<Button variant="contained" onClick={() => setDialogOpen(true)}>Log a mistake</Button>}
            />
          ) : (
            <Stack spacing={1.5}>
              {filtered.map((m) => (
                <Box key={m.id} sx={{ p: 1.5, border: "1px solid", borderColor: "divider" }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>{m.question}</Typography>
                      <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", gap: 0.5 }} useFlexGap>
                        <Chip label={labelFor(MISTAKE_TYPES, m.mistakeType)} size="small" color={typeColor[m.mistakeType] ?? "default"} variant="outlined" />
                        <Chip label={m.difficulty} size="small" variant="outlined" />
                        {m.chapterName && <Chip label={m.chapterName} size="small" variant="outlined" />}
                        {m.topicName && <Chip label={m.topicName} size="small" variant="outlined" />}
                        {m.status !== "open" && <Chip label={m.status} size="small" color={m.status === "resolved" ? "success" : "default"} />}
                      </Stack>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                        {new Date(m.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        {m.source ? ` · ${m.source}` : ""}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      {m.status !== "resolved" && (
                        <form action={updateMistakeStatusAction}>
                          <input type="hidden" name="id" value={m.id} />
                          <input type="hidden" name="status" value={m.status === "open" ? "revisited" : "resolved"} />
                          <Button size="small" type="submit">
                            {m.status === "open" ? "Mark revisited" : "Mark resolved"}
                          </Button>
                        </form>
                      )}
                      <IconButton
                        size="small"
                        aria-label={expanded === m.id ? "Hide details" : "Show details"}
                        onClick={() => setExpanded(expanded === m.id ? null : m.id)}
                      >
                        <ExpandMoreIcon fontSize="small" sx={{ transform: expanded === m.id ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                      </IconButton>
                      <form action={deleteMistakeAction}>
                        <input type="hidden" name="id" value={m.id} />
                        <IconButton size="small" aria-label="Delete mistake" type="submit" onClick={(e) => { if (!window.confirm("Delete this mistake entry?")) e.preventDefault(); }}>
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </form>
                    </Stack>
                  </Stack>
                  <Collapse in={expanded === m.id} timeout="auto" unmountOnExit>
                    <Stack spacing={1} sx={{ mt: 1.5, pt: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
                      {m.myReasoning && (
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 700 }}>MY REASONING</Typography>
                          <Typography variant="body2" color="text.secondary">{m.myReasoning}</Typography>
                        </Box>
                      )}
                      {m.solution && (
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 700 }}>CORRECT SOLUTION</Typography>
                          <Typography variant="body2" color="text.secondary">{m.solution}</Typography>
                        </Box>
                      )}
                    </Stack>
                  </Collapse>
                </Box>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      <MistakeFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} chapters={chapters} />
    </Stack>
  );
}
