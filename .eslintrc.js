module.exports = {
  extends: [
    "plugin:@typescript-eslint/recommended",
    "next",
    "prettier",
    "next/core-web-vitals",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  root: true,
  ignorePatterns: ["!.lintstagedrc.js"],
  parserOptions: {
    tsconfigRootDir: __dirname,
  },
};
