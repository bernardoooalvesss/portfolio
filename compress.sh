#!/usr/bin/env bash
# ============================================================
# compress.sh — prepara renders para o portfolio web
# ------------------------------------------------------------
# Para cada vídeo numa pasta, gera:
#   nome.mp4   loop H.264 1080p, mudo, faststart  (fallback universal)
#   nome.webm  loop AV1 1080p, mudo               (mais leve, opcional)
#   nome.jpg   poster (primeiro frame, qualidade alta)
#
# Uso:
#   ./compress.sh /caminho/para/renders [pasta_saida]
#   (saída default: ./assets)
#
# Requisitos: ffmpeg com libx264 e libsvtav1.
#   macOS:  brew install ffmpeg
#   Win:    winget install ffmpeg   (ou choco install ffmpeg-full)
# ============================================================
set -euo pipefail

SRC="${1:?Indica a pasta de origem: ./compress.sh /pasta/renders}"
OUT="${2:-./assets}"
HEIGHT=1080          # resolução web (usa 720 se quiseres ficheiros ainda menores)
CRF_H264=24          # 18-28: menor = mais qualidade/peso
CRF_AV1=32           # 28-36 para AV1

mkdir -p "$OUT"
shopt -s nullglob nocaseglob

found=0
for f in "$SRC"/*.{mov,mp4,mkv,avi,m4v}; do
  found=1
  name="$(basename "${f%.*}")"
  echo "→ $name"

  # H.264 (compatível com tudo)
  ffmpeg -y -loglevel error -i "$f" \
    -vf "scale=-2:${HEIGHT}" -c:v libx264 -crf "$CRF_H264" -preset slow \
    -an -movflags +faststart -pix_fmt yuv420p \
    "$OUT/$name.mp4"

  # AV1/WebM (mais leve)
  if ffmpeg -hide_banner -encoders 2>/dev/null | grep -q libsvtav1; then
    ffmpeg -y -loglevel error -i "$f" \
      -vf "scale=-2:${HEIGHT}" -c:v libsvtav1 -crf "$CRF_AV1" -preset 6 \
      -an "$OUT/$name.webm"
  else
    echo "   (libsvtav1 indisponível — salto o .webm)"
  fi

  # Poster (primeiro frame)
  ffmpeg -y -loglevel error -i "$f" -vframes 1 -q:v 2 "$OUT/$name.jpg"

  size=$(du -h "$OUT/$name.mp4" | cut -f1)
  echo "   ok — mp4 $size"
done

[ "$found" -eq 0 ] && { echo "Nenhum vídeo encontrado em $SRC"; exit 1; }
echo "Feito. Confere que nenhum .mp4 passa os 100 MB (limite GitHub)."
