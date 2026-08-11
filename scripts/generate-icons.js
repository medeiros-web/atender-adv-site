// Gera os ícones PWA (PNG puro, sem dependências) a partir da marca "A" em gradiente,
// a mesma usada no favicon do site. Rode com: node scripts/generate-icons.js
// Se um logo definitivo existir no futuro, basta substituir os arquivos em /icons
// e este script pode ser descartado.

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const OUT_DIR = path.join(__dirname, '..', 'icons');

// Bitmap 8x7 da letra "A" (baseado na fonte VGA 8x8 clássica, linha final vazia removida)
const LETTER_A = [
  '00011000',
  '00111100',
  '01100110',
  '01100110',
  '01111110',
  '01100110',
  '01100110',
];

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function makeIcon({ size, padding = 0.18, bgFrom = '#8b5cf6', bgTo = '#3b82f6', rounded = 0.22 }) {
  const px = new Uint8Array(size * size * 4);
  const c1 = hexToRgb(bgFrom);
  const c2 = hexToRgb(bgTo);
  const radius = size * rounded;

  const insideRoundedSquare = (x, y) => {
    const cx = Math.min(Math.max(x, radius), size - radius);
    const cy = Math.min(Math.max(y, radius), size - radius);
    const dx = x - cx;
    const dy = y - cy;
    return dx * dx + dy * dy <= radius * radius || (x >= radius && x <= size - radius) || (y >= radius && y <= size - radius);
  };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const t = (x + y) / (2 * size); // diagonal gradient
      const r = Math.round(c1[0] + (c2[0] - c1[0]) * t);
      const g = Math.round(c1[1] + (c2[1] - c1[1]) * t);
      const b = Math.round(c1[2] + (c2[2] - c1[2]) * t);
      const inside = insideRoundedSquare(x + 0.5, y + 0.5);
      px[idx] = r;
      px[idx + 1] = g;
      px[idx + 2] = b;
      px[idx + 3] = inside ? 255 : 0;
    }
  }

  // Desenha a letra "A" branca, centralizada, escalada a partir do bitmap (células quadradas)
  const gridW = LETTER_A[0].length;
  const gridH = LETTER_A.length;
  const markSize = size * (1 - padding * 2);
  const cellW = markSize / Math.max(gridW, gridH);
  const cellH = cellW;
  const offsetX = (size - gridW * cellW) / 2;
  const offsetY = (size - gridH * cellH) / 2;

  for (let row = 0; row < gridH; row++) {
    for (let col = 0; col < gridW; col++) {
      if (LETTER_A[row][col] !== '1') continue;
      const x0 = Math.round(offsetX + col * cellW);
      const y0 = Math.round(offsetY + row * cellH);
      const x1 = Math.round(offsetX + (col + 1) * cellW);
      const y1 = Math.round(offsetY + (row + 1) * cellH);
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          if (x < 0 || y < 0 || x >= size || y >= size) continue;
          const idx = (y * size + x) * 4;
          if (px[idx + 3] === 0) continue;
          px[idx] = 255;
          px[idx + 1] = 255;
          px[idx + 2] = 255;
        }
      }
    }
  }

  return px;
}

// --- Encoder PNG mínimo (RGBA 8-bit, sem interlace) ---

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePNG(pixels, size) {
  const raw = Buffer.alloc(size * (1 + size * 4));
  for (let y = 0; y < size; y++) {
    const rowStart = y * (1 + size * 4);
    raw[rowStart] = 0; // filter: none
    for (let x = 0; x < size * 4; x++) {
      raw[rowStart + 1 + x] = pixels[y * size * 4 + x];
    }
  }

  const idat = zlib.deflateSync(raw, { level: 9 });

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function writeIcon(name, size, opts) {
  const px = makeIcon({ size, ...opts });
  const png = encodePNG(px, size);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, name), png);
  console.log(`gerado: icons/${name} (${size}x${size})`);
}

writeIcon('icon-192.png', 192, { padding: 0.2, rounded: 0.22 });
writeIcon('icon-512.png', 512, { padding: 0.2, rounded: 0.22 });
writeIcon('icon-maskable-512.png', 512, { padding: 0.32, rounded: 0 }); // safe zone maior p/ máscara do SO
writeIcon('apple-touch-icon.png', 180, { padding: 0.2, rounded: 0.22 });
writeIcon('favicon-32.png', 32, { padding: 0.16, rounded: 0.22 });
