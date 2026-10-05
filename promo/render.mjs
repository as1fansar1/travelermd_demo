// Render promo.html to MP4 (or stills). Usage:
//   node render.mjs                      -> traveler-wishlist-promo.mp4
//   node render.mjs stills 2 5 12.5      -> stills/t-2.png ...
import { createRequire } from 'module';
import { spawn } from 'child_process';
import { mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const require = createRequire(process.env.PLAYWRIGHT_DIR || (process.env.HOME + '/.claude/skills/gstack/node_modules/'));
const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const FPS = 30;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
page.on('pageerror', e => console.error('PAGE ERROR', e.message));
await page.goto('file://' + path.join(here, 'promo.html'));
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(400);

const [mode, ...rest] = process.argv.slice(2);
if (mode === 'stills'){
  mkdirSync(path.join(here, 'stills'), { recursive: true });
  for (const t of rest.map(Number)){
    await page.evaluate(t => seek(t), t);
    await page.screenshot({ path: path.join(here, 'stills', `t-${t}.png`) });
  }
} else {
  const dur = await page.evaluate(() => PROMO.DUR);
  const outFile = path.join(here, 'traveler-wishlist-promo.mp4');
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', outFile], { stdio: ['pipe', 'inherit', 'inherit'] });
  const n = Math.round(dur * FPS);
  for (let i = 0; i < n; i++){
    await page.evaluate(t => seek(t), i / FPS);
    const buf = await page.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 150 === 0) console.log(`frame ${i}/${n}`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  console.log('wrote', outFile);
}
await browser.close();
