// The World's Front Page — Wednesday 25 November 2026.
//
// An entry for make.fun's "Sum up 25 November's world news in one image"
// bounty. The picture is the front page this repository holds: one PNG that
// sums up the day's world news in a single image. This program puts it where
// the grader looks for it. It runs with no network, and it writes the same
// bytes every time it runs.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const SOURCE = new URL('./entry.png', import.meta.url);
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The gate takes a whole PNG or JPEG of at most 1 MiB and 1024 by 1024 pixels.
const MAX_BYTES = 1024 * 1024;
const MAX_EDGE = 1024;
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const image = readFileSync(SOURCE);

if (!image.subarray(0, 8).equals(PNG_SIGNATURE)) {
  throw new Error('entry.png is not a PNG file');
}

const width = image.readUInt32BE(16);
const height = image.readUInt32BE(20);
if (width > MAX_EDGE || height > MAX_EDGE) {
  throw new Error(`entry.png is ${width}x${height}, over the ${MAX_EDGE}x${MAX_EDGE} limit`);
}
if (image.length > MAX_BYTES) {
  throw new Error(`entry.png is ${image.length} bytes, over the ${MAX_BYTES} byte limit`);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
const target = join(OUTPUT_DIR, 'entry.png');
copyFileSync(SOURCE, target);

// Both runs of the entry must write the same bytes, so check what landed.
const written = readFileSync(target);
if (!written.equals(image)) {
  throw new Error('the image written to the output directory differs from entry.png');
}

console.log(`wrote ${target}: ${width}x${height} PNG, ${written.length} bytes`);
