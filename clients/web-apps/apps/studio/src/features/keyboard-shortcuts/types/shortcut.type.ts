export type Modifier = "mod" | "ctrl" | "alt" | "shift";

export type ShortcutKey =
  "k" | "s" | "escape" | "c" | "x" | "v" | "d" | "delete" | "space" | "arrows";

export type Gesture = "click" | "drag" | "scroll";

export type Shortcut = {
  label: string;
  /** `mod` is Command on Apple platforms and Ctrl elsewhere; `ctrl` is always the Control key. */
  modifiers: Modifier[];
  key?: ShortcutKey;
  gesture?: Gesture;
};

export type ShortcutGroup = {
  title: string;
  shortcuts: Shortcut[];
};

export type HeldKeys = {
  modifiers: Modifier[];
  key: string | null;
};

export type ShortcutMatch = "idle" | "exact" | "partial" | "none";
