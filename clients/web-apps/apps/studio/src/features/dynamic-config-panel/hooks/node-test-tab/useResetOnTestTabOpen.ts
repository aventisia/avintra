import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { useDynamicConfigPanelStore } from "@/features/dynamic-config-panel/stores/dcp-store";

/**
 * Clears a mutation's result whenever the Test tab becomes active, so a
 * previous execution's output doesn't linger when the panel is reopened.
 */
export function useResetOnTestTabOpen(reset: () => void) {
  const { selectedTab } = useDynamicConfigPanelStore(
    useShallow((state) => ({ selectedTab: state.selectedTab })),
  );

  useEffect(() => {
    if (selectedTab === "Test") reset();
  }, [selectedTab]);
}
