module.exports = {
  // Type check TypeScript files
  "**/*.(ts|tsx)": () => "npx tsc --noEmit",

  // Lint & Prettify TS and JS files
  "**/*.(ts|tsx|js)": (filenames) => [
    `npm run prettier --write ${filenames.join(" ")}`,
    `npx eslint --max-warnings=0 ${filenames.join(" ")}`,
  ],

  // Prettify only Markdown and JSON files
  "**/*.(md|json)": (filenames) =>
    `npm run prettier --write ${filenames.join(" ")}`,

  "**/*.(md|json)": () => "npm run prettier --write",
};
