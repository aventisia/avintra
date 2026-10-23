import baseConfig, { resolveDevServerOptions } from "@avplatform/vite-config";
import path from "path";
import { type UserConfig, defineConfig, loadEnv, mergeConfig } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }): UserConfig => {
  const env = loadEnv(mode, process.cwd());
  const config: UserConfig = {
    base: "/workspace/",
    server: resolveDevServerOptions(env, 3002),
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
