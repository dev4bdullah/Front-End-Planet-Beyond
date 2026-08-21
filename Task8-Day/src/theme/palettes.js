/* Task 11 — two palettes behind one shape, so a screen reads colors.surface
   without knowing which theme is active. */

const shared = {
  brand: "#6d64f0",
  brandSoft: "#252248",
  success: "#22c55e",
  warning: "#f59e0b",
  danger: "#ef4444"
};

export const palettes = {
  dark: {
    ...shared,
    bg: "#0f1116",
    surface: "#181c25",
    sunk: "#12151d",
    border: "#2a3040",
    text: "#e7e9ef",
    textMuted: "#98a0b3",
    textFaint: "#6b7488",
    overlay: "rgba(8, 10, 16, 0.72)"
  },
  light: {
    ...shared,
    brandSoft: "#ecebfd",
    bg: "#f5f6fa",
    surface: "#ffffff",
    sunk: "#eceef4",
    border: "#dcdfe8",
    text: "#14171f",
    textMuted: "#5b6376",
    textFaint: "#8b93a5",
    overlay: "rgba(15, 17, 22, 0.45)"
  }
};
