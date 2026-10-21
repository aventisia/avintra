const SAFE_ABSOLUTE_SRC_PATTERN = /^(?:https?:|\/\/)/i;
const SCHEME_PATTERN = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;

/**
 * Indicates whether a value is a safe absolute URL or a relative asset path.
 */
export const isSafeAssetSrc = (src?: string): boolean => {
  if (!src) return true;
  return SAFE_ABSOLUTE_SRC_PATTERN.test(src) || !SCHEME_PATTERN.test(src);
};

/**
 * Resolves an icon/image src for the studio's bundled assets, rejecting unsupported URL schemes.
 */
export const resolveAssetSrc = (src: string | undefined, basePath: string): string | undefined => {
  if (!src) return src;
  if (SAFE_ABSOLUTE_SRC_PATTERN.test(src)) return src;
  if (SCHEME_PATTERN.test(src)) return undefined;
  return `${basePath}${src}`;
};
