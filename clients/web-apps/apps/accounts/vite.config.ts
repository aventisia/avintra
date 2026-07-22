import path from "path";
import { defineConfig, mergeConfig, type UserConfig } from "vite";
import baseConfig from "@avplatform/vite-config";

const unusedUiPeerStub = path.resolve(__dirname, "./src/stubs/codemirror-stub.ts");

// https://vite.dev/config/
export default defineConfig((): UserConfig => {
  const config: UserConfig = {
    base: "/accounts/",
    resolve: {
      alias: [
        // Stub heavy/unused @aventisia/ui peer dependencies that are side-effect
        // imported by the legacy UI bundles but not used by the accounts app.
        { find: /^@codemirror\/.*/, replacement: unusedUiPeerStub },
        { find: "@uiw/react-codemirror", replacement: unusedUiPeerStub },
        { find: "@monaco-editor/react", replacement: unusedUiPeerStub },
        { find: "@/react-toolkit", replacement: path.resolve(__dirname, "./react-toolkit") }, // SHOULD BE FIRST
        { find: "@", replacement: path.resolve(__dirname, "./src") }, // SHOULD BE SECOND
      ],
    },
  };

  return mergeConfig(baseConfig as UserConfig, config);
});
