module.exports = {
  "**/*.{ts,tsx,js}": (files) => [
    `npx prettier --write ${files.join(" ")}`,
    `npx eslint --max-warnings=0 ${files.join(" ")}`,
  ],
  "**/*.{md,json}": (files) => `npx prettier --write ${files.join(" ")}`,
};
