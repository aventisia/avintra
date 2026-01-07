import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";
import eslint from "vite-plugin-eslint2";

// https://vite.dev/config/
export default defineConfig({
  base: "/accounts/",
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
