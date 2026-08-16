"use client";

import { useEffect, useRef, useState } from "react";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTheme, alpha } from "@mui/material/styles";
import Popper from "@mui/material/Popper";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import AutorenewOutlinedIcon from "@mui/icons-material/AutorenewOutlined";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import LocalFireDepartmentOutlinedIcon from "@mui/icons-material/LocalFireDepartmentOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";

type Item = { id: string; kind: string; message: string; read: boolean; createdAt: string };

const kindIcon: Record<string, React.ReactNode> = {
  revision: <AutorenewOutlinedIcon fontSize="small" />,
  goal: <FlagOutlinedIcon fontSize="small" />,
  streak: <LocalFireDepartmentOutlinedIcon fontSize="small" />,
  mock_test: <AssignmentOutlinedIcon fontSize="small" />,
  info: <InfoOutlinedIcon fontSize="small" />,
};

const kindColor: Record<string, "warning" | "primary" | "error" | "success" | "info"> = {
  revision: "warning",
  goal: "primary",
  streak: "error",
  mock_test: "success",
  info: "info",
};

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NotificationBell() {
  const [items, setItems] = useState<Item[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const theme = useTheme();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/notifications");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          setItems(data.items ?? []);
          setUnread(data.unread ?? 0);
        }
      } catch {
        // offline — silently keep empty state
      }
    }
    void load();
    const t = setInterval(load, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  async function markAllRead() {
    setUnread(0);
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
  }

  return (
    <>
      <IconButton
        ref={anchorRef}
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications${unread ? ` (${unread} unread)` : ""}`}
        aria-expanded={open}
      >
        <Badge color="error" variant={unread ? "dot" : "standard"} invisible={unread === 0}>
          <NotificationsOutlinedIcon />
        </Badge>
      </IconButton>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement="bottom-end"
        sx={{ zIndex: theme.zIndex.appBar + 1, width: { xs: 320, sm: 380 } }}
      >
        <ClickAwayListener onClickAway={() => setOpen(false)}>
          <Card elevation={8} sx={{ mt: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2, py: 1.25 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Notifications {unread > 0 && `(${unread})`}
            </Typography>
            {unread > 0 && (
              <Button size="small" onClick={markAllRead}>
                Mark all read
              </Button>
            )}
          </Stack>
          <Divider />
          <Box sx={{ maxHeight: 360, overflowY: "auto" }}>
            {items.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 3, textAlign: "center" }}>
                You&apos;re all caught up.
              </Typography>
            ) : (
              items.map((n) => (
                <Stack
                  key={n.id}
                  direction="row"
                  spacing={1.25}
                  sx={{
                    px: 2,
                    py: 1.25,
                    alignItems: "flex-start",
                    bgcolor: n.read ? "transparent" : alpha(theme.palette.primary.main, 0.06),
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Box sx={{ color: `${kindColor[n.kind] ?? "info"}.main`, mt: 0.25, display: "flex" }}>
                    {kindIcon[n.kind] ?? <InfoOutlinedIcon fontSize="small" />}
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2">{n.message}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {timeAgo(n.createdAt)}
                    </Typography>
                  </Box>
                </Stack>
              ))
            )}
          </Box>
          </Card>
        </ClickAwayListener>
      </Popper>
    </>
  );
}
