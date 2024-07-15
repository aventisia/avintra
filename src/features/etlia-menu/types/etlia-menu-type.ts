/** Union type of Studio Tabs. It can only hold one of the five specified string literals. */
export type StudioTabType =
  | "extract"
  | "transform"
  | "load"
  | "infer"
  | "action";
