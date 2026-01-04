import type { Liquid } from "liquidjs";
import { Tag, Hash, Value } from "liquidjs";
import lucide from "lucide-static";

type RenderCtx = any;
type Emitter = { write: (html: string) => void };

export function registerIconTag(engine: Liquid) {
  engine.registerTag(
    "icon",
    class IconTag extends Tag {
      private nameValue: Value;
      private hash: Hash;

      constructor(tagToken: any, remainTokens: any[], liquid: Liquid) {
        super(tagToken, remainTokens, liquid);

        // Everything after "icon"
        // Example: `fields.icon size:24 stroke:2 class:"h-5 w-5"`
        this.nameValue = new Value(tagToken.args, liquid);
        this.hash = new Hash(tagToken.args);
      }

      // ✅ Fix: explicit generator return type
      *render(ctx: RenderCtx, emitter: Emitter): Generator<any, void, any> {
        const name = yield this.nameValue.value(ctx);
        const opts = yield this.hash.render(ctx);

        const rawName = String(name ?? "").trim();
        if (!rawName || rawName.toLowerCase() === "none") return;

        const body = getLucideBody(rawName);
        if (!body) return;

        const size = Number(opts?.size ?? 20);
        const stroke = Number(opts?.stroke ?? 2);
        const cls = escapeAttr(opts?.class ?? "");

        const w = Number.isFinite(size) ? size : 20;
        const s = Number.isFinite(stroke) ? stroke : 2;

        const svg = `
<svg xmlns="http://www.w3.org/2000/svg"
  width="${w}" height="${w}" viewBox="0 0 24 24"
  fill="none" stroke="currentColor"
  stroke-width="${s}" stroke-linecap="round" stroke-linejoin="round"
  class="${cls}" aria-hidden="true" focusable="false">
  ${body}
</svg>`.trim();

        emitter.write(svg);
      }
    }
  );
}

type LucideEntry = string | { body?: string };

/**
 * lucide-static can export:
 *  - many named exports: AlarmClock, BadgeCheck, ...
 *  - (in some builds) an `icons` object
 *
 * We normalize both into a single lookup map.
 */
const ICON_MAP: Record<string, LucideEntry> = (() => {
  const anyLucide = lucide as any;
  const maybeIconsObj = anyLucide.icons;

  // If a nested `icons` object exists, prefer it; otherwise use namespace exports.
  const raw =
    maybeIconsObj && typeof maybeIconsObj === "object"
      ? maybeIconsObj
      : anyLucide;

  const out: Record<string, LucideEntry> = {};
  for (const [k, v] of Object.entries(raw)) {
    // Filter out non-icons (common junk keys)
    if (
      k === "default" ||
      k === "__esModule" ||
      k === "icons" ||
      k === "createElement" ||
      k === "createIcons"
    )
      continue;

    // Only accept strings or objects with a `body`
    if (typeof v === "string") out[k] = v as string;
    else if (v && typeof v === "object") out[k] = v as { body?: string };
  }
  return out;
})();

function toPascalCase(input: string): string {
  const s = String(input ?? "").trim();
  if (!s) return "";

  // If it already looks PascalCase, keep it
  if (/^[A-Z][A-Za-z0-9]*$/.test(s)) return s;

  // Convert kebab/snake/space to words, then TitleCase them
  const words = s
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    // split camelCase boundaries too
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(" ")
    .filter(Boolean);

  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("");
}

function extractSvgBody(svgOrBody: string): string {
  // If it’s a full <svg>...</svg>, strip wrapper and keep inner content
  const m = svgOrBody.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
  return m ? m[1].trim() : svgOrBody.trim();
}

/**
 * Returns the inner SVG body for an icon name (any casing).
 * - name can be "alarm-clock", "alarmClock", or "AlarmClock"
 * - returns null for "none"/empty/unknown
 */
export function getLucideBody(name: string): string | null {
  const raw = String(name ?? "").trim();
  if (!raw || raw === "none") return null;

  // Try a few key variants
  const candidates = [
    raw,
    toPascalCase(raw),
    raw.charAt(0).toUpperCase() + raw.slice(1),
  ];

  for (const key of candidates) {
    const entry = ICON_MAP[key];
    if (!entry) continue;

    if (typeof entry === "string") return extractSvgBody(entry);
    if (entry && typeof entry === "object" && typeof entry.body === "string")
      return entry.body.trim();
  }

  return null;
}

export function listIconKeys(): string[] {
  // PascalCase keys like "AlarmClock"
  return Object.keys(ICON_MAP).sort((a, b) => a.localeCompare(b));
}

function escapeAttr(v: any) {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
