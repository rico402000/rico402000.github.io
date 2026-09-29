# Fonts in this folder

Both families are self-hosted from this domain rather than loaded from a font
CDN, so no request leaves the site. That keeps the Content Security Policy
strict (`font-src 'self'`) and means no visitor IP is shared with a third party.

| File | Family | Weight | License |
| --- | --- | --- | --- |
| `archivo-600-latin.woff2`, `archivo-700-latin.woff2`, `archivo-800-latin.woff2` | Archivo | 600, 700, 800 | SIL Open Font License 1.1 |
| `inter-400-latin.woff2`, `inter-500-latin.woff2`, `inter-600-latin.woff2` | Inter | 400, 500, 600 | SIL Open Font License 1.1 |

The Open Font License permits embedding, self-hosting and redistribution,
including commercially, as long as the fonts are not sold on their own and any
derivative keeps the same license.

- Archivo — https://fonts.google.com/specimen/Archivo
- Inter — https://fonts.google.com/specimen/Inter
- SIL OFL 1.1 — https://scripts.sil.org/OFL

`fonts.css` in this folder is the generated `@font-face` source. The rules are
inlined at the top of `assets/css/styles.css` so the site loads one stylesheet,
not two — if you ever change a font, update the block there, not this file.

Only the Latin subset ships. A character outside it (a name with `é` or `ñ`, for
instance) falls back to the system font for that glyph rather than downloading
another file.
