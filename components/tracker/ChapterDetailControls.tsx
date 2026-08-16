"use client";

import { useState, useTransition } from "react";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import Rating from "@mui/material/Rating";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { CHAPTER_STATUSES, labelFor } from "@/lib/constants";
import { updateChapterStatusAction, updateConfidenceAction, updateTopicDoneAction } from "@/app/actions/study";
import { scheduleRevisionAction as scheduleRevision } from "@/app/actions/data";

export default function ChapterDetailControls({
  chapterId,
  topics,
  status,
  confidence,
}: {
  chapterId: string;
  topics: { id: string; name: string; done: boolean }[];
  status: string;
  confidence: number;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }} justifyContent="space-between">
        <TextField
          select
          size="small"
          label="Chapter status"
          defaultValue={status}
          disabled={pending}
          onChange={(e) => {
            const fd = new FormData();
            fd.set("chapterId", chapterId);
            fd.set("status", e.target.value);
            startTransition(() => void updateChapterStatusAction(fd));
          }}
          sx={{ minWidth: 180 }}
        >
          {CHAPTER_STATUSES.map((s) => (
            <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
          ))}
        </TextField>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2" color="text.secondary">Confidence</Typography>
          <Rating
            defaultValue={confidence}
            disabled={pending}
            onChange={(_, v) => {
              const fd = new FormData();
              fd.set("chapterId", chapterId);
              fd.set("confidence", String(v ?? 1));
              startTransition(() => void updateConfidenceAction(fd));
            }}
          />
        </Stack>
      </Stack>
      <Stack spacing={-0.5}>
        {topics.map((t) => (
          <FormControlLabel
            key={t.id}
            control={
              <Checkbox
                defaultChecked={t.done}
                disabled={pending}
                size="small"
                onChange={(e) => {
                  const fd = new FormData();
                  fd.set("chapterId", chapterId);
                  fd.set("topicId", t.id);
                  fd.set("done", String(e.target.checked));
                  startTransition(() => void updateTopicDoneAction(fd));
                }}
              />
            }
            label={<Typography variant="body2">{t.name}</Typography>}
            sx={{ m: 0 }}
          />
        ))}
      </Stack>
    </Stack>
  );
}

export function ScheduleRevision({ chapterId, topicIds }: { chapterId: string; topicIds: string[] }) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const first = topicIds[0];

  return (
    <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
      {[1, 3, 7, 14].map((d) => (
        <Chip
          key={d}
          label={`Revise in ${d}d`}
          size="small"
          variant="outlined"
          disabled={pending || !first || done}
          onClick={() => {
            if (!first) return;
            const fd = new FormData();
            fd.set("topicId", first);
            fd.set("days", String(d));
            setDone(true);
            startTransition(() => void scheduleRevision(fd));
          }}
        />
      ))}
      {done && <Typography variant="caption" color="success.main">Scheduled ✓</Typography>}
    </Stack>
  );
}


