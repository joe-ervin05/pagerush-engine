import type { Liquid } from "liquidjs";
import type { LinkValue } from "../../types/types";

/**
 * LiquidJS version of the link helpers as filters.
 *
 * Usage:
 *   const engine = new Liquid({...});
 *   registerLinkFilters(engine);
 *
 * In templates:
 *   href="{{ fields.cta | linkHref }}"
 *   target="{{ fields.cta | linkTarget }}"
 *   rel="{{ fields.cta | linkRel }}"
 */
export function registerLinkFilters(engine: Liquid) {
  engine.registerFilter("linkHref", (link: LinkValue) =>
    escAttr(linkToHref(link))
  );

  engine.registerFilter("linkTarget", (link: LinkValue) => {
    if (!link || link.kind !== "url") return "";
    return link.newTab ? "_blank" : "";
  });

  engine.registerFilter("linkRel", (link: LinkValue) => {
    if (!link || link.kind !== "url") return "";
    const rel: string[] = [];
    if (link.newTab) rel.push("noopener", "noreferrer");
    if (link.nofollow) rel.push("nofollow");
    return rel.join(" ");
  });
}

export function linkToHref(v: LinkValue): string {
  if (!v || v.kind === "none") return "";

  if (v.kind === "url") return String(v.url ?? "").trim();

  if (v.kind === "internal") {
    const path = String(v.path ?? "").trim() || "/";
    const hash = v.hash ? `#${String(v.hash).replace(/^#/, "")}` : "";
    return `${path}${hash}`;
  }

  if (v.kind === "anchor") return `#${String(v.id ?? "").replace(/^#/, "")}`;

  if (v.kind === "tel") {
    // keep + and digits only
    const phone = String(v.phone ?? "")
      .trim()
      .replace(/[^\d+]/g, "");
    return phone ? `tel:${phone}` : "";
  }

  if (v.kind === "mailto") {
    const email = String(v.email ?? "").trim();
    if (!email) return "";
    const params = new URLSearchParams();
    if (v.subject) params.set("subject", String(v.subject));
    if (v.body) params.set("body", String(v.body));
    const q = params.toString();
    return `mailto:${email}${q ? `?${q}` : ""}`;
  }

  return "";
}

function escAttr(v: any) {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
