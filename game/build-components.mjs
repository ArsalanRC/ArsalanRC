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
    /* Card edge and card shadow. On the dark sky the tinted edge does nearly
       all the separating, so it runs stronger and the shadow stays quiet. */
    cardEdge: 0.5, shadow: 0.4,
    /* Cloud opacity. This key was missing until 2026-07-31, which put
       opacity="undefined" on every panel: an invalid value is dropped, so the
       panels drew their clouds at full white while the header, which had the
       key, drew them at 0.12. On the dark sky that is the difference between
       atmosphere and a searchlight, and it made every header seam obvious. */
    cloud: 0.12,
    /* Eyebrow labels are not the accent colour.
       Coral on blue at 10.5px with wide tracking vibrates: the two are close to
       complementary, so the edges shimmer and it is genuinely unpleasant to
       read. White carries the same emphasis without the buzz. On the light sky
       it needs a shadow, because white on pale blue is about 2:1 on its own. */
    label: "#FFFFFF", labelShadow: false,
  },
  light: {
    sky: ["#4E9BD9", "#6FB2E6", "#97CBEF", "#B9DEF6"],
    glass: "#FFFFFF", glassOpacity: 0.68, line: "#15202B", lineOpacity: 0.13,
    text: "#15202B", dim: "#4B6274", faint: "#8FA9BC",
    accent: "#E8552B", accent2: "#2B8FEA", glow: 0.72,
    /* The other way round on the light sky: a real shadow lands there, and a
       saturated edge over pale blue is louder than the bar ever was. */
    cardEdge: 0.42, shadow: 0.16,
    cloud: 0.85,
    label: "#FFFFFF", labelShadow: true,
  },
};

/* The sky, as three stacked gradient layers, matching the CSS on the site: a
   sun glow top right, a cool wash bottom left, and a vertical ramp. Each SVG
   gets its own copy with a unique id so two of them on one page cannot collide. */
/* Positions are fractions of the page, so the same set works whatever the page
   ends up being. Kept sparse and high: this is atmosphere, not weather.
 *
 * A cloud has to sit in a band of open sky, clear of the glass tiles, and the
 * band has to hold the blur as well as the shape. Blur reaches about 3 x
 * stdDeviation, so the vertical room a cloud needs is ry + CLOUD_BLEED, not ry.
 *
 * This is not a style preference, it is the fix for three visible defects. A
 * cloud whose body lands behind a glass tile shows through the tile dimmed and
 * then emerges at full strength the moment the tile ends, and a tile that runs
 * the width of its panel turns that into a hard horizontal line exactly on the
 * seam. Three of the eight clouds did that: one behind the try rows, one behind
 * a project card, one behind the stack rows. They read as the page being cut
 * into strips, which is the one thing this whole build exists to avoid.
 *
 * These fractions move every time a panel changes height, so do not read the
 * numbers here as fixed. Run `node game/audit-clouds.mjs`: it prints the open
 * bands for the page as it currently stands and, for any cloud sitting behind
 * glass, the corrected `cy` to paste back. Adding one try row moved three of
 * them on 2026-08-11. */
const CLOUD_BLEED = 60;

const CLOUDS = [
  { cx: 0.83, cy: 0.0260, rx: 130, ry: 24 },  // header, right of the name pane
  { cx: 0.78, cy: 0.0220, rx: 80,  ry: 18 },  // header, right of the name pane
  { cx: 0.14, cy: 0.0920, rx: 150, ry: 26 },  // across the header/intro seam
  { cx: 0.20, cy: 0.0905, rx: 90,  ry: 21 },  // across the header/intro seam
  { cx: 0.62, cy: 0.1132, rx: 130, ry: 22 },  // intro
  { cx: 0.30, cy: 0.1899, rx: 170, ry: 22 },  // try header
  { cx: 0.88, cy: 0.3706, rx: 140, ry: 18 },  // work header
  { cx: 0.12, cy: 0.6923, rx: 120, ry: 20 },  // how
  { cx: 0.72, cy: 0.8918, rx: 160, ry: 24 },  // foot
];

let skyId = 0;

/* The whole README is one sky, sliced across panels.
 *
 * Each panel draws the slice of a single page-tall gradient that belongs at its
 * own offset, using userSpaceOnUse coordinates in page space rather than 0..1
 * in panel space. Without this every panel restarts the gradient at its top and
 * the strip reads as a stack of separate cards; with it the seams disappear,
 * which is the whole point of the exercise.
 *
 * PAGE_H is the running total of every panel height. It has to be right or the
 * gradient banding shifts, so build-readme.mjs computes it rather than guessing.
 *
 * offsetX/pageW are the same idea across, and they exist for the project cards.
 * Those are the only panels narrower than the page: two sit side by side, each
 * rendered at width="50%". Before this they passed their own width as the page
 * width, so a cloud at 12% of the page was drawn at 12% of a card, twice, once
 * in each card, and neither copy lined up with the panel above or below. The
 * sun glow had the same fault and put a second highlight in the middle of the
 * page. Any panel that is not the full page width has to say where it sits. */
