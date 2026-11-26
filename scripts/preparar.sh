#!/usr/bin/env bash
# preparar.sh — deja la plantilla lista para trabajar. Se puede correr las veces que haga falta.
#   · crea Crudos/, Ediciones/, Terminados/ y marcas/ si faltan
#   · conecta public/ediciones → Ediciones/ (Remotion lee los videos desde public/)
#   · crea src/Root.tsx desde la plantilla si no existe
#   · lista las marcas guardadas
set -euo pipefail
VR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$VR"
for d in Crudos Ediciones Terminados marcas public; do
  [ -d "$d" ] || { mkdir -p "$d"; echo "creada: $d/"; }
done
[ -L public/ediciones ] || { rm -rf public/ediciones; ln -s ../Ediciones public/ediciones; echo "conectado: public/ediciones → Ediciones/"; }
[ -f src/Root.tsx ] || { cp templates/Root.template.tsx src/Root.tsx; echo "creado: src/Root.tsx (plantilla en blanco)"; }
[ -d node_modules ] || echo "falta instalar: npm ci"
command -v ffmpeg >/dev/null || echo "falta ffmpeg (ver SETUP.md)"
echo "marcas guardadas: $(cd marcas && ls -d */ 2>/dev/null | tr -d / | grep -vx ejemplo | tr '\n' ' ' || true)"
