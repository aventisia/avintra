import { useUserSessionStore } from "@avplatform/ui/stores";
import { useCallback, useState } from "react";

const getStorageKey = () =>
  `folder-shelf-collapsed:${useUserSessionStore.getState().userSession?.email ?? "anonymous"}`;

/**
 * Whether the user collapsed the folders shelf; remembered per user across visits.
 */
export const useFolderShelfCollapsed = () => {
  const [isCollapsed, setIsCollapsed] = useState(
    () => localStorage.getItem(getStorageKey()) === "true",
  );

  const toggleCollapsed = useCallback(() => {
    const nextIsCollapsed = !isCollapsed;
    setIsCollapsed(nextIsCollapsed);
    localStorage.setItem(getStorageKey(), String(nextIsCollapsed));
  }, [isCollapsed]);

  return { isCollapsed, toggleCollapsed };
};
