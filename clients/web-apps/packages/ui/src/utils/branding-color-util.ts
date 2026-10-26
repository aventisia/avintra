type Rgb = { r: number; g: number; b: number };

const parseHex = (value: string): Rgb | null => {
  const hex = value.replace("#", "");
  if (![3, 4, 6, 8].includes(hex.length)) {
    return null;
  }

  const step = hex.length <= 4 ? 1 : 2;
  const channel = (start: number) => {
    const part = hex.slice(start, start + step);
    return parseInt(step === 1 ? part + part : part, 16);
  };

  return { r: channel(0), g: channel(step), b: channel(step * 2) };
};

const parseRgb = (value: string): Rgb | null => {
  const match = value.match(/rgba?\(([^)]+)\)/i);
  if (!match) {
    return null;
  }

  const [r, g, b] = match[1].split(",").map(Number);
  return [r, g, b].some(Number.isNaN) ? null : { r, g, b };
};

const parseColor = (value: string): Rgb | null => {
  const trimmed = value.trim().toLowerCase();
  if (trimmed.startsWith("#")) return parseHex(trimmed);
  if (trimmed.startsWith("rgb")) return parseRgb(trimmed);
  return null;
};

/**
 * Picks a readable foreground color (near-black or white) for the given CSS color,
 * using perceived brightness (ITU-R BT.601). Defaults to white when unparseable.
 *
 * @param {string} color - A CSS color value (hex or rgb/rgba).
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

const CHANNEL = "(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])";
const ALPHA = "(?:[01](?:\\.[0-9]+)?|\\.[0-9]+)";
const COLOR_ALLOWLIST = new RegExp(
  `^(?:#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})|rgb\\(\\s*${CHANNEL}\\s*,\\s*${CHANNEL}\\s*,\\s*${CHANNEL}\\s*\\)|rgba\\(\\s*${CHANNEL}\\s*,\\s*${CHANNEL}\\s*,\\s*${CHANNEL}\\s*,\\s*${ALPHA}\\s*\\))$`,
  "i",
);

/**
 * Returns true when the value is a hex, rgb() or rgba() color.
 *
 * IMPORTANT NOTE: the server mirrors this grammar in `SanitizeBrandingColor`
 * (`AspNetToolkit/Extensions/EnvironmentConfigurationExtension.cs`); change both sides together.
 */
const isSafeBrandColor = (value: string): boolean => COLOR_ALLOWLIST.test(value.trim());

/** Returns true when the value is an absolute https URL, rejecting unsafe schemes such as `javascript:`. */
const isHttpsBrandAssetUrl = (value: string): boolean => {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
};

export { isHttpsBrandAssetUrl, isSafeBrandColor, pickReadableForeground };
