import classnames from "classnames";
import { twMerge } from "tailwind-merge";
import fs from "fs";
import path from "path";

export function cx(...args: classnames.ArgumentArray) {
  return twMerge(classnames(args));
}

export const SYSTEM_PROMPT = fs.readFileSync(
  path.join(process.cwd(), "public", "files", "renzo_caina_ai_prompt.txt"),
  "utf8"
);
