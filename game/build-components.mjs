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

/* GitHub renders these as <img>, which will not load a webfont, so the SVGs
   use system stacks that sit closest to the site's Archivo and Space Mono. The
   palette carries the identity here; the exact typeface cannot. */
const MONO = 'ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace';
const SANS = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, sans-serif';

/* Canvas, the same system as arsalanrc.github.io. Panels are glass over sky,
   so every component carries its own sky and the strip of them reads as one
   continuous surface rather than as cards dropped on GitHub's white. */
const THEME = {
  dark: {
    sky: ["#070E17", "#0B1622", "#12212F", "#1A2E3F"],
    glass: "#FFFFFF", glassOpacity: 0.055, line: "#FFFFFF", lineOpacity: 0.13,
    text: "#EAF1F7", dim: "#9FB6C6", faint: "#6C879A",
    accent: "#FF6A3D", accent2: "#4FA6F0", glow: 0.28,
  },
  light: {
    sky: ["#4E9BD9", "#6FB2E6", "#97CBEF", "#B9DEF6"],
    glass: "#FFFFFF", glassOpacity: 0.68, line: "#15202B", lineOpacity: 0.13,
    text: "#15202B", dim: "#4B6274", faint: "#8FA9BC",
    accent: "#E8552B", accent2: "#2B8FEA", glow: 0.72,
  },
};

/* The sky, as three stacked gradient layers, matching the CSS on the site: a
   sun glow top right, a cool wash bottom left, and a vertical ramp. Each SVG
   gets its own copy with a unique id so two of them on one page cannot collide. */
let skyId = 0;
function sky(t, w, h, rx = 0) {
  const id = `s${++skyId}`;
  return `
    <defs>
      <linearGradient id="ramp-${id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${t.sky[0]}"/><stop offset="0.42" stop-color="${t.sky[1]}"/>
        <stop offset="0.78" stop-color="${t.sky[2]}"/><stop offset="1" stop-color="${t.sky[3]}"/>
      </linearGradient>
      <radialGradient id="sun-${id}" cx="0.82" cy="-0.18" r="1.1">
        <stop offset="0" stop-color="#FFFFFF" stop-opacity="${t.glow}"/>
        <stop offset="0.42" stop-color="#FFFFFF" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${w}" height="${h}" rx="${rx}" fill="url(#ramp-${id})"/>
    <rect width="${w}" height="${h}" rx="${rx}" fill="url(#sun-${id})"/>`;
}

/* A glass panel: translucent fill, hairline edge, and a highlight along the top
   where light would catch a real pane. The third part is what stops it reading
   as a flat translucent box. */
function glass(t, x, y, w, h, rx = 14) {
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"
          fill="${t.glass}" fill-opacity="${t.glassOpacity}"
          stroke="${t.line}" stroke-opacity="${t.lineOpacity}"/>
    <path d="M${x + rx} ${y + 0.75} H${x + w - rx}" stroke="#FFFFFF"
          stroke-opacity="${t.glassOpacity > 0.3 ? 0.85 : 0.14}" stroke-width="1.5"/>`;
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// ------------------------------------------------------------------ stats

// Counted, not estimated. Tests is the sum across the public repos
// (47 chess-engine + 28 integration-patterns + 86 recon + 41 pg-outbox +
// 61 stylo); merged PRs is the sum over every repo on the account, from
// gh api. Last counted 2026-07-31.
//
// The merged-PR tile counts itself. Updating it is a pull request, so a number
// read from the API and committed is already one short by the time it merges,
// and the session that ships two other things is three short. So the value here
// is the count *after* the pull request carrying it lands, not the count when it
// was read. Anyone reconciling this against `gh api` on a quiet day will find it
// correct; anyone checking mid-session will find it one high, which is the right
// way round for a number nobody should be rounding down.
const STATS = [
  { n: "8",    en: "PUBLIC REPOS",  de: "ÖFFENTLICHE REPOS", accent: false },
  { n: "263",  en: "TESTS PASSING", de: "TESTS GRÜN",        accent: true  },
  { n: "0",    en: "RUNTIME DEPS",  de: "ABHÄNGIGKEITEN",    accent: true  },
  { n: "100%", en: "COMMUNITY STD", de: "COMMUNITY STANDARD", accent: false },
  { n: "27",   en: "MERGED PRS",    de: "GEMERGTE PRS",       accent: false },
];

function stats(t, lang) {
  const W = 1000, H = 132, gap = 12, pad = 18;
  const tw = (W - pad * 2 - gap * (STATS.length - 1)) / STATS.length;

  const tiles = STATS.map((s, i) => {
    const x = pad + i * (tw + gap);
    const colour = s.accent ? t.accent : t.text;
    return `
      <g transform="translate(${x} 0)">
        ${glass(t, 0, 0, tw, H, 12)}
        <text x="${tw / 2}" y="74" text-anchor="middle" font-family='${SANS}'
              font-size="44" font-weight="800" letter-spacing="-1.5" fill="${colour}">${esc(s.n)}</text>
        <text x="${tw / 2}" y="102" text-anchor="middle" font-family='${MONO}'
              font-size="10.5" letter-spacing="2.2" fill="${t.faint}">${esc(s[lang])}</text>
      </g>`;
  }).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H + pad * 2}" width="${W}" height="${H + pad * 2}"
    role="img" aria-label="${STATS.map((s) => `${s.n} ${s[lang].toLowerCase()}`).join(", ")}">
    <title>Profile statistics</title>
    ${sky(t, W, H + pad * 2)}
    <g transform="translate(0 ${pad})">${tiles}</g>
  </svg>\n`;
}

