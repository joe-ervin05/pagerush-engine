import fs from "node:fs";
import { formatBlockFunc, readFile } from "./util";
import { BlockManifest } from "../types/types";

export function buildManifests(schemas: string[]) {
  fs.writeFileSync("render/manifests.ts", genManifests(schemas));
}

export function simplifiedSchema(schemas: string[]) {
  const simplified = [];

  for (const id of schemas) {
    const schema = JSON.parse(
      readFile(`../blocks/${id}/schema.json`)
    ) as BlockManifest;

    simplified.push({
      name: schema.id,
      fields: schema.fields,
    });
  }
}

function genManifests(schemas: string[]) {
  return `// THIS FILE IS AUTO GENERATED AND SHOULD NOT BE EDITED DIRECTLY.
// @ts-nocheck

${schemas
  .map(
    (id) => `import ${formatBlockFunc(id)} from '../blocks/${id}/schema.json';`
  )
  .join("\n\n")}

${`export const manifests = {
${schemas.map((id) => `    "${id}": ${formatBlockFunc(id)},`).join("\n")}
};`}
	`;
}

export function manifestTypes(schemas: string[]) {
  fs.writeFileSync(
    "render/block-types.ts",
    `export type BlockTypes = 
${schemas.map((s) => `| '${s}'`).join("\n")}
`
  );
}
