import baseConfig, { resolveDevServerOptions } from "@avplatform/vite-config";
import { execSync } from "node:child_process";
import path from "path";
import { type UserConfig, defineConfig, loadEnv, mergeConfig } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }): UserConfig => {
  const env = loadEnv(mode, process.cwd());
  const appVersion = env.VITE_APP_VERSION ?? readLatestReleaseTag();
  const config: UserConfig = {
    base: "/workspace/",
    define: { "import.meta.env.VITE_APP_VERSION": JSON.stringify(appVersion) },
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

function readLatestReleaseTag(): string {
  try {
    return execSync("git tag --list 'v[0-9]*.[0-9]*.[0-9]*' --sort=-v:refname", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .split("\n")[0]
      .trim()
      .replace(/^v/, "");
  } catch {
    // IMPORTANT NOTE: Docker builds copy no .git, so the footer then shows no version.
    return "";
  }
}
