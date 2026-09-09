#!/usr/bin/env bash
# new_project.sh <slug> [perfil=morris-beker] [crudo=<path>]
# Arranca un video NUEVO con estado limpio:
#   1) Snapshot no destructivo del src/Reel.tsx + src/Root.tsx actuales (si no están ya
#      en blanco), para no perder el estado del video anterior si no se archivó.
#   2) Resetea src/Reel.tsx y src/Root.tsx a la plantilla en blanco (templates/).
#   3) Crea public/proyectos/<slug>/{Crudos,ediciones,final}/ + PIPELINE.md.
#   4) Si se pasa un crudo, lo MUEVE (no copia) a Crudos/ (archivo suelto o carpeta de reacción).
#   5) Anexa la fila del proyecto a REELS.md (estado: en edición).
# Así cada video empieza sin arrastrar zoom/sonidos/escenas/portada del anterior.
set -euo pipefail
NAME="${1:?uso: new_project.sh <slug> [perfil=morris-beker] [crudo=<path>]}"
PERFIL="${2:-morris-beker}"
CRUDO="${3:-}"
VR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Resolver el crudo a ruta absoluta ANTES de cambiar de directorio (puede venir relativo al PWD del usuario)
if [ -n "$CRUDO" ] && [ -e "$CRUDO" ]; then
  CRUDO="$(cd "$(dirname "$CRUDO")" && pwd)/$(basename "$CRUDO")"
fi

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

# 3) Estructura del proyecto nuevo
PROJ="public/proyectos/$NAME"
mkdir -p "$PROJ"/{Crudos,ediciones,final}
echo "creado $PROJ/{Crudos,ediciones,final}"

# 4) Mover el crudo (si se pasó) a Crudos/  — reacción = carpeta con 3 videos → mover su contenido
CRUDO_LINE="–"
if [ -n "$CRUDO" ]; then
  if [ -d "$CRUDO" ]; then
    mv "$CRUDO"/* "$PROJ/Crudos/" && echo "crudo (reacción) movido: contenido de $(basename "$CRUDO")/ → $PROJ/Crudos/"
    CRUDO_LINE="Crudos/ (reacción: contenido de $(basename "$CRUDO")/)"
  elif [ -f "$CRUDO" ]; then
    mv "$CRUDO" "$PROJ/Crudos/" && echo "crudo movido: $(basename "$CRUDO") → $PROJ/Crudos/"
    CRUDO_LINE="Crudos/$(basename "$CRUDO")"
  else
    echo "aviso: crudo '$CRUDO' no existe — no se movió nada"
  fi
fi

# 5) PIPELINE.md inicial (formato F3 del plan)
cat > "$PROJ/PIPELINE.md" <<EOF
proyecto: $NAME → pendiente   | tipo: pendiente   | perfil: $PERFIL
crudo: $CRUDO_LINE | clip: – | resumen: –
fase: 0 setup ✅ | A transcript – | 7 propuesta – | aprobación – | recortes – | B escenas – | Root/Reel – | C render – | caption – | archivo –
decisiones:
EOF
echo "creado $PROJ/PIPELINE.md"

# 6) Índice REELS.md (crear con cabecera si falta) + fila estado "en edición"
REELS="$VR/REELS.md"
if [ ! -f "$REELS" ]; then
  printf '# Reels — índice\n\n| fecha | perfil | tipo | slug | estado | final |\n|---|---|---|---|---|---|\n' > "$REELS"
fi
printf '| %s | %s | %s | %s | %s | %s |\n' "$(date +%F)" "$PERFIL" "pendiente" "$NAME" "en edición" "–" >> "$REELS"
echo "REELS.md ← fila '$NAME' (en edición)"

echo "listo. Perfil: $PERFIL. Mové/pasá el crudo por el workflow (.claude/skills/reel-yapping/SKILL.md)."
