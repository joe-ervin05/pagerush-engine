import { Site } from "../types/types";

export const site: Site = {
  id: "a",
  theme: {
    rounded: "lg",
    shadows: "none",
    colors: {
      primary: "#ff0000",
      primaryText: "#ffffff",
      surface: "#ffffff",
      text: "#000000",
      mutedText: "#4b5563",
      border: "#d1d5db",
      background: "#f1f1f1",
      link: "#2563eb",
    },
    spacing: {
      sections: "md",
      elements: "md",
      align: {
        desktop: "center",
        mobile: "center",
      },
    },
    typography: {
      bodyFont: {
        name: "Assistant",
        type: "google",
      },
      sizing: "lg",
    },
    animations: {
      reveal: {
        type: "fade",
        length: "long",
        emphasis: "extra",
      },
    },
  },
  header: {},
  footer: {},
  blocks: [
    {
      id: "blk_hero_01",
      type: "hero",
      fields: {
        size: "md",
        fullWidth: true,
        align: "left",
        verticalAlign: "center",
        mobile: {
          background_image: "/hero/mobile.jpeg",
          alt: "Technician servicing an AC unit",
          overlay_color: "#000000",
          overlay_opacity: 0.28,
        },
        desktop: {
          background_image: "/hero/desktop.jpeg",
          alt: "Happy family in a cool living room",
          overlay_color: "#000000",
          overlay_opacity: 0.22,
        },
        eyebrow: "Licensed & insured • Same-day service",
        header: "Fast, Reliable HVAC in Orlando",
        subtext:
          "Honest pricing, clean installs, and technicians you can trust.",
        cta: { label: "Get a quote", href: "#contact" },
        secondaryCta: { label: "Call now", href: "tel:+14075551234" },
      },
      data: {},
    },
    {
      type: "text",
      id: "1",
      fields: {
        title: "HAVEN WINTER DROP 2025.",
        content: "LIVE ON DEC. 6TH 12:00 PM EST.",
      },
    },
  ],
};
