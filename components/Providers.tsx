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
import { J } from "@/lib/jellybeans";

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
const DISPLAY = "var(--font-display), var(--font-inter), system-ui, sans-serif";
const MONO = "var(--font-mono), ui-monospace, SFMono-Regular, Menlo, monospace";

const typography = {
  fontFamily: SANS,
  h1: { fontFamily: DISPLAY, fontWeight: 700, letterSpacing: "-0.03em" },
  h2: { fontFamily: DISPLAY, fontWeight: 700, letterSpacing: "-0.028em" },
  h3: { fontFamily: DISPLAY, fontWeight: 700, letterSpacing: "-0.024em" },
  h4: { fontFamily: DISPLAY, fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em" },
  h5: { fontFamily: DISPLAY, fontSize: "1.2rem", fontWeight: 700, letterSpacing: "-0.015em" },
  h6: { fontFamily: DISPLAY, fontSize: "1.02rem", fontWeight: 700, letterSpacing: "-0.01em" },
  subtitle2: { fontWeight: 600 },
  body2: { fontSize: "0.8125rem" },
  button: { textTransform: "none" as const, fontWeight: 600, letterSpacing: "0" },
};

/**
 * Jellybean Dossier skin: ink on paper, hairline borders, squared 2px corners,
 * zero blur shadows. Candy exists only as beans — pill chips and marks — and
 * one bubblegum accent for focus, links and active states. Interactive
 * elements press like taffy: hover lifts into a hard offset shadow, release
 * squashes back flat.
 */
const skin = (theme: Theme) => {
  const dark = theme.palette.mode === "dark";
  const ink = dark ? J.boneDark : J.inkLight; // strong border / block color
  const hair = dark ? J.hairDark : J.hairLight;
  const hairStrong = dark ? J.hairDarkStrong : "#CFC7B4";
  const card = dark ? J.cardDark : J.cardLight;
  const field = dark ? J.fieldDark : J.fieldLight;
  const shadowHard = dark ? "4px 4px 0 rgba(0,0,0,0.85)" : "4px 4px 0 rgba(34,31,26,0.14)";
  const shadowPress = dark ? "3px 3px 0 rgba(0,0,0,0.8)" : "3px 3px 0 rgba(34,31,26,0.16)";
  return {
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: "none" } },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: 2,
          border: `1px solid ${hair}`,
          backgroundColor: card,
          boxShadow: "none",
          transition: "border-color .18s ease, box-shadow .18s ease, transform .18s ease",
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 2,
          transition: "transform .14s ease, box-shadow .14s ease, background-color .14s ease, border-color .14s ease",
        },
        containedPrimary: {
          backgroundColor: ink,
          color: dark ? J.paperDark : "#FAF7EF",
          paddingLeft: 18,
          paddingRight: 18,
          border: `1px solid ${ink}`,
          "&:hover": {
            backgroundColor: ink,
            transform: "translate(-1px,-1px)",
            boxShadow: shadowPress,
          },
          "&:active": { transform: "translate(1px,1px)", boxShadow: "none" },
        },
        outlinedPrimary: {
          border: `1px solid ${ink}`,
          color: theme.palette.text.primary,
          paddingLeft: 18,
          paddingRight: 18,
          "&:hover": {
            border: `1px solid ${ink}`,
            backgroundColor: dark ? "rgba(222,213,198,0.07)" : "rgba(34,31,26,0.05)",
            transform: "translate(-1px,-1px)",
            boxShadow: shadowPress,
          },
          "&:active": { transform: "translate(1px,1px)", boxShadow: "none" },
        },
        outlined: {
          border: `1px solid ${hairStrong}`,
          paddingLeft: 18,
          paddingRight: 18,
          "&:hover": {
            border: `1px solid ${ink}`,
            backgroundColor: dark ? "rgba(222,213,198,0.06)" : "rgba(34,31,26,0.04)",
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: theme.palette.text.secondary,
          borderRadius: 2,
          border: "1px solid transparent",
          transition: "all .15s ease",
          "&:hover": {
            color: theme.palette.text.primary,
            backgroundColor: dark ? "rgba(222,213,198,0.08)" : "rgba(34,31,26,0.06)",
            borderColor: hair,
          },
        },
      },
    },
    MuiChip: {
      defaultProps: { size: "small" },
      styleOverrides: {
        // Beans — the only pills in the system.
        root: {
          borderRadius: 999,
          fontWeight: 600,
          letterSpacing: "0.01em",
          border: `1px solid ${hairStrong}`,
        },
      },
    },
    MuiLink: {
      defaultProps: { underline: "hover" },
      styleOverrides: {
        root: {
          color: dark ? J.bean.bubblegum.fill : J.bean.bubblegum.deep,
          fontWeight: 500,
          "&:hover": { color: dark ? "#F7C2DA" : "#8E315C" },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          backgroundColor: field,
          "& .MuiOutlinedInput-notchedOutline": { borderColor: hairStrong },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: ink },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: ink, borderWidth: "1.5px" },
        },
      },
    },
    MuiFilledInput: { styleOverrides: { root: { borderRadius: 2 } } },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 2, border: `1px solid ${hair}`, boxShadow: "none" },
      },
    },
    MuiTooltip: {
      defaultProps: { arrow: false },
      styleOverrides: {
        tooltip: {
          backgroundColor: ink,
          color: dark ? J.paperDark : "#FAF7EF",
          fontFamily: MONO,
          fontSize: "0.68rem",
          fontWeight: 500,
          borderRadius: 2,
          border: `1px solid ${dark ? J.hairDarkStrong : J.inkLight}`,
          padding: "6px 10px",
        },
      },
    },
    MuiLinearProgress: {
      // Candy bar — pill track with a bean-colored fill.
      styleOverrides: {
        root: { borderRadius: 999, backgroundColor: dark ? "rgba(222,213,198,0.10)" : "#ECE6D6" },
        bar: { borderRadius: 999 },
      },
    },
    MuiTableCell: {
      styleOverrides: { root: { borderColor: hair } },
    },
    MuiTab: {
      styleOverrides: {
        root: { minHeight: 40, fontWeight: 600, textTransform: "none" as const, borderRadius: 2 },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { height: 2, borderRadius: 0, backgroundColor: ink },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          borderColor: hairStrong,
          color: theme.palette.text.secondary,
          "&:hover": {
            color: theme.palette.text.primary,
            backgroundColor: dark ? "rgba(222,213,198,0.06)" : "rgba(34,31,26,0.04)",
          },
          "&.Mui-selected": {
            backgroundColor: ink,
            color: dark ? J.paperDark : "#FAF7EF",
            borderColor: ink,
            fontWeight: 700,
            "&:hover": { backgroundColor: ink },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 2,
          border: `1px solid ${ink}`,
          backgroundColor: dark ? J.railDark : J.paperLight,
          boxShadow: shadowHard,
          backgroundImage: "none",
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 2,
          border: `1px solid ${hairStrong}`,
          backgroundColor: dark ? J.railDark : J.cardLight,
          boxShadow: shadowHard,
          backgroundImage: "none",
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: { color: dark ? J.bean.bubblegum.fill : J.bean.bubblegum.deep },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: { borderRadius: 2 },
      },
    },
    MuiAccordion: {
      defaultProps: { elevation: 0, disableGutters: true },
      styleOverrides: {
        root: { borderRadius: 2, border: `1px solid ${hair}`, backgroundColor: "transparent", "&:before": { display: "none" } },
      },
    },
    MuiSnackbarContent: {
      styleOverrides: { root: { borderRadius: 2, border: `1px solid ${hairStrong}`, boxShadow: shadowHard } },
    },
  } as const;
};

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: J.boneDark, light: "#F0E9DC", dark: "#C9C0B0", contrastText: J.paperDark },
    secondary: { main: J.bean.bubblegum.fill },
    success: { main: J.bean.mint.fill },
    warning: { main: J.bean.lemon.fill },
    error: { main: J.bean.cherry.fill },
    info: { main: J.bean.sky.fill },
    background: { default: J.paperDark, paper: J.cardDark },
    text: { primary: J.boneDark, secondary: J.boneMidDark },
    divider: J.hairDark,
  },
  shape: { borderRadius: 2 },
  typography,
  components: skin(createTheme({ palette: { mode: "dark" } })),
});

