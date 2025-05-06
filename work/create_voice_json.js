#!/usr/bin/env node
// copy-wavs.js
import fs from "node:fs/promises";
import path from "node:path";

const [, , targetDir, prefix = "copy"] = process.argv;
if (!targetDir) {
  console.error("使い方: node copy-wavs.js <dir> [prefix]");
  process.exit(1);
}

const results = [];
let counter = 1;

/** 再帰的に .wav を走査してコピー */
async function walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full);
    } else if (entry.isFile() && /\.wav$/i.test(entry.name)) {
      const originalNameNoExt = path.parse(entry.name).name;
      const newName = `${prefix}_${counter++}.wav`;
      const dest = path.join(dir, newName);
      await fs.copyFile(full, dest);
      results.push({
        key: originalNameNoExt,
        value: `./voice/hoshina/${newName}`,
      });
    }
  }
}

await walk(path.resolve(targetDir));
console.log(JSON.stringify(results, null, 2));
