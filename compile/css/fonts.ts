import { Font } from "../../types/types";

export function getFontImports(font: Font | null | undefined) {
  if (!font) return "";
  if (font.type === "native") return "";

  if (font.type === "google") {
    return "";
  }

  if (!font.source) return "";

  // Guess format from extension so the browser is happier
  const cleanSrc = font.source.split("?")[0].split("#")[0];
  const ext = cleanSrc.split(".").pop()?.toLowerCase();

  const format =
    ext === "woff2"
      ? "woff2"
      : ext === "woff"
      ? "woff"
      : ext === "ttf" || ext === "ttc"
      ? "truetype"
      : ext === "otf"
      ? "opentype"
      : undefined;

  const formatPart = format ? ` format('${format}')` : "";

  return `
@font-face {
  font-family: '${font.name}';
  src: url('${font.source}')${formatPart};
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}`.trim();
}

export function getFontLinks(
  headerFont: Font | null | undefined,
  bodyFont: Font
) {
  const fonts = [headerFont, bodyFont];
  const links: string[] = [];

  for (const font of fonts) {
    if (!font || font.type !== "google") continue;
    const trimmedFamily = font.name.trim();

    // "DM Sans" -> "DM+Sans"
    const familyParam = encodeURIComponent(trimmedFamily).replace(/%20/g, "+");

    links.push(
      `<link href="https://fonts.googleapis.com/css2?family=${familyParam}&display=swap" rel="stylesheet"/>`
    );
  }

  return links;
}