function sky(t, w, h, { offsetY = 0, pageH = h, offsetX = 0, pageW = w, rx = 0, round = null } = {}) {
  const id = `s${++skyId}`;

  /* Corners are a property of the page, not of the panel.
   *
   * Only the first panel rounds its top and only the last rounds its bottom;
   * everything between is square. A panel that rounds all four corners looks
   * right on its own and wrong in a stack: its bottom corners cut the sky away
   * and the page background shows through as two notches against the square
   * top edge of whatever sits below it. */
  /* Clouds live in page coordinates too, for the same reason the gradient does.
     They were previously drawn only inside the header, which brightened its
     bottom-left corner while the panel below it started as plain sky. The join
     matched perfectly on the right, where there was no cloud, and stepped
     visibly on the left, where there was. Anything that paints the sky has to
     be positioned in page space or it will betray the seam. */
  const clouds = CLOUDS.map((c) => {
    const cx = c.cx * pageW - offsetX;
    const cy = c.cy * pageH - offsetY;
    /* Skip clouds whose blur cannot reach this panel, so panels stay small.
       The margin is the blur reach, not zero: a cloud sitting just past the
       edge still tints the panel, and dropping it puts a line on the seam. */
    if (cy + c.ry + CLOUD_BLEED < 0 || cy - c.ry - CLOUD_BLEED > h) return "";
    if (cx + c.rx + CLOUD_BLEED < 0 || cx - c.rx - CLOUD_BLEED > w) return "";
    return `<ellipse cx="${cx}" cy="${cy}" rx="${c.rx}" ry="${c.ry}"/>`;
  }).join("");

  const shape = round === "top"
    ? `M0 ${rx} A${rx} ${rx} 0 0 1 ${rx} 0 H${w - rx} A${rx} ${rx} 0 0 1 ${w} ${rx} V${h} H0 Z`
    : round === "bottom"
    ? `M0 0 H${w} V${h - rx} A${rx} ${rx} 0 0 1 ${w - rx} ${h} H${rx} A${rx} ${rx} 0 0 1 0 ${h - rx} Z`
    : null;
  return `
    <defs>
      <linearGradient id="ramp-${id}" gradientUnits="userSpaceOnUse"
                      x1="0" y1="${-offsetY}" x2="0" y2="${pageH - offsetY}">
        <stop offset="0" stop-color="${t.sky[0]}"/><stop offset="0.42" stop-color="${t.sky[1]}"/>
        <stop offset="0.78" stop-color="${t.sky[2]}"/><stop offset="1" stop-color="${t.sky[3]}"/>
      </linearGradient>
      <filter id="soft-${id}" x="-40%" y="-200%" width="180%" height="500%">
        <feGaussianBlur stdDeviation="18"/>
      </filter>
      <clipPath id="clip-${id}">${shape ? `<path d="${shape}"/>` : `<rect width="${w}" height="${h}"/>`}</clipPath>
      <radialGradient id="sun-${id}" gradientUnits="userSpaceOnUse"
                      cx="${pageW * 0.82 - offsetX}" cy="${-offsetY + pageH * -0.04}" r="${pageH * 0.55}">
        <stop offset="0" stop-color="#FFFFFF" stop-opacity="${t.glow}"/>
        <stop offset="0.62" stop-color="#FFFFFF" stop-opacity="0"/>
      </radialGradient>
    </defs>
    ${shape
      ? `<path d="${shape}" fill="url(#ramp-${id})"/><path d="${shape}" fill="url(#sun-${id})"/>`
      : `<rect width="${w}" height="${h}" fill="url(#ramp-${id})"/><rect width="${w}" height="${h}" fill="url(#sun-${id})"/>`}
    ${clouds ? `<g fill="#FFFFFF" opacity="${t.cloud}" filter="url(#soft-${id})" clip-path="url(#clip-${id})">${clouds}</g>` : ""}`;
}

/* Word wrap for panel prose. Approximate metrics rather than real ones: the
   SVGs use a system stack whose exact face is unknown at build time, so the
   width per character is measured empirically for this size and kept
   conservative. Lines that come out slightly short are invisible; lines that
   overflow the panel are not. */
function labelFill(t) {
  return t.labelShadow
    ? `fill="${t.label}" style="paint-order:stroke" stroke="#2E6EA6" stroke-opacity="0.55" stroke-width="2.5"`
    : `fill="${t.label}"`;
}

