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
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { deleteJournalAction } from "@/app/actions/data";
import { EmptyState } from "@/components/ui";
import JournalFormDialog, { MOODS, type JournalEntryInput } from "./JournalFormDialog";

const moodColor = (mood: string) =>
  mood === "focused"
    ? "primary"
    : mood === "tired"
      ? "default"
      : mood === "motivated"
        ? "success"
        : mood === "frustrated"
          ? "error"
          : mood === "calm"
            ? "info"
            : "warning"; // energetic

export default function JournalList({ entries }: { entries: JournalEntryInput[] }) {
  const [search, setSearch] = useState("");
  const [moodFilter, setMoodFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<JournalEntryInput | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries.filter((e) => {
      if (moodFilter !== "all" && (e.mood ?? "") !== moodFilter) return false;
      if (!q) return true;
      return [e.title, e.body, e.studiedWhat, e.understood, e.struggled, e.mistakes, e.tomorrow]
        .filter((x): x is string => x != null)
        .some((x) => x.toLowerCase().includes(q));
    });
  }, [entries, search, moodFilter]);

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (entry: JournalEntryInput) => {
    setEditing(entry);
    setDialogOpen(true);
  };

  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}>
          <Typography variant="h6">Entries ({filtered.length})</Typography>
          <Stack direction="row" spacing={1}>
            <TextField
              size="small"
              label="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ minWidth: 160 }}
            />
            <TextField
              select
              size="small"
              label="Mood"
              value={moodFilter}
              onChange={(e) => setMoodFilter(e.target.value)}
              sx={{ minWidth: 130 }}
            >
              <MenuItem value="all">All</MenuItem>
              {MOODS.map((m) => (
                <MenuItem key={m} value={m}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </MenuItem>
              ))}
            </TextField>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openNew}>
              New entry
            </Button>
          </Stack>
        </Stack>

        {entries.length === 0 ? (
          <EmptyState
            title="Document today's preparation."
            description="Write a short daily reflection — what you studied, mistakes made, and the plan for tomorrow."
            action={
              <Button variant="contained" onClick={openNew}>
                Write today's entry
              </Button>
            }
          />
        ) : filtered.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
            No entries match your filters.
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {filtered.map((e) => (
              <EntryCard key={e.id} entry={e} onEdit={() => openEdit(e)} />
            ))}
          </Stack>
        )}
      </CardContent>
      <JournalFormDialog entry={editing} open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </Card>
  );
}

const SECTIONS: { key: keyof JournalEntryInput; label: string }[] = [
  { key: "studiedWhat", label: "Studied" },
  { key: "understood", label: "Understood well" },
  { key: "struggled", label: "Struggled with" },
  { key: "mistakes", label: "Mistakes" },
  { key: "tomorrow", label: "Tomorrow" },
];

function EntryCard({ entry, onEdit }: { entry: JournalEntryInput; onEdit: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const hasDetails =
    entry.body.trim().length > 0 || SECTIONS.some((s) => (entry[s.key] ?? "").trim().length > 0);

  return (
    <Box sx={{ border: "1px solid", borderColor: "divider", p: 1.75 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {entry.title}
            </Typography>
            {entry.mood && (
              <Chip label={entry.mood} size="small" variant="outlined" color={moodColor(entry.mood)} />
            )}
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {new Date(entry.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
          </Typography>
        </Box>
        <Stack direction="row" spacing={0.5}>
          {hasDetails && (
            <IconButton size="small" aria-label="Expand entry" onClick={() => setExpanded((v) => !v)} sx={{ rotate: expanded ? "180deg" : "0deg" }}>
              <ExpandMoreIcon fontSize="small" />
            </IconButton>
          )}
          <IconButton size="small" aria-label="Edit entry" onClick={onEdit}>
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
          <form
            action={deleteJournalAction}
            onSubmit={(e) => {
              if (!window.confirm("Delete this journal entry?")) e.preventDefault();
            }}
          >
            <input type="hidden" name="id" value={entry.id} />
            <IconButton size="small" aria-label="Delete entry" type="submit">
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </form>
        </Stack>
      </Stack>

      {hasDetails && (
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Stack spacing={1.25} sx={{ mt: 1.5, pt: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
            {SECTIONS.map(({ key, label }) => {
              const value = entry[key];
              if (typeof value !== "string" || !value.trim()) return null;
              return (
                <Box key={key}>
                  <Typography variant="caption" sx={{ fontWeight: 700, display: "block" }}>
                    {label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-wrap" }}>
                    {value}
                  </Typography>
                </Box>
              );
            })}
            {entry.body.trim() && (
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, display: "block" }}>
                  Notes
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-wrap" }}>
                  {entry.body}
                </Typography>
              </Box>
            )}
          </Stack>
        </Collapse>
      )}
    </Box>
  );
}
