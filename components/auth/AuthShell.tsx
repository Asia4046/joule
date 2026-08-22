"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import { useThemeMode } from "@/components/Providers";
import { J, withA } from "@/lib/jellybeans";

/** Paper backdrop with print registration marks — one squared dossier card
 * for the auth forms. Grain is applied globally. */
export default function AuthShell({ children, tagline }: { children: ReactNode; tagline: string }) {
  const { resolved } = useThemeMode();
  const dark = resolved === "dark";
  const ink = dark ? J.boneDark : J.inkLight;

  const mark = (position: Record<string, number | string>) => (
    <Box
      aria-hidden
      sx={{
        position: "absolute",
        width: 22,
        height: 22,
        borderColor: dark ? withA(J.boneDark, 0.35) : withA(J.inkLight, 0.3),
        ...position,
      }}
    />
  );

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        position: "relative",
        overflow: "hidden",
        bgcolor: dark ? J.paperDark : J.paperLight,
      }}
    >
      {/* print registration marks */}
      {mark({ top: 28, left: 28, borderTop: "1px solid", borderLeft: "1px solid" })}
      {mark({ top: 28, right: 28, borderTop: "1px solid", borderRight: "1px solid" })}
      {mark({ bottom: 28, left: 28, borderBottom: "1px solid", borderLeft: "1px solid" })}
      {mark({ bottom: 28, right: 28, borderBottom: "1px solid", borderRight: "1px solid" })}

      <Box sx={{ position: "relative", width: "100%", maxWidth: 400 }}>
        <Stack spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Box
            sx={{
              width: 54,
              height: 54,
              borderRadius: "2px",
              background: J.bean.bubblegum.fill,
              border: `1.5px solid ${ink}`,
              boxShadow: `4px 4px 0 ${dark ? "rgba(0,0,0,0.8)" : "rgba(34,31,26,0.18)"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography className="jee-display" sx={{ fontWeight: 700, fontSize: "1.6rem", color: "#221F1A", lineHeight: 1 }}>
              J
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography className="jee-display" sx={{ fontWeight: 700, fontSize: "1.35rem", letterSpacing: "0.02em" }}>
              JEE Command
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {tagline}
            </Typography>
          </Box>
          <Typography
            className="jee-mono"
            variant="caption"
            sx={{ fontSize: "0.6rem", letterSpacing: "0.16em", color: dark ? J.bean.bubblegum.fill : J.bean.bubblegum.deep, fontWeight: 700 }}
          >
            PREP DOSSIER · ACCESS {dark ? "NIGHT SHIFT" : "DAY SHIFT"}
          </Typography>
        </Stack>
        {children}
        <Typography
          className="jee-mono"
          variant="caption"
          sx={{
            display: "block",
            textAlign: "center",
            mt: 3,
            fontSize: "0.58rem",
            letterSpacing: "0.12em",
            color: "text.secondary",
          }}
        >
          PAPER {dark ? "#0A0908" : "#FAF7EF"} · INK {dark ? "#DED5C6" : "#221F1A"} · RADIUS 2 · GRAIN 5%
        </Typography>
      </Box>
    </Box>
  );
}
