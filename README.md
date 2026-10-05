# Howidely — marketing site

Two self-contained HTML pages. No CDN, no runtime CSS compiler, no external
scripts. Each ships as one file:

| Page | Source | Output |
|---|---|---|
| howidely.com | `src/index.html` + `src/app.js` | `dist/index.html` |
| howidely.com/fleet/ | `src/fleet.html` + `src/fleet.js` | `dist/fleet/index.html` |

## Quick start

```bash
npm install
npm run build     # -> dist/index.html
npm run serve     # http://localhost:4173 and /fleet/
```

`npm run watch` rebuilds on change.

## What's on the home page

| Section | Notes |
|---|---|
| Hero | positioning, headline stats |
| 01 About | six capability cards |
| 02 History | founding timeline, Apr 2020 onward |
| 03 A-BOX | legacy platform, specs from the one-pager in `docs/` |
| 04 TAK Revamp | flagship, "Shipping · v1.11"; six capability cards matching RTAK Server 1.11.2; live interface preview with a Situational video toggle |
| 05 Coming Soon | Situational Awareness Room simulation (inspector, telemetry, enrollment flow) + RTAK Fleet teaser |
| 06 Projects | representative engagements |
| 07 Leadership | founder bio |
| 08 Contact | composes an email to info@howidely.com |

## The fleet page

RTAK Fleet and A-BOX Mobile are **coming soon**. The page covers the problem
(sourced cargo-theft figures), how it works, seven scenarios, a concept
simulation of a truck leaving its route, the A-BOX Mobile design targets, a
comparison with typical cloud fleet platforms (no vendor named), what RTAK
Server already ships, and a waitlist that composes an email.

Ground rules for its copy: emergency calls are always operator-confirmed;
RTAK is never presented as an ELD; every figure is sourced.

## Simulations

All three simulations are interactive: real map tiles centred on a randomly chosen
large US metro, pins placed by true lat/lon, and device video feeds showing
satellite imagery of each node's actual coordinates.

## Editing

Edit `src/`, never `dist/`. The two pages carry their own copy of the header;
the build fails if their navigation links differ. See `CLAUDE.md` for the constraints that matter —
several of them are non-obvious and were found the hard way.

## Third-party services

- **Fonts** — Google Fonts (Inter, JetBrains Mono)
- **Map tiles** — Esri Dark Gray Canvas (keyless), OpenStreetMap data
- **Satellite imagery** — Esri World Imagery

All keyless. Attribution is rendered in the map footers; keep it there.

## Changes

See [CHANGELOG.md](CHANGELOG.md).
