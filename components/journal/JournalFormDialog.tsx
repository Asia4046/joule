"use client";

import { useActionState, useEffect } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { saveJournalAction, type ActionState } from "@/app/actions/data";

export const MOODS = ["focused", "tired", "motivated", "frustrated", "calm", "energetic"] as const;

export type JournalEntryInput = {
  id: string;
  title: string;
  date: string; // ISO
  mood: string | null;
  studiedWhat: string | null;
  understood: string | null;
  struggled: string | null;
  mistakes: string | null;
  tomorrow: string | null;
  body: string;
};

function toDateInput(iso: string) {
  return new Date(iso).toISOString().slice(0, 10);
}

export default function JournalFormDialog({
  entry,
  open,
  onClose,
}: {
  entry?: JournalEntryInput | null;
  open: boolean;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(saveJournalAction, undefined);
  const editing = entry != null;

  useEffect(() => {
    if (state?.ok) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.ok]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{editing ? "Edit journal entry" : "New journal entry"}</DialogTitle>
      <form action={formAction}>
        {editing && <input type="hidden" name="id" value={entry.id} />}
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            {state?.error && <Alert severity="error">{state.error}</Alert>}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                size="small"
                label="Title"
                name="title"
                defaultValue={editing ? entry.title : ""}
                fullWidth
                required
              />
              <TextField
                size="small"
                label="Date"
                name="date"
                type="date"
                defaultValue={editing ? toDateInput(entry.date) : new Date().toISOString().slice(0, 10)}
                slotProps={{ inputLabel: { shrink: true } }}
                fullWidth
                required
              />
            </Stack>
            <TextField select size="small" label="Mood" name="mood" defaultValue={editing ? entry.mood ?? "" : ""} fullWidth>
              <MenuItem value="">— none —</MenuItem>
              {MOODS.map((m) => (
                <MenuItem key={m} value={m}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              label="What did you study?"
              name="studiedWhat"
              defaultValue={editing ? entry.studiedWhat ?? "" : ""}
              multiline
              minRows={2}
              fullWidth
            />
            <TextField
              size="small"
              label="What did you understand well?"
              name="understood"
              defaultValue={editing ? entry.understood ?? "" : ""}
              multiline
              minRows={2}
              fullWidth
            />
            <TextField
              size="small"
              label="What did you struggle with?"
              name="struggled"
              defaultValue={editing ? entry.struggled ?? "" : ""}
              multiline
              minRows={2}
              fullWidth
            />
            <TextField
              size="small"
              label="Mistakes made"
              name="mistakes"
              defaultValue={editing ? entry.mistakes ?? "" : ""}
              multiline
              minRows={2}
              fullWidth
            />
            <TextField
              size="small"
              label="Plan for tomorrow"
              name="tomorrow"
              defaultValue={editing ? entry.tomorrow ?? "" : ""}
              multiline
              minRows={2}
              fullWidth
            />
            <TextField
              size="small"
              label="Free notes"
              name="body"
              defaultValue={editing ? entry.body : ""}
              multiline
              minRows={3}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={pending}>
            {pending ? "Saving…" : editing ? "Save changes" : "Save entry"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
