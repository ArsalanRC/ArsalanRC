/**
 * Builds the profile README as one continuous page.
 *
 * The brief was that the README should look like a single designed page rather
 * than a strip of images with markdown and white space between them. That is
 * achievable, and this is what it costs and how it is paid for.
 *
 * **The sky is one gradient, sliced.** Every panel renders the slice of a single
 * page-tall gradient belonging at its own vertical offset, in page coordinates.
 * So the seam between two stacked panels is invisible: the colour on both sides
 * of it is the colour that belongs there. That is why this file exists at all
 * rather than each component drawing its own background. PAGE_H has to be the
 * real total or the banding shifts, so it is measured in a first pass rather
 * than estimated.
 *
 * **Links survive.** Panels that need to be clickable are separate images, each
 * wrapped in its own <a> in the markdown. That is why the try-it list is five
 * images rather than one.
 *
 * **Accessibility survives, but only because of alt text.** Once prose is a
 * picture, the alt attribute is the only thing a screen reader has. Every panel
 * here carries its full text as alt. If you add a panel, write the alt.
 *
 * What is genuinely lost, and there is no way around it: the prose is no longer
 * selectable, searchable or reflowable. On a narrow phone the panels scale down
 * and the body copy gets small. That was the trade accepted deliberately.
 */

import { writeFileSync } from "node:fs";
import { THEME, prose, tryRow, linkTile, stats, statsAlt, stack, card, CARDS } from "./build-components.mjs";
import { header, HEADER_THEME, HEADER_H } from "./build-header.mjs";

const OUT = new URL("../assets/page/", import.meta.url);
import { mkdirSync } from "node:fs";
mkdirSync(OUT, { recursive: true });

const PROFILE_LINKS = [
  { icon: "portfolio", label: "Portfolio", url: "arsalanrc.github.io",
    href: "https://arsalanrc.github.io" },
  { icon: "linkedin", label: "LinkedIn", url: "linkedin.com/in/muhammad-arsalan-khadim",
    href: "https://www.linkedin.com/in/muhammad-arsalan-khadim-b87550259/" },
  { icon: "github", label: "GitHub", url: "github.com/ArsalanRC",
    href: "https://github.com/ArsalanRC" },
];

const LINKEDIN = "https://www.linkedin.com/in/muhammad-arsalan-khadim-b87550259/";

/* ------------------------------------------------------------------ copy -- */

