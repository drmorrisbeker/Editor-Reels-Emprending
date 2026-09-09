#!/usr/bin/env bash
# archive_project.sh <slug> <perfil> [fecha=YYYY-MM-DD, default hoy]
# Paso de CIERRE de un reel (correr SOLO con confirmación del usuario, video ya terminado).
# Divide el proyecto en dos para sacarlo del bundle de Remotion sin perder nada:
#   1) Entregable → Finales/<perfil>/<año>/<fecha>-<slug>/
#        <slug>.mp4 (final/*.mp4 renombrado si hay uno solo) · caption.txt · portada.png · decisiones.md
#   2) Material pesado → _archivo/<perfil>/<fecha>-<slug>/{Crudos,ediciones,src/}
# Luego resetea src/ a la plantilla en blanco, barre los sueltos a _archivo/ y elimina
# public/proyectos/<slug>/. Finalmente anexa/actualiza la fila del reel en REELS.md.
# Ambos destinos viven FUERA de public/, así Remotion deja de copiarlos en cada bundle.
# Nada se borra (salvo la carpeta del proyecto, ya vacía): todo queda recuperable.
set -euo pipefail
NAME="${1:?uso: archive_project.sh <slug> <perfil> [fecha=YYYY-MM-DD]}"
PERFIL="${2:?uso: archive_project.sh <slug> <perfil> [fecha=YYYY-MM-DD]}"
FECHA="${3:-$(date +%F)}"
ANIO="${FECHA%%-*}"

VR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$VR/public/proyectos/$NAME"
[ -d "$SRC" ] || { echo "no existe public/proyectos/$NAME"; exit 1; }

FIN="$VR/Finales/$PERFIL/$ANIO/$FECHA-$NAME"
ARCH="$VR/_archivo/$PERFIL/$FECHA-$NAME"
mkdir -p "$FIN" "$ARCH"

# ── 1) ENTREGABLE → Finales/ ────────────────────────────────────────────────
# Localizar los mp4 del final antes de moverlos (los necesito para portada + renombrado)
mapfile -t MP4S < <(find "$SRC/final" -maxdepth 1 -name '*.mp4' 2>/dev/null | sort)

# portada.png a partir del primer mp4 (si hay)
if [ "${#MP4S[@]}" -ge 1 ]; then
  ffmpeg -y -i "${MP4S[0]}" -frames:v 1 "$FIN/portada.png" >/dev/null 2>&1 \
    && echo "portada: $FIN/portada.png" \
    || echo "aviso: no se pudo generar portada.png (ffmpeg falló)"
else
  echo "aviso: no hay mp4 en $SRC/final — se omite portada.png"
fi

# mp4(s): uno solo → renombrar a <slug>.mp4; varios → conservar nombres
FINAL_REL="–"
if [ "${#MP4S[@]}" -eq 1 ]; then
  mv "${MP4S[0]}" "$FIN/$NAME.mp4" && echo "entregable: $(basename "${MP4S[0]}") → Finales/$PERFIL/$ANIO/$FECHA-$NAME/$NAME.mp4"
  FINAL_REL="Finales/$PERFIL/$ANIO/$FECHA-$NAME/$NAME.mp4"
elif [ "${#MP4S[@]}" -gt 1 ]; then
  for m in "${MP4S[@]}"; do
    mv "$m" "$FIN/" && echo "entregable: $(basename "$m") → Finales/$PERFIL/$ANIO/$FECHA-$NAME/"
  done
  FINAL_REL="Finales/$PERFIL/$ANIO/$FECHA-$NAME/"
fi

# caption.txt
[ -f "$SRC/caption.txt" ] && mv "$SRC/caption.txt" "$FIN/" && echo "entregable: caption.txt → Finales/$PERFIL/$ANIO/$FECHA-$NAME/"

