#!/usr/bin/env bash
# new_project.sh <nombre>
# Arranca un video NUEVO con estado limpio:
#   1) Snapshot no destructivo del src/Reel.tsx + src/Root.tsx actuales (si no están ya
#      en blanco), para no perder el estado del video anterior si no se archivó.
#   2) Resetea src/Reel.tsx y src/Root.tsx a la plantilla en blanco (templates/).
#   3) Crea public/proyectos/<nombre>/{Crudos,Ediciones}/ (media de trabajo) y
#      Finales/<nombre>/ (donde se renderiza el entregable, fuera de public/).
# Así cada video empieza sin arrastrar zoom/sonidos/escenas/portada del anterior.
set -euo pipefail
NAME="${1:?uso: new_project.sh <nombre>}"
VR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$VR"

REEL="src/Reel.tsx"
ROOT="src/Root.tsx"
TPL_REEL="templates/Reel.template.tsx"
TPL_ROOT="templates/Root.template.tsx"
[ -f "$TPL_REEL" ] && [ -f "$TPL_ROOT" ] || { echo "faltan las plantillas en templates/"; exit 1; }

# 1) Snapshot si el src actual NO es ya la plantilla en blanco
if [ -f "$REEL" ] && ! grep -q "PLANTILLA EN BLANCO" "$REEL"; then
  # Nombre del proyecto anterior según la línea de videoSrc en Root.tsx; si no, timestamp
  PREV="$(grep 'videoSrc' "$ROOT" 2>/dev/null | grep -oE 'proyectos/[^/"]+' | head -1 | sed 's#proyectos/##')"
  [ -n "${PREV:-}" ] || PREV="sin-archivar-$(date +%Y%m%d-%H%M%S)"
  SNAP="_archivo/$PREV/src"
  mkdir -p "$SNAP"
  cp "$REEL" "$ROOT" "$SNAP/" 2>/dev/null || true
  echo "snapshot del src anterior → $SNAP/  (proyecto: $PREV)"
fi

# 2) Reset a la plantilla en blanco
cp "$TPL_REEL" "$REEL"
cp "$TPL_ROOT" "$ROOT"
echo "src/Reel.tsx y src/Root.tsx reseteados a la plantilla en blanco"

# 3) Estructura del proyecto nuevo: media de trabajo en public/, entregable en Finales/
mkdir -p "public/proyectos/$NAME"/{Crudos,Ediciones}
mkdir -p "Finales/$NAME"
echo "creado public/proyectos/$NAME/{Crudos,Ediciones} + Finales/$NAME/"
echo "listo. Mové el crudo a public/proyectos/$NAME/Crudos/ y seguí el workflow (base.md)."
echo "El render final va a Finales/$NAME/$NAME.mp4"
