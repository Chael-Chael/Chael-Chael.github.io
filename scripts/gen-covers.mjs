// Generates Mono Dither blog covers into public/images/blog/<slug>/cover.png.
// A post opts in with a [cover] table in content/blog/<slug>.toml:
//
//   [cover]
//   shape = "flare"     # beam | trails | flare | horizon  (omit = picked from slug)
//   color = "#2a37a8"   # optional ink colour, default cobalt
//   seed  = 0           # optional, change to re-roll the composition
//   word  = "llama."    # optional big serif word (default: first English word of title)
//   date  = "9.03"      # optional corner date (default: post date)
//   caption = "LLM\nPaper Reading"  # optional bottom-right text (default: first two tags)
//
// Output is deterministic: same config -> same image. Runs before dev/build.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { parse } from 'smol-toml';

const ROOT = process.cwd();
const BLOG_DIRS = fs.readdirSync(ROOT)
  .filter((d) => d === 'content' || d.startsWith('content_'))
  .map((d) => path.join(ROOT, d, 'blog'))
  .filter((d) => fs.existsSync(d));
const OUT = path.join(ROOT, 'public', 'images', 'blog');
const W = 960, H = 600, CELL = 5;
export const SHAPES = ['beam', 'trails', 'flare', 'horizon'];

