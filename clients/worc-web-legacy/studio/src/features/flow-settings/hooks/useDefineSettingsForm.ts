import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";
import { SETTINGS_LS_KEY } from "../constants";
import { SettingType } from "../types/setting-types";
import { useSettingsStore } from "../stores/settings-store";
import { settingsZodSchema } from "../constants/settings-zod-schema";

export const useDefineSettingsForm = () => {
  // Get settings from browser local storage
  const { runDelay } = JSON.parse(
    localStorage.getItem(SETTINGS_LS_KEY) || "{}",
  ) as SettingType;

  // Get  store state and actions
  const { setSettings } = useSettingsStore(
    useShallow((state) => ({
      settings: state.settings,
      setSettings: state.setSettings,
    })),
  );

  // Define form with zod schema
  const form = useForm<z.infer<typeof settingsZodSchema>>({
    resolver: zodResolver(settingsZodSchema),
    defaultValues: {
      runDelay: runDelay ?? 0,
    },
  });

  const {
    formState: { isSubmitting, isDirty },
  } = form;

  // Return form and methods
  return {
    form,
    setSettings,
    isSubmitting,
    isDirty,
  };
};
