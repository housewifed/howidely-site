# Howidely — marketing site

Single self-contained HTML page. No CDN, no runtime CSS compiler, no external
scripts. Ships as one file: `dist/index.html`.

## Quick start

```bash
npm install
npm run build     # -> dist/index.html
npm run serve     # http://localhost:4173
```

`npm run watch` rebuilds on change.

## What's on the page

| Section | Notes |
|---|---|
| Hero | positioning, headline stats |
| 01 About | six capability cards |
| 02 History | founding timeline, Apr 2020 onward |
| 03 A-BOX | legacy platform, specs from the one-pager in `docs/` |
| 04 TAK Revamp | flagship; core features + live interface preview mirroring the real server |
| 05 Coming Soon | Situational Awareness Room — interactive command-centre simulation |
| 06 Projects | representative engagements |
| 07 Leadership | founder bio |
| 08 Contact | composes an email to info@howidely.com |

Both simulations are interactive: real map tiles centred on a randomly chosen
large US metro, pins placed by true lat/lon, and device video feeds showing
satellite imagery of each node's actual coordinates.

## Editing

Edit `src/`, never `dist/`. See `CLAUDE.md` for the constraints that matter —
several of them are non-obvious and were found the hard way.

## Third-party services

- **Fonts** — Google Fonts (Inter, JetBrains Mono)
- **Map tiles** — Esri Dark Gray Canvas (keyless), OpenStreetMap data
- **Satellite imagery** — Esri World Imagery

All keyless. Attribution is rendered in the map footers; keep it there.
