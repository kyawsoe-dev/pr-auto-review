import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    extends: [js.configs.recommended],
  },
  {
    files: ["**/*.spec.js", "**/*.test.js"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.jest,
      },
      sourceType: "module",
    },
    extends: [js.configs.recommended],
  },
]);
