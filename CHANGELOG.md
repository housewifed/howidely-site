# Changelog — howidely.com

Every change to the published site, newest first. Each version is a git tag
and a GitHub release; pushing `main` deploys to GitHub Pages.

## v1.1.0 — 5 October 2026

### Added
- **RTAK Fleet page** at [howidely.com/fleet/](https://howidely.com/fleet/),
  for transport companies. RTAK Fleet and its in-vehicle unit, A-BOX Mobile,
  are presented as **coming soon** with a waitlist. Sections:
  - the problem, with four sourced cargo-theft figures;
  - how it works: trigger, automatic actions, operator decides, escalation to
    a backup operator;
  - seven scenarios, from off-route to unapproved night parking;
  - a concept simulation: a truck leaves its route on a real map, the cameras
    start, the driver is messaged, and the operator console offers police,
    driver, roadside assistance or dismiss, with a 20-second escalation
    countdown. It is labeled a concept and never dials or sends anything;
  - A-BOX Mobile, with its specifications labeled as design targets;
  - a comparison with typical cloud fleet platforms that names no vendor;
  - what already ships in RTAK Server;
  - a waitlist form that composes an email to info@howidely.com.
- **Situational video** toggle in the home page's live interface preview. A
  live callout opens over each unit, they are kept apart when close, and
  clicking one focuses it, as in RTAK 1.11.
- **Fleet** link in the navigation and the footer, and an RTAK Fleet teaser
  card in the roadmap section.

### Changed
- The flagship section is marked **Shipping · v1.11**. Its six capability
  cards are rewritten to match RTAK Server 1.11.2:
  - Situational Awareness Dashboard
  - Interactive Geospatial Mapping
  - Live Video on the Map
  - Camera Wall & Recordings
  - Track Recording & Playback
  - Secure by Default
- The roadmap no longer describes the camera wall as unshipped. What remains
  on the roadmap is the device inspector, live telemetry and the guided
  enrollment flow.
- The build produces two self-contained pages, `dist/index.html` and
  `dist/fleet/index.html`, from one Tailwind compile. It fails if the two
  pages' navigation bars differ.
- `npm run serve` serves `dist/` the way GitHub Pages does, so `/fleet/` works
  locally.

### Accessibility
- Decorative card numbers are hidden from assistive technology.
- Every new form field carries `aria-describedby` and a `role="alert"` error.

## v1.0.1 — 25 September 2026

### Fixed
- **Both maps were broken.** CARTO began requiring an API key and answered
  every tile request with HTTP 200 and a watermark image. That is not an HTTP
  error, so the fallback never showed. The maps now use Esri's keyless tiles:
  Dark Gray Canvas for the basemap and World Imagery for the camera feeds.
- `npm run check:tiles` fetches tiles from far-apart places and fails if any
  two are byte-identical, which is what a placeholder looks like. It runs in CI
  before every build.

### Corrected
- The flagship section claimed "Google Maps integration", which was never
  true. It now says: street and satellite basemaps with no mapping
  subscription, and Google imagery optional where the customer supplies a key.

## v1.0.0 — 22 August 2026

### Added
- First release of the site: a single self-contained page with no CDN and no
  external scripts. Sections:
  - hero
  - About
  - History
  - A-BOX
  - TAK Server Revamp, with an interactive interface preview
  - Coming Soon: the Situational Awareness Room simulation
  - Projects
  - Leadership
  - Contact
- Both simulations use real map tiles over a randomly chosen US metro.
- GitHub Pages deployment from `main`, served at the custom domain
  howidely.com.
