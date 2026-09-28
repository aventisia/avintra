/**
 * Resolves an icon/image `src` for the studio's bundled assets.
 *
 * Relative paths (e.g. "/assets/logo.svg", "/function.png") are prefixed with
 * the app's base path so they resolve under the deployed studio path. Absolute
 * values (`http:`, `https:`, protocol-relative, `data:` and `blob:` URIs) are
 * returned untouched — these come from user-supplied tool icons and must not be
 * rewritten.
 */
const ABSOLUTE_SRC_PATTERN = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;

export const resolveAssetSrc = (src: string | undefined, basePath: string): string | undefined =>
  !src || ABSOLUTE_SRC_PATTERN.test(src) ? src : `${basePath}${src}`;
