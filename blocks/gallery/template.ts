import type { EnhanceCTX } from "../../types/types";

type GalleryImage = { src: string; alt: string; caption?: string };

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function enhance(ctx: EnhanceCTX) {
  const root = ctx.el as HTMLElement;
  const fields = (ctx.block?.fields ?? {}) as any;

  const layout = (fields.layout ?? "grid") as "grid" | "masonry";
  const aspectRatio = (fields.aspectRatio ?? "auto") as string;

  const colsMobile = clamp(Number(fields.columnsMobile ?? 1), 1, 2);
  const colsDesktop = clamp(Number(fields.columnsDesktop ?? 3), 2, 6);
  const gap = clamp(Number(fields.gap ?? 16), 0, 64);

  const grid = root.querySelector<HTMLElement>("[data-gallery-grid]");
  if (!grid) return;

  const cards = Array.from(
    root.querySelectorAll<HTMLElement>("[data-gallery-card]")
  );
  const media = Array.from(
    root.querySelectorAll<HTMLElement>("[data-gallery-media]")
  );
  const imgs = Array.from(
    root.querySelectorAll<HTMLImageElement>("[data-gallery-img]")
  );

  const mql = window.matchMedia("(min-width: 768px)");

  const applyLayout = () => {
    const cols = mql.matches ? colsDesktop : colsMobile;

    if (layout === "masonry") {
      grid.style.display = "block";
      (grid.style as any).columnCount = String(cols);
      (grid.style as any).columnGap = `${gap}px`;
    } else {
      grid.style.display = "grid";
      (
        grid.style as any
      ).gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
      (grid.style as any).gap = `${gap}px`;
    }

    for (const card of cards) {
      if (layout === "masonry") {
        (card.style as any).breakInside = "avoid";
        (card.style as any).marginBottom = `${gap}px`;
        card.style.width = "100%";
        card.style.display = "inline-block";
      } else {
        (card.style as any).breakInside = "";
        (card.style as any).marginBottom = "";
        card.style.width = "";
        card.style.display = "";
      }
    }
  };

  // Aspect ratio (optional)
  const useRatio = aspectRatio && aspectRatio !== "auto";
  for (let i = 0; i < media.length; i++) {
    const wrap = media[i];
    const img = imgs[i];
    if (!img) continue;

    if (useRatio) {
      wrap.style.position = "relative";
      (wrap.style as any).aspectRatio = aspectRatio;
      wrap.style.overflow = "hidden";

      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
      img.style.position = "absolute";
      img.style.inset = "0";
      img.style.display = "block";
    } else {
      wrap.style.position = "";
      (wrap.style as any).aspectRatio = "";
      wrap.style.overflow = "";

      img.style.width = "100%";
      img.style.height = "auto";
      img.style.objectFit = "";
      img.style.position = "";
      img.style.inset = "";
      img.style.display = "block";
    }
  }

  applyLayout();

  const onMqlChange = () => applyLayout();
  if (typeof mql.addEventListener === "function")
    mql.addEventListener("change", onMqlChange);
  else (mql as any).addListener?.(onMqlChange);

  // Lightbox
  const lightboxEnabled = Boolean(fields.lightbox);
  if (!lightboxEnabled) {
    ctx.onCleanup(() => {
      if (typeof mql.removeEventListener === "function")
        mql.removeEventListener("change", onMqlChange);
      else (mql as any).removeListener?.(onMqlChange);
    });
    return;
  }

  const images = (fields.images ?? []) as GalleryImage[];
  if (!Array.isArray(images) || images.length === 0) return;

  const items = Array.from(
    root.querySelectorAll<HTMLButtonElement>("[data-gallery-item]")
  );
  if (items.length === 0) return;

  const modal = root.querySelector<HTMLElement>("[data-gallery-modal]");
  const dialog = root.querySelector<HTMLElement>("[data-gallery-dialog]");
  const closeBtn = root.querySelector<HTMLButtonElement>(
    "[data-gallery-close]"
  );
  const imgEl = root.querySelector<HTMLImageElement>(
    "[data-gallery-active-img]"
  );
  const capEl = root.querySelector<HTMLElement>(
    "[data-gallery-active-caption]"
  );
  const counterEl = root.querySelector<HTMLElement>("[data-gallery-counter]");
  const prevBtn = root.querySelector<HTMLButtonElement>("[data-gallery-prev]");
  const nextBtn = root.querySelector<HTMLButtonElement>("[data-gallery-next]");

  if (
    !modal ||
    !dialog ||
    !closeBtn ||
    !imgEl ||
    !capEl ||
    !prevBtn ||
    !nextBtn
  )
    return;

  let open = false;
  let activeIndex = 0;

  const setActive = (index: number) => {
    const i = (index + images.length) % images.length;
    activeIndex = i;

    const it = images[i];
    imgEl.src = it.src;
    imgEl.alt = it.alt ?? "";

    capEl.textContent = it.caption ? it.caption : "";
    capEl.style.display = it.caption ? "" : "none";

    if (counterEl) counterEl.textContent = `${i + 1} / ${images.length}`;
  };

  const show = (index: number) => {
    open = true;
    modal.classList.remove("hidden");
    setActive(index);
  };

  const hide = () => {
    open = false;
    modal.classList.add("hidden");
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (!open) return;
    if (e.key === "Escape") hide();
    if (e.key === "ArrowLeft") setActive(activeIndex - 1);
    if (e.key === "ArrowRight") setActive(activeIndex + 1);
  };

  const cleanups: Array<() => void> = [];

  // Open handlers
  for (const btn of items) {
    const onClick = () => {
      const idx = Number(btn.getAttribute("data-index") ?? "0");
      show(Number.isFinite(idx) ? idx : 0);
    };
    btn.addEventListener("click", onClick);
    cleanups.push(() => btn.removeEventListener("click", onClick));
  }

  // Outside click: listen on modal, close if click target is not inside dialog
  const onOutsideClick = (e: MouseEvent) => {
    if (!open) return;
    const target = e.target as Node;
    if (!dialog.contains(target)) hide();
  };

  const onClose = () => hide();
  const onPrev = () => setActive(activeIndex - 1);
  const onNext = () => setActive(activeIndex + 1);

  modal.addEventListener("click", onOutsideClick);
  closeBtn.addEventListener("click", onClose);
  prevBtn.addEventListener("click", onPrev);
  nextBtn.addEventListener("click", onNext);
  window.addEventListener("keydown", onKeyDown);

  cleanups.push(() => modal.removeEventListener("click", onOutsideClick));
  cleanups.push(() => closeBtn.removeEventListener("click", onClose));
  cleanups.push(() => prevBtn.removeEventListener("click", onPrev));
  cleanups.push(() => nextBtn.removeEventListener("click", onNext));
  cleanups.push(() => window.removeEventListener("keydown", onKeyDown));

  ctx.onCleanup(() => {
    hide();
    for (const fn of cleanups.splice(0)) fn();

    if (typeof mql.removeEventListener === "function")
      mql.removeEventListener("change", onMqlChange);
    else (mql as any).removeListener?.(onMqlChange);
  });
}
