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
import { THEME, prose, tryRow, stats, stack, card, CARDS } from "./build-components.mjs";

const OUT = new URL("../assets/page/", import.meta.url);
import { mkdirSync } from "node:fs";
mkdirSync(OUT, { recursive: true });

const LINKEDIN = "https://www.linkedin.com/in/muhammad-arsalan-khadim-b87550259/";

/* ------------------------------------------------------------------ copy -- */

const COPY = {
  en: {
    intro: {
      paras: [
        { lead: "Software architect and full-stack engineer.",
          text: "Currently Software Development Manager, which means I own the systems and the roadmap along with a fair share of the commits." },
        { text: "Most of my working life goes on the unglamorous half of software: making systems that were never designed to talk to each other exchange data reliably, every day, without anyone noticing. Warehouse management, ERP integrations, logistics APIs. The kind of code where a silent failure costs someone a shipment." },
        { text: "The repos here are the other half, where I get to design something from scratch and take the architecture seriously." },
      ],
    },
    tryEyebrow: "TRY SOMETHING OF MINE, RIGHT NOW",
    tryTitle: "No install, no sign-up",
    rows: [
      { href: "https://arsalanrc.github.io/chess-engine/", label: "Play my chess engine",
        desc: "A minimax bot with alpha-beta pruning, and the engine's internal state on display beside the board" },
      { href: "https://arsalanrc.github.io/integration-patterns/", label: "See how integration-patterns works",
        desc: "Watch a duplicate webhook get absorbed and a retry storm take down a recovering service" },
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
      { lead: "Boundaries before features.", text: "The layer split is the one decision you cannot cheaply undo later, so it deserves the time. Everything else is negotiable." },
      { lead: "Purity where it counts.", text: "Business logic that depends on no framework can actually be tested, reused and reasoned about. Push side effects out to the edges and keep the middle honest." },
      { lead: "Secure by default, not by review.", text: "RLS enabled before the table has rows, and deny-by-default policies throughout. A permission you never granted cannot be the one that leaks." },
      { lead: "Write it down.", text: "Every project I own carries architecture docs and conventions that a new engineer, or an LLM, can read cold and be useful within the hour." },
    ],
    stackEyebrow: "STACK",
    footEyebrow: "ELSEWHERE",
    footTitle: "Get in touch",
    foot: [
      { text: "LinkedIn is the contact route, and the portfolio at arsalanrc.github.io has the same work with the demos embedded." },
      { text: "Built by hand, no template. The design system behind this page and the portfolio is the same one." },
    ],
  },

  de: {
    intro: {
      paras: [
        { lead: "Softwarearchitekt und Full-Stack-Engineer.",
          text: "Aktuell Software Development Manager, das heißt, mir gehören die Systeme und die Roadmap, dazu ein ordentlicher Teil der Commits." },
        { text: "Der größte Teil meiner Arbeit liegt auf der unglamourösen Hälfte der Softwareentwicklung: Systeme, die nie füreinander gedacht waren, jeden Tag zuverlässig Daten austauschen zu lassen, ohne dass es jemandem auffällt. Lagerverwaltung, ERP-Integrationen, Logistik-APIs. Die Sorte Code, bei der ein stiller Fehler jemanden eine Lieferung kostet." },
        { text: "Die Repos hier sind die andere Hälfte, wo ich etwas von Grund auf entwerfen und die Architektur ernst nehmen darf." },
      ],
    },
    tryEyebrow: "SOFORT AUSPROBIEREN",
    tryTitle: "Keine Installation, keine Anmeldung",
    rows: [
      { href: "https://arsalanrc.github.io/chess-engine/", label: "Schach-Engine spielen",
        desc: "Ein Minimax-Bot mit Alpha-Beta-Pruning, und der innere Zustand der Engine direkt neben dem Brett" },
      { href: "https://arsalanrc.github.io/integration-patterns/", label: "integration-patterns ansehen",
        desc: "Ein doppelter Webhook wird abgefangen, und ein Retry-Sturm legt einen sich erholenden Dienst lahm" },
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
      { lead: "Grenzen vor Features.", text: "Der Schnitt zwischen den Schichten ist die eine Entscheidung, die sich später nicht billig zurücknehmen lässt. Alles andere ist verhandelbar." },
      { lead: "Reinheit, wo sie zählt.", text: "Fachlogik ohne Framework-Abhängigkeit lässt sich wirklich testen, wiederverwenden und durchdenken. Seiteneffekte an den Rand schieben und die Mitte ehrlich halten." },
      { lead: "Sicher by default, nicht durch Review.", text: "RLS aktiv, bevor die Tabelle Zeilen hat, und durchgängig Deny-by-default. Eine Berechtigung, die nie vergeben wurde, kann nicht die undichte Stelle sein." },
      { lead: "Aufschreiben.", text: "Jedes Projekt von mir trägt Architekturdokumentation und Konventionen, die ein neuer Mensch, oder ein LLM, kalt lesen und binnen einer Stunde nutzen kann." },
    ],
    stackEyebrow: "STACK",
    footEyebrow: "ANDERSWO",
    footTitle: "Kontakt",
    foot: [
      { text: "LinkedIn ist der Weg, und das Portfolio auf arsalanrc.github.io zeigt dieselbe Arbeit mit eingebetteten Demos." },
      { text: "Von Hand gebaut, keine Vorlage. Hinter dieser Seite und dem Portfolio steht dasselbe Designsystem." },
    ],
  },
};

