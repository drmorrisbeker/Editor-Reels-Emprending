#!/usr/bin/env bash
# speed_version.sh <nombre> [factor=1.1]
# Versión paralela acelerada de un reel ya renderizado: Terminados/<nombre>/<nombre>.mp4 →
# Terminados/<nombre>/<nombre>_1.1x.mp4 (imagen + audio + subtítulos quemados, todo junto; el tono
# de voz se conserva con atempo). La versión normal no se toca. Pedido real (18/11): "Probá aumentar
# los videos a 1.1x… hacé versiones paralelas a esa velocidad".
set -euo pipefail
NAME="${1:?uso: speed_version.sh <nombre> [factor]}"
F="${2:-1.1}"
VR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IN="$VR/Terminados/$NAME/$NAME.mp4"
OUT="$VR/Terminados/$NAME/${NAME}_${F}x.mp4"
[ -f "$IN" ] || { echo "no existe $IN"; exit 1; }
ffmpeg -v error -y -i "$IN" \
  -filter_complex "[0:v]setpts=PTS/${F},fps=30[v];[0:a]atempo=${F}[a]" \
  -map "[v]" -map "[a]" -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -c:a aac -b:a 192k -movflags +faststart "$OUT"
echo "OK → $OUT ($(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT") s)"
