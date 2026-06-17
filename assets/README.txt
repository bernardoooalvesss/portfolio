META AQUI A TUA MEDIA
=====================
Por projeto precisas de:
  - poster:  flare.jpg   (still de alta qualidade, first frame)
  - loop:    flare.mp4   (H.264 comprimido, mudo, faststart)
  - loop:    flare.webm  (AV1/VP9, opcional, mais leve)
E o showreel do hero: reel.mp4 (+ reel.webm opcional)

Compressão (ffmpeg):
  ffmpeg -i in.mov -vf "scale=-2:1080" -c:v libx264 -crf 24 -preset slow \
    -an -movflags +faststart -pix_fmt yuv420p flare.mp4
  ffmpeg -i in.mov -vf "scale=-2:1080" -c:v libsvtav1 -crf 32 -preset 6 \
    -an flare.webm

LIMITES GITHUB PAGES: 100 MB/ficheiro · 1 GB site total · 100 GB/mês banda.
Mira 3-8 MB por loop.
