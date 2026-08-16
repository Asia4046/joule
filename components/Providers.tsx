"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
  type Theme,
  CSSObject,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";

export type ThemeMode = "light" | "dark" | "system";
type Resolved = "light" | "dark";

const STORAGE_KEY = "jee-theme-mode";

const ThemeModeContext = createContext<{
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
}>({ mode: "system", setMode: () => {} });

export const useThemeMode = () => useContext(ThemeModeContext);

const shape = { borderRadius: 12 } as const;

// Shared typography — compact, information-dense, academic
const typography = {
  fontFamily: "var(--font-inter), system-ui, -apple-system, sans-serif",
  h4: { fontSize: "1.4rem", fontWeight: 800, letterSpacing: "-0.025em" },
  h5: { fontSize: "1.2rem", fontWeight: 750, letterSpacing: "-0.015em" },
  h6: { fontSize: "1rem", fontWeight: 700 },
  subtitle2: { fontWeight: 600 },
  body2: { fontSize: "0.8125rem" },
  button: { textTransform: "none" as const, fontWeight: 600 },
};

const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#4f46e5", dark: "#4338ca", light: "#818cf8" },
    secondary: { main: "#0d9488" },
    success: { main: "#059669" },
    warning: { main: "#d97706" },
    error: { main: "#dc2626" },
    info: { main: "#0284c7" },
    background: { default: "#f4f5fa", paper: "#ffffff" },
    text: { primary: "#1b1b22", secondary: "#6b6b78" },
    divider: "#e9e9f0",
  },
  shape,
  typography,
  components: {
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiCard: {
      defaultProps: { variant: "outlined" },
      styleOverrides: {
        root: {
          borderColor: "#e9e9f0",
          borderRadius: 14,
          boxShadow: "0 1px 2px rgba(16,16,20,0.04)",
          transition: "box-shadow .2s ease, transform .2s ease, border-color .2s ease",
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 10, transition: "all .2s ease" },
        containedPrimary: {
          background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
          boxShadow: "0 2px 10px rgba(79,70,229,.28)",
          "&:hover": {
            background: "linear-gradient(135deg, #4338ca, #6d28d9)",
            boxShadow: "0 4px 16px rgba(79,70,229,.38)",
            transform: "translateY(-1px)",
          },
          "&:active": { transform: "translateY(0)" },
        },
        containedSecondary: {
          boxShadow: "0 2px 10px rgba(13,148,136,.25)",
        },
        outlined: {
          "&:hover": { transform: "translateY(-1px)" },
        },
      },
    },
    MuiChip: {
      defaultProps: { size: "small" },
      styleOverrides: { root: { borderRadius: 999, fontWeight: 500 } },
    },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 10 } } },
    MuiAlert: { styleOverrides: { root: { borderRadius: 10 } } },
    MuiTooltip: {
      defaultProps: { arrow: true },
      styleOverrides: {
        tooltip: {
          backgroundColor: "#22222b",
          fontSize: "0.72rem",
          fontWeight: 500,
          borderRadius: 8,
          padding: "6px 10px",
        },
        arrow: { color: "#22222b" },
      },
    },
    MuiLinearProgress: {
      styleOverrides: { root: { borderRadius: 999 }, bar: { borderRadius: 999 } },
    },
    MuiTableCell: {
      styleOverrides: { root: { borderColor: "#eef0f5" } },
    },
    MuiTab: {
      styleOverrides: { root: { minHeight: 40, fontWeight: 600, textTransform: "none" as const } },
    },
    MuiTabs: {
      styleOverrides: { indicator: { borderRadius: 3, height: 3 } },
    },
    MuiToggleButton: {
      styleOverrides: { root: { borderRadius: 10 } },
    },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 16 } },
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#818cf8", dark: "#6366f1", light: "#a5b4fc" },
    secondary: { main: "#2dd4bf" },
    success: { main: "#34d399" },
    warning: { main: "#fbbf24" },
    error: { main: "#f87171" },
    info: { main: "#38bdf8" },
    background: { default: "#0b0b10", paper: "#14141b" },
    text: { primary: "#e9e9f0", secondary: "#9b9ba8" },
    divider: "#24242e",
  },
  shape,
  typography,
  components: {
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiCard: {
      defaultProps: { variant: "outlined" },
      styleOverrides: {
        root: {
          borderColor: "#24242e",
          backgroundColor: "#14141b",
          borderRadius: 14,
          boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
          transition: "box-shadow .2s ease, transform .2s ease, border-color .2s ease",
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 10, transition: "all .2s ease" },
        containedPrimary: {
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          boxShadow: "0 2px 12px rgba(99,102,241,.35)",
          "&:hover": {
            background: "linear-gradient(135deg, #5457e8, #7c4ded)",
            boxShadow: "0 4px 18px rgba(99,102,241,.45)",
            transform: "translateY(-1px)",
          },
          "&:active": { transform: "translateY(0)" },
        },
        outlined: {
          "&:hover": { transform: "translateY(-1px)" },
        },
      },
    },
    MuiChip: {
      defaultProps: { size: "small" },
      styleOverrides: { root: { borderRadius: 999, fontWeight: 500 } },
    },
    MuiOutlinedInput: {
      styleOverrides: { root: { borderRadius: 10, backgroundColor: "#0e0e13" } },
    },
    MuiAlert: { styleOverrides: { root: { borderRadius: 10 } } },
    MuiTooltip: {
      defaultProps: { arrow: true },
      styleOverrides: {
        tooltip: {
          backgroundColor: "#e9e9f0",
          color: "#1b1b22",
          fontSize: "0.72rem",
          fontWeight: 500,
          borderRadius: 8,
          padding: "6px 10px",
        },
        arrow: { color: "#e9e9f0" },
      },
    },
    MuiLinearProgress: {
      styleOverrides: { root: { borderRadius: 999 }, bar: { borderRadius: 999 } },
    },
    MuiTableCell: {
      styleOverrides: { root: { borderColor: "#1e1e27" } },
    },
    MuiTab: {
      styleOverrides: { root: { minHeight: 40, fontWeight: 600, textTransform: "none" as const } },
    },
    MuiTabs: {
      styleOverrides: { indicator: { borderRadius: 3, height: 3 } },
    },
    MuiToggleButton: {
      styleOverrides: { root: { borderRadius: 10 } },
    },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 16 } },
    },
  },
});

