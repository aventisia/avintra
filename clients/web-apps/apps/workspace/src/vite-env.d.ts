/// <reference types="vite/client" />

/**
 * Allow importing Markdown files as raw strings (used by the in-app
 * documentation content registry via the `?raw` suffix).
 */
declare module "*.md?raw" {
  const content: string;
  export default content;
}

interface ImportMetaEnv {
  /** Release version without the leading "v", from the latest `vX.Y.Z` git tag at build time. */
  readonly VITE_APP_VERSION?: string;
}
