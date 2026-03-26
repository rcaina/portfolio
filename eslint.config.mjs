import nextConfig from "eslint-config-next/core-web-vitals";
import tsConfig from "eslint-config-next/typescript";
import prettierConfig from "eslint-config-prettier/flat";

const config = [...nextConfig, ...tsConfig, prettierConfig];

export default config;
