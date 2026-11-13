import type { Modifier, Shortcut } from "../types/shortcut.type";
import { IS_APPLE_PLATFORM, keyLabel, resolveModifiers } from "./key-labels.util";

const ARIA_MODIFIER_NAMES: Record<Modifier, string> = {
  mod: IS_APPLE_PLATFORM ? "Meta" : "Control",
  ctrl: "Control",
  alt: "Alt",
  shift: "Shift",
};

/** The `react-hotkeys-hook` key string for a shortcut, for example `mod+o`. */
export const toHotkeyString = (shortcut: Shortcut) =>
  [...shortcut.modifiers, ...(shortcut.key ? [shortcut.key] : [])].join("+");

/** Display text and `aria-keyshortcuts` for a dropdown item that runs the shortcut. */
export const menuShortcutProps = (shortcut: Shortcut) => {
  const modifiers = resolveModifiers(shortcut.modifiers);
  const key = shortcut.key ? keyLabel(shortcut.key) : null;
  const displayParts = [...modifiers.map((modifier) => keyLabel(modifier)), ...(key ? [key] : [])];
  const ariaParts = [
    ...modifiers.map((modifier) => ARIA_MODIFIER_NAMES[modifier]),
    ...(key ? [key] : []),
  ];

  return {
    shortcut: displayParts.join(IS_APPLE_PLATFORM ? "" : "+"),
    "aria-keyshortcuts": ariaParts.join("+"),
  };
};