const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: J.inkLight, light: "#3D3931", dark: "#141210", contrastText: "#FAF7EF" },
    secondary: { main: J.bean.bubblegum.deep },
    success: { main: J.bean.mint.deep },
    warning: { main: J.bean.lemon.deep },
    error: { main: J.bean.cherry.deep },
    info: { main: J.bean.sky.deep },
    background: { default: J.paperLight, paper: J.cardLight },
    text: { primary: J.inkLight, secondary: J.inkMidLight },
    divider: J.hairLight,
  },
  shape: { borderRadius: 2 },
  typography,
  components: skin(createTheme({ palette: { mode: "light" } })),
});

function GlobalThemeStyles() {
  return (
    <GlobalStyles
      styles={(theme: Theme) => {
        const dark = theme.palette.mode === "dark";
        const accent = dark ? J.accent.dark : J.accent.light;
        return {
          html: { scrollBehavior: "smooth" },
          "::selection": {
            backgroundColor: dark ? "rgba(242,169,203,0.30)" : "rgba(172,62,112,0.22)",
          },
          "*:focus-visible": {
            outline: `2px solid ${accent}`,
            outlineOffset: 2,
          },
          "*::-webkit-scrollbar": { width: 10, height: 10 },
          "*::-webkit-scrollbar-track": { background: "transparent" },
          "*::-webkit-scrollbar-thumb": {
            background: dark ? "#2B2822" : "#D5CDBA",
            borderRadius: 0,
            "&:hover": { background: dark ? "#3B372E" : "#C2B89F" },
          },
          ".jee-page-enter": {
            animation: "jee-fade-up .4s cubic-bezier(.22,1,.36,1) both",
          },
          ".jee-display": { fontFamily: DISPLAY, fontWeight: 700, letterSpacing: "-0.02em" },
          ".jee-mono": { fontFamily: MONO },
          ".jee-num": { fontVariantNumeric: "tabular-nums lining-nums" },
          // accessible dimmed text for raw (non-MUI) tables — mode-aware
          ".jee-dim": {
            color: dark ? J.boneMidDark : J.inkMidLight,
          },
        };
      }}
    />
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [resolved, setResolved] = useState<Resolved>("dark");

  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as ThemeMode | null) ?? "system";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot sync: read persisted theme after mount (no SSR access)
    setModeState(stored);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const next = mode === "system" ? (mq.matches ? "dark" : "light") : mode;
      setResolved(next);
      // mirror the resolved theme onto <html> so sx CSS can switch bean
      // variants (deep/fill) in Server Components, which can't call useTheme
      document.documentElement.setAttribute("data-jee-theme", next);
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
