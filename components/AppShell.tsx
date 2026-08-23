"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import BrandMark from "@/components/BrandMark";
import AppBar from "@mui/material/AppBar";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import SearchIcon from "@mui/icons-material/SearchOutlined";
import SearchCommand from "@/components/SearchCommand";
import NotificationBell from "@/components/NotificationBell";
import UserAvatar from "@/components/UserAvatar";
import { ClockCard, QuoteCard } from "@/components/SidebarWidgets";
import { useThemeMode, useAccent } from "@/components/Providers";
import { NAV, MOBILE_NAV } from "@/lib/nav";
import { J, withA, type BeanName } from "@/lib/jellybeans";

const SIDEBAR_WIDTH = 264;

function Brand() {
  const theme = useTheme();
  const dark = theme.palette.mode === "dark";
  const ink = dark ? J.boneDark : J.inkLight;
  return (
    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ px: 0.5 }}>
      <Box sx={{ boxShadow: `3px 3px 0 ${dark ? "rgba(0,0,0,0.8)" : "rgba(34,31,26,0.18)"}` }}>
        <BrandMark size={38} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          className="jee-display"
          sx={{ fontWeight: 700, fontSize: "0.92rem", color: ink, lineHeight: 1.15, letterSpacing: "0.05em" }}
        >
          JOULE
        </Typography>
        <Stack direction="row" spacing={0.6} alignItems="center" sx={{ mt: 0.4 }}>
          {Object.values(J.bean).map((b) => (
            <Box key={b.fill} sx={{ width: 5, height: 5, borderRadius: 999, bgcolor: dark ? b.fill : b.deep }} />
          ))}
        </Stack>
      </Box>
    </Stack>
  );
}

