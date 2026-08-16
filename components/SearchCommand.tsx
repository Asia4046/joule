"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Dialog from "@mui/material/Dialog";
import InputBase from "@mui/material/InputBase";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import SearchIcon from "@mui/icons-material/SearchOutlined";

type Result = { type: string; label: string; sub: string; href: string };

export default function SearchCommand({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results ?? []);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  function go(href: string) {
    onClose();
    router.push(href);
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" sx={{ "& .MuiDialog-container": { alignItems: "flex-start", pt: "10vh" } }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderBottom: "1px solid rgba(128,128,140,0.2)" }}>
          <SearchIcon fontSize="small" color="action" />
          <InputBase
            inputRef={inputRef}
            autoFocus
            fullWidth
            placeholder="Search chapters, tests, journal, mistakes…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "Enter" && results[0]) go(results[0].href);
            }}
          />
        </div>
        <List dense disablePadding sx={{ maxHeight: 380, overflowY: "auto", py: 1 }}>
          {loading && <Typography variant="body2" sx={{ px: 2, py: 1 }} color="text.secondary">Searching…</Typography>}
          {!loading && query.length >= 2 && results.length === 0 && (
            <Typography variant="body2" sx={{ px: 2, py: 1 }} color="text.secondary">No results found.</Typography>
          )}
          {results.map((r, i) => (
            <ListItemButton key={i} onClick={() => go(r.href)} sx={{ px: 2 }}>
              <ListItemText
                primary={r.label}
                primaryTypographyProps={{ noWrap: true, fontSize: "0.875rem" }}
                secondary={r.sub}
              />
              <Chip label={r.type} size="small" variant="outlined" />
            </ListItemButton>
          ))}
        </List>
      </div>
    </Dialog>
  );
}
