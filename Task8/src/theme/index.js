import { palettes } from "./palettes";

/* Day 8 resolves colours through theme context (task 11). This export is the
   dark palette, used only where a value is needed outside a provider — a
   navigator's static screenOptions, for example. */
export const colors = palettes.dark;

export { palettes };

/* Task 5 — design tokens.

   React Native has no CSS custom properties, so tokens are a plain object that
   every StyleSheet imports. That's the whole mechanism — and it's why a token
   file matters more here than on the web: without it, colours end up hardcoded
   in forty StyleSheet.create calls with no cascade to fix them. */

/* A 4pt scale. Mobile spacing wants to be tighter and more consistent than the
   web — there's less room to absorb an inconsistency. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  pill: 999
};

/* Numbers, not strings. RN font sizes are unitless density-independent pixels;
   "16px" is a runtime error, not a style that silently does nothing. */
export const type = {
  display: { fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  title: { fontSize: 20, fontWeight: "700", letterSpacing: -0.3 },
  heading: { fontSize: 16, fontWeight: "700" },
  body: { fontSize: 15, fontWeight: "400" },
  small: { fontSize: 13, fontWeight: "400" },
  tiny: { fontSize: 11, fontWeight: "600", letterSpacing: 0.4 },
  mono: { fontSize: 12, fontFamily: undefined } // fontFamily set per platform in task 7
};

export const layout = {
  screenPadding: spacing.lg,
  gap: spacing.md,
  hitSlop: { top: 8, bottom: 8, left: 8, right: 8 }
};
