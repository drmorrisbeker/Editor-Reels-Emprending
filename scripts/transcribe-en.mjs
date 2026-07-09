import path from "path";
import { fileURLToPath } from "url";
import { transcribe, toCaptions } from "@remotion/install-whisper-cpp";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");
const whisperDir = path.join(projectRoot, "whisper.cpp");

const baseName = process.argv[2] ?? "clip";
const wavPath = path.join(projectRoot, "public", `${baseName}.wav`);
const captionsPath = path.join(projectRoot, "public", `${baseName}_captions.json`);

console.log(`Transcribing (en): ${baseName}.wav`);

const whisperOutput = await transcribe({
  model: "medium",
  whisperPath: whisperDir,
  whisperCppVersion: "1.5.5",
  inputPath: wavPath,
  tokenLevelTimestamps: true,
  language: "en",
});

const { captions } = toCaptions({ whisperCppOutput: whisperOutput });
fs.writeFileSync(captionsPath, JSON.stringify(captions, null, 2));

const fullText = captions.map((c) => c.text).join("");
console.log("\n── TRANSCRIPT ──");
console.log(fullText);
console.log(`\nTotal tokens: ${captions.length}`);
console.log(`Captions → ${captionsPath}`);
