"use client";

import { useActionState, useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { createGoalAction, type ActionState } from "@/app/actions/data";

const KINDS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "long_term", label: "Long-term" },
] as const;

const METRICS = [
  { value: "hours", label: "Hours" },
  { value: "questions", label: "Questions" },
  { value: "chapters", label: "Chapters" },
  { value: "mocks", label: "Mock tests" },
  { value: "custom", label: "Custom" },
] as const;

export default function GoalFormDialog({
  open,
  onClose,
  defaultKind = "daily",
}: {
  open: boolean;
  onClose: () => void;
  defaultKind?: string;
}) {
  const [kind, setKind] = useState(defaultKind);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(createGoalAction, undefined);

  useEffect(() => {
    if (state?.ok) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.ok]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add goal</DialogTitle>
      <form action={formAction}>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            {state?.error && <Alert severity="error">{state.error}</Alert>}
            <TextField size="small" label="Title" name="title" placeholder="e.g. Solve rotation questions" fullWidth required autoFocus />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                select
                size="small"
                label="Kind"
                name="kind"
                value={kind}
                onChange={(e) => setKind(e.target.value)}
                fullWidth
                required
              >
                {KINDS.map((k) => (
                  <MenuItem key={k.value} value={k.value}>{k.label}</MenuItem>
                ))}
              </TextField>
              <TextField select size="small" label="Metric" name="metric" defaultValue="hours" fullWidth required>
                {METRICS.map((m) => (
                  <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                ))}
              </TextField>
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                size="small"
                label="Target"
                name="target"
                type="number"
                slotProps={{ htmlInput: { step: "any", min: "0.5" } }}
                fullWidth
                required
              />
              <TextField
                size="small"
                label="Deadline (optional)"
                name="deadline"
                type="date"
                slotProps={{ inputLabel: { shrink: true } }}
                fullWidth
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={pending}>
            {pending ? "Saving…" : "Save goal"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
