// Minimal DOM shims so component imports can be loaded in vitest's node
// environment. Component modules reference `window` (and DOM APIs) at module
// scope; these stubs let them import without a full DOM.
const win = globalThis as unknown as {
  window?: unknown;
  addEventListener?: () => void;
  removeEventListener?: () => void;
};

win.window = win;
win.addEventListener = () => undefined;
win.removeEventListener = () => undefined;
