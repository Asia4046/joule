"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
  type Theme,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import { K, ka } from "@/lib/kanagawa";

export type ThemeMode = "light" | "dark" | "system";
type Resolved = "light" | "dark";

const STORAGE_KEY = "jee-theme-mode";

const ThemeModeContext = createContext<{
  mode: ThemeMode;
  resolved: Resolved;
  setMode: (m: ThemeMode) => void;
}>({ mode: "system", resolved: "dark", setMode: () => {} });

export const useThemeMode = () => useContext(ThemeModeContext);

const SANS = "var(--font-inter), system-ui, -apple-system, sans-serif";
const MONO = "var(--font-mono), ui-monospace, SFMono-Regular, Menlo, monospace";

const typography = {
  fontFamily: SANS,
  h1: { fontWeight: 650, letterSpacing: "-0.035em" },
  h2: { fontWeight: 650, letterSpacing: "-0.03em" },
  h3: { fontWeight: 650, letterSpacing: "-0.025em" },
  h4: { fontSize: "1.5rem", fontWeight: 650, letterSpacing: "-0.02em" },
  h5: { fontSize: "1.2rem", fontWeight: 600, letterSpacing: "-0.015em" },
  h6: { fontSize: "1.05rem", fontWeight: 600, letterSpacing: "-0.01em" },
  subtitle2: { fontWeight: 600 },
  body2: { fontSize: "0.8125rem" },
  button: { textTransform: "none" as const, fontWeight: 600, letterSpacing: "0" },
};

/**
 * Reference-grade skin: true black canvas, hairline white borders, flat
 * surfaces, neutral text. Color appears only in small marks and data.
 */
const skin = (theme: Theme) => {
  const up = theme.palette.mode === "dark";
  const primary = theme.palette.primary.main;
  return {
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: "none" } },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: 14,
          border: `1px solid ${up ? K.nightLine : K.washiDivider}`,
          backgroundColor: up ? K.night2 : theme.palette.background.paper,
          boxShadow: "none",
          transition: "border-color .2s ease, background-color .2s ease",
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 999, transition: "all .15s ease" },
        containedPrimary: {
          backgroundColor: up ? "#FAFAFA" : primary,
          color: up ? "#09090B" : "#FFFFFF",
          paddingLeft: 18,
          paddingRight: 18,
          "&:hover": {
            backgroundColor: up ? "#FFFFFF" : "#3A5787",
            transform: "translateY(-1px)",
          },
          "&:active": { transform: "translateY(0)" },
        },
        outlinedPrimary: {
          border: `1px solid ${up ? K.nightLine2 : "#4A6BA8"}`,
          color: up ? "#E4E4E7" : "#4A6BA8",
          paddingLeft: 18,
          paddingRight: 18,
          "&:hover": {
            border: `1px solid ${up ? "rgba(255,255,255,0.32)" : "#3A5787"}`,
            backgroundColor: up ? "rgba(255,255,255,0.06)" : ka("#4A6BA8", 0.08),
          },
        },
        outlined: {
          border: `1px solid ${up ? K.nightLine : K.washiDivider}`,
          color: up ? "#D4D4D8" : K.washiInk,
          paddingLeft: 18,
          paddingRight: 18,
          "&:hover": {
            border: `1px solid ${up ? K.nightLine2 : "#BFB8A4"}`,
            backgroundColor: up ? "rgba(255,255,255,0.06)" : ka(K.washiInk, 0.05),
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: up ? K.textMid : K.washiDim,
          borderRadius: 10,
          "&:hover": { color: up ? "#FAFAFA" : K.washiInk, backgroundColor: up ? "rgba(255,255,255,0.07)" : ka(K.washiInk, 0.06) },
        },
      },
    },
    MuiChip: {
      defaultProps: { size: "small" },
      styleOverrides: {
        root: { borderRadius: 999, fontWeight: 600, letterSpacing: "0.01em", border: `1px solid ${up ? K.nightLine : K.washiDivider}` },
      },
    },
    MuiLink: {
      defaultProps: { underline: "hover" },
      styleOverrides: {
        root: { color: up ? "#C7C7CC" : "#3A5787", fontWeight: 500, "&:hover": { color: up ? "#FAFAFA" : "#2C4468" } },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: up ? K.night0 : "#FFFFFF",
          "& .MuiOutlinedInput-notchedOutline": { borderColor: up ? K.nightLine2 : K.washiDivider },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: up ? "rgba(255,255,255,0.28)" : "#BFB8A4" },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: up ? "rgba(255,255,255,0.4)" : "#4A6BA8" },
        },
      },
    },
    MuiFilledInput: { styleOverrides: { root: { borderRadius: 10 } } },
    MuiAlert: { styleOverrides: { root: { borderRadius: 10, border: `1px solid ${up ? K.nightLine : K.washiDivider}` } } },
    MuiTooltip: {
      defaultProps: { arrow: false },
      styleOverrides: {
        tooltip: {
          backgroundColor: up ? "#1C1C22" : K.washiInk,
          color: up ? "#FAFAFA" : K.washiPaper,
          fontSize: "0.72rem",
          fontWeight: 500,
          borderRadius: 8,
          padding: "6px 10px",
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: { root: { borderRadius: 999, backgroundColor: up ? "rgba(255,255,255,0.09)" : "#DFDACB" }, bar: { borderRadius: 999 } },
    },
    MuiTableCell: {
      styleOverrides: { root: { borderColor: up ? K.nightLine : K.washiDivider } },
    },
    MuiTab: {
      styleOverrides: { root: { minHeight: 40, fontWeight: 600, textTransform: "none" as const, borderRadius: 8 } },
    },
    MuiTabs: {
      styleOverrides: { indicator: { height: 2, borderRadius: 999, backgroundColor: up ? "#FAFAFA" : "#4A6BA8" } },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          borderColor: up ? K.nightLine : K.washiDivider,
          color: up ? K.textMid : K.washiDim,
          "&:hover": { color: up ? "#FAFAFA" : K.washiInk, backgroundColor: up ? "rgba(255,255,255,0.05)" : ka(K.washiInk, 0.05) },
          "&.Mui-selected": {
            backgroundColor: up ? K.night3 : ka("#4A6BA8", 0.1),
            color: up ? "#FAFAFA" : "#3A5787",
            borderColor: up ? "rgba(255,255,255,0.22)" : ka("#4A6BA8", 0.4),
            fontWeight: 700,
            "&:hover": { backgroundColor: up ? "#1D1D24" : ka("#4A6BA8", 0.16) },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          border: `1px solid ${up ? K.nightLine2 : K.washiDivider}`,
          backgroundColor: up ? K.night1 : K.washiPaper,
          boxShadow: up ? "0 24px 80px rgba(0,0,0,0.8)" : "0 24px 80px rgba(42,42,55,0.22)",
          backgroundImage: "none",
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          border: `1px solid ${up ? K.nightLine2 : K.washiDivider}`,
          backgroundColor: up ? K.night1 : K.washiPaper,
          boxShadow: up ? "0 16px 48px rgba(0,0,0,0.7)" : "0 16px 48px rgba(42,42,55,0.18)",
          backgroundImage: "none",
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: { color: up ? "#E4E4E7" : "#4A6BA8" },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: { borderRadius: 9 },
      },
    },
  } as const;
};

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#FAFAFA", light: "#FFFFFF", dark: "#E4E4E7", contrastText: "#09090B" },
    secondary: { main: K.springViolet1 },
    success: { main: K.springGreen },
    warning: { main: K.carpYellow },
    error: { main: K.waveRed },
    info: { main: K.springBlue },
    background: { default: K.night0, paper: K.night2 },
    text: { primary: K.textHi, secondary: K.textMid },
    divider: K.nightLine,
  },
  shape: { borderRadius: 10 },
  typography,
  components: skin(createTheme({ palette: { mode: "dark" } })),
});

