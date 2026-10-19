import baseConfig, { resolveDevServerOptions } from "@avplatform/vite-config";
import { readFileSync } from "fs";
import { createRequire } from "module";
import path from "path";
import { type Plugin, type UserConfig, defineConfig, loadEnv, mergeConfig } from "vite";

const requireFromApp = createRequire(path.resolve(__dirname, "package.json"));

const resolvePackageFile = (packageName: string, file: string) =>
  path.join(path.dirname(requireFromApp.resolve(`${packageName}/package.json`)), file);

const UI_BUILDER_RUNTIME_FILES: Record<string, string> = {
  "virtual:ui-builder-runtime/react": resolvePackageFile("react", "umd/react.production.min.js"),
  "virtual:ui-builder-runtime/react-dom": resolvePackageFile(
    "react-dom",
    "umd/react-dom.production.min.js",
  ),
};

// IMPORTANT NOTE: the UI builder inlines React's UMD builds as text. They are served as virtual
// modules because a `?raw` import into node_modules is captured by Vite's dependency optimizer.
const uiBuilderRuntimePlugin = (): Plugin => ({
  name: "ui-builder-runtime",
  resolveId: (id) => (id in UI_BUILDER_RUNTIME_FILES ? `\0${id}` : null),
  load: (id) => {
    const file = id.startsWith("\0") ? UI_BUILDER_RUNTIME_FILES[id.slice(1)] : undefined;
    return file ? `export default ${JSON.stringify(readFileSync(file, "utf8"))};` : null;
  },
});

export default defineConfig(({ mode }): UserConfig => {
  const env = loadEnv(mode, process.cwd());
  const config: UserConfig = {
    base: "/studio/",
    server: resolveDevServerOptions(env, 3006),
    plugins: [uiBuilderRuntimePlugin()],
    resolve: {
      alias: [
        { find: "@/react-toolkit", replacement: path.resolve(__dirname, "./react-toolkit") },
        { find: "@/ui", replacement: path.resolve(__dirname, "../../packages/ui/src") },
        { find: "@", replacement: path.resolve(__dirname, "./src") },
      ],
    },
  };

  return mergeConfig(baseConfig as UserConfig, config);
});
