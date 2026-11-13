import type { KeyboardEvent } from "react";

import type { HeldKeys, Modifier, Shortcut, ShortcutMatch } from "../types/shortcut.type";
import { IS_APPLE_PLATFORM, resolveModifiers } from "./key-labels.util";

export const NO_KEYS_HELD: HeldKeys = { modifiers: [], key: null };

const MODIFIER_KEY_NAMES = new Set(["Meta", "Control", "Alt", "AltGraph", "Shift", "OS", "Fn"]);

export const isModifierKey = (key: string) => MODIFIER_KEY_NAMES.has(key);

const KEY_ALIASES: Record<string, string> = { " ": "space", "/": "slash" };

export const normalizeKey = (key: string) => KEY_ALIASES[key] ?? key.toLowerCase();

export const isArrowKey = (key: string | null) => !!key?.startsWith("arrow");

export const heldModifiers = (event: KeyboardEvent): Modifier[] => {
  const modifiers: Modifier[] = [];
  if (IS_APPLE_PLATFORM ? event.metaKey : event.ctrlKey) modifiers.push("mod");
  if (IS_APPLE_PLATFORM && event.ctrlKey) modifiers.push("ctrl");
  if (event.altKey) modifiers.push("alt");
  if (event.shiftKey) modifiers.push("shift");
  return resolveModifiers(modifiers);
};

const keyMatches = (shortcut: Shortcut, key: string) =>
  shortcut.key === "arrows" ? isArrowKey(key) : shortcut.key === key;

/**
 * How a shortcut relates to the keys held right now: `exact` when they complete it (a gesture
 * shortcut is complete once its keys are held), `partial` when they are a start of it, and
 * `none` when it needs none of them.
 */
export const matchShortcut = (shortcut: Shortcut, held: HeldKeys): ShortcutMatch => {
  if (!held.modifiers.length && !held.key) return "idle";

  const modifiers = resolveModifiers(shortcut.modifiers);
  const coversModifiers = held.modifiers.every((modifier) => modifiers.includes(modifier));
  const coversKey = !held.key || keyMatches(shortcut, held.key);
  if (!coversModifiers || !coversKey) return "none";

  const isComplete = modifiers.length === held.modifiers.length && (!shortcut.key || !!held.key);
  return isComplete ? "exact" : "partial";
};