const COPY = {
  en: {
    intro: {
      paras: [
        { lead: "Software architect and full-stack engineer.",
          text: "Currently Software Development Manager, which means I own the systems and the roadmap as well as a fair share of the commits." },
        { text: "Most of my working life goes on the unglamorous half of software: getting systems to exchange data reliably when they were never designed to talk to each other at all. Warehouse management, ERP integrations, logistics APIs. The kind of code where nothing appears to go wrong and somebody's delivery quietly does not arrive." },
        { text: "The repos here are the other half. Same problems, designed from scratch, with the time to get the structure right before anything is built on top of it." },
      ],
    },
    tryEyebrow: "TRY SOMETHING OF MINE, RIGHT NOW",
    tryTitle: "No install, no sign-up",
    rows: [
      { href: "https://arsalanrc.github.io/chess-engine/", label: "Play my chess engine",
        desc: "A minimax bot with alpha-beta pruning, and the engine's internal state on display beside the board" },
      { href: "https://arsalanrc.github.io/integration-patterns/", label: "See how integration-patterns works",
        desc: "Send the same webhook twice and watch the second one do nothing, then watch a retry storm finish off a recovering service" },
      { href: "https://arsalanrc.github.io/recon/", label: "Watch recon reconcile two exports",
        desc: "Six rows, and a switch that turns tolerances on and off. Same rows, six findings or four" },
      { href: "https://arsalanrc.github.io/pg-outbox/", label: "Kill a process mid-transaction",
        desc: "Three ways to publish an event, and the two that leave the database and the broker disagreeing" },
      { href: "https://arsalanrc.github.io/stylo/", label: "Measure your own writing",
        desc: "Nineteen features of a text, each against a human corpus. It will not tell you who wrote it, and it says why" },
    ],
    workEyebrow: "SELECTED WORK",
    workTitle: "Eight repositories, all of them running",
    howEyebrow: "APPROACH",
    howTitle: "How I think about building",
    how: [
      { lead: "Draw the boundaries first.", text: "Where the layers divide is the one decision that is expensive to change once code sits on top of it. Everything else can be rewritten in an afternoon, so this is the part that gets the time." },
      { lead: "Keep the core free of the framework.", text: "Business logic that does not import anything can be tested without a browser, a server or a database. Push the side effects out to the edges and the middle stays simple enough to reason about." },
      { lead: "Secure before there is data.", text: "Row-level security is switched on before the table has a single row, and every policy denies by default. A permission you never granted is not one that can leak." },
      { lead: "Write it down.", text: "Every project I own has its architecture and conventions documented, so that somebody new, or a language model, can read it without context and do useful work within the hour." },
    ],
    stackEyebrow: "STACK",
    footEyebrow: "ELSEWHERE",
    footTitle: "Get in touch",
    foot: [
      { text: "LinkedIn is the best way to reach me. The portfolio at arsalanrc.github.io shows the same work with the demos running on the page." },
      { text: "Built by hand, no template. This page and the portfolio share one design system." },
    ],
  },

  de: {
    intro: {
      paras: [
        { lead: "Softwarearchitekt und Full-Stack-Engineer.",
          text: "Aktuell Software Development Manager, das heißt, mir gehören die Systeme und die Roadmap, dazu ein ordentlicher Teil der Commits." },
        { text: "Der größte Teil meiner Arbeit liegt auf der unglamourösen Hälfte der Softwareentwicklung: Systeme dazu bringen, zuverlässig Daten auszutauschen, obwohl sie nie füreinander gedacht waren. Lagerverwaltung, ERP-Integrationen, Logistik-APIs. Die Sorte Code, bei der scheinbar nichts schiefgeht und eine Lieferung trotzdem still nicht ankommt." },
        { text: "Die Repos hier sind die andere Hälfte. Dieselben Probleme, von Grund auf entworfen, mit der Zeit, die Struktur richtig hinzubekommen, bevor etwas darauf aufbaut." },
      ],
    },
    tryEyebrow: "SOFORT AUSPROBIEREN",
    tryTitle: "Keine Installation, keine Anmeldung",
    rows: [
      { href: "https://arsalanrc.github.io/chess-engine/", label: "Schach-Engine spielen",
        desc: "Ein Minimax-Bot mit Alpha-Beta-Pruning, und der innere Zustand der Engine direkt neben dem Brett" },
      { href: "https://arsalanrc.github.io/integration-patterns/", label: "integration-patterns ansehen",
        desc: "Denselben Webhook zweimal schicken und zusehen, wie der zweite nichts tut, dann einem Retry-Sturm beim Erledigen eines Dienstes zusehen" },
      { href: "https://arsalanrc.github.io/recon/", label: "recon beim Abgleich zusehen",
        desc: "Sechs Zeilen und ein Schalter für die Toleranzen. Dieselben Zeilen, sechs Funde oder vier" },
      { href: "https://arsalanrc.github.io/pg-outbox/", label: "Einen Prozess mitten in der Transaktion abschießen",
        desc: "Drei Wege, ein Event zu veröffentlichen, und die zwei, nach denen Datenbank und Broker sich widersprechen" },
      { href: "https://arsalanrc.github.io/stylo/", label: "Den eigenen Text vermessen",
        desc: "Neunzehn Merkmale eines Textes gegen ein menschliches Korpus. Wer ihn geschrieben hat, sagt es nicht, und es sagt warum" },
    ],
    workEyebrow: "AUSGEWÄHLTE ARBEITEN",
    workTitle: "Acht Repositories, alle im Betrieb",
    howEyebrow: "HALTUNG",
    howTitle: "Wie ich an Bauen herangehe",
    how: [
      { lead: "Zuerst die Grenzen ziehen.", text: "Wo die Schichten getrennt werden, ist die eine Entscheidung, die teuer wird, sobald Code darauf sitzt. Alles andere lässt sich an einem Nachmittag neu schreiben, deshalb bekommt dieser Teil die Zeit." },
      { lead: "Den Kern frei vom Framework halten.", text: "Fachlogik, die nichts importiert, lässt sich ohne Browser, Server und Datenbank testen. Seiteneffekte an den Rand schieben, dann bleibt die Mitte einfach genug, um sie zu durchdenken." },
      { lead: "Sicher, bevor Daten da sind.", text: "Row Level Security ist aktiv, bevor die Tabelle eine einzige Zeile hat, und jede Policy verbietet standardmäßig. Eine Berechtigung, die nie vergeben wurde, kann nicht die undichte Stelle sein." },
      { lead: "Aufschreiben.", text: "Jedes Projekt von mir hat Architektur und Konventionen dokumentiert, damit jemand Neues, oder ein Sprachmodell, ohne Vorwissen einsteigen und binnen einer Stunde sinnvoll arbeiten kann." },
    ],
    stackEyebrow: "STACK",
    footEyebrow: "ANDERSWO",
    footTitle: "Kontakt",
    foot: [
      { text: "Über LinkedIn erreichst du mich am besten. Das Portfolio auf arsalanrc.github.io zeigt dieselbe Arbeit, mit den Demos direkt auf der Seite." },
      { text: "Von Hand gebaut, keine Vorlage. Diese Seite und das Portfolio teilen sich ein Designsystem." },
    ],
  },
};

