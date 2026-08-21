import js from "@eslint/js";
import globals from "globals";
import prettier from "eslint-config-prettier";

export default [
  { ignores: ["node_modules", "dist"] },
  {
    files: ["**/*.js"],
    languageOptions: {
      // Browser ES modules, not CommonJS — this is the setting that matters
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-var": "error",
      "prefer-const": "warn",
      eqeqeq: ["error", "smart"],
      "no-console": "off"
    }
  },
  // Must be last: turns off every rule that would argue with Prettier
  prettier
];
