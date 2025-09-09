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
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "module",
    },
  },
]);
