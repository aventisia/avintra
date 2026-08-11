import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import eslint from "vite-plugin-eslint2";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    eslint({
      cache: false,
      include: ["src/**/*.ts", "src/**/*.tsx"],
      exclude: ["node_modules"],
    }),
  ],
  resolve: {
    alias: {
      "@/ui": path.resolve(__dirname, "../../packages/ui/src"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    allowedHosts: ["local-avintra.aventisia.com"],
  },
  // `use-effect-event` (a transitive dep of @assistant-ui/react) ships a broken
  // `exports["."].source` condition pointing at an unpublished `src/index.ts`.
  // Vite enables the `source` condition during dep optimization, so esbuild
  // fails to resolve it. Drop `source` from the optimizer conditions so it
  // falls back to the built `dist/index.js`.
  optimizeDeps: {
    esbuildOptions: {
      conditions: ["module", "import", "browser", "development", "default"],
    },
  },
});
