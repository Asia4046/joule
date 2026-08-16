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
import { MISTAKE_TYPES, SUBJECTS } from "@/lib/constants";
import { createMistakeAction, type ActionState } from "@/app/actions/data";

type ChapterOpt = {
  id: string;
  name: string;
  subject: string;
  topics: { id: string; name: string }[];
};

function todayLocal() {
  return new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export default function MistakeFormDialog({
  open,
  onClose,
  chapters,
}: {
  open: boolean;
  onClose: () => void;
  chapters: ChapterOpt[];
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(createMistakeAction, undefined);
  const [subject, setSubject] = useState("Physics");
  const [chapterId, setChapterId] = useState("");

  useEffect(() => {
    if (state?.ok) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.ok]);

  const chapterOptions = chapters.filter((c) => c.subject === subject);
  const topicOptions = chapterOptions.find((c) => c.id === chapterId)?.topics ?? [];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Log mistake</DialogTitle>
      <form action={formAction}>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            {state?.error && <Alert severity="error">{state.error}</Alert>}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField select size="small" label="Subject" name="subject" value={subject} onChange={(e) => { setSubject(e.target.value); setChapterId(""); }} required fullWidth>
                {SUBJECTS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
              <TextField select size="small" label="Chapter" name="chapterId" value={chapterId} onChange={(e) => setChapterId(e.target.value)} fullWidth>
                <MenuItem value="">— none —</MenuItem>
                {chapterOptions.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </TextField>
              <TextField select size="small" label="Topic (optional)" name="topicId" defaultValue="" fullWidth disabled={!chapterId}>
                <MenuItem value="">— none —</MenuItem>
                {topicOptions.map((t) => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
              </TextField>
            </Stack>
            <TextField size="small" label="What was the question?" name="question" multiline minRows={2} required fullWidth />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField select size="small" label="Mistake type" name="mistakeType" defaultValue="conceptual" required fullWidth>
                {MISTAKE_TYPES.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
              </TextField>
              <TextField select size="small" label="Difficulty" name="difficulty" defaultValue="medium" fullWidth>
                <MenuItem value="easy">Easy</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="hard">Hard</MenuItem>
              </TextField>
              <TextField size="small" label="Source (optional)" name="source" fullWidth />
              <TextField size="small" label="Date" name="date" type="date" defaultValue={todayLocal()} slotProps={{ inputLabel: { shrink: true } }} required fullWidth />
            </Stack>
            <TextField size="small" label="Your reasoning at the time (optional)" name="myReasoning" multiline minRows={2} fullWidth />
            <TextField size="small" label="Correct solution (optional)" name="solution" multiline minRows={2} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={pending}>
            {pending ? "Saving…" : "Save mistake"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
