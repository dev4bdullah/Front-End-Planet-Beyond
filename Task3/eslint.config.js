import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import prettier from "eslint-config-prettier";

export default [
  { ignores: ["dist", "node_modules"] },

  // Config files run in Node, not the browser — __dirname and process exist there
  {
    files: ["*.config.js", "vite.config.js"],
    languageOptions: { globals: globals.node, sourceType: "module" },
    rules: { ...js.configs.recommended.rules }
  },

  {
    files: ["src/**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true }, sourceType: "module" }
    },
    settings: { react: { version: "detect" } },
    plugins: { react, "react-hooks": reactHooks, "react-refresh": reactRefresh },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "no-unused-vars": ["warn", { varsIgnorePattern: "^[A-Z_]" }]
    }
  },
  // Last, so it can switch off every rule that would argue with Prettier
  prettier
];
