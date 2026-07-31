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
import { sky } from "./build-components.mjs";

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

/* The art was drawn on a 1280-wide canvas and every other panel is 1000 wide.
 *
 * Both render at width="100%", so 1280 header units and 1000 panel units were
 * the same number of screen pixels and the header was silently at 0.78 scale.
 * Everything positional then disagreed with the page: its clouds were 28% too
 * small and in the wrong place, its share of the sun glow was computed against
 * the wrong width, and build-readme.mjs booked it as 340px of page when it
 * occupies 266, which shifted the gradient under every panel below it. That
 * was the step visible across the header join.
 *
 * Rather than retype twenty coordinates, the canvas keeps its own units and the
 * art is scaled into page space by S. The sky is drawn in page units, so the
 * header now uses the same sky() as everything else and cannot drift from it
 * again. Rendered output is pixel-identical: 1280:340 and 1000:265.625 are the
 * same aspect ratio. */
const ART_W = 1280, ART_H = 340;
const W = 1000;
const S = W / ART_W;
const H = ART_H * S;

/* offsetY/pageH put the header on the same page-tall gradient as every panel
   below it. Without them the header runs the whole ramp inside its own height
   and meets the next panel at a different tone, which shows as a step across
   the join even when the geometry is perfect. */
export function header(t, { offsetY = 0, pageH = H } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"
  role="img" aria-label="Arsalan Khadim, software architect and full-stack engineer">
  <title>Arsalan Khadim, software architect and full-stack engineer</title>

  <defs>
    <!-- Top corners only. Rounding the bottom too would cut the sky away where
         the next panel butts up square, and the page background would show
         through as two notches. -->
    <clipPath id="frame"><path d="M0 14 A14 14 0 0 1 14 0 H${W - 14} A14 14 0 0 1 ${W} 14 V${H} H0 Z"/></clipPath>
    <style>
      /* The caret. The only motion, and it earns it because the name is set
         in mono and reads as something being typed. Everything else is still
         on purpose: drifting particles read as filler however well made. */
      .caret { animation: blink 1.15s steps(1) infinite; }
      @keyframes blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
      @media (prefers-reduced-motion: reduce) { .caret { animation: none; } }
    </style>
  </defs>

  <!-- Panel zero of the page sky, drawn by the same function as every panel
       below it: same gradient, same glow, same clouds, same rounding. -->
  ${sky(t, W, H, { offsetY, pageH, rx: 14, round: "top" })}

  <!-- Clip and scale are separate elements on purpose. A clip-path on the same
       element as a transform is resolved in that element's own space, so the
       two nested keeps the frame in page units and the art in its own. -->
  <g clip-path="url(#frame)"><g transform="scale(${S})">

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
  </g></g>
</svg>
`;
}

export { THEME as HEADER_THEME, H as HEADER_H, W as HEADER_W };

/* Only writes standalone output when run directly. build-readme.mjs imports
   header() instead, because only it knows the true page height. */
if (import.meta.url === `file://${process.argv[1]}`) {
  for (const [name, t] of Object.entries(THEME)) {
    writeFileSync(new URL(`../assets/header-${name}.svg`, import.meta.url), header(t));
  }
  console.log("wrote header-light.svg and header-dark.svg (standalone, no page context)");
}
