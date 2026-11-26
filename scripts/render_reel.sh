#!/usr/bin/env bash
# render_reel.sh <nombre> [composición=Reel]
# Renderiza Terminados/<nombre>/<nombre>.mp4 con un public/ REDUCIDO: sfx/ + solo
# ediciones/<nombre>. Si Remotion copiara el public/ entero (con todas las Ediciones) en cada
# bundle, con poca RAM el render muere. TMPDIR en disco (/tmp puede ser RAM) + bt709.
set -euo pipefail
NAME="${1:?uso: render_reel.sh <nombre> [Reel|Reaccion]}"
COMP="${2:-Reel}"
VR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$VR"
[ -d "Ediciones/$NAME" ] || { echo "no existe Ediciones/$NAME"; exit 1; }

PUB="$HOME/.cache/remotion-public/$NAME"
rm -rf "$PUB"
mkdir -p "$PUB/ediciones"
for e in public/*; do
  [ "$(basename "$e")" = ediciones ] || ln -s "$VR/$e" "$PUB/"
done
ln -s "$VR/Ediciones/$NAME" "$PUB/ediciones/$NAME"

mkdir -p "Terminados/$NAME" "$HOME/.cache/remotion-tmp"
TMPDIR="$HOME/.cache/remotion-tmp" npx remotion render "$COMP" "Terminados/$NAME/$NAME.mp4" \
  --concurrency="${CONCURRENCY:-2}" --color-space=bt709 --public-dir="$PUB"
rm -rf "$PUB"
echo "listo: Terminados/$NAME/$NAME.mp4"
