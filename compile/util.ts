import fs from "node:fs";
import { Site } from "../types/types";

export function formatBlockFunc(name: string) {
  return name.replace(/-([a-z])/g, (_, p1) => p1.toUpperCase());
}

export function readFile(file: string) {
  return fs.readFileSync(file, "utf8");
}

export function dedupeBlocks(blocks: Site["blocks"]): string[] {
  const newBlocks = [] as string[];
  const blkMap = new Map() as Map<string, boolean>;

  for (const block of blocks) {
    if (blkMap.has(block.type)) continue;

    blkMap.set(block.type, true);
    newBlocks.push(block.type);
  }

  return newBlocks;
}

// Formats any string into regular english
// Ex:
// AlarmClock -> Alarm clock
// alarmClock -> Alarm clock
// alarm_clock -> Alarm clock
// alarm-clock -> Alarm clock
//
// Also handles acronyms:
// HTMLParser -> Html parser
export function formatString(name: string): string {
  const s = String(name ?? "").trim();
  if (!s) return "";

  // Normalize separators to spaces
  let out = s.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();

  out = out
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");

  // Lowercase everything then capitalize first letter (sentence case)
  out = out.toLowerCase();
  out = out.charAt(0).toUpperCase() + out.slice(1);

  return out;
}
