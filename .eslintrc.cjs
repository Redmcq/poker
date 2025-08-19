/* eslint-env node */
module.exports = {
  root: true,
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  env: { browser: true, es2021: true, node: true, jest: true },
  plugins: ["react", "react-hooks"],
  extends: [
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "eslint:recommended",
    "prettier"
  ],
  settings: { react: { version: "detect" } },
  ignorePatterns: [
    "node_modules/",
    "build/",
    "dist/",
    "public/",
    "*.css",
    "*.json",
    "package.json"
  ],
  rules: {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react/display-name": "off",
    "no-empty": ["error", { "allowEmptyCatch": true }]
  }
};
