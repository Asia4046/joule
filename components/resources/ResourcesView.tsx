"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SearchIcon from "@mui/icons-material/Search";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { EmptyState, PageHeader } from "@/components/ui";
import { RESOURCE_TYPES, SUBJECT_COLORS, labelFor } from "@/lib/constants";
import { deleteResourceAction, toggleResourceFlagAction } from "@/app/actions/data";
import ResourceFormDialog from "./ResourceFormDialog";

export type ResourceItem = {
  id: string;
  type: string;
  title: string;
  url: string | null;
  subject: string | null;
  tags: string;
  favorite: boolean;
  completed: boolean;
};

export default function ResourcesView({ resources }: { resources: ResourceItem[] }) {
  const [typeFilter, setTypeFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return resources.filter((r) => {
      if (typeFilter !== "all" && r.type !== typeFilter) return false;
      if (favoritesOnly && !r.favorite) return false;
      if (q && !(r.title.toLowerCase().includes(q) || r.tags.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [resources, typeFilter, query, favoritesOnly]);

  const favoriteCount = resources.filter((r) => r.favorite).length;

  return (
    <Box>
      <PageHeader
        title="Resources"
        subtitle={`${resources.length} saved resource${resources.length === 1 ? "" : "s"}${favoriteCount ? ` · ${favoriteCount} favorite${favoriteCount === 1 ? "" : "s"}` : ""}`}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
            Add resource
          </Button>
        }
      />

      <Card>
        <CardContent>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2 }} alignItems={{ sm: "center" }}>
            <TextField
              size="small"
              label="Search"
              placeholder="Title or tag…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              sx={{ minWidth: { sm: 240 } }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Chip
              label="Favorites"
              size="small"
              icon={<StarIcon />}
              variant={favoritesOnly ? "filled" : "outlined"}
              color={favoritesOnly ? "primary" : "default"}
              onClick={() => setFavoritesOnly((v) => !v)}
              sx={{ height: 34 }}
            />
            <Box sx={{ flex: 1 }} />
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              <Chip
                label="All"
                size="small"
                variant={typeFilter === "all" ? "filled" : "outlined"}
                color={typeFilter === "all" ? "primary" : "default"}
                onClick={() => setTypeFilter("all")}
              />
              {RESOURCE_TYPES.map((t) => (
                <Chip
                  key={t.value}
                  label={t.label}
                  size="small"
                  variant={typeFilter === t.value ? "filled" : "outlined"}
                  color={typeFilter === t.value ? "primary" : "default"}
                  onClick={() => setTypeFilter(t.value)}
                />
              ))}
            </Stack>
          </Stack>

          {resources.length === 0 ? (
            <EmptyState
              title="Save your first resource."
              description="Keep books, videos, PDFs and problem sets in one place so you always know what to study from."
              action={
                <Button variant="contained" onClick={() => setOpen(true)}>
                  Add resource
                </Button>
              }
            />
          ) : filtered.length === 0 ? (
            <EmptyState title="No resources match your filters." description="Try a different type, clear the search, or turn off favorites-only." />
          ) : (
            <Stack spacing={1.25}>
              {filtered.map((r) => {
                const tags = r.tags.split(",").map((t) => t.trim()).filter(Boolean);
                return (
                  <Card key={r.id} variant="outlined" sx={{ bgcolor: "transparent" }}>
                    <CardContent sx={{ p: 1.75, "&:last-child": { pb: 1.75 } }}>
                      <Stack direction="row" spacing={1} alignItems="flex-start">
                        <form action={toggleResourceFlagAction}>
                          <input type="hidden" name="id" value={r.id} />
                          <input type="hidden" name="field" value="completed" />
                          <input type="hidden" name="value" value={String(!r.completed)} />
                          <Checkbox size="small" checked={r.completed} onChange={(e) => e.currentTarget.form?.requestSubmit()} sx={{ mt: -0.5, ml: -1 }} aria-label={`Mark ${r.title} completed`} />
                        </form>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, textDecoration: r.completed ? "line-through" : "none", opacity: r.completed ? 0.6 : 1 }}
                            >
                              {r.url ? (
                                <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>
                                  {r.title}
                                </a>
                              ) : (
                                r.title
                              )}
                            </Typography>
                            <Chip label={labelFor(RESOURCE_TYPES, r.type)} size="small" variant="outlined" />
                            {r.subject && (
                              <Chip
                                label={r.subject}
                                size="small"
                                variant="outlined"
                                sx={{ borderColor: SUBJECT_COLORS[r.subject] ?? undefined }}
                              />
                            )}
                            {tags.map((t) => (
                              <Chip key={t} label={t} size="small" variant="outlined" sx={{ height: 20, "& .MuiChip-label": { px: 0.75, fontSize: "0.68rem" } }} />
                            ))}
                          </Stack>
                        </Box>
                        <Stack direction="row" spacing={0.25} alignItems="center">
                          <form action={toggleResourceFlagAction}>
                            <input type="hidden" name="id" value={r.id} />
                            <input type="hidden" name="field" value="favorite" />
                            <input type="hidden" name="value" value={String(!r.favorite)} />
                            <IconButton size="small" type="submit" aria-label={`Toggle favorite for ${r.title}`}>
                              {r.favorite ? <StarIcon fontSize="small" color="warning" /> : <StarBorderIcon fontSize="small" />}
                            </IconButton>
                          </form>
                          <form action={deleteResourceAction}>
                            <input type="hidden" name="id" value={r.id} />
                            <IconButton
                              size="small"
                              type="submit"
                              aria-label={`Delete ${r.title}`}
                              onClick={(e) => {
                                if (!window.confirm(`Delete "${r.title}"?`)) e.preventDefault();
                              }}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </form>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>
          )}
        </CardContent>
      </Card>

      <ResourceFormDialog open={open} onClose={() => setOpen(false)} />
    </Box>
  );
}
