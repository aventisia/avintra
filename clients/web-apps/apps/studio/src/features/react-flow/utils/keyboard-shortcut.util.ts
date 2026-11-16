/** Returns true when focus or a text selection means a canvas shortcut must yield to the browser. */
export const isEditableContextActive = (): boolean => {
  const activeElement = document.activeElement as HTMLElement | null;
  if (activeElement?.closest('[role="dialog"]')) return true;
  if (activeElement && ["INPUT", "TEXTAREA", "SELECT"].includes(activeElement.tagName)) return true;
  if (activeElement?.isContentEditable) return true;

  const textSelection = window.getSelection();
  return Boolean(textSelection && !textSelection.isCollapsed);
};
