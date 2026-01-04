import type { EnhanceCTX } from "../../types/types";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function enhance(ctx: EnhanceCTX) {
  const root = ctx.el as HTMLElement;
  const fields = (ctx.block?.fields ?? {}) as any;

  const grid = root.querySelector<HTMLElement>("[data-logos-grid]");
  if (!grid) return;

  const colsMobile = clamp(Number(fields.columnsMobile ?? 2), 1, 2);
  const colsDesktop = clamp(Number(fields.columnsDesktop ?? 5), 2, 6);
  const gap = clamp(Number(fields.gap ?? 24), 0, 64);

  const style = (fields.style ?? "grayscale") as "grayscale" | "color";
  const hoverColor = fields.enableHoverColor !== false;

  // Layout: mobile vs desktop
  const mql = window.matchMedia("(min-width: 768px)");

  const applyLayout = () => {
    const cols = mql.matches ? colsDesktop : colsMobile;
    grid.style.display = "grid";
    (grid.style as any).gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
    (grid.style as any).gap = `${gap}px`;
  };

  // Visual style for logos
  const imgs = Array.from(
    root.querySelectorAll<HTMLImageElement>("[data-logos-img]")
  );
  for (const img of imgs) {
    img.style.opacity = "0.9";
    img.style.transition =
      "filter 200ms ease, opacity 200ms ease, transform 200ms ease";

    if (style === "grayscale") {
      img.style.filter = "grayscale(100%)";
    } else {
      img.style.filter = "";
    }

    // Optional hover-to-color
    if (hoverColor) {
      const onEnter = () => {
        img.style.opacity = "1";
        img.style.transform = "translateY(-1px)";
        img.style.filter = "";
      };
      const onLeave = () => {
        img.style.opacity = "0.9";
        img.style.transform = "";
        img.style.filter = style === "grayscale" ? "grayscale(100%)" : "";
      };

      img.addEventListener("mouseenter", onEnter);
      img.addEventListener("mouseleave", onLeave);
      ctx.onCleanup(() => {
        img.removeEventListener("mouseenter", onEnter);
        img.removeEventListener("mouseleave", onLeave);
      });
    }
  }

  // External link safety: add rel+target for external hrefs
  const links = Array.from(
    root.querySelectorAll<HTMLAnchorElement>("[data-logos-link]")
  );
  for (const a of links) {
    const href = a.getAttribute("href") ?? "";
    const isExternal = /^https?:\/\//i.test(href);
    if (isExternal) {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    }
  }

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
}
