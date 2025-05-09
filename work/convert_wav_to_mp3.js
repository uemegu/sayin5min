import fs from "node:fs/promises";
import path from "node:path";
import ffmpeg from "fluent-ffmpeg";

const SRC_DIR = "../public/voice/sister/";
const BITRATE = "192k";

const files = await fs.readdir(SRC_DIR, { withFileTypes: true });

for (const entry of files) {
  if (!entry.isFile()) continue;
  if (path.extname(entry.name).toLowerCase() !== ".wav") continue;

  const srcPath = path.join(SRC_DIR, entry.name);
  const outName = path.basename(entry.name, ".wav") + ".mp3";
  const outPath = path.join(SRC_DIR, outName);

  console.log(`🎧 ${entry.name} → ${outName}`);

  await new Promise((resolve, reject) => {
    ffmpeg(srcPath)
      .audioCodec("libmp3lame")
      .audioBitrate(BITRATE)
      .on("error", reject)
      .on("end", resolve)
      .save(outPath);
  });
}

console.log("✅ ぜんぶ変換完了っス！");
