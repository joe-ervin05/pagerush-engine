import { compileHTML } from "./html/html";
import { compileCSS } from "./css/css";
import { compileJS } from "./js/js";
import { dedupeBlocks } from "./util";
import { Site } from "../types/types";

export interface CompileOutput {
  html: string;
  css: string;
  js: string;
}

export async function compileSite(site: Site): Promise<CompileOutput> {
  const usedBlks = dedupeBlocks(site.blocks);

  const html = await compileHTML(usedBlks, site);
  const css = await compileCSS(usedBlks, html, site);
  const js = await compileJS(usedBlks, site);

  return {
    html,
    css,
    js,
  };
}
