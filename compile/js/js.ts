import esbuild from "esbuild";
import { readFile } from "../util";
import { Site } from "../../types/types";

export async function compileJS(blocks: string[], page: Site): Promise<string> {
  let jsSrc: TemplateInput[] = [];

  for (const block of blocks) {
    let blkJs = "";

    try {
      blkJs = readFile(`blocks/${block}/template.ts`);
      jsSrc.push({ id: block, code: blkJs });
    } catch {
      continue;
    }
  }

  const { js } = await bundleTemplates({
    page: page,
    templates: jsSrc,
  });

  return js;
}

type TemplateInput = {
  id: string; // stable id (section id, block id, etc.)
  code: string; // contents of template.ts
};

function escapeString(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export async function bundleTemplates(args: {
  page: Site;
  templates: TemplateInput[];
  minify?: boolean;
  sourcemap?: boolean | "inline";
  target?: string | string[];
  globalName?: string; // optional: expose registry on window[globalName]
}) {
  const {
    page,
    templates,
    minify = true,
    sourcemap = false,
    target = ["es2019"],
    globalName,
  } = args;

  // Virtual modules (no filesystem)
  const plugin: esbuild.Plugin = {
    name: "virtual-templates",
    setup(build) {
      build.onResolve({ filter: /^virtual:template\// }, (args) => ({
        path: args.path,
        namespace: "virtual-templates",
      }));

      build.onLoad({ filter: /.*/, namespace: "virtual-templates" }, (args) => {
        const type = args.path.replace(/^virtual:template\//, "");
        const t = templates.find((x) => x.id === type);
        if (!t) {
          return { contents: `export function enhance(){}`, loader: "ts" };
        }

        // Require the enhance export
        if (!/\bexport\s+function\s+enhance\s*\(/.test(t.code)) {
          throw new Error(
            `Template for type "${type}" must export "function enhance(ctx)".`
          );
        }

        // OPTIONAL: enforce type-only imports (so no runtime deps)
        // - Allows: import type { X } from "..."
        // - Rejects: import { X } from "..."  or  import "..."
        const hasValueImport =
          /\bimport\s+(?!type\b)/.test(t.code) ||
          /\bimport\s*["']/.test(t.code);
        if (hasValueImport) {
          throw new Error(
            `Template "${type}" uses a runtime import. Use "import type ..." only (or add a resolver allowlist).`
          );
        }

        return { contents: t.code, loader: "ts" };
      });
    },
  };

  const pageJson = JSON.stringify(page.blocks);

  // Single entry that imports all templates, defines ctx + mounts page immediately.
  const entry = `
    document.documentElement.setAttribute("data-js", "true");

    const PAGE = ${pageJson};

    ${templates
      .map(
        (t, i) =>
          `import { enhance as tpl_${i} } from "virtual:template/${escapePath(
            t.id
          )}";`
      )
      .join("\n")}

    const TEMPLATES = {
      ${templates
        .map((t, i) => `"${escapeString(t.id)}": tpl_${i}`)
        .join(",\n")}
    };
    
    ${revealAnimJS(page.theme.animations.reveal.type)}

    function mountPage(page) {
      for (const block of page) {
        const el = document.querySelector('[data-block="' + cssEscape(block.type) + '"]');
        if (!el) continue;

        const tpl = TEMPLATES[block.type];
        if (!tpl) continue;

        const cleanups = [];
        const ctx = {
          el,
          block,
          page,
          emit: (event, payload) => {
            // hook this into your editor/runtime bus
            // console.log("[emit]", event, payload);
          },
          onCleanup: (fn) => cleanups.push(fn),
        };

        // Store destroy handler on the element if you want to unmount later
        el.__destroyBlock = () => { for (const fn of cleanups.splice(0)) try { fn(); } catch {} };

        // Run template
        tpl(ctx);
      }
    }

    // CSS.escape fallback
    function cssEscape(s) {
      if (window.CSS && typeof window.CSS.escape === "function") return window.CSS.escape(s);
      return String(s).replace(/"/g, '\\\\\\"');
    }

    function start() { 
    mountPage(PAGE);
    setupBlockReveal();
     }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", start, { once: true });
    } else {
      start();
    }

    ${
      globalName
        ? `window["${escapeString(
            globalName
          )}"] = { PAGE, TEMPLATES, mountPage };`
        : ""
    }
  `;

  const result = await esbuild.build({
    stdin: { contents: entry, loader: "ts" },
    bundle: true,
    write: false,
    plugins: [plugin],
    platform: "browser",
    format: "iife",
    target,
    minify,
    sourcemap,
  });

  const jsFile =
    result.outputFiles.find((f) => f.path.endsWith(".js")) ??
    result.outputFiles[0];
  const mapFile = result.outputFiles.find((f) => f.path.endsWith(".map"));

  return { js: jsFile.text, map: mapFile?.text };
}

function escapePath(s: string) {
  return s.replace(/\\/g, "/");
}

function revealAnimJS(type: string) {
  if (type === "none") return "";
  return `
function revealAll() {
  for (const el of document.querySelectorAll("[data-block-id]")) {
    el.setAttribute("data-revealed", "true");
  }
}

function setupBlockReveal() {
  try {
    const blocks = Array.from(document.querySelectorAll("[data-block-id]"));
    if (blocks.length === 0) return;

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduce) return revealAll();

    const styles = getComputedStyle(document.documentElement);
    const duration = (styles.getPropertyValue("--reveal-duration") || "").trim();
    const type = (styles.getPropertyValue("--reveal-type") || "").trim();

    // Disabled => reveal immediately
    if (type === "none" || duration === "0ms" || duration === "0") return revealAll();

    // No IntersectionObserver => reveal immediately
    if (typeof IntersectionObserver !== "function") return revealAll();

let batch = 0;

const io = new IntersectionObserver((entries) => {
  const visible = entries
    .filter(e => e.isIntersecting)
    .map(e => e.target);

  if (visible.length === 0) return;

  // Sort by DOM position so left-to-right/top-to-bottom looks natural
  visible.sort((a, b) => blocks.indexOf(a) - blocks.indexOf(b));

  visible.forEach((el, i) => {
    const delay = 120 + Math.min(i * 70, 420);
    setTimeout(() => el.setAttribute("data-revealed", "true"), delay);
    io.unobserve(el);
  });

  batch++;
}, { threshold: 0.25 });


    for (const el of blocks) io.observe(el);

    // Hard fail-safe: if something goes sideways, reveal after a short delay
    setTimeout(revealAll, 1500);
  } catch {
    // If ANY error happens, do not keep the page hidden
    revealAll();
  }
}

  `;
}
