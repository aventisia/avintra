import { USER_PREFERENCES_LS_KEY } from "@/react-toolkit/constants";
import { UserPreferencesType } from "@/react-toolkit/types/user-preferences-type";
import { useStudioPreferencesStore } from "@/stores/studio-preferences-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";
import { studioPreferencesZodSchema } from "../constants/studio-preferences-zod-schema";

export const useDefineStudioPreferencesForm = () => {
  // Get user preferences from browser local storage
  const { studio } = JSON.parse(
    localStorage.getItem(USER_PREFERENCES_LS_KEY) || "null",
  ) as UserPreferencesType;

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
      intractivityToggle: studio.intractivityToggle,
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
