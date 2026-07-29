/**
 * Generates every board-square image the README can need.
 *
 * 6 piece types x 2 colours x 3 square states (normal, selected, destination)
 * x 2 square colours, plus the empty squares. Run once; the output is
 * committed so the README never depends on a build step at view time.
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { squareSVG, SQUARES } from "./pieces.mjs";

const OUT = new URL("../assets/chess/", import.meta.url);
mkdirSync(OUT, { recursive: true });

const TYPES = ["P", "R", "N", "B", "Q", "K"];
const COLOURS = { w: "white", b: "black" };
const STATES = {
  "": ["light", "dark"],
  "-sel": ["lightSel", "darkSel"],
  "-dest": ["lightDest", "darkDest"],
};

let count = 0;
for (const [state, [lightKey, darkKey]] of Object.entries(STATES)) {
  for (const [squareName, bgKey] of [["l", lightKey], ["d", darkKey]]) {
    const bg = SQUARES[bgKey];

    // Empty square
    writeFileSync(new URL(`${squareName}${state}.svg`, OUT), squareSVG({ piece: null, bg }));
    count++;

    for (const [c, colour] of Object.entries(COLOURS)) {
      for (const type of TYPES) {
        const name = `${squareName}${c}${type.toLowerCase()}${state}.svg`;
        writeFileSync(new URL(name, OUT), squareSVG({ piece: type, colour, bg }));
        count++;
      }
    }
  }
}

console.log(`wrote ${count} square images to assets/chess/`);