function GlobalThemeStyles() {
  return (
    <GlobalStyles
      styles={(theme: Theme) => ({
        "@keyframes jee-fade-up": {
          from: { opacity: 0, transform: "translateY(10px)" },
          to: { opacity: 1, transform: "none" },
        },
        "@keyframes jee-fade-in": {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        html: { scrollBehavior: "smooth" },
        "::selection": {
          backgroundColor: theme.palette.mode === "dark" ? "rgba(129,140,248,.35)" : "rgba(79,70,229,.18)",
        },
        "*::-webkit-scrollbar": { width: 8, height: 8 },
        "*::-webkit-scrollbar-track": { background: "transparent" },
        "*::-webkit-scrollbar-thumb": {
          borderRadius: 8,
          background: theme.palette.mode === "dark" ? "#2b2b36" : "#d5d5e0",
          "&:hover": { background: theme.palette.mode === "dark" ? "#38384a" : "#c2c2d0" },
        },
        ".jee-page-enter": {
          animation: "jee-fade-up .35s cubic-bezier(.22,1,.36,1) both",
        },
        ".jee-num": { fontVariantNumeric: "tabular-nums" },
      })}
    />
  );
}

// Elevation helper used by cards on colored surfaces
export const surfaceStyles = (theme: Theme): CSSObject => ({
  backgroundColor:
    theme.palette.mode === "dark" ? "#17171d" : "#ffffff",
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [resolved, setResolved] = useState<Resolved>("light");

  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as ThemeMode | null) ?? "system";
    setModeState(stored);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      setResolved(mode === "system" ? (mq.matches ? "dark" : "light") : mode);
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [mode]);

  const setMode = useCallback((m: ThemeMode) => {
    localStorage.setItem(STORAGE_KEY, m);
    setModeState(m);
  }, []);

  const theme = useMemo(() => (resolved === "dark" ? darkTheme : lightTheme), [resolved]);

  const ctx = useMemo(() => ({ mode, setMode }), [mode, setMode]);

  return (
    <ThemeModeContext.Provider value={ctx}>
      <AppRouterCacheProvider options={{ key: "mui" }}>
        <MuiThemeProvider theme={theme}>
          <CssBaseline enableColorScheme />
          <GlobalThemeStyles />
          {children}
        </MuiThemeProvider>
      </AppRouterCacheProvider>
    </ThemeModeContext.Provider>
  );
}
