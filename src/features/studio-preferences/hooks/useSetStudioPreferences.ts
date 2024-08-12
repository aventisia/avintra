import { UserPreferencesType } from "@/react-toolkit/types/user-preferences-type";
import { useStudioPreferencesStore } from "@/stores/studio-preferences-store";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

export const useSetStudioPreferences = () => {
  // Get user preferences from browser local storage
  const { studio } = JSON.parse(
    localStorage.getItem("userPreferences") || "null",
  ) as UserPreferencesType;

  // Get studio preferences store state and actions
  const { setStudioPreferences } = useStudioPreferencesStore(
    useShallow((state) => ({
      setStudioPreferences: state.setStudioPreferences,
    })),
  );

  // Set Studio preferences on load only once
  useEffect(() => {
    setStudioPreferences({
      layoutDirection: studio.layoutDirection,
      enableAutoArrange: studio.enableAutoArrange,
      showMiniMap: studio.showMiniMap,
      showUndoRedo: studio.showUndoRedo,
      showIntractivityToggle: studio.showIntractivityToggle,
      showZoomControls: studio.showZoomControls,
      enableDeleteAlert: studio.enableDeleteAlert,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
