// IMPORTANT NOTE: a closing dialog's focus scope returns focus to its opener in a setTimeout(0) on unmount, so this waits a frame and then a timer to run after it.
/** Focuses the chat's message box with the caret at the end, after any closing dialog has restored focus. */
export const focusComposerAtEnd = () =>
  requestAnimationFrame(() =>
    setTimeout(() => {
      const input = document.querySelector<HTMLTextAreaElement>(
        '[data-chat] textarea[aria-label="Message"]',
      );
      if (!input) return;
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }, 0),
  );
