/**
 * Checks that every cloud sits in open sky.
 *
 * The README is one page sliced into panels, and the sky is drawn behind all of
 * them. Glass tiles sit on top. A cloud whose body lands behind a tile shows
 * through dimmed and then emerges at full strength the instant the tile ends,
 * and because most tiles run the full width of their panel, that shows up as a
 * hard horizontal line right on a seam. Three of the eight clouds did exactly
 * that before this script existed, and the only reason it was caught is that
 * somebody looked closely at three screenshots.
 *
 * So: the panel heights are the input, the occupied bands are declared per
 * panel type, and this fails loudly if a cloud plus its blur overlaps one.
 * Run it after anything that changes a panel's height.
 *
 *   node game/audit-clouds.mjs
 */

import { CLOUDS, CLOUD_BLEED } from "./build-components.mjs";
import { pageMap } from "./build-readme.mjs";

const { pageH, bands } = pageMap();

let bad = 0;

const PAGE_W = 1000;

for (const [i, c] of CLOUDS.entries()) {
  const cy = c.cy * pageH;
  const top = cy - c.ry - CLOUD_BLEED;
  const bottom = cy + c.ry + CLOUD_BLEED;
  const cx = c.cx * PAGE_W;
  const left = cx - c.rx - CLOUD_BLEED;
  const right = cx + c.rx + CLOUD_BLEED;

  /* Bands are full width unless they say otherwise, which all but one are.
     Declaring a narrow band is how the header pane lets the clouds sit beside
     it; declaring one for a tile that later grows would be a false pass, so
     the default is the strict one. */
  const hits = bands.filter((b) =>
    top < b.to && bottom > b.from &&
    left < (b.toX ?? PAGE_W) && right > (b.fromX ?? 0));

  if (hits.length) {
    bad++;
    console.error(
      `cloud ${i} at cy=${c.cy} spans ${top.toFixed(0)}-${bottom.toFixed(0)} ` +
      `and runs into ${hits.map((b) => `${b.id} (${b.from}-${b.to})`).join(", ")}`,
    );
  }
}

const open = [];
let cursor = 0;
for (const b of [...bands].sort((x, y) => x.from - y.from)) {
  if (b.from > cursor) open.push(`${cursor}-${b.from}`);
  cursor = Math.max(cursor, b.to);
}
if (cursor < pageH) open.push(`${cursor}-${pageH}`);

console.log(`page height ${pageH}`);
console.log(`open sky: ${open.join(", ")}`);
console.log(`a cloud needs ry + ${CLOUD_BLEED} of room above and below its centre`);

if (bad) {
  console.error(`\n${bad} cloud${bad === 1 ? "" : "s"} sitting behind glass. Move them into open sky.`);
  process.exit(1);
}
console.log(`\nall ${CLOUDS.length} clouds are clear of the glass`);
