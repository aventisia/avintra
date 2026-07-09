/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useRef } from "react";
import { useBlocker } from "react-router-dom";

import { IS_TAURI } from "@/constants";

const EXECUTION_WARNING_MSG =
  "Agent execution is in progress. Please stop the execution or wait for it to complete.";

const UNSAVED_WARNING_MSG =
  "Changes you made may not be saved. Are you sure you want to leave?";

interface UseNavigationGuardProps {
  /** True if the React Flow canvas has unsaved changes */
  isDirty: boolean;
  /** True if an agent is currently executing */
  isExecuting: boolean;
  /** The root path of the current application context */
  basePath: "/studio" | "/workspace";
  /** Callback fired if the user chooses to abort an active execution via navigation */
  onAbortExecution?: () => Promise<void> | void;
  enabled: boolean;
}

/**
 * Prevents accidental navigation, tab closure, reloads, and right-clicks
 * when there are unsaved changes or an active execution (Tauri only).
 */
export const usePreventNavigation = ({
  isDirty,
  isExecuting,
  basePath,
  onAbortExecution,
  enabled,
}: UseNavigationGuardProps): void => {
  if (!enabled) return;
  // 1. State Sync Refs (Prevents stale state in event listeners)
  const isExecutingRef = useRef(isExecuting);
  const isDirtyRef = useRef(isDirty);

  // 2. Callback Ref (Prevents useEffect dependency loops)
  const onAbortRef = useRef(onAbortExecution);

  // 3. Spam-Guard Ref (Prevents infinite alert loops from held keys)
  const isAlertingRef = useRef(false);

  useEffect(() => {
    isExecutingRef.current = isExecuting;
    isDirtyRef.current = isDirty;
    onAbortRef.current = onAbortExecution;
  }, [isExecuting, isDirty, onAbortExecution]);

  // =======================================================================
  // 1. REACT ROUTER NAVIGATION BLOCK (Handles internal <Link> navigation)
  // =======================================================================
  const blocker = useBlocker(({ nextLocation }) => {
    // Block for unsaved changes (Applies universally)
    if (isDirtyRef.current) return true;

    // Block for active execution (Applies ONLY to Tauri desktop app)
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
                // Await the abort process before allowing React Router to unmount
                await onAbortRef.current();
              } catch (error) {
                console.error("Failed to abort execution cleanly:", error);
              }
            }
            blocker.proceed();
          } else {
            blocker.reset();
          }
        } else if (isDirtyRef.current) {
          const confirmLeave = window.confirm(UNSAVED_WARNING_MSG);

          if (confirmLeave) {
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
  // 2. SHORTCUT & CONTEXT MENU BLOCK (Handles F5, Ctrl+R, and Right-Click)
  // =======================================================================
  useEffect(() => {
    const triggerSafeAlert = () => {
      // Prevent overlapping alerts if the user mashes the keyboard or mouse
      if (isAlertingRef.current) return;

      isAlertingRef.current = true;
      window.alert(EXECUTION_WARNING_MSG);
      isAlertingRef.current = false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (IS_TAURI && isExecutingRef.current) {
        if (
          e.key === "F5" ||
          (e.key.toLowerCase() === "r" && (e.ctrlKey || e.metaKey))
        ) {
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
  // 3. BROWSER NAVIGATION BLOCK (Handles native <a> tags, back button, tab close)
  // =======================================================================
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const hasUnsavedChanges = isDirtyRef.current;
      const isTauriExecuting = IS_TAURI && isExecutingRef.current;

      if (hasUnsavedChanges || isTauriExecuting) {
        event.preventDefault();
        // The browser will show its default "Changes you made may not be saved" text here.
        // We cannot run async code if user choose to leave.
        event.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);
};
