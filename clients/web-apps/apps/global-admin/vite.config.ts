import baseConfig, { resolveDevServerOptions } from "@avplatform/vite-config";
import { fileURLToPath } from "node:url";
import { type UserConfig, defineConfig, loadEnv, mergeConfig } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }): UserConfig => {
  const env = loadEnv(mode, process.cwd());
  const globalAdminApiTarget =
    process.env.VITE_GLOBALADMIN_API_TARGET ??
    env.VITE_GLOBALADMIN_API_TARGET ??
    "http://localhost:4004";
  const accountsApiTarget =
    process.env.VITE_ACCOUNTS_API_TARGET ?? env.VITE_ACCOUNTS_API_TARGET ?? "http://localhost:4000";
  const config: UserConfig = {
    base: "/global-admin/",
    resolve: {
      alias: [
        {
          find: "@/ui",
          replacement: fileURLToPath(new URL("../../packages/ui/src", import.meta.url)),
        },
        { find: "@", replacement: fileURLToPath(new URL("./src", import.meta.url)) },
      ],
    },
    server: {
      ...resolveDevServerOptions(env, 3003),
      proxy: {
        "/global-admin/api": {
          target: globalAdminApiTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (url) => url.replace(/^\/global-admin\/api/, "/api"),
        },
        "/accounts/api": {
          target: accountsApiTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (url) => url.replace(/^\/accounts\/api/, "/api"),
        },
      },
    },
  };

  return mergeConfig(baseConfig as UserConfig, config);
});
