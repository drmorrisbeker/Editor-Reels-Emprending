#!/usr/bin/env bash
# archive_project.sh <nombre-proyecto>
# Paso de CIERRE de un reel (correr SOLO con confirmación del usuario, video ya terminado).
# Saca el material de trabajo del bundle de Remotion sin perder nada:
#   1) Crudos/ + Ediciones/  (material de trabajo pesado) → _archivo/<nombre>/
#   2) caption.txt           → Finales/<nombre>/   (junto al render, que YA se generó ahí)
#   0) ganchos.txt           → Finales/<nombre>/   (si falta; red de seguridad del paso 12 de reel-yapping)
# El render final vive en Finales/<nombre>/ desde el paso de render (no en public/).
# Luego elimina la carpeta public/proyectos/<nombre>/ si quedó vacía.
# Ambos destinos viven FUERA de public/, así Remotion deja de copiarlos en cada bundle.
# Nada se borra (salvo la carpeta del proyecto si quedó vacía): todo queda recuperable.
set -euo pipefail
NAME="${1:?uso: archive_project.sh <nombre-proyecto>}"
VR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$VR/public/proyectos/$NAME"
[ -d "$SRC" ] || { echo "no existe public/proyectos/$NAME"; exit 1; }

ARCH="$VR/_archivo/$NAME"
FIN="$VR/Finales/$NAME"
mkdir -p "$ARCH" "$FIN"

# 0) ganchos.txt (portada, gancho título, primeros 3 s) — antes de mover Ediciones y resetear src
if [ ! -f "$FIN/ganchos.txt" ]; then
  python3 "$VR/scripts/ganchos_txt.py" "$NAME" --out "$FIN" || echo "ojo: a ganchos.txt le falta algún dato (ver arriba)"
fi

# 1) material de trabajo → _archivo/
for d in Crudos Ediciones; do
  [ -e "$SRC/$d" ] && mv "$SRC/$d" "$ARCH/" && echo "archivado: $d → _archivo/$NAME/"
done

# 1b) snapshot del código de este video (reproducibilidad) + reset a la plantilla en blanco
mkdir -p "$ARCH/src"
for f in Reel.tsx Root.tsx; do
  [ -e "$VR/src/$f" ] && cp "$VR/src/$f" "$ARCH/src/" && echo "snapshot: src/$f → _archivo/$NAME/src/"
done
if [ -f "$VR/templates/Reel.template.tsx" ] && [ -f "$VR/templates/Root.template.tsx" ]; then
  cp "$VR/templates/Reel.template.tsx" "$VR/src/Reel.tsx"
  cp "$VR/templates/Root.template.tsx" "$VR/src/Root.tsx"
  echo "src/Reel.tsx y src/Root.tsx reseteados a la plantilla en blanco (estado limpio para el próximo video)"
fi

# 2) caption → Finales/ (el render ya está ahí; solo falta juntar el caption)
for f in "$SRC"/caption.txt "$SRC"/*.txt; do
  [ -e "$f" ] && mv "$f" "$FIN/" && echo "entregable: $(basename "$f") → Finales/$NAME/"
done

# 3) lo que quede (assets sueltos) también va a _archivo, y se borra la carpeta si quedó vacía
if [ -n "$(ls -A "$SRC" 2>/dev/null)" ]; then
  mv "$SRC"/* "$ARCH/" 2>/dev/null || true
  echo "resto de archivos sueltos → _archivo/$NAME/"
fi
rmdir "$SRC" 2>/dev/null && echo "carpeta public/proyectos/$NAME/ eliminada (vacía)" || true

echo "listo. Crudos/Ediciones en _archivo/$NAME · entregable (mp4 + caption + ganchos) en Finales/$NAME"
