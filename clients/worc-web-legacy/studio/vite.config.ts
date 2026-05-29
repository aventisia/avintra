import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import eslint from "vite-plugin-eslint2";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/studio/",
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
