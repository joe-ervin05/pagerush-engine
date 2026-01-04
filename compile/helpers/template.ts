import type { Liquid } from "liquidjs";

/**
 * Registers your helper pack as LiquidJS filters.
 *
 * Usage:
 *   const engine = new Liquid({...});
 *   registerTemplateFilters(engine);
 */
export function registerTemplateFilters(engine: Liquid) {
  // --- strict equality ---
  engine.registerFilter("eq", (a: any, b: any) => a === b);
  engine.registerFilter("neq", (a: any, b: any) => a !== b);

  // --- comparisons (numeric if possible, else string compare) ---
  engine.registerFilter("gt", (a: any, b: any) => smartCompare(a, b, "gt"));
  engine.registerFilter("lt", (a: any, b: any) => smartCompare(a, b, "lt"));
  engine.registerFilter("gte", (a: any, b: any) => smartCompare(a, b, "gte"));
  engine.registerFilter("lte", (a: any, b: any) => smartCompare(a, b, "lte"));

  // --- boolean logic ---
  // Liquid doesn't pass an options arg like Handlebars; filters are just values.
  engine.registerFilter("and", (...args: any[]) => args.every(Boolean));
  engine.registerFilter("or", (...args: any[]) => args.some(Boolean));
  engine.registerFilter("not", (v: any) => !v);

  // --- includes ---
  // supports:
  //  - array includes value
  //  - string includes substring
  //  - object has own key
  engine.registerFilter("includes", (haystack: any, needle: any) => {
    if (haystack == null) return false;

    if (Array.isArray(haystack)) return haystack.includes(needle);

    if (typeof haystack === "string") return haystack.includes(toStr(needle));

    if (typeof haystack === "object") {
      return Object.prototype.hasOwnProperty.call(haystack, toStr(needle));
    }

    return false;
  });

  // --- strings ---
  engine.registerFilter("uppercase", (v: any) => toStr(v).toUpperCase());
  engine.registerFilter("lowercase", (v: any) => toStr(v).toLowerCase());
  engine.registerFilter("trim", (v: any) => toStr(v).trim());
  engine.registerFilter("concat", (...args: any[]) => args.map(toStr).join(""));
  engine.registerFilter("replace", (str: any, search: any, replacement: any) =>
    toStr(str).split(toStr(search)).join(toStr(replacement))
  );

  // --- defaults ---
  engine.registerFilter("default", (value: any, fallback: any) =>
    value == null || value === "" ? fallback : value
  );

  engine.registerFilter("coalesce", (...args: any[]) => {
    for (const v of args) if (v !== null && v !== undefined) return v;
    return undefined;
  });

  // --- array/object utilities ---
  engine.registerFilter("len", (v: any) => {
    if (v == null) return 0;
    if (typeof v === "string" || Array.isArray(v)) return v.length;
    if (typeof v === "object") return Object.keys(v).length;
    return 0;
  });

  engine.registerFilter("isEmpty", (v: any) => isEmpty(v));

  // --- JSON (great for dev) ---
  engine.registerFilter("json", (v: any) => JSON.stringify(v, null, 2));

  // --- math ---
  engine.registerFilter(
    "add",
    (a: any, b: any) => (toNum(a) || 0) + (toNum(b) || 0)
  );
  engine.registerFilter(
    "sub",
    (a: any, b: any) => (toNum(a) || 0) - (toNum(b) || 0)
  );
  engine.registerFilter(
    "mult",
    (a: any, b: any) => (toNum(a) || 0) * (toNum(b) || 0)
  );
  engine.registerFilter("div", (a: any, b: any) => {
    const bn = toNum(b);
    if (!bn) return 0;
    return (toNum(a) || 0) / bn;
  });
}

const toNum = (v: any): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
};

const toStr = (v: any): string => (v == null ? "" : String(v));

type CmpOp = "gt" | "lt" | "gte" | "lte";

function smartCompare(a: any, b: any, op: CmpOp): boolean {
  const an = toNum(a);
  const bn = toNum(b);

  const bothNumeric = !Number.isNaN(an) && !Number.isNaN(bn);

  if (bothNumeric) {
    if (op === "gt") return an > bn;
    if (op === "lt") return an < bn;
    if (op === "gte") return an >= bn;
    return an <= bn;
  }

  const astr = toStr(a);
  const bstr = toStr(b);

  if (op === "gt") return astr > bstr;
  if (op === "lt") return astr < bstr;
  if (op === "gte") return astr >= bstr;
  return astr <= bstr;
}

function isEmpty(v: any): boolean {
  if (v == null) return true;
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === "string") return v.trim().length === 0;
  if (typeof v === "object") return Object.keys(v).length === 0;
  return false;
}
