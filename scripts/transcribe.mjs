import path from "path";
import { fileURLToPath } from "url";
import {
  downloadWhisperModel,
  installWhisperCpp,
  transcribe,
  toCaptions,
} from "@remotion/install-whisper-cpp";
import { execSync } from "child_process";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");
const whisperDir = path.join(projectRoot, "whisper.cpp");
const publicDir = path.join(projectRoot, "public");

// Accept a full relative path (e.g. public/proyectos/foo/ediciones/clip_edit.mp4) or bare name
const arg = process.argv[2] ?? "clip";
let videoPath, wavPath, captionsPath;
if (arg.includes("/") || arg.endsWith(".mp4")) {
  // Full path mode
  videoPath = path.isAbsolute(arg) ? arg : path.join(projectRoot, arg);
  const base = videoPath.replace(/\.mp4$/, "");
  wavPath = base + ".wav";
  captionsPath = base + "_captions.json";
} else {
  videoPath = path.join(publicDir, `${arg}.mp4`);
  wavPath = path.join(publicDir, `${arg}.wav`);
  captionsPath = path.join(publicDir, `${arg}_captions.json`);
}

console.log(`Transcribing: ${videoPath}`);

await installWhisperCpp({ to: whisperDir, version: "1.5.5" });
await downloadWhisperModel({ model: "medium", folder: whisperDir });

console.log("Converting to 16kHz WAV...");
execSync(`ffmpeg -i "${videoPath}" -ar 16000 -ac 1 "${wavPath}" -y`, {
  stdio: "inherit",
});

console.log("Transcribing (español)...");
const whisperOutput = await transcribe({
  model: "medium",
  whisperPath: whisperDir,
  whisperCppVersion: "1.5.5",
  inputPath: wavPath,
  tokenLevelTimestamps: true,
  language: "es",
});

const { captions } = toCaptions({ whisperCppOutput: whisperOutput });

// Auto-capitalize first token of each Whisper segment → triggers isSentenceBoundary
for (const segment of whisperOutput.transcription) {
  const idx = captions.findIndex(c => c.startMs >= segment.offsets.from);
  if (idx >= 0) {
    captions[idx].text = captions[idx].text.replace(
      /^(\s*)([a-záéíóúüñ])/i,
      (_, sp, ch) => sp + ch.toUpperCase()
    );
  }
}

fs.writeFileSync(captionsPath, JSON.stringify(captions, null, 2));

// Also print full transcript for content analysis
const fullText = captions.map((c) => c.text).join("");
console.log("\n── TRANSCRIPCIÓN COMPLETA ──");
console.log(fullText);
console.log(`\nTotal tokens: ${captions.length}`);
console.log(`Captions → ${captionsPath}`);
