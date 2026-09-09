#!/usr/bin/env node
// scenes_catalog.mjs
// Aid de mantenimiento del catálogo de escenas: escanea src/components/scenes/ y los
// archivos tipo *Scene/*Overlay sueltos en src/components/, y lista por cada uno el
// nombre del componente + la firma de props (React.FC<{...}>). NO reemplaza a
// .claude/rules/scenes.md (las descripciones "qué muestra / cuándo" se curan a mano):
// esto sirve para ver rápido qué archivos hay y qué props reciben tras agregar escenas.
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const SCENES_DIR = join(ROOT, "src/components/scenes");
const COMPONENTS_DIR = join(ROOT, "src/components");

const files = [];
if (existsSync(SCENES_DIR)) {
  for (const f of readdirSync(SCENES_DIR).filter((f) => f.endsWith(".tsx")))
    files.push(join("src/components/scenes", f));
}
for (const f of readdirSync(COMPONENTS_DIR).filter((f) => /(Scene|Overlay)\.tsx$/.test(f)))
  files.push(join("src/components", f));

const seen = {};
const rows = [];
for (const rel of files) {
  const src = readFileSync(join(ROOT, rel), "utf8");
  // export const XxxScene: React.FC<{ ... }> = ...   (props hasta el "> =")
  const m = src.match(/export const (\w+):\s*React\.FC<\s*(\{[\s\S]*?\})?\s*>\s*=/);
  const name = m ? m[1] : rel.split("/").pop().replace(".tsx", "");
  let props = m && m[2] ? m[2].replace(/\s+/g, " ").trim() : "sin props";
  if (props.length > 160) props = props.slice(0, 157) + "…}";
  (seen[name] ??= []).push(rel);
  rows.push({ name, rel, props });
}

rows.sort((a, b) => a.name.localeCompare(b.name));
for (const r of rows) console.log(`- **${r.name}** (\`${r.rel}\`) — props: \`${r.props}\``);

const dups = Object.entries(seen).filter(([, v]) => v.length > 1);
if (dups.length) {
  console.log("\n## Duplicados (mismo nombre en dos rutas):");
  for (const [name, paths] of dups) console.log(`- ${name}: ${paths.join(" , ")}`);
}
console.log(`\n(${rows.length} archivos escaneados)`);
