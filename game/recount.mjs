/**
 * Recount the stat tiles from the API and say what disagrees.
 *
 *   node game/recount.mjs
 *
 * These numbers have drifted in every direction. The merged-PR tile once said
 * 27 against a real 41. The repo tile said 12 while the API said 11, because an
 * earlier count included `arena-lounge`, which is private and which a visitor
 * therefore cannot see. A tile claiming a repo nobody can open is worse than a
 * tile that is merely out of date.
 *
 * So the numbers are checked against the API rather than remembered, and the
 * one number the API cannot answer is named as such instead of guessed.
 *
 * Needs `GH_TOKEN`, which direnv exports inside the game-platform directory.
 * Load it before changing directory, never after.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OWNER = "ArsalanRC";

/**
 * Merged pull requests are summed per repository.
 *
 * Never `search/issues?q=is:pr+is:merged+author:...+user:...`. That reads two
 * too high, because `user:` sweeps in the two archived tutorial repos, which
 * are private and are not work worth claiming. That query was written down as
 * the source once and inflated the tiles until somebody checked.
 */
async function api(pathname) {
  const token = process.env.GH_TOKEN;
  if (!token) throw new Error("No GH_TOKEN. Load direnv first, then cd.");

  const response = await fetch(`https://api.github.com/${pathname}`, {
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/vnd.github+json",
    },
  });

  if (!response.ok) throw new Error(`${pathname}: ${response.status}`);
  return response.json();
}

const repos = await api(`users/${OWNER}/repos?per_page=100&type=owner`);
const publicRepos = repos.filter((r) => !r.private);

let merged = 0;
const perRepo = [];

for (const repo of publicRepos) {
  const pulls = await api(`repos/${OWNER}/${repo.name}/pulls?state=closed&per_page=100`);
  const count = pulls.filter((p) => p.merged_at !== null).length;
  perRepo.push([repo.name, count]);
  merged += count;
}

/** Whatever the tiles currently claim, read out of the source rather than typed here. */
function currentStats() {
  const source = readFileSync(path.join(root, "game/build-components.mjs"), "utf8");
  const block = source.slice(source.indexOf("const STATS = ["));
  // Anchored on the opening brace. A bare `n:` also matches the `en:` label on
  // the same line, which silently reads the tile's caption as its number.
  const numbers = [...block.slice(0, block.indexOf("];")).matchAll(/\{\s*n:\s*"([^"]+)"/g)];
  return numbers.map((m) => m[1]);
}

const [tileRepos, tileTests, , , tilePrs] = currentStats();

console.log("Per repo, merged pull requests:\n");
for (const [name, count] of perRepo.sort((a, b) => b[1] - a[1])) {
  console.log(`  ${name.padEnd(24)} ${count}`);
}

console.log(`\n  ${"public repos".padEnd(24)} ${publicRepos.length}`);
console.log(`  ${"merged pull requests".padEnd(24)} ${merged}`);

const problems = [];
if (String(publicRepos.length) !== tileRepos) {
  problems.push(`repos: tile says ${tileRepos}, the API says ${publicRepos.length}`);
}

/*
 * The merged-PR tile cannot be exact, and chasing the last one is a trap.
 *
 * It holds the count *after* the pull request carrying it lands, so while that
 * pull request is open it reads one ahead of the API. And this number lives on
 * two surfaces, here and the portfolio, which land one after the other: the
 * second one to merge leaves the first one behind by one. Correcting that costs
 * another pull request, which moves the count again, which leaves it behind by
 * one. There is no fixed point.
 *
 * So the band is plus or minus one, and it is a band on purpose. Ten behind is
 * the drift worth catching, which is what this was actually at. A check that
 * fails every single session is a check people stop reading.
 */
const ahead = Number(tilePrs) - merged;
if (ahead > 1 || ahead < -1) {
  problems.push(
    `merged PRs: tile says ${tilePrs}, the API says ${merged}, which is ` +
      `${Math.abs(ahead)} out. The tile should be ${merged} or ${merged + 1}.`,
  );
}

console.log(
  `\nTests are not counted here. Four languages, and two suites need a live ` +
    `Postgres,\nso a number this script could produce would be a number that ` +
    `silently skipped things.\nRun them and set the tile by hand. It currently ` +
    `says ${tileTests}.`,
);

if (problems.length > 0) {
  console.error("\nDrift:\n");
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}

console.log("\nTiles agree with the API.");
