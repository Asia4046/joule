"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

const QUOTES = [
  { text: "Little by little, one travels far.", author: "J.R.R. Tolkien" },
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "It always seems impossible until it is done.", author: "Nelson Mandela" },
  { text: "Small daily improvements are the key to staggering long-term results.", author: "Robin Sharma" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Don't watch the clock; do what it does — keep going.", author: "Sam Levenson" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "Fall seven times, stand up eight.", author: "Japanese proverb" },
  { text: "A river cuts through rock not because of its power, but its persistence.", author: "James N. Watkins" },
  { text: "What we do every day matters more than what we do once in a while.", author: "Gretchen Rubin" },
  { text: "The best time to plant a tree was twenty years ago. The second best time is now.", author: "Chinese proverb" },
  { text: "You do not rise to the level of your goals; you fall to the level of your systems.", author: "James Clear" },
  { text: "Study while others are sleeping; work while others are loafing.", author: "William A. Ward" },
];

function useNow() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

/** Live clock with a quiet "day elapsed" bar — sits on the ink rail. */
export function ClockCard() {
  const now = useNow();
  const time = now ?? new Date(0);
  const hh = String(time.getHours()).padStart(2, "0");
  const mm = String(time.getMinutes()).padStart(2, "0");
  const dayPct = ((time.getHours() * 60 + time.getMinutes()) / 1440) * 100;

  return (
    <Box
      sx={{
        p: 1.75,
        border: "1.5px solid #57544C",
        boxShadow: "3px 3px 0 #000",
        bgcolor: "#2A2926",
      }}
    >
      <Stack direction="row" alignItems="baseline" spacing={0.75}>
        <Typography
          className="jee-serif jee-num"
          sx={{ fontSize: "1.7rem", fontWeight: 600, color: "#F0EEE6", lineHeight: 1, letterSpacing: "0.02em" }}
        >
          {now ? `${hh}:${mm}` : "--:--"}
        </Typography>
        <Typography variant="caption" sx={{ color: "rgba(240,238,230,0.55)", fontWeight: 600 }}>
          {now ? time.toLocaleDateString("en-IN", { weekday: "short" }) : ""}
        </Typography>
      </Stack>
      <Typography variant="caption" sx={{ color: "rgba(240,238,230,0.55)", display: "block", mt: 0.5, fontWeight: 500 }}>
        {now
          ? time.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
          : " "}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={dayPct}
        sx={{
          mt: 1.25,
          height: 4,
          bgcolor: "rgba(240,238,230,0.15)",
          "& .MuiLinearProgress-bar": { backgroundColor: "#D97757" },
        }}
      />
      <Typography variant="caption" sx={{ color: "rgba(240,238,230,0.4)", display: "block", mt: 0.5, fontSize: "0.6rem" }}>
        {Math.round(dayPct)}% of today
      </Typography>
    </Box>
  );
}

/** Deterministic daily study quote — no APIs, rotates with the date. */
export function QuoteCard() {
  const quote = useMemo(() => {
    const now = new Date();
    const dayOfYear = Math.floor(
      (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
    );
    return QUOTES[dayOfYear % QUOTES.length];
  }, []);

  return (
    <Box
      sx={{
        p: 1.75,
        border: "1.5px solid #57544C",
        boxShadow: "3px 3px 0 #000",
        bgcolor: "#2A2926",
      }}
    >
      <Typography
        className="jee-serif"
        sx={{ fontSize: "1.4rem", lineHeight: 0.6, color: "#D97757", fontWeight: 600 }}
      >
        &ldquo;
      </Typography>
      <Typography
        className="jee-serif"
        sx={{ fontSize: "0.8rem", fontStyle: "italic", color: "rgba(240,238,230,0.9)", lineHeight: 1.55 }}
      >
        {quote.text}
      </Typography>
      <Typography variant="caption" sx={{ color: "rgba(240,238,230,0.45)", display: "block", mt: 0.75, fontWeight: 600 }}>
        — {quote.author}
      </Typography>
    </Box>
  );
}
