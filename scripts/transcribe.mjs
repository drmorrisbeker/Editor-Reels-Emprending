// Transcribe a clip to word-level captions JSON with whisper.cpp.
// Usage: node scripts/transcribe.mjs <clip.mp4> [--model large-v3|large-v3-turbo|medium]
// Default model: large-v3 (word-level splitting → real pauses, no timestamp drift).
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

// Parse args: positional video path + optional --model <name> (default large-v3).
const rawArgs = process.argv.slice(2);
let model = "large-v3";
const positionals = [];
for (let i = 0; i < rawArgs.length; i++) {
  if (rawArgs[i] === "--model") {
    model = rawArgs[++i];
  } else if (rawArgs[i].startsWith("--model=")) {
    model = rawArgs[i].slice("--model=".length);
  } else {
    positionals.push(rawArgs[i]);
  }
}
if (!model) {
  console.error("Error: --model requires a name (e.g. large-v3, large-v3-turbo, medium)");
  process.exit(1);
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
  // División por palabra (evita el drift de timestamps que sufre `medium` sin split).
  // OJO: en @remotion/install-whisper-cpp la opción `splitOnWord: true` se traduce a
  // `--split-on-word true`, pero en whisper.cpp `-sow` es un toggle SIN valor, así que ese
  // "true" se interpreta como un segundo archivo de entrada → "input file not found 'true'"
  // y el proceso aborta con exit 1 (las captions nunca se escriben). `-sow` va como flag suelto
  // vía additionalArgs, que la librería inyecta tal cual sin agregarle valor.
  additionalArgs: ["--split-on-word"],
});

const { captions } = toCaptions({ whisperCppOutput: whisperOutput });

// Auto-capitalize first token of each Whisper segment → triggers isSentenceBoundary.
// Guardas (2026-09-08): en clips cortos whisper.cpp emite un segmento por token y esto
// capitalizaba TODO ("Dig"+"An", "F"+"Í"+"J"+"Ate"). Nunca capitalizar sub-palabras (token sin
// espacio inicial) y, si el segmento tiene < 3 tokens, solo cuando hay pausa ≥ 380 ms o
// puntuación de cierre antes (misma lógica de página que Subtitles.tsx).
const segs = whisperOutput.transcription;
for (let s = 0; s < segs.length; s++) {
  const segment = segs[s];
  const idx = captions.findIndex(c => c.startMs >= segment.offsets.from);
  if (idx < 0) continue;
  const tok = captions[idx];
  if (idx > 0 && !tok.text.startsWith(" ")) continue; // continuación de palabra
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
