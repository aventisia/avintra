/// <reference types="vite/client" />

/**
 * Allow importing Markdown files as raw strings (used by the in-app
 * documentation content registry via the `?raw` suffix).
 */
declare module "*.md?raw" {
  const content: string;
  export default content;
}

