#!/usr/bin/env node
/**
 * captions_resumen.mjs — genera el resumen §F1 de un transcript de captions.
 *
 * Uso:
 *   node scripts/captions_resumen.mjs <captions.json> --video <clip.mp4> \
 *        [--out <path.md>] [--fix-zero-duration]
 *
 * Sin --out imprime a stdout. Con --out escribe el archivo e imprime una línea.
 * Sin dependencias externas: solo builtins de node + `ffprobe` (allowlisted) por
 * child_process para la duración real del video.
 *
 * --fix-zero-duration: a los tokens con startMs === endMs les pone
 *   endMs = startMs + 50 y reescribe el JSON conservando el estilo del original
 *   (pretty 2 espacios si tenía saltos de línea; minificado si no).
 */

import { readFileSync, writeFileSync } from "node:fs";
import { basename } from "node:path";
import { execFileSync } from "node:child_process";

// ── Lógica duplicada de src/components/Subtitles.tsx ─────────────────────────
// Duplicado de src/components/Subtitles.tsx (no se puede importar TSX desde node);
// si cambia allá, cambiar acá.

// mergeIntoWords: un token sin espacio inicial es continuación de la palabra
// anterior. Se fusionan en palabras completas.
function mergeIntoWords(captions) {
  const words = [];
  for (const cap of captions) {
    const isContinuation = !cap.text.startsWith(" ");
    if (isContinuation) {
      if (words.length === 0) {
        words.push({ text: cap.text.trimStart(), fromMs: cap.startMs, toMs: cap.endMs });
      } else {
        const prev = words[words.length - 1];
        prev.text += cap.text;
        prev.toMs = cap.endMs;
      }
    } else {
      words.push({ text: cap.text, fromMs: cap.startMs, toMs: cap.endMs });
    }
  }
  return words.map((w) => ({ ...w, text: w.text.trimStart() }));
}

// isSentenceBoundary: detecta cierre de oración `.!?…`, apertura `¿¡`, o que la
// próxima palabra arranque con mayúscula (Whisper capitaliza inicio de oración).
function isSentenceBoundary(prev, next) {
  return (
    /[.!?…]$/.test(prev.text.trim()) ||
    /^[¿¡]/.test(next.text.trim()) ||
    /^[A-ZÁÉÍÓÚÜÑ]/.test(next.text.trim())
  );
}

// Filtro de limpieza de tokens (Subtitles.tsx:179-191).
function cleanCaptions(captions) {
  return captions.filter((c) => {
    const t = c.text.trim();
    if (t.length === 0) return false;
    if (/^\[.*\]$/.test(t)) return false;
    // Puntuación de cierre suelta: si es continuación (sin espacio) se mantiene y
    // se fusiona; si está suelta (con espacio) se descarta.
    if (/^[.,;:!?…]+$/.test(t)) return !c.text.startsWith(" ");
    if (c.confidence === null || c.confidence <= 0.15) return false;
    if (c.endMs <= c.startMs) return false;
    return true;
  });
}

const GAP_THRESHOLD_MS = 380;

// ── Args ─────────────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const args = { _: [], video: null, out: null, fixZero: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--video") args.video = argv[++i];
    else if (a === "--out") args.out = argv[++i];
    else if (a === "--fix-zero-duration") args.fixZero = true;
    else args._.push(a);
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const captionsPath = args._[0];
if (!captionsPath) {
  console.error("Uso: node scripts/captions_resumen.mjs <captions.json> --video <clip.mp4> [--out <path.md>] [--fix-zero-duration]");
  process.exit(1);
}
if (!args.video) {
  console.error("Falta --video <clip.mp4>");
  process.exit(1);
}

// ── Lectura del JSON (preservando estilo) ────────────────────────────────────
const raw = readFileSync(captionsPath, "utf8");
const wasPretty = /\n/.test(raw.trim());
const captions = JSON.parse(raw);

// ── zero-duration ────────────────────────────────────────────────────────────
let zeroFixed = 0;
for (const c of captions) {
  if (c.startMs === c.endMs) {
    zeroFixed++;
    if (args.fixZero) c.endMs = c.startMs + 50;
  }
}
if (args.fixZero && zeroFixed > 0) {
  const out = wasPretty ? JSON.stringify(captions, null, 2) : JSON.stringify(captions);
  writeFileSync(captionsPath, out);
}

// ── ffprobe duración ─────────────────────────────────────────────────────────
function ffprobeDuration(video) {
  const out = execFileSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", video],
    { encoding: "utf8" },
  ).trim();
  return parseFloat(out);
}
const durSec = ffprobeDuration(args.video);

// ── Palabras y oraciones ─────────────────────────────────────────────────────
const clean = cleanCaptions(captions);
const words = mergeIntoWords(clean);

// Oraciones: agrupar palabras hasta isSentenceBoundary de la próxima o gap ≥ 380 ms
// (mirror de la lógica de páginas de Subtitles, pero sin límite de palabras por línea).
function buildSentences(ws) {
  const sentences = [];
  let bucket = [];
  const flush = () => {
    if (!bucket.length) return;
    sentences.push({
      startMs: bucket[0].fromMs,
      endMs: bucket[bucket.length - 1].toMs,
      text: bucket.map((w) => w.text).join(" "),
    });
    bucket = [];
  };
  for (const word of ws) {
    if (bucket.length > 0) {
      const prev = bucket[bucket.length - 1];
      const gap = word.fromMs - prev.toMs;
      if (gap >= GAP_THRESHOLD_MS || isSentenceBoundary(prev, word)) flush();
    }
    bucket.push(word);
  }
  flush();
  return sentences;
}
const sentences = buildSentences(words);

