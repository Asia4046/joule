import Box from "@mui/material/Box";
import type { BoxProps } from "@mui/material/Box";
import { J } from "@/lib/jellybeans";

/**
 * The Joule brand mark — the exact favicon drawing (app/icon.svg): a bubblegum
 * tile with a licorice frame and the hooked J cut with square terminals.
 * Server-safe (no hooks); colors are fixed like the favicon, not mode-aware.
 */
export default function BrandMark({ size = 38, sx }: { size?: number; sx?: BoxProps["sx"] }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 64 64"
      aria-hidden
      sx={{ width: size, height: size, display: "block", flexShrink: 0, ...sx }}
    >
      <rect x="2" y="2" width="60" height="60" rx="6" fill={J.bean.bubblegum.fill} stroke={J.inkLight} strokeWidth="4" />
      <path
        d="M25 15 h14 v23 a10 10 0 0 1 -20 0 v-7"
        fill="none"
        stroke={J.inkLight}
        strokeWidth="9"
        strokeLinecap="square"
      />
    </Box>
  );
}