// ------------------------------------------------------------------ stack

// Python moved up when recon went live on 2026-07-30, Java when pg-outbox went
// live the same day. A language only sits in the top row once there is
// something public written in it, which is the whole point of the row.
const STACK = [
  { en: "SHIPPING TODAY", de: "IM EINSATZ", items: ["TypeScript", "Python", "Java", "JavaScript", "Node.js", "PostgreSQL"] },
  { en: "DAY JOB", de: "IM BERUF", items: ["Python", "SQL", "Bash", "Supabase", "REST", "Webhooks"] },
  { en: "NEXT ON THE PLAN", de: "ALS NÄCHSTES GEPLANT", items: ["Rust", "C++", "C", "C#"], muted: true },
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
          <rect width="${w}" height="30" rx="15"
                fill="${row.muted ? "none" : t.glass}" fill-opacity="${row.muted ? 0 : t.glassOpacity}"
                stroke="${t.line}" stroke-opacity="${t.lineOpacity}"
                stroke-dasharray="${row.muted ? "4 3" : "0"}"/>
          <text x="${w / 2}" y="20" text-anchor="middle" font-family='${MONO}' font-size="12.5"
                fill="${row.muted ? t.faint : t.text}">${esc(label)}</text>
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
    ${sky(t, W, H)}${rows}
  </svg>\n`;
}

// ------------------------------------------------------------------ cards

const CARDS = [
  { id: "stylo", title: "stylo", lang: "TypeScript",
    blurb: ["Nineteen measurements of a text,", "against a measured human corpus."],
    blurbDe: ["Neunzehn Messungen an einem Text,", "gegen ein gemessenes Korpus."],
    meta: "61 tests · 0 deps · no verdict, ever",
    metaDe: "61 Tests · 0 Abhängigkeiten · nie ein Urteil", accent: true },
  { id: "outbox", title: "pg-outbox", lang: "Java · Postgres",
    blurb: ["Commit a row and publish an event", "without them coming apart."],
    blurbDe: ["Eine Zeile committen und ein Event", "senden, ohne dass beides zerfällt."],
    meta: "41 tests · 0 deps · Java 17 and 21",
    metaDe: "41 Tests · 0 Abhängigkeiten · Java 17 und 21", accent: true },
  { id: "recon", title: "recon", lang: "Python",
    blurb: ["Two systems disagree. Which of those", "disagreements are actually real."],
    blurbDe: ["Zwei Systeme widersprechen sich. Welche", "Widersprüche davon wirklich zählen."],
    meta: "86 tests · 0 deps · streams from Postgres",
    metaDe: "86 Tests · 0 Abhängigkeiten · streamt aus Postgres", accent: false },
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
    ${sky(t, W, H)}
    ${glass(t, 14, 14, W - 28, H - 28, 12)}
    <rect x="14" y="14" width="3.5" height="${H - 28}" rx="1.75" fill="${accent}"/>
    <text x="36" y="52" font-family='${SANS}' font-size="22" font-weight="800"
          letter-spacing="-0.6" fill="${t.text}">${esc(c.title)}</text>
    <text x="36" y="74" font-family='${MONO}' font-size="10.5" letter-spacing="2"
          fill="${accent}">${esc(c.lang.toUpperCase())}</text>
    ${(lang === 'de' ? c.blurbDe : c.blurb).map((line, i) =>
      `<text x="36" y="${108 + i * 21}" font-family='${SANS}' font-size="14"
             fill="${t.dim}">${esc(line)}</text>`).join("")}
    <line x1="36" y1="152" x2="${W - 36}" y2="152" stroke="${t.line}" stroke-opacity="${t.lineOpacity}"/>
    <text x="36" y="171" font-family='${MONO}' font-size="10.5"
          fill="${t.faint}">${esc(lang === 'de' ? c.metaDe : c.meta)}</text>
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
