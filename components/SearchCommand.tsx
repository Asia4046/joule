"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import InputBase from "@mui/material/InputBase";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import SearchIcon from "@mui/icons-material/SearchOutlined";
import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";

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
      } catch {
        setResults([]);
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
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="jee-search-dialog-title"
      sx={{ "& .MuiDialog-container": { alignItems: "flex-start", pt: "10vh" } }}
    >
      <DialogTitle
        id="jee-search-dialog-title"
        sx={{
          position: "absolute",
          width: 1,
          height: 1,
          p: 0,
          overflow: "hidden",
          clipPath: "inset(50%)",
          whiteSpace: "nowrap",
        }}
      >
        Search
      </DialogTitle>
      <Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 2,
            py: 1.5,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
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
        </Box>
        <List dense disablePadding sx={{ maxHeight: 380, overflowY: "auto", py: 1 }}>
          {loading && (
            <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 2, py: 1 }}>
              <CircularProgress size={16} thickness={4} />
              <Typography variant="body2" color="text.secondary">
                Searching…
              </Typography>
            </Stack>
          )}
          {!loading && query.trim().length >= 2 && results.length === 0 && (
            <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 2, py: 1.5 }}>
              <SearchOffOutlinedIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                No results found.
              </Typography>
            </Stack>
          )}
          {results.map((r, i) => (
            <ListItemButton key={`${r.href}-${i}`} onClick={() => go(r.href)} sx={{ px: 2 }}>
              <ListItemText
                primary={r.label}
                primaryTypographyProps={{ noWrap: true, fontSize: "0.875rem" }}
                secondary={r.sub}
              />
              <Chip label={r.type} size="small" variant="outlined" />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Dialog>
  );
}
