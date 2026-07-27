import { IS_TAURI } from "@avplatform/ui/constants";
import { useEffect, useRef } from "react";
import { useBlocker } from "react-router-dom";

const EXECUTION_WARNING_MSG =
  "Agent execution is in progress. Please stop the execution or wait for it to complete.";

interface PreventNavigationBlockerProps {
  /** True if an agent is currently executing */
  isExecuting: boolean;
  /** The root path of the current application context */
  basePath: "/studio" | "/workspace";
  /** Callback fired if the user chooses to abort an active execution via navigation */
  onAbortExecution?: () => Promise<void> | void;
}

/**
 * Prevents accidental navigation when an agent is executing (Tauri only).
 *
 * This component is rendered conditionally by AppLayout so the useBlocker hook
 * is only mounted when it actually needs to block. React Router only supports
 * one active blocker at a time, so we avoid registering this blocker while a
 * CRUD dialog's blocker is active.
 */
export const PreventNavigationBlocker = ({
  isExecuting,
  basePath,
  onAbortExecution,
}: PreventNavigationBlockerProps) => {
  const isExecutingRef = useRef(isExecuting);
  const onAbortRef = useRef(onAbortExecution);
  const isAlertingRef = useRef(false);

  useEffect(() => {
    isExecutingRef.current = isExecuting;
    onAbortRef.current = onAbortExecution;
  }, [isExecuting, onAbortExecution]);

  // =======================================================================
  // 1. REACT ROUTER NAVIGATION BLOCK (Tauri execution only)
  // =======================================================================
  const blocker = useBlocker(({ nextLocation }) => {
    if (IS_TAURI && isExecutingRef.current) {
      if (
        basePath === import.meta.env.VITE_WORKSPACE_PATH &&
        !nextLocation.pathname.includes("/studio")
      ) {
        return false;
      }
      return true;
    }
    return false;
  });

  useEffect(() => {
    if (blocker.state === "blocked") {
      const handleBlockedNavigation = async () => {
        if (IS_TAURI && isExecutingRef.current) {
          const confirmExit = window.confirm(EXECUTION_WARNING_MSG);

          if (confirmExit) {
            if (onAbortRef.current) {
              try {
                await onAbortRef.current();
              } catch (error) {
                console.error("Failed to abort execution cleanly:", error);
              }
            }
            blocker.proceed();
          } else {
            blocker.reset();
          }
        }
      };

      handleBlockedNavigation();
    }
  }, [blocker]);

  // =======================================================================
  // 2. SHORTCUT & CONTEXT MENU BLOCK (Tauri execution only)
  // =======================================================================
  useEffect(() => {
    const triggerSafeAlert = () => {
      if (isAlertingRef.current) return;

      isAlertingRef.current = true;
      window.alert(EXECUTION_WARNING_MSG);
      isAlertingRef.current = false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (IS_TAURI && isExecutingRef.current) {
        if (e.key === "F5" || (e.key.toLowerCase() === "r" && (e.ctrlKey || e.metaKey))) {
          e.preventDefault();
          triggerSafeAlert();
        }
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (IS_TAURI && isExecutingRef.current) {
        e.preventDefault();
        triggerSafeAlert();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("contextmenu", handleContextMenu);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  // =======================================================================
  // 3. BROWSER NAVIGATION BLOCK (Tauri execution only in this component)
  // =======================================================================
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const isTauriExecuting = IS_TAURI && isExecutingRef.current;

      if (isTauriExecuting) {
        event.preventDefault();
        event.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  return null;
};
