#!/usr/bin/env node
/**
 * Builds dist/index.html — a single self-contained file with no external
 * scripts. Compiles Tailwind against the source template, inlines the
 * stylesheet and the page script, and base64-embeds the web images.
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

function build() {
  const started = Date.now();

  // 1. Tailwind, compiled against the template + app.js so classes built in
  //    JS strings are picked up too (see tailwind.config.js `content`).
  execFileSync('npx', [
    'tailwindcss', '-c', p('tailwind.config.js'),
    '-i', p('src/input.css'), '-o', p('.tailwind.build.css'), '--minify'
  ], { stdio: 'pipe' });
  const css = readFileSync(p('.tailwind.build.css'), 'utf8');

  // 2. Template + inlined parts
  let out = readFileSync(p('src/index.html'), 'utf8');
  const js = readFileSync(p('src/app.js'), 'utf8');

  out = out.replace('<!--BUILD:TAILWIND-->',
    `<!-- Tailwind CSS - compiled for this page (no CDN, no runtime JIT) -->\n<style>${css}</style>\n`);
  out = out.replace('<!--BUILD:APPJS-->', `<script>\n${js}</script>`);

  // 3. Images as data URIs so the page stays a single file
  for (const [name, mime] of Object.entries(IMAGES)) {
    const file = p('assets/web', name);
    if (!existsSync(file)) throw new Error(`missing asset: assets/web/${name}`);
    const b64 = readFileSync(file).toString('base64');
    out = out.replaceAll(`ASSET:${name}`, `data:${mime};base64,${b64}`);
  }

  const leftover = out.match(/<!--BUILD:[A-Z]+-->|ASSET:[a-z0-9.\-]+/g);
  if (leftover) throw new Error('unresolved build placeholders: ' + leftover.join(', '));

  mkdirSync(p('dist'), { recursive: true });
  writeFileSync(p('dist/index.html'), out);
  console.log(`built dist/index.html  ${(out.length / 1024).toFixed(0)} KB  in ${Date.now() - started}ms`);
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
