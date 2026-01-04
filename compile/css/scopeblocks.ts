import { Plugin, PluginCreator } from "postcss";

type Options = {
  blockId: string;
  attr?: string; // defaults to 'data-block'
};

export const scopeBlocks: PluginCreator<Options> = (opts) => {
  if (!opts || !opts.blockId)
    throw new Error("scopeBlocks: opts.blockId is required");

  const attr = opts.attr ?? "data-block";
  const scope = `[${attr}="${opts.blockId}"]`;
  const scopeWhere = `:where(${scope})`;

  const plugin: Plugin = {
    postcssPlugin: "scope-blocks",
    Once(root) {
      root.walkRules((rule) => {
        // skip @keyframes / @font-face
        const p = rule.parent;
        if (p?.type === "atrule") {
          const n = p.name?.toLowerCase();
          if (n === "keyframes" || n === "font-face") return;
        }

        // get selectors safely
        let selectors: string[];
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          selectors = (rule as any).selectors as string[];
        } catch {
          selectors = rule.selector.split(",").map((s) => s.trim());
        }

        const next = selectors.map((sel) => {
          // opt-out chunks: :global(.x) -> .x
          const unglob = sel.replace(/:global\((.*?)\)/g, "$1").trim();

          // already scoped?
          if (
            unglob.startsWith(scope) ||
            unglob.startsWith(scopeWhere) ||
            unglob.startsWith(`${scope} `) ||
            unglob.startsWith(`${scopeWhere} `)
          ) {
            return unglob;
          }

          // html/body/:root at the start → replace with the scope
          if (/^(\s*)(html|body|:root)\b/.test(unglob)) {
            return scopeWhere;
          }

          // normal case
          return `${scopeWhere} ${unglob}`;
        });

        // set selectors safely
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (rule as any).selectors = next;
        } catch {
          rule.selector = next.join(", ");
        }
      });
    },
  };

  return plugin;
};

// marker belongs on the creator function
scopeBlocks.postcss = true;
