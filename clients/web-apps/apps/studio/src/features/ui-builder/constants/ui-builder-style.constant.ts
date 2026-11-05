/** One choice in a style group; a null value removes the group's classes. */
export type UiBuilderStyleOption = { label: string; value: string | null };

/** A family of mutually exclusive utility classes the style panel edits. */
export type UiBuilderStyleGroup = {
  id: string;
  label: string;
  pattern: RegExp;
  options: UiBuilderStyleOption[];
};

/** Style groups offered by the style panel; only unprefixed (non-responsive) classes are touched. */
export const UI_BUILDER_STYLE_GROUPS: UiBuilderStyleGroup[] = [
  {
    id: "padding",
    label: "Padding",
    pattern: /^p[xytrbl]?-[\w.[\]/-]+$/,
    options: [
      { label: "0", value: "p-0" },
      { label: "2", value: "p-2" },
      { label: "3", value: "p-3" },
      { label: "4", value: "p-4" },
      { label: "6", value: "p-6" },
      { label: "8", value: "p-8" },
    ],
  },
  {
    id: "gap",
    label: "Gap",
    pattern: /^gap-[\w.[\]/-]+$/,
    options: [
      { label: "1", value: "gap-1" },
      { label: "2", value: "gap-2" },
      { label: "3", value: "gap-3" },
      { label: "4", value: "gap-4" },
      { label: "6", value: "gap-6" },
      { label: "8", value: "gap-8" },
    ],
  },
  {
    id: "size",
    label: "Text size",
    pattern: /^text-(xs|sm|base|lg|xl|[2-9]xl)$/,
    options: [
      { label: "XS", value: "text-xs" },
      { label: "S", value: "text-sm" },
      { label: "M", value: "text-base" },
      { label: "L", value: "text-lg" },
      { label: "XL", value: "text-xl" },
      { label: "2XL", value: "text-2xl" },
      { label: "3XL", value: "text-3xl" },
    ],
  },
  {
    id: "weight",
    label: "Weight",
    pattern: /^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/,
    options: [
      { label: "Regular", value: "font-normal" },
      { label: "Medium", value: "font-medium" },
      { label: "Semibold", value: "font-semibold" },
      { label: "Bold", value: "font-bold" },
    ],
  },
  {
    id: "align",
    label: "Align",
    pattern: /^text-(left|center|right|justify)$/,
    options: [
      { label: "Left", value: "text-left" },
      { label: "Center", value: "text-center" },
      { label: "Right", value: "text-right" },
    ],
  },
  {
    id: "color",
    label: "Text color",
    pattern:
      /^text-(foreground|muted-foreground|primary|primary-foreground|secondary-foreground|success|warning|destructive|info|white|black|inherit|current|[a-z]+-\d{2,3})(\/\d{1,3})?$/,
    options: [
      { label: "Default", value: null },
      { label: "Strong", value: "text-foreground" },
      { label: "Muted", value: "text-muted-foreground" },
      { label: "Brand", value: "text-primary" },
      { label: "Success", value: "text-success" },
      { label: "Warning", value: "text-warning" },
      { label: "Danger", value: "text-destructive" },
    ],
  },
  {
    id: "background",
    label: "Background",
    pattern:
      /^bg-(?!gradient|linear|radial|conic|clip|fixed|local|scroll|cover|contain|center|no-repeat|repeat)[\w-]+(\/\d{1,3})?$/,
    options: [
      { label: "None", value: null },
      { label: "Card", value: "bg-card" },
      { label: "Muted", value: "bg-muted" },
      { label: "Tint", value: "bg-primary/10" },
      { label: "Brand", value: "bg-primary" },
    ],
  },
  {
    id: "radius",
    label: "Corners",
    pattern: /^rounded(-(none|xs|sm|md|lg|xl|2xl|3xl|4xl|full))?$/,
    options: [
      { label: "None", value: "rounded-none" },
      { label: "S", value: "rounded-md" },
      { label: "M", value: "rounded-lg" },
      { label: "L", value: "rounded-xl" },
      { label: "Full", value: "rounded-full" },
    ],
  },
  {
    id: "shadow",
    label: "Shadow",
    pattern: /^shadow(-(none|2xs|xs|sm|md|lg|xl|2xl))?$/,
    options: [
      { label: "None", value: "shadow-none" },
      { label: "XS", value: "shadow-xs" },
      { label: "S", value: "shadow-sm" },
      { label: "M", value: "shadow-md" },
      { label: "L", value: "shadow-lg" },
    ],
  },
];

/** Replaces the classes of one style group with a choice. */
export const applyUiBuilderStyleOption = (
  classes: string[],
  group: UiBuilderStyleGroup,
  value: string | null,
) => [...classes.filter((className) => !group.pattern.test(className)), ...(value ? [value] : [])];

/** Returns the option of a group currently present in a class list, if any. */
export const readUiBuilderStyleOption = (classes: string[], group: UiBuilderStyleGroup) =>
  classes.find((className) => group.pattern.test(className)) ?? null;
