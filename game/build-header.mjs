/**
 * The profile header, in the Canvas system.
 *
 * Hand-built rather than pulled from a stats widget: nothing here can
 * rate-limit or go offline, and nobody else's profile has it.
 *
 * Animation is plain CSS inside the SVG. GitHub renders this as an <img>,
 * which blocks scripts but still runs CSS keyframes, so the motion survives.
 * The blinking caret is the only motion, and it is disabled under
 * prefers-reduced-motion at the bottom.
 */
import { writeFileSync } from "node:fs";

const MONO = 'ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace';
const SANS = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, sans-serif';

const THEME = {
  light: { sky: ["#4E9BD9", "#6FB2E6", "#97CBEF", "#B9DEF6"], glow: 0.72,
           glassOp: 0.60, lineOp: 0.16, text: "#15202B", dim: "#31465A",
           faint: "#5B7186", accent: "#E8552B", select: "#2B8FEA", cloud: 0.85 },
  dark:  { sky: ["#070E17", "#0B1622", "#12212F", "#1A2E3F"], glow: 0.28,
           glassOp: 0.07, lineOp: 0.14, text: "#EAF1F7", dim: "#9FB6C6",
           faint: "#6C879A", accent: "#FF6A3D", select: "#4FA6F0", cloud: 0.12 },
};

const W = 1280, H = 340;

function header(t) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"
  role="img" aria-label="Arsalan Khadim, software architect and full-stack engineer">
  <title>Arsalan Khadim, software architect and full-stack engineer</title>

  <defs>
    <linearGradient id="ramp" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${t.sky[0]}"/><stop offset="0.42" stop-color="${t.sky[1]}"/>
      <stop offset="0.78" stop-color="${t.sky[2]}"/><stop offset="1" stop-color="${t.sky[3]}"/>
    </linearGradient>
    <radialGradient id="sun" cx="0.82" cy="-0.18" r="1.1">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="${t.glow}"/>
      <stop offset="0.42" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>
    <filter id="soft" x="-30%" y="-60%" width="160%" height="260%">
      <feGaussianBlur stdDeviation="16"/>
    </filter>
    <clipPath id="frame"><rect width="${W}" height="${H}" rx="14"/></clipPath>
    <style>
      /* The caret. The only motion, and it earns it because the name is set
         in mono and reads as something being typed. Everything else is still
         on purpose: drifting particles read as filler however well made. */
      .caret { animation: blink 1.15s steps(1) infinite; }
      @keyframes blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
      @media (prefers-reduced-motion: reduce) { .caret { animation: none; } }
    </style>
  </defs>

  <g clip-path="url(#frame)">
    <rect width="${W}" height="${H}" fill="url(#ramp)"/>
    <rect width="${W}" height="${H}" fill="url(#sun)"/>

    <!-- Clouds, the same two-depth idea as the site, blurred ellipses. -->
    <g fill="#FFFFFF" opacity="${t.cloud}" filter="url(#soft)">
      <ellipse cx="180" cy="248" rx="150" ry="26"/>
      <ellipse cx="250" cy="232" rx="90"  ry="22"/>
      <ellipse cx="1080" cy="92" rx="130" ry="24"/>
      <ellipse cx="1010" cy="80" rx="80"  ry="19"/>
    </g>

    <!-- A glass pane holding the name block, so the header uses the same
         surface language as every card below it. -->
    <rect x="56" y="72" width="700" height="196" rx="16"
          fill="#FFFFFF" fill-opacity="${t.glassOp}"
          stroke="${t.text}" stroke-opacity="${t.lineOp}"/>
    <path d="M72 72.75 H740" stroke="#FFFFFF" stroke-opacity="${t.glassOp > 0.3 ? 0.85 : 0.16}" stroke-width="1.5"/>

    <rect x="88" y="104" width="46" height="4" rx="2" fill="${t.accent}"/>

    <text x="88" y="168" font-family='${SANS}' font-size="58" font-weight="800"
          letter-spacing="-2" fill="${t.text}">Arsalan Khadim</text>
    <rect class="caret" x="528" y="128" width="13" height="46" fill="${t.accent}"/>

    <text x="90" y="204" font-family='${MONO}' font-size="14" letter-spacing="3.4"
          fill="${t.dim}">SOFTWARE ARCHITECT &#183; FULL-STACK ENGINEER</text>
    <text x="90" y="234" font-family='${MONO}' font-size="12.5" letter-spacing="1.6"
          fill="${t.faint}">Interface to integration &#183; TypeScript &#183; Python &#183; Java</text>

    <!-- The wire and nodes, kept from the first header: a small system diagram,
         which is the subject of the whole profile. -->
    <g stroke="${t.text}" stroke-opacity="0.28" fill="none" stroke-width="1.5">
      <path d="M812 250 L960 250 L1040 150 L1170 118"/>
      <path d="M1040 150 L1128 236"/>
    </g>
    <g>
      <circle cx="1040" cy="150" r="15" fill="#FFFFFF" fill-opacity="${t.glassOp}"
              stroke="${t.text}" stroke-opacity="0.3" stroke-width="2"/>
      <circle cx="1040" cy="150" r="6" fill="${t.accent}"/>
      <circle cx="1170" cy="118" r="15" fill="#FFFFFF" fill-opacity="${t.glassOp}"
              stroke="${t.text}" stroke-opacity="0.3" stroke-width="2"/>
      <circle cx="1128" cy="236" r="15" fill="#FFFFFF" fill-opacity="${t.glassOp}"
              stroke="${t.text}" stroke-opacity="0.3" stroke-width="2"/>
      <circle cx="1128" cy="236" r="6" fill="${t.select}"/>
    </g>
    <rect x="812" y="246" width="34" height="7" rx="3.5" fill="${t.accent}"/>
  </g>
</svg>
`;
}

for (const [name, t] of Object.entries(THEME)) {
  writeFileSync(new URL(`../assets/header-${name}.svg`, import.meta.url), header(t));
}
console.log("wrote header-light.svg and header-dark.svg");
