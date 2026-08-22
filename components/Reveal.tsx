"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Box, { type BoxProps } from "@mui/material/Box";

/**
 * Scroll-reveal wrapper — fades content up once when it enters the viewport.
 * Content is always in the DOM (SEO/SSR-safe); without JS or under
 * prefers-reduced-motion it settles instantly.
 */
export default function Reveal({
  children,
  delay = 0,
  ...rest
}: { children: ReactNode; delay?: number } & BoxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot fallback: no IO support (ancient browsers), reveal immediately
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Box
      ref={ref}
      sx={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : "translateY(18px)",
        transitionProperty: "opacity, transform",
        transitionDuration: "0.55s",
        transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
        transitionDelay: `${delay}ms`,
        ...rest.sx,
      }}
      {...rest}
    >
      {children}
    </Box>
  );
}
