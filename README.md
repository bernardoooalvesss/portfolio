# Portfolio — Bernardo Alves · 3D & VFX Artist

Static site (HTML/CSS/JS, no dependencies) for a 3D/VFX portfolio.
Built for **GitHub Pages**: zero cost, zero build.

## Structure

```
.
├── index.html        # the whole site (HTML + CSS + JS inline)
├── 404.html          # custom not-found page
├── .nojekyll         # disables Jekyll (serves files as-is)
├── .gitignore        # ignores OS junk + heavy source files
└── assets/
    ├── README.txt    # compression guide + file naming
    └── media/        # the media (videos .mp4 + stills .jpg)
```

## Publish

```bash
cd portfolio
git add -A
git commit -m "Update portfolio site"
git push
```

Then: **Settings → Pages → Source: Deploy from branch → `main` / `/ (root)`**.
Live at `https://bernatdoalvesss-cpuuboryx.github.io/portfolio/` (1–2 min).

## Adding projects

Each project is an `<article class="tile">` in `index.html`. Duplicate the block
and edit the `data-*` attributes:

| Attribute       | What it is                               |
|-----------------|------------------------------------------|
| `data-title`    | Project name                             |
| `data-year`     | Year                                     |
| `data-soft`     | Software / pipeline                      |
| `data-role`     | Your role (Sim / Lighting / Look-dev)    |
| `data-tag`      | Category label                           |
| `data-poster`   | `assets/media/name.jpg` (still)          |
| `data-src-mp4`  | `assets/media/name.mp4` (H.264 loop)     |
| `data-src-webm` | `assets/media/name.webm` (AV1/VP9, opt.) |

Image-only tiles use `data-img` instead of the video sources.

## GitHub Pages limits

100 MB per file · 1 GB total · 100 GB/month bandwidth.
Compress loops to 3–8 MB (see `assets/README.txt`).
