/* Are the map tile providers still serving real maps?
 *
 * CARTO's basemaps went key-only and started answering every request with
 * HTTP 200 and a 2,513-byte "API KEY REQUIRED" watermark. A watermark is not
 * an error: the <img> loaded, onerror never fired, the styled fallback never
 * showed, and both maps on the site quietly read as broken until somebody
 * looked at them. Status codes cannot catch that. Identical bytes can.
 *
 * The check: fetch several tiles that are far apart, and insist they differ.
 * Any placeholder - a watermark, a "no data" picture, a blank square - is the
 * same bytes everywhere, so this catches the whole family, not just CARTO.
 *
 *   node scripts/check-tiles.mjs
 */

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const SOURCE = "src/app.js";
const MIN_BYTES = 500;          // a real map tile is never this small
const ATTEMPTS = 3;             // a provider hiccup is not a regression

// Tiles far enough apart that no two should ever be the same picture: a dense
// city, a different continent, and open country.
const SAMPLES = [
  { z: 13, x: 2199, y: 3057, where: "Detroit" },
  { z: 13, x: 4305, y: 2740, where: "Berlin" },
  { z: 13, x: 1479, y: 3306, where: "rural Nevada" },
];

/** The tile templates the site actually uses, read from its source so this
 *  check cannot drift away from what ships. */
function templates() {
  const src = readFileSync(new URL(`../${SOURCE}`, import.meta.url), "utf8");
  const found = {};
  for (const m of src.matchAll(/var (TILE_[A-Z]+)\s*=\s*'([^']+)'/g)) {
    found[m[1]] = m[2];
  }
  if (!Object.keys(found).length) {
    throw new Error(`no TILE_* templates found in ${SOURCE}`);
  }
  return found;
}

const url = (tpl, { z, x, y }) =>
  tpl.replace("{z}", z).replace("{x}", x).replace("{y}", y);

async function fetchTile(u) {
  let last;
  for (let i = 0; i < ATTEMPTS; i++) {
    try {
      const resp = await fetch(u);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      return Buffer.from(await resp.arrayBuffer());
    } catch (err) {
      last = err;
      await new Promise((r) => setTimeout(r, 400 * (i + 1)));
    }
  }
  throw last;
}

let failed = false;
const fail = (msg) => { failed = true; console.error(`  FAIL  ${msg}`); };

for (const [name, tpl] of Object.entries(templates())) {
  const host = new URL(tpl.replace(/\{[zxy]\}/g, "0")).host;
  console.log(`\n${name}  (${host})`);

  const seen = new Map();       // sha256 -> where it was first seen
  for (const sample of SAMPLES) {
    const u = url(tpl, sample);
    let body;
    try {
      body = await fetchTile(u);
    } catch (err) {
      fail(`${sample.where}: ${err.message}`);
      continue;
    }
    const hash = createHash("sha256").update(body).digest("hex").slice(0, 12);
    console.log(`  ${sample.where.padEnd(14)} ${String(body.length).padStart(7)} B  ${hash}`);

    if (body.length < MIN_BYTES) {
      fail(`${sample.where}: ${body.length} B is too small to be a map tile`);
    }
    if (seen.has(hash)) {
      fail(`${sample.where} is byte-identical to ${seen.get(hash)} — `
         + `this provider is serving a placeholder, not a map`);
    }
    seen.set(hash, sample.where);
  }
}

if (failed) {
  console.error("\nMap tiles are not usable. Fix the provider before deploying.");
  process.exit(1);
}
console.log("\nAll tile sources serve real, distinct tiles.");
