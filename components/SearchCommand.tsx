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
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
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

  // Keep the keyboard-selected result visible as arrows move past the fold.
  useEffect(() => {
    itemRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  function go(href: string) {
    onClose();
    router.push(href);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      onClose();
      return;
    }
    if (results.length === 0 || loading) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Home" || e.key === "End") {
      e.preventDefault(); // keep the text cursor from jumping
      setActiveIndex((i) => {
        if (e.key === "ArrowDown") return (i + 1) % results.length;
        if (e.key === "ArrowUp") return (i - 1 + results.length) % results.length;
        if (e.key === "Home") return 0;
        return results.length - 1;
      });
    }
    if (e.key === "Enter") {
      e.preventDefault();
      go(results[activeIndex]?.href ?? results[0].href);
    }
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
            onKeyDown={handleKeyDown}
            inputProps={{
              role: "combobox",
              "aria-expanded": results.length > 0,
              "aria-controls": "jee-search-results",
              "aria-activedescendant":
                results.length > 0 ? `jee-search-option-${activeIndex}` : undefined,
            }}
          />
        </Box>
        <Typography
          variant="caption"
          component="div"
          aria-live="polite"
          sx={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clipPath: "inset(50%)" }}
        >
          {loading ? "Searching" : results.length > 0 ? `${results.length} results` : ""}
        </Typography>
        <List
          id="jee-search-results"
          role="listbox"
          dense
          disablePadding
          sx={{ maxHeight: 380, overflowY: "auto", py: 1 }}
        >
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
            <ListItemButton
              key={`${r.href}-${i}`}
              id={`jee-search-option-${i}`}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              role="option"
              aria-selected={i === activeIndex}
              selected={i === activeIndex}
              onClick={() => go(r.href)}
              onMouseEnter={() => setActiveIndex(i)}
              sx={{ px: 2 }}
            >
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
