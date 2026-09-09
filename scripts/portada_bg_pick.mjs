#!/usr/bin/env node
// portada_bg_pick.mjs <captions.json>
// Elige un buen frame para el fondo de la portada (portadaBgMs): un token con
// buena confianza, en el primer tercio del clip, sin puntuación de cierre.
// Imprime el startMs para pegar en Root.tsx. Reemplaza el `node -e` inline de base.md.
import { readFileSync } from "node:fs";

const path = process.argv[2];
if (!path) {
  console.error("uso: node scripts/portada_bg_pick.mjs <captions.json>");
  process.exit(1);
}

const caps = JSON.parse(readFileSync(path, "utf8"));
const END_PUNCT = /[.!?…]/;
const good = caps.filter(
  (c) =>
    c.confidence > 0.6 &&
    c.endMs > c.startMs + 100 &&
    c.startMs > 3000 &&
    c.startMs < 15000 &&
    !END_PUNCT.test(c.text.trim()) &&
    c.text.startsWith(" "),
);

if (!good.length) {
  console.error("no se encontró un frame candidato; ampliá la ventana o elegí a mano");
  process.exit(2);
}

const pick = good[Math.floor(good.length / 2)];
console.log("portadaBgMs:", pick.startMs, "|", pick.text.trim(), "@", pick.startMs + "ms");
