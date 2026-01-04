import type { EnhanceCTX } from "../../types/types";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function prefersReducedMotion() {
  return (
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false
  );
}

// Parses strings like: "500+", "$2.4M", "4.9★", "120k", "3,200"
function parseNumericToken(
  raw: string
): { prefix: string; suffix: string; number: number; decimals: number } | null {
  const s = (raw ?? "").trim();
  if (!s) return null;

  // Pull first number-ish token out, keep prefix/suffix around it
  const m = s.match(/^(.*?)(-?\d[\d,]*(?:\.\d+)?)(.*)$/);
  if (!m) return null;

  const prefix = m[1] ?? "";
  const numStr = (m[2] ?? "").replace(/,/g, "");
  const suffix = m[3] ?? "";

  const number = Number(numStr);
  if (!Number.isFinite(number)) return null;

  const decimals = (numStr.split(".")[1] ?? "").length;
  return { prefix, suffix, number, decimals };
}

export function enhance(ctx: EnhanceCTX) {
  const root = ctx.el as HTMLElement;
  const fields = (ctx.block?.fields ?? {}) as any;

  // Responsive layout
  const grid = root.querySelector<HTMLElement>("[data-stats-grid]");
  if (!grid) return;

  const colsMobile = clamp(Number(fields.columnsMobile ?? 1), 1, 2);
  const colsDesktop = clamp(Number(fields.columnsDesktop ?? 3), 2, 4);
  const gap = clamp(Number(fields.gap ?? 24), 0, 64);

  const mql = window.matchMedia("(min-width: 768px)");
  const applyLayout = () => {
    const cols = mql.matches ? colsDesktop : colsMobile;
    grid.style.display = "grid";
    (grid.style as any).gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
    (grid.style as any).gap = `${gap}px`;
  };

  applyLayout();
  const onChange = () => applyLayout();
  if (typeof mql.addEventListener === "function")
    mql.addEventListener("change", onChange);
  else (mql as any).addListener?.(onChange);

  ctx.onCleanup(() => {
    if (typeof mql.removeEventListener === "function")
      mql.removeEventListener("change", onChange);
    else (mql as any).removeListener?.(onChange);
  });

  // Count-up animation (optional)
  const animate = fields.animateCountUp !== false;
  if (!animate || prefersReducedMotion()) return;

  const valueEls = Array.from(
    root.querySelectorAll<HTMLElement>("[data-stat-value]")
  );
  if (valueEls.length === 0) return;

  const tokens = valueEls.map((el) =>
    parseNumericToken(el.getAttribute("data-raw") ?? el.textContent ?? "")
  );
  const anyAnimatable = tokens.some(Boolean);
  if (!anyAnimatable) return;

  const durationMs = 900;

  const animateOne = (
    el: HTMLElement,
    token: NonNullable<ReturnType<typeof parseNumericToken>>
  ) => {
    const start = performance.now();
    const from = 0;
    const to = token.number;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);

      const val = from + (to - from) * eased;
      const fixed =
        token.decimals > 0
          ? val.toFixed(token.decimals)
          : Math.round(val).toString();

      el.textContent = `${token.prefix}${fixed}${token.suffix}`;

      if (t < 1) raf = requestAnimationFrame(tick);
    };

    let raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  };

  const cancels: Array<() => void> = [];

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;

        const el = entry.target as HTMLElement;
        const idx = valueEls.indexOf(el);
        const token = tokens[idx];
        if (!token) continue;

        // Only run once per element
        if (el.getAttribute("data-animated") === "true") continue;
        el.setAttribute("data-animated", "true");

        cancels.push(animateOne(el, token));
      }
    },
    { threshold: 0.25 }
  );

  for (const el of valueEls) io.observe(el);

  ctx.onCleanup(() => {
    io.disconnect();
    for (const cancel of cancels.splice(0)) cancel();
  });
}
