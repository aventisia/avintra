import { type KeyboardEvent, useCallback, useEffect, useState } from "react";

import { ALL_SHORTCUTS } from "../constants/shortcut-groups.constant";
import type { HeldKeys } from "../types/shortcut.type";
import {
  NO_KEYS_HELD,
  heldModifiers,
  isModifierKey,
  matchShortcut,
  normalizeKey,
} from "../utils/shortcut-match.util";

const completesStudioShortcut = (held: HeldKeys) =>
  held.modifiers.length > 0 &&
  ALL_SHORTCUTS.some((shortcut) => matchShortcut(shortcut, held) === "exact");

/**
 * Keys held while the shortcuts dialog has focus. Key events stop at the dialog, so pressing a
 * Studio shortcut previews it instead of running it on the canvas behind.
 */
export const useHeldKeys = () => {
  const [held, setHeld] = useState<HeldKeys>(NO_KEYS_HELD);
  const reset = useCallback(() => setHeld(NO_KEYS_HELD), []);

  useEffect(() => {
    window.addEventListener("blur", reset);
    return () => window.removeEventListener("blur", reset);
  }, [reset]);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Tab") return;
    event.stopPropagation();
    if (event.key === "Escape") return;

    const modifiers = heldModifiers(event);
    if (isModifierKey(event.key)) {
      setHeld((current) => ({ ...current, modifiers }));
      return;
    }

    const next: HeldKeys = { modifiers, key: normalizeKey(event.key) };
    if (completesStudioShortcut(next)) event.preventDefault();
    if (!event.repeat) setHeld(next);
  };

  const handleKeyUp = (event: KeyboardEvent<HTMLElement>) => {
    const modifiers = heldModifiers(event);
    const releasedKey = normalizeKey(event.key);
    setHeld((current) => ({
      modifiers,
      // IMPORTANT NOTE: macOS sends no keyup for keys pressed while Command is down, so releasing
      // Command releases them too.
      key: event.key === "Meta" || releasedKey === current.key ? null : current.key,
    }));
  };

  return { held, reset, handleKeyDown, handleKeyUp };
};
