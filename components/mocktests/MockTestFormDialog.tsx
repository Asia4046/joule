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
import Typography from "@mui/material/Typography";
import { createMockTestAction, type ActionState } from "@/app/actions/data";

function todayLocal() {
  return new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export default function MockTestFormDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(createMockTestAction, undefined);
  const [correct, setCorrect] = useState(0);
  const [attempted, setAttempted] = useState(0);

  useEffect(() => {
    if (state?.ok) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.ok]);

  const num = (v: string) => (v === "" ? null : Number(v));
  const preview = attempted > 0 ? Math.round((correct / attempted) * 1000) / 10 : null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Add mock test</DialogTitle>
      <form action={formAction}>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            {state?.error && <Alert severity="error">{state.error}</Alert>}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField size="small" label="Test name" name="name" required fullWidth />
              <TextField size="small" label="Date" name="date" type="date" defaultValue={todayLocal()} slotProps={{ inputLabel: { shrink: true } }} required fullWidth />
              <TextField select size="small" label="Exam type" name="examType" defaultValue="main" required sx={{ minWidth: 130 }}>
                <MenuItem value="main">JEE Main</MenuItem>
                <MenuItem value="advanced">JEE Advanced</MenuItem>
              </TextField>
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField size="small" label="Source (optional)" name="source" fullWidth />
              <TextField size="small" label="Total marks" name="totalMarks" type="number" slotProps={{ input: { inputProps: { min: 1 } } }} required fullWidth />
              <TextField size="small" label="Marks obtained" name="marksObtained" type="number" slotProps={{ input: { inputProps: { min: 0 } } }} required fullWidth />
            </Stack>
            <Typography variant="caption" color="text.secondary">Subject marks (optional)</Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField size="small" label="Physics" name="physicsMarks" type="number" fullWidth />
              <TextField size="small" label="Chemistry" name="chemistryMarks" type="number" fullWidth />
              <TextField size="small" label="Mathematics" name="mathsMarks" type="number" fullWidth />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                size="small"
                label="Attempted"
                name="attempted"
                type="number"
                required
                value={attempted || ""}
                onChange={(e) => setAttempted(num(e.target.value) ?? 0)}
                fullWidth
              />
              <TextField
                size="small"
                label="Correct"
                name="correct"
                type="number"
                required
                value={correct || ""}
                onChange={(e) => setCorrect(num(e.target.value) ?? 0)}
                fullWidth
              />
              <TextField size="small" label="Incorrect" name="incorrect" type="number" required fullWidth />
              <TextField size="small" label="Skipped" name="skipped" type="number" fullWidth />
            </Stack>
            {preview != null && <Chip label={`Accuracy: ${preview}%`} color="primary" variant="outlined" sx={{ alignSelf: "flex-start" }} />}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField size="small" label="Time taken (minutes)" name="timeMinutes" type="number" required fullWidth />
              <TextField size="small" label="Negative marks" name="negativeMarks" type="number" fullWidth />
              <TextField size="small" label="Percentile (optional)" name="percentile" type="number" slotProps={{ input: { inputProps: { step: "0.01", min: 0, max: 100 } } }} fullWidth />
              <TextField size="small" label="Rank (optional)" name="rank" type="number" fullWidth />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={pending}>
            {pending ? "Saving…" : "Save test"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
