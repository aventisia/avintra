/**
 * Focuses the visible account menu trigger; dialogs opened from the account menu return focus
 * here on close, since they have no trigger of their own.
 */
export const focusAccountMenuTrigger = (event: Event) => {
  const trigger = Array.from(
    document.querySelectorAll<HTMLElement>("[data-account-menu-trigger]"),
  ).find((element) => element.offsetParent !== null);
  if (!trigger) return;
  event.preventDefault();
  trigger.focus();
};
