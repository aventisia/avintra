import { useAvailableIntegrationsDialogStore } from "@/features/05-tenant-admin/app-integrations/store/available-integrations-dialog";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { geminiIntegrationZodSchema } from "../constants/gemini-zod-schema";

export const useGeminiIntegrationForm = () => {
  const { toggleFormDirty } = useAvailableIntegrationsDialogStore();

  const form = useForm<z.infer<typeof geminiIntegrationZodSchema>>({
    resolver: zodResolver(geminiIntegrationZodSchema),
    defaultValues: {
      id: "",
      apiKey: "",
      host: "",
    },
  });

  const {
    formState: { isSubmitting, isDirty },
    control,
  } = form;

  useEffect(() => {
    toggleFormDirty(isDirty);
  }, [isDirty, toggleFormDirty]);

  return { form, isSubmitting, isDirty, control };
};
