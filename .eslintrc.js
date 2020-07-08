module.exports = {
  root: true,
  env: {
    browser: false,
    node: true
  },
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "prettier"],
  parserOptions: {
    project: "./tsconfig.build.json",
    extraFileExtensions: [".json"]
  },
  ignorePatterns: ["**/*.d.ts", "**/*.spec.ts"],
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
    "prettier/standard",
    "prettier"
  ],
  rules: {}
};
