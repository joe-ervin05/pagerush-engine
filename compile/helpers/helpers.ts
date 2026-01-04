import type { Liquid } from "liquidjs";
import { registerTemplateFilters } from "./template";
import { registerIconTag } from "./icons";
import { registerLinkFilters } from "./link";

export function registerHelpers(engine: Liquid) {
  registerTemplateFilters(engine);
  registerIconTag(engine);
  registerLinkFilters(engine);
}