/* --------------------------------------------------------------- assembly -- */

/* Page width in the shared coordinate system. Every full-width panel is this
   wide; the cards are half of it and say so via offsetX. HEADER_H is imported
   rather than written down: it used to be a literal 340 here while the header
   actually occupied 266 page pixels, which put every panel below it 74px out
   of step with the gradient. */
const PAGE_W = 1000;

/* Two passes. The first measures every panel so PAGE_H is the real total; the
   second renders with each panel's true offset into that total. Estimating the
   height instead would shift the gradient banding and put a visible step at
   every seam, which is the one thing this whole file exists to avoid. */
function layout(t, lang) {
  const c = COPY[lang];
  const panels = [];
  const push = (id, render) => panels.push({ id, render });

  push("intro", (o) => prose(t, { paras: c.intro.paras, lang }, o));
  push("stats", (o) => ({ svg: stats(t, lang, o), H: 168 }));
  push("try", (o) => prose(t, { eyebrow: c.tryEyebrow, title: c.tryTitle, paras: [], lang }, o));
  for (const [i, r] of c.rows.entries()) {
    push(`try-${i}`, (o) => ({ svg: tryRow(t, r, o), H: 68 }));
  }
  push("work", (o) => prose(t, { eyebrow: c.workEyebrow, title: c.workTitle, paras: [], lang }, o));
  push("how", (o) => prose(t, { eyebrow: c.howEyebrow, title: c.howTitle, paras: c.how, lang }, o));
  push("foot", (o) => prose(t, { eyebrow: c.footEyebrow, title: c.footTitle, paras: c.foot, lang }, o));
  PROFILE_LINKS.forEach((l, i) => {
    const last = i === PROFILE_LINKS.length - 1;
    push(`link-${l.icon}`, (o) => ({
      svg: linkTile(t, l, last ? { ...o, rx: 14, round: "bottom" } : o),
      H: 92,
    }));
  });

  // Pass one: heights only.
  let y = HEADER_H;
  const measured = panels.map((p) => {
    const { H } = p.render({ offsetY: 0, pageH: 4000 });
    const entry = { ...p, offsetY: y, H };
    y += H;
    return entry;
  });

  // The cards sit between "work" and "how"; they are 190 tall in a 2-up grid.
  const CARD_H = 190;
  const cardRows = Math.ceil(CARDS.length / 2);
  const workIdx = measured.findIndex((m) => m.id === "work");
  let shift = cardRows * CARD_H;
  for (let i = workIdx + 1; i < measured.length; i++) measured[i].offsetY += shift;

  const stackIdx = measured.findIndex((m) => m.id === "foot");
  const stackH = stack(t, lang, { offsetY: 0, pageH: 4000 }).match(/height="(\d+)"/);
  const sH = stackH ? Number(stackH[1]) : 272;
  for (let i = stackIdx; i < measured.length; i++) measured[i].offsetY += sH;

  const pageH = y + shift + sH;

  return { measured, pageH, cardStart: measured[workIdx].offsetY + measured[workIdx].H, CARD_H, sH,
           stackOffset: measured[stackIdx].offsetY - sH };
}

