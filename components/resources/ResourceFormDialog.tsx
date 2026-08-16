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
import { RESOURCE_TYPES, SUBJECTS } from "@/lib/constants";
import { createResourceAction, type ActionState } from "@/app/actions/data";

export default function ResourceFormDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(createResourceAction, undefined);

  useEffect(() => {
    if (state?.ok) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.ok]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add resource</DialogTitle>
      <form action={formAction}>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            {state?.error && <Alert severity="error">{state.error}</Alert>}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField select size="small" label="Type" name="type" defaultValue="book" fullWidth required>
                {RESOURCE_TYPES.map((t) => (
                  <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                ))}
              </TextField>
              <TextField select size="small" label="Subject (optional)" name="subject" defaultValue="" fullWidth>
                <MenuItem value="">— none —</MenuItem>
                {SUBJECTS.map((s) => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </TextField>
            </Stack>
            <TextField size="small" label="Title" name="title" placeholder="e.g. HC Verma Vol 1" fullWidth required autoFocus />
            <TextField size="small" label="URL (optional)" name="url" placeholder="https://…" fullWidth />
            <TextField
              size="small"
              label="Tags (optional)"
              name="tags"
              placeholder="comma, separated, tags"
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={pending}>
            {pending ? "Saving…" : "Save resource"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
