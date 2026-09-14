/**
 * Node < 20 global polyfills.
 *
 * Some Corsair plugins (e.g. @corsair-dev/telegram) reference the `File` and
 * `Blob` globals at module-load time (in their zod schemas via
 * `z.instanceof(File)`). These globals were only added to Node in v20. The
 * production server currently runs Node 18, so we polyfill them from
 * `node:buffer` (which provides both) before any plugin module is imported.
 *
 * This module must be imported FIRST in any entry point that loads plugins
 * (see src/plugins.ts).
 */
import { File as NodeFile, Blob as NodeBlob } from "node:buffer";

if (typeof globalThis.File === "undefined") {
  (globalThis as any).File = NodeFile;
}
if (typeof globalThis.Blob === "undefined") {
  (globalThis as any).Blob = NodeBlob;
}
