import path from "path";

import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import eslint from "vite-plugin-eslint2";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/workspace/",
  plugins: [
    react(),
    eslint({
      cache: false,
      include: ["src/**/*.ts", "src/**/*.tsx"],
      exclude: ["node_modules"],
    }),
  ],
  resolve: {
    alias: {
      "@/react-toolkit": path.resolve(__dirname, "./react-toolkit"), // SHOULD BE FIRST
      "@": path.resolve(__dirname, "./src"), // SHOULD BE SECOND
    },
  },
});
