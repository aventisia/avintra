import js from "@eslint/js";
import eslintPluginImport from "eslint-plugin-import";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "src-tauri"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      import: eslintPluginImport, // Add the import plugin
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "import/order": [
        "error",
        {
          groups: [
            "builtin", // Node.js built-ins (e.g., fs, path)
            "external", // External libraries (e.g., react, lodash)
            "internal", // Internal imports (e.g., aliases like @/components)
            "parent", // Parent imports (e.g., ../file)
            "sibling", // Sibling imports (e.g., ./file)
            "index", // Index imports (e.g., ./)
          ],
          pathGroups: [
            {
              pattern: "@/**", // Match absolute imports (e.g., "@/...")
              group: "internal",
              position: "before",
            },
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
          "newlines-between": "always", // Enforce newlines between groups
          alphabetize: { order: "asc", caseInsensitive: true }, // Sort alphabetically
        },
      ],
    },
  },
);
