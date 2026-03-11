export const BLACK = "#07020D";
export const BLUE = "#5DB7DE";
export const OLIVE = "#716A5C";
export const ORANGE = "#D98324";
export const MINT = "#CDEAC0";
export const RED = "#E3170A";

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

export function withAlpha(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

export const CONFETTI_COLORS = [
  "#5DB7DE",
  "#8ECFEA",
  "#3A9BC4",
  "#D98324",
  "#E9A84E",
  "#B06A1A",
  "#CDEAC0",
  "#E5F5DF",
  "#A8D49A",
  "#E3170A",
  "#F04A40",
  "#B01008",
  "#716A5C",
  "#9A9488",
  "#4D8FA8",
  "#F2C572",
];
