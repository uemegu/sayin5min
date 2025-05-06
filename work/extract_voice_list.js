#!/usr/bin/env node
// extract-hoshina.js
// 使い方: node extract-hoshina.js <jsonファイルパス>

import fs from "node:fs/promises";
import path from "node:path";

const [, , filePath] = process.argv;
if (!filePath) {
  console.error("★ JSON ファイルパスを引数に指定してね！");
  process.exit(1);
}

const jsonText = await fs.readFile(path.resolve(filePath), "utf8");
const gameData = JSON.parse(jsonText);

// ---------- 抜き出しロジック ----------
const lines = [];

for (const chapter of gameData.chapters ?? []) {
  for (const scene of chapter.scenes ?? []) {
    const t = scene.text;
    console.log(t);
    if (typeof t === "string" && t.startsWith("妹「")) {
      lines.push(t);
    }
  }
}

// ---------- 出力 ----------
if (lines.length === 0) {
  console.log("セリフは見つからなかったよ…🥲");
} else {
  console.log("🌟 セリフ一覧 🌟");
  lines.forEach((l) => console.log(l));
}
