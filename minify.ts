import { $ } from "bun";
import { glob } from "glob";

const files = await glob("dist/**/*.js");

console.log(`Compress ${files.length} file...`);

for (const file of files) {
  await $`bunx terser ${file} -c -m -o ${file}`;
}

console.log("Success!");
