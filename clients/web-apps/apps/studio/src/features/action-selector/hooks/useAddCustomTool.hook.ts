import { useShowAlertHandler } from "@avplatform/ui/hooks";

const buildCreateToolUrl = (): string => {
  const workspacePath = import.meta.env.VITE_WORKSPACE_PATH ?? "/workspace/";
  const createToolPath = `${workspacePath}configure/tools?e=tool&ca=create&rid=${crypto.randomUUID()}`;
  return new URL(createToolPath, window.location.href).toString();
};

const isTauriRuntime = (): boolean => {
  // IMPORTANT NOTE: Tauri v2 injects __TAURI_INTERNALS__; the legacy "isTauri" window flag is never set.
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
};

const tryOpenInNewWindow = (url: string): boolean => {
  try {
    return Boolean(window.open(url, "_blank"));
  } catch {
    return false;
  }
};

/**
 * Hook for the Custom Tools "+" action: opens the workspace Create Tool page,
 * confirming first when it has to replace the current Studio window.
 */
export const useAddCustomTool = () => {
  const { showCustomAlertDialog } = useShowAlertHandler();

  const addCustomTool = () => {
    const createToolUrl = buildCreateToolUrl();

    if (!isTauriRuntime() && tryOpenInNewWindow(createToolUrl)) return;

    showCustomAlertDialog({
      title: "Leave this flow?",
      description:
        "Creating a custom tool opens the Workspace in this window. Any unsaved changes on the canvas will be lost.",
      confirmBtnText: "Leave flow",
      isDestructive: false,
      confirmActionFn: () => {
        window.location.href = createToolUrl;
      },
    });
  };

  return { addCustomTool };
};