/* The bands of the page that a glass tile covers, in page coordinates.
 *
 * Only game/audit-clouds.mjs consumes this. It is here rather than there
 * because the offsets come out of layout(), and a copy of them living in
 * another file is a copy that goes stale the first time a panel changes
 * height, which is exactly the failure the audit exists to catch. */
export function pageMap() {
  const t = THEME.light;
  const { measured, pageH, cardStart, CARD_H, sH, stackOffset } = layout(t, "en");
  const at = (id) => measured.find((m) => m.id === id);
  const bands = [];

  /* The header's glass name pane, in art units scaled into page units. The one
     tile on the page that does not run the full width of its panel, so it is
     also the one that needs an x range: the clouds top right sit beside it. */
  const hs = 1000 / 1280;
  bands.push({ id: "header pane", from: 72 * hs, to: 268 * hs,
               fromX: 56 * hs, toX: 756 * hs });

  const s = at("stats");
  bands.push({ id: "stats tiles", from: s.offsetY + 18, to: s.offsetY + 150 });

  for (const m of measured.filter((x) => x.id.startsWith("try-"))) {
    bands.push({ id: m.id, from: m.offsetY + 8, to: m.offsetY + 76 });
  }

  for (let row = 0; row < Math.ceil(CARDS.length / 2); row++) {
    const top = cardStart + row * CARD_H;
    bands.push({ id: `card row ${row + 1}`, from: top + 14, to: top + CARD_H - 14 });
  }

  // Pills run the height of the stack panel, so all of it is taken.
  bands.push({ id: "stack pills", from: stackOffset, to: stackOffset + sH });

  for (const m of measured.filter((x) => x.id.startsWith("link-"))) {
    bands.push({ id: m.id, from: m.offsetY + 10, to: m.offsetY + m.H - 10 });
  }

  return { pageH, bands };
}

let n = 0;
const write = (name, svg) => { writeFileSync(new URL(name, OUT), svg); n++; };

/* Only builds when run directly, so audit-clouds.mjs can import pageMap()
   without triggering a full rebuild as a side effect of the import. */
const isMain = import.meta.url === `file://${process.argv[1]}`;

if (isMain) for (const [themeName, t] of Object.entries(THEME)) {
  for (const lang of ["en", "de"]) {
    const sfx = lang === "en" ? "" : ".de";
    const { measured, pageH, cardStart, CARD_H, stackOffset } = layout(t, lang);

    for (const m of measured) {
      const { svg } = m.render({ offsetY: m.offsetY, pageH });
      write(`${m.id}-${themeName}${sfx}.svg`, svg);
    }

    /* Cards, two per row, each carrying its own slice of the page sky. Odd
       index means the right column, so it starts half a page across. */
    CARDS.forEach((c, i) => {
      const row = Math.floor(i / 2);
      write(`card-${c.id}-${themeName}${sfx}.svg`,
            card(t, c, lang, {
              offsetY: cardStart + row * CARD_H, pageH,
              offsetX: (i % 2) * (PAGE_W / 2), pageW: PAGE_W,
            }));
    });

    write(`stack-${themeName}${sfx}.svg`, stack(t, lang, { offsetY: stackOffset, pageH }));

    /* The header is panel zero of the same page, so it takes offset 0 and the
       real total. Written once per theme rather than per language: it carries
       no translated copy. */
    if (lang === "en") {
      writeFileSync(new URL(`../assets/header-${themeName}.svg`, import.meta.url),
                    header(HEADER_THEME[themeName], { offsetY: 0, pageH }));
      n++;
    }
  }
}

/* ---------------------------------------------------------------- markdown -- */

/* The README itself, emitted here so the panels and the page that references
   them cannot drift apart.
 *
 * No newlines between the <img> tags. A newline between two images becomes a
 * text node, a text node becomes a line box, and a line box becomes a visible
 * white seam across a page whose whole point is not having any. Measured: with
 * the tags adjacent every vertical gap is 0px. */
const LINKS = {
  en: { alt: "Deutsch", altHref: "./README.de.md", self: "English",
        portfolio: "Portfolio", li: "LinkedIn", arena: "Game Arena, in detail" },
  de: { alt: "English", altHref: "./README.md", self: "Deutsch",
        portfolio: "Portfolio", li: "LinkedIn", arena: "Game Arena, im Detail" },
};

