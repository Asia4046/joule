"use client";

import { useMemo } from "react";
import katex from "katex";
import Box from "@mui/material/Box";
import "katex/dist/katex.min.css";

/** Renders a TeX string with KaTeX. Safe for concept pages (content is authored, not user input). */
export function TeX({ tex, display = false }: { tex: string; display?: boolean }) {
  const html = useMemo(
    () =>
      katex.renderToString(tex, {
        displayMode: display,
        throwOnError: false,
        output: "html",
      }),
    [tex, display]
  );
  return <Box dangerouslySetInnerHTML={{ __html: html }} sx={{ display: display ? "block" : "inline-block" }} />;
}
