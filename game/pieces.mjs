/**
 * Piece artwork for the README board, carried over from the chess-engine demo
 * so the game in the profile and the game on the site use the same set.
 *
 * Each board square is rendered as its own SVG file, because a markdown table
 * cell can hold an image but cannot hold a styled shape. That means every
 * combination of (piece, square colour) needs a file: 12 pieces on 2 square
 * colours, plus 2 empty squares, plus highlighted variants.
 */

export const PATHS = {
  P: `
    <circle cx="22.5" cy="12.5" r="5.4"/>
    <path d="M22.5 18.4c-3.6 0-6.2 2-6.2 4.6 0 1.7 1 3 2.4 3.9-3.1 2.2-5.6 5.3-5.6 8.6h18.8c0-3.3-2.5-6.4-5.6-8.6 1.4-.9 2.4-2.2 2.4-3.9 0-2.6-2.6-4.6-6.2-4.6z"/>
    <rect x="10.4" y="35.4" width="24.2" height="4.2" rx="2.1"/>`,
  R: `
    <path d="M10.6 9.5h5.1v3.3h4.3V9.5h5v3.3h4.3V9.5h5.1v8.9H10.6z"/>
    <path d="M13.4 18.4h18.2l-1.7 12.9H15.1z"/>
    <path d="M12.2 31.3h20.6l2.6 4.1H9.6z"/>
    <rect x="8.6" y="35.4" width="27.8" height="4.2" rx="2.1"/>
    <path class="ac" d="M15.1 21.6h14.8"/>`,
  N: `
    <path d="M13.6 39.6c-.4-6.6 1.6-11.2 6.3-14.8-1.3-1.2-2.1-2.7-2-4.4l-3.6 2.4-2-3.5 4.4-3 2.2-5.3 2.6 3.2c1.4-1.6 3.4-2.6 5.9-2.6 6 0 9.8 4.6 10.4 12.3.5 6.3-.3 11.2-1.6 15.7z"/>
    <circle class="hole" cx="18.2" cy="18.6" r="1.25"/>
    <path class="ac" d="M27.4 15.8c2.9 1.1 4.6 3.6 5.1 7.4"/>`,
  B: `
    <circle cx="22.5" cy="6.2" r="2.3"/>
    <path d="M22.5 8.6l5.3 7.8c2.2 3.2 3 5.1 3 6.6 0 2.9-3.7 4.8-8.3 4.8s-8.3-1.9-8.3-4.8c0-1.5.8-3.4 3-6.6z"/>
    <path d="M13.6 28.2h17.8l2.4 3.7-2 3.5H13.2l-2-3.5z"/>
    <rect x="8.6" y="35.4" width="27.8" height="4.2" rx="2.1"/>
    <path class="ac" d="M19 15.6l6.4 7"/>`,
  Q: `
    <circle cx="8.4" cy="12.6" r="2.3"/><circle cx="15.6" cy="8.9" r="2.3"/>
    <circle cx="22.5" cy="7.6" r="2.4"/><circle cx="29.4" cy="8.9" r="2.3"/>
    <circle cx="36.6" cy="12.6" r="2.3"/>
    <path d="M9.2 15.1l3.1 14.4h20.4l3.1-14.4-6.1 6.6-3.6-9.3-3.6 9.6-3.6-9.6-3.6 9.3z"/>
    <path d="M12.3 29.5h20.4l2 5.9H10.3z"/>
    <rect x="8.6" y="35.4" width="27.8" height="4.2" rx="2.1"/>
    <path class="ac" d="M14.4 32.4h16.2"/>`,
  K: `
    <path d="M21.1 3h2.8v3.1H27v2.8h-3.1v3.3h-2.8V8.9H18V6.1h3.1z"/>
    <path d="M13.1 28.8c-1.9-4.4-1.4-8.6 1.3-10.6 2.6-2 5.8-1.1 8.1 1.9 2.3-3 5.5-3.9 8.1-1.9 2.7 2 3.2 6.2 1.3 10.6z"/>
    <path d="M12.6 28.8h19.8l2.2 6.6H10.4z"/>
    <rect x="8.6" y="35.4" width="27.8" height="4.2" rx="2.1"/>
    <path class="ac" d="M22.5 20.9v6.2M16.4 31.9h12.2"/>`,
};

/** Square backgrounds. `sel` and `dest` mark the two interactive states. */
export const SQUARES = {
  light: "#C7C1B3",
  dark: "#3A465E",
  lightSel: "#E8A33D",
  darkSel: "#B9822C",
  lightDest: "#9FC7B8",
  darkDest: "#4E7A6C",
};

/**
 * One square as a standalone SVG.
 *
 * GitHub serves these through its image proxy, which strips nothing relevant
 * but does cache aggressively, so each rendered board appends a cache-busting
 * query string rather than relying on the file changing.
 */
export function squareSVG({ piece, colour, bg }) {
  const fill = colour === "white" ? "#F4F0E6" : "#191F2B";
  const stroke = colour === "white" ? "#8A8172" : "none";
  const accent = colour === "white" ? "rgba(90,80,64,.55)" : "rgba(226,232,244,.42)";
  const hole = colour === "white" ? "#6B6252" : "#C9CEDA";

  const art = piece
    ? `<g transform="translate(4.5 4.5) scale(0.8)" fill="${fill}"
          stroke="${stroke}" stroke-width="${colour === "white" ? 0.9 : 0}" stroke-linejoin="round">
         <style>.ac{fill:none;stroke:${accent};stroke-width:1.5;stroke-linecap:round}.hole{fill:${hole};stroke:none}</style>
         ${PATHS[piece]}
       </g>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="45" height="45">` +
    `<rect width="45" height="45" fill="${bg}"/>${art}</svg>\n`;
}
