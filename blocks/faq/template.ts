import type { EnhanceCTX } from "../../types/types";

export function enhance(ctx: EnhanceCTX) {
  const root = ctx.el as HTMLElement;

  const triggers = Array.from(
    root.querySelectorAll<HTMLButtonElement>("[data-faq-trigger]")
  );

  const setOpen = (trigger: HTMLButtonElement, open: boolean) => {
    const panelId = trigger.getAttribute("aria-controls");
    if (!panelId) return;

    const panel = root.querySelector<HTMLElement>(`#${CSS.escape(panelId)}`);
    if (!panel) return;

    const wrap = panel.closest<HTMLElement>("[data-faq-panel-wrap]");
    if (!wrap) return;

    trigger.setAttribute("aria-expanded", open ? "true" : "false");

    // Drive Tailwind data-variants
    wrap.setAttribute("data-open", open ? "true" : "false");
    panel.setAttribute("data-open", open ? "true" : "false");

    const icon = trigger.querySelector<HTMLElement>("[data-faq-icon]");
    if (icon) {
      icon.setAttribute("data-open", open ? "true" : "false");
      icon.textContent = "+"; // keep + so rotation is visible
    }
  };

  const cleanups: Array<() => void> = [];

  for (const trigger of triggers) {
    const onClick = () => {
      const isOpen = trigger.getAttribute("aria-expanded") === "true";
      for (const t of triggers) setOpen(t, false);
      setOpen(trigger, !isOpen);
    };
    trigger.addEventListener("click", onClick);
    cleanups.push(() => trigger.removeEventListener("click", onClick));
  }

  ctx.onCleanup(() => cleanups.splice(0).forEach((fn) => fn()));
}
