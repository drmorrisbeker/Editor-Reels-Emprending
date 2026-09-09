#!/usr/bin/env node
// scripts/scenes_catalog.mjs
//
// Catálogo de concept scenes reusables. Escanea src/components/scenes/*.tsx (orden
// alfabético) + src/components/RehookScene.tsx. Por archivo:
//   1) parsea la cabecera descriptiva obligatoria de la línea 1
//      `/** Escena: <...> | Tema: <...> | Reusable: <...> */`
//   2) extrae el nombre del componente exportado (`export const <Name>: React.FC`)
//      y el tipo de props (`React.FC<...>`, brace/angle-matched; `—` si no hay generic)
//
// Uso:
//   node scripts/scenes_catalog.mjs            → tabla markdown
//   node scripts/scenes_catalog.mjs --json      → JSON (array de objetos)
//
// Sin dependencias externas (solo builtins de node). Nunca falla: una escena sin
// cabecera o sin match de props simplemente queda marcada, no aborta el script.

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SCENES_DIR = join(ROOT, "src", "components", "scenes");
const REHOOK_FILE = join(ROOT, "src", "components", "RehookScene.tsx");

const HEADER_RE = /^\/\*\*\s*Escena:\s*(.+?)\s*\|\s*Tema:\s*(.+?)\s*\|\s*Reusable:\s*(.+?)\s*\*\/\s*$/;

function listSceneFiles() {
  let sceneFiles = [];
  try {
    sceneFiles = readdirSync(SCENES_DIR)
      .filter((f) => f.endsWith(".tsx"))
      .sort()
      .map((f) => join(SCENES_DIR, f));
  } catch {
    sceneFiles = [];
  }
  return [...sceneFiles, REHOOK_FILE];
}

function parseHeader(content) {
  const firstLine = content.split("\n", 1)[0] ?? "";
  const m = firstLine.match(HEADER_RE);
  if (!m) {
    return { descripcion: "⚠ sin descripción", tema: "", reusable: "" };
  }
  return { descripcion: m[1], tema: m[2], reusable: m[3] };
}

// Dado el índice inmediatamente después de "React.FC", si el siguiente carácter no
// whitespace es "<", devuelve el contenido entre ese "<" y su ">" correspondiente
// (angle-bracket matched, soporta anidamiento). Si no hay "<", devuelve null (sin generic).
function extractGeneric(content, fromIndex) {
  let i = fromIndex;
  while (i < content.length && /\s/.test(content[i])) i++;
  if (content[i] !== "<") return null;
  const start = i + 1;
  let depth = 1;
  let j = start;
  for (; j < content.length; j++) {
    const ch = content[j];
    if (ch === "<") depth++;
    else if (ch === ">") {
      depth--;
      if (depth === 0) break;
    }
  }
  if (depth !== 0) return null; // sin cierre — no debería pasar en código válido
  return content.slice(start, j);
}

function parseComponent(content) {
  // Nombre: cualquier secuencia sin espacios/":" (identificadores JS válidos pueden
  // llevar letras con diacríticos, p.ej. "MedicacionEnseñaScene" — \w a secas no alcanza).
  const exportRe = /export const ([^\s:]+)\s*:\s*React\.FC/;
  const m = content.match(exportRe);
  if (!m) return { escena: null, props: "—" };
  const name = m[1];
  const afterIdx = m.index + m[0].length;
  const generic = extractGeneric(content, afterIdx);
  const props = generic === null ? "—" : generic.replace(/\s+/g, " ").trim();
  return { escena: name, props: props || "—" };
}

function buildCatalog() {
  const files = listSceneFiles();
  const rows = [];
  for (const file of files) {
    let content;
    try {
      content = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    const { descripcion, tema, reusable } = parseHeader(content);
    const { escena, props } = parseComponent(content);
    rows.push({
      file,
      escena: escena ?? "(sin componente exportado)",
      descripcion,
      tema,
      props,
      reusable,
    });
  }
  return rows;
}

function escapeCell(v) {
  return String(v ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function printTable(rows) {
  const lines = [];
  lines.push("| Escena | Descripción | Props | Reusable |");
  lines.push("|---|---|---|---|");
  for (const r of rows) {
    lines.push(
      `| ${escapeCell(r.escena)} | ${escapeCell(r.descripcion)} | ${escapeCell(r.props)} | ${escapeCell(r.reusable)} |`
    );
  }
  console.log(lines.join("\n"));
  const sinDescripcion = rows.filter((r) => r.descripcion === "⚠ sin descripción").length;
  console.log(`${rows.length} escenas · ${sinDescripcion} sin descripción`);
}

function main() {
  const args = process.argv.slice(2);
  const asJson = args.includes("--json");
  const rows = buildCatalog();
  if (asJson) {
    console.log(JSON.stringify(rows, null, 2));
  } else {
    printTable(rows);
  }
  process.exit(0);
}

main();
