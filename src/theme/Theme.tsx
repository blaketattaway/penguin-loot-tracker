import { PropsWithChildren } from "react";
import {
  createTheme,
  MantineColorsTuple,
  MantineProvider,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";

// Brand accent — "loot gold". Warm amber that reads as treasure/epic.
const gold: MantineColorsTuple = [
  "#fff8e1",
  "#ffecb5",
  "#ffe08a",
  "#ffd35c",
  "#ffc738",
  "#ffbe1f",
  "#ffb300", // primary shade
  "#e39a00",
  "#c48200",
  "#a26a00",
];

// Warm deep-charcoal surfaces — a dim guild hall lit by torchlight.
const night: MantineColorsTuple = [
  "#c9c7c3", // text
  "#a9a6a1",
  "#949189", // dimmed — lightened to clear WCAG AA (≈5:1 on card #232220)
  "#66635e",
  "#3b3934", // borders
  "#2c2b27", // hover surface
  "#232220", // card surface
  "#1b1a18", // body background
  "#141312",
  "#0c0b0a",
];

// Secondary accents borrowed from WoW item quality (rare / epic).
const arcane: MantineColorsTuple = [
  "#f3ecff",
  "#e0d3ff",
  "#bfa3ff",
  "#9d70ff",
  "#8148ff",
  "#7130ff",
  "#6926ff",
  "#571aeb",
  "#4c14d2",
  "#3f0bb9",
];

const FONT = 'Nunito, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

const theme = createTheme({
  primaryColor: "gold",
  primaryShade: { light: 6, dark: 6 },
  autoContrast: true,
  luminanceThreshold: 0.35,
  defaultRadius: "md",
  cursorType: "pointer",
  fontFamily: FONT,
  fontFamilyMonospace: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  headings: {
    fontFamily: FONT,
    fontWeight: "800",
  },
  colors: {
    gold,
    dark: night,
    arcane,
  },
  components: {
    Button: {
      defaultProps: { fw: 700 },
    },
    Card: {
      defaultProps: { radius: "lg", withBorder: true, padding: "lg" },
    },
    Paper: {
      defaultProps: { radius: "lg" },
    },
    Modal: {
      defaultProps: {
        centered: true,
        radius: "lg",
        overlayProps: { blur: 4, backgroundOpacity: 0.6 },
        transitionProps: {
          transition: "pop",
          duration: 220,
          timingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
        },
      },
    },
    Tooltip: {
      defaultProps: { radius: "md", withArrow: true },
    },
    TextInput: { defaultProps: { radius: "md" } },
    PasswordInput: { defaultProps: { radius: "md" } },
    MultiSelect: { defaultProps: { radius: "md" } },
  },
});

const ThemeProvider = ({ children }: PropsWithChildren) => {
  return (
    <MantineProvider defaultColorScheme="dark" theme={theme}>
      <Notifications position="top-right" limit={4} />
      {children}
    </MantineProvider>
  );
};

export default ThemeProvider;
