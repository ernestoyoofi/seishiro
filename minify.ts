import { $ } from "bun";
import { glob } from "glob";

const files = await glob("dist/**/*.js");

console.log(`Compressing ${files.length} files in parallel...`);

await Promise.all(
  files.map((file) => $`bunx terser ${file} -c -m toplevel=true -o ${file}`),
);

console.log("Success!");