function wrapText(text, maxWidth, perChar) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length * perChar > maxWidth && line) { lines.push(line); line = word; }
    else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/* A glass panel: translucent fill, hairline edge, and a highlight along the top
   where light would catch a real pane. The third part is what stops it reading
   as a flat translucent box.
 *
 * `stroke` and `strokeOpacity` override the hairline, and `lift` puts a soft
 * shadow under the panel. Both exist for the project cards, which used to carry
 * a coloured bar down their left edge. The bar did the job of separating the
 * cards and naming them by colour, and it did it by drawing attention to the
 * frame rather than to what is in it. A tinted edge plus a shadow separates them
 * just as well and stops shouting.
 *
 * The shadow is worth more on the light sky than the dark one, where a dark
 * shadow over a dark gradient returns almost nothing. That is why the edge does
 * the work and the shadow only adds depth: one of the two has to carry it in
 * each theme. */
let liftId = 0;

function glass(t, x, y, w, h, rx = 14, o = {}) {
  const stroke = o.stroke ?? t.line;
  const strokeOpacity = o.strokeOpacity ?? t.lineOpacity;
  const id = `l${++liftId}`;
  const shadow = o.lift
    ? `<defs><filter id="lift-${id}" x="-25%" y="-25%" width="150%" height="170%">
         <feDropShadow dx="0" dy="4" stdDeviation="7" flood-color="#03080F"
                       flood-opacity="${t.shadow}"/>
       </filter></defs>`
    : "";
  return `${shadow}
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"
          fill="${t.glass}" fill-opacity="${t.glassOpacity}"
          stroke="${stroke}" stroke-opacity="${strokeOpacity}"
          ${o.lift ? `filter="url(#lift-${id})"` : ""}/>
    <path d="M${x + rx} ${y + 0.75} H${x + w - rx}" stroke="#FFFFFF"
          stroke-opacity="${t.glassOpacity > 0.3 ? 0.85 : 0.14}" stroke-width="1.5"/>`;
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// ------------------------------------------------------------------ stats

// Counted, not estimated. Tests is the sum across the public repos
// (49 chess-engine + 41 integration-patterns + 86 recon + 57 pg-outbox +
// 61 stylo = 294). Re-counted 2026-08-10: pg-outbox gained the retention sweep
// and went 41 to 57, integration-patterns gained the dead-letter queue and went
// 28 to 41. recon needs psycopg and a reachable server, or its 17 Postgres tests
// skip at module level and the total silently reads 275.
//
// Merged PRs is the sum over the PUBLIC repos, read one repo at a time:
//   gh api "repos/ArsalanRC/<repo>/pulls?state=closed&per_page=100" \
//     -q '[.[] | select(.merged_at != null)] | length'
// Do NOT use `search/issues?q=is:pr+is:merged+author:ArsalanRC+user:ArsalanRC`.
// It comes back two higher, because it counts the two archived tutorial repos
// that are private now and are not work anybody should be credited for. That
// query was recorded here as the source once and quietly inflated the tile.
// 77 on 2026-08-11 at the end of the session, before this change. Recounted
// three times that day: 64 at the start, 73 after the glass round, 77 after the
// card recapture and the German card shots. A session that ships a lot needs
// the recount at the END, not only at the beginning.
//
// The merged-PR tile counts itself. Updating it is a pull request, so a number
// read from the API and committed is already one short by the time it merges,
// and the session that ships two other things is three short. So the value here
// is the count *after* the pull request carrying it lands, not the count when it
// was read. Anyone reconciling this against `gh api` on a quiet day will find it
// correct; anyone checking mid-session will find it one high, which is the right
// way round for a number nobody should be rounding down.
//
// enAlt/deAlt exist because the tile labels are abbreviated to fit the tile,
// and "COMMUNITY STD" read aloud is not a phrase. A screen reader gets the
// unabbreviated version; where the two agree the label is used as-is.
const STATS = [
  { n: "14",   en: "PUBLIC REPOS",  de: "ÖFFENTLICHE REPOS", accent: false,
    enAlt: "public repositories", deAlt: "öffentliche Repositories" },
  { n: "1485", en: "TESTS PASSING", de: "TESTS GRÜN",        accent: true,
    enAlt: "tests passing", deAlt: "Tests grün" },
  { n: "0",    en: "RUNTIME DEPS",  de: "ABHÄNGIGKEITEN",    accent: true,
    enAlt: "runtime dependencies", deAlt: "Laufzeit-Abhängigkeiten" },
  { n: "100%", en: "COMMUNITY STD", de: "COMMUNITY STANDARD", accent: false,
    enAlt: "community standards", deAlt: "Community-Standard" },
  { n: "273",  en: "MERGED PRS",    de: "GEMERGTE PRS",       accent: false,
    enAlt: "merged pull requests", deAlt: "gemergte Pull Requests" },
];

/** Spoken form of the stats row, for the README alt and the SVG aria-label. */
export const statsAlt = (lang) => STATS
  .map((s) => `${s.n} ${s[lang === "de" ? "deAlt" : "enAlt"] ?? s[lang].toLowerCase()}`)
  .join(", ");

function stats(t, lang, o = {}) {
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
    role="img" aria-label="${esc(statsAlt(lang))}">
    <title>Profile statistics</title>
    ${sky(t, W, H + pad * 2, o)}
    <g transform="translate(0 ${pad})">${tiles}</g>
  </svg>\n`;
}

// ------------------------------------------------------------------ stack

// Python moved up when recon went live on 2026-07-30, Java when pg-outbox went
// live the same day, Solidity when plinth's contracts went on chain. A language
// only sits in the top row once there is something public written in it, which
// is the whole point of the row. Rust stays in the bottom row until there is:
// a university project that ran out of time is not something to claim.
/*
 * `enAlt` and `deAlt` are the spoken forms, and they are written out rather
 * than derived from the display label. The labels are upper case for the
 * design, and lower-casing them mechanically gives "Im einsatz", which is wrong
 * in German: the noun keeps its capital. Same reason `STATS` carries its own
 * alt strings.
 */
const STACK = [
  { en: "SHIPPING TODAY", de: "IM EINSATZ", enAlt: "Shipping today", deAlt: "Im Einsatz",
    items: ["TypeScript", "Python", "Java", "Solidity", "JavaScript", "Node.js", "PostgreSQL"] },
  { en: "DAY JOB", de: "IM BERUF", enAlt: "Day job also", deAlt: "Im Beruf außerdem",
    items: ["TypeScript", "JavaScript", "Next.js", "Nuxt", "Node.js", "React", "Tailwind", "CSS",
            "Python", "SQL", "PostgreSQL", "Supabase", "REST", "Webhooks", "Bash"] },
  { en: "NEXT ON THE PLAN", de: "ALS NÄCHSTES GEPLANT",
    enAlt: "Next on the plan", deAlt: "Als Nächstes geplant",
    items: ["Rust", "C++", "C", "C#"], muted: true },
];

/**
 * Spoken form of the stack strip, derived from `STACK` rather than retyped.
 *
 * This existed as a hand-written English sentence in `build-readme.mjs` and it
 * had already drifted: Solidity was in the picture and missing from the words,
 * and German readers were served the English list. Same lesson as the stats
 * alt, which is why it now works the same way. When a thing has to appear
 * twice, derive the second one.
 *
 * The day-job row drops anything the shipping row already said. Fifteen pills
 * read aloud is a long sentence, and hearing "TypeScript, JavaScript, Python"
 * twice in it helps nobody.
 */
export const stackAlt = (lang) => {
  const de = lang === "de";
  const shipping = STACK[0].items;

  const rows = STACK.map((row, i) => {
    const items = i === 1 ? row.items.filter((item) => !shipping.includes(item)) : row.items;
    return `${row[de ? "deAlt" : "enAlt"]}: ${items.join(", ")}`;
  });

  return `Stack. ${rows.join(". ")}.`;
};

function stack(t, lang, o = {}) {
  /* Pills wrap. The day-job row carries fifteen of them now, because the real
     answer to "what do you work in" is long, and a row that silently ran off
     the right edge would be worse than an honest three lines. Layout is
     computed first so the SVG height matches what was actually laid out. */
  const W = 1000, padX = 22, lineH = 40, headH = 30, gapY = 18;

  let y = 26;
  const parts = [];

  for (const row of STACK) {
    parts.push(`
      <text x="${padX}" y="${y}" font-family='${MONO}' font-size="10.5" font-weight="700"
            letter-spacing="2.4" ${row.muted ? `fill="${t.faint}"` : labelFill(t)}>${esc(row[lang])}</text>`);
    y += 14;

    let x = padX;
    for (const label of row.items) {
      const w = label.length * 8.6 + 26;
      if (x + w > W - padX) { x = padX; y += lineH; }
      parts.push(`
        <g transform="translate(${x} ${y})">
          <rect width="${w}" height="30" rx="15"
                fill="${row.muted ? "none" : t.glass}" fill-opacity="${row.muted ? 0 : t.glassOpacity}"
                stroke="${t.line}" stroke-opacity="${t.lineOpacity}"
                stroke-dasharray="${row.muted ? "4 3" : "0"}"/>
          <text x="${w / 2}" y="20" text-anchor="middle" font-family='${MONO}' font-size="12.5"
                fill="${row.muted ? t.faint : t.text}">${esc(label)}</text>
        </g>`);
      x += w + 8;
    }
    y += lineH + gapY;
  }

  const H = y - gapY + 8;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"
    role="img" aria-label="Technology stack">
    <title>Stack</title>
    ${sky(t, W, H, o)}${parts.join("")}
  </svg>\n`;
}

// ------------------------------------------------------------------ cards

/* CARDS must stay EVEN.
 *
 * They render two per row at width="50%". An odd count leaves the last row
 * half empty, and because no panel paints that region the page background
 * shows through as a hard black rectangle against the sky. It looks like the
 * README is broken, which is worse than a missing card.
 *
 * This happened on 2026-08-11: adding `slotting` took the count from six to
 * seven and put a hole under the last row on the live profile. The assertion
 * below is why it cannot happen quietly again. If you add one card, add two,
 * or say why the grid changed shape. */
const CARDS = [
  /* siege joined on 2026-08-24 and is wide, which took the grid from eleven
     cards to twelve.

     That was forced rather than chosen. Ten half-width cards plus fanout paired
     exactly; adding an eleventh half-width card leaves a hole, and `cardLayout`
     throws rather than let that ship. The two ways out are to mark another card
     wide or to demote fanout and rewrite its copy for a narrower column, and
     marking the newest repo wide changes nobody else's words.

     The cost is honest: this is a second full-width row, and Arsalan's
     objection on 2026-08-17 was to exactly that shape pushing the grid below
     the fold. If it reads long, demote fanout to half width and rewrap its
     blurb to about forty characters a line. */
  { id: "siege", repo: "siege", title: "siege",
    lang: "TypeScript · Canvas", wide: true,
    blurb: ["Three balls and one castle, and every bounce worked out from scratch."],
    blurbDe: ["Drei Kugeln, eine Burg, und jeder Abprall von Hand gerechnet."],
    meta: "76 tests · 0 deps · no engine, no bundler · playable",
    metaDe: "76 Tests · 0 Abhängigkeiten · ohne Engine · spielbar", accent: true },
  /* Wide, and therefore first, because the layout only allows full-width cards
     at the top and eleven cards cannot be paired otherwise. One announcement
     rather than two: Arsalan's objection on 2026-08-17 was to lounge and plinth
     both taking a whole row, which pushed everything else below the fold.

     It is also the one repo on the account whose subject is an architecture
     rather than a library, which is the positioning the profile is arguing. */
  /* No `page` here on purpose, unlike the lounge card. A card carrying `page`
     drops its [ code ] badge, which is right when the source is private and
     wrong here: fanout is public and the demo already has its own try-it row. */
  { id: "fanout", repo: "fanout", title: "fanout",
    lang: "Java · 2 Services", wide: true,
    blurb: ["Eight suppliers, one shared deadline, and an answer that names whoever did not reply."],
    blurbDe: ["Acht Anbieter, ein gemeinsames Zeitbudget, und eine Antwort, die sagt, wer fehlt."],
    meta: "159 tests · 0 deps · 7 routes · 364 recorded searches",
    metaDe: "159 Tests · 0 Abhängigkeiten · 7 Strecken · 364 Suchen", accent: true },
  /* The two newest, sharing the first row. They were a full-width card each
     until 2026-08-17, when Arsalan asked for them side by side: two of them
     stacked pushed everything else below the fold, and a row of two reads as a
     pair rather than as two announcements. The copy is shorter to match, since
     a half-width card holds about forty characters a line rather than seventy. */
  { id: "lounge", repo: "arena-lounge", page: "https://arsalanrc.github.io/arena-lounge/", title: "Arena Lounge", lang: "Decentraland · TypeScript",
    blurb: ["Fourteen games at twenty-eight tables,", "on four floors, built for phones."],
    blurbDe: ["Vierzehn Spiele an achtundzwanzig", "Tischen, gebaut fürs Handy zuerst."],
    /* Still points at the showcase page rather than the source, and the reason
       changed on 2026-08-22 when the repo went public and the entry went in.
       It is not secrecy any more: this is a world you walk into, so the page
       that shows it beats a directory listing. Nothing else in the README links
       to that page, unlike the repos that have a try-it row of their own.
       The meta carries MIT, so nobody has to infer the source is shut. */
    meta: "561 tests · live in Decentraland · MIT",
    metaDe: "561 Tests · live in Decentraland · MIT", accent: true },
  { id: "plinth", repo: "plinth", title: "plinth", lang: "Solidity · Polygon",
    blurb: ["An NFT marketplace with the art", "drawn on chain, and no library."],
    blurbDe: ["Ein NFT-Marktplatz, Grafik on", "chain, Frontend ohne Library."],
    meta: "201 tests · 13 mutations · mint, list, buy",
    metaDe: "201 Tests · 13 Mutationen · minten, kaufen", accent: true },
  { id: "slotting", repo: "slotting", title: "slotting", lang: "Python",
    blurb: ["The picker walks one route, not many.", "Frequency ranking cannot see that."],
    blurbDe: ["Eine Tour, nicht viele Einzelwege.", "Häufigkeit sieht das nicht."],
    meta: "50 tests · 0 deps · 7% less walking",
    metaDe: "50 Tests · 0 Abhängigkeiten · 7% weniger Laufweg", accent: true },
  { id: "stylo", repo: "stylo", title: "stylo", lang: "TypeScript",
    blurb: ["Nineteen measurements of a text,", "each against real human writing."],
    blurbDe: ["Neunzehn Messungen an einem Text,", "jede gegen echte menschliche Prosa."],
    meta: "61 tests · 0 deps · no verdict, ever",
    metaDe: "61 Tests · 0 Abhängigkeiten · nie ein Urteil", accent: true },
  { id: "outbox", repo: "pg-outbox", title: "pg-outbox", lang: "Java · Postgres",
    blurb: ["Commit a row and publish an event", "without them coming apart."],
    blurbDe: ["Eine Zeile committen und ein Event", "senden, ohne dass beides zerfällt."],
    meta: "57 tests · 0 deps · Java 17 and 21",
    metaDe: "57 Tests · 0 Abhängigkeiten · Java 17 und 21", accent: true },
  { id: "recon", repo: "recon", title: "recon", lang: "Python",
    blurb: ["Two systems disagree. Telling the real", "differences from the formatting."],
    blurbDe: ["Zwei Systeme widersprechen sich. Echte", "Abweichungen von Formatierung trennen."],
    meta: "86 tests · 0 deps · streams from Postgres",
    metaDe: "86 Tests · 0 Abhängigkeiten · streamt aus Postgres", accent: false },
  { id: "chess", repo: "chess-engine", title: "chess-engine", lang: "TypeScript",
    blurb: ["Full FIDE rules and a minimax bot", "with alpha-beta pruning."],
    blurbDe: ["Alle FIDE-Regeln und ein Minimax-Bot", "mit Alpha-Beta-Pruning."],
    meta: "77 tests · 0 deps · playable",
    metaDe: "77 Tests · 0 Abhängigkeiten · spielbar", accent: false },
  { id: "patterns", repo: "integration-patterns", title: "integration-patterns", lang: "TypeScript",
    blurb: ["Idempotency and retry with full jitter,", "each shown next to what it prevents."],
    blurbDe: ["Idempotenz und Retry mit Full Jitter,", "je neben dem Fehler, den sie verhindern."],
    meta: "50 tests · Postgres · animated explainer",
    metaDe: "50 Tests · Postgres · animiert erklärt", accent: false },
  { id: "rally", repo: "rally", title: "rally", lang: "TypeScript",
    blurb: ["Two browsers, one game, no server.", "Rollback netcode, peer to peer."],
    blurbDe: ["Zwei Browser, ein Spiel, kein Server.", "Rollback-Netcode, Peer-to-Peer."],
    meta: "106 tests · 0 deps · playable",
    metaDe: "106 Tests · 0 Abhängigkeiten · spielbar", accent: false },
  { id: "arena", repo: null, title: "Game Arena", lang: "Next.js · Supabase",
    blurb: ["28 games, one codebase, one rule:", "game logic never touches React."],
    blurbDe: ["28 Spiele, eine Codebasis, eine Regel:", "Spiellogik fasst React nie an."],
    meta: "940 tests · 23 languages · private",
    metaDe: "940 Tests · 23 Sprachen · privat", accent: false },
];

/* Where each card sits, and how wide.
 *
 * Wide cards take a whole row to themselves and must come first, which is what
 * puts the newest repo above everything else. The rest pair up two to a row.
 *
 * This replaces a flat "CARDS must be even" assertion. That rule was right
 * while every card was half width, because an odd count left a visible hole. It
 * is the wrong rule once a card can fill its own row on purpose, so the check
 * below counts only the half-width ones. */
export function cardLayout(cards = CARDS) {
  const firstNarrow = cards.findIndex((c) => !c.wide);
  const wide = firstNarrow === -1 ? cards.length : firstNarrow;

  if (cards.slice(wide).some((c) => c.wide)) {
    throw new Error("Wide cards must come first, or the row maths here is wrong.");
  }

  if ((cards.length - wide) % 2 !== 0) {
    throw new Error(
      `CARDS leaves a hole: ${cards.length - wide} half-width cards after ${wide} ` +
      `full-width one(s) is odd. Add or remove one, or mark another card wide.`
    );
  }

  return cards.map((card, i) => {
    const isWide = i < wide;
    return {
      card,
      wide: isWide,
      row: isWide ? i : wide + Math.floor((i - wide) / 2),
      column: isWide ? 0 : (i - wide) % 2,
    };
  });
}

/** Total rows the card grid occupies. */
export const cardRowCount = (cards = CARDS) =>
  cardLayout(cards).reduce((max, p) => Math.max(max, p.row + 1), 0);

/* Two cards to a row, each rendered at width="50%".
 *
 * W is 500, not 480, so one card unit is one page pixel: two 500-unit cards
 * side by side are the 1000-unit page exactly. At 480 the card was drawn at
 * 1.042 scale, which meant its slice of the page gradient was stretched by 4%
 * against its neighbours and the card rows sat 24px lower than the layout
 * thought they did. The caller passes offsetX so each card knows which half of
 * the page it is; without it both columns paint the same sky. */
function card(t, c, lang, o = {}, wide = false) {
  const W = wide ? 1000 : 500, H = 190;
  const accent = c.accent ? t.accent : t.accent2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"
    role="img" aria-label="${esc(c.title)}: ${esc((lang === 'de' ? c.blurbDe : c.blurb).join(" "))}">
    <title>${esc(c.title)}</title>
    ${sky(t, W, H, o)}
    ${glass(t, 14, 14, W - 28, H - 28, 12, { stroke: accent, strokeOpacity: t.cardEdge, lift: true })}
    <text x="36" y="52" font-family='${SANS}' font-size="22" font-weight="800"
          letter-spacing="-0.6" fill="${t.text}">${esc(c.title)}</text>
    ${c.repo && !c.page ? `<!-- The one thing the page never said out loud: a card is a link
         to source, and a try-it row is a link to something running. The row has
         carried a play triangle since it shipped; this is its opposite number.
         A card that links to a page instead (repo still private) carries no kicker. -->
    <text x="${W - 36}" y="50" text-anchor="end" font-family='${MONO}' font-size="10.5"
          font-weight="700" letter-spacing="1.4" fill="${accent}"
          fill-opacity="0.9">[ code ]</text>` : ""}
    <text x="36" y="74" font-family='${MONO}' font-size="10.5" font-weight="700"
          letter-spacing="2" fill="${t.dim}">${esc(c.lang.toUpperCase())}</text>
    ${(lang === 'de' ? c.blurbDe : c.blurb).map((line, i) =>
      `<text x="36" y="${108 + i * 21}" font-family='${SANS}' font-size="14"
             fill="${t.dim}">${esc(line)}</text>`).join("")}
    <line x1="36" y1="152" x2="${W - 36}" y2="152" stroke="${t.line}" stroke-opacity="${t.lineOpacity}"/>
    <text x="36" y="171" font-family='${MONO}' font-size="10.5"
          fill="${t.faint}">${esc(lang === 'de' ? c.metaDe : c.meta)}</text>
  </svg>\n`;
}

// ----------------------------------------------------------------- prose

/* A full-width prose panel. This is what turns the README from a strip of
   images with markdown between them into one continuous page: the copy that
   used to be markdown is rendered into the sky like everything else.
   Every panel gets real alt text on the <img>, which is what keeps it
   readable to a screen reader once the text is no longer text. */
export function prose(t, { eyebrow, title, paras, lang }, o = {}) {
  const W = 1000, padX = 44;
  const maxW = W - padX * 2;

  let y = 0;
  const parts = [];

  if (eyebrow) {
    y += 58;
    parts.push(`<text x="${padX}" y="${y}" font-family='${MONO}' font-size="10.5"
      font-weight="700" letter-spacing="2.4" ${labelFill(t)}>${esc(eyebrow)}</text>`);
  }
  if (title) {
    y += 46;
    parts.push(`<text x="${padX}" y="${y}" font-family='${SANS}' font-size="34"
      font-weight="800" letter-spacing="-1" fill="${t.text}">${esc(title)}</text>`);
    y += 16;
  }

  for (const para of paras) {
    y += 26;
    const lead = para.lead ? `${para.lead} ` : "";
    const lines = wrapText(lead + para.text, maxW, 7.7);
    for (const [i, line] of lines.entries()) {
      /* The lead phrase is bold and sits inline, so the first line is drawn as
         two runs rather than one. */
      if (i === 0 && para.lead) {
        parts.push(`<text x="${padX}" y="${y}" font-family='${SANS}' font-size="15.5" fill="${t.dim}">
          <tspan font-weight="700" fill="${t.text}">${esc(para.lead)}</tspan>${esc(line.slice(para.lead.length))}</text>`);
      } else {
        parts.push(`<text x="${padX}" y="${y}" font-family='${SANS}' font-size="15.5"
          fill="${t.dim}">${esc(line)}</text>`);
      }
      y += 25;
    }
    y += 6;
  }

  const H = Math.round(y + 40);
  return { svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"
    role="img" aria-label="${esc(title || eyebrow || "")}">
    <title>${esc(title || eyebrow || "")}</title>
    ${sky(t, W, H, o)}${parts.join("")}
  </svg>\n`, H };
}

