import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { settingsZodSchema } from "../constants/settings-zod-schema";
import { useSettingsStore } from "../stores/settings-store";

export const useDefineSettingsForm = () => {
  // Get  store state and actions
  const { settings, setSettings } = useSettingsStore(
    useShallow((state) => ({
      settings: state.settings,
      setSettings: state.setSettings,
    })),
  );

  // Define form with zod schema
  const form = useForm<z.infer<typeof settingsZodSchema>>({
    resolver: zodResolver(settingsZodSchema),
    defaultValues: {
      maxExecutionTimeInMinutes: settings.maxExecutionTimeInMinutes ?? 10,
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