# decisiones.md = propuesta.md + PIPELINE.md (si existen)
# La propuesta vive en ediciones/ (la escribe reel-yapping); se acepta también en la raíz por compatibilidad.
PROP="$SRC/ediciones/propuesta.md"; [ -f "$PROP" ] || PROP="$SRC/propuesta.md"
if [ -f "$PROP" ] || [ -f "$SRC/PIPELINE.md" ]; then
  {
    if [ -f "$PROP" ]; then echo "# Propuesta"; echo; cat "$PROP"; echo; fi
    if [ -f "$SRC/PIPELINE.md" ]; then echo "# Pipeline"; echo; cat "$SRC/PIPELINE.md"; echo; fi
  } > "$FIN/decisiones.md"
  echo "entregable: decisiones.md → Finales/$PERFIL/$ANIO/$FECHA-$NAME/"
fi

# ── 2) MATERIAL PESADO → _archivo/ ──────────────────────────────────────────
for d in Crudos ediciones; do
  [ -e "$SRC/$d" ] && mv "$SRC/$d" "$ARCH/" && echo "archivado: $d → _archivo/$PERFIL/$FECHA-$NAME/"
done

# snapshot del código de este video (reproducibilidad)
mkdir -p "$ARCH/src"
for f in Reel.tsx Root.tsx; do
  [ -e "$VR/src/$f" ] && cp "$VR/src/$f" "$ARCH/src/" && echo "snapshot: src/$f → _archivo/$PERFIL/$FECHA-$NAME/src/"
done

# reset de src/ a la plantilla en blanco (estado limpio para el próximo video)
if [ -f "$VR/templates/Reel.template.tsx" ] && [ -f "$VR/templates/Root.template.tsx" ]; then
  cp "$VR/templates/Reel.template.tsx" "$VR/src/Reel.tsx"
  cp "$VR/templates/Root.template.tsx" "$VR/src/Root.tsx"
  echo "src/Reel.tsx y src/Root.tsx reseteados a la plantilla en blanco"
fi

# ── 3) Barrer sueltos → _archivo/ y borrar la carpeta del proyecto ──────────
if [ -n "$(ls -A "$SRC" 2>/dev/null)" ]; then
  mv "$SRC"/* "$ARCH/" 2>/dev/null || true
  echo "resto de archivos sueltos → _archivo/$PERFIL/$FECHA-$NAME/"
fi
rmdir "$SRC" 2>/dev/null && echo "carpeta public/proyectos/$NAME/ eliminada (vacía)" || true

# ── 4) Índice REELS.md: reemplazar la fila del slug (o anexar) con estado archivado ──
REELS="$VR/REELS.md"
if [ ! -f "$REELS" ]; then
  printf '# Reels — índice\n\n| fecha | perfil | tipo | slug | estado | final |\n|---|---|---|---|---|---|\n' > "$REELS"
fi
# Preservar el tipo de la fila previa si existía; default yapping
TIPO="yapping"
if grep -qF "| $NAME |" "$REELS"; then
  EXIST_TIPO="$(grep -F "| $NAME |" "$REELS" | head -1 | awk -F'|' '{gsub(/^ +| +$/,"",$4); print $4}')"
  case "$EXIST_TIPO" in
    ""|"pendiente"|"–") TIPO="yapping" ;;
    *) TIPO="$EXIST_TIPO" ;;
  esac
fi
ROW="| $FECHA | $PERFIL | $TIPO | $NAME | archivado | $FINAL_REL |"
if grep -qF "| $NAME |" "$REELS"; then
  ROW_ESC="$(printf '%s' "$ROW" | sed 's/[&#\\]/\\&/g')"
  sed -i "s#^.*| $NAME |.*\$#$ROW_ESC#" "$REELS"
  echo "REELS.md ← fila '$NAME' actualizada (archivado)"
else
  printf '%s\n' "$ROW" >> "$REELS"
  echo "REELS.md ← fila '$NAME' (archivado)"
fi

echo "listo. Entregable en Finales/$PERFIL/$ANIO/$FECHA-$NAME/ · pesado en _archivo/$PERFIL/$FECHA-$NAME/"
