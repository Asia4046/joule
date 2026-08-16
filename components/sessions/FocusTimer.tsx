"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import CheckIcon from "@mui/icons-material/Check";
import { STUDY_TYPES, SUBJECTS } from "@/lib/constants";
import { createSessionAction } from "@/app/actions/study";

type ChapterOpt = { id: string; name: string; subject: string };
type Mode = "focus" | "break";
type TimerState = "idle" | "running" | "paused" | "done";

const FOCUS_PRESETS = [
  { label: "Pomodoro 25", minutes: 25 },
  { label: "Deep 50", minutes: 50 },
  { label: "Long 90", minutes: 90 },
];

export default function FocusTimer({ chapters, autoOpen }: { chapters: ChapterOpt[]; autoOpen?: boolean }) {
  const [presetMinutes, setPresetMinutes] = useState(25);
  const [mode, setMode] = useState<Mode>("focus");
  const [state, setState] = useState<TimerState>("idle");
  const [remaining, setRemaining] = useState(25 * 60);
  const [subject, setSubject] = useState<string>("Physics");
  const [chapterId, setChapterId] = useState<string>("");
  const [type, setType] = useState<string>("concept");
  const [saved, setSaved] = useState(false);
  const [elapsedTotal, setElapsedTotal] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const router = useRouter();

  const breakMinutes = 5;
  const totalMinutes = mode === "focus" ? presetMinutes : breakMinutes;

  useEffect(() => {
    if (state !== "running") {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setState("done");
          return 0;
        }
        return r - 1;
      });
      if (mode === "focus") setElapsedTotal((e) => e + 1);
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state, mode]);

  function reset(nextMode: Mode = mode, minutes?: number) {
    setState("idle");
    setSaved(false);
    const m = minutes ?? (nextMode === "focus" ? presetMinutes : breakMinutes);
    setMode(nextMode);
    setRemaining(m * 60);
  }

  function choosePreset(minutes: number) {
    setPresetMinutes(minutes);
    reset("focus", minutes);
  }

  async function logSession() {
    const startedAt = new Date(Date.now() - elapsedTotal * 1000);
    const fd = new FormData();
    fd.set("subject", subject);
    fd.set("chapterId", chapterId || "");
    fd.set("startedAt", startedAt.toISOString());
    fd.set("endedAt", new Date().toISOString());
    fd.set("type", type);
    const res = await createSessionAction(undefined, fd);
    if (res?.ok) {
      setSaved(true);
      setElapsedTotal(0);
      router.refresh();
    }
  }

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const progress = ((totalMinutes * 60 - remaining) / (totalMinutes * 60)) * 100;
  const chapterOptions = chapters.filter((c) => c.subject === subject);

  return (
    <Card>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={3} justifyContent="space-between">
          <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
            <Stack direction="row" spacing={1} sx={{ mb: 2, justifyContent: { xs: "center", md: "flex-start" } }}>
              {FOCUS_PRESETS.map((p) => (
                <Chip
                  key={p.minutes}
                  label={p.label}
                  onClick={() => choosePreset(p.minutes)}
                  color={presetMinutes === p.minutes && mode === "focus" ? "primary" : "default"}
                  variant={presetMinutes === p.minutes && mode === "focus" ? "filled" : "outlined"}
                />
              ))}
              <Chip
                label="Break 5"
                onClick={() => reset("break")}
                color={mode === "break" ? "secondary" : "default"}
                variant={mode === "break" ? "filled" : "outlined"}
              />
            </Stack>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 2, md: 3 }}
              alignItems="center"
              sx={{ mb: 2, justifyContent: { xs: "center", md: "flex-start" } }}
            >
              <Box sx={{ position: "relative", display: "inline-flex", my: 1 }}>
                <CircularProgress
                  variant="determinate"
                  value={100}
                  size={168}
                  thickness={5}
                  sx={{ color: "action.hover" }}
                />
                <CircularProgress
                  variant="determinate"
                  value={Math.min(100, progress)}
                  size={168}
                  thickness={5}
                  sx={{
                    position: "absolute",
                    left: 0,
                    color: mode === "focus" ? "primary.main" : "secondary.main",
                    transition: "color .3s ease",
                    "& .MuiCircularProgress-circle": { strokeLinecap: "round", transition: "stroke-dashoffset 1s linear" },
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{ fontVariantNumeric: "tabular-nums", fontWeight: 750, letterSpacing: "-0.03em", lineHeight: 1, fontSize: { xs: "2.4rem", sm: "2.75rem" } }}
                  >
                    {mm}:{ss}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 0.75,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: mode === "focus" ? "primary.main" : "secondary.main",
                    }}
                  >
                    {state === "done" ? "complete" : mode === "focus" ? "focus" : "break"}
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  {mode === "focus" && elapsedTotal > 0 ? `${Math.round(elapsedTotal / 60)}m elapsed this session` : state === "idle" ? "Ready when you are." : "Stay on task — one interval at a time."}
                </Typography>

                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1.5, justifyContent: { xs: "center", sm: "flex-start" } }}>
                  {state === "idle" && (
                    <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={() => setState("running")}>
                      Start
                    </Button>
                  )}
                  {state === "running" && (
                    <Button variant="outlined" startIcon={<PauseIcon />} onClick={() => setState("paused")}>
                      Pause
                    </Button>
                  )}
                  {state === "paused" && (
                    <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={() => setState("running")}>
                      Resume
                    </Button>
                  )}
                  <Button variant="text" startIcon={<RestartAltIcon />} onClick={() => reset()}>
                    Reset
                  </Button>
                  {state === "done" && mode === "break" && (
                    <Button variant="contained" onClick={() => reset("focus")}>
                      Back to focus
                    </Button>
                  )}
                </Stack>

                {mode === "focus" && elapsedTotal >= 60 && (
                  <Box sx={{ mt: 2 }}>
                    {saved ? (
                      <Typography variant="body2" color="success.main">
                        Session logged ✓
                      </Typography>
                    ) : (
                      <Button size="small" variant="outlined" color="success" startIcon={<CheckIcon />} onClick={logSession}>
                        Log {Math.round(elapsedTotal / 60)}m as study session
                      </Button>
                    )}
                  </Box>
                )}
              </Box>
            </Stack>
          </Box>

          <Stack spacing={2} sx={{ minWidth: { md: 260 } }}>
            <Typography variant="subtitle2" color="text.secondary">
              TIMER CONTEXT
            </Typography>
            <TextField select size="small" label="Subject" value={subject} onChange={(e) => { setSubject(e.target.value); setChapterId(""); }}>
              {SUBJECTS.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </TextField>
            <TextField select size="small" label="Chapter" value={chapterId} onChange={(e) => setChapterId(e.target.value)}>
              <MenuItem value="">— none —</MenuItem>
              {chapterOptions.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </TextField>
            <TextField select size="small" label="Study type" value={type} onChange={(e) => setType(e.target.value)}>
              {STUDY_TYPES.filter((t) => t.value !== "mock_test").map((t) => (
                <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
              ))}
            </TextField>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
