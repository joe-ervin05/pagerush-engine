export function revealAnimJS(type: string) {
  if (type === "none") return "";
  return `
function revealAll() {
  for (const el of document.querySelectorAll("[data-block-id]")) {
    el.setAttribute("data-revealed", "true");
  }
}

function setupBlockReveal() {
  try {
    const blocks = Array.from(document.querySelectorAll("[data-block-id]"));
    if (blocks.length === 0) return;

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduce) return revealAll();

    const styles = getComputedStyle(document.documentElement);
    const duration = (styles.getPropertyValue("--reveal-duration") || "").trim();
    const type = (styles.getPropertyValue("--reveal-type") || "").trim();

    // Disabled => reveal immediately
    if (type === "none" || duration === "0ms" || duration === "0") return revealAll();

    // No IntersectionObserver => reveal immediately
    if (typeof IntersectionObserver !== "function") return revealAll();

let batch = 0;

const io = new IntersectionObserver((entries) => {
  const visible = entries
    .filter(e => e.isIntersecting)
    .map(e => e.target);

  if (visible.length === 0) return;

  // Sort by DOM position so left-to-right/top-to-bottom looks natural
  visible.sort((a, b) => blocks.indexOf(a) - blocks.indexOf(b));

  visible.forEach((el, i) => {
    const delay = 120 + Math.min(i * 70, 420);
    setTimeout(() => el.setAttribute("data-revealed", "true"), delay);
    io.unobserve(el);
  });

  batch++;
}, { threshold: 0.25 });


    for (const el of blocks) io.observe(el);

    // Hard fail-safe: if something goes sideways, reveal after a short delay
    setTimeout(revealAll, 1500);
  } catch {
    // If ANY error happens, do not keep the page hidden
    revealAll();
  }
}

  `;
}
