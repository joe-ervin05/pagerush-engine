import { Condition, Conditional } from "../../types/types";

export function getFieldPath(obj: any, path: string) {
  const parts = String(path ?? "")
    .split(".")
    .filter(Boolean);
  let cur = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

function normalizeConditional(conditional?: Conditional): {
  mode: "all" | "any";
  conditions: Condition[];
} {
  if (!conditional) return { mode: "all", conditions: [] };

  if (Array.isArray(conditional))
    return { mode: "all", conditions: conditional };

  const asAny = conditional as any;
  if (asAny.conditions && Array.isArray(asAny.conditions)) {
    return {
      mode: (asAny.mode ?? "all") as "all" | "any",
      conditions: asAny.conditions as Condition[],
    };
  }

  return { mode: "all", conditions: [conditional as Condition] };
}

function testCondition(fields: any, c: Condition): boolean {
  const v = getFieldPath(fields, c.onField);

  if ("isTruthy" in c) return Boolean(v);
  if ("isFalsy" in c) return !v;

  // isValue
  return v === (c as any).isValue;
}

export function isFieldActive(fields: any, conditional?: Conditional): boolean {
  const { mode, conditions } = normalizeConditional(conditional);
  if (conditions.length === 0) return true;

  return mode === "any"
    ? conditions.some((c) => testCondition(fields, c))
    : conditions.every((c) => testCondition(fields, c));
}