/* --------------------------------------------------------------- assembly -- */

const HEADER_H = 340;

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

let n = 0;
const write = (name, svg) => { writeFileSync(new URL(name, OUT), svg); n++; };

for (const [themeName, t] of Object.entries(THEME)) {
  for (const lang of ["en", "de"]) {
    const sfx = lang === "en" ? "" : ".de";
    const { measured, pageH, cardStart, CARD_H, stackOffset } = layout(t, lang);

    for (const m of measured) {
      const { svg } = m.render({ offsetY: m.offsetY, pageH });
      write(`${m.id}-${themeName}${sfx}.svg`, svg);
    }

    // Cards, two per row, each carrying its own slice of the page gradient.
    CARDS.forEach((c, i) => {
      const row = Math.floor(i / 2);
      write(`card-${c.id}-${themeName}${sfx}.svg`,
            card(t, c, lang, { offsetY: cardStart + row * CARD_H, pageH }));
    });

    write(`stack-${themeName}${sfx}.svg`, stack(t, lang, { offsetY: stackOffset, pageH }));
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

  const pic = (name, alt, width = 'width="100%"', href = null) => {
    const img = `<picture><source media="(prefers-color-scheme: dark)" srcset="./assets/page/${name}-dark${sfx}.svg">` +
      `<img alt="${alt.replace(/"/g, "&quot;")}" src="./assets/page/${name}-light${sfx}.svg" ${width}></picture>`;
    return href ? `<a href="${href}">${img}</a>` : img;
  };

  const head = `<picture><source media="(prefers-color-scheme: dark)" srcset="./assets/header-dark.svg">` +
    `<img alt="Arsalan Khadim, software architect and full-stack engineer" src="./assets/header-light.svg" width="100%"></picture>`;

  const introAlt = c.intro.paras.map((x) => `${x.lead ? x.lead + " " : ""}${x.text}`).join(" ");
  const howAlt = `${c.howTitle}. ` + c.how.map((x) => `${x.lead} ${x.text}`).join(" ");
  const footAlt = `${c.footTitle}. ` + c.foot.map((x) => x.text).join(" ");

  const parts = [
    head,
    pic("intro", introAlt),
    pic("stats", "8 public repositories, 263 tests passing, 0 runtime dependencies, 100% community standards, 27 merged pull requests"),
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
  ];

  return `<!-- Generated by game/build-readme.mjs. Do not hand-edit the panel block.
     The sky is one gradient sliced across the panels, so a stray newline
     between two <img> tags becomes a text node and a visible white seam. -->

${parts.join("")}

**${L.self}** · [${L.alt}](${L.altHref}) &nbsp;·&nbsp; [${L.portfolio}](https://arsalanrc.github.io) &nbsp;·&nbsp; [${L.li}](${LINKEDIN})
`;
}

writeFileSync(new URL("../README.md", import.meta.url), markdown("en"));
writeFileSync(new URL("../README.de.md", import.meta.url), markdown("de"));

console.log(`wrote ${n} page panels to assets/page/, plus README.md and README.de.md`);
