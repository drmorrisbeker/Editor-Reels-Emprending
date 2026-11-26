#!/usr/bin/env bash
# new_project.sh <nombre> [marca]
# Arranca un video NUEVO con estado limpio:
#   1) prepara las carpetas (preparar.sh)
#   2) guarda el src/Root.tsx del video anterior en Ediciones/<anterior>/src/ (si no está en blanco)
#   3) resetea src/Root.tsx a la plantilla y le pone el proyecto y la marca
#   4) crea Crudos/<nombre>/, Ediciones/<nombre>/ y Terminados/<nombre>/
set -euo pipefail
NAME="${1:?uso: new_project.sh <nombre> [marca]}"
MARCA="${2:-default}"
VR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$VR"
bash scripts/preparar.sh >/dev/null

ROOT="src/Root.tsx"; TPL="templates/Root.template.tsx"
if [ -f "$ROOT" ] && ! cmp -s "$ROOT" "$TPL"; then
  PREV="$(grep -oE '^const PROYECTO = "[^"]+"' "$ROOT" | sed -E 's/.*"(.*)"/\1/' || true)"
  [ -n "${PREV:-}" ] && [ "$PREV" != "<nombre>" ] || PREV="_sin-nombre-$(date +%Y%m%d-%H%M%S)"
  mkdir -p "Ediciones/$PREV/src"
  cp "$ROOT" "Ediciones/$PREV/src/Root.tsx"
  echo "guardado el Root del video anterior → Ediciones/$PREV/src/Root.tsx"
fi

if [ "$MARCA" != "default" ] && [ ! -f "marcas/$MARCA/marca.json" ]; then
  echo "ojo: no existe marcas/$MARCA/marca.json — se usa la marca por defecto hasta crearla"
fi
sed -e "s|^const MARCA = \"default\";|const MARCA = \"$MARCA\";|" \
    -e "s|^const PROYECTO = \"<nombre>\";|const PROYECTO = \"$NAME\";|" "$TPL" > "$ROOT"

mkdir -p "Crudos/$NAME" "Ediciones/$NAME" "Terminados/$NAME"
echo "listo: Crudos/$NAME · Ediciones/$NAME · Terminados/$NAME · marca: $MARCA"
echo "Mové el crudo a Crudos/$NAME/ y seguí el flujo (.claude/rules/base.md)."
