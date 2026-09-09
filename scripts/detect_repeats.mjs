#!/usr/bin/env node
// detect_repeats.mjs <captions.json>
// Detecta secuencias de 3 palabras que aparecen más de una vez (el Dr. puede haber
// repetido una toma, o ser repetición retórica). Reporta los segundos de cada
// ocurrencia. NO elimina nada — la decisión es del usuario. Reemplaza el `node -e`
// inline de la skill reel-yapping (paso 7).
import { readFileSync } from "node:fs";

const path = process.argv[2];
if (!path) {
  console.error("uso: node scripts/detect_repeats.mjs <captions.json>");
  process.exit(1);
}

const caps = JSON.parse(readFileSync(path, "utf8"));

// Reconstruir palabras completas (tokens sin espacio inicial = continuación).
const words = [];
let cur = null;
for (const c of caps) {
  if (c.text.startsWith(" ") || cur === null) {
    if (cur) words.push(cur);
    cur = { text: c.text.trim(), startMs: c.startMs };
  } else {
    cur.text += c.text;
  }
}
if (cur) words.push(cur);

const seqMap = {};
for (let i = 0; i < words.length - 2; i++) {
  const seq = `${words[i].text} ${words[i + 1].text} ${words[i + 2].text}`;
  (seqMap[seq] ??= []).push((words[i].startMs / 1000).toFixed(1) + "s");
}

const repeats = Object.entries(seqMap).filter(([, v]) => v.length > 1);
if (!repeats.length) {
  console.log("Sin secuencias de 3 palabras repetidas.");
} else {
  for (const [seq, times] of repeats) console.log(`${times.join(" | ")} → "${seq}"`);
}
