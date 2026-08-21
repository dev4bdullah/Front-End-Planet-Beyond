import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-config-prettier";

export default [
  { ignores: ["node_modules", ".expo", "dist", "web-build"] },

  // Config and script files run in Node
  {
    files: ["*.config.js", "scripts/**/*.mjs"],
    languageOptions: { globals: globals.node, sourceType: "module" },
    rules: { ...js.configs.recommended.rules }
  },

  {
    files: ["index.js", "src/**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: {
        ...globals.browser,
        // React Native globals — there is no window or document on a device
        __DEV__: "readonly",
        global: "readonly",
        require: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        fetch: "readonly",
        alert: "readonly"
      }
    },
    settings: { react: { version: "detect" } },
    plugins: { react, "react-hooks": reactHooks },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      /* A web rule. Its suggested fix (&apos;) renders literally in React
         Native, so following it would introduce the bug it claims to prevent. */
      "react/no-unescaped-entities": "off",
      "react/prop-types": "off",
      // RN has no <div>, so unknown-property warnings don't apply
      "react/no-unknown-property": "off",
      "no-unused-vars": ["warn", { varsIgnorePattern: "^[A-Z_]" }]
    }
  },

  prettier
];
