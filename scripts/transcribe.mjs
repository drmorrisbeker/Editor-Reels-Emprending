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

// Usage: node scripts/transcribe.mjs <clip.mp4> [--model large-v3|large-v3-turbo|medium]
// Default large-v3 con división por palabra: `medium` sin split derivaba (en 73 s no registraba
// ninguna pausa y la última palabra caía fuera del clip). Modelos en whisper.cpp/ (ya descargados).
const rawArgs = process.argv.slice(2);
let model = "large-v3";
const positionals = [];
for (let i = 0; i < rawArgs.length; i++) {
  if (rawArgs[i] === "--model") model = rawArgs[++i];
  else if (rawArgs[i].startsWith("--model=")) model = rawArgs[i].slice("--model=".length);
  else positionals.push(rawArgs[i]);
}

// Accept a full relative path (e.g. public/proyectos/foo/ediciones/clip_edit.mp4) or bare name
const arg = positionals[0] ?? "clip";
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
await downloadWhisperModel({ model, folder: whisperDir });

console.log("Converting to 16kHz WAV...");
execSync(`ffmpeg -i "${videoPath}" -ar 16000 -ac 1 "${wavPath}" -y`, {
  stdio: "inherit",
});

console.log(`Transcribing (español) con modelo ${model}...`);
const whisperOutput = await transcribe({
  model,
  whisperPath: whisperDir,
  whisperCppVersion: "1.5.5",
  inputPath: wavPath,
  tokenLevelTimestamps: true,
  language: "es",
  // División por palabra como flag suelto. NO usar `splitOnWord: true`: la librería emite
  // `--split-on-word true` y whisper.cpp 1.5.5 toma ese "true" como archivo de entrada →
  // "input file not found 'true'" y sale con error sin escribir captions.
  additionalArgs: ["--split-on-word"],
});

const { captions } = toCaptions({ whisperCppOutput: whisperOutput });

// Auto-capitalize first token of each Whisper segment → triggers isSentenceBoundary.
// Guardas: con división por palabra whisper emite un segmento por palabra; sin esto se
// capitalizaba TODO (incluso sub-palabras: "Dig"+"An"). Nunca capitalizar continuaciones (token
// sin espacio inicial) y, si el segmento tiene < 3 tokens, solo cuando hay pausa ≥ 380 ms o
// puntuación de cierre antes (misma lógica de página que Subtitles.tsx).
const segs = whisperOutput.transcription;
for (let s = 0; s < segs.length; s++) {
  const segment = segs[s];
  const idx = captions.findIndex(c => c.startMs >= segment.offsets.from);
  if (idx < 0) continue;
  const tok = captions[idx];
  if (idx > 0 && !tok.text.startsWith(" ")) continue;
  const nextFrom = segs[s + 1]?.offsets.from ?? Infinity;
  const nTokens = captions.filter(c => c.startMs >= segment.offsets.from && c.startMs < nextFrom).length;
  const prev = captions[idx - 1];
  const gap = prev ? tok.startMs - prev.endMs : Infinity;
  const afterPunct = prev ? /[.!?…]\s*$/.test(prev.text) : true;
  if (nTokens < 3 && gap < 380 && !afterPunct) continue;
  tok.text = tok.text.replace(/^(\s*)([a-záéíóúüñ])/i, (_, sp, ch) => sp + ch.toUpperCase());
}

fs.writeFileSync(captionsPath, JSON.stringify(captions, null, 2));

// Also print full transcript for content analysis
const fullText = captions.map((c) => c.text).join("");
console.log("\n── TRANSCRIPCIÓN COMPLETA ──");
console.log(fullText);
console.log(`\nTotal tokens: ${captions.length}`);
console.log(`Captions → ${captionsPath}`);
