type Rgb = { r: number; g: number; b: number };

const parseHex = (value: string): Rgb | null => {
  const hex = value.replace("#", "");
  if (![3, 6, 8].includes(hex.length)) {
    return null;
  }

  const channel = (start: number, length: number) => {
    const part = hex.slice(start, start + length);
    return parseInt(length === 1 ? part + part : part, 16);
  };

  return {
    r: channel(0, hex.length === 3 ? 1 : 2),
    g: channel(hex.length === 3 ? 1 : 2, hex.length === 3 ? 1 : 2),
    b: channel(hex.length === 3 ? 2 : 4, hex.length === 3 ? 1 : 2),
  };
};

const parseRgb = (value: string): Rgb | null => {
  const match = value.match(/rgba?\(([^)]+)\)/i);
  if (!match) {
    return null;
  }

  const [r, g, b] = match[1]
    .split(/[,\s/]+/)
    .filter(Boolean)
    .map(Number);
  return [r, g, b].some(Number.isNaN) ? null : { r, g, b };
};

const hslToRgb = (h: number, s: number, l: number): Rgb => {
  const saturation = s / 100;
  const lightness = l / 100;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const hPrime = (((h % 360) + 360) % 360) / 60;
  const x = chroma * (1 - Math.abs((hPrime % 2) - 1));

  const [r1, g1, b1] =
    hPrime < 1
      ? [chroma, x, 0]
      : hPrime < 2
        ? [x, chroma, 0]
        : hPrime < 3
          ? [0, chroma, x]
          : hPrime < 4
            ? [0, x, chroma]
            : hPrime < 5
              ? [x, 0, chroma]
              : [chroma, 0, x];
  const m = lightness - chroma / 2;

  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
};

const parseHsl = (value: string): Rgb | null => {
  const match = value.match(/hsla?\(([^)]+)\)/i);
  if (!match) {
    return null;
  }

  const [h, s, l] = match[1]
    .split(/[,\s/]+/)
    .filter(Boolean)
    .map(parseFloat);
  return [h, s, l].some(Number.isNaN) ? null : hslToRgb(h, s, l);
};

const parseColor = (value: string): Rgb | null => {
  const trimmed = value.trim().toLowerCase();
  if (trimmed.startsWith("#")) return parseHex(trimmed);
  if (trimmed.startsWith("rgb")) return parseRgb(trimmed);
  if (trimmed.startsWith("hsl")) return parseHsl(trimmed);
  return null;
};

/**
 * Picks a readable foreground color (near-black or white) for the given CSS color,
 * using perceived brightness (ITU-R BT.601). Defaults to white when unparseable.
 *
 * @param {string} color - A CSS color value (hex, rgb/rgba or hsl/hsla).
 * @returns {string} `#111827` for light colors, `#ffffff` for dark colors.
 */
const pickReadableForeground = (color: string): string => {
  const rgb = parseColor(color);
  if (!rgb) {
    return "#ffffff";
  }

  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness >= 150 ? "#111827" : "#ffffff";
};

export { pickReadableForeground };
