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
        { find: "@/react-toolkit", replacement: path.resolve(__dirname, "./react-toolkit") }, // SHOULD BE FIRST
        { find: "@", replacement: path.resolve(__dirname, "./src") }, // SHOULD BE SECOND
      ],
    },
  };

  return mergeConfig(baseConfig as UserConfig, config);
});
