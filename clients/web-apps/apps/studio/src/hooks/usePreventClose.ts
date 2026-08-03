import { IS_TAURI } from "@avplatform/ui/constants";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";

import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";

/**
 * Intercepts OS-level window close requests in the Tauri app to prevent
 * data loss during active executions or when changes are unsaved.
 */
export const usePreventClose = ({ isProcessing }: { isProcessing?: boolean }) => {
  // Get ReactFlowExt store state & actions
  const { isSavePending } = useReactFlowExtStore(
    useShallow((state) => ({ isSavePending: state.isSavePending })),
  );

  // Keeps latest processing state inside the Tauri listener
  const isProcessingRef = useRef(isProcessing);
  const hasUnsavedChangesRef = useRef(isSavePending);

  const isPromptingRef = useRef(false);
  const forceCloseRef = useRef(false);

  useEffect(() => {
    isProcessingRef.current = isProcessing;
    hasUnsavedChangesRef.current = isSavePending;
  }, [isProcessing, isSavePending]);

  useEffect(() => {
    // Only apply logic if running within the Tauri environment
    if (!IS_TAURI) return;

    const appWindow = getCurrentWindow();
    let unlisten: (() => void) | null = null;

    const setup = async () => {
      unlisten = await appWindow.onCloseRequested((event) => {
        // 1. Allow forced programmatic closes to pass immediately
        if (forceCloseRef.current) return;

        // 2. If a dialog is already open, strictly block any new events
        if (isPromptingRef.current) {
          event.preventDefault();
          return;
        }

        // CASE 1: Hard Block - Agent executing
        if (isProcessingRef.current) {
          // Prevent default IMMEDIATELY before doing anything else
          event.preventDefault();

          isPromptingRef.current = true;

          // Defer alert so IPC can inform Rust that the close was prevented
          setTimeout(() => {
            window.alert(
              "Agent execution in progress. Please stop the execution or wait for it to complete before closing the app.",
            );
            isPromptingRef.current = false;
          }, 50);

          return;
        }

        // CASE 2: Soft Block - Unsaved workflow changes
        if (hasUnsavedChangesRef.current) {
          // Prevent default IMMEDIATELY
          event.preventDefault();

          isPromptingRef.current = true;

          // Defer dialog to free up the thread
          setTimeout(async () => {
            // window.confirm acts synchronously here
            const userWantsToExit = window.confirm("Changes you made may not be saved.");

            isPromptingRef.current = false;

            if (userWantsToExit) {
              forceCloseRef.current = true;
              // Bypass the close event loop and force immediate shutdown
              await appWindow.destroy();
            }
          }, 50);

          return;
        }
      });
    };

    setup();

    return () => {
      if (unlisten) unlisten();
    };
  }, []);
};
