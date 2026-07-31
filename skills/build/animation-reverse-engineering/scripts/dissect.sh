#!/usr/bin/env bash
# dissect.sh — automate acquire + probe + overview for animation reverse-engineering.
#
#   ./dissect.sh <url-or-file> [outdir]              # download/copy, probe, contact sheet
#   ./dissect.sh --band W:H:X:Y --window S-E [-k K] <url-or-file> [outdir]
#                                                    # + crop-band stack of frames S..E every K frames
set -euo pipefail

BAND="" WINDOW="" K=""
ARGS=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --band)   BAND="$2"; shift 2 ;;
    --window) WINDOW="$2"; shift 2 ;;
    -k)       K="$2"; shift 2 ;;
    *)        ARGS+=("$1"); shift ;;
  esac
done
SRC="${ARGS[0]:?usage: dissect.sh [--band W:H:X:Y --window START-END [-k K]] <url-or-file> [outdir]}"
OUT="${ARGS[1]:-dissect-out}"
mkdir -p "$OUT"

for bin in ffmpeg ffprobe; do
  command -v "$bin" >/dev/null || { echo "missing: $bin (brew install ffmpeg)"; exit 1; }
done

REF="$OUT/ref.mp4"
if [[ -f "$SRC" ]]; then
  cp "$SRC" "$REF"
elif [[ "$SRC" != http* ]]; then
  echo "not found: $SRC (local path does not exist)"; exit 1
elif [[ "$SRC" =~ \.(mp4|webm|mov|gif)(\?|$) ]]; then
  curl -fsSL -o "$REF" "$SRC"
else
  command -v yt-dlp >/dev/null || { echo "missing: yt-dlp (brew install yt-dlp)"; exit 1; }
  yt-dlp -q -o "$REF" "$SRC"
fi

echo "== probe =="
ffprobe -v error -select_streams v:0 \
  -show_entries stream=width,height,r_frame_rate,duration,nb_frames \
  -of default=nw=1 "$REF" | tee "$OUT/probe.txt"

DUR=$(ffprobe -v error -select_streams v:0 -show_entries stream=duration -of csv=p=0 "$REF")
# contact sheet sized to fit ~35 tiles regardless of duration
FPS=$(python3 -c "print(round(min(4, max(0.5, 35/${DUR%.*})), 2))" 2>/dev/null || echo 2)
ffmpeg -y -v error -i "$REF" -vf "fps=${FPS},scale=270:270,tile=7x5" "$OUT/overview.png"
echo "overview: $OUT/overview.png (fps=$FPS → tile i ≈ t*${FPS}s)"

if [[ -n "$BAND" && -n "$WINDOW" ]]; then
  S="${WINDOW%-*}"; E="${WINDOW#*-}"
  KK="${K:-$(( (E - S) / 15 + 1 ))}"
  ROWS=$(( (E - S) / KK + 1 )); (( ROWS > 17 )) && ROWS=17
  ffmpeg -y -v error -i "$REF" \
    -vf "crop=${BAND},select='between(n\,${S}\,${E})*not(mod(n\,${KK}))',tile=1x${ROWS}" \
    -frames:v 1 -vsync 0 "$OUT/stack_${S}-${E}.png"
  echo "stack: $OUT/stack_${S}-${E}.png (every ${KK} frames, ${ROWS} rows)"
fi

echo "done. Next: read overview.png, derive crop bands from its scale, re-run with --band/--window."
