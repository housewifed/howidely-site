#!/usr/bin/env node
/**
 * Builds the site's pages - each a single self-contained file with no
 * external scripts. Compiles Tailwind once against every template, then for
 * each page inlines the stylesheet and that page's script, and base64-embeds
 * the web images it uses.
 *
 *   src/index.html + src/app.js    -> dist/index.html        (howidely.com)
 *   src/fleet.html + src/fleet.js  -> dist/fleet/index.html  (howidely.com/fleet/)
 *
 *   node scripts/build.mjs          build once
 *   node scripts/build.mjs --watch  rebuild on change
 */
import { readFileSync, writeFileSync, existsSync, watch, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const p = (...s) => join(ROOT, ...s);

const IMAGES = { 'a-box.webp': 'image/webp', 'anderson.webp': 'image/webp' };

const PAGES = [
  { template: 'src/index.html', script: 'src/app.js',   out: 'dist/index.html' },
  { template: 'src/fleet.html', script: 'src/fleet.js', out: 'dist/fleet/index.html' },
];

/** The primary nav's destinations, with the page prefix dropped: "#about" on
 * the home page and "/#about" on the fleet page are the same link. The two
 * templates carry their own copy of the header; this keeps them from drifting. */
function navLinks(html) {
  const ul = html.match(/<ul class="hidden items-center gap-4 lg:flex">([\s\S]*?)<\/ul>/);
  if (!ul) throw new Error('primary nav not found');
  return [...ul[1].matchAll(/href="([^"]+)"/g)].map((m) => m[1].replace(/^\/(?=#)/, ''));
}

function build() {
  const started = Date.now();

  // 1. Tailwind, compiled against the template + app.js so classes built in
  //    JS strings are picked up too (see tailwind.config.js `content`).
  execFileSync('npx', [
    'tailwindcss', '-c', p('tailwind.config.js'),
    '-i', p('src/input.css'), '-o', p('.tailwind.build.css'), '--minify'
  ], { stdio: 'pipe' });
  const css = readFileSync(p('.tailwind.build.css'), 'utf8');

  const templates = PAGES.map((pg) => readFileSync(p(pg.template), 'utf8'));
  const [homeNav, ...otherNavs] = templates.map(navLinks);
  otherNavs.forEach((nav, i) => {
    if (JSON.stringify(nav) !== JSON.stringify(homeNav)) {
      throw new Error(`${PAGES[i + 1].template}: primary nav differs from the home page's\n` +
        `  home:  ${homeNav.join(' ')}\n  here:  ${nav.join(' ')}`);
    }
  });

  PAGES.forEach((pg, i) => {
    // 2. Template + inlined parts
    let out = templates[i];
    const js = readFileSync(p(pg.script), 'utf8');
    out = out.replace('<!--BUILD:TAILWIND-->',
      `<!-- Tailwind CSS - compiled for this site (no CDN, no runtime JIT) -->\n<style>${css}</style>\n`);
    out = out.replace('<!--BUILD:APPJS-->', `<script>\n${js}</script>`);

    // 3. Images as data URIs so each page stays a single file
    for (const [name, mime] of Object.entries(IMAGES)) {
      if (!out.includes(`ASSET:${name}`)) continue;
      const file = p('assets/web', name);
      if (!existsSync(file)) throw new Error(`missing asset: assets/web/${name}`);
      const b64 = readFileSync(file).toString('base64');
      out = out.replaceAll(`ASSET:${name}`, `data:${mime};base64,${b64}`);
    }

    const leftover = out.match(/<!--BUILD:[A-Z]+-->|ASSET:[a-z0-9.\-]+/g);
    if (leftover) throw new Error(`${pg.template}: unresolved build placeholders: ` + leftover.join(', '));

    mkdirSync(dirname(p(pg.out)), { recursive: true });
    writeFileSync(p(pg.out), out);
    console.log(`built ${pg.out}  ${(out.length / 1024).toFixed(0)} KB`);
  });
  console.log(`done in ${Date.now() - started}ms`);
}

build();

if (process.argv.includes('--watch')) {
  console.log('watching src/ and assets/web/ …');
  let t;
  for (const dir of ['src', 'assets/web']) {
    watch(p(dir), { recursive: true }, () => {
      clearTimeout(t);
      t = setTimeout(() => { try { build(); } catch (e) { console.error(e.message); } }, 120);
    });
  }
}