/* One clickable row for the try-it-now list. Each is its own image inside its
 * own <a>, which is how the page keeps working links while being made of
 * pictures.
 *
 * Two to a row since 2026-08-11, same as the cards. Five full-width rows made
 * the most important block on the page the longest scroll on it, and the demos
 * are the thing a recruiter is most likely to click.
 *
 * Unlike the cards, an odd count is fine here, and it has to be: the number of
 * live demos is whatever it is, and there were seven the day rally shipped.
 * `wide` renders the last one at the full page width rather than leaving half a
 * row with nothing painting it, which is the exact defect the card grid hit. It
 * reads well too, because the odd one out is the newest thing.
 *
 * Half the width means the description wraps, so it is wrapped here rather than
 * trusted to fit. TRY_ROW_LINES is the ceiling: a description that needs three
 * lines overflows the tile silently, which is why it throws instead. */
export const TRY_ROW_H = 104;
const TRY_ROW_LINES = 2;

export function tryRow(t, { label, desc }, o = {}, wide = false) {
  /* padX is the same at both widths, and that is the whole point.
   *
   * The wide row used 44 while the grid rows used 30. Both draw their glass at
   * padX - 16, and page units are page pixels either way, so the full-width row
   * sat 14 units further in on the left and 14 short on the right. Against three
   * rows above it with a shared edge, that reads as the layout being broken
   * rather than as a wider tile. Any panel sharing a vertical edge with another
   * has to share its inset. */
  const W = wide ? 1000 : 500, H = TRY_ROW_H, padX = 30;
  const textX = padX + 22;
  const lines = wrapText(desc, W - textX - 28, 6.5);
  if (lines.length > TRY_ROW_LINES) {
    throw new Error(
      `try row "${label}" needs ${lines.length} lines and the tile holds ` +
      `${TRY_ROW_LINES}. Shorten the description: "${desc}"`
    );
  }
  /* The block is centred in the tile rather than pinned to a fixed baseline.
   *
   * Every tile is the same height whether its description wraps to one line or
   * two, so a fixed baseline leaves the one-line tiles top-heavy with a band of
   * empty glass underneath. Sitting next to a two-line neighbour, that reads as
   * two different components. Derived from the line count so the two cases
   * centre on the same axis: 52, the middle of the glass. */
  const labelY = Math.round(45 - (lines.length - 1) * 9.5);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"
    role="img" aria-label="${esc(label)}: ${esc(desc)}">
    <title>${esc(label)}</title>
    ${sky(t, W, H, o)}
    ${glass(t, padX - 16, 10, W - (padX - 16) * 2, H - 20, 12)}
    <text x="${padX}" y="${labelY}" font-family='${SANS}' font-size="16" font-weight="700"
          fill="${t.accent}">&#9654;</text>
    <text x="${textX}" y="${labelY}" font-family='${SANS}' font-size="16" font-weight="700"
          fill="${t.text}">${esc(label)}</text>
    ${lines.map((line, i) =>
      `<text x="${textX}" y="${labelY + 22 + i * 19}" font-family='${SANS}' font-size="13"
             fill="${t.faint}">${esc(line)}</text>`).join("")}
  </svg>\n`;
}

/* A big clickable link tile.
 *
 * These exist because making the page continuous quietly cost the profile its
 * two most important links: the GitHub and LinkedIn badges vanished and the
 * portfolio dropped to a small text row underneath. A footer panel that
 * mentions LinkedIn in prose is not a link, it is a picture of one. Each tile
 * is its own image inside its own <a>, so the page stays continuous and the
 * links come back. */
export function linkTile(t, { label, url, icon }, o = {}) {
  const W = 1000, H = 92, padX = 44;

  const marks = {
    portfolio: `<path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18"
                 fill="none" stroke="${t.text}" stroke-width="1.7"/>`,
    linkedin: `<path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zm1.78 13.02H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" fill="${t.text}"/>`,
    github: `<path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2 0-.4-.5-1.6.2-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.6.2 2.8.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3" fill="${t.text}"/>`,
  };

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"
    role="img" aria-label="${esc(label)}: ${esc(url)}">
    <title>${esc(label)}</title>
    ${sky(t, W, H, o)}
    ${glass(t, padX - 16, 10, W - (padX - 16) * 2, H - 20, 12)}
    <g transform="translate(${padX} ${H / 2 - 12}) scale(1)">${marks[icon] ?? ""}</g>
    <text x="${padX + 40}" y="${H / 2 - 2}" font-family='${SANS}' font-size="17" font-weight="700"
          fill="${t.text}">${esc(label)}</text>
    <text x="${padX + 40}" y="${H / 2 + 18}" font-family='${MONO}' font-size="12"
          fill="${t.faint}">${esc(url)}</text>
    <path d="M${W - padX - 18} ${H / 2 + 6} L${W - padX} ${H / 2 - 6} M${W - padX - 10} ${H / 2 - 6} h10 v10"
          stroke="${t.accent}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  </svg>\n`;
}

export { THEME, sky, glass, stats, stack, card, CARDS, STATS, CLOUDS, CLOUD_BLEED };

// ------------------------------------------------------------------ write

/* Only writes when run directly. Other scripts import the components, and an
   import that writes 32 files as a side effect makes a read-only tool like
   audit-clouds.mjs dirty the working tree just by asking a question. */
if (import.meta.url === `file://${process.argv[1]}`) {
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
}