function SidebarContent({
  pathname,
  userName,
  avatar,
  hour12,
}: {
  pathname: string;
  userName: string;
  avatar?: { emoji: string; bean: BeanName; url?: string };
  hour12?: boolean;
}) {
  const theme = useTheme();
  const dark = theme.palette.mode === "dark";
  const ink = dark ? J.boneDark : J.inkLight;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: dark ? J.railDark : J.paperLight,
        borderRight: `1px solid ${dark ? J.hairDark : J.hairLight}`,
      }}
    >
      <Box sx={{ px: 2.25, pt: 2.5, pb: 2 }}>
        <Brand />
      </Box>
      <Box sx={{ px: 2, pb: 2 }}>
        <ClockCard hour12={hour12} />
      </Box>
      <Box sx={{ px: 1.5, flex: 1, overflowY: "auto", pb: 1 }}>
        {NAV.map((group, gi) => {
          const bean = J.bean[group.bean];
          const beanColor = dark ? bean.fill : bean.deep;
          return (
            <Box key={group.section} sx={{ mb: 1.5 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 1.5, py: 0.5 }}>
                <Typography
                  className="jee-mono"
                  sx={{ fontWeight: 700, letterSpacing: "0.12em", fontSize: "0.6rem", color: beanColor }}
                >
                  {String(gi + 1).padStart(2, "0")}
                </Typography>
                <Typography
                  className="jee-mono"
                  variant="caption"
                  sx={{ fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", fontSize: "0.6rem", color: "text.secondary" }}
                >
                  {group.section}
                </Typography>
              </Stack>
              <List dense disablePadding sx={{ display: "grid", gap: 0.5 }}>
                {group.items.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <ListItemButton
                      key={item.href}
                      component={Link}
                      href={item.href}
                      sx={{
                        minHeight: 36,
                        position: "relative",
                        px: 1.5,
                        borderRadius: "2px",
                        border: `1px solid ${active ? (dark ? J.boneDark : J.inkLight) : "transparent"}`,
                        borderLeft: `3px solid ${active ? beanColor : "transparent"}`,
                        transition: "all .16s ease",
                        ...(active
                          ? {
                              bgcolor: dark ? J.boneDark : J.inkLight,
                              color: dark ? J.paperDark : "#FAF7EF",
                              "&.Mui-selected": { bgcolor: dark ? J.boneDark : J.inkLight, color: dark ? J.paperDark : "#FAF7EF" },
                              "&.Mui-selected:hover": { bgcolor: dark ? "#EFE8DA" : "#3D3931" },
                              "&:hover": { bgcolor: dark ? "#EFE8DA" : "#3D3931" },
                            }
                          : {
                              color: "text.secondary",
                              "&.Mui-selected": { bgcolor: "transparent", color: "text.secondary" },
                              "&:hover": {
                                bgcolor: dark ? withA(J.boneDark, 0.07) : withA(J.inkLight, 0.05),
                                color: dark ? J.boneDark : J.inkLight,
                                transform: "translateX(2px)",
                              },
                            }),
                        "& .MuiListItemIcon-root": {
                          minWidth: 34,
                          color: active ? "inherit" : undefined,
                        },
                      }}
                      selected={active}
                    >
                      <ListItemIcon sx={{ minWidth: 34 }}>
                        <item.icon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{ fontSize: "0.85rem", fontWeight: active ? 700 : 500 }}
                      />
                    </ListItemButton>
                  );
                })}
              </List>
            </Box>
          );
        })}
      </Box>
      <Box sx={{ px: 2, pb: 1.5 }}>
        <QuoteCard />
      </Box>
      <Box sx={{ px: 1.5, pt: 0.5, pb: 1.5 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            p: 1.25,
            borderRadius: "2px",
            border: `1px solid ${dark ? J.hairDark : J.hairLight}`,
            bgcolor: dark ? J.cardDark : J.cardLight,
          }}
        >
          <UserAvatar
            name={userName}
            emoji={avatar?.emoji ?? ""}
            bean={avatar?.bean ?? "bubblegum"}
            url={avatar?.url}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.8rem", color: ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {userName}
            </Typography>
            <Typography className="jee-mono" variant="caption" sx={{ color: "text.secondary", fontSize: "0.6rem", letterSpacing: "0.08em" }}>
              SIGNED IN
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default function AppShell({
  children,
  userName,
  avatar,
  hour12,
}: {
  children: React.ReactNode;
  userName: string;
  avatar?: { emoji: string; bean: BeanName; url?: string };
  hour12?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const { resolved, setMode } = useThemeMode();
  const accent = useAccent();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const dark = resolved === "dark";

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot sync: close the drawer when the route changes
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const chrome = dark
    ? {
        bar: "rgba(10,9,8,0.82)",
        line: J.hairDark,
        field: J.fieldDark,
        fieldLine: J.hairDarkStrong,
      }
    : {
        bar: "rgba(250,247,239,0.85)",
        line: J.hairLight,
        field: "#FFFFFF",
        fieldLine: "#CFC7B4",
      };

  return (
    <Box sx={{ display: "flex", minHeight: "100dvh", bgcolor: "background.default" }}>
      {/* Desktop sidebar */}
      <Box
        component="nav"
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          display: { xs: "none", md: "block" },
          position: "sticky",
          top: 0,
          height: "100dvh",
        }}
      >
        <SidebarContent pathname={pathname} userName={userName} avatar={avatar} hour12={hour12} />
      </Box>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ display: { xs: "block", md: "none" }, "& .MuiDrawer-paper": { width: SIDEBAR_WIDTH, border: "none", bgcolor: dark ? J.railDark : J.paperLight } }}
      >
        <SidebarContent pathname={pathname} userName={userName} avatar={avatar} hour12={hour12} />
      </Drawer>

      <Box sx={{ flexGrow: 1, minWidth: 0, pb: { xs: 10, md: 0 } }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: chrome.bar,
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid",
            borderBottomColor: chrome.line,
            color: "text.primary",
          }}
        >
          <Toolbar
            sx={{
              gap: 1,
              flexWrap: { xs: "wrap", sm: "nowrap" },
              py: { xs: 1, sm: 0 },
            }}
          >
            {!isDesktop && (
              <IconButton edge="start" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
                <MenuOutlinedIcon />
              </IconButton>
            )}
            <Paper
              component="button"
              onClick={() => setSearchOpen(true)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 2,
                py: 0.75,
                cursor: "pointer",
                width: { xs: "100%", sm: 380 },
                textAlign: "left",
                bgcolor: chrome.field,
                border: "1px solid",
                borderColor: chrome.fieldLine,
                borderRadius: "2px",
                boxShadow: "none",
                transition: "border-color .16s ease, background-color .16s ease",
                "&:hover": {
                  borderColor: dark ? J.boneDark : J.inkLight,
                  bgcolor: dark ? "#171411" : "#FFFFFF",
                },
                "&:focus-visible": {
                  outline: `2px solid ${dark ? accent.fill : accent.deep}`,
                  outlineOffset: 2,
                },
              }}
            >
              <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                Search chapters, tests, journal…
              </Typography>
              <Typography
                className="jee-mono"
                variant="caption"
                color="text.secondary"
                sx={{
                  display: { xs: "none", sm: "block" },
                  border: "1px dashed",
                  borderColor: dark ? J.hairDarkStrong : "#CFC7B4",
                  borderRadius: "2px",
                  px: 0.75,
                  py: 0.25,
                  fontSize: "0.62rem",
                  fontWeight: 600,
                }}
              >
                CTRL K
              </Typography>
            </Paper>
            <Box sx={{ flexGrow: 1 }} />
            <NotificationBell />
            <Tooltip title={dark ? "Light mode" : "Dark mode"}>
              <IconButton
                onClick={() => setMode(dark ? "light" : "dark")}
                aria-label="Toggle theme"
                sx={{
                  transition: "transform .25s ease",
                  "&:hover": { transform: "rotate(15deg)" },
                }}
              >
                {dark ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Log out">
              <IconButton onClick={logout} aria-label="Log out">
                <LogoutOutlinedIcon />
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ p: { xs: 1.5, sm: 2.5, md: 3 }, maxWidth: 1280, mx: "auto" }}>
          <Box key={pathname} className="jee-page-enter">
            {children}
          </Box>
        </Box>
      </Box>

      {/* Mobile bottom nav */}
      <Paper
        component="nav"
        aria-label="Primary"
        square
        elevation={0}
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          display: { xs: "flex", md: "none" },
          zIndex: theme.zIndex.appBar,
          borderTop: "1px solid",
          borderColor: chrome.line,
          bgcolor: dark ? "rgba(16,15,13,0.96)" : "rgba(250,247,239,0.96)",
          backdropFilter: "blur(12px)",
        }}
      >
        {MOBILE_NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          const meta = NAV.find((g) => g.items.some((it) => it.href === item.href));
          const bean = meta ? J.bean[meta.bean] : J.bean.bubblegum;
          const beanColor = dark ? bean.fill : bean.deep;
          return (
            <Box
              key={item.href}
              component={Link}
              href={item.href}
              aria-current={active ? "page" : undefined}
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0.25,
                py: 1,
                color: active ? (dark ? J.boneDark : J.inkLight) : "text.secondary",
                textDecoration: "none",
                borderTop: `3px solid ${active ? beanColor : "transparent"}`,
                transition: "border-color .18s ease, color .18s ease, background-color .18s ease",
                "&:focus-visible": {
                  outline: `2px solid ${dark ? accent.fill : accent.deep}`,
                  outlineOffset: "-2px",
                },
              }}
            >
              <item.icon fontSize="small" />
              <Typography variant="caption" sx={{ fontSize: "0.65rem", fontWeight: active ? 700 : 500 }}>
                {item.label}
              </Typography>
            </Box>
          );
        })}
      </Paper>

      <SearchCommand open={searchOpen} onClose={() => setSearchOpen(false)} />
    </Box>
  );
}
