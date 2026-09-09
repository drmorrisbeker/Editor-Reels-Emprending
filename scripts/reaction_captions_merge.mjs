#!/usr/bin/env node
// reaction_captions_merge.mjs <react_captions.json> <opinion_captions.json> <splitBlockMs>
// Une los captions de los dos bloques del reel-reacción (estructura de bloques fijos):
//   1) bloque split (mi voz reaccionando)  → captions tal cual, arrancan en 0.
//   2) bloque opinión (mi voz full-screen) → captions desplazados +splitBlockMs.
// splitBlockMs = duración del clip de reacción ya editado (clip_react.mp4) en ms.
// Imprime el JSON combinado a stdout (redirigir a clip_reaccion_captions.json).
import { readFileSync } from "node:fs";

const [reactPath, opinionPath, splitBlockMsArg] = process.argv.slice(2);
if (!reactPath || !opinionPath || splitBlockMsArg === undefined) {
  console.error(
    "uso: node scripts/reaction_captions_merge.mjs <react_captions.json> <opinion_captions.json> <splitBlockMs>",
  );
  process.exit(1);
}
const splitBlockMs = Number(splitBlockMsArg);
if (!Number.isFinite(splitBlockMs) || splitBlockMs < 0) {
  console.error("splitBlockMs debe ser un número de ms >= 0 (duración del clip de reacción editado)");
  process.exit(1);
}

const react = JSON.parse(readFileSync(reactPath, "utf8"));
const opinion = JSON.parse(readFileSync(opinionPath, "utf8"));

const shifted = opinion.map((c) => ({
  ...c,
  startMs: c.startMs + splitBlockMs,
  endMs: c.endMs + splitBlockMs,
}));

process.stdout.write(JSON.stringify([...react, ...shifted], null, 2) + "\n");
