/**
 * Builds the README chess puzzle.
 *
 * The board is display-only: clicking a piece used to open a pre-filled issue,
 * which meant a visitor landed on a bug-report form with no warning and every
 * move left litter in the profile repo's issue tracker. Both were bad trades
 * for a novelty.
 *
 * `<details>` gives real interactivity instead. It expands on click, needs no
 * JavaScript, never navigates away and leaves nothing behind.
 *
 * Every candidate answer is checked against the engine rather than written by
 * hand, so the puzzle cannot claim something the engine disagrees with.
 */

import { writeFileSync, mkdirSync } from "node:fs";
import {
  createInitialState, getValidMoves, applyMove, frToSq, fileOf, rankOf,
} from "@arsalanrc/chess-engine";
import { squareSVG, SQUARES } from "./pieces.mjs";

const FILES = "abcdefgh";
const OUT = new URL("../assets/puzzle/", import.meta.url);
mkdirSync(OUT, { recursive: true });

const sq = (name) => frToSq(FILES.indexOf(name[0]), Number(name[1]) - 1);
const sqName = (n) => FILES[fileOf(n)] + (rankOf(n) + 1);

/**
 * Back-rank mate. Chosen because the idea is legible to someone who barely
 * plays: the king is walled in by its own pawns, so a rook arriving on the
 * back rank ends it. The near-misses are instructive rather than random.
 */
const PIECES = [
  ["a1", "R", "white"], ["g1", "K", "white"], ["c4", "B", "white"],
  ["f2", "P", "white"], ["g2", "P", "white"], ["h2", "P", "white"],
  ["g8", "K", "black"], ["f7", "P", "black"], ["g7", "P", "black"], ["h7", "P", "black"],
  // Black's only piece. A knight because it cannot reach the eighth rank in
  // one move, so it cannot interpose against the mate, and on b5 rather than
  // a5 so it does not stand in the rook's own way.
  //
  // Two drafts were unsound before this one and the engine caught both: a rook
  // on b6 quietly blocked at b8, and a knight on a5 blocked the a-file so the
  // rook could never reach a8 at all. Hence the assertion below.
  ["b5", "N", "black"],
];

const board = Array(64).fill(null);
for (const [name, type, color] of PIECES) board[sq(name)] = { type, color };

const position = {
  ...createInitialState(),
  board,
  turnColor: "white",
  castlingRights: { whiteKingside: false, whiteQueenside: false, blackKingside: false, blackQueenside: false },
  enPassantSquare: null,
  check: false,
  lastMove: null,
};

// --------------------------------------------------------------- verify

const legal = getValidMoves(position);
const results = legal.map((m) => {
  const after = applyMove(position, m);
  return {
    piece: position.board[m.from].type, from: sqName(m.from), to: sqName(m.to),
    captures: Boolean(position.board[m.to]),
    mate: after.gameResult === "white_wins",
    check: after.check,
    replies: after.gameResult === "in_progress" ? getValidMoves(after).length : 0,
  };
});

const mates = results.filter((r) => r.mate);
if (mates.length !== 1) {
  console.error(`Expected exactly one mate in one, found ${mates.length}:`,
    mates.map((m) => m.from + m.to));
  process.exit(1);
}
const solution = mates[0];

/**
 * Two wrong answers. Preference order: a move that checks but can be answered,
 * then one that wins material, then anything else. Both of the first two are
 * mistakes a real player actually makes, which is what makes the puzzle worth
 * clicking rather than a coin toss.
 */
const wrong = results.filter((r) => !r.mate);
const decoys = [];
for (const pick of [
  (r) => r.check,
  (r) => r.captures,
  () => true,
]) {
  for (const r of wrong) {
    if (decoys.length >= 2) break;
    if (!decoys.includes(r) && pick(r)) decoys.push(r);
  }
}

// --------------------------------------------------------------- render

writeFileSync(new URL("board.svg", OUT), boardSVG(board));

