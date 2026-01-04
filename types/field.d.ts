export type FieldDef =
  | {
      name: string;
      type: "repeater";
      label?: string;
      fields: FieldDef[];
      defaultValue?: Record<string, unknown>[];
      minItems?: number;
      maxItems?: number;
      editor: EditorMeta;
      conditional?: Conditional;
    }
  | {
      name: string;
      type: "group";
      label?: string;
      fields: FieldDef[]; // nested, recursive
      editor: EditorMeta;
      conditional?: Conditional;
    }
  | {
      name: string;
      type: "numeric";
      label?: string;
      defaultValue?: number;
      required?: boolean;
      minValue?: number;
      maxValue?: number;
      step?: number;
      unit?: NumericUnit;
      display?: "input" | "slider" | "stepper";
      editor: EditorMeta;
      conditional?: Conditional;
    }
  | {
      name: string;
      type: "boolean";
      label?: string;
      defaultValue?: boolean;
      display?: "switch" | "checkbox";
      editor: EditorMeta;
      conditional?: Conditional;
    }
  | {
      name: string;
      type: "select";
      label?: string;
      defaultValue?: string;
      required?: boolean;
      placeholder?: string;
      editor: EditorMeta;
      options: { label: string; value: string }[];
      conditional?: Conditional;
    }
  | {
      name: string;
      type: "color" | "text" | "textarea";
      label?: string;
      defaultValue?: string;
      required?: boolean;
      placeholder?: string;
      editor: EditorMeta;
      conditional?: Conditional;
    }
  | {
      name: string;
      type: "richtext";
      label?: string;
      defaultValue?: any;
      required?: boolean;
      placeholder?: string;
      editor: EditorMeta;
      conditional?: Conditional;
    }
  | {
      name: string;
      type: "link";
      label?: string;
      defaultValue?: LinkValue;
      required?: boolean;
      placeholder?: string;
      editor: EditorMeta;
      conditional?: Conditional;
    }
  | {
      name: string;
      type: "image";
      label?: string;
      defaultValue?: ImageValue;
      required?: boolean;
      editor: EditorMeta;
      conditional?: Conditional;
    }
  | {
      name: string;
      type: "video";
      label?: string;
      defaultValue?: VideoValue;
      required?: boolean;
      editor: EditorMeta;
      conditional?: Conditional;
    };

type NumericField =
  | {
      name: string;
      type: "numeric";
      label?: string;
      defaultValue?: number;
      required?: boolean;
      minValue?: number;
      maxValue?: number;
      step?: number;
      display?: "input";
      admin?: NumericUnit;
      conditional?: Conditional;
    }
  | {
      name: string;
      type: "numeric";
      label?: string;
      defaultValue?: number;
      required?: boolean;
      minValue: number;
      maxValue: number;
      step: number;
      display?: "slider";
      admin?: NumericUnit;
      conditional?: Conditional;
    }
  | {
      name: string;
      type: "numeric";
      label?: string;
      defaultValue?: number;
      required?: boolean;
      options: number[];
      display?: "stepper";
      admin?: NumericUnit;
      conditional?: Conditional;
    };

export type EditorMeta = {
  selector?: string; // CSS selector to bind field to
  preventDefault?: boolean; // default: true (great for links)
  event?: "click" | "dblclick"; // default: "click"
  tooltip?: string | boolean;
  description?: string;
  hideLabel?: boolean;
};

export type NumericEditorMeta = EditorMeta & { unit?: NumericUnit };

export type NumericUnit = {
  label: string; // "$", "%", " ms", " px" (include any desired spacing)
  placement: "prefix" | "suffix";
  ariaLabel?: string;
};

export type Conditional =
  | Condition
  | Condition[]
  | {
      mode?: "all" | "any"; // default "all"
      conditions: Condition[];
    };

export type Condition =
  | { onField: string; isValue: any }
  | { onField: string; isTruthy: true }
  | { onField: string; isFalsy: true };

export type RichtextValue = {
  html: string;
  text?: string;
  meta?: Record<string, any>;
};

export type LinkValue =
  | { kind: "none" }
  | { kind: "url"; url: string; newTab?: boolean; nofollow?: boolean }
  | { kind: "internal"; path: string; hash?: string } // "/about", "/services"
  | { kind: "anchor"; id: string } // "contact" => "#contact"
  | { kind: "tel"; phone: string } // "+14075551234"
  | { kind: "mailto"; email: string; subject?: string; body?: string };

export type ImageValue = {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  meta?: Record<string, any>;
};

export type VideoValue = {
  src: string;
  poster?: ImageValue | string;
  title?: string;
  width?: number;
  height?: number;
  duration?: number;
  meta?: Record<string, any>;
};
