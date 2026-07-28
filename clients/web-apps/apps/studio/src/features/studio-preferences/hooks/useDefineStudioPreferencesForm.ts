import { USER_PREFERENCES_LS_KEY } from "@avplatform/ui/constants";
import { UserPreferencesType } from "@avplatform/ui/types";
import { useStudioPreferencesStore } from "@/stores/studio-preferences-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";
import { studioPreferencesZodSchema } from "../constants/studio-preferences-zod-schema";
import { INITIAL_PREFERENCES } from "../constants";

export const useDefineStudioPreferencesForm = () => {
  // Get user preferences from browser local storage
  const { studio } = localStorage.getItem(USER_PREFERENCES_LS_KEY)
    ? JSON.parse(localStorage.getItem(USER_PREFERENCES_LS_KEY) || "{}")
    : ({ studio: INITIAL_PREFERENCES } as UserPreferencesType);

  // Get studio preferences store state and actions
  const { setStudioPreferences } = useStudioPreferencesStore(
    useShallow((state) => ({
      setStudioPreferences: state.setStudioPreferences,
    })),
  );

  // Define form with zod schema
  const form = useForm<z.infer<typeof studioPreferencesZodSchema>>({
    resolver: zodResolver(studioPreferencesZodSchema),
    defaultValues: {
      layoutDirection: studio.layoutDirection,
      miniMap: studio.miniMap,
      undoRedo: studio.undoRedo,
      cursorToggle: studio.cursorToggle,
      zoomControls: studio.zoomControls,
      deleteAlert: studio.deleteAlert,
    },
  });

  // Return form and methods
  return {
    form,
    setStudioPreferences,
  };
};