// ── Última palabra ───────────────────────────────────────────────────────────
const lastWord = words[words.length - 1];
const lastEndSec = lastWord ? lastWord.toMs / 1000 : 0;
const margin = durSec - lastEndSec;
const lastOk = margin >= 0.30 ? "OK" : "REVISAR";

// ── portadaBgMs candidato (regla textual de base.md) ─────────────────────────
const END_PUNCT = /[.!?…]/;
const good = captions.filter(
  (c) =>
    c.confidence > 0.6 &&
    c.endMs > c.startMs + 100 &&
    c.startMs > 3000 &&
    c.startMs < 15000 &&
    !END_PUNCT.test(c.text.trim()) &&
    c.text.startsWith(" "),
);
const portadaPick = good.length ? good[Math.floor(good.length / 2)] : null;

// ── Repeticiones (3-gramas) — compare case-insensitive, sin puntuación ───────
function norm(t) {
  return t
    .toLowerCase()
    .replace(/[.,;:!?…¿¡"'«»()]/g, "")
    .trim();
}
const seqMap = {};
for (let i = 0; i < words.length - 2; i++) {
  const key = [norm(words[i].text), norm(words[i + 1].text), norm(words[i + 2].text)].join(" ");
  if (!seqMap[key]) seqMap[key] = [];
  seqMap[key].push(words[i].fromMs);
}
const repeticiones = Object.entries(seqMap)
  .filter(([, times]) => times.length > 1)
  .map(([seq, times]) => ({
    seq,
    times: times.map((ms) => (ms / 1000).toFixed(1) + "s"),
  }));

// ── Tokens dudosos (confidence < 0.50; ≤ 0.15 = OCULTO) ──────────────────────
const dudosos = captions.filter((c) => c.confidence === null || c.confidence < 0.5);

// ── Pausas internas ≥ 300 ms (entre palabras consecutivas) ───────────────────
const pausas = [];
for (let i = 0; i < words.length - 1; i++) {
  const gap = words[i + 1].fromMs - words[i].toMs;
  if (gap >= 300) pausas.push({ endMs: words[i].toMs, startMs: words[i + 1].fromMs, gap });
}

// ── Ensamblado del markdown ──────────────────────────────────────────────────
const L = [];
const pad = (s, n) => String(s).padEnd(n);

L.push(`# transcript_resumen — ${basename(args.video)}`);
L.push(
  `Duración: ${durSec.toFixed(2)} s (durationSeconds: ${durSec.toFixed(1)}) | tokens: ${captions.length} | palabras: ${words.length} | zero-duration corregidos: ${zeroFixed}`,
);
L.push(
  `Última palabra: "${lastWord ? lastWord.text : ""}" termina ${lastEndSec.toFixed(2)} s | margen ${margin.toFixed(2)} s | ${lastOk}`,
);
if (portadaPick) {
  L.push(`portadaBgMs candidato: ${portadaPick.startMs}  ("${portadaPick.text.trim()}" @ ${portadaPick.startMs} ms)`);
} else {
  L.push(`portadaBgMs candidato: (ninguno en 3–15 s)`);
}
L.push("");
L.push("## Transcript (una línea por oración; ms del clip editado)");
for (const s of sentences) {
  L.push(`${pad(`${s.startMs}–${s.endMs}`, 12)}| ${s.text}`);
}
L.push("## Repeticiones (3-gramas, más de una vez)");
if (repeticiones.length) {
  for (const r of repeticiones) L.push(`${r.times.join(" | ")} → "${r.seq}"`);
} else {
  L.push("(ninguna)");
}
L.push("## Tokens dudosos (confidence < 0.50; ≤ 0.15 = OCULTO por Subtitles)");
if (dudosos.length) {
  for (const c of dudosos) {
    const conf = c.confidence === null ? "null" : c.confidence.toFixed(2);
    const oculto = c.confidence === null || c.confidence <= 0.15 ? " OCULTO" : "";
    L.push(`${c.startMs} "${c.text}" ${conf}${oculto}`);
  }
} else {
  L.push("(ninguno)");
}
L.push("## Pausas internas ≥ 300 ms");
if (pausas.length) {
  L.push(pausas.map((p) => `${p.endMs}→${p.startMs} (${p.gap} ms)`).join(" | "));
} else {
  L.push("(ninguna)");
}
L.push("## Notas del worker");
L.push("(el worker anexa acá)");

const md = L.join("\n") + "\n";

if (args.out) {
  writeFileSync(args.out, md);
  console.log(
    `resumen: ${args.out} | dur ${durSec.toFixed(1)}s | tokens ${captions.length} | palabras ${words.length} | última "${lastWord ? lastWord.text : ""}" ${lastOk} | ${repeticiones.length} repeticiones | ${dudosos.length} dudosos | zero-fix ${args.fixZero ? zeroFixed : 0}`,
  );
} else {
  process.stdout.write(md);
}
