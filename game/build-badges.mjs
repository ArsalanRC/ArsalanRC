/**
 * The two link badges under the header, in the Canvas system.
 *
 * Glass over sky, same as every other panel, so the row under the header does
 * not read as a pair of buttons borrowed from somewhere else.
 */
import { writeFileSync } from "node:fs";

const MONO = 'ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace';

const THEME = {
  light: { sky: ["#79BAE8", "#93C8EE"], glassOp: 0.62, lineOp: 0.18,
           text: "#15202B", mark: "#15202B", top: 0.85 },
  dark:  { sky: ["#0E1A26", "#132433"], glassOp: 0.08, lineOp: 0.16,
           text: "#EAF1F7", mark: "#EAF1F7", top: 0.14 },
};

const GITHUB = "M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2 0-.4-.5-1.6.2-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.6.2 2.8.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3";
const LINKEDIN = "M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zm1.78 13.02H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z";

function badge(t, label, path, w) {
  const H = 40;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${H}" width="${w}" height="${H}" role="img" aria-label="${label}">
  <title>${label}</title>
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${t.sky[0]}"/><stop offset="1" stop-color="${t.sky[1]}"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${H}" rx="999" fill="url(#g)"/>
  <rect width="${w}" height="${H}" rx="999" fill="#FFFFFF" fill-opacity="${t.glassOp}"
        stroke="${t.text}" stroke-opacity="${t.lineOp}"/>
  <path d="M14 1 H${w - 14}" stroke="#FFFFFF" stroke-opacity="${t.top}" stroke-width="1.4"/>
  <g transform="translate(15 8)" fill="${t.mark}"><path d="${path}"/></g>
  <text x="49" y="26" fill="${t.text}" font-family='${MONO}' font-size="14.5"
        font-weight="700" letter-spacing="0.3">${label}</text>
</svg>
`;
}

for (const [name, t] of Object.entries(THEME)) {
  writeFileSync(new URL(`../assets/badge-github-${name}.svg`, import.meta.url), badge(t, "GitHub", GITHUB, 132));
  writeFileSync(new URL(`../assets/badge-linkedin-${name}.svg`, import.meta.url), badge(t, "LinkedIn", LINKEDIN, 146));
}
console.log("wrote 4 badge images");
