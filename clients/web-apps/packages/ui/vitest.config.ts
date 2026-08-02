import path from "path";
import { fileURLToPath } from "url";

import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@/ui": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    globals: false,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
  },
});
