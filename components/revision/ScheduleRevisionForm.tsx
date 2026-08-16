"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { scheduleRevisionAction } from "@/app/actions/data";

const INTERVALS = [1, 3, 7, 14, 30];

export default function ScheduleRevisionForm({
  chapters,
}: {
  chapters: { id: string; name: string; subject: string; topics: { id: string; name: string }[] }[];
}) {
  const [chapterId, setChapterId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [days, setDays] = useState(7);

  const chapter = chapters.find((c) => c.id === chapterId);

  return (
    <form action={scheduleRevisionAction}>
      <input type="hidden" name="topicId" value={topicId} />
      <input type="hidden" name="days" value={days} />
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }} flexWrap="wrap">
        <TextField
          select
          size="small"
          label="Chapter"
          value={chapterId}
          onChange={(e) => {
            setChapterId(e.target.value);
            setTopicId("");
          }}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="">— select chapter —</MenuItem>
          {chapters.map((c) => (
            <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Topic"
          value={topicId}
          onChange={(e) => setTopicId(e.target.value)}
          disabled={!chapter}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="">— select topic —</MenuItem>
          {(chapter?.topics ?? []).map((t) => (
            <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
          ))}
        </TextField>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
            Interval
          </Typography>
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            {INTERVALS.map((d) => (
              <Chip
                key={d}
                label={`${d}d`}
                size="small"
                variant={days === d ? "filled" : "outlined"}
                color={days === d ? "primary" : "default"}
                onClick={() => setDays(d)}
              />
            ))}
          </Stack>
        </Box>
      </Stack>
    </form>
  );
}
