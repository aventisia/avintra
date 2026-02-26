import { useEffect, useRef } from "react";
import { useBlocker } from "react-router-dom";
import { usePreventClose } from "@/hooks/usePreventClose";

const useUnsavedChanges = ({ isDirty }: { isDirty: boolean }): void => {
  // 1. Keep the latest dirty state inside the listeners without re-binding
  const isDirtyRef = useRef(isDirty);

  // Tauri window close protection
  usePreventClose({ hasUnsavedChanges: isDirty });

  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);

  //  Browser refresh / tab close / navigation
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirtyRef.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  //  React Router navigation block
  const blocker = useBlocker(isDirty);

  useEffect(() => {
    if (blocker.state === "blocked") {
      const confirmLeave = window.confirm("Changes you made may not be saved.");

      if (confirmLeave) {
        blocker.proceed();
      } else {
        blocker.reset();
      }
    }
  }, [blocker]);
};

export default useUnsavedChanges;
