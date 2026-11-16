import { useUserSessionStore } from "@avplatform/ui/stores";
import { useCallback, useState } from "react";

export type FlowsViewMode = "grid" | "table";

/** First-time users land on the grid view. */
const DEFAULT_VIEW: FlowsViewMode = "grid";

/**
 * The Agents (flows) list view preference is scoped per user so each user's last
 * grid/table choice is remembered independently and survives reloads, route
 * changes, and re-visits to the Build > Agents screen.
 */
const getStorageKey = (list: string) =>
  `${list}-view-preference:${useUserSessionStore.getState().userSession?.email ?? "anonymous"}`;

/** `list` names the stored preference; each agents list keeps its own. */
export const useFlowsView = (list = "flows") => {
  const [view, setViewState] = useState<FlowsViewMode>(() => {
    const stored = localStorage.getItem(getStorageKey(list));
    return stored === "table" || stored === "grid" ? stored : DEFAULT_VIEW;
  });

  const setView = useCallback(
    (nextView: FlowsViewMode) => {
      setViewState(nextView);
      localStorage.setItem(getStorageKey(list), nextView);
    },
    [list],
  );

  return { view, setView };
};
