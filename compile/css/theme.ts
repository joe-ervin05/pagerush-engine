import { CustomThemeConfig } from "tailwindcss/types/config";
import { Theme } from "../../types/types";
import { revealAnimCss, revealAnimVars } from "./animate";

type TWTheme =
  | Partial<
      CustomThemeConfig & {
        extend: Partial<CustomThemeConfig>;
      }
    >
  | undefined;

export function renderTheme(theme: Theme) {
  const bodyFont = theme.typography.bodyFont.name;
  const headerFont = theme.typography.headerFont?.name ?? bodyFont;

  return `
:root {
  --color-background: ${theme.colors.background};
  --color-text: ${theme.colors.text};
  --color-primary: ${theme.colors.primary};
  --color-primary-text: ${theme.colors.primaryText};
  --color-border: ${theme.colors.border};
  --color-link: ${theme.colors.link};
  --color-surface: ${theme.colors.surface};
  --color-muted-text: ${theme.colors.mutedText};

  --space-1: .25rem;
  --space-2: .5rem;
  --space-3: .75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;

  --font-body: ${bodyFont};
  --font-header: ${headerFont};

  ${mapFontVars(theme.typography.sizing)}

  ${mapRadiusVars(theme.rounded)}

  ${mapShadowVars(theme.shadows)}

  ${revealAnimVars(theme.animations.reveal)}
}

/* Global base rules */
html, body {
  font-family: var(--font-body);
  color: var(--color-text);
  background: var(--color-background);
}

a {
  color: var(--color-link);
}

* {
  border-color: var(--color-border);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-header);
}

${revealAnimCss(theme.animations.reveal.type)}
`;
}

export function twTheme(): TWTheme {
  return {
    extend: {
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          sm: "2rem",
          lg: "4rem",
          xl: "5rem",
          "2xl": "6rem",
        },
      },
      colors: {
        primary: "var(--color-primary)",
        "primary-text": "var(--color-primary-text)",
        background: "var(--color-background)",
        border: "var(--color-border)",
        link: "var(--color-link)",
        surface: "var(--color-surface)",
        text: "var(--color-text)",
        "muted-text": "var(--color-muted-text)",
      },
      fontSize: {
        sm: "var(--font-sm)",
        base: "var(--font-base)",
        lg: "var(--font-lg)",
        xl: "var(--font-xl)",
        "2xl": "var(--font-2xl)",
        "3xl": "var(--font-3xl)",
        "4xl": "var(--font-4xl)",
        "5xl": "var(--font-5xl)",
        "6xl": "var(--font-6xl)",
        "7xl": "var(--font-7xl)",
        "8xl": "var(--font-8xl)",
        "9xl": "var(--font-9xl)",
      },
      borderRadius: {
        xs: "var(--rounded-xs)",
        sm: "var(--rounded-sm)",
        md: "var(--rounded-md)",
        lg: "var(--rounded-lg)",
        xl: "var(--rounded-xl)",
        "2xl": "var(--rounded-2xl)",
        "3xl": "var(--rounded-3xl)",
        "4xl": "var(--rounded-4xl)",
      },
      fontFamily: {
        body: "var(--font-body)",
        header: "var(--font-header)",
      },
    },
  };
}

function mapRadiusVars(size: "none" | "sm" | "md" | "lg" | "xl") {
  switch (size) {
    case "none":
      return `
--rounded-xs: 0px;
--rounded-sm: 0px;
--rounded-md: 0px;
--rounded-lg: 0px;
--rounded-xl: 0px;
--rounded-2xl: 0px;
--rounded-3xl: 0px;
--rounded-4xl: 0px;
--rounded-none: 0px;
--rounded-full: 9999px;`;

    case "sm":
      return `
--rounded-xs: 2px;
--rounded-sm: 4px;
--rounded-md: 6px;
--rounded-lg: 8px;
--rounded-xl: 10px;
--rounded-2xl: 12px;
--rounded-3xl: 14px;
--rounded-4xl: 16px;
--rounded-none: 0px;
--rounded-full: 9999px;`;

    case "md":
      return `
--rounded-xs: 3px;
--rounded-sm: 6px;
--rounded-md: 10px;
--rounded-lg: 14px;
--rounded-xl: 18px;
--rounded-2xl: 22px;
--rounded-3xl: 28px;
--rounded-4xl: 36px;
--rounded-none: 0px;
--rounded-full: 9999px;`;

    case "lg":
      return `
--rounded-xs: 4px;
--rounded-sm: 10px;
--rounded-md: 16px;
--rounded-lg: 22px;
--rounded-xl: 28px;
--rounded-2xl: 36px;
--rounded-3xl: 44px;
--rounded-4xl: 56px;
--rounded-none: 0px;
--rounded-full: 9999px;`;

    case "xl":
      return `
--rounded-xs: 6px;
--rounded-sm: 14px;
--rounded-md: 22px;
--rounded-lg: 32px;
--rounded-xl: 44px;
--rounded-2xl: 56px;
--rounded-3xl: 72px;
--rounded-4xl: 96px;
--rounded-none: 0px;
--rounded-full: 9999px;`;
  }
}

function mapFontVars(size: "sm" | "md" | "lg") {
  switch (size) {
    case "sm":
      return `
--font-sm: 13px;
--font-base: 15px;
--font-lg: 17px;
--font-xl: 19px;
--font-2xl: 22px;
--font-3xl: 28px;
--font-4xl: 34px;
--font-5xl: 44px;
--font-6xl: 56px;
--font-7xl: 68px;
--font-8xl: 88px;
--font-9xl: 112px;`;

    case "md":
      return `
--font-sm: 14px;
--font-base: 16px;
--font-lg: 18px;
--font-xl: 20px;
--font-2xl: 24px;
--font-3xl: 30px;
--font-4xl: 36px;
--font-5xl: 48px;
--font-6xl: 60px;
--font-7xl: 72px;
--font-8xl: 96px;
--font-9xl: 128px;`;

    case "lg":
      return `
--font-sm: 15px;
--font-base: 18px;
--font-lg: 20px;
--font-xl: 22px;
--font-2xl: 28px;
--font-3xl: 36px;
--font-4xl: 44px;
--font-5xl: 56px;
--font-6xl: 72px;
--font-7xl: 88px;
--font-8xl: 112px;
--font-9xl: 144px;`;
  }
}

function mapShadowVars(shadow: "none" | "sm" | "md" | "lg") {
  switch (shadow) {
    case "none":
      return `
--shadow: 0 0 #0000;
--shadow-sm: 0 0 #0000;
--shadow-lg: 0 0 #0000;`;
    case "sm":
      return `
--shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-lg: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);`;
    case "md":
      return `
--shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);`;
    case "lg":
      return `
--shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-sm: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);`;
  }
}
