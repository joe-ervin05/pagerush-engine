import { BlockTypes } from "./block-types";

export type Json =
  | null
  | string
  | number
  | boolean
  | Json[]
  | { [k: string]: Json };

export type FieldsValue = Record<string, Json>; // supports nested groups

export interface PlacedBlock {
  /** Unique per-page instance id (e.g., "blk_01H...") */
  id: string;

  /** Block type, matches BlockManifest.id  */
  type: BlockTypes;

  /** Concrete values after applying defaults & resolving groups */
  fields: FieldsValue;

  /** Optional server-injected data (e.g., reviews snapshot) */
  data?: Record<string, Json>;
}

export interface Font {
  type: "native" | "google" | "custom";
  name: string;
  source?: string;
}

export interface Header {}

export interface Footer {}

export type Theme = {
  colors: {
    primary: string;
    primaryText: string;
    background: string;
    surface: string;
    text: string;
    mutedText: string;
    border: string;
    link: string;
  };
  rounded: "none" | "sm" | "md" | "lg" | "xl";
  shadows: "none" | "sm" | "md" | "lg";
  spacing: {
    elements: "sm" | "md" | "lg";
    sections: "sm" | "md" | "lg";
    align: {
      desktop: "left" | "center" | "right";
      mobile: "left" | "center" | "right";
    };
  };
  typography: {
    headerFont?: Font;
    bodyFont: Font;
    sizing: "sm" | "md" | "lg";
  };
  animations: {
    reveal: RevealAnim;
  };
};

export type RevealAnim = {
  type: "fade" | "scale" | "fly" | "none";
  length?: "short" | "default" | "long";
  emphasis?: "low" | "default" | "extra";
};

export interface Site {
  theme: Theme;
  id: string;
  blocks: PlacedBlock[];
  header: Header;
  footer: Footer;
}

export type Semver = `${number}.${number}.${number}`;

export interface BlockManifest {
  id: string;
  name: string;
  version: Semver;
  fields: FieldDef[]; // now supports nested groups
  assets?: { css?: string; js?: string };
  a11y?: {
    landmark?: "main" | "region" | "complementary" | "contentinfo";
    label?: string;
  };
  engines?: { siteRuntime?: string };
  capabilities?: string[];
  budgets?: { cssKB?: number; jsKB?: number };
}

export interface EnhanceCTX {
  el: HTMLElement;
  block: PlacedBlock;
  page: PlacedBlock[];
  onCleanup: (f: () => void) => void;
}
