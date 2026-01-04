import { RevealAnim } from "../../types/types";

export function revealAnimVars(reveal?: RevealAnim) {
  if (reveal?.type === "none") return "";

  const type = reveal?.type ?? "fade";
  const length = reveal?.length ?? "default";
  const emphasis = reveal?.emphasis ?? "default";

  const durationMs = length === "short" ? 300 : length === "long" ? 1000 : 600;

  const flyPx = emphasis === "low" ? 6 : emphasis === "extra" ? 18 : 10;

  const scaleFrom =
    emphasis === "low" ? 0.99 : emphasis === "extra" ? 0.94 : 0.97;

  const ease = "cubic-bezier(0.2, 0.8, 0.2, 1)";

  // default "from"
  let fromOpacity = 0;
  let fromY = 0;
  let fromScale = 1;

  if (type === "fade") {
    fromOpacity = 0;
    fromY = 0;
    fromScale = 1;
  } else if (type === "fly") {
    fromOpacity = 0;
    fromY = flyPx;
    fromScale = 1;
  } else if (type === "scale") {
    fromOpacity = 0;
    fromY = 0;
    fromScale = scaleFrom;
  } else if (type === "none") {
    // show immediately
    fromOpacity = 1;
    fromY = 0;
    fromScale = 1;
  }

  return `
  --reveal-type: ${type};
  --reveal-duration: ${durationMs}ms;
  --reveal-ease: ${ease};
  --reveal-from-opacity: ${fromOpacity};
  --reveal-from-y: ${fromY}px;
  --reveal-from-scale: ${fromScale};
  --reveal-stagger: 60ms;
  `;
}

export function revealAnimCss(type: string) {
  if (type === "none") return "";
  return `
/* Default: visible (so if JS fails, page still shows) */
[data-block-id] {
  opacity: 1;
  transform: none;
  transition: none;
}

/* Only hide + animate when JS is running */
html[data-js="true"] [data-block-id] {
  opacity: var(--reveal-from-opacity, 0);
  transform: translateY(var(--reveal-from-y, 10px)) scale(var(--reveal-from-scale, 1));
  transition:
    opacity var(--reveal-duration, 450ms) var(--reveal-ease, ease),
    transform var(--reveal-duration, 450ms) var(--reveal-ease, ease);
  will-change: opacity, transform;
}

html[data-js="true"] [data-block-id][data-revealed="true"] {
  opacity: 1;
  transform: translateY(0) scale(1);
}

@media (prefers-reduced-motion: reduce) {
  [data-block-id] {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
}

`;
}