const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#4A6BA8", light: "#5C7BB8", dark: "#3A5787", contrastText: "#FFFFFF" },
    secondary: { main: K.washiDim },
    success: { main: "#6E9B4E" },
    warning: { main: "#B8863B" },
    error: { main: K.autumnRed },
    info: { main: "#4E7E96" },
    background: { default: K.washiBg, paper: K.washiPaper },
    text: { primary: K.washiInk, secondary: K.washiDim },
    divider: K.washiDivider,
  },
  shape: { borderRadius: 10 },
  typography,
  components: skin(createTheme({ palette: { mode: "light" } })),
});

function GlobalThemeStyles() {
  return (
    <GlobalStyles
      styles={(theme: Theme) => ({
        "@keyframes jee-fade-up": {
          from: { opacity: 0, transform: "translateY(10px)" },
          to: { opacity: 1, transform: "none" },
        },
        html: { scrollBehavior: "smooth" },
        "::selection": {
          backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.22)" : ka("#4A6BA8", 0.25),
        },
        "*::-webkit-scrollbar": { width: 10, height: 10 },
        "*::-webkit-scrollbar-track": { background: "transparent" },
        "*::-webkit-scrollbar-thumb": {
          background: theme.palette.mode === "dark" ? "#232329" : "#C7C0AE",
          borderRadius: 999,
          "&:hover": { background: theme.palette.mode === "dark" ? "#33333B" : "#B5AD98" },
        },
        ".jee-page-enter": {
          animation: "jee-fade-up .4s cubic-bezier(.22,1,.36,1) both",
        },
        ".jee-serif": { fontFamily: SANS, fontWeight: 650, letterSpacing: "-0.02em" },
        ".jee-mono": { fontFamily: MONO },
        ".jee-num": { fontVariantNumeric: "tabular-nums lining-nums" },
        // accessible dimmed text for raw (non-MUI) tables — mode-aware
        ".jee-dim": {
          color: theme.palette.mode === "dark" ? K.textMid : K.washiDim,
        },
      })}
    />
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [resolved, setResolved] = useState<Resolved>("dark");

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

  const ctx = useMemo(() => ({ mode, resolved, setMode }), [mode, resolved, setMode]);

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
