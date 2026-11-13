import type { Modifier } from "../types/shortcut.type";

export const IS_APPLE_PLATFORM =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent);

const MODIFIER_ORDER: Modifier[] = IS_APPLE_PLATFORM
  ? ["ctrl", "alt", "shift", "mod"]
  : ["mod", "ctrl", "alt", "shift"];

const ARROW_LABELS: Record<string, string> = {
  arrowup: "↑",
  arrowdown: "↓",
  arrowleft: "←",
  arrowright: "→",
};

const APPLE_LABELS: Record<string, string> = {
  ...ARROW_LABELS,
  mod: "⌘",
  ctrl: "⌃",
  alt: "⌥",
  shift: "⇧",
  escape: "esc",
  backspace: "⌫",
  enter: "↩",
  space: "space",
  slash: "/",
};

const OTHER_LABELS: Record<string, string> = {
  ...ARROW_LABELS,
  mod: "Ctrl",
  ctrl: "Ctrl",
  alt: "Alt",
  shift: "Shift",
  escape: "Esc",
  delete: "Del",
  backspace: "Backspace",
  enter: "Enter",
  space: "Space",
  slash: "/",
};

const KEY_NAMES: Record<string, string> = {
  mod: IS_APPLE_PLATFORM ? "Command" : "Control",
  ctrl: "Control",
  alt: IS_APPLE_PLATFORM ? "Option" : "Alt",
  shift: "Shift",
  escape: "Escape",
  delete: "Delete",
  space: "Space",
  slash: "Slash",
  arrowup: "Up arrow",
  arrowdown: "Down arrow",
  arrowleft: "Left arrow",
  arrowright: "Right arrow",
};

const LABELS = IS_APPLE_PLATFORM ? APPLE_LABELS : OTHER_LABELS;

/** Collapses `ctrl` into `mod` off Apple platforms, where both mean the Control key. */
export const resolveModifiers = (modifiers: Modifier[]): Modifier[] => {
  const resolved = modifiers.map((modifier) =>
    !IS_APPLE_PLATFORM && modifier === "ctrl" ? "mod" : modifier,
  );
  return MODIFIER_ORDER.filter((modifier) => resolved.includes(modifier));
};

export const keyLabel = (key: string) => {
  if (LABELS[key]) return LABELS[key];
  if (key.length === 1) return key.toUpperCase();
  return key.charAt(0).toUpperCase() + key.slice(1);
};

export const keyName = (key: string) => KEY_NAMES[key] ?? keyLabel(key);

/** The caps to press for a key; Apple keyboards reach Delete as fn + ⌫. */
export const keyCaps = (key: string) =>
  IS_APPLE_PLATFORM && key === "delete"
    ? [
        { label: "fn", name: "Function" },
        { label: "⌫", name: "Delete" },
      ]
    : [{ label: keyLabel(key), name: keyName(key) }];
