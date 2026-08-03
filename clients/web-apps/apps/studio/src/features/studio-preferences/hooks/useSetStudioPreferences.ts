import { USER_PREFERENCES_LS_KEY } from "@avplatform/ui/constants";
import { UserPreferencesType } from "@avplatform/ui/types";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { useStudioPreferencesStore } from "@/stores/studio-preferences-store";

export const useSetStudioPreferences = () => {
  // Get user preferences from browser local storage
  const { studio } = JSON.parse(
    localStorage.getItem(USER_PREFERENCES_LS_KEY) || "{}",
  ) as UserPreferencesType;

  // Get studio preferences store state and actions
  const { setStudioPreferences } = useStudioPreferencesStore(
    useShallow((state) => ({
      setStudioPreferences: state.setStudioPreferences,
    })),
  );

  // Set Studio preferences on load only once
  useEffect(() => {
    // If no studio preferences found in local storage, return
    if (!studio) return;

    // Set studio preferences in store
    setStudioPreferences({
      layoutDirection: "LR",
      miniMap: studio.miniMap,
      undoRedo: studio.undoRedo,
      cursorToggle: studio.cursorToggle,
      zoomControls: studio.zoomControls,
      deleteAlert: studio.deleteAlert,
    });
  }, [setStudioPreferences, studio]);
};
