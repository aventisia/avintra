const buildCreateToolUrl = (): string => {
  const workspacePath = import.meta.env.VITE_WORKSPACE_PATH ?? "/workspace/";
  const createToolPath = `${workspacePath}configure/tools?e=tool&ca=create&rid=${crypto.randomUUID()}`;
  return new URL(createToolPath, window.location.href).toString();
};

const isTauriRuntime = (): boolean => {
  // IMPORTANT NOTE: Tauri v2 injects __TAURI_INTERNALS__; the legacy "isTauri" window flag is never set.
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
};

/**
 * Hook for the Custom Tools "+" action: opens the workspace Create Tool page.
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
