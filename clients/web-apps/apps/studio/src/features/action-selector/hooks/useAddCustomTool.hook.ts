import { useShowAlertHandler } from "@avplatform/ui/hooks";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

/** Fallback size of the desktop (Tauri) Create Tool window. */
const CREATE_TOOL_WINDOW_WIDTH = 1200;
const CREATE_TOOL_WINDOW_HEIGHT = 800;

/**
 * True when running inside the Tauri desktop shell.
 *
 * Tauri v2 injects `__TAURI_INTERNALS__` into the webview; the legacy
 * `"isTauri" in window` check (`IS_TAURI`) is never set by Tauri v2.
 */
const isTauriRuntime = (): boolean =>
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

/**
 * Builds the absolute workspace URL that opens the Create Tool dialog
 * (`e`/`ca`/`rid` params are read by the shared CrudDialogProvider). The URL
 * must be absolute for the Tauri WebviewWindow target.
 */
const buildCreateToolUrl = (): string => {
  const workspacePath = import.meta.env.VITE_WORKSPACE_PATH ?? "/workspace/";
  const createToolPath = `${workspacePath}configure/tools?e=tool&ca=create&rid=${crypto.randomUUID()}`;
  return new URL(createToolPath, window.location.href).toString();
};

/** Opens the page in a new browser window; false when the browser blocks it. */
const openBrowserWindow = (createToolUrl: string): boolean => {
  try {
    return Boolean(window.open(createToolUrl, "_blank"));
  } catch {
    return false;
  }
};

/**
 * Opens the page in a new desktop-app window (Tauri). Resolves false when the
 * window cannot be created (e.g. missing capability or runtime failure).
 */
const openDesktopWindow = (createToolUrl: string): Promise<boolean> =>
  new Promise((resolve) => {
    try {
      const createToolWindow = new WebviewWindow(`create-tool-${crypto.randomUUID()}`, {
        url: createToolUrl,
        title: "Create Tool",
        width: CREATE_TOOL_WINDOW_WIDTH,
        height: CREATE_TOOL_WINDOW_HEIGHT,
        center: true,
      });
      createToolWindow.once("tauri://created", () => resolve(true));
      createToolWindow.once("tauri://error", () => resolve(false));
    } catch {
      resolve(false);
    }
  });

/**
 * Hook for the Custom Tools "+" action: opens the workspace Create Tool page
 * without disturbing the agent builder.
 *
 * - Web: opens the page in a new browser window.
 * - Desktop (Tauri): opens the page in a new app window.
 * - When no new window can be opened, shows a confirmation dialog warning
 *   that unsaved changes will be lost; "Continue" redirects this tab to the
 *   Create Tool page instead.
 */
export const useAddCustomTool = () => {
  const { showCustomAlertDialog } = useShowAlertHandler();

  /** Confirmation before leaving the builder when a new window failed. */
  const showOpenFailedDialog = (createToolUrl: string) => {
    showCustomAlertDialog({
      isDestructive: true,
      title: "Leave the agent builder?",
      description:
        "The tool builder could not be opened in a new window. If you continue, you will leave this page and unsaved changes will be lost.",
      cancelBtnText: "Cancel",
      confirmBtnText: "Continue",
      confirmActionFn: () => {
        window.location.href = createToolUrl;
      },
    });
  };

  const addCustomTool = async () => {
    const createToolUrl = buildCreateToolUrl();

    const isOpened = isTauriRuntime()
      ? await openDesktopWindow(createToolUrl)
      : openBrowserWindow(createToolUrl);

    if (!isOpened) showOpenFailedDialog(createToolUrl);
  };

  return { addCustomTool };
};