function markdown(lang) {
  const sfx = lang === "en" ? "" : ".de";
  const c = COPY[lang];
  const L = LINKS[lang];

  /* align="top" is load-bearing, not decoration.
   *
   * GitHub renders README images as display:inline with vertical-align:baseline,
   * so every panel sits on a text baseline and the descender space under it
   * shows through as a white line. Measured on the live profile: 5.5px at every
   * seam, on a page whose entire point is not having any.
   *
   * display:block would fix it and cannot be set, because GitHub strips <style>
   * and style attributes. The presentational align attribute is on GitHub's
   * sanitizer allowlist for <img> and browsers still map align="top" to
   * vertical-align:top, which takes the gap to 0. Verified in the browser
   * against the live page before committing. Do not remove it. */
  const pic = (name, alt, width = 'width="100%"', href = null) => {
    const img = `<picture><source media="(prefers-color-scheme: dark)" srcset="./assets/page/${name}-dark${sfx}.svg">` +
      `<img alt="${alt.replace(/"/g, "&quot;")}" src="./assets/page/${name}-light${sfx}.svg" ${width} align="top"></picture>`;
    return href ? `<a href="${href}">${img}</a>` : img;
  };

  const head = `<picture><source media="(prefers-color-scheme: dark)" srcset="./assets/header-dark.svg">` +
    `<img alt="Arsalan Khadim, software architect and full-stack engineer" src="./assets/header-light.svg" width="100%" align="top"></picture>`;

  const introAlt = c.intro.paras.map((x) => `${x.lead ? x.lead + " " : ""}${x.text}`).join(" ");
  const howAlt = `${c.howTitle}. ` + c.how.map((x) => `${x.lead} ${x.text}`).join(" ");
  const footAlt = `${c.footTitle}. ` + c.foot.map((x) => x.text).join(" ");

  const parts = [
    head,
    pic("intro", introAlt),
    /* Derived, never retyped. The alt and the tiles drifted apart once already:
       the alt still said 27 merged pull requests when the count was 41. */
    pic("stats", statsAlt(lang)),
    pic("try", `${c.tryEyebrow}. ${c.tryTitle}`),
    ...c.rows.map((r, i) => pic(`try-${i}`, `${r.label}: ${r.desc}`, 'width="100%"', r.href)),
    pic("work", `${c.workEyebrow}. ${c.workTitle}`),
    ...CARDS.map((card, i) => {
      const blurb = (lang === "de" ? card.blurbDe : card.blurb).join(" ");
      const href = card.id === "arena" ? "#game-arena" : `https://github.com/ArsalanRC/${
        { stylo: "stylo", outbox: "pg-outbox", recon: "recon", chess: "chess-engine", patterns: "integration-patterns" }[card.id]}`;
      return pic(`card-${card.id}`, `${card.title}: ${blurb}`, 'width="50%"', href);
    }),
    pic("how", howAlt),
    pic("stack", "Stack. Shipping today: TypeScript, Python, Java, JavaScript, Node.js, PostgreSQL. Day job also: Next.js, Nuxt, React, Tailwind, CSS, SQL, Supabase, REST, Webhooks, Bash. Next on the plan: Rust, C++, C, C#."),
    pic("foot", footAlt),
    ...PROFILE_LINKS.map((l) => pic(`link-${l.icon}`, `${l.label}: ${l.url}`, 'width="100%"', l.href)),
  ];

  return `<!-- Generated by game/build-readme.mjs. Do not hand-edit the panel block.
     The sky is one gradient sliced across the panels, so a stray newline
     between two <img> tags becomes a text node and a visible white seam. -->

${parts.join("")}

**${L.self}** · [${L.alt}](${L.altHref}) &nbsp;·&nbsp; [${L.portfolio}](https://arsalanrc.github.io) &nbsp;·&nbsp; [${L.li}](${LINKEDIN})
`;
}

if (isMain) {
  writeFileSync(new URL("../README.md", import.meta.url), markdown("en"));
  writeFileSync(new URL("../README.de.md", import.meta.url), markdown("de"));
  console.log(`wrote ${n} page panels to assets/page/, plus README.md and README.de.md`);
}
