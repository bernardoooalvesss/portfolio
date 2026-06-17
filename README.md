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

## Pôr online

1. Cria um repo **público** chamado `<o-teu-user>.github.io`.
2. `git push` deste conteúdo para `main`.
3. **Settings → Pages → Source: Deploy from branch → `main` / `/ (root)`**.
4. Online em `https://<o-teu-user>.github.io` (1-2 min).

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