function boardSVG(b) {
  const S = 56;
  let cells = "";
  for (let rank = 7; rank >= 0; rank--) {
    for (let file = 0; file < 8; file++) {
      const idx = frToSq(file, rank);
      const p = b[idx];
      const dark = (file + rank) % 2 === 0;
      const bg = dark ? SQUARES.dark : SQUARES.light;
      const inner = squareSVG({ piece: p?.type ?? null, colour: p?.color, bg })
        .replace(/^<svg[^>]*>/, "").replace(/<\/svg>\n?$/, "");
      const x = file * S, y = (7 - rank) * S;
      cells += `<g transform="translate(${x} ${y}) scale(${S / 45})">${inner}</g>`;
    }
  }
  const coords = FILES.split("").map((f, i) =>
    `<text x="${i * S + S / 2}" y="${8 * S + 16}" text-anchor="middle"
       font-family='ui-monospace, Menlo, monospace' font-size="13" fill="#8A90A3">${f}</text>`).join("") +
    [1,2,3,4,5,6,7,8].map((r) =>
    `<text x="-10" y="${(8 - r) * S + S / 2 + 5}" text-anchor="end"
       font-family='ui-monospace, Menlo, monospace' font-size="13" fill="#8A90A3">${r}</text>`).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-22 0 ${8 * S + 26} ${8 * S + 26}"
    width="${8 * S + 26}" height="${8 * S + 26}" role="img"
    aria-label="Chess position, white to play and mate in one">
    <title>White to play, mate in one</title>${cells}${coords}
  </svg>\n`;
}

// --------------------------------------------------------------- markdown

const VERDICT = {
  en: (r) => r.mate
    ? `**Correct. Checkmate.** The black king is walled in by its own pawns on f7, g7 and h7, so a rook arriving on the back rank ends it immediately. Nothing blocks, nothing captures the rook, and the king has no square.`
    : r.check
      ? `**Check, but not mate.** Black has ${r.replies} legal repl${r.replies === 1 ? "y" : "ies"}, so the attack does not finish. Giving check is not the same as ending the game, which is the whole point of the puzzle.`
      : r.captures
        ? `**Wins material, misses the win.** Black gets ${r.replies} legal moves and the game carries on. Taking a free piece is usually right, which is exactly why it is tempting, and exactly why it is wrong here.`
        : `**Not even check.** Black gets ${r.replies} legal moves and simply carries on. It looks active without doing anything.`,
  de: (r) => r.mate
    ? `**Richtig. Schachmatt.** Der schwarze König ist von den eigenen Bauern auf f7, g7 und h7 eingemauert. Ein Turm, der die Grundreihe erreicht, beendet die Partie deshalb sofort: nichts kann dazwischenziehen, nichts den Turm schlagen, und der König hat kein Feld.`
    : r.check
      ? `**Schach, aber kein Matt.** Schwarz hat ${r.replies} legale Antwort${r.replies === 1 ? "" : "en"}, der Angriff läuft also ins Leere. Schach geben ist nicht dasselbe wie die Partie beenden, und genau darum geht es hier.`
      : r.captures
        ? `**Gewinnt Material, verpasst den Sieg.** Schwarz bekommt ${r.replies} legale Züge und die Partie geht weiter. Eine Figur geschenkt zu nehmen ist meistens richtig. Genau deshalb ist der Zug verlockend, und genau deshalb ist er hier falsch.`
        : `**Nicht einmal Schach.** Schwarz bekommt ${r.replies} legale Züge und macht einfach weiter. Der Zug sieht aktiv aus, ohne etwas zu bewirken.`,
};

const _unusedVerdict = (r) =>
  r.mate
    ? `**Correct. Checkmate.** The black king is walled in by its own pawns on f7, g7 and h7, so a rook arriving on the back rank ends it immediately. Nothing blocks, nothing captures the rook, and the king has no square.`
    : r.check
      ? `**Check, but not mate.** Black has ${r.replies} legal repl${r.replies === 1 ? "y" : "ies"}, so the attack does not finish. Giving check is not the same as ending the game, which is the whole point of the puzzle.`
      : r.captures
        ? `**Wins material, misses the win.** Black gets ${r.replies} legal moves and the game carries on. Taking a free piece is usually right, which is exactly why it is tempting, and exactly why it is wrong here.`
        : `**Not even check.** Black gets ${r.replies} legal moves and simply carries on. It looks active without doing anything.`;

const NAMES = { K: "king", Q: "queen", R: "rook", B: "bishop", N: "knight", P: "pawn" };
const label = (r) => `${r.piece === "P" ? "" : r.piece}${r.from}${r.captures ? "x" : "-"}${r.to}`;
const describe = (r) => `${NAMES[r.piece]} ${r.captures ? "takes on" : "to"} ${r.to}`;

const options = [solution, ...decoys].sort((a, b) => (a.from + a.to).localeCompare(b.from + b.to));

const NAMES_DE = { K: "König", Q: "Dame", R: "Turm", B: "Läufer", N: "Springer", P: "Bauer" };
const describeDe = (r) => `${NAMES_DE[r.piece]} ${r.captures ? "schlägt auf" : "nach"} ${r.to}`;

const COPY = {
  en: { alt: "Chess position, white to play and mate in one",
        prompt: "**White to play. Mate in one.** Pick a move to see whether it works.",
        desc: describe },
  de: { alt: "Schachstellung, Weiß am Zug, Matt in eins",
        prompt: "**Weiß am Zug. Matt in eins.** Wähle einen Zug und sieh nach, ob er funktioniert.",
        desc: describeDe },
};

for (const [lang, copy] of Object.entries(COPY)) {
  const md = [
    "<!-- PUZZLE:START -->",
    "",
    `<img src="./assets/puzzle/board.svg" width="470" alt="${copy.alt}">`,
    "",
    copy.prompt,
    "",
    ...options.flatMap((r) => [
      `<details>`,
      `<summary><code>${label(r)}</code> &nbsp; ${copy.desc(r)}</summary>`,
      ``,
      VERDICT[lang](r),
      ``,
      `</details>`,
      ``,
    ]),
    "<!-- PUZZLE:END -->",
  ].join("\n");
  const file = lang === "en" ? "./puzzle.md" : "./puzzle.de.md";
  writeFileSync(new URL(file, import.meta.url), md + "\n");
}

console.log(`solution: ${label(solution)}`);
console.log(`decoys:   ${decoys.map(label).join(", ")}`);
console.log(`verified against the engine: ${legal.length} legal moves, exactly 1 mates`);
