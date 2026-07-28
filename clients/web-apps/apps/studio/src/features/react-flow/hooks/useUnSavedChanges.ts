/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useRef } from "react";
import { useBlocker } from "react-router-dom";

const useUnsavedChanges = ({
  isDirty,
  enabled,
}: {
  isDirty: boolean;
  enabled: boolean;
}): void => {
  if (!enabled) return;
  // 1. Keep the latest dirty state inside the listeners without re-binding
  const isDirtyRef = useRef(isDirty);

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
