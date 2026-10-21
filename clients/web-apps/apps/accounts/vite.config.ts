import baseConfig, { resolveDevServerOptions } from "@avplatform/vite-config";
import path from "path";
import { type UserConfig, defineConfig, loadEnv, mergeConfig } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }): UserConfig => {
  const env = loadEnv(mode, process.cwd());
  const accountsApiTarget =
    process.env.VITE_ACCOUNTS_API_TARGET ??
    env.VITE_ACCOUNTS_API_TARGET ??
    "https://localhost:4000";
  const config: UserConfig = {
    base: "/accounts/",
    resolve: {
      alias: [
        { find: "@/ui", replacement: path.resolve(__dirname, "../../packages/ui/src") },
        { find: "@", replacement: path.resolve(__dirname, "./src") },
      ],
    },
    server: {
      ...resolveDevServerOptions(env, 3001),
      proxy: {
        // Forward API calls to the AccountsAPIs backend in dev. In production
        // nginx handles this routing (see deploy/nginx/sites-available). The
        // backend listens over HTTPS locally with an untrusted ASP.NET dev
        // certificate, so TLS verification is disabled for the proxy.
        "/accounts/api": {
          target: accountsApiTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/accounts\/api/, "/api"),
        },
      },
    },
  };

  return mergeConfig(baseConfig as UserConfig, config);
});
