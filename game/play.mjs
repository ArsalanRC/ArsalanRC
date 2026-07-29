/**
 * Applies one command from an issue title, then rewrites the README.
 *
 * Usage: node game/play.mjs "chess|move|e2e4" "octocat"
 *
 * Every command is validated against the engine rather than trusted. The issue
 * title is attacker-controlled input: anyone on the internet can open an issue
 * with any title they like, so "e2e4" is only ever a request, never an
 * instruction. An illegal or malformed move leaves the game untouched.
 */

import { writeFileSync, readFileSync } from "node:fs";
import {
  createInitialState, getValidMoves, applyMove, selectBotMove, frToSq,
} from "@arsalanrc/chess-engine";
import { loadState, STATE_PATH, sqName, writeReadme } from "./render.mjs";

const FILES = "abcdefgh";
const README = new URL("../README.md", import.meta.url);
const DIFFICULTY = "medium";   // depth 3: strong enough to be interesting, fast enough for CI

const parseSquare = (s) => {
  if (typeof s !== "string" || s.length !== 2) return null;
  const file = FILES.indexOf(s[0].toLowerCase());
  const rank = Number(s[1]) - 1;
  if (file < 0 || !Number.isInteger(rank) || rank < 0 || rank > 7) return null;
  return frToSq(file, rank);
};

/** Light SAN, matching the demo, so the log reads like a scoresheet. */
function toSan(st, move) {
  if (move.isCastling) return move.isCastling === "kingside" ? "O-O" : "O-O-O";
  const piece = st.board[move.from];
  const letter = piece.type === "P" ? "" : piece.type;
  const captured = move.capturedPiece ?? st.board[move.to];
  const takes = captured || move.isEnPassant ? "x" : "";
  const origin = piece.type === "P" && takes ? FILES[move.from % 8] : "";
  const promo = move.promotion ? "=" + move.promotion : "";
  return letter + origin + takes + sqName(move.to) + promo;
}

const [, , rawTitle = "", actor = "someone"] = process.argv;
const parts = rawTitle.trim().split("|").map((s) => s.trim());

if (parts[0] !== "chess") {
  console.log("Not a chess command, ignoring.");
  process.exit(0);
}

const g = loadState();
const cmd = parts[1];
let reply = "";

if (cmd === "new") {
  Object.assign(g, { state: createInitialState(), selected: null, log: [], players: [] });
  reply = "New game started. White to move.";
} else if (cmd === "deselect") {
  g.selected = null;
  reply = "Selection cleared.";
} else if (cmd === "select") {
  const sq = parseSquare(parts[2]);
  const piece = sq === null ? null : g.state.board[sq];
  if (piece && piece.color === g.state.turnColor && g.state.gameResult === "in_progress") {
    g.selected = sq;
    const n = getValidMoves(g.state).filter((m) => m.from === sq).length;
    reply = n
      ? `Selected ${parts[2]}. ${n} legal move${n === 1 ? "" : "s"}.`
      : `Selected ${parts[2]}, but it has no legal moves.`;
  } else {
    reply = `Cannot select ${parts[2] ?? "that"}.`;
  }
} else if (cmd === "move") {
  const raw = String(parts[2] ?? "");
  const from = parseSquare(raw.slice(0, 2));
  const to = parseSquare(raw.slice(2, 4));

  // The engine is the only authority on legality. Anything not in this list
  // simply is not a move, regardless of what the issue title claimed.
  const legal = getValidMoves(g.state);
  const candidates = legal.filter((m) => m.from === from && m.to === to);
  // Auto-queen: a README is a poor place for a promotion dialog.
  const move = candidates.find((m) => m.promotion === "Q") ?? candidates[0];

  if (!move) {
    reply = `\`${raw}\` is not a legal move in this position, so nothing changed.`;
  } else {
    g.log.push(toSan(g.state, move));
    g.state = applyMove(g.state, move);
    g.selected = null;
    if (!g.players.includes(actor)) g.players.push(actor);

    if (g.state.gameResult === "in_progress") {
      const botMove = selectBotMove(g.state, DIFFICULTY);
      if (botMove) {
        g.log.push(toSan(g.state, botMove));
        g.state = applyMove(g.state, botMove);
      }
    }
    reply = `Played **${g.log[g.log.length - 2]}**, engine replied **${g.log[g.log.length - 1]}**.`;
  }
} else {
  reply = `Unknown command \`${cmd}\`.`;
}

if (g.state.gameResult !== "in_progress") {
  reply += g.state.gameResult === "draw"
    ? ` Game over: draw by ${String(g.state.drawReason).replace(/_/g, " ")}.`
    : ` Game over: ${g.state.gameResult === "white_wins" ? "white" : "black"} wins.`;
}

writeFileSync(STATE_PATH, JSON.stringify(g, null, 2) + "\n");
writeReadme(README, g);

// Handed back to the workflow so it can comment on the issue before closing it.
writeFileSync(new URL("./last-reply.txt", import.meta.url), reply + "\n");
console.log(reply);
