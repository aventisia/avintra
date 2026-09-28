import baseConfig from "@avplatform/vite-config";
import path from "path";
import { type UserConfig, defineConfig, mergeConfig } from "vite";

// https://vite.dev/config/
export default defineConfig((): UserConfig => {
  const config: UserConfig = {
    base: "/accounts/",
    resolve: {
      alias: [
        { find: "@/ui", replacement: path.resolve(__dirname, "../../packages/ui/src") },
        { find: "@", replacement: path.resolve(__dirname, "./src") },
      ],
    },
    server: {
      proxy: {
        // Forward API calls to the AccountsAPIs backend in dev. In production
        // nginx handles this routing (see deploy/nginx/sites-available). The
        // backend listens over HTTPS locally with an untrusted ASP.NET dev
        // certificate, so TLS verification is disabled for the proxy.
        "/accounts/api": {
          target: "https://localhost:4000",
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/accounts\/api/, "/api"),
        },
      },
    },
  };

  return mergeConfig(baseConfig as UserConfig, config);
});
