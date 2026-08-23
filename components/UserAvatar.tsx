"use client";

import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import { J, withA, type BeanName } from "@/lib/jellybeans";

/**
 * Sidebar-scale user tile: linked profile picture (if set and loaded) → emoji
 * on its bean → initials on ink. Remote image failures fall back down the
 * chain instead of rendering a broken image.
 */
export default function UserAvatar({
  name,
  emoji,
  bean,
  url,
  size = 32,
}: {
  name: string;
  emoji: string;
  bean: BeanName;
  url?: string;
  size?: number;
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const imageBroken = url != null && url === failedUrl;

  useEffect(() => {
    // a server-rendered <img> can fail before hydration, so onError alone misses it
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth === 0) setFailedUrl(url ?? "");
  }, [url]);

  if (url && !imageBroken) {
    return (
      <Box
        component="img"
        ref={imgRef}
        src={url}
        alt=""
        aria-hidden
        onError={() => setFailedUrl(url)}
        sx={{
          width: size,
          height: size,
          borderRadius: "2px",
          objectFit: "cover",
          border: "1px solid",
          borderColor: "divider",
          flexShrink: 0,
          display: "flex",
        }}
      />
    );
  }

  if (emoji) {
    const b = J.bean[bean];
    return (
      <Box
        aria-hidden
        sx={{
          width: size,
          height: size,
          borderRadius: "2px",
          bgcolor: b.fill,
          border: `1px solid ${withA(b.deep, 0.55)}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: `${size * 0.52}px`,
          lineHeight: 1,
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        {emoji}
      </Box>
    );
  }

  return (
    <Box
      aria-hidden
      sx={{
        width: size,
        height: size,
        borderRadius: "2px",
        bgcolor: "text.primary",
        color: "background.default",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
          fontSize: `${size * 0.36}px`,
          fontWeight: 800,
          flexShrink: 0,
          overflow: "hidden",
      }}
    >
      {initials}
    </Box>
  );
}
