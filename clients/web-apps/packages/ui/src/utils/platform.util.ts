/** Whether the app runs on an Apple platform, where shortcuts use ⌘ and ⇧ rather than Ctrl and Shift. */
export const IS_APPLE_PLATFORM =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent);

/** The label of the platform's shortcut modifier key: ⌘ or Ctrl. */
export const MOD_KEY_LABEL = IS_APPLE_PLATFORM ? "⌘" : "Ctrl";

/** The label of the Shift key on this platform: ⇧ or Shift. */
export const SHIFT_KEY_LABEL = IS_APPLE_PLATFORM ? "⇧" : "Shift";
