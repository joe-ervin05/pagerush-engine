import type { Site } from "../../types/types";
import { readFile } from "../util";
import { manifests } from "../../types/manifests";
import { JsonLDHead } from "../json-ld";
import { getFontLinks } from "../css/fonts";
import { registerHelpers } from "../helpers/helpers";
import { Liquid } from "liquidjs";

type ParsedTemplate = ReturnType<Liquid["parse"]>;

function escAttr(v: any) {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * LiquidJS render is async, so compileHTML should be async too.
 *
 * Notes:
 * - Your app shell should use `{{ body | raw }}` and render head entries as raw:
 *   `{% for h in head %}{{ h | raw }}{% endfor %}`
 * - Prefer `.liquid` filenames going forward.
 */
export async function compileHTML(
  blocks: string[],
  site: Site
): Promise<string> {
  let HTML = "";

  // Create a per-compile engine (safe + predictable)
  const engine = new Liquid({
    // strongly recommended when rendering user-authored templates
    outputEscape: "escape",
  });

  registerHelpers(engine);

  // --- load shell ---
  let shellSrc = "";
  try {
    // Prefer Liquid going forward
    shellSrc = readFile("app.liquid");
  } catch {
    try {
      // Back-compat if you still have the old name during migration
      shellSrc = readFile("app.hbs");
      console.warn(`Using app.hbs as shell. Consider renaming to app.liquid.`);
    } catch {
      console.warn(`500: No app.liquid (or app.hbs) found.`);
      return "App shell not found";
    }
  }

  const shellTpl: ParsedTemplate = engine.parse(shellSrc);

  // --- parse block templates ---
  const templates: Record<string, ParsedTemplate> = {};

  for (const blockType of blocks) {
    let src: string;
    try {
      // Prefer Liquid going forward
      src = readFile(`blocks/${blockType}/template.liquid`);
    } catch {
      try {
        // Back-compat during migration
        src = readFile(`blocks/${blockType}/template.hbs`);
        console.warn(
          `Using template.hbs for block: ${blockType}. Consider renaming to template.liquid.`
        );
      } catch {
        console.warn(
          `No template.liquid found for block: ${blockType}. Skipping.`
        );
        continue;
      }
    }

    templates[blockType] = engine.parse(src);
  }

  // --- render blocks (one-by-one) ---
  for (const block of site.blocks) {
    const tpl = templates[block.type];
    if (!tpl) continue;

    try {
      const blockHtml = await engine.render(tpl, {
        id: block.id,
        type: block.type,
        fields: block.fields,
        manifest: manifests[block.type],
        data: block.data,
        // optional extra context if you want it in templates:
        // site,
        // page: site.blocks,
      });

      HTML += `<section data-block-id="${escAttr(
        block.id
      )}" data-block="${escAttr(block.type)}">
${blockHtml}
</section>\n\n`;
    } catch (err) {
      console.warn(
        `Liquid render failed for block ${block.type} (${block.id}): ${String(
          err
        )}`
      );
    }
  }

  // --- fonts/head ---
  const fontLinks = getFontLinks(
    site.theme.typography.headerFont,
    site.theme.typography.bodyFont
  );

  let preconnect = "";
  if (fontLinks.length) {
    preconnect = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
`.trim();
  }

  const head = [
    preconnect,
    ...fontLinks,
    `<link rel="stylesheet" href="/base.css?m=${Date.now()}">`,
    JsonLDHead(site.blocks),
  ].filter(Boolean);

  // --- render shell ---
  return await engine.render(shellTpl, {
    body: HTML,
    head,
    date: Date.now(),
    // optional:
    // site,
  });
}
