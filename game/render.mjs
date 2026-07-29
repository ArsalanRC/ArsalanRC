/**
 * Renders the current game into the README.
 *
 * The whole interaction runs on links, because GitHub strips JavaScript from
 * markdown. Every playable square is a link to a pre-filled "new issue" URL;
 * a workflow reads the issue title, advances the game, rewrites this section,
 * and closes the issue. The board a visitor sees is therefore always a static
 * image grid, and the "interactivity" is entirely GitHub Actions.
 */

import { readFileSync, writeFileSync } from "node:fs";
import {
  createInitialState, getValidMoves, applyMove, evaluate, fileOf, rankOf, frToSq,
} from "@arsalanrc/chess-engine";

const REPO = "ArsalanRC/ArsalanRC";
const ASSETS = `https://raw.githubusercontent.com/${REPO}/main/assets/chess`;
const FILES = "abcdefgh";
const STATE_PATH = new URL("./state.json", import.meta.url);

const sqName = (sq) => FILES[fileOf(sq)] + (rankOf(sq) + 1);

/** Pre-filled issue URL. The title is the entire protocol between UI and Action. */
function action(cmd, label) {
  const title = encodeURIComponent(`chess|${cmd}`);
  const body = encodeURIComponent(
    "Just submit this issue. A workflow reads the title, plays the move, and closes it.\n" +
    "Nothing here is read, so you can ignore this box entirely."
  );
  return `https://github.com/${REPO}/issues/new?title=${title}&body=${body}&labels=chess`;
}

function loadState() {
  try {
    const raw = JSON.parse(readFileSync(STATE_PATH, "utf8"));
    return { ...raw, state: raw.state };
  } catch {
    return { state: createInitialState(), selected: null, log: [], players: [] };
  }
}

/**
 * One board square. Three cases: a legal destination for the selected piece,
 * a piece of the side to move (so selectable), or plain scenery.
 */
function cell(g, sq, isDark, destinations) {
  const piece = g.state.board[sq];
  const shade = isDark ? "d" : "l";
  const code = piece ? `${piece.color === "white" ? "w" : "b"}${piece.type.toLowerCase()}` : "";

  if (destinations.has(sq)) {
    const img = `${ASSETS}/${shade}${code}-dest.svg`;
    return `[<img src="${img}" width="42">](${action(`move|${sqName(g.selected)}${sqName(sq)}`)})`;
  }
  if (sq === g.selected) {
    return `<img src="${ASSETS}/${shade}${code}-sel.svg" width="42">`;
  }
  const img = `${ASSETS}/${shade}${code}.svg`;
  const selectable =
    piece && piece.color === g.state.turnColor && g.state.gameResult === "in_progress";
  return selectable
    ? `[<img src="${img}" width="42">](${action(`select|${sqName(sq)}`)})`
    : `<img src="${img}" width="42">`;
}

export function renderBoard(g) {
  const legal = getValidMoves(g.state);
  const destinations = new Set(
    g.selected === null ? [] : legal.filter((m) => m.from === g.selected).map((m) => m.to)
  );

  const rows = ["|   | a | b | c | d | e | f | g | h |", "|---|---|---|---|---|---|---|---|---|"];
  for (let rank = 7; rank >= 0; rank--) {
    const cells = [];
    for (let file = 0; file < 8; file++) {
      const sq = frToSq(file, rank);
      cells.push(cell(g, sq, (file + rank) % 2 === 0, destinations));
    }
    rows.push(`| **${rank + 1}** | ${cells.join(" | ")} |`);
  }
  return rows.join("\n");
}

export function renderStatus(g) {
  const s = g.state;
  const cp = evaluate(s);
  const pawns = (cp / 100).toFixed(2);

  if (s.gameResult !== "in_progress") {
    const outcome =
      s.gameResult === "draw"
        ? `**Draw** by ${String(s.drawReason).replace(/_/g, " ")}.`
        : `**${s.gameResult === "white_wins" ? "White" : "Black"} wins by checkmate.**`;
    return `${outcome} [Start a new game](${action("new")})`;
  }

  const side = s.turnColor === "white" ? "White" : "Black";
  const hint =
    g.selected === null
      ? `Click any **${side.toLowerCase()}** piece to select it.`
      : `Click a highlighted square to move, or [pick a different piece](${action("deselect")}).`;

  return [
    `**${side} to move.** ${s.check ? "**Check.**" : ""} ${hint}`,
    "",
    `\`move ${s.fullmoveNumber}\` · \`${getValidMoves(s).length} legal moves\` · ` +
      `\`eval ${cp > 0 ? "+" : ""}${pawns}\` · [new game](${action("new")})`,
  ].join("\n");
}

export function renderLog(g) {
  if (!g.log.length) return "_No moves yet._";
  const rows = [];
  for (let i = 0; i < g.log.length; i += 2) {
    rows.push(`${i / 2 + 1}. ${g.log[i] ?? ""} ${g.log[i + 1] ?? ""}`.trim());
  }
  return rows.slice(-8).join(" · ");
}

/** Replace the marked block in README.md, leaving everything else untouched. */
export function writeReadme(path, g) {
  const START = "<!-- CHESS:START -->";
  const END = "<!-- CHESS:END -->";
  const md = [
    START,
    "",
    renderBoard(g),
    "",
    renderStatus(g),
    "",
    `**Moves** · ${renderLog(g)}`,
    "",
    END,
  ].join("\n");

  const src = readFileSync(path, "utf8");
  const pattern = new RegExp(`${START}[\\s\\S]*?${END}`);
  writeFileSync(path, src.replace(pattern, md), "utf8");
}

export { loadState, STATE_PATH, sqName, action };
