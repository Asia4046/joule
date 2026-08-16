"use client";

import { useActionState, useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { SUBJECTS } from "@/lib/constants";
import { createQuestionLogAction, type ActionState } from "@/app/actions/study";

function todayLocal() {
  return new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export default function QuestionLogDialog({
  open,
  onClose,
  chapters,
}: {
  open: boolean;
  onClose: () => void;
  chapters: { id: string; name: string; subject: string }[];
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(createQuestionLogAction, undefined);
  const [subject, setSubject] = useState("Physics");
  const [correct, setCorrect] = useState<number>(0);
  const [incorrect, setIncorrect] = useState<number>(0);

  useEffect(() => {
    if (state?.ok) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.ok]);

  const total = correct + incorrect;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Log questions solved</DialogTitle>
      <form action={formAction}>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            {state?.error && <Alert severity="error">{state.error}</Alert>}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField select size="small" label="Subject" name="subject" value={subject} onChange={(e) => setSubject(e.target.value)} required fullWidth>
                {SUBJECTS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
              <TextField select size="small" label="Chapter" name="chapterId" defaultValue="" fullWidth>
                <MenuItem value="">— none —</MenuItem>
                {chapters.filter((c) => c.subject === subject).map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
              </TextField>
            </Stack>
            <TextField size="small" label="Topic (optional)" name="topic" fullWidth />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                size="small"
                label="Total solved"
                name="total"
                type="number"
                required
                value={total || ""}
                slotProps={{ input: { readOnly: true, inputProps: { min: 1 } } }}
                helperText="Correct + incorrect"
                fullWidth
              />
              <TextField
                size="small"
                label="Correct"
                name="correct"
                type="number"
                required
                value={correct || ""}
                onChange={(e) => setCorrect(Math.max(0, Number(e.target.value) || 0))}
                slotProps={{ input: { inputProps: { min: 0 } } }}
                fullWidth
              />
              <TextField
                size="small"
                label="Incorrect"
                name="incorrect"
                type="number"
                required
                value={incorrect || ""}
                onChange={(e) => setIncorrect(Math.max(0, Number(e.target.value) || 0))}
                slotProps={{ input: { inputProps: { min: 0 } } }}
                fullWidth
              />
            </Stack>
            {total > 0 && <Chip label={`Accuracy: ${Math.round((correct / total) * 1000) / 10}%`} color="primary" variant="outlined" sx={{ alignSelf: "flex-start" }} />}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField size="small" label="Skipped" name="skipped" type="number" defaultValue={0} slotProps={{ input: { inputProps: { min: 0 } } }} fullWidth />
              <TextField select size="small" label="Difficulty" name="difficulty" defaultValue="mixed" fullWidth>
                <MenuItem value="easy">Easy</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="hard">Hard</MenuItem>
                <MenuItem value="mixed">Mixed</MenuItem>
              </TextField>
              <TextField size="small" label="Date" name="date" type="date" defaultValue={todayLocal()} slotProps={{ inputLabel: { shrink: true } }} required fullWidth />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={pending || total < 1}>
            {pending ? "Saving…" : "Save log"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
