/**
 * Generates the README's component images: stat tiles, a tech-stack strip and
 * project cards, in dark and light.
 *
 * Self-hosted rather than fetched from a stats service. Two reasons: nothing
 * here can rate-limit, go down or start showing an advert, and the design
 * matches the rest of the profile instead of announcing which widget was used.
 *
 * The numbers are passed in explicitly rather than scraped at render time,
 * because a README image that silently drifts out of date is worse than one
 * that is obviously a snapshot. Re-run this when they change.
 */

import { writeFileSync, mkdirSync } from "node:fs";

const OUT = new URL("../assets/components/", import.meta.url);
mkdirSync(OUT, { recursive: true });

const MONO = 'ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace';
const SANS = '"Space Grotesk", ui-sans-serif, system-ui, -apple-system, sans-serif';

const THEME = {
  dark:  { bg: "#12151F", panel: "#1A2030", line: "#2C3448", text: "#E8E4DA",
           dim: "#8A90A3", accent: "#E8A33D", accent2: "#5BC8D4" },
  light: { bg: "#F4F1E9", panel: "#FFFFFF", line: "#D8D0BE", text: "#1B2130",
           dim: "#6B6A62", accent: "#9A6410", accent2: "#146273" },
};

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// ------------------------------------------------------------------ stats

// Counted, not estimated. Tests is the sum across the public repos
// (47 chess-engine + 28 integration-patterns + 69 recon); merged PRs is the
// sum over every repo on the account. Last counted 2026-07-30.
const STATS = [
  { n: "6",    en: "PUBLIC REPOS",  de: "ÖFFENTLICHE REPOS", accent: false },
  { n: "144",  en: "TESTS PASSING", de: "TESTS GRÜN",        accent: true  },
  { n: "0",    en: "RUNTIME DEPS",  de: "ABHÄNGIGKEITEN",    accent: true  },
  { n: "100%", en: "COMMUNITY STD", de: "COMMUNITY STANDARD", accent: false },
  { n: "16",   en: "MERGED PRS",    de: "GEMERGTE PRS",       accent: false },
];

function stats(t, lang) {
  const W = 1000, H = 132, gap = 12;
  const tw = (W - gap * (STATS.length - 1)) / STATS.length;

  const tiles = STATS.map((s, i) => {
    const x = i * (tw + gap);
    const colour = s.accent ? t.accent : t.text;
    return `
      <g transform="translate(${x} 0)">
        <rect width="${tw}" height="${H}" rx="8" fill="${t.panel}" stroke="${t.line}"/>
        <text x="${tw / 2}" y="72" text-anchor="middle" font-family='${MONO}'
              font-size="42" font-weight="800" fill="${colour}">${esc(s.n)}</text>
        <text x="${tw / 2}" y="100" text-anchor="middle" font-family='${MONO}'
              font-size="11" letter-spacing="2.2" fill="${t.dim}">${esc(s[lang])}</text>
      </g>`;
  }).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"
    role="img" aria-label="${STATS.map((s) => `${s.n} ${s[lang].toLowerCase()}`).join(", ")}">
    <title>Profile statistics</title>${tiles}
  </svg>\n`;
}

// ------------------------------------------------------------------ stack

// Python moved up to "shipping today" when recon went live on 2026-07-30. A
// language only sits in the top row once there is something public written in
// it, which is the whole point of the row.
const STACK = [
  { en: "SHIPPING TODAY", de: "IM EINSATZ", items: ["TypeScript", "Python", "JavaScript", "Node.js", "PostgreSQL", "React", "Next.js"] },
  { en: "DAY JOB", de: "IM BERUF", items: ["Python", "SQL", "Bash", "Supabase", "REST", "Webhooks"] },
  { en: "NEXT ON THE PLAN", de: "ALS NÄCHSTES GEPLANT", items: ["Java", "Rust", "C++", "C", "C#"], muted: true },
];

function stack(t, lang) {
  const W = 1000, padX = 22, rowH = 92;
  const H = STACK.length * rowH + 16;

  const rows = STACK.map((row, ri) => {
    const y = ri * rowH + 34;
    let x = padX;
    const pills = row.items.map((label) => {
      const w = label.length * 9.2 + 26;
      const pill = `
        <g transform="translate(${x} ${y + 16})">
          <rect width="${w}" height="30" rx="15" fill="${row.muted ? "none" : t.panel}"
                stroke="${row.muted ? t.line : t.line}" stroke-dasharray="${row.muted ? "4 3" : "0"}"/>
          <text x="${w / 2}" y="20" text-anchor="middle" font-family='${MONO}' font-size="13"
                fill="${row.muted ? t.dim : t.text}">${esc(label)}</text>
        </g>`;
      x += w + 9;
      return pill;
    }).join("");

    return `
      <text x="${padX}" y="${y}" font-family='${MONO}' font-size="10.5" letter-spacing="2.4"
            fill="${row.muted ? t.dim : t.accent}">${esc(row[lang])}</text>
      ${pills}`;
  }).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"
    role="img" aria-label="Technology stack">
    <title>Stack</title>
    <rect width="${W}" height="${H}" rx="8" fill="${t.bg}" stroke="${t.line}"/>${rows}
  </svg>\n`;
}

