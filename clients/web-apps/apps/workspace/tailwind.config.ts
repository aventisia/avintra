import baseConfig from "@avplatform/tailwind-config/tailwind.config";

export default {
  ...baseConfig,
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx,md,mdx}",
    "./react-toolkit/**/*.{html,js,jsx,ts,tsx,md,mdx}",
    "../../packages/assistant-chat/src/**/*.{html,js,jsx,ts,tsx,md,mdx}",
    "../../packages/ui/src/**/*.{html,js,jsx,ts,tsx,md,mdx}",
    "../../packages/layout/src/**/*.{html,js,jsx,ts,tsx,md,mdx}",
    "../../packages/tauri-utils/src/**/*.{html,js,jsx,ts,tsx,md,mdx}",
  ],
};
