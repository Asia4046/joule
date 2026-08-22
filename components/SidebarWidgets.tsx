"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { J } from "@/lib/jellybeans";

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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot sync with the clock (external system); null on server to avoid hydration mismatch
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

/** Live clock dossier tile — Space Grotesk time over a segmented day bar. */
export function ClockCard() {
  const theme = useTheme();
  const dark = theme.palette.mode === "dark";
  const now = useNow();
  const time = now ?? new Date(0);
  const hh = String(time.getHours()).padStart(2, "0");
  const mm = String(time.getMinutes()).padStart(2, "0");
  const dayPct = ((time.getHours() * 60 + time.getMinutes()) / 1440) * 100;
  const segments = 12;
  const filled = Math.round((dayPct / 100) * segments);

  return (
    <Box
      sx={{
        p: 1.75,
        borderRadius: "2px",
        border: `1px solid ${dark ? J.hairDark : J.hairLight}`,
        bgcolor: dark ? J.cardDark : J.cardLight,
      }}
    >
      <Stack direction="row" alignItems="baseline" justifyContent="space-between">
        <Typography
          className="jee-display jee-num"
          sx={{ fontSize: "1.7rem", fontWeight: 700, color: "text.primary", lineHeight: 1, letterSpacing: "0.01em" }}
        >
          {now ? (
            <>
              {hh}
              <Box component="span" className="jee-pulse" sx={{ mx: "1px" }}>
                :
              </Box>
              {mm}
            </>
          ) : (
            "--:--"
          )}
        </Typography>
        <Typography className="jee-mono" variant="caption" sx={{ color: "text.secondary", fontWeight: 600, letterSpacing: "0.08em" }}>
          {now ? time.toLocaleDateString("en-IN", { weekday: "short" }).toUpperCase() : ""}
        </Typography>
      </Stack>
      <Typography className="jee-mono" variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.5, fontSize: "0.64rem", letterSpacing: "0.04em" }}>
        {now
          ? time.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()
          : " "}
      </Typography>
      <Stack direction="row" spacing="3px" sx={{ mt: 1.25 }} aria-hidden>
        {Array.from({ length: segments }).map((_, i) => (
          <Box
            key={i}
            sx={{
              flex: 1,
              height: 5,
              borderRadius: 999,
              bgcolor:
                i < filled
                  ? dark
                    ? J.bean.bubblegum.fill
                    : J.bean.bubblegum.deep
                  : dark
                    ? "rgba(222,213,198,0.12)"
                    : "#ECE6D6",
            }}
          />
        ))}
      </Stack>
      <Typography className="jee-mono" variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.5, fontSize: "0.62rem" }}>
        {Math.round(dayPct)}% OF TODAY
      </Typography>
    </Box>
  );
}

/** Deterministic daily study quote — no APIs, rotates with the date. */
export function QuoteCard() {
  const theme = useTheme();
  const dark = theme.palette.mode === "dark";
  const dayOfYear = useMemo(() => {
    const now = new Date();
    return Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
  }, []);
  const quote = QUOTES[dayOfYear % QUOTES.length];

  return (
    <Box
      sx={{
        p: 1.75,
        borderRadius: "2px",
        border: `1px solid ${dark ? J.hairDark : J.hairLight}`,
        bgcolor: dark ? J.cardDark : J.cardLight,
      }}
    >
      <Typography
        className="jee-mono"
        sx={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.16em", color: dark ? J.bean.bubblegum.fill : J.bean.bubblegum.deep, mb: 0.75 }}
      >
        DAILY BRIEF · {String(dayOfYear).padStart(3, "0")}/365
      </Typography>
      <Typography
        variant="body2"
        sx={{ fontStyle: "italic", color: "text.primary", lineHeight: 1.55, opacity: 0.88 }}
      >
        &ldquo;{quote.text}&rdquo;
      </Typography>
      <Typography className="jee-mono" variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.75, fontWeight: 600, letterSpacing: "0.06em" }}>
        — {quote.author.toUpperCase()}
      </Typography>
    </Box>
  );
}
