module.exports = {
  root: true,
  env: {
    browser: false,
    node: true
  },
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "prettier"],
  parserOptions: {
    project: "./tsconfig.json",
    extraFileExtensions: [".json"]
  },
  overrides: [
    {
      files: ["**/*.ts"]
    }
  ],
  ignorePatterns: ["**/*.d.ts", "**/*.spec.ts"],
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
    "prettier/standard",
    "prettier"
  ],
  rules: {
    "@typescript-eslint/explicit-function-return-type": 0
  }
};
