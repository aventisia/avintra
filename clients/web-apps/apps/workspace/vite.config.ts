import baseConfig from "@avplatform/vite-config";
import path from "path";
import { type UserConfig, defineConfig, mergeConfig } from "vite";

// https://vite.dev/config/
export default defineConfig((): UserConfig => {
  const config: UserConfig = {
    base: "/workspace/",
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
