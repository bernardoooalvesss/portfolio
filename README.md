# Portfolio — Bernardo · 3D Technical Director

Site estático (HTML/CSS/JS, sem dependências) para portfolio de 3D/VFX.
Pensado para **GitHub Pages**: zero custo, zero build.

## Estrutura

```
.
├── index.html        # o site inteiro (HTML + CSS + JS embebidos)
├── .nojekyll         # desliga o Jekyll (serve os ficheiros tal e qual)
├── .gitignore        # ignora junk de OS e ficheiros-fonte pesados
└── assets/           # a tua media (posters .jpg + loops .mp4/.webm)
    └── README.txt    # guia de compressão + nomes de ficheiro
```

## Pôr online (repo: berna/portfolio)

O repo já existe. Copia estes ficheiros para a tua pasta `portfolio` e:

```bash
cd portfolio
git add -A
git commit -m "Add portfolio site"
git push
```

Depois: **Settings → Pages → Source: Deploy from branch → `main` / `/ (root)`**.
Online em `https://berna.github.io/portfolio/` (1-2 min).

## Adicionar projetos

Cada projeto é um `<article class="tile">` no `index.html`. Duplica o bloco e
edita os atributos `data-*`:

| Atributo        | O que é                                  |
|-----------------|------------------------------------------|
| `data-title`    | Nome do projeto                          |
| `data-year`     | Ano                                      |
| `data-soft`     | Software / pipeline                      |
| `data-role`     | O teu papel (Sim / Lighting / Look-dev)  |
| `data-tag`      | Etiqueta de categoria                    |
| `data-poster`   | `assets/nome.jpg` (still)                |
| `data-src-mp4`  | `assets/nome.mp4` (loop H.264)           |
| `data-src-webm` | `assets/nome.webm` (loop AV1/VP9, opc.)  |

## Limites GitHub Pages

100 MB por ficheiro · 1 GB site total · 100 GB/mês de banda.
Comprime os loops para 3–8 MB (ver `assets/README.txt`).