// ---------- deterministic helpers ----------
function hash(s) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let a = seed; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function noise1(r) { const p = Array.from({ length: 64 }, r); return (t) => { const i = Math.floor(t), f = t - i, u = f * f * (3 - 2 * f); return p[i & 63] * (1 - u) + p[(i + 1) & 63] * u - 0.5; }; }
const sm = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
const BAYER = [[0,32,8,40,2,34,10,42],[48,16,56,24,50,18,58,26],[12,44,4,36,14,46,6,38],[60,28,52,20,62,30,54,22],[3,35,11,43,1,33,9,41],[51,19,59,27,49,17,57,25],[15,47,7,39,13,45,5,37],[63,31,55,23,61,29,53,21]];
const b8 = (x, y) => (BAYER[y & 7][x & 7] + 0.5) / 64;
const hexRgb = (h) => { const n = parseInt(h.replace('#', ''), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };

// ---------- light fields: (x,y) in a 360x225 frame -> brightness 0..1 ----------
const FW = 360, FH = 225;
const FIELDS = {
  beam(r) {
    const px = FW * (0.55 + r() * 0.3), py = FH * (0.35 + r() * 0.35), fromLeft = r() < 0.7, side = fromLeft ? 0 : FW, spread = 0.35 + r() * 0.35;
    const text = { x: Math.min(FW - 110, px - 30), y: py + 8, dateRight: true };
    return { text, L: (x, y) => {
      if ((fromLeft && x > px) || (!fromLeft && x < px)) return Math.max(0, 0.9 - Math.hypot(x - px, y - py) / 6) * 0.9;
      const t = Math.abs(x - px) / Math.abs(side - px || 1);
      const w = 2 + t * t * FH * spread, core = Math.exp(-(((y - py) / w) ** 2));
      const haze = sm(0.55, 1, t) * 0.55 * (1 - Math.abs(y - py) / FH);
      return Math.min(1, core * (0.35 + 0.65 * t) + haze);
    } };
  },
  trails(r) {
    const n = 2 + Math.floor(r() * 2), tx = FW * (0.5 + r() * 0.25), ty = FH * (0.25 + r() * 0.15);
    const tr = Array.from({ length: n }, (_, i) => ({ x0: FW * (0.1 + i * 0.22 + r() * 0.08), bend: 0.6 + r() * 0.5 }));
    const text = { x: FW - 120, y: FH * 0.62, dateRight: false };
    return { text, L: (x, y) => {
      let v = 0;
      if (y >= ty) {
        const t = (y - ty) / (FH - ty);
        for (const s of tr) { const cx = tx + (s.x0 - tx) * Math.pow(t, s.bend), w = 1 + t * t * 26; v = Math.max(v, Math.exp(-(((x - cx) / w) ** 2)) * (0.25 + 0.75 * t)); }
      }
      const dx = x - tx, dy = y - ty;
      const streak = dx < 0 ? Math.exp(-(((dy + dx * 0.32) / 1.4) ** 2)) * sm(-FW * 0.5, 0, dx) * 0.7 : 0;
      return Math.min(1, v + streak);
    } };
  },
  flare(r) {
    const fx = FW * (0.6 + r() * 0.3), fy = FH * (0.25 + r() * 0.4), rays = 7 + Math.floor(r() * 6), rot = r() * 6;
    const text = { x: fx - 34, y: fy + 10, anchor: 'end', dateRight: false };
    return { text, L: (x, y) => {
      const dx = x - fx, dy = y - fy, d = Math.hypot(dx, dy), a = Math.atan2(dy, dx);
      const ray = Math.pow(Math.max(0, Math.cos(((a + rot) * rays) / 2)), 18) * Math.exp(-d / 48);
      const line = Math.exp(-(((x - fx) / 1.2) ** 2)) * Math.exp(-Math.abs(dy) / 90) * 0.9;
      return Math.min(1, Math.exp(-d / 14) + ray + line + Math.exp(-d / 70) * 0.25);
    } };
  },
  horizon(r) {
    const R = FW * (1.2 + r() * 0.8), cx = FW * (0.2 + r() * 0.6), cy = FH + R - FH * (0.25 + r() * 0.25);
    const text = { x: 12, y: FH * 0.42, dateRight: true };
    return { text, L: (x, y) => { const d = Math.hypot(x - cx, y - cy) - R; return d > 0 ? Math.exp(-d / 10) * 0.95 : Math.exp(d / 38) * 0.7; } };
  },
};

// ---------- render ----------
function render(slug, cfg) {
  const shape = SHAPES.includes(cfg.shape) ? cfg.shape : SHAPES[(hash(slug) >>> 5) % SHAPES.length];
  const [R, G, B] = hexRgb(cfg.color || '#2a37a8');
  const r = rng(hash(`${slug}#${cfg.seed ?? 0}`));
  const { L: field, text } = FIELDS[shape](r);
  // cut the faint tail so empty sky stays clean instead of a regular dot lattice
  const L = (x, y) => Math.max(0, (field(x, y) - 0.06) / 0.94);
  const grain = rng(hash(`${slug}#grain`));
  const gw = Math.ceil(W / CELL), gh = Math.ceil(H / CELL), on = new Uint8Array(gw * gh);
  for (let cy = 0; cy < gh; cy++) for (let cx = 0; cx < gw; cx++)
    on[cy * gw + cx] = L(((cx + 0.5) * CELL / W) * FW, ((cy + 0.5) * CELL / H) * FH) > b8(cx, cy) ? 1 : 0;
  const stride = W * 3 + 1, raw = Buffer.alloc(stride * H);
  for (let y = 0; y < H; y++) {
    raw[y * stride] = 0;
    const row = Math.floor(y / CELL) * gw;
    for (let x = 0; x < W; x++) {
      const g = Math.round((grain() - 0.5) * 6) * 7, dx = x / W - 0.5, dy = y / H - 0.5, shade = 1 - 0.7 * (dx * dx + dy * dy);
      let pr, pg, pb;
      if (on[row + Math.floor(x / CELL)]) { const w = 228 + g * 0.5; pr = w; pg = w; pb = w + 12; }
      else { pr = R * shade + g; pg = G * shade + g; pb = B * shade + g * 1.1; }
      if (grain() < 0.0025) pr = pg = pb = 235;
      const i = y * stride + 1 + x * 3;
      raw[i] = clamp(pr); raw[i + 1] = clamp(pg); raw[i + 2] = clamp(pb);
    }
  }
  return { png: encodePng(raw), shape, text };
}

// ---------- type layer: PNG wrapped in an SVG so text stays crisp ----------
// <img>-loaded SVGs cannot fetch web fonts, so the serif is embedded (public/fonts, SIL OFL).
const SERIF_B64 = fs.readFileSync(path.join(ROOT, 'public', 'fonts', 'InstrumentSerif-Regular.ttf')).toString('base64');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function coverWord(meta, cfg) {
  if (cfg.word) return cfg.word;
  const m = String(meta.title || '').match(/[A-Za-z][A-Za-z0-9]+/);
  return `${(m ? m[0] : 'note').toLowerCase()}.`;
}
function coverDate(date) {
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? '' : `${d.getUTCMonth() + 1}.${String(d.getUTCDate()).padStart(2, '0')}`;
}
function toSvg({ png, text }, meta, cfg) {
  const k = W / FW, serif = `'Instrument Serif', 'Iowan Old Style', Georgia, 'Times New Roman', serif`, sans = `Inter, 'Helvetica Neue', Arial, sans-serif`;
  const caption = cfg.caption ?? (meta.tags || []).slice(0, 2).join('\n');
  const lines = String(caption).split('\n').filter(Boolean).slice(0, 2);
  const date = cfg.date ?? coverDate(meta.date);
  const fill = '#eef0fb';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs><style>@font-face{font-family:'Instrument Serif';src:url(data:font/ttf;base64,${SERIF_B64}) format('truetype');}</style></defs>
<image href="data:image/png;base64,${png.toString('base64')}" width="${W}" height="${H}"/>
<g fill="${fill}">
${date ? `<text x="${text.dateRight ? W - 10 * k : 10 * k}" y="${22 * k}" font-family="${serif}" font-size="${15 * k}" text-anchor="${text.dateRight ? 'end' : 'start'}">${esc(date)}</text>` : ''}
<text x="${text.x * k}" y="${text.y * k}" font-family="${serif}" font-size="${30 * k}" letter-spacing="-1" text-anchor="${text.anchor || 'start'}">${esc(coverWord(meta, cfg))}</text>
${lines.map((s, i) => `<text x="${W - 10 * k}" y="${H - (14 - i * 8) * k - (lines.length === 1 ? 0 : 0)}" font-family="${sans}" font-weight="500" font-size="${6.5 * k}" text-anchor="end">${esc(s.slice(0, 48))}</text>`).join('\n')}
</g>
</svg>`;
}
const clamp = (v) => (v < 0 ? 0 : v > 255 ? 255 : v | 0);

// ---------- minimal PNG encoder (RGB, 8-bit) ----------
const CRC = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
function crc32(buf) { let c = 0xffffffff; for (const b of buf) c = CRC[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]); const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function encodePng(raw) {
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

// ---------- main ----------
const done = new Set();
for (const dir of BLOG_DIRS) {
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.toml'))) {
    const slug = file.slice(0, -5);
    if (done.has(slug)) continue;
    const meta = parse(fs.readFileSync(path.join(dir, file), 'utf-8'));
    if (!meta.cover) continue;
    done.add(slug);
    const cfg = typeof meta.cover === 'object' ? meta.cover : {};
    const outDir = path.join(OUT, slug);
    fs.mkdirSync(outDir, { recursive: true });
    const result = render(slug, cfg);
    fs.writeFileSync(path.join(outDir, 'cover.svg'), toSvg(result, meta, cfg));
    fs.rmSync(path.join(outDir, 'cover.png'), { force: true });
    const { shape } = result;
    console.log(`[covers] ${slug} -> ${shape}`);
  }
}
