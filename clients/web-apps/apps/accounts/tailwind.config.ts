import baseConfig from "@avplatform/tailwind-config/tailwind.config";

export default {
  ...baseConfig,

  // Add specific or override config here
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx,md,mdx}",
    "../../packages/ui/src/**/*.{html,js,jsx,ts,tsx,md,mdx}",
  ],
};
