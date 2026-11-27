import baseConfig, { resolveDevServerOptions } from "@avplatform/vite-config";
import path from "path";
import { type UserConfig, defineConfig, loadEnv, mergeConfig } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }): UserConfig => {
  const env = loadEnv(mode, process.cwd());
  const config: UserConfig = {
    base: "/",
    server: {
      ...resolveDevServerOptions(env, 2999),
      // IMPORTANT NOTE: cargo rewrites target/ while tauri dev starts; watching it makes Vite
      // crash with EBUSY on locked build artifacts.
      watch: { ignored: ["**/src-tauri/**"] },
    },
    resolve: {
      alias: [
        { find: "@/ui", replacement: path.resolve(__dirname, "../../packages/ui/src") },
        { find: "@", replacement: path.resolve(__dirname, "./src") },
      ],
    },
  };

  return mergeConfig(baseConfig as UserConfig, config);
});
