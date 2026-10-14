import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from "url";
import { type ServerOptions, defineConfig } from "vite";
import eslint from "vite-plugin-eslint2";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Resolves dev server options from `VITE_PORT`, validating the value and falling back to the app default port.
 */
export const resolveDevServerOptions = (
  env: Record<string, string>,
  defaultPort: number,
): ServerOptions => {
  const rawPort = process.env.VITE_PORT ?? env.VITE_PORT;
  if (rawPort === undefined || rawPort === "") return { port: defaultPort, strictPort: true };
  const port = Number(rawPort);
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error(`Invalid VITE_PORT "${rawPort}": expected an integer between 1 and 65535.`);
  return { port, strictPort: true };
};

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
    // The source-only `@avplatform/assistant-chat` workspace package causes npm
    // to install its own `@assistant-ui/react`, which pulls a second
    // `@assistant-ui/store` React context. Two context instances make the app's
    // `AssistantRuntimeProvider` invisible to hooks used inside the shared
    // package, surfacing as "requires an AuiProvider". Force a single react copy
    // from each app root. Only `@assistant-ui/react` is listed: it exists at every
    // app root, whereas its transitive `@assistant-ui/core`/`store` are nested
    // under it, and `dedupe` fails hard when a package is not resolvable from the
    // root (breaking deep imports like `@assistant-ui/core/react`).
    dedupe: ["@assistant-ui/react"],
  },
  server: {
    // When `allowedHosts` is set, Vite overrides its defaults (which normally
    // include localhost), so we must explicitly allow localhost/127.0.0.1 or the
    // dev server returns a 403 "Blocked request. This host is not allowed."
    allowedHosts: ["local-avintra.aventisia.com", "localhost", "127.0.0.1"],
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