// ------------------------------------------------------------------ cards

const CARDS = [
  { id: "recon", title: "recon", lang: "Python",
    blurb: ["Two systems disagree. Which of those", "disagreements are actually real."],
    blurbDe: ["Zwei Systeme widersprechen sich. Welche", "Widersprüche davon wirklich zählen."],
    meta: "69 tests · 0 deps · 3.10 to 3.13",
    metaDe: "69 Tests · 0 Abhängigkeiten · 3.10 bis 3.13", accent: true },
  { id: "chess", title: "chess-engine", lang: "TypeScript",
    blurb: ["Full FIDE rules and a minimax bot", "with alpha-beta pruning."],
    blurbDe: ["Alle FIDE-Regeln und ein Minimax-Bot", "mit Alpha-Beta-Pruning."],
    meta: "47 tests · 0 deps · playable",
    metaDe: "47 Tests · 0 Abhängigkeiten · spielbar", accent: false },
  { id: "patterns", title: "integration-patterns", lang: "TypeScript",
    blurb: ["Idempotency and retry with full jitter,", "each with the failure it prevents."],
    blurbDe: ["Idempotenz und Retry mit Full Jitter,", "je mit dem Fehler, den sie verhindern."],
    meta: "28 tests · Postgres · animated explainer",
    metaDe: "28 Tests · Postgres · animiert erklärt", accent: false },
  { id: "arena", title: "Game Arena", lang: "Next.js · Supabase",
    blurb: ["28 games, one codebase, one rule:", "game logic never touches React."],
    blurbDe: ["28 Spiele, eine Codebasis, eine Regel:", "Spiellogik fasst React nie an."],
    meta: "940 tests · 23 languages · private",
    metaDe: "940 Tests · 23 Sprachen · privat", accent: false },
];

function card(t, c, lang) {
  const W = 480, H = 190;
  const accent = c.accent ? t.accent : t.accent2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"
    role="img" aria-label="${esc(c.title)}: ${esc((lang === 'de' ? c.blurbDe : c.blurb).join(" "))}">
    <title>${esc(c.title)}</title>
    <rect width="${W}" height="${H}" rx="10" fill="${t.panel}" stroke="${t.line}"/>
    <rect x="0" y="0" width="4" height="${H}" rx="2" fill="${accent}"/>
    <text x="28" y="46" font-family='${MONO}' font-size="21" font-weight="800"
          fill="${t.text}">${esc(c.title)}</text>
    <text x="28" y="70" font-family='${MONO}' font-size="11" letter-spacing="2"
          fill="${accent}">${esc(c.lang.toUpperCase())}</text>
    ${(lang === 'de' ? c.blurbDe : c.blurb).map((line, i) =>
      `<text x="28" y="${106 + i * 22}" font-family='${SANS}' font-size="14.5"
             fill="${t.dim}">${esc(line)}</text>`).join("")}
    <line x1="28" y1="150" x2="${W - 28}" y2="150" stroke="${t.line}"/>
    <text x="28" y="170" font-family='${MONO}' font-size="11.5"
          fill="${t.dim}">${esc(lang === 'de' ? c.metaDe : c.meta)}</text>
  </svg>\n`;
}

// ------------------------------------------------------------------ write

let n = 0;
for (const [name, t] of Object.entries(THEME)) {
  for (const lang of ["en", "de"]) {
    // English keeps the bare filename so existing links stay valid.
    const sfx = lang === "en" ? "" : ".de";
    writeFileSync(new URL(`stats-${name}${sfx}.svg`, OUT), stats(t, lang)); n++;
    writeFileSync(new URL(`stack-${name}${sfx}.svg`, OUT), stack(t, lang)); n++;
    for (const c of CARDS) {
      writeFileSync(new URL(`card-${c.id}-${name}${sfx}.svg`, OUT), card(t, c, lang)); n++;
    }
  }
}
console.log(`wrote ${n} component images to assets/components/`);
