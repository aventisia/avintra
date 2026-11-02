const SAFE_ABSOLUTE_SRC_PATTERN = /^(?:https?:|\/\/)/i;
const SCHEME_PATTERN = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;

/**
 * Indicates whether a value is a safe absolute URL or a relative asset path.
 */
export const isSafeAssetSrc = (src?: string): boolean => {
  if (!src?.trim()) return false;
  return SAFE_ABSOLUTE_SRC_PATTERN.test(src) || !SCHEME_PATTERN.test(src);
};

/** Indicates whether a src points at one of the studio's bundled assets rather than a remote URL. */
export const isBundledAssetSrc = (src?: string): boolean =>
  isSafeAssetSrc(src) && !SAFE_ABSOLUTE_SRC_PATTERN.test(src!);

/** Dark-theme filter for bundled monochrome icons; flips lightness while keeping hues roughly intact. */
export const BUNDLED_ICON_DARK_CLASS = "dark:invert dark:hue-rotate-180";

/**
 * Resolves an icon/image src for the studio's bundled assets, rejecting unsupported URL schemes.
 */
export const resolveAssetSrc = (src: string | undefined, basePath: string): string | undefined => {
  if (!src?.trim()) return undefined;
  if (SAFE_ABSOLUTE_SRC_PATTERN.test(src)) return src;
  if (SCHEME_PATTERN.test(src)) return undefined;
  return `${basePath}${src}`;
};
