/**
 * Builds the absolute workspace URL that opens the Create Tool dialog
 * (`e`/`ca`/`rid` params are read by the shared CrudDialogProvider).
 */
const buildCreateToolUrl = (): string => {
  const workspacePath = import.meta.env.VITE_WORKSPACE_PATH ?? "/workspace/";
  const createToolPath = `${workspacePath}configure/tools?e=tool&ca=create&rid=${crypto.randomUUID()}`;
  return new URL(createToolPath, window.location.href).toString();
};

/**
 * True when running inside the Tauri desktop shell.
 *
 * Tauri v2 injects `__TAURI_INTERNALS__` into the webview; the legacy
 * `"isTauri" in window` check (`IS_TAURI`) is never set by Tauri v2.
 */
const isTauriRuntime = (): boolean =>
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

/**
 * Hook for the Custom Tools "+" action: opens the workspace Create Tool page.
 *
 * - Web browser: opens the page in a new window so the agent builder is not lost.
 * - Desktop (Tauri): navigates the current window to the page (Tauri opens a
 *   single app window; no external browser window is used).
 * - No confirmation dialog is shown; if the browser blocks the new window, the
 *   current window is redirected instead.
 */
export const useAddCustomTool = () => {
  const addCustomTool = () => {
    const createToolUrl = buildCreateToolUrl();

    if (isTauriRuntime()) {
      window.location.href = createToolUrl;
      return;
    }

    let opened = false;
    try {
      opened = Boolean(window.open(createToolUrl, "_blank"));
    } catch {
      opened = false;
    }

    if (!opened) window.location.href = createToolUrl;
  };

  return { addCustomTool };
};
