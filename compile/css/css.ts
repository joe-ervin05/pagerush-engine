import fs from "node:fs";
import postcss from "postcss";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import { readFile } from "../util";
import { Site, Theme } from "../../types/types";
import { getFontImports } from "./fonts";
import { globalCSSUtils } from "./global-utils";
import { renderTheme, twTheme } from "./theme";

export async function compileCSS(
  blocks: string[],
  html: string,
  site: Site
): Promise<string> {
  let css = "";

  if (site.theme.typography.bodyFont.type == "google") {
    css += getFontImports(site.theme.typography.bodyFont);
    css += getFontImports(site.theme.typography.headerFont);
  } else {
    css += getFontImports(site.theme.typography.headerFont);
    css += getFontImports(site.theme.typography.bodyFont);
  }

  css += renderTheme(site.theme);

  css += `
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  `;

  css += globalCSSUtils();

  for (const block of blocks) {
    try {
      css += readFile(`blocks/${block}/template.css`);
    } catch {
      continue;
    }
  }

  return await compileFrom(html, css, site);
}

export function bundleCSS(css: string[]) {
  fs.writeFileSync("static/bundle.css", css.join("\n\n"));
}

export function scopeCSS(css: string, blockId: string) {
  // strip all comments
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, "");

  return stripped.replace(/(^|\}|;)\s*([^{\}]+)\s*\{/g, (_, p1, p2) => {
    let prt2 = p2 as string;

    if (
      prt2.startsWith("@") ||
      prt2.startsWith(":root") ||
      prt2.startsWith("html") ||
      prt2.startsWith("body")
    ) {
      return `${p1} ${p2} {`;
    }

    // Scope each selector
    const scopedSelectors = p2
      .split(",")
      .map((sel: string) => `[data-block="${blockId}"] ${sel}`)
      .join(", ");
    return `${p1} ${scopedSelectors} {`;
  });
}

// Source - https://stackoverflow.com/a
// Posted by rozsazoltan
// Retrieved 2025-12-13, License - CC BY-SA 4.0
export async function compileFrom(html: string, css = "", site: Site) {
  const { css: generated } = await postcss([
    tailwindcss({
      content: [{ raw: html, extension: "html" }],
      theme: twTheme(),
      plugins: [],
    }),
    autoprefixer(),
    cssnano({ preset: "default" }),
  ]).process(css, { from: undefined });

  return generated;
}
