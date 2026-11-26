#!/usr/bin/env bash
# render_reel.sh <nombre> [composición]
# Renderiza Finales/<nombre>/<nombre>.mp4 con un public/ REDUCIDO (symlinks a logos/, sfx/ y solo
# public/proyectos/<nombre>), en vez de que Remotion copie el public/ entero (15 GB el 18/11 por
# proyectos sin archivar) en cada bundle. Con RAM justa, el bundle con public/ gigante moría
# (SIGKILL al "Bundling 59%"). TMPDIR en disco + bt709 (ver memoria reference_remotion_tmpdir).
set -euo pipefail
NAME="${1:?uso: render_reel.sh <nombre> [composición]}"
COMP="${2:-Plantilla-DrBeker-Reels}"
VR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$VR"
[ -d "public/proyectos/$NAME" ] || { echo "no existe public/proyectos/$NAME"; exit 1; }

PUB="$HOME/.cache/remotion-public/$NAME"
rm -rf "$PUB"
mkdir -p "$PUB/proyectos"
for e in public/*; do
  [ "$(basename "$e")" = proyectos ] || ln -s "$VR/$e" "$PUB/"
done
ln -s "$VR/public/proyectos/$NAME" "$PUB/proyectos/$NAME"

mkdir -p "Finales/$NAME" "$HOME/.cache/remotion-tmp"
free -h | sed -n 2p
TMPDIR="$HOME/.cache/remotion-tmp" npx remotion render "$COMP" "Finales/$NAME/$NAME.mp4" \
  --concurrency=2 --color-space=bt709 --public-dir="$PUB"
rm -rf "$PUB"
