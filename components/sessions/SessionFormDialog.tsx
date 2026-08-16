"use client";

import { useActionState, useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import { STUDY_TYPES, SUBJECTS } from "@/lib/constants";
import { createSessionAction, type ActionState } from "@/app/actions/study";

function nowLocal(offsetMinutes = 0) {
  return new Date(Date.now() + offsetMinutes * 60000 - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

export default function SessionFormDialog({
  chapters,
  open: controlledOpen,
  onClose,
}: {
  chapters: { id: string; name: string; subject: string }[];
  open?: boolean;
  onClose?: () => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const close = onClose ?? (() => setInternalOpen(false));
  const [subject, setSubject] = useState<string>("Physics");
  const [state, formAction, pending] = useActionState<ActionState, FormData>(createSessionAction, undefined);

  useEffect(() => {
    if (state?.ok) close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.ok]);

  return (
    <>
      {!controlledOpen && null}
      <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
        <DialogTitle>Add study session</DialogTitle>
        <form action={formAction}>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 0.5 }}>
              {state?.error && <Alert severity="error">{state.error}</Alert>}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField select size="small" label="Subject" name="subject" value={subject} onChange={(e) => setSubject(e.target.value)} fullWidth required>
                  {SUBJECTS.map((s) => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </TextField>
                <TextField select size="small" label="Chapter" name="chapterId" defaultValue="" fullWidth>
                  <MenuItem value="">— none —</MenuItem>
                  {chapters.filter((c) => c.subject === subject).map((c) => (
                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                  ))}
                </TextField>
              </Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField size="small" label="Topic (optional)" name="topic" fullWidth />
                <TextField select size="small" label="Study type" name="type" defaultValue="concept" fullWidth required>
                  {STUDY_TYPES.map((t) => (
                    <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                  ))}
                </TextField>
              </Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  size="small"
                  label="Start"
                  name="startedAt"
                  type="datetime-local"
                  defaultValue={nowLocal(-60)}
                  slotProps={{ inputLabel: { shrink: true } }}
                  fullWidth
                  required
                />
                <TextField
                  size="small"
                  label="End"
                  name="endedAt"
                  type="datetime-local"
                  defaultValue={nowLocal(0)}
                  slotProps={{ inputLabel: { shrink: true } }}
                  fullWidth
                  required
                />
              </Stack>
              <TextField size="small" label="Notes (optional)" name="notes" multiline minRows={2} fullWidth />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={close}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={pending}>
              {pending ? "Saving…" : "Save session"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
