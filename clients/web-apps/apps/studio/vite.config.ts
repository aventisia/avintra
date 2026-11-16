import baseConfig, { resolveDevServerOptions } from "@avplatform/vite-config";
import path from "path";
import { type UserConfig, defineConfig, loadEnv, mergeConfig } from "vite";

import { uiBuilderRuntimePlugin } from "./ui-builder-runtime.plugin";

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
