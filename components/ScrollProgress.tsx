"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import { useAccent } from "@/components/Providers";

/**
 * Reading-progress rule — a 2px ink bar along the bottom edge of the AppBar
 * that fills as the page scrolls. Transform-only, rAF-throttled, and inert
 * under prefers-reduced-motion.
 */
export default function ScrollProgress() {
  const theme = useTheme();
  const accent = useAccent();
  const dark = theme.palette.mode === "dark";
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const c = dark ? accent.fill : accent.deep;

  return (
    <Box
      aria-hidden
      sx={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: -1,
        height: 2,
        pointerEvents: "none",
        // hairline track so the rule reads even at 0% on long pages
        bgcolor: dark ? "rgba(222,213,198,0.10)" : "rgba(34,31,26,0.08)",
      }}
    >
      <Box
        sx={{
          height: "100%",
          width: "100%",
          transformOrigin: "0 50%",
          transform: `scaleX(${progress})`,
          transition: reduced ? "none" : "transform .12s linear",
          bgcolor: c,
        }}
      />
    </Box>
  );
}
